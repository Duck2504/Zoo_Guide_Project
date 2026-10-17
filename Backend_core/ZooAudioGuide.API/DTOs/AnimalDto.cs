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
    }
}