using Microsoft.AspNetCore.Mvc;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.API.Controllers
{
    [ApiController]
    [Route("api/admin/stats")]
    // [Authorize] // Tạm thời comment lại để test, sau này làm JWT sẽ mở ra
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var data = await _statisticsService.GetOverviewAsync();
            return Ok(data);
        }
    }
}