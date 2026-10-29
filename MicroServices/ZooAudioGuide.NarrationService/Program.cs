var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<ITranslator, GeminiTranslator>();
builder.Services.AddSingleton<ITtsService, EdgeTtsService>();
builder.Services.AddHttpClient<IAudioStore, SupabaseAudioStore>();
builder.Services.AddScoped<NarrationGenerator>();
var app = builder.Build();

app.MapGet("/health", () => "OK");

// ===== Core gọi endpoint này: tạo mp3, đẩy lên đám mây, trả về link =====
app.MapPost("/api/narration/generate", async (GenerateRequest req, NarrationGenerator gen) =>
{
    if (req.AnimalId <= 0) return Results.BadRequest("AnimalId không hợp lệ");
    if (string.IsNullOrWhiteSpace(req.Text)) return Results.BadRequest("Text không được để trống");

    var langs = (req.TargetLangs ?? []).Distinct().ToArray();
    if (langs.Length == 0) return Results.BadRequest("Thiếu TargetLangs");

    var bad = langs.Where(l => !EdgeTtsService.IsSupported(l)).ToArray();
    if (bad.Length > 0) return Results.BadRequest($"Chưa hỗ trợ: {string.Join(", ", bad)}");

    var results = await Task.WhenAll(langs.Select(l => gen.GenerateAsync(req.AnimalId, req.Text, l)));
    return Results.Ok(new { req.AnimalId, results });
});

// ===== Endpoint cũ: trả thẳng mp3, không lưu đâu cả (dùng để test nhanh) =====
app.MapPost("/api/narration", async (NarrationRequest req, ITranslator translator, ITtsService tts) =>
{
    if (string.IsNullOrWhiteSpace(req.Text))
        return Results.BadRequest("Text không được để trống");
    if (!EdgeTtsService.IsSupported(req.TargetLang))
        return Results.BadRequest($"Ngôn ngữ '{req.TargetLang}' chưa hỗ trợ");

    try
    {
        var text = req.TargetLang == "vi" ? req.Text : await translator.TranslateAsync(req.Text, req.TargetLang);
        var mp3 = await tts.SynthesizeAsync(text, req.TargetLang);
        return Results.File(mp3, "audio/mpeg");
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 502);
    }
});

app.Run();

record NarrationRequest(string Text, string TargetLang);
record GenerateRequest(int AnimalId, string Text, string[] TargetLangs);

public partial class Program { }