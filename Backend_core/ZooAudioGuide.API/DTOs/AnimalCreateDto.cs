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

        [Required]
        public string LocalName { get; set; } = string.Empty; 
        
        [Required]
        public string ScriptText { get; set; } = string.Empty;
    }
}