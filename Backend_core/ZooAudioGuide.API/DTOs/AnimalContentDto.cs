using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.DTOs
{
    // Nội dung từng ngôn ngữ của một con vật, cho trang quản trị (API công khai tự lùi về tiếng Việt nên không thấy được chỗ thiếu)
    public class AnimalContentDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string LocalName { get; set; } = string.Empty;
        public string ScriptText { get; set; } = string.Empty;
        public string AudioUrl { get; set; } = string.Empty;
        public string SyncStatus { get; set; } = string.Empty;
    }

    public class AnimalContentsDto
    {
        public int AnimalId { get; set; }
        public List<AnimalContentDto> Contents { get; set; } = new();
    }

    // Sửa bản dịch một ngôn ngữ (không phải tiếng Việt) rồi đọc lại audio đúng chữ đó
    public class AnimalContentUpdateDto
    {
        [Required, MaxLength(200)]
        public string LocalName { get; set; } = string.Empty;

        [Required, MaxLength(5000)]
        public string ScriptText { get; set; } = string.Empty;
    }
}
