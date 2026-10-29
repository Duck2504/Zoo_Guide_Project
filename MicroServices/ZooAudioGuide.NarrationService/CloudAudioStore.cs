using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

// Kho lưu trữ đám mây. Sau này muốn đổi sang Cloudflare R2 / S3 / Azure Blob
// thì viết thêm một class implement IAudioStore, phần còn lại không phải sửa.
public interface IAudioStore
{
    string GetPublicUrl(string path);
    Task<string?> TryReadTextAsync(string path);                  // null nếu chưa có
    Task UploadAsync(string path, byte[] data, string contentType);
    Task DeleteAsync(IEnumerable<string> paths);
    Task<IReadOnlyList<string>> ListAsync(string folder);         // tên file trong thư mục
}

public class SupabaseAudioStore : IAudioStore
{
    private readonly HttpClient _http;
    private readonly string _baseUrl, _bucket, _key;

    public SupabaseAudioStore(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _baseUrl = (cfg["Supabase:Url"] ?? throw new Exception("Thiếu Supabase:Url")).TrimEnd('/');
        _bucket = cfg["Supabase:Bucket"] ?? "zoo-audio";
        _key = cfg["Supabase:ServiceKey"] ?? throw new Exception("Thiếu Supabase:ServiceKey");
    }

    private HttpRequestMessage NewRequest(HttpMethod method, string url)
    {
        var req = new HttpRequestMessage(method, url);
        req.Headers.TryAddWithoutValidation("apikey", _key);
        // Key kiểu cũ là JWT (bắt đầu bằng eyJ) cần thêm Authorization,
        // key mới (sb_secret_...) chỉ cần header apikey.
        if (_key.StartsWith("eyJ"))
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _key);
        return req;
    }

    public string GetPublicUrl(string path) =>
        $"{_baseUrl}/storage/v1/object/public/{_bucket}/{path}";

    public async Task<string?> TryReadTextAsync(string path)
    {
        using var res = await _http.GetAsync(GetPublicUrl(path));
        if (res.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest) return null;
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadAsStringAsync();
    }

    public async Task UploadAsync(string path, byte[] data, string contentType)
    {
        using var req = NewRequest(HttpMethod.Post, $"{_baseUrl}/storage/v1/object/{_bucket}/{path}");
        req.Headers.TryAddWithoutValidation("x-upsert", "true");   // ghi đè nếu đã tồn tại
        req.Content = new ByteArrayContent(data);
        req.Content.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);

        using var res = await _http.SendAsync(req);
        if (!res.IsSuccessStatusCode)
            throw new Exception($"Upload lỗi {(int)res.StatusCode}: {await res.Content.ReadAsStringAsync()}");
    }

    public async Task DeleteAsync(IEnumerable<string> paths)
    {
        using var req = NewRequest(HttpMethod.Delete, $"{_baseUrl}/storage/v1/object/{_bucket}");
        req.Content = JsonContent.Create(new { prefixes = paths.ToArray() });
        using var res = await _http.SendAsync(req);
        res.EnsureSuccessStatusCode();
    }

    public async Task<IReadOnlyList<string>> ListAsync(string folder)
    {
        using var req = NewRequest(HttpMethod.Post, $"{_baseUrl}/storage/v1/object/list/{_bucket}");
        req.Content = JsonContent.Create(new { prefix = folder, limit = 200 });
        using var res = await _http.SendAsync(req);
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadFromJsonAsync<JsonElement>();
        return json.EnumerateArray().Select(e => e.GetProperty("name").GetString()!).ToList();
    }
}