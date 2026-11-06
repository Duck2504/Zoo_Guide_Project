using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZooAudioGuide.API.Data;

namespace ZooAudioGuide.API.Controllers
{
    // Danh sách ngôn ngữ cho menu của trang du khách, lấy từ bảng Languages (tiếng Việt đứng đầu).
    // shortcut: đọc thẳng DbContext vì chỉ là một truy vấn đọc; thêm service khi có logic riêng cho ngôn ngữ.
    [Route("api/[controller]")]
    [ApiController]
    public class LanguagesController(ZooDbContext db) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetLanguages() =>
            Ok(await db.Languages
                .OrderBy(l => l.Code == "vi" ? 0 : 1).ThenBy(l => l.Code)
                .Select(l => new { l.Code, l.Name })
                .ToListAsync());
    }
}
