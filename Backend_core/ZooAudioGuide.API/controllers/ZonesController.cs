using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System.Collections.Generic;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Filters;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.API.Controllers
{
    [Route("api/[controller]")]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ZonesController : ControllerBase
    {
        private readonly IZoneService _zoneService;
        private readonly IOutputCacheStore _cache;

        public ZonesController(IZoneService zoneService, IOutputCacheStore cache)
        {
            _zoneService = zoneService;
            _cache = cache;
        }

        private Task EvictCacheAsync() => _cache.EvictByTagAsync(AnimalsController.CacheTag, default).AsTask();

        [HttpGet]
        [OutputCache(Duration = AnimalsController.CacheSeconds, Tags = [AnimalsController.CacheTag])]
        public async Task<ActionResult<IEnumerable<ZoneDto>>> GetZones()
        {
            var zones = await _zoneService.GetAllZonesAsync();
            return Ok(zones);
        }

        [HttpGet("{id}")]
        [OutputCache(Duration = AnimalsController.CacheSeconds, Tags = [AnimalsController.CacheTag])]
        public async Task<ActionResult<ZoneDto>> GetZone(int id)
        {
            var zone = await _zoneService.GetZoneByIdAsync(id);
            if (zone == null) return NotFound();
            return Ok(zone);
        }

        [HttpPost]
        [AdminKey]
        public async Task<IActionResult> CreateZone(ZoneCreateDto dto)
        {
            try
            {
                var createdZone = await _zoneService.CreateZoneAsync(dto);
                await EvictCacheAsync();
                return CreatedAtAction(nameof(GetZone), new { id = createdZone.Id }, createdZone);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [AdminKey]
        public async Task<IActionResult> UpdateZone(int id, ZoneCreateDto dto)
        {
            try
            {
                var result = await _zoneService.UpdateZoneAsync(id, dto);
                if (!result) return NotFound();
                await EvictCacheAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [AdminKey]
        public async Task<IActionResult> DeleteZone(int id)
        {
            try
            {
                var result = await _zoneService.DeleteZoneAsync(id);
                if (!result) return NotFound();
                await EvictCacheAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}