namespace ZooAudioGuide.API.DTOs
{
    public class AnimalDto
    {
        public int Id { get; set; }
        public int ZoneId { get; set; }
        public string ScientificName { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        
        // Trả về tên tiếng Việt để FE dễ bề hiển thị danh sách
        public string DefaultLocalName { get; set; } = string.Empty; 
        
        // Bài thuyết minh tiếng Việt
        public string ScriptText { get; set; } = string.Empty;

        // Tọa độ và bán kính lấy từ Zone trong CSDL
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int RadiusMeters { get; set; } = 25;
        public string ZoneName { get; set; } = string.Empty;
    }
}
