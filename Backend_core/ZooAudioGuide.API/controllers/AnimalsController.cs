using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System.Collections.Generic;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Filters;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.API.Controllers
{
    [Route("api/[controller]")]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AnimalsController : ControllerBase
    {
        // Tag chung của cache API công khai (con vật, khu, ngôn ngữ); admin sửa gì cũng xóa cả tag vì DTO con vật chứa cả thông tin khu
        public const string CacheTag = "public-data";
        public const int CacheSeconds = 60;

        private readonly IAnimalService _animalService;
        private readonly IOutputCacheStore _cache;

        public AnimalsController(IAnimalService animalService, IOutputCacheStore cache)
        {
            _animalService = animalService;
            _cache = cache;
        }

        // default thay vì RequestAborted: DB đã lưu rồi, admin đóng tab cũng phải xóa cache
        private Task EvictCacheAsync() => _cache.EvictByTagAsync(CacheTag, default).AsTask();

        [HttpGet]
        [OutputCache(Duration = CacheSeconds, Tags = [CacheTag], VaryByQueryKeys = ["lang"])]
        public async Task<ActionResult<IEnumerable<AnimalDto>>> GetAnimals([FromQuery] string lang = "vi")
        {
            var animals = await _animalService.GetAllAnimalsAsync(lang);
            return Ok(animals);
        }

        [HttpGet("{id}")]
        [OutputCache(Duration = CacheSeconds, Tags = [CacheTag], VaryByQueryKeys = ["lang"])]
        public async Task<ActionResult<AnimalDto>> GetAnimal(int id, [FromQuery] string lang = "vi")
        {
            var animal = await _animalService.GetAnimalByIdAsync(id, lang);
            if (animal == null) return NotFound();
            return Ok(animal);
        }

        // Body: ["vi","en","ja","ko"]. Văn bản lấy từ bài tiếng Việt trong DB, không nhận text từ client.
        [HttpPost("{id}/narration")]
        [AdminKey]
        public async Task<IActionResult> GenerateNarration(int id, [FromBody] string[] targetLangs, [FromServices] INarrationClient narration)
        {
            var langs = (targetLangs ?? []).Distinct().ToArray();
            if (langs.Length == 0) return BadRequest("Thiếu danh sách ngôn ngữ");

            try
            {
                var results = await _animalService.GenerateNarrationAsync(id, langs, narration);
                if (results == null) return NotFound();
                await EvictCacheAsync();
                return Ok(new { animalId = id, results });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Nội dung từng ngôn ngữ của mọi con vật (trạng thái audio, nghe lại, xem bản dịch)
        [HttpGet("contents")]
        [AdminKey]
        public async Task<ActionResult<IEnumerable<AnimalContentsDto>>> GetContents() =>
            Ok(await _animalService.GetAllContentsAsync());

        [HttpPut("{id}/contents/{lang}")]
        [AdminKey]
        public async Task<IActionResult> UpdateContent(int id, string lang, AnimalContentUpdateDto dto, [FromServices] INarrationClient narration)
        {
            try
            {
                var result = await _animalService.UpdateContentAsync(id, lang, dto, narration);
                if (result == null) return NotFound();
                await EvictCacheAsync(); // chữ đã lưu kể cả khi đọc lỗi
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        public const int MaxImageBytes = 5 * 1024 * 1024;

        // Ảnh con vật: chỉ JPG/PNG/WebP, nhận dạng từ chính nội dung file (không tin tên file hay Content-Type của trình duyệt)
        [HttpPost("image")]
        [AdminKey]
        [RequestSizeLimit(MaxImageBytes + 64 * 1024)]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromServices] INarrationClient narration)
        {
            if (file == null || file.Length == 0 || file.Length > MaxImageBytes) return BadRequest("Ảnh trống hoặc lớn hơn 5 MB");
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var bytes = ms.ToArray();
            var type = ImageType(bytes);
            if (type == null) return BadRequest("Chỉ nhận ảnh JPG, PNG hoặc WebP");

            var (url, error) = await narration.UploadImageAsync(bytes, type);
            return url != null ? Ok(new { url }) : StatusCode(502, error);
        }

        public static string? ImageType(byte[] b) =>
            b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF ? "image/jpeg"
            : b.Length >= 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47 ? "image/png"
            : b.Length >= 12 && b[0] == (byte)'R' && b[1] == (byte)'I' && b[2] == (byte)'F' && b[3] == (byte)'F'
              && b[8] == (byte)'W' && b[9] == (byte)'E' && b[10] == (byte)'B' && b[11] == (byte)'P' ? "image/webp"
            : null;

        [HttpPost]
        [AdminKey]
        public async Task<ActionResult<AnimalDto>> CreateAnimal(AnimalCreateDto dto)
        {
            var createdAnimal = await _animalService.CreateAnimalAsync(dto);
            await EvictCacheAsync();
            return Ok(createdAnimal);
        }

        [HttpPut("{id}")]
        [AdminKey]
        public async Task<IActionResult> UpdateAnimal(int id, AnimalCreateDto dto)
        {
            var result = await _animalService.UpdateAnimalAsync(id, dto);
            if (!result) return NotFound();
            await EvictCacheAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [AdminKey]
        public async Task<IActionResult> DeleteAnimal(int id)
        {
            var result = await _animalService.DeleteAnimalAsync(id);
            if (!result) return NotFound();
            await EvictCacheAsync();
            return NoContent();
        }
    }
}
