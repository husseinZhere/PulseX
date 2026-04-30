namespace PulseX.Core.Models
{
    public class DoctorNotification
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        
        // Notification Type: AIRiskAlert, AbnormalVitals, UrgentMessage, LabResults
        public string Type { get; set; } = string.Empty;
        
        // Priority: Urgent, High, Normal
        public string Priority { get; set; } = string.Empty;
        
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        // Related entities
        public int? RelatedPatientId { get; set; }
        public int? RelatedAppointmentId { get; set; }
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public Doctor Doctor { get; set; } = null!;
        public Patient? RelatedPatient { get; set; }
        public Appointment? RelatedAppointment { get; set; }
    }
}
