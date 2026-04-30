using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Auth
{
    public class CreateDoctorDto
    {
        // Personal Information
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }

        // Professional Information
        public decimal ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }

        // Profile Picture (will be handled separately via file upload)
        public string? ProfilePicturePath { get; set; }

        // ? Helper property for internal use
        [JsonIgnore]
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
}
