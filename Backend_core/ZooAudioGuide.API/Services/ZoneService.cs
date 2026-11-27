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
                Name = z.Name,
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
                Name = zone.Name,
                Latitude = zone.Location.Y,
                Longitude = zone.Location.X,
                Radius = zone.Radius
            };
        }

        public async Task<ZoneDto> CreateZoneAsync(ZoneCreateDto dto)
        {
            await EnsureNoOverlapAsync(dto.Latitude, dto.Longitude, dto.Radius);

            // LƯU Ý MẠNH: Hàm Coordinate nhận tham số theo thứ tự (X, Y) tức là (Longitude, Latitude)
            var location = _geometryFactory.CreatePoint(new Coordinate(dto.Longitude, dto.Latitude));

            var zone = new Zone
            {
                ZoneCode = dto.ZoneCode,
                Name = string.IsNullOrWhiteSpace(dto.Name) ? null : dto.Name.Trim(),
                Location = location,
                Radius = dto.Radius
            };

            await _zoneRepository.AddAsync(zone);
            await _zoneRepository.SaveChangesAsync();

            return new ZoneDto
            {
                Id = zone.Id,
                ZoneCode = zone.ZoneCode,
                Name = zone.Name,
                Latitude = zone.Location.Y,
                Longitude = zone.Location.X,
                Radius = zone.Radius
            };
        }

        public async Task<bool> UpdateZoneAsync(int id, ZoneCreateDto dto)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            if (zone == null) return false;

            await EnsureNoOverlapAsync(dto.Latitude, dto.Longitude, dto.Radius, excludeZoneId: id);

            zone.ZoneCode = dto.ZoneCode;
            zone.Name = string.IsNullOrWhiteSpace(dto.Name) ? null : dto.Name.Trim();
            zone.Location = _geometryFactory.CreatePoint(new Coordinate(dto.Longitude, dto.Latitude));
            zone.Radius = dto.Radius;

            await _zoneRepository.UpdateAsync(zone);
            await _zoneRepository.SaveChangesAsync();
            return true;
        }

        private async Task EnsureNoOverlapAsync(double latitude, double longitude, int radius, int? excludeZoneId = null)
        {
            var existingZones = await _zoneRepository.GetAllAsync();
            var conflicts = new List<string>();

            foreach (var z in existingZones)
            {
                if (excludeZoneId.HasValue && z.Id == excludeZoneId.Value) continue;
                if (z.Location == null) continue;

                var d = DistanceMeters(latitude, longitude, z.Location.Y, z.Location.X);
                var minAllowed = radius + z.Radius;
                if (d < minAllowed)
                {
                    var label = string.IsNullOrWhiteSpace(z.Name) ? z.ZoneCode : z.Name;
                    conflicts.Add($"{label} (tâm cách {System.Math.Round(d)} m, tối thiểu {minAllowed} m)");
                }
            }

            if (conflicts.Count > 0)
                throw new System.InvalidOperationException($"2 khu vực không được đè lên nhau: đang giao với {string.Join(", ", conflicts)}. Hãy dời tâm hoặc giảm bán kính.");
        }

        private static double DistanceMeters(double lat1, double lon1, double lat2, double lon2)
        {
            const double earthRadiusM = 6371000.0;
            var p1 = lat1 * System.Math.PI / 180.0;
            var p2 = lat2 * System.Math.PI / 180.0;
            var dp = (lat2 - lat1) * System.Math.PI / 180.0;
            var dl = (lon2 - lon1) * System.Math.PI / 180.0;
            var a = System.Math.Sin(dp / 2) * System.Math.Sin(dp / 2)
                  + System.Math.Cos(p1) * System.Math.Cos(p2)
                  * System.Math.Sin(dl / 2) * System.Math.Sin(dl / 2);
            var c = 2 * System.Math.Atan2(System.Math.Sqrt(a), System.Math.Sqrt(1 - a));
            return earthRadiusM * c;
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