using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.Models
{
    public class Language
    {
        [Key]
        [MaxLength(10)]
        public string Code { get; set; } = string.Empty; // 'vi', 'en'...
        
        public string Name { get; set; } = string.Empty;
    }
}