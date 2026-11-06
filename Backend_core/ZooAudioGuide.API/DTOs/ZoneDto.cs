namespace ZooAudioGuide.API.DTOs
{
    public class ZoneDto
    {
        public int Id { get; set; }
        public string ZoneCode { get; set; } = string.Empty;
        public string? Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int Radius { get; set; }
    }
}