using System.ComponentModel.DataAnnotations;

namespace PulseX.Core.DTOs.Doctor
{
    /// <summary>
    /// DTO for doctor to add/update patient's medical data
    /// </summary>
    public class AddPatientMedicalDataDto
    {
        // Health Information
        public decimal? BodyTemperature { get; set; } // in Celsius
        public decimal? BloodSugar { get; set; } // in mg/dL
        public decimal? Height { get; set; } // in cm
        public decimal? Weight { get; set; } // in kg
        
        // Medical Information
        public string? HeartRate { get; set; } // e.g., "72" or "Low", "Normal", "High"
        public string? BloodPressure { get; set; } // e.g., "120/80"
        public string? BloodCount { get; set; } // e.g., "40%" or "Normal", "Low", "High"
        public decimal? Cholesterol { get; set; } // in mg/dL
    }
}
