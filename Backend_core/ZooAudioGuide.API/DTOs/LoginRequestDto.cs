using System.ComponentModel.DataAnnotations;

namespace ZooAudioGuide.API.DTOs
{
    public class LoginRequestDto
    {
        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Password { get; set; } = string.Empty;
    }
}
