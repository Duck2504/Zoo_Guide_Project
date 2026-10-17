namespace ZooAudioGuide.API.DTOs
{
    public class NearbyZoneResponseDto
    {
        public string ZoneCode { get; set; } = string.Empty;
        public string LocalName { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string AudioUrl { get; set; } = string.Empty;
        
        // Trả về khoảng cách thực tế để Frontend hiển thị "Chuồng hổ cách bạn X mét"
        public double DistanceMeters { get; set; } 
    }
}