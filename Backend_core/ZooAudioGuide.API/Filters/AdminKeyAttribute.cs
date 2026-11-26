using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ZooAudioGuide.API.Filters
{
    // Chặn API quản trị nếu request không có token đăng nhập admin hợp lệ (header Authorization: Bearer <token>).
    // Token lấy từ POST /api/auth/login.
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public sealed class AdminKeyAttribute : Attribute, IAuthorizationFilter
    {
        public static readonly object DeniedBody = new { message = "Phiên đăng nhập quản trị không hợp lệ hoặc đã hết hạn. Hãy đăng nhập lại." };

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (!IsAuthorized(context.HttpContext))
                context.Result = new UnauthorizedObjectResult(DeniedBody);
        }

        // public để test/endpoint khác dùng lại được
        public static bool IsAuthorized(HttpContext http)
        {
            var header = http.Request.Headers.Authorization.ToString();
            const string prefix = "Bearer ";
            if (!header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return false;
            return AdminToken.IsValid(http.RequestServices, header[prefix.Length..].Trim());
        }
    }

    // Token đăng nhập admin: "base64url(username|hạn unix)" + "." + "base64url(HMAC-SHA256)".
    // Khóa ký suy ra từ Admin:Username + Admin:Password trong cấu hình nên Render restart/deploy không làm admin bị đăng xuất;
    // đổi mật khẩu thì mọi token cũ hết hiệu lực. Chưa cấu hình mật khẩu thì không cấp và không nhận token nào.
    // shortcut: khóa suy ra thẳng từ mật khẩu, token lộ có thể bị dùng để dò mật khẩu offline; khi cần thì thêm biến Admin:TokenSecret riêng.
    public static class AdminToken
    {
        public static readonly TimeSpan Lifetime = TimeSpan.FromHours(8);
        private const string Purpose = "ZooAudioGuide.AdminLogin.v2";

        // null nếu chưa cấu hình; Trim giống AuthController (biến môi trường Render hay dính khoảng trắng)
        private static byte[]? Key(IServiceProvider services)
        {
            var cfg = services.GetService<IConfiguration>();
            var user = cfg?["Admin:Username"]?.Trim();
            var pass = cfg?["Admin:Password"]?.Trim();
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass)) return null;
            return SHA256.HashData(Encoding.UTF8.GetBytes($"{Purpose}\n{user}\n{pass}"));
        }

        public static string Issue(IServiceProvider services, string username, TimeSpan? lifetime = null)
        {
            var key = Key(services) ?? throw new InvalidOperationException("Chưa cấu hình Admin:Username / Admin:Password nên không cấp token admin");
            var exp = DateTimeOffset.UtcNow.Add(lifetime ?? Lifetime).ToUnixTimeSeconds();
            var payload = Encoding.UTF8.GetBytes($"{username}|{exp}");
            return Base64Url.EncodeToString(payload) + "." + Base64Url.EncodeToString(HMACSHA256.HashData(key, payload));
        }

        public static bool IsValid(IServiceProvider services, string token)
        {
            if (string.IsNullOrEmpty(token)) return false;
            try
            {
                var key = Key(services);
                if (key == null) return false;
                var parts = token.Split('.');
                if (parts.Length != 2) return false;
                var payload = Base64Url.DecodeFromChars(parts[0]);
                if (!CryptographicOperations.FixedTimeEquals(HMACSHA256.HashData(key, payload), Base64Url.DecodeFromChars(parts[1])))
                    return false;
                var text = Encoding.UTF8.GetString(payload);
                var exp = long.Parse(text[(text.LastIndexOf('|') + 1)..]);
                return DateTimeOffset.UtcNow.ToUnixTimeSeconds() < exp;
            }
            catch
            {
                return false; // token rác không bao giờ được thành lỗi 500
            }
        }
    }
}
