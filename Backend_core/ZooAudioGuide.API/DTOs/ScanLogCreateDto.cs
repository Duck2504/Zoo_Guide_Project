namespace ZooAudioGuide.API.DTOs
{
    public class ScanLogCreateDto
    {
        public int? AnimalId { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty; // "QR" hoặc "GEO"
        public string LanguageCode { get; set; } = "vi";
    }
}