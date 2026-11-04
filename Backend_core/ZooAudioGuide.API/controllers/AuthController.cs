using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Filters;

namespace ZooAudioGuide.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _log;

        public AuthController(IConfiguration config, ILogger<AuthController> log)
        {
            _config = config;
            _log = log;
        }

        // Tài khoản admin duy nhất lấy từ biến môi trường Render: Admin__Username, Admin__Password
        [HttpPost("login")]
        [EnableRateLimiting("login")]
        public IActionResult Login(LoginRequestDto dto)
        {
            var user = _config["Admin:Username"]?.Trim(); // biến môi trường Render hay dính khoảng trắng
            var pass = _config["Admin:Password"]?.Trim();
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass))
            {
                _log.LogWarning("Chưa cấu hình Admin:Username / Admin:Password nên mọi đăng nhập admin bị từ chối");
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu." });
            }

            // So sánh thời gian cố định, và dùng & (không phải &&) để không lộ việc tên đăng nhập đúng hay sai
            if (!(SameSecret(dto.Username, user) & SameSecret(dto.Password, pass)))
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu." });

            var token = AdminToken.Issue(HttpContext.RequestServices, user);
            return Ok(new { token, expiresAt = DateTime.UtcNow.Add(AdminToken.Lifetime) });
        }

        // Băm trước để hai chuỗi luôn cùng độ dài khi so sánh
        private static bool SameSecret(string? given, string expected) =>
            CryptographicOperations.FixedTimeEquals(
                SHA256.HashData(Encoding.UTF8.GetBytes(given ?? "")),
                SHA256.HashData(Encoding.UTF8.GetBytes(expected)));
    }
}
