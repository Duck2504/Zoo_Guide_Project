using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZooAudioGuide.API.Data;
using ZooAudioGuide.API.Models;

namespace ZooAudioGuide.API.Repositories
{
    public class AnimalRepository : IAnimalRepository
    {
        private readonly ZooDbContext _context;

        public AnimalRepository(ZooDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Animal>> GetAllAsync()
        {
            // Include thêm Zone và AnimalContents để lấy được tọa độ và tên tiếng Việt
            return await _context.Animals
                .Include(a => a.Zone)
                .Include(a => a.AnimalContents)
                .ToListAsync();
        }

        public async Task<Animal?> GetByIdAsync(int id)
        {
            return await _context.Animals
                .Include(a => a.Zone)
                .Include(a => a.AnimalContents)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task AddAsync(Animal animal)
        {
            await _context.Animals.AddAsync(animal);
        }

        public async Task DeleteAsync(Animal animal)
        {
            if (animal.AnimalContents != null && animal.AnimalContents.Any())
            {
                _context.AnimalContents.RemoveRange(animal.AnimalContents);
            }
            _context.Animals.Remove(animal);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
