using System.Collections.Generic;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;

namespace ZooAudioGuide.API.Services
{
    public interface IAnimalService
    {
        Task<IEnumerable<AnimalDto>> GetAllAnimalsAsync();
        Task<AnimalDto?> GetAnimalByIdAsync(int id);
        Task<AnimalDto> CreateAnimalAsync(AnimalCreateDto dto);
        Task<bool> DeleteAnimalAsync(int id);
    }
}
