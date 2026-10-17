using System.Collections.Generic;

namespace ZooAudioGuide.API.Models
{
    public class Animal
    {
        public int Id { get; set; }
        public int ZoneId { get; set; } // Khóa ngoại trỏ về Zone
        
        public string ScientificName { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;

        // Navigation Properties
        public Zone Zone { get; set; } = null!; 
        public ICollection<AnimalContent> AnimalContents { get; set; } = new List<AnimalContent>();
    }
}