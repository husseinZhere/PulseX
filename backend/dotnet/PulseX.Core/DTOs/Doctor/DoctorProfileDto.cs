namespace PulseX.Core.DTOs.Doctor
{
    /// <summary>
    /// Doctor profile as seen by patients (in Doctor Profile Page)
    /// </summary>
    public class DoctorProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public decimal ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
        public string? Bio { get; set; }
        public int YearsOfExperience { get; set; }
        public string? ProfilePicture { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int TotalPatients { get; set; }

        // Profile Details
        public string? Education { get; set; }
        public List<ProfessionalExperienceItemDto> ProfessionalExperience { get; set; } = new();
        public string? Certifications { get; set; }
        public string? Languages { get; set; }
        public string? AvailableHours { get; set; }

        // For backwards compatibility
        public string About { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;

        // Chat authorization
        public bool CanChat { get; set; }
    }
}
