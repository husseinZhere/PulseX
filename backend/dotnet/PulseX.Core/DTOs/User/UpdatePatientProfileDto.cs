namespace PulseX.Core.DTOs.User
{
    public class UpdatePatientProfileDto
    {
        // Personal Information
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Location { get; set; }
        public string? Gender { get; set; }
        
        // About Section
        public string? About { get; set; }
        
        // Profile Picture (URL will be set after upload)
        public string? ProfilePicture { get; set; }
    }
}
