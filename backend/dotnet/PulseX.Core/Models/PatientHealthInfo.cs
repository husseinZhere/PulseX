namespace PulseX.Core.Models
{
    /// <summary>
    /// Patient Health Information - stores vital signs and measurements
    /// Used in Settings & Profile and Update Health Data pages
    /// </summary>
    public class PatientHealthInfo
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        
        // Vital Signs (Dropdown selections)
        public string? HeartRate { get; set; } // "Low (< 60 bpm)", "Normal (60–100 bpm)", etc.
        public string? BloodPressure { get; set; } // "Low (< 90/60 mmHg)", "Normal (90–120 / 60–80 mmHg)", etc.
        public string? BloodCount { get; set; } // "Low (< 30%)", "Normal (30%–45%)", "High (> 45%)"
        
        // Physical Measurements (Manual inputs)
        public decimal? Height { get; set; } // in cm
        public decimal? Weight { get; set; } // in kg
        public decimal? BloodSugar { get; set; } // in mg/dL
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public Patient Patient { get; set; } = null!;
    }
}
