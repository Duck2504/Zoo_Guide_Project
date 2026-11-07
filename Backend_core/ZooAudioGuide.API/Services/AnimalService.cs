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

        public async Task<IEnumerable<AnimalDto>> GetAllAnimalsAsync(string lang = "vi")
        {
            var animals = await _animalRepository.GetAllAsync();
            return animals.Select(a => ToDto(a, lang));
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
            CopyFacts(dto, animal);

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
            CopyFacts(dto, a);

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
        // Nhận client qua tham số (không qua constructor) để các API đọc không phụ thuộc cấu hình microservice.
        public async Task<LangResult[]?> GenerateNarrationAsync(int id, string[] langs, INarrationClient narration)
        {
            var a = await _animalRepository.GetByIdAsync(id);
            if (a == null) return null;

            var vi = a.AnimalContents.FirstOrDefault(c => c.LanguageCode == "vi");
            if (vi == null || string.IsNullOrWhiteSpace(vi.ScriptText))
                throw new InvalidOperationException("Con vật chưa có bài thuyết minh tiếng Việt");

            // Microservice lo dịch/đọc/lưu mp3; phần ghi DB làm ở đây.
            var results = await narration.GenerateAsync(id, vi.ScriptText, langs, name: vi.LocalName, scientificName: a.ScientificName);

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
                // Chỉ thay tên còn trống hoặc còn là bản chép tiếng Việt; tên admin đã sửa thì giữ
                if (r.Lang != "vi" && !string.IsNullOrWhiteSpace(r.TranslatedName) &&
                    (string.IsNullOrWhiteSpace(content.LocalName) || content.LocalName == vi.LocalName))
                    content.LocalName = r.TranslatedName;
                content.ScriptText = r.TranslatedText ?? vi.ScriptText;
                content.AudioUrl = r.AudioUrl ?? "";
                content.SyncStatus = "Done";
            }

            await _animalRepository.SaveChangesAsync();
            return results;
        }

        public async Task<IEnumerable<AnimalContentsDto>> GetAllContentsAsync()
        {
            var animals = await _animalRepository.GetAllAsync();
            return animals.Select(a => new AnimalContentsDto
            {
                AnimalId = a.Id,
                Contents = a.AnimalContents.OrderBy(c => c.LanguageCode == "vi" ? 0 : 1).ThenBy(c => c.LanguageCode)
                    .Select(c => new AnimalContentDto { LanguageCode = c.LanguageCode, LocalName = c.LocalName, ScriptText = c.ScriptText, AudioUrl = c.AudioUrl, SyncStatus = c.SyncStatus })
                    .ToList()
            }).ToList();
        }

        // Lưu bản dịch đã sửa rồi đọc lại đúng chữ đó (không dịch lại). Trả null nếu không có con vật hoặc chưa có dòng ngôn ngữ đó.
        // Tiếng Việt sửa ở form chính, không qua đây.
        public async Task<LangResult?> UpdateContentAsync(int id, string lang, AnimalContentUpdateDto dto, INarrationClient narration)
        {
            if (lang == "vi") throw new InvalidOperationException("Bài tiếng Việt sửa ở form chỉnh sửa con vật");
            var a = await _animalRepository.GetByIdAsync(id);
            var content = a?.AnimalContents.FirstOrDefault(c => c.LanguageCode == lang);
            if (content == null) return null;

            content.LocalName = dto.LocalName.Trim();
            content.ScriptText = dto.ScriptText.Trim();
            var r = (await narration.GenerateAsync(id, content.ScriptText, [lang], textIsFinal: true)).Single();
            if (r.Status == "DONE")
            {
                content.AudioUrl = r.AudioUrl ?? "";
                content.SyncStatus = "Done";
            }
            else content.SyncStatus = "Failed"; // chữ đã lưu, audio cũ không còn khớp: đánh dấu để đọc lại sau

            await _animalRepository.SaveChangesAsync();
            return r;
        }

        private static void CopyFacts(AnimalCreateDto dto, Animal a)
        {
            a.ConservationStatus = dto.ConservationStatus;
            a.Diet = dto.Diet;
            a.Habitat = dto.Habitat;
            a.LifespanYears = dto.LifespanYears;
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
                ConservationStatus = a.ConservationStatus,
                Diet = a.Diet,
                Habitat = a.Habitat,
                LifespanYears = a.LifespanYears,
                DefaultLocalName = content?.LocalName ?? "Unknown",
                ScriptText = content?.ScriptText ?? string.Empty,
                AudioUrl = content?.AudioUrl ?? string.Empty,
                Latitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.Y : 10.7873,
                Longitude = a.Zone != null && a.Zone.Location != null ? a.Zone.Location.X : 106.7055,
                RadiusMeters = a.Zone != null ? a.Zone.Radius : 25,
                ZoneName = a.Zone != null ? (a.Zone.Name ?? a.Zone.ZoneCode) : "Khu Vực Thảo Cầm Viên"
            };
        }
    }
}
