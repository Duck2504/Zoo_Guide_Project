using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZooAudioGuide.API.Models // Sửa lại đúng thư mục Models của em
{
    [Table("SCAN_LOGS")]
    public class ScanLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AnimalId { get; set; }

        [ForeignKey("AnimalId")]
        public Animal Animal { get; set; } = null!;

        [Required]
        public DateTime ScannedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(255)]
        public string? UserAgent { get; set; }

        [MaxLength(100)]
        public string SessionId { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Source { get; set; } = string.Empty;

        [MaxLength(10)]
        public string LanguageCode { get; set; } = "vi";
    }
}