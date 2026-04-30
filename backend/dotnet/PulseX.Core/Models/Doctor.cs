namespace PulseX.Core.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public decimal ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
        public string? Bio { get; set; }
        public int YearsOfExperience { get; set; }
        public string? ProfilePicture { get; set; }
        public string? Gender { get; set; }
        
        // ?? Profile Details (for Doctor Profile Page)
        public string? Education { get; set; } // e.g., "M.D. Cairo University, Faculty of Medicine (2008-2014)"
        public string? ProfessionalExperience { get; set; } // JSON string: [{"title": "Senior Cardiologist", "institution": "Cairo Heart Institute", "yearFrom": 2018, "yearTo": null}]
        public string? Certifications { get; set; } // e.g., "Board Certified in Cardiovascular Disease\nFellow of the American College of Cardiology (FACC)\nAdvanced Cardiac Life Support (ACLS) Certified"
        public string? Languages { get; set; } // e.g., "Arabic, English"
        public string? AvailableHours { get; set; } // e.g., "Sun-Thu: 9:00 AM - 5:00 PM"
        
        // Approval fields
        public bool IsApproved { get; set; } = false;
        public int? ApprovedByAdminId { get; set; }
        public DateTime? ApprovedAt { get; set; }
        
        // Rating fields
        public decimal AverageRating { get; set; } = 0;
        public int TotalRatings { get; set; } = 0;

        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<DoctorRating> Ratings { get; set; } = new List<DoctorRating>();
        public ICollection<DoctorScheduleSlot> ScheduleSlots { get; set; } = new List<DoctorScheduleSlot>();
    }
}
