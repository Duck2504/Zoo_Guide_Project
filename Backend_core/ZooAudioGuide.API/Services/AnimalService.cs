using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;

namespace ZooAudioGuide.API.Services
{
    public class AnimalService : IAnimalService
    {
        private readonly IAnimalRepository _animalRepository;

        public AnimalService(IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;
        }

        public async Task<IEnumerable<AnimalDto>> GetAllAnimalsAsync()
        {
            var animals = await _animalRepository.GetAllAsync();
            return animals.Select(a => new AnimalDto
            {
                Id = a.Id,
                ZoneId = a.ZoneId,
                ScientificName = a.ScientificName,
                AvatarUrl = a.AvatarUrl,
                DefaultLocalName = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi")?.LocalName ?? "Unknown"
            });
        }

        public async Task<AnimalDto> CreateAnimalAsync(AnimalCreateDto dto)
        {
            // 1. Khởi tạo Animal
            var animal = new Animal
            {
                ZoneId = dto.ZoneId,
                ScientificName = dto.ScientificName,
                AvatarUrl = dto.AvatarUrl
            };

            var content = new AnimalContent
            {
                LanguageCode = "vi",
                LocalName = dto.LocalName,
                ScriptText = dto.ScriptText,
                AudioUrl = "",
                SyncStatus = "Pending"
            };

            animal.AnimalContents.Add(content);

            await _animalRepository.AddAsync(animal);
            await _animalRepository.SaveChangesAsync();

            return new AnimalDto
            {
                Id = animal.Id,
                ZoneId = animal.ZoneId,
                ScientificName = animal.ScientificName,
                AvatarUrl = animal.AvatarUrl,
                DefaultLocalName = content.LocalName
            };
        }
    }
}