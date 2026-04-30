namespace PulseX.Core.DTOs.Doctor
{
    /// <summary>
    /// Detailed patient profile for doctor (when doctor clicks "View Record")
    /// </summary>
    public class DoctorPatientProfileDto
    {
        // Patient Info
        public int PatientId { get; set; }
        public string PatientCode { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? About { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public decimal? RiskScore { get; set; }
        public DateTime? RiskAssessedAt { get; set; }
        public DateTime? LastVisit { get; set; }
        public string LastVisitRelative { get; set; } = "Never";
        public string? VisitType { get; set; }
        public string? ChatStatus { get; set; }

        // Patient Health Information (from patient settings)
        public DoctorPatientHealthInformationDto? HealthInformation { get; set; }
        
        // Vital Signs
        public VitalSignDto? HeartRate { get; set; }
        public VitalSignDto? BloodPressure { get; set; }
        public VitalSignDto? BloodSugar { get; set; }
        public VitalSignDto? Cholesterol { get; set; }
        public VitalSignDto? BloodCount { get; set; }
        public VitalSignDto? BodyTemperature { get; set; }
        
        // Medical Records
        public List<MedicalRecordItemDto> MedicalRecords { get; set; } = new();
        
        // QR Code Info
        public string? QRCodeData { get; set; }
        public DateTime? QRCodeGeneratedAt { get; set; }
        public int TotalFilesCount { get; set; }
    }

    public class DoctorPatientHealthInformationDto
    {
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public string? BloodPressure { get; set; }
        public decimal? BloodSugar { get; set; }
        public decimal? Cholesterol { get; set; }
        public string? BloodCount { get; set; }
        public string? HeartRate { get; set; }
        public decimal? BodyTemperature { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool HasHealthData { get; set; }
    }

    public class VitalSignDto
    {
        public string Value { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public DateTime? LastUpdated { get; set; }
    }

    public class MedicalRecordItemDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string RecordType { get; set; } = string.Empty; // "Blood Test", "Radiology", "ECG"
        public DateTime UploadDate { get; set; }
        public string? FilePath { get; set; }
        public long FileSize { get; set; }
        public string? FileType { get; set; }
    }
}


