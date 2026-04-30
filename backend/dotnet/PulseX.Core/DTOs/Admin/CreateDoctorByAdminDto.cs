namespace PulseX.Core.DTOs.Admin
{
    public class CreateDoctorByAdminDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public decimal ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
    }
}
