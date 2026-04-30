namespace PulseX.Core.DTOs.Doctor
{
    /// <summary>
    /// Patient list item for doctor's patient list page
    /// </summary>
    public class DoctorPatientListItemDto
    {
        public int PatientId { get; set; }
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string VisitType { get; set; } = string.Empty; // "Online" or "Clinic"
        public string ChatStatus { get; set; } = string.Empty; // "Open Chat", "3 days left", "Expired"
        public bool CanChat { get; set; }
        public string RiskLevel { get; set; } = string.Empty; // "Low", "Moderate", "High"
        public decimal? RiskScore { get; set; }
        public DateTime? LastVisit { get; set; }
        public string LastVisitRelative { get; set; } = string.Empty; // "Today", "2 days ago"
    }
}
