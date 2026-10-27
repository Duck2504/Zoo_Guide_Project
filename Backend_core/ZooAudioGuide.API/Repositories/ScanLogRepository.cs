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
    }
}