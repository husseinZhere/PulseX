using System.ComponentModel.DataAnnotations;

namespace PulseX.Core.DTOs.Doctor
{
    public class ProfessionalExperienceItemDto
    {
        public string? Type { get; set; }
        public string? Institution { get; set; }
        public string? Title { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? Description { get; set; }
    }

    /// <summary>
    /// DTO for Doctor to update their profile in Settings page
    /// </summary>
    public class UpdateDoctorProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }

        [MaxLength(100)]
        public string? Specialization { get; set; }

        [MaxLength(50)]
        public string? LicenseNumber { get; set; }

        [Range(0, 10000)]
        public decimal? ConsultationPrice { get; set; }

        [MaxLength(200)]
        public string? ClinicLocation { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        [Range(0, 50)]
        public int? YearsOfExperience { get; set; }

        // Profile Details
        [MaxLength(500)]
        public string? Education { get; set; }

        // Structured list — serialized to JSON before storing in the DB column
        public List<ProfessionalExperienceItemDto> ProfessionalExperience { get; set; } = new();

        [MaxLength(1000)]
        public string? Certifications { get; set; }

        [MaxLength(100)]
        public string? Languages { get; set; }

        [MaxLength(200)]
        public string? AvailableHours { get; set; }
    }
}

