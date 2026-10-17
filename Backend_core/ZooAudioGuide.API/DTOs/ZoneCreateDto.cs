using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.DTOs
{
    public class ZoneCreateDto
    {
        [Required]
        public string ZoneCode { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public int Radius { get; set; }
    }
}