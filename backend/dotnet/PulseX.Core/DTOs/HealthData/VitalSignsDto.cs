using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.HealthData
{
    public class AddVitalSignsDto
    {
        // Health Information
        [JsonPropertyName("body_temperature")]
        public decimal? BodyTemperature { get; set; }
        
        [JsonPropertyName("blood_sugar")]
        public decimal? BloodSugar { get; set; }
        
        [JsonPropertyName("height")]
        public decimal? Height { get; set; }
        
        [JsonPropertyName("weight")]
        public decimal? Weight { get; set; }

        // Medical Information
        [JsonPropertyName("heart_rate")]
        public string? HeartRate { get; set; }
        
        [JsonPropertyName("blood_pressure")]
        public string? BloodPressure { get; set; }
        
        [JsonPropertyName("blood_count")]
        public string? BloodCount { get; set; }
        
        [JsonPropertyName("cholesterol")]
        public string? Cholesterol { get; set; }
    }

    public class PatientVitalSignsDto
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public bool HasVitalSigns { get; set; }
        public VitalSignsCardDto? VitalSigns { get; set; }
        public List<MedicalRecordSummaryDto> MedicalRecords { get; set; } = new();
        public PatientQRCodeDto? QRCode { get; set; }
    }

    public class VitalSignsCardDto
    {
        public string? HeartRate { get; set; }
        public string? BloodPressure { get; set; }
        public decimal? BloodSugar { get; set; }
        public string? Cholesterol { get; set; }
        public string? BloodCount { get; set; }
        public decimal? BodyTemperature { get; set; }
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public decimal? BMI { get; set; }
        public DateTime? LastUpdated { get; set; }
    }

    public class MedicalRecordSummaryDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string RecordType { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public string FilePath { get; set; } = string.Empty;
    }

    public class PatientQRCodeDto
    {
        public string QRCodeImageBase64 { get; set; } = string.Empty;
        public string QRCodeData { get; set; } = string.Empty;
        public DateTime GeneratedOn { get; set; }
        public int TotalFiles { get; set; }
    }
}
