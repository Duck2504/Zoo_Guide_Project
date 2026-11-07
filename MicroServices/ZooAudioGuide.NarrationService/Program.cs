using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<ITranslator, GeminiTranslator>();
builder.Services.AddSingleton<ITtsService, EdgeTtsService>();
builder.Services.AddHttpClient<IAudioStore, SupabaseAudioStore>();
builder.Services.AddScoped<NarrationGenerator>();
var app = builder.Build();

app.MapGet("/health", () => "OK"); // để công khai cho health check

const int MaxTextLength = 5000;
const int MaxImageBytes = 5 * 1024 * 1024;

// Gọi Gemini/edge-tts tốn tiền: yêu cầu header X-Admin-Key khớp cấu hình Admin:ApiKey (giống Backend_core).
// Đọc cấu hình mỗi request; chưa cấu hình key thì từ chối hết.
var narration = app.MapGroup("/api/narration").AddEndpointFilter(async (ctx, next) =>
{
    var expected = ctx.HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Admin:ApiKey"]?.Trim();
    var given = ctx.HttpContext.Request.Headers["X-Admin-Key"].ToString();
    var ok = !string.IsNullOrEmpty(expected) && !string.IsNullOrEmpty(given) &&
             CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(given), Encoding.UTF8.GetBytes(expected));
    return ok ? await next(ctx)
              : Results.Json(new { message = "Sai hoặc thiếu mã quản trị (X-Admin-Key)." }, statusCode: StatusCodes.Status401Unauthorized);
});

// ===== Core gọi endpoint này: tạo mp3, đẩy lên đám mây, trả về link =====
narration.MapPost("/generate", async (GenerateRequest req, NarrationGenerator gen) =>
{
    if (req.AnimalId <= 0) return Results.BadRequest("AnimalId không hợp lệ");
    if (string.IsNullOrWhiteSpace(req.Text)) return Results.BadRequest("Text không được để trống");
    if (req.Text.Length > MaxTextLength) return Results.BadRequest($"Text tối đa {MaxTextLength} ký tự");

    var langs = (req.TargetLangs ?? []).Distinct().ToArray();
    if (langs.Length == 0) return Results.BadRequest("Thiếu TargetLangs");

    var bad = langs.Where(l => !EdgeTtsService.IsSupported(l)).ToArray();
    if (bad.Length > 0) return Results.BadRequest($"Chưa hỗ trợ: {string.Join(", ", bad)}");

    if (req.Name?.Length > 200 || req.ScientificName?.Length > 200) return Results.BadRequest("Tên tối đa 200 ký tự");
    // Có tên và không phải bản dịch admin đã sửa: dịch luôn tên loài cho ngôn ngữ đã tạo được audio
    var translateName = !req.TextIsFinal && !string.IsNullOrWhiteSpace(req.Name);

    var results = await Task.WhenAll(langs.Select(async l =>
    {
        var r = await gen.GenerateAsync(req.AnimalId, req.Text, l, req.TextIsFinal);
        return translateName && r.Status == "DONE"
            ? r with { TranslatedName = await gen.TranslateNameAsync(req.AnimalId, req.Name!.Trim(), req.ScientificName?.Trim(), l) }
            : r;
    }));
    return Results.Ok(new { req.AnimalId, results });
});

// ===== Ảnh con vật từ trang quản trị: Backend đã kiểm tra loại file; ở đây chỉ nhận đúng 3 loại, tối đa 5 MB =====
narration.MapPost("/image", async (HttpRequest http, IAudioStore store) =>
{
    var ext = http.ContentType switch { "image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp", _ => null };
    if (ext is null) return Results.BadRequest("Chỉ nhận ảnh JPG, PNG hoặc WebP");

    using var ms = new MemoryStream();
    await http.Body.CopyToAsync(ms);
    if (ms.Length == 0 || ms.Length > MaxImageBytes) return Results.BadRequest("Ảnh trống hoặc lớn hơn 5 MB");

    var path = $"images/{Guid.NewGuid():N}.{ext}"; // tên do server đặt, không dùng tên file của người tải
    await store.UploadAsync(path, ms.ToArray(), http.ContentType!);
    return Results.Ok(new { url = store.GetPublicUrl(path) });
});

// ===== Endpoint cũ: trả thẳng mp3, không lưu đâu cả (dùng để test nhanh) =====
narration.MapPost("", async (NarrationRequest req, ITranslator translator, ITtsService tts) =>
{
    if (string.IsNullOrWhiteSpace(req.Text))
        return Results.BadRequest("Text không được để trống");
    if (req.Text.Length > MaxTextLength)
        return Results.BadRequest($"Text tối đa {MaxTextLength} ký tự");
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
record GenerateRequest(int AnimalId, string Text, string[] TargetLangs, bool TextIsFinal = false, string? Name = null, string? ScientificName = null); // TextIsFinal mặc định false: Backend cũ vẫn chạy

public partial class Program { }