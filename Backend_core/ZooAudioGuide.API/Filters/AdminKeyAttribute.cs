using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ZooAudioGuide.API.Filters
{
    // Chặn API quản trị nếu header X-Admin-Key không khớp cấu hình Admin:ApiKey.
    // shortcut: một key dùng chung cho mọi admin, chưa phải đăng nhập thật; chuyển sang JWT khi cần nhiều tài khoản/phân quyền.
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public sealed class AdminKeyAttribute : Attribute, IAuthorizationFilter
    {
        public const string HeaderName = "X-Admin-Key";
        public static readonly object DeniedBody = new { message = "Sai hoặc thiếu mã quản trị (X-Admin-Key)." };

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (!IsAuthorized(context.HttpContext))
                context.Result = new UnauthorizedObjectResult(DeniedBody);
        }

        // Dùng chung cho controller (attribute) và minimal API (endpoint filter trong Program.cs)
        public static bool IsAuthorized(HttpContext http)
        {
            var expected = http.RequestServices.GetRequiredService<IConfiguration>()["Admin:ApiKey"]?.Trim(); // biến môi trường Render hay dính khoảng trắng
            var given = http.Request.Headers[HeaderName].ToString();

            // Chưa cấu hình key thì từ chối hết, không bao giờ mở cửa mặc định
            return !string.IsNullOrEmpty(expected) && !string.IsNullOrEmpty(given) &&
                   CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(given), Encoding.UTF8.GetBytes(expected));
        }
    }
}
