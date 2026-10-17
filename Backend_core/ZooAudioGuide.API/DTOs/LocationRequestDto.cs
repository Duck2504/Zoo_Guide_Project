using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.DTOs
{
    public class LocationRequestDto
    {
        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        // Nếu Frontend không truyền ngôn ngữ, mặc định sẽ phát tiếng Việt
        public string LanguageCode { get; set; } = "vi"; 
    }
}