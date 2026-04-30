using PulseX.Core.Enums;

namespace PulseX.Core.DTOs.Appointment
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int PatientUserId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientAvatar { get; set; }
        public int DoctorId { get; set; }
        public int DoctorUserId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string? DoctorAvatar { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public string? ClinicLocation { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime? ChatExpiryDate { get; set; }
        public bool CanChat { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
