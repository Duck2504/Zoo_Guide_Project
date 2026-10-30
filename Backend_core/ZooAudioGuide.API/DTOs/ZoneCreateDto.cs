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
        [Range(0, int.MaxValue, ErrorMessage = "Bán kính (Radius) không được phép là số âm.")]
        public int Radius { get; set; }
    }
}