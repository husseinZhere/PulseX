namespace PulseX.Core.Models
{
    public class PatientNotification
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        
        // Notification Type: HeartRiskAssessment, HealthAlert, AppointmentReminder, PrescriptionReady, GeneralInfo
        public string Type { get; set; } = string.Empty;
        
        // Priority: Urgent, High, Normal, Low
        public string Priority { get; set; } = string.Empty;
        
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        // Related entities for deep linking
        public int? RelatedRiskAssessmentId { get; set; }
        public int? RelatedAppointmentId { get; set; }
        public int? RelatedPrescriptionId { get; set; }
        
        // Visual/UI hints based on risk level
        public string? RiskLevel { get; set; } // Low, Medium, High (for visual styling)
        public string? ActionUrl { get; set; } // Deep link URL for mobile/web
        public string? IconType { get; set; } // Icon to display: success, warning, alert, info
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public Patient Patient { get; set; } = null!;
        public RiskAssessment? RelatedRiskAssessment { get; set; }
        public Appointment? RelatedAppointment { get; set; }
        public Prescription? RelatedPrescription { get; set; }
    }
}
