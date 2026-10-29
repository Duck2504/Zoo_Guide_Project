using System.Security.Cryptography;
using System.Text;

public record LangResult(string Lang, string Status, string? TranslatedText, string? AudioUrl, string? Error);

public class NarrationGenerator(ITranslator translator, ITtsService tts,
                                IAudioStore store, ILogger<NarrationGenerator> log)
{
    private static readonly SemaphoreSlim Gate = new(3);   // tối đa 3 ngôn ngữ chạy cùng lúc

    public async Task<LangResult> GenerateAsync(int animalId, string text, string lang)
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
                translated = lang == "vi" ? text : await translator.TranslateAsync(text, lang);
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