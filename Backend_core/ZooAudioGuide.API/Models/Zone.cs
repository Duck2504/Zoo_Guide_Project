using NetTopologySuite.Geometries;
using System.Collections.Generic;

namespace ZooAudioGuide.API.Models
{
    public class Zone
    {
        public int Id { get; set; }
        public string ZoneCode { get; set; } = string.Empty;

        // Tên hiển thị cho du khách (vd "Khu Bò sát"); null thì dùng ZoneCode
        public string? Name { get; set; }

        public Point Location { get; set; } = null!;

        public int Radius { get; set; } = 15;

        public ICollection<Animal> Animals { get; set; } = new List<Animal>();
    }
}