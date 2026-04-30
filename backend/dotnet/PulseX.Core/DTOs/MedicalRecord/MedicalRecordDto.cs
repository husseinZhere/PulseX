namespace PulseX.Core.DTOs.MedicalRecord
{
    public class MedicalRecordDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? FileType { get; set; }
        public long FileSize { get; set; }
        public string? Description { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
