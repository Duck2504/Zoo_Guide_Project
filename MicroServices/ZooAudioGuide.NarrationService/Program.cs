using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<ITranslator, GeminiTranslator>();
builder.Services.AddSingleton<ITtsService, EdgeTtsService>();
builder.Services.AddHttpClient<IAudioStore, SupabaseAudioStore>();   // lưu mp3 lên Supabase
builder.Services.AddScoped<NarrationGenerator>();

// Để service hiểu đúng địa chỉ https khi đứng sau ngrok
builder.Services.Configure<ForwardedHeadersOptions>(o =>
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor
                       | ForwardedHeaders.XForwardedProto
                       | ForwardedHeaders.XForwardedHost);

// Cho phép web gọi trực tiếp (sau này nên giới hạn lại theo địa chỉ web của nhóm)
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseForwardedHeaders();
app.UseCors();

// (Tùy chọn) Khóa các endpoint /api bằng mật khẩu chung khi đã mở ra internet.
// Chỉ bật khi có cấu hình Service:ApiKey, nên test và chạy local không bị ảnh hưởng.
var serviceKey = app.Configuration["Service:ApiKey"];
if (!string.IsNullOrEmpty(serviceKey))
{
    app.Use(async (ctx, next) =>
    {
        if (ctx.Request.Path.StartsWithSegments("/api") &&
            ctx.Request.Headers["X-Api-Key"] != serviceKey)
        {
            ctx.Response.StatusCode = 401;
            return;
        }
        await next();
    });
}

app.MapGet("/health", () => "OK");

// ===== Core gọi endpoint này: tạo mp3, đẩy lên Supabase, trả về link =====
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

// ===== Endpoint cũ: trả thẳng mp3, không lưu (dùng để test nhanh) =====
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