namespace PulseX.Core.Models
{
    public class Patient
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PatientId { get; set; } = string.Empty; // PAT001, PAT002, etc.
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Location { get; set; }
        public string? About { get; set; }
        
        // Account Settings
        public bool EmailNotificationsEnabled { get; set; } = true;
        public bool DarkModeEnabled { get; set; } = false;

        // QR Code (for emergency access to medical records)
        public string? QRCodeData { get; set; }
        public DateTime? QRCodeGeneratedAt { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public ICollection<HealthData> HealthData { get; set; } = new List<HealthData>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<Story> Stories { get; set; } = new List<Story>();
        public ICollection<DoctorRating> DoctorRatings { get; set; } = new List<DoctorRating>();
    }
}
