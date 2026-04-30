namespace PulseX.Core.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
        
        // Attachment support (images, PDFs, medical reports)
        public string? AttachmentPath { get; set; }
        public string? AttachmentType { get; set; } // image/jpeg, application/pdf, etc.
        public long? AttachmentSize { get; set; }
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        // Navigation properties
        public Appointment Appointment { get; set; } = null!;
        public Patient? SenderPatient { get; set; }
        public Doctor? SenderDoctor { get; set; }
    }
}
