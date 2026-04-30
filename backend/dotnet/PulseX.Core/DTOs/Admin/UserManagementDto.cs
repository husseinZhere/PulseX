namespace PulseX.Core.DTOs.Admin
{
    public class UserManagementDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ProfilePicture { get; set; }
        public decimal? ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
        public string? Gender { get; set; }
    }
}
