using PulseX.Core.Enums;
using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Appointment
{
    public class CreateAppointmentDto
    {
        [JsonPropertyName("doctor_id")]
        public int DoctorId { get; set; }
        
        [JsonPropertyName("appointment_date")]
        public DateTime AppointmentDate { get; set; }
        
        [JsonPropertyName("time_slot")]
        public string TimeSlot { get; set; } = string.Empty;
        
        [JsonPropertyName("notes")]
        public string? Notes { get; set; }
        
        [JsonPropertyName("payment_method")]
        public PaymentMethod PaymentMethod { get; set; }
        
        [JsonPropertyName("card_number")]
        public string? CardNumber { get; set; }
        
        [JsonPropertyName("card_holder")]
        public string? CardHolder { get; set; }
    }

    public class AppointmentResponseDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public DateTime? ChatExpiryDate { get; set; }
        public bool IsVideoCallActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AvailableSlotsDto
    {
        public DateTime Date { get; set; }
        public List<TimeSlotDto> AvailableSlots { get; set; } = new();
    }

    public class TimeSlotDto
    {
        public string Time { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
    }

    public class BookingSummaryDto
    {
        public int AppointmentId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public DateTime? ChatExpiryDate { get; set; }
        public bool CanChat { get; set; }
        public bool IsVideoCallActive { get; set; }
        public string ChatMessage { get; set; } = string.Empty;
    }

    public class ActivateChatDto
    {
        public int AppointmentId { get; set; }
        public int ExpiryDays { get; set; } = 7;
    }
}
