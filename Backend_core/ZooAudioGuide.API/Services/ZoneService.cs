using NetTopologySuite;
using NetTopologySuite.Geometries;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;

namespace ZooAudioGuide.API.Services
{
    public class ZoneService : IZoneService
    {
        private readonly IZoneRepository _zoneRepository;
        private readonly GeometryFactory _geometryFactory;

        public ZoneService(IZoneRepository zoneRepository)
        {
            _zoneRepository = zoneRepository;
            // SRID 4326 là chuẩn hệ tọa độ WGS 84 của GPS.
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        }

        public async Task<IEnumerable<ZoneDto>> GetAllZonesAsync()
        {
            var zones = await _zoneRepository.GetAllAsync();
            return zones.Select(z => new ZoneDto
            {
                Id = z.Id,
                ZoneCode = z.ZoneCode,
                Latitude = z.Location.Y, 
                Longitude = z.Location.X,
                Radius = z.Radius
            });
        }

        public async Task<ZoneDto?> GetZoneByIdAsync(int id)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            if (zone == null) return null;

            return new ZoneDto
            {
                Id = zone.Id,
                ZoneCode = zone.ZoneCode,
                Latitude = zone.Location.Y,
                Longitude = zone.Location.X,
                Radius = zone.Radius
            };
        }

        public async Task<ZoneDto> CreateZoneAsync(ZoneCreateDto dto)
        {
            // LƯU Ý MẠNH: Hàm Coordinate nhận tham số theo thứ tự (X, Y) tức là (Longitude, Latitude)
            var location = _geometryFactory.CreatePoint(new Coordinate(dto.Longitude, dto.Latitude));

            var zone = new Zone
            {
                ZoneCode = dto.ZoneCode,
                Location = location,
                Radius = dto.Radius
            };

            await _zoneRepository.AddAsync(zone);
            await _zoneRepository.SaveChangesAsync();

            return new ZoneDto
            {
                Id = zone.Id,
                ZoneCode = zone.ZoneCode,
                Latitude = zone.Location.Y,
                Longitude = zone.Location.X,
                Radius = zone.Radius
            };
        }

        public async Task<bool> UpdateZoneAsync(int id, ZoneCreateDto dto)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            if (zone == null) return false;

            zone.ZoneCode = dto.ZoneCode;
            zone.Location = _geometryFactory.CreatePoint(new Coordinate(dto.Longitude, dto.Latitude));
            zone.Radius = dto.Radius;

            await _zoneRepository.UpdateAsync(zone);
            await _zoneRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteZoneAsync(int id)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            if (zone == null) return false;

            // Khóa ngoại đang cascade: xóa khu sẽ xóa luôn động vật, bài thuyết minh và lượt quét, nên chặn ở đây
            if (await _zoneRepository.HasAnimalsAsync(id))
                throw new InvalidOperationException("Khu vực còn động vật. Hãy chuyển hoặc xóa các động vật trước.");

            await _zoneRepository.DeleteAsync(zone);
            await _zoneRepository.SaveChangesAsync();
            return true;
        }
    }
}