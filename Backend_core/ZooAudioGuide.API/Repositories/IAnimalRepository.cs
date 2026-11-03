using System.Collections.Generic;
using System.Threading.Tasks;
using ZooAudioGuide.API.Models;

namespace ZooAudioGuide.API.Repositories
{
    public interface IAnimalRepository
    {
        Task<IEnumerable<Animal>> GetAllAsync();
        Task<Animal?> GetByIdAsync(int id);
        Task AddAsync(Animal animal);
        Task DeleteAsync(Animal animal);
        Task SaveChangesAsync();
        Task EnsureLanguageAsync(string code);
    }
}
