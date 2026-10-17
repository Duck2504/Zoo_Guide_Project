using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZooAudioGuide.API.Data;
using ZooAudioGuide.API.Models;

namespace ZooAudioGuide.API.Repositories
{
    public class ZoneRepository : IZoneRepository
    {
        private readonly ZooDbContext _context;

        public ZoneRepository(ZooDbContext context)
        {
            _context = context;
        }

        public IQueryable<Zone> GetZonesWithDetails()
        {
            return _context.Zones
                .Include(z => z.Animals)
                    .ThenInclude(a => a.AnimalContents);
        }

        public async Task<IEnumerable<Zone>> GetAllAsync()
        {
            return await _context.Zones.ToListAsync();
        }

        public async Task<Zone?> GetByIdAsync(int id)
        {
            return await _context.Zones.FindAsync(id);
        }

        public async Task AddAsync(Zone zone)
        {
            await _context.Zones.AddAsync(zone);
        }

        public Task UpdateAsync(Zone zone)
        {
            _context.Zones.Update(zone);
            return Task.CompletedTask; // Vì hàm Update của EF Core không phải là async
        }

        public Task DeleteAsync(Zone zone)
        {
            _context.Zones.Remove(zone);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}