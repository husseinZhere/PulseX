namespace PulseX.Core.DTOs.User
{
    /// <summary>
    /// DTO for updating patient health data from Settings page
    /// </summary>
    public class UpdateHealthDataDto
    {
        // Dropdown selections (for AI Risk Assessment)
        public string? HeartRate { get; set; } // "Low", "Normal", "Slightly High", "High"
        public string? BloodPressure { get; set; } // "Low", "Normal", "Pre-Hypertension", "High � Stage 1", "High � Stage 2"
        public string? BloodCount { get; set; } // "Low", "Normal", "High"
        
        // Manual inputs
        public decimal? Height { get; set; } // in cm
        public decimal? Weight { get; set; } // in kg
        public decimal? BloodSugar { get; set; } // in mg/dL
        public decimal? Cholesterol { get; set; } // in mg/dL
    }

    /// <summary>
    /// DTO for displaying health information in Settings page
    /// </summary>
    public class HealthInformationDto
    {
        public decimal? Height { get; set; }
        public string HeightDisplay => Height.HasValue ? $"{Height} cm" : "Not set";
        
        public decimal? Weight { get; set; }
        public string WeightDisplay => Weight.HasValue ? $"{Weight} kg" : "Not set";
        
        public string? BloodPressure { get; set; }
        public string BloodPressureDisplay => !string.IsNullOrEmpty(BloodPressure) ? BloodPressure : "Not set";
        
        public decimal? BloodSugar { get; set; }
        public string BloodSugarDisplay => BloodSugar.HasValue ? $"{BloodSugar} mg/dL" : "Not set";

        public decimal? Cholesterol { get; set; }
        public string CholesterolDisplay => Cholesterol.HasValue ? $"{Cholesterol} mg/dL" : "Not set";
        
        public string? BloodCount { get; set; }
        public string BloodCountDisplay => !string.IsNullOrEmpty(BloodCount) ? BloodCount : "Not set";
        
        public string? HeartRate { get; set; }
        public string HeartRateDisplay => !string.IsNullOrEmpty(HeartRate) ? HeartRate : "Not set";
        
        public DateTime? LastUpdated { get; set; }
        public bool HasHealthData { get; set; }
    }

    /// <summary>
    /// Options for dropdowns (for frontend)
    /// </summary>
    public class HealthDataOptionsDto
    {
        public List<string> HeartRateOptions { get; set; } = new()
        {
            "Low (< 60 bpm)",
            "Normal (60�100 bpm)",
            "Slightly High (101�120 bpm)",
            "High (> 120 bpm)"
        };

        public List<string> BloodPressureOptions { get; set; } = new()
        {
            "Low (< 90/60 mmHg)",
            "Normal (90�120 / 60�80 mmHg)",
            "Pre-Hypertension (120�139 / 80�89 mmHg)",
            "High � Stage 1 (140�159 / 90�99 mmHg)",
            "High � Stage 2 (? 160 / ? 100 mmHg)"
        };

        public List<string> BloodCountOptions { get; set; } = new()
        {
            "Low (< 30%)",
            "Normal (30%�45%)",
            "High (> 45%)"
        };
    }
}
