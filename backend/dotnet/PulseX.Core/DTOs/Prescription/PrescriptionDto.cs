using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Prescription
{
    public class CreatePrescriptionDto
    {
        [JsonPropertyName("patient_id")]
        public int PatientId { get; set; }
        
        [JsonPropertyName("appointment_id")]
        public int? AppointmentId { get; set; }
        
        [JsonPropertyName("medications")]
        public List<MedicationDto> Medications { get; set; } = new();
        
        [JsonPropertyName("lab_requests")]
        public List<LabRequestDto> LabRequests { get; set; } = new();
        
        [JsonPropertyName("clinical_notes")]
        public string? ClinicalNotes { get; set; }
    }

    public class MedicationDto
    {
        [JsonPropertyName("drug_name")]
        public string DrugName { get; set; } = string.Empty;
        
        [JsonPropertyName("dosage")]
        public string Dosage { get; set; } = string.Empty;
        
        [JsonPropertyName("frequency")]
        public string Frequency { get; set; } = string.Empty;
        
        [JsonPropertyName("duration")]
        public string Duration { get; set; } = string.Empty;
    }

    public class LabRequestDto
    {
        [JsonPropertyName("test_name")]
        public string TestName { get; set; } = string.Empty;
        
        [JsonPropertyName("test_type")]
        public string? TestType { get; set; } // "Lab Test", "X-Ray", "ECG", etc.
        
        [JsonPropertyName("additional_notes")]
        public string? AdditionalNotes { get; set; }
        
        [JsonPropertyName("is_fasting_required")]
        public bool IsFastingRequired { get; set; }
        
        [JsonPropertyName("instructions")]
        public string? Instructions { get; set; }
    }

    public class PrescriptionResponseDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string? DoctorSpecialization { get; set; }
        public string? DoctorProfilePicture { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientProfilePicture { get; set; }
        public int? AppointmentId { get; set; }
        public List<MedicationDto> Medications { get; set; } = new();
        public List<LabRequestDto> LabRequests { get; set; } = new();
        public string? ClinicalNotes { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public string Status { get; set; } = "Active"; // "Active" or "Completed"
        public string PrescriptionId { get; set; } = string.Empty; // RX-2026-0210-4523
    }

    public class PatientSearchDto
    {
        public int Id { get; set; }
        public string PatientId { get; set; } = string.Empty; // PAT001
        public string FullName { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
    }

    public class PrescriptionFormDataDto
    {
        public int? PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? Gender { get; set; }
        public int? Age { get; set; }
        public string? VisitType { get; set; }
        public bool IsDirectContext { get; set; }
    }

    /// <summary>
    /// Prescription list response with pagination and filtering
    /// </summary>
    public class PrescriptionListResponseDto
    {
        public List<PrescriptionResponseDto> Prescriptions { get; set; } = new();
        public PrescriptionStatsDto Stats { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    /// <summary>
    /// Statistics for prescription dashboard
    /// </summary>
    public class PrescriptionStatsDto
    {
        public int TotalPrescriptions { get; set; }
        public int ActivePrescriptions { get; set; }
        public int CompletedPrescriptions { get; set; }
    }

    /// <summary>
    /// Enhanced Prescription Response DTO for details view
    /// </summary>
    public class PrescriptionDetailsDto
    {
        public int Id { get; set; }
        public string PrescriptionId { get; set; } = string.Empty;
        
        // Doctor Info
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string? DoctorSpecialization { get; set; }
        public string? DoctorProfilePicture { get; set; }
        
        // Patient Info
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientIdNumber { get; set; } // PX-2024-7891
        public string? PatientProfilePicture { get; set; }
        
        // Date Info
        public DateTime CreatedAt { get; set; }
        public string FormattedDate { get; set; } = string.Empty; // "February 10, 2026"
        public string FormattedTime { get; set; } = string.Empty; // "02:30 PM"
        
        // Medications
        public List<MedicationDetailsDto> Medications { get; set; } = new();
        
        // Lab & Radiology Requests
        public List<LabRequestDetailsDto> LabRequests { get; set; } = new();
        
        // Clinical Notes
        public string? ClinicalNotes { get; set; }
        public string? ImportantInstructions { get; set; }
        
        // Status
        public string Status { get; set; } = "Active";
        public bool IsRead { get; set; }
    }

    /// <summary>
    /// Medication details for prescription view
    /// </summary>
    public class MedicationDetailsDto
    {
        public int Number { get; set; } // 1, 2, 3...
        public string DrugName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string DisplayFrequency { get; set; } = string.Empty; // "3 times daily (after meals)"
    }

    /// <summary>
    /// Lab request details with upload status
    /// </summary>
    public class LabRequestDetailsDto
    {
        public int Number { get; set; } // 1, 2, 3...
        public string TestName { get; set; } = string.Empty;
        public string? TestType { get; set; } // "Lab Test", "X-Ray", "ECG"
        public string? AdditionalNotes { get; set; }
        public bool IsFastingRequired { get; set; }
        public string? Instructions { get; set; }
        
        // Upload tracking
        public bool HasResult { get; set; } // ?????? ??? ??????? ??? ???
        public DateTime? ResultUploadedAt { get; set; }
        public int? MedicalRecordId { get; set; } // Reference to uploaded file
    }
}
