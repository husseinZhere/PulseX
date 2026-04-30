namespace PulseX.Core.DTOs.Doctor
{
    public class SubmitRatingDto
    {
        public int AppointmentId { get; set; }
        public int Rating { get; set; } // 1-5
        public string? Review { get; set; }
    }
}
