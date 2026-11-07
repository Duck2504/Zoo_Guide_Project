namespace ZooAudioGuide.API.DTOs
{
    public class DashboardOverviewDto
    {
        public int TotalScans { get; set; }
        // Số phiên (SessionId khác nhau) có lượt quét trong 5 phút gần nhất, không phải số người đang mở web
        public int OnlineUsers { get; set; }
        // Đủ 7 ngày theo giờ Việt Nam, ngày không có lượt nào vẫn có mặt với Count = 0; ngày cuối là hôm nay
        public List<DailyStatDto> DailyStats { get; set; } = new();
        public List<TopAnimalDto> TopAnimals { get; set; } = new();
        // Ba bảng dưới tính trong cùng 7 ngày với biểu đồ
        public List<BreakdownDto> ByLanguage { get; set; } = new();
        public List<BreakdownDto> BySource { get; set; } = new();
        public List<BreakdownDto> ByZone { get; set; } = new();
    }

    public class DailyStatDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class TopAnimalDto
    {
        public int AnimalId { get; set; }
        public string AnimalName { get; set; } = string.Empty; // tên tiếng Việt, không có thì tên khoa học
        public string ScientificName { get; set; } = string.Empty;
        public int ScanCount { get; set; }
    }

    // Key là mã (ngôn ngữ, nguồn, id khu; "none" = lượt không gắn con vật nào), Label là tên để hiện nếu có
    public class BreakdownDto
    {
        public string Key { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
