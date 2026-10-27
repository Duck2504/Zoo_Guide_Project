using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ZooAudioGuide.API.DTOs;
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
        public async Task<ActionResult<AnimalDto>> GetAnimal(int id)
        {
            var animal = await _animalService.GetAnimalByIdAsync(id);
            if (animal == null) return NotFound();
            return Ok(animal);
        }

        [HttpPost]
        public async Task<ActionResult<AnimalDto>> CreateAnimal(AnimalCreateDto dto)
        {
            var createdAnimal = await _animalService.CreateAnimalAsync(dto);
            return Ok(createdAnimal);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnimal(int id)
        {
            var result = await _animalService.DeleteAnimalAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
