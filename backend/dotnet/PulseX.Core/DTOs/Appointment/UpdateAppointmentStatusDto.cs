using PulseX.Core.Enums;

namespace PulseX.Core.DTOs.Appointment
{
    public class UpdateAppointmentStatusDto
    {
        public AppointmentStatus Status { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
    }
}
