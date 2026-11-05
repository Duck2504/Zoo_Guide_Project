using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.DTOs
{
    public class AnimalCreateDto
    {
        [Required]
        public int ZoneId { get; set; }

        [Required]
        public string ScientificName { get; set; } = string.Empty;
        
        public string AvatarUrl { get; set; } = string.Empty;

        public string LocalName { get; set; } = string.Empty; 
        
        public string ScriptText { get; set; } = string.Empty;

        // Chỉ nhận các mã frontend biết dịch
        [AllowedValues(null, "LC", "NT", "VU", "EN", "CR", "EW")]
        public string? ConservationStatus { get; set; }

        [AllowedValues(null, "carnivore", "herbivore", "omnivore")]
        public string? Diet { get; set; }

        [AllowedValues(null, "rainforest", "forest", "savanna", "wetland", "coast")]
        public string? Habitat { get; set; }

        [Range(1, 200)]
        public int? LifespanYears { get; set; }
    }
}