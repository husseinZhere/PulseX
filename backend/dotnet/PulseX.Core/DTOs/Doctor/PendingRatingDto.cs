namespace PulseX.Core.DTOs.Doctor
{
    /// <summary>
    /// DTO for appointments that need rating (shown in modal)
    /// </summary>
    public class PendingRatingDto
    {
        public int AppointmentId { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string? DoctorProfilePicture { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime CompletedDate { get; set; }
    }
}
