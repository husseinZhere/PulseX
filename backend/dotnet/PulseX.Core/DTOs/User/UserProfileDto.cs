namespace PulseX.Core.DTOs.User
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        
        // Patient-specific fields
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? BloodType { get; set; }
        
        // Doctor-specific fields
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
        public decimal? ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
        public string? Bio { get; set; }
        public int? YearsOfExperience { get; set; }
    }
}
