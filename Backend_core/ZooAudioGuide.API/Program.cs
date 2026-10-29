using Microsoft.EntityFrameworkCore;
using ZooAudioGuide.API.Data;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;
using Scalar.AspNetCore;

// --- Thư viện bổ sung từ Microservice ---
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Database
builder.Services.AddDbContext<ZooDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        // Dòng này bắt buộc phải có để EF Core hiểu kiểu dữ liệu Point
        sqlOptions => sqlOptions.UseNetTopologySuite() 
    )
);

builder.Services.AddControllers();

// --- Đăng ký Services của Backend Core ---
builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
builder.Services.AddScoped<IZoneService, ZoneService>();
builder.Services.AddScoped<IAnimalRepository, AnimalRepository>();
builder.Services.AddScoped<IAnimalService, AnimalService>();
builder.Services.AddScoped<IScanLogRepository, ScanLogRepository>();
builder.Services.AddScoped<IScanLogService, ScanLogService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();

// --- Đăng ký Services gộp từ Microservice ---
builder.Services.AddHttpClient<ITranslator, GeminiTranslator>(client => 
{
    client.Timeout = TimeSpan.FromMinutes(5);
});
builder.Services.AddSingleton<ITtsService, EdgeTtsService>();
builder.Services.AddHttpClient<IAudioStore, SupabaseAudioStore>(client => 
{
    client.Timeout = TimeSpan.FromMinutes(5);
});
builder.Services.AddScoped<NarrationGenerator>();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFE", policy =>
    {
        policy.AllowAnyOrigin() // Cho phép mọi domain gọi vào (sau này deploy thật sẽ giới hạn lại)
              .AllowAnyHeader() // Cho phép gửi mọi header
              .AllowAnyMethod(); // Cho phép mọi phương thức GET, POST, PUT, DELETE
    });
});

var app = builder.Build();
app.UseDeveloperExceptionPage(); 

// 1. KÍCH HOẠT CORS
app.UseCors("AllowFE");

// 2. CẤU HÌNH API DOCS & GIAO DIỆN SCALAR (Tương tự Swagger)
app.MapOpenApi();
app.MapScalarApiReference(); // Thêm dòng này để có UI đẹp test API

// 3. Kích hoạt định tuyến cho các Controller (Zones, Animals...)
app.MapControllers();

// ====================================================================
// 4. CÁC ENDPOINT GỘP TỪ MICROSERVICE SANG (Minimal APIs)
// ====================================================================

app.MapGet("/health", () => "OK");

// Endpoint chính: tạo mp3, đẩy lên đám mây, trả về link
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

// Endpoint phụ: trả thẳng mp3, không lưu đâu cả (dùng để test nhanh)
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

// ====================================================================
// 5. CẤU HÌNH PORT VÀ CHẠY ỨNG DỤNG
// ====================================================================

// Lắng nghe Port của Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

// --- KHAI BÁO DTO RECORDS Ở CUỐI FILE ---
record NarrationRequest(string Text, string TargetLang);
record GenerateRequest(int AnimalId, string Text, string[] TargetLangs);