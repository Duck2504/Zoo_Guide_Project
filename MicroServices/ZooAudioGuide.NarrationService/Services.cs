using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;

public interface ITranslator
{
    Task<string> TranslateAsync(string text, string targetLang);
    // Tên thường gọi của loài trong ngôn ngữ đích (tên khoa học giúp dịch đúng loài)
    Task<string> TranslateNameAsync(string name, string? scientificName, string targetLang);
}

public interface ITtsService
{
    Task<byte[]> SynthesizeAsync(string text, string lang);
}

// Dịch bằng Gemini
public class GeminiTranslator(HttpClient http, IConfiguration cfg) : ITranslator
{
    public Task<string> TranslateAsync(string text, string targetLang) =>
        AskAsync($"Dịch đoạn thuyết minh sau sang ngôn ngữ có mã '{targetLang}'. " +
                 $"Chỉ trả về bản dịch, không giải thích:\n{text}");

    public Task<string> TranslateNameAsync(string name, string? scientificName, string targetLang) =>
        AskAsync($"Tên tiếng Việt của một loài động vật là \"{name}\"" +
                 (string.IsNullOrWhiteSpace(scientificName) ? "" : $" (tên khoa học: {scientificName})") +
                 $". Cho biết tên thường gọi của loài này trong ngôn ngữ có mã '{targetLang}'. " +
                 "Chỉ trả về đúng tên, một dòng, không giải thích, không dấu ngoặc.");

    private async Task<string> AskAsync(string prompt)
    {
        var key = cfg["Gemini:ApiKey"] ?? throw new Exception("Thiếu Gemini:ApiKey");
        var model = cfg["Gemini:Model"] ?? "gemini-3.6-flash";
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}";

        var res = await http.PostAsJsonAsync(url, new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } }
        });

        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode)
            throw new Exception($"Gemini lỗi {(int)res.StatusCode}: {body}");

        using var doc = JsonDocument.Parse(body);
        if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            throw new Exception("Gemini không trả về bản dịch: " + body);

        return candidates[0].GetProperty("content").GetProperty("parts")[0]
                            .GetProperty("text").GetString()!.Trim();
    }
}

// Tạo mp3 bằng edge-tts (tự thử lại 3 lần nếu bị lỗi chập chờn)
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

        Exception? last = null;
        for (var attempt = 1; attempt <= 3; attempt++)
        {
            try { return await RunEdgeTtsAsync(text, voice); }
            catch (Exception ex)
            {
                last = ex;
                await Task.Delay(1000 * attempt);   // chờ 1s, 2s rồi thử lại
            }
        }
        throw last!;
    }

    private static async Task<byte[]> RunEdgeTtsAsync(string text, string voice)
    {
        var tmp = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.mp3");
        try
        {
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
            if (p.ExitCode != 0)
            {
                // Chỉ lấy dòng cuối của traceback cho dễ đọc
                var lastLine = (await err).Trim().Split('\n').Last().Trim();
                throw new Exception("edge-tts lỗi: " + lastLine);
            }

            return await File.ReadAllBytesAsync(tmp);
        }
        finally
        {
            if (File.Exists(tmp)) File.Delete(tmp);
        }
    }
}