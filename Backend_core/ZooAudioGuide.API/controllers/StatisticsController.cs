using Microsoft.AspNetCore.Mvc;
using ZooAudioGuide.API.Filters;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.API.Controllers
{
    [ApiController]
    [Route("api/admin/stats")]
    [AdminKey]
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