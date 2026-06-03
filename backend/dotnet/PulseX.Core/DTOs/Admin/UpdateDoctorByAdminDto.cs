namespace PulseX.Core.DTOs.Admin
{
    public class UpdateDoctorByAdminDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public decimal? ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
        public bool? IsActive { get; set; }
        public string? Password { get; set; }
    }
}
