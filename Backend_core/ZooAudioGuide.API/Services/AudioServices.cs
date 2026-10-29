using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;

public interface ITranslator
{
    Task<string> TranslateAsync(string text, string targetLang);
}

public interface ITtsService
{
    Task<byte[]> SynthesizeAsync(string text, string lang);
}

// Dịch bằng Gemini
public class GeminiTranslator(HttpClient http, IConfiguration cfg) : ITranslator
{
    public async Task<string> TranslateAsync(string text, string targetLang)
    {
        // 1. Chỉ đọc ApiKey từ Render và cắt sạch khoảng trắng thừa bằng Trim()
        var key = (cfg["Gemini:ApiKey"] ?? throw new Exception("Thiếu Gemini:ApiKey")).Trim();

        // 2. ÉP CỨNG tên model vào code, không đọc qua biến môi trường (cfg) nữa
        var model = "gemini-1.0-pro";

        // 3. Nối URL
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}";

        var prompt = $"Dịch đoạn thuyết minh sau sang ngôn ngữ có mã '{targetLang}'. " +
                     $"Chỉ trả về bản dịch, không giải thích:\n{text}";

        var res = await http.PostAsJsonAsync(url, new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } }
        });
        if (!res.IsSuccessStatusCode)
        {
            var errorContent = await res.Content.ReadAsStringAsync();
            throw new Exception($"Lỗi thực sự từ Google {res.StatusCode}: {errorContent}");
        }

        var json = await res.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("candidates")[0].GetProperty("content")
                   .GetProperty("parts")[0].GetProperty("text").GetString()!.Trim();
    }
}

// Tạo mp3 bằng edge-tts
public class EdgeTtsService : ITtsService
{
    private static readonly Dictionary<string, string> Voices = new()
    {
        ["vi"] = "vi-VN-HoaiMyNeural",
        ["en"] = "en-US-AriaNeural",
        ["ja"] = "ja-JP-NanamiNeural",
        ["ko"] = "ko-KR-SunHiNeural",
    };

    public static bool IsSupported(string lang) => Voices.ContainsKey(lang);

    public async Task<byte[]> SynthesizeAsync(string text, string lang)
    {
        if (!Voices.TryGetValue(lang, out var voice))
            throw new ArgumentException($"Ngôn ngữ '{lang}' chưa được hỗ trợ");

        var tmp = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.mp3");
        var psi = new ProcessStartInfo("edge-tts")
        {
            RedirectStandardError = true,
            UseShellExecute = false
        };
        psi.ArgumentList.Add("--voice"); psi.ArgumentList.Add(voice);
        psi.ArgumentList.Add("--text"); psi.ArgumentList.Add(text);
        psi.ArgumentList.Add("--write-media"); psi.ArgumentList.Add(tmp);

        using var p = Process.Start(psi)!;
        var err = p.StandardError.ReadToEndAsync();
        await p.WaitForExitAsync();
        if (p.ExitCode != 0) throw new Exception("edge-tts lỗi: " + await err);

        var bytes = await File.ReadAllBytesAsync(tmp);
        File.Delete(tmp);
        return bytes;
    }
}