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
        var key = cfg["Gemini:ApiKey"] ?? throw new Exception("Thiếu Gemini:ApiKey");
        var model = cfg["Gemini:Model"] ?? "gemini-3.6-flash";
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}";

        var prompt = $"Dịch đoạn thuyết minh sau sang ngôn ngữ có mã '{targetLang}'. " +
                     $"Chỉ trả về bản dịch, không giải thích:\n{text}";

        var res = await http.PostAsJsonAsync(url, new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } }
        });
        res.EnsureSuccessStatusCode();

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
        ["zh"] = "zh-CN-XiaoxiaoNeural",
        ["fr"] = "fr-FR-DeniseNeural",
        ["de"] = "de-DE-KatjaNeural", //đức
        ["es"] = "es-ES-ElviraNeural", // tây ban nha
        ["it"] = "it-IT-ElsaNeural", // ý
        ["ru"] = "ru-RU-DariyaNeural", // nga
        ["pt"] = "pt-PT-FernandaNeural", // bồ đào nha
        ["hi"] = "hi-IN-SwaraNeural", // ấn độ
        ["th"] = "th-TH-PremwadeeNeural", // thái lan
        ["tr"] = "tr-TR-AhmetNeural", // thổ nhĩ kỳ
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