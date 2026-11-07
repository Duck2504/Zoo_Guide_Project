using Microsoft.EntityFrameworkCore;
using ZooAudioGuide.API.Data;
using ZooAudioGuide.API.Filters;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;
using Scalar.AspNetCore;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

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

// Dịch/đọc/lưu mp3 nằm ở microservice (MicroServices/ZooAudioGuide.NarrationService); Backend gọi sang qua NarrationService:BaseUrl
builder.Services.AddHttpClient<INarrationClient, NarrationClient>(c => c.Timeout = TimeSpan.FromMinutes(5));

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails(); // bắt buộc đi cùng UseExceptionHandler() bên dưới
builder.Services.AddDataProtection(); // tạo/kiểm tra token đăng nhập admin (AdminToken)

// Chống dò mật khẩu ở /api/auth/login: tối đa 5 lần/phút.
// shortcut: sau proxy của Render mọi request chung 1 IP nên giới hạn là toàn cục (kẻ dò có thể làm admin chờ 1 phút); khi cần thì chia theo X-Forwarded-For.
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests; // mặc định là 503
    o.AddFixedWindowLimiter("login", w => { w.PermitLimit = 5; w.Window = TimeSpan.FromMinutes(1); w.QueueLimit = 0; });
    // Ghi lượt quét: tối đa 60 lần/phút mỗi IP (đủ cho cả nhóm khách chung wifi), chặn script bơm số liệu.
    // shortcut: IP lấy từ X-Forwarded-For nên kẻ cố ý có thể giả; lọc nguồn và lọc trùng phiên vẫn chặn phần lớn.
    o.AddPolicy("scan-log", http => RateLimitPartition.GetFixedWindowLimiter(
        http.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim() is { Length: > 0 } ip ? ip : http.Connection.RemoteIpAddress?.ToString() ?? "",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 60, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

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
// Development tự bật trang lỗi chi tiết; production chỉ trả ProblemDetails, không lộ stack trace
if (!app.Environment.IsDevelopment()) app.UseExceptionHandler();

// 1. KÍCH HOẠT CORS
app.UseCors("AllowFE");
app.UseRateLimiter(); // sau CORS để trang web đọc được lỗi 429

// 2. CẤU HÌNH API DOCS & GIAO DIỆN SCALAR (Tương tự Swagger)
app.MapOpenApi();
app.MapScalarApiReference(); // Thêm dòng này để có UI đẹp test API

// 3. Kích hoạt định tuyến cho các Controller (Zones, Animals...)
app.MapControllers();

app.MapGet("/health", () => "OK"); // để công khai: Render dùng để kiểm tra sống/chết

// ====================================================================
// 5. CẤU HÌNH PORT VÀ CHẠY ỨNG DỤNG
// ====================================================================

// Lắng nghe Port của Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");
