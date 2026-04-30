using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Auth
{
    public class CreateAdminDto
    {
        // ? Changed: Split FullName into FirstName and LastName
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }

        // ? Helper property for internal use
        [JsonIgnore]
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
}
