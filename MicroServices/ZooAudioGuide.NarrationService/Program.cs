using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<ITranslator, GeminiTranslator>();
builder.Services.AddSingleton<ITtsService, EdgeTtsService>();
var app = builder.Build();

app.MapGet("/health", () => "OK");

app.MapPost("/api/narration", async (NarrationRequest req, ITranslator translator, ITtsService tts) =>
{
    if (string.IsNullOrWhiteSpace(req.Text))
        return Results.BadRequest("Text không được để trống");
    if (!EdgeTtsService.IsSupported(req.TargetLang))
        return Results.BadRequest($"Ngôn ngữ '{req.TargetLang}' chưa hỗ trợ");

    // Cache theo nội dung + ngôn ngữ
    var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(req.Text + "|" + req.TargetLang)));
    Directory.CreateDirectory("cache");
    var cachePath = Path.Combine("cache", hash + ".mp3");

    if (File.Exists(cachePath))
        return Results.File(await File.ReadAllBytesAsync(cachePath), "audio/mpeg");

    try
    {
        var text = req.TargetLang == "vi"
            ? req.Text
            : await translator.TranslateAsync(req.Text, req.TargetLang);

        var mp3 = await tts.SynthesizeAsync(text, req.TargetLang);
        await File.WriteAllBytesAsync(cachePath, mp3);
        return Results.File(mp3, "audio/mpeg");
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 502);
    }
});

app.Run();

record NarrationRequest(string Text, string TargetLang);

public partial class Program { }