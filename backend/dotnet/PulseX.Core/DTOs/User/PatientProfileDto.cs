namespace PulseX.Core.DTOs.User
{
    public class PatientProfileDto
    {
        // User Info
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
        
        // Patient Info
        public string PatientId { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Location { get; set; }
        public string? About { get; set; }
        public int? Age { get; set; }
        
        // Health Information (from Doctor/Patient)
        public HealthInformationDto? HealthInformation { get; set; }
        
        // Account Settings
        public bool EmailNotificationsEnabled { get; set; }
        public bool DarkModeEnabled { get; set; }
    }
}
