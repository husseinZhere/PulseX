using PulseX.Core.Enums;

namespace PulseX.Core.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        
        // Chat expiry date - null means chat not yet activated
        public DateTime? ChatExpiryDate { get; set; }
        
        // Video call availability (within appointment time window)
        public bool IsVideoCallActive { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Patient Patient { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public DoctorRating? Rating { get; set; }
    }
}
