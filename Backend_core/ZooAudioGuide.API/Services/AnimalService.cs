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
            return animals.Select(a => ToDto(a));
        }

        public async Task<AnimalDto?> GetAnimalByIdAsync(int id, string lang = "vi")
        {
            var a = await _animalRepository.GetByIdAsync(id);
            return a == null ? null : ToDto(a, lang);
        }

        public async Task<AnimalDto> CreateAnimalAsync(AnimalCreateDto dto)
        {
            var animal = new Animal
            {
                ZoneId = dto.ZoneId,
                ScientificName = dto.ScientificName,
                AvatarUrl = dto.AvatarUrl
            };

            animal.AnimalContents.Add(new AnimalContent
            {
                LanguageCode = "vi",
                LocalName = dto.LocalName,
                ScriptText = dto.ScriptText,
                AudioUrl = "",
                SyncStatus = "Pending"
            });

            await _animalRepository.AddAsync(animal);
            await _animalRepository.SaveChangesAsync();

            return ToDto(animal);
        }

        public async Task<bool> UpdateAnimalAsync(int id, AnimalCreateDto dto)
        {
            var a = await _animalRepository.GetByIdAsync(id);
            if (a == null) return false;

            a.ZoneId = dto.ZoneId;
            a.ScientificName = dto.ScientificName;
            a.AvatarUrl = dto.AvatarUrl;

            var vi = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi");
            if (vi == null)
            {
                vi = new AnimalContent { LanguageCode = "vi", AudioUrl = "" };
                a.AnimalContents.Add(vi);
            }
            var scriptChanged = vi.ScriptText != dto.ScriptText;
            vi.LocalName = dto.LocalName;
            vi.ScriptText = dto.ScriptText;

            // Bài gốc đổi thì mọi audio/bản dịch đã cũ: giữ link cũ để vẫn nghe được, đánh dấu chờ tạo lại
            if (scriptChanged)
                foreach (var c in a.AnimalContents) c.SyncStatus = "Pending";

            await _animalRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAnimalAsync(int id)
        {
            var a = await _animalRepository.GetByIdAsync(id);
            if (a == null) return false;
            await _animalRepository.DeleteAsync(a);
            return true;
        }

        // Tạo mp3 cho từng ngôn ngữ từ bài tiếng Việt trong DB, rồi lưu bản dịch + link audio vào AnimalContents.
        // Trả null nếu không có con vật; ném InvalidOperationException nếu chưa có bài tiếng Việt.
        // Nhận generator qua tham số (không qua constructor) để các API đọc không phụ thuộc cấu hình Supabase.
        public async Task<LangResult[]?> GenerateNarrationAsync(int id, string[] langs, NarrationGenerator narration)
        {
            var a = await _animalRepository.GetByIdAsync(id);
            if (a == null) return null;

            var vi = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi");
            if (vi == null || string.IsNullOrWhiteSpace(vi.ScriptText))
                throw new InvalidOperationException("Con vật chưa có bài thuyết minh tiếng Việt");

            // Phần gọi Gemini/edge-tts/Supabase chạy song song; phần ghi DB làm tuần tự bên dưới.
            var results = await Task.WhenAll(langs.Select(l => narration.GenerateAsync(id, vi.ScriptText, l)));

            foreach (var r in results)
            {
                var content = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == r.Lang);
                if (r.Status != "DONE")
                {
                    if (content != null) content.SyncStatus = "Failed";
                    continue;
                }

                if (content == null)
                {
                    await _animalRepository.EnsureLanguageAsync(r.Lang);
                    content = new AnimalContent { LanguageCode = r.Lang, LocalName = vi.LocalName };
                    a.AnimalContents.Add(content);
                }
                content.ScriptText = r.TranslatedText ?? vi.ScriptText;
                content.AudioUrl = r.AudioUrl ?? "";
                content.SyncStatus = "Done";
            }

            await _animalRepository.SaveChangesAsync();
            return results;
        }

        // Lấy nội dung theo ngôn ngữ yêu cầu, không có thì dùng bản tiếng Việt.
        private static AnimalDto ToDto(Animal a, string lang = "vi")
        {
            var content = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == lang)
                       ?? a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi");

            return new AnimalDto
            {
                Id = a.Id,
                ZoneId = a.ZoneId,
                ScientificName = a.ScientificName,
                AvatarUrl = a.AvatarUrl,
                DefaultLocalName = content?.LocalName ?? "Unknown",
                ScriptText = content?.ScriptText ?? string.Empty,
                AudioUrl = content?.AudioUrl ?? string.Empty,
                Latitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.Y : 10.7873,
                Longitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.X : 106.7055,
                RadiusMeters = a.Zone != null ? a.Zone.Radius : 25,
                ZoneName = a.Zone != null ? a.Zone.ZoneCode : "Khu Vực Thảo Cầm Viên"
            };
        }
    }
}
