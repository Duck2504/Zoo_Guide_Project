using System.Collections.Generic;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;

namespace ZooAudioGuide.API.Services
{
    public interface IZoneService
    {
        Task<IEnumerable<ZoneDto>> GetAllZonesAsync();
        Task<ZoneDto?> GetZoneByIdAsync(int id);
        Task<ZoneDto> CreateZoneAsync(ZoneCreateDto dto);
        Task<bool> UpdateZoneAsync(int id, ZoneCreateDto dto);
        Task<bool> DeleteZoneAsync(int id);
    }
}