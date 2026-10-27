using Microsoft.AspNetCore.Mvc;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.API.Controllers
{
    [ApiController]
    [Route("api/scan-logs")]
    public class ScanLogsController : ControllerBase
    {
        private readonly IScanLogService _scanLogService;

        public ScanLogsController(IScanLogService scanLogService)
        {
            _scanLogService = scanLogService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateLog([FromBody] ScanLogCreateDto dto)
        {
            // Trích xuất User-Agent từ Header của Request
            var userAgent = Request.Headers["User-Agent"].ToString();

            // Thực thi ghi log
            await _scanLogService.RecordLogAsync(dto, userAgent);

            // Trả về 202 Accepted ngay lập tức để không làm chậm Frontend
            return Accepted(new { message = "Log recorded successfully." });
        }
    }
}