using System.Security.Cryptography;
using System.Text;

// TranslatedName để cuối, có mặc định: Backend bản cũ/mới đọc được của nhau
public record LangResult(string Lang, string Status, string? TranslatedText, string? AudioUrl, string? Error, string? TranslatedName = null);

public class NarrationGenerator(ITranslator translator, ITtsService tts,
                                IAudioStore store, ILogger<NarrationGenerator> log)
{
    private static readonly SemaphoreSlim Gate = new(3);   // tối đa 3 ngôn ngữ chạy cùng lúc

    // textIsFinal: chữ đã là ngôn ngữ đích (admin sửa bản dịch) nên chỉ đọc, không dịch lại
    public async Task<LangResult> GenerateAsync(int animalId, string text, string lang, bool textIsFinal = false)
    {
        try
        {
            var hash = Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(text + "|" + lang)))[..16];

            var folder = $"animals/{animalId}";
            var mp3Path = $"{folder}/{lang}-{hash}.mp3";
            var txtPath = $"{folder}/{lang}-{hash}.txt";     // lưu bản dịch cạnh file mp3
            var url = store.GetPublicUrl(mp3Path);

            // File .txt được upload SAU file mp3, nên thấy .txt tức là mp3 đã có đủ
            var cached = await store.TryReadTextAsync(txtPath);
            if (cached is not null)
                return new(lang, "DONE", cached, url, null);

            string translated;
            await Gate.WaitAsync();
            try
            {
                translated = lang == "vi" || textIsFinal ? text : await translator.TranslateAsync(text, lang);
                var mp3 = await tts.SynthesizeAsync(translated, lang);

                await store.UploadAsync(mp3Path, mp3, "audio/mpeg");
                await store.UploadAsync(txtPath, Encoding.UTF8.GetBytes(translated), "text/plain; charset=utf-8");
            }
            finally { Gate.Release(); }

            await CleanupOldAsync(folder, lang, hash);
            return new(lang, "DONE", translated, url, null);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Lỗi tạo thuyết minh animal {Id} lang {Lang}", animalId, lang);
            return new(lang, "FAILED", null, null, ex.Message);
        }
    }

    // Dịch tên loài, lưu ở name-{lang}-{hash}.txt (không bắt đầu bằng "{lang}-" nên CleanupOldAsync không xoá).
    // Lỗi trả null: audio vẫn dùng được, Backend giữ tên tiếng Việt.
    // shortcut: file tên cũ không bị dọn khi đổi tên (vài byte mỗi lần), dọn nếu kho bắt đầu đầy
    public async Task<string?> TranslateNameAsync(int animalId, string name, string? scientificName, string lang)
    {
        if (lang == "vi") return null;
        try
        {
            var hash = Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(name + "|" + scientificName + "|" + lang)))[..16];
            var path = $"animals/{animalId}/name-{lang}-{hash}.txt";
            var cached = await store.TryReadTextAsync(path);
            if (cached is not null) return cached;

            string raw;
            await Gate.WaitAsync();
            try { raw = await translator.TranslateNameAsync(name, scientificName, lang); }
            finally { Gate.Release(); }

            var clean = CleanName(raw);
            if (clean is null) return null;
            await store.UploadAsync(path, Encoding.UTF8.GetBytes(clean), "text/plain; charset=utf-8");
            return clean;
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Không dịch được tên animal {Id} lang {Lang}", animalId, lang);
            return null;
        }
    }

    // Gemini đôi khi thêm ngoặc, in đậm, dấu chấm hoặc giải thích ở dòng sau: chỉ giữ dòng đầu, tối đa 200 ký tự
    public static string? CleanName(string? raw)
    {
        var line = (raw ?? "").Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).FirstOrDefault() ?? "";
        line = line.Trim('*', '_', '`', '"', '\'', '“', '”', '「', '」', '.', '。', ' ');
        if (line.Length == 0) return null;
        return line.Length > 200 ? line[..200] : line;
    }

    // Xóa bản cũ của cùng động vật + ngôn ngữ cho khỏi đầy kho. Lỗi ở bước này không làm hỏng kết quả.
    private async Task CleanupOldAsync(string folder, string lang, string hash)
    {
        try
        {
            var old = (await store.ListAsync(folder))
                .Where(n => n.StartsWith(lang + "-") && !n.StartsWith($"{lang}-{hash}"))
                .Select(n => $"{folder}/{n}")
                .ToList();
            if (old.Count > 0) await store.DeleteAsync(old);
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Không dọn được file cũ của {Folder}", folder);
        }
    }
}