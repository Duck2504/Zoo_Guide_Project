using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.DTOs
{
    public class ZoneCreateDto
    {
        [Required]
        public string ZoneCode { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Name { get; set; }

        [Required]
        [Range(-90, 90, ErrorMessage = "Vĩ độ phải trong khoảng -90 đến 90 (có thể bạn đã đảo kinh độ và vĩ độ).")]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180, ErrorMessage = "Kinh độ phải trong khoảng -180 đến 180.")]
        public double Longitude { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Bán kính (Radius) không được phép là số âm.")]
        public int Radius { get; set; }
    }
}