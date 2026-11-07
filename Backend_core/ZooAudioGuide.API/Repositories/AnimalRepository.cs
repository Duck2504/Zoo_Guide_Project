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
            // Lượt quét của con này giữ lại cho thống kê (AnimalId = null); khóa ngoại không tự làm việc này
            await using var tx = await _context.Database.BeginTransactionAsync();
            await _context.ScanLogs.Where(s => s.AnimalId == animal.Id)
                .ExecuteUpdateAsync(u => u.SetProperty(s => s.AnimalId, (int?)null));
            if (animal.AnimalContents != null && animal.AnimalContents.Any())
            {
                _context.AnimalContents.RemoveRange(animal.AnimalContents);
            }
            _context.Animals.Remove(animal);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        private static readonly Dictionary<string, string> LanguageNames = new()
        {
            ["vi"] = "Tiếng Việt", ["en"] = "English", ["ja"] = "日本語", ["ko"] = "한국어"
        };

        // Bảng Languages không có seed, nên thêm ngôn ngữ còn thiếu để khóa ngoại của AnimalContent không lỗi.
        public async Task EnsureLanguageAsync(string code)
        {
            if (!await _context.Languages.AnyAsync(l => l.Code == code))
                _context.Languages.Add(new Language { Code = code, Name = LanguageNames.GetValueOrDefault(code, code) });
        }
    }
}
