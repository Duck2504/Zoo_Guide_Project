using Microsoft.AspNetCore.DataProtection;
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

        // Dùng chung cho controller (attribute) và minimal API (endpoint filter trong Program.cs)
        public static bool IsAuthorized(HttpContext http)
        {
            var header = http.Request.Headers.Authorization.ToString();
            const string prefix = "Bearer ";
            if (!header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return false;
            return AdminToken.IsValid(http.RequestServices, header[prefix.Length..].Trim());
        }
    }

    // Token đăng nhập admin tạo bằng Data Protection có sẵn của ASP.NET (mã hóa + ký + hạn dùng).
    // shortcut: khóa Data Protection lưu trong container nên mỗi lần Render deploy/restart admin phải đăng nhập lại,
    // và chỉ đúng khi chạy 1 instance; khi scale nhiều instance thì lưu khóa ra chỗ chung (DB/blob) hoặc chuyển sang JWT.
    public static class AdminToken
    {
        public static readonly TimeSpan Lifetime = TimeSpan.FromHours(8);
        private const string Purpose = "ZooAudioGuide.AdminLogin.v1";

        private static ITimeLimitedDataProtector Protector(IServiceProvider services) =>
            services.GetRequiredService<IDataProtectionProvider>().CreateProtector(Purpose).ToTimeLimitedDataProtector();

        public static string Issue(IServiceProvider services, string username, TimeSpan? lifetime = null) =>
            Protector(services).Protect(username, lifetime ?? Lifetime);

        public static bool IsValid(IServiceProvider services, string token)
        {
            if (string.IsNullOrEmpty(token)) return false;
            try
            {
                Protector(services).Unprotect(token, out _); // ném lỗi nếu sai chữ ký, sai định dạng hoặc hết hạn
                return true;
            }
            catch
            {
                return false; // token rác không bao giờ được thành lỗi 500
            }
        }
    }
}
