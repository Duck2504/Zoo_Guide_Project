using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.API.Controllers
{
    [Route("api/[controller]")]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ZonesController : ControllerBase
    {
        private readonly IZoneService _zoneService;

        public ZonesController(IZoneService zoneService)
        {
            _zoneService = zoneService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ZoneDto>>> GetZones()
        {
            var zones = await _zoneService.GetAllZonesAsync();
            return Ok(zones);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ZoneDto>> GetZone(int id)
        {
            var zone = await _zoneService.GetZoneByIdAsync(id);
            if (zone == null) return NotFound();
            return Ok(zone);
        }

        [HttpPost]
        public async Task<IActionResult> CreateZone(ZoneCreateDto dto)
        {
            try
            {
                var createdZone = await _zoneService.CreateZoneAsync(dto);
                return CreatedAtAction(nameof(GetZone), new { id = createdZone.Id }, createdZone);
            }
            catch (Exception ex)
            {
                // Dùng IActionResult kết hợp Ok() để lách qua IIS mà không bị lệch kiểu dữ liệu
                return Ok(new
                {
                    Message = "LỖI TẠI ĐÂY:",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateZone(int id, ZoneCreateDto dto)
        {
            var result = await _zoneService.UpdateZoneAsync(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteZone(int id)
        {
            var result = await _zoneService.DeleteZoneAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}