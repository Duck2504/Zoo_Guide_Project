using System.Linq;
using ZooAudioGuide.API.Models;

namespace ZooAudioGuide.API.Repositories
{
    public interface IZoneRepository
    {
        IQueryable<Zone> GetZonesWithDetails();
        Task<IEnumerable<Zone>> GetAllAsync();
        Task<Zone?> GetByIdAsync(int id);
        Task AddAsync(Zone zone);
        Task UpdateAsync(Zone zone);
        Task DeleteAsync(Zone zone);
        Task SaveChangesAsync();
    }
}