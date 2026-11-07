using Microsoft.EntityFrameworkCore;
using ZooAudioGuide.API.Data;
using ZooAudioGuide.API.DTOs;

namespace ZooAudioGuide.API.Services
{
    public interface IStatisticsService
    {
        Task<DashboardOverviewDto> GetOverviewAsync();
    }

    public class StatisticsService : IStatisticsService
    {
        public const int WindowDays = 7;
        private const int VnOffsetHours = 7; // ScannedAt lưu UTC; "hôm nay" và các ngày trên biểu đồ tính theo giờ Việt Nam

        private readonly ZooDbContext _context;

        public StatisticsService(ZooDbContext context)
        {
            _context = context;
        }

        // Các ngày của cửa sổ (giờ VN), ngày cuối là hôm nay
        public static List<DateTime> WindowDates(DateTime utcNow)
        {
            var todayVn = utcNow.AddHours(VnOffsetHours).Date;
            return Enumerable.Range(0, WindowDays).Select(i => todayVn.AddDays(i - (WindowDays - 1))).ToList();
        }

        public static List<DailyStatDto> FillDays(List<DateTime> days, IReadOnlyDictionary<DateTime, int> counts) =>
            days.Select(d => new DailyStatDto { Date = d, Count = counts.TryGetValue(d, out var c) ? c : 0 }).ToList();

        public async Task<DashboardOverviewDto> GetOverviewAsync()
        {
            var now = DateTime.UtcNow;
            var days = WindowDates(now);
            var windowStartUtc = days[0].AddHours(-VnOffsetHours);
            var fiveMinutesAgo = now.AddMinutes(-5);
            var window = _context.ScanLogs.Where(s => s.ScannedAt >= windowStartUtc);

            var totalScans = await _context.ScanLogs.CountAsync();

            var onlineUsers = await _context.ScanLogs
                .Where(s => s.ScannedAt >= fiveMinutesAgo)
                .Select(s => s.SessionId)
                .Distinct()
                .CountAsync();

            var perDay = await window
                .GroupBy(s => s.ScannedAt.AddHours(VnOffsetHours).Date)
                .Select(g => new { Day = g.Key, Count = g.Count() })
                .ToListAsync();

            // Đếm theo id trước, tên lấy ở truy vấn riêng (tránh truy vấn con sau GroupBy mà SQL Server không dịch được)
            var top = await _context.ScanLogs
                .Where(s => s.AnimalId != null)
                .GroupBy(s => s.AnimalId!.Value)
                .Select(g => new { Id = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();
            var topIds = top.Select(t => t.Id).ToList();
            var viNames = (await _context.AnimalContents
                    .Where(c => topIds.Contains(c.AnimalId) && c.LanguageCode == "vi")
                    .Select(c => new { c.AnimalId, c.LocalName })
                    .ToListAsync())
                .GroupBy(c => c.AnimalId).ToDictionary(g => g.Key, g => g.First().LocalName);
            var sciNames = (await _context.Animals
                    .Where(a => topIds.Contains(a.Id))
                    .Select(a => new { a.Id, a.ScientificName })
                    .ToListAsync())
                .ToDictionary(a => a.Id, a => a.ScientificName);

            var byLanguage = await window
                .GroupBy(s => s.LanguageCode)
                .Select(g => new BreakdownDto { Key = g.Key, Count = g.Count() })
                .ToListAsync();

            var bySource = await window
                .GroupBy(s => s.Source)
                .Select(g => new BreakdownDto { Key = g.Key, Count = g.Count() })
                .ToListAsync();

            var zoneCounts = await window
                .Where(s => s.AnimalId != null)
                .GroupBy(s => s.Animal.ZoneId)
                .Select(g => new { ZoneId = g.Key, Count = g.Count() })
                .ToListAsync();
            var zoneNames = (await _context.Zones.Select(z => new { z.Id, z.Name, z.ZoneCode }).ToListAsync())
                .ToDictionary(z => z.Id, z => z.Name ?? z.ZoneCode);
            var noAnimal = await window.CountAsync(s => s.AnimalId == null); // trang chủ, bản đồ: không gắn con vật nào

            var byZone = zoneCounts
                .Select(z => new BreakdownDto { Key = z.ZoneId.ToString(), Label = zoneNames.GetValueOrDefault(z.ZoneId, $"Khu {z.ZoneId}"), Count = z.Count })
                .ToList();
            if (noAnimal > 0) byZone.Add(new BreakdownDto { Key = "none", Label = "Không gắn con vật (trang chủ…)", Count = noAnimal });

            return new DashboardOverviewDto
            {
                TotalScans = totalScans,
                OnlineUsers = onlineUsers,
                DailyStats = FillDays(days, perDay.ToDictionary(p => p.Day, p => p.Count)),
                TopAnimals = top.Select(t => new TopAnimalDto
                {
                    AnimalId = t.Id,
                    ScientificName = sciNames.GetValueOrDefault(t.Id, ""),
                    AnimalName = viNames.GetValueOrDefault(t.Id) is { Length: > 0 } vi ? vi : sciNames.GetValueOrDefault(t.Id, $"#{t.Id}"),
                    ScanCount = t.Count
                }).ToList(),
                ByLanguage = byLanguage.OrderByDescending(b => b.Count).ToList(),
                BySource = bySource.OrderByDescending(b => b.Count).ToList(),
                ByZone = byZone.OrderByDescending(b => b.Count).ToList()
            };
        }
    }
}
