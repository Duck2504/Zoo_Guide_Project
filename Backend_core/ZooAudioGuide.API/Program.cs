using Microsoft.EntityFrameworkCore;
using ZooAudioGuide.API.Data;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;
using Scalar.AspNetCore;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ZooDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        // Dòng này bắt buộc phải có để EF Core hiểu kiểu dữ liệu Point
        sqlOptions => sqlOptions.UseNetTopologySuite() 
    )
);
builder.Services.AddControllers();
builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
builder.Services.AddScoped<IZoneService, ZoneService>();
builder.Services.AddScoped<IAnimalRepository, AnimalRepository>();
builder.Services.AddScoped<IAnimalService, AnimalService>();
builder.Services.AddScoped<IScanLogRepository, ScanLogRepository>();
builder.Services.AddScoped<IScanLogService, ScanLogService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
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
app.UseCors("AllowFE"); //[cite: 3]

// 2. CẤU HÌNH API DOCS & GIAO DIỆN SCALAR (Tương tự Swagger)
app.MapOpenApi(); //[cite: 3]
app.MapScalarApiReference(); // Thêm dòng này để có UI đẹp test API

// 3. Kích hoạt định tuyến cho các Controller (Zones, Animals...)
app.MapControllers(); //[cite: 3]

// 4. Lắng nghe Port của Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080"; //[cite: 3]
app.Run($"http://0.0.0.0:{port}"); //[cite: 3]