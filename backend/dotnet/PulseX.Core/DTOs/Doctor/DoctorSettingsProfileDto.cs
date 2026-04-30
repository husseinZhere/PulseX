namespace PulseX.Core.DTOs.Doctor
{
    /// <summary>
    /// Response DTO when Doctor views their own profile (in Settings)
    /// </summary>
    public class DoctorSettingsProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        
        // Doctor-specific fields
        public string Specialization { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public decimal ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
        public string? Bio { get; set; }
        public int YearsOfExperience { get; set; }
        
        // Profile Details
        public string? Education { get; set; }
        public List<ProfessionalExperienceItemDto> ProfessionalExperience { get; set; } = new();
        public string? Certifications { get; set; }
        public string? Languages { get; set; }
        public string? AvailableHours { get; set; }
        
        // Stats
        public decimal AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public bool IsApproved { get; set; }
    }
}
