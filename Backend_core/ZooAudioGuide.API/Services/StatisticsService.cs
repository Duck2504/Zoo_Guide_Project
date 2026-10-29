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
        private readonly ZooDbContext _context;

        public StatisticsService(ZooDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardOverviewDto> GetOverviewAsync()
        {
            // Mốc thời gian 5 phút trước để tính người đang online
            var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
            
            // Lấy 7 ngày gần nhất cho biểu đồ
            var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-7);

            var totalScans = await _context.ScanLogs.CountAsync();

            var onlineUsers = await _context.ScanLogs
                .Where(s => s.ScannedAt >= fiveMinutesAgo)
                .Select(s => s.SessionId)
                .Distinct()
                .CountAsync();

            var dailyStats = await _context.ScanLogs
                .Where(s => s.ScannedAt >= sevenDaysAgo)
                .GroupBy(s => s.ScannedAt.Date)
                .Select(g => new DailyStatDto
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var topAnimals = await _context.ScanLogs
                .Include(s => s.Animal)
                .Where(s => s.AnimalId != null)
                .GroupBy(s => new { s.AnimalId, s.Animal.ScientificName })
                .Select(g => new TopAnimalDto
                {
                    AnimalId = g.Key.AnimalId.Value,
                    AnimalName = g.Key.ScientificName,
                    ScanCount = g.Count()
                })
                .OrderByDescending(x => x.ScanCount)
                .Take(5)
                .ToListAsync();

            return new DashboardOverviewDto
            {
                TotalScans = totalScans,
                OnlineUsers = onlineUsers,
                DailyStats = dailyStats,
                TopAnimals = topAnimals
            };
        }
    }
}