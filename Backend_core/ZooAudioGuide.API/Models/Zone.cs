using NetTopologySuite.Geometries;

namespace ZooAudioGuide.API.Models
{
    public class Zone
    {
        public int Id { get; set; }
        public string ZoneCode { get; set; } = string.Empty;
        
        // Kiểu dữ liệu không gian (Spatial Data) để lưu Vĩ độ / Kinh độ
        public Point Location { get; set; } = null!;
        
        public int Radius { get; set; } = 15;
    }
}