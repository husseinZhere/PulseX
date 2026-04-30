namespace PulseX.Core.Models
{
    public class Prescription
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public int? AppointmentId { get; set; }
        
        // Medications (stored as JSON)
        public string MedicationsJson { get; set; } = "[]";
        
        // Lab & Radiology Requests (stored as JSON)
        public string LabRequestsJson { get; set; } = "[]";
        
        // Clinical Notes
        public string? ClinicalNotes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public Doctor Doctor { get; set; } = null!;
        public Patient Patient { get; set; } = null!;
        public Appointment? Appointment { get; set; }
    }

    // Helper classes for JSON serialization
    public class Medication
    {
        public string DrugName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
    }

    public class LabRequest
    {
        public string TestName { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
    }
}
