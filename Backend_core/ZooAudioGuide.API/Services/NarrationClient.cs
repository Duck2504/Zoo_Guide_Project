public record LangResult(string Lang, string Status, string? TranslatedText, string? AudioUrl, string? Error);

// Dịch + đọc + lưu mp3 do microservice MicroServices/ZooAudioGuide.NarrationService làm (chạy local, mở qua ngrok).
// Backend chỉ gọi sang rồi ghi kết quả vào DB.
public interface INarrationClient
{
    Task<LangResult[]> GenerateAsync(int animalId, string text, string[] langs);
}

public class NarrationClient(HttpClient http, IConfiguration cfg, ILogger<NarrationClient> log) : INarrationClient
{
    private record Response(LangResult[] Results);

    public async Task<LangResult[]> GenerateAsync(int animalId, string text, string[] langs)
    {
        // Mọi lỗi (chưa cấu hình, ngrok tắt, hết giờ, 4xx/5xx) đổi thành FAILED cho từng ngôn ngữ để admin thấy lý do
        LangResult[] Fail(string error) => langs.Select(l => new LangResult(l, "FAILED", null, null, error)).ToArray();
        try
        {
            var baseUrl = cfg["NarrationService:BaseUrl"]?.Trim().TrimEnd('/');
            if (string.IsNullOrEmpty(baseUrl)) return Fail("Chưa cấu hình NarrationService:BaseUrl");

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/narration/generate")
            {
                Content = JsonContent.Create(new { animalId, text, targetLangs = langs })
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
