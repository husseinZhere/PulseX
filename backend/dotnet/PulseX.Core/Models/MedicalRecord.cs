namespace PulseX.Core.Models
{
    public class MedicalRecord
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string RecordType { get; set; } = string.Empty; // ECG, X-Ray
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? FileType { get; set; } // image/png, image/jpeg, application/pdf
        public long FileSize { get; set; }
        public string? Notes { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Patient Patient { get; set; } = null!;
    }
}
