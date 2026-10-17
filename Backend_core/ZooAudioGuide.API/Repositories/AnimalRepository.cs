using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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
            // Include thêm AnimalContents để lấy được tên tiếng Việt
            return await _context.Animals
                .Include(a => a.AnimalContents)
                .ToListAsync();
        }

        public async Task<Animal?> GetByIdAsync(int id)
        {
            return await _context.Animals
                .Include(a => a.AnimalContents)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task AddAsync(Animal animal)
        {
            await _context.Animals.AddAsync(animal);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}