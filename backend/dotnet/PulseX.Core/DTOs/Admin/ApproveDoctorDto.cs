namespace PulseX.Core.DTOs.Admin
{
    public class ApproveDoctorDto
    {
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
    }
}
