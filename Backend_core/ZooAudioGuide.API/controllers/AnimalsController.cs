using Microsoft.AspNetCore.Mvc;
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
        private readonly IAnimalService _animalService;

        public AnimalsController(IAnimalService animalService)
        {
            _animalService = animalService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AnimalDto>>> GetAnimals()
        {
            var animals = await _animalService.GetAllAnimalsAsync();
            return Ok(animals);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AnimalDto>> GetAnimal(int id, [FromQuery] string lang = "vi")
        {
            var animal = await _animalService.GetAnimalByIdAsync(id, lang);
            if (animal == null) return NotFound();
            return Ok(animal);
        }

        // Body: ["vi","en","ja","ko"]. Văn bản lấy từ bài tiếng Việt trong DB, không nhận text từ client.
        [HttpPost("{id}/narration")]
        [AdminKey]
        public async Task<IActionResult> GenerateNarration(int id, [FromBody] string[] targetLangs, [FromServices] NarrationGenerator narration)
        {
            var langs = (targetLangs ?? []).Distinct().ToArray();
            if (langs.Length == 0) return BadRequest("Thiếu danh sách ngôn ngữ");

            var bad = langs.Where(l => !EdgeTtsService.IsSupported(l)).ToArray();
            if (bad.Length > 0) return BadRequest($"Chưa hỗ trợ: {string.Join(", ", bad)}");

            try
            {
                var results = await _animalService.GenerateNarrationAsync(id, langs, narration);
                if (results == null) return NotFound();
                return Ok(new { animalId = id, results });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [AdminKey]
        public async Task<ActionResult<AnimalDto>> CreateAnimal(AnimalCreateDto dto)
        {
            var createdAnimal = await _animalService.CreateAnimalAsync(dto);
            return Ok(createdAnimal);
        }

        [HttpPut("{id}")]
        [AdminKey]
        public async Task<IActionResult> UpdateAnimal(int id, AnimalCreateDto dto)
        {
            var result = await _animalService.UpdateAnimalAsync(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [AdminKey]
        public async Task<IActionResult> DeleteAnimal(int id)
        {
            var result = await _animalService.DeleteAnimalAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
