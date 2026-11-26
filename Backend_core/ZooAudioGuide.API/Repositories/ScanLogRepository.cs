using Microsoft.EntityFrameworkCore;
using ZooAudioGuide.API.Data;
using ZooAudioGuide.API.Models;

namespace ZooAudioGuide.API.Repositories
{
    public class ScanLogRepository : IScanLogRepository
    {
        private readonly ZooDbContext _context;
        public ScanLogRepository(ZooDbContext context) => _context = context;

        public async Task AddLogAsync(ScanLog log)
        {
            await _context.ScanLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public Task<bool> AnimalExistsAsync(int animalId) => _context.Animals.AnyAsync(a => a.Id == animalId);

        // animalId null (trang chủ) so khớp với dòng null: EF dịch == theo cách C# xử lý null
        public Task<bool> HasRecentAsync(string sessionId, int? animalId, DateTime since) =>
            _context.ScanLogs.AnyAsync(s => s.SessionId == sessionId && s.AnimalId == animalId && s.ScannedAt >= since);
    }
}