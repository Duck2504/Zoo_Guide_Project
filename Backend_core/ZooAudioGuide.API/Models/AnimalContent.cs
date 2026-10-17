namespace ZooAudioGuide.API.Models
{
    public class AnimalContent
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }

        public string LanguageCode { get; set; } = string.Empty;

        public string LocalName { get; set; } = string.Empty;
        public string ScriptText { get; set; } = string.Empty;
        public string AudioUrl { get; set; } = string.Empty;
        public string SyncStatus { get; set; } = "Pending";

        // Navigation Properties
        public Animal Animal { get; set; } = null!;
        public Language Language { get; set; } = null!;
    }
}