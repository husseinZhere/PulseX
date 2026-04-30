namespace PulseX.Core.Models
{
    public class DoctorRating
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public int AppointmentId { get; set; }
        public int Rating { get; set; } // 1-5 stars
        public string? Review { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Doctor Doctor { get; set; } = null!;
        public Patient Patient { get; set; } = null!;
        public Appointment Appointment { get; set; } = null!;
    }
}
