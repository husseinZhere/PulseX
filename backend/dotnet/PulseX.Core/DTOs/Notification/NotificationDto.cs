using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Notification
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string Type { get; set; } = string.Empty; // AIRiskAlert, AbnormalVitals, UrgentMessage, LabResults
        public string Priority { get; set; } = string.Empty; // Urgent, High, Normal
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int? RelatedPatientId { get; set; }
        public string? PatientName { get; set; }
        public int? RelatedAppointmentId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DoctorNotificationsResponseDto
    {
        public int UnreadCount { get; set; }
        public List<NotificationDto> Notifications { get; set; } = new();
    }

    public class CreateNotificationDto
    {
        [JsonPropertyName("doctor_id")]
        public int DoctorId { get; set; }
        
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;
        
        [JsonPropertyName("priority")]
        public string Priority { get; set; } = string.Empty;
        
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
        
        [JsonPropertyName("related_patient_id")]
        public int? RelatedPatientId { get; set; }
        
        [JsonPropertyName("related_appointment_id")]
        public int? RelatedAppointmentId { get; set; }
    }
}
