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
                DefaultLocalName = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi")?.LocalName ?? "Unknown",
                ScriptText = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi")?.ScriptText ?? string.Empty,
                Latitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.Y : 10.7873,
                Longitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.X : 106.7055,
                RadiusMeters = a.Zone != null ? a.Zone.Radius : 25,
                ZoneName = a.Zone != null ? a.Zone.ZoneCode : "Khu Vực Thảo Cầm Viên"
            });
        }

        public async Task<AnimalDto?> GetAnimalByIdAsync(int id)
        {
            var a = await _animalRepository.GetByIdAsync(id);
            if (a == null) return null;
            return new AnimalDto
            {
                Id = a.Id,
                ZoneId = a.ZoneId,
                ScientificName = a.ScientificName,
                AvatarUrl = a.AvatarUrl,
                DefaultLocalName = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi")?.LocalName ?? "Unknown",
                ScriptText = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi")?.ScriptText ?? string.Empty,
                Latitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.Y : 10.7873,
                Longitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.X : 106.7055,
                RadiusMeters = a.Zone != null ? a.Zone.Radius : 25,
                ZoneName = a.Zone != null ? a.Zone.ZoneCode : "Khu Vực Thảo Cầm Viên"
            };
        }

        public async Task<AnimalDto> CreateAnimalAsync(AnimalCreateDto dto)
        {
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
                DefaultLocalName = content.LocalName,
                ScriptText = content.ScriptText
            };
        }

        public async Task<bool> DeleteAnimalAsync(int id)
        {
            var a = await _animalRepository.GetByIdAsync(id);
            if (a == null) return false;
            await _animalRepository.DeleteAsync(a);
            return true;
        }
    }
}
