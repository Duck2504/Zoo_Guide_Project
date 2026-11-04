namespace ZooAudioGuide.API.DTOs
{
    public class DashboardOverviewDto
    {
        public int TotalScans { get; set; }
        public int OnlineUsers { get; set; }
        public List<DailyStatDto> DailyStats { get; set; } = new();
        public List<TopAnimalDto> TopAnimals { get; set; } = new();
    }

    public class DailyStatDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class TopAnimalDto
    {
        public int AnimalId { get; set; }
        public string AnimalName { get; set; } = string.Empty;
        public int ScanCount { get; set; }
    }
}