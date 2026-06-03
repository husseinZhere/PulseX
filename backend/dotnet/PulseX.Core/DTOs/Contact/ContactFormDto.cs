using System.ComponentModel.DataAnnotations;

namespace PulseX.Core.DTOs.Contact
{
    public class ContactFormDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required, MinLength(20), MaxLength(2000)]
        public string Message { get; set; } = string.Empty;
    }
}
