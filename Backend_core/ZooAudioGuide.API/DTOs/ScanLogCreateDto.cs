using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.DTOs
{
    public class ScanLogCreateDto
    {
        public int? AnimalId { get; set; }
        [MaxLength(100)] // khớp độ dài cột trong ScanLog
        public string SessionId { get; set; } = string.Empty;
        [MaxLength(20)]
        public string Source { get; set; } = string.Empty; // "QR" hoặc "GEO"
        [MaxLength(10)]
        public string LanguageCode { get; set; } = "vi";
    }
}