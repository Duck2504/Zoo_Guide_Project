// TranslatedName: tên loài đã dịch; null khi microservice bản cũ hoặc dịch tên lỗi
public record LangResult(string Lang, string Status, string? TranslatedText, string? AudioUrl, string? Error, string? TranslatedName = null);

// Dịch + đọc + lưu mp3 do microservice MicroServices/ZooAudioGuide.NarrationService làm (chạy local, mở qua ngrok).
// Backend chỉ gọi sang rồi ghi kết quả vào DB.
public interface INarrationClient
{
    // textIsFinal: chữ đã đúng ngôn ngữ đích (bản dịch admin đã sửa), microservice chỉ đọc, không dịch lại
    // name/scientificName: có thì microservice dịch luôn tên loài sang từng ngôn ngữ
    Task<LangResult[]> GenerateAsync(int animalId, string text, string[] langs, bool textIsFinal = false, string? name = null, string? scientificName = null);
    // Đưa ảnh con vật lên kho đám mây qua microservice; trả (link, null) hoặc (null, lý do lỗi)
    Task<(string? Url, string? Error)> UploadImageAsync(byte[] data, string contentType);
}

public class NarrationClient(HttpClient http, IConfiguration cfg, ILogger<NarrationClient> log) : INarrationClient
{
    private record Response(LangResult[] Results);
    private record ImageResponse(string Url);

    public async Task<(string? Url, string? Error)> UploadImageAsync(byte[] data, string contentType)
    {
        try
        {
            var baseUrl = cfg["NarrationService:BaseUrl"]?.Trim().TrimEnd('/');
            if (string.IsNullOrEmpty(baseUrl)) return (null, "Chưa cấu hình NarrationService:BaseUrl");

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/narration/image") { Content = new ByteArrayContent(data) };
            req.Content.Headers.ContentType = new(contentType);
            req.Headers.Add("X-Admin-Key", cfg["NarrationService:ApiKey"]?.Trim() ?? "");
            req.Headers.Add("ngrok-skip-browser-warning", "1");

            using var res = await http.SendAsync(req);
            if (!res.IsSuccessStatusCode)
            {
                var err = await res.Content.ReadAsStringAsync();
                return (null, $"Dịch vụ lưu ảnh lỗi {(int)res.StatusCode}: {(err.Length > 300 ? err[..300] + "…" : err)}");
            }
            var body = await res.Content.ReadFromJsonAsync<ImageResponse>();
            return string.IsNullOrEmpty(body?.Url) ? (null, "Dịch vụ lưu ảnh trả về rỗng") : (body.Url, null);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Không gửi được ảnh sang microservice");
            return (null, "Không kết nối được dịch vụ lưu ảnh (máy chạy microservice/ngrok đang tắt?): " + ex.Message);
        }
    }

    public async Task<LangResult[]> GenerateAsync(int animalId, string text, string[] langs, bool textIsFinal = false, string? name = null, string? scientificName = null)
    {
        // Mọi lỗi (chưa cấu hình, ngrok tắt, hết giờ, 4xx/5xx) đổi thành FAILED cho từng ngôn ngữ để admin thấy lý do
        LangResult[] Fail(string error) => langs.Select(l => new LangResult(l, "FAILED", null, null, error)).ToArray();
        try
        {
            var baseUrl = cfg["NarrationService:BaseUrl"]?.Trim().TrimEnd('/');
            if (string.IsNullOrEmpty(baseUrl)) return Fail("Chưa cấu hình NarrationService:BaseUrl");

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/narration/generate")
            {
                Content = JsonContent.Create(new { animalId, text, targetLangs = langs, textIsFinal, name, scientificName })
            };
            req.Headers.Add("X-Admin-Key", cfg["NarrationService:ApiKey"]?.Trim() ?? "");
            req.Headers.Add("ngrok-skip-browser-warning", "1");

            using var res = await http.SendAsync(req);
            if (!res.IsSuccessStatusCode)
            {
                var err = await res.Content.ReadAsStringAsync();
                if (err.Length > 300) err = err[..300] + "…"; // ngrok tắt thì trả cả trang HTML
                log.LogWarning("Dịch vụ thuyết minh trả {Status} cho animal {Id}: {Body}", (int)res.StatusCode, animalId, err);
                return Fail($"Dịch vụ thuyết minh lỗi {(int)res.StatusCode}: {err}");
            }

            var body = await res.Content.ReadFromJsonAsync<Response>();
            return body?.Results ?? Fail("Dịch vụ thuyết minh trả về dữ liệu rỗng");
        }
        catch (Exception ex) // cả URL sai (thiếu https://) cũng phải thành FAILED, không thành lỗi 500
        {
            log.LogError(ex, "Không gọi được dịch vụ thuyết minh cho animal {Id}", animalId);
            return Fail("Không kết nối được dịch vụ thuyết minh (máy chạy microservice/ngrok đang tắt?): " + ex.Message);
        }
    }
}
