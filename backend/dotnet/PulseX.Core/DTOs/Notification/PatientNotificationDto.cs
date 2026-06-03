using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Notification
{
    /// <summary>
    /// DTO for patient notifications
    /// </summary>
    public class PatientNotificationDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Type { get; set; } = string.Empty; // HeartRiskAssessment, HealthAlert, AppointmentReminder, PrescriptionReady, GeneralInfo
        public string Priority { get; set; } = string.Empty; // Urgent, High, Normal, Low
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        // Related entity IDs for deep linking
        public int? RelatedRiskAssessmentId { get; set; }
        public int? RelatedAppointmentId { get; set; }
        public int? RelatedPrescriptionId { get; set; }
        
        // Visual/UI hints
        public string? RiskLevel { get; set; } // Low, Medium, High
        public string? ActionUrl { get; set; }
        public string? IconType { get; set; } // success, warning, alert, info
        public string? StatusColor { get; set; } // green, yellow, orange, red
        
        // Actor who triggered this notification (populated for story interactions)
        public string? ActorName { get; set; }
        public string? ActorAvatar { get; set; }

        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }

    /// <summary>
    /// Response DTO for patient notifications list
    /// </summary>
    public class PatientNotificationsResponseDto
    {
        public int UnreadCount { get; set; }
        public int TotalCount { get; set; }
        public List<PatientNotificationDto> Notifications { get; set; } = new();
    }

    /// <summary>
    /// Create notification DTO for internal use
    /// </summary>
    public class CreatePatientNotificationDto
    {
        [JsonPropertyName("patient_id")]
        public int PatientId { get; set; }
        
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;
        
        [JsonPropertyName("priority")]
        public string Priority { get; set; } = string.Empty;
        
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
        
        [JsonPropertyName("related_risk_assessment_id")]
        public int? RelatedRiskAssessmentId { get; set; }
        
        [JsonPropertyName("related_appointment_id")]
        public int? RelatedAppointmentId { get; set; }
        
        [JsonPropertyName("related_prescription_id")]
        public int? RelatedPrescriptionId { get; set; }
        
        [JsonPropertyName("risk_level")]
        public string? RiskLevel { get; set; }
        
        [JsonPropertyName("action_url")]
        public string? ActionUrl { get; set; }
        
        [JsonPropertyName("icon_type")]
        public string? IconType { get; set; }
    }
}
