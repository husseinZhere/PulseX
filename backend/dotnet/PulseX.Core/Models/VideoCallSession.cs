namespace PulseX.Core.Models
{
    /// <summary>
    /// Represents a video call session between a Doctor and Patient
    /// </summary>
    public class VideoCallSession
    {
        public int Id { get; set; }
        
        // Link to the appointment
        public int AppointmentId { get; set; }
        
        // Session identifiers for video SDK (Agora/Twilio)
        public string SessionId { get; set; } = string.Empty;
        public string ChannelName { get; set; } = string.Empty;
        
        // Participant tokens (for video SDK authentication)
        public string? DoctorToken { get; set; }
        public string? PatientToken { get; set; }
        
        // Connection tracking
        public bool IsDoctorConnected { get; set; } = false;
        public bool IsPatientConnected { get; set; } = false;
        public DateTime? DoctorJoinedAt { get; set; }
        public DateTime? PatientJoinedAt { get; set; }
        
        // Media state tracking
        public bool IsDoctorVideoEnabled { get; set; } = true;
        public bool IsDoctorAudioEnabled { get; set; } = true;
        public bool IsPatientVideoEnabled { get; set; } = true;
        public bool IsPatientAudioEnabled { get; set; } = true;
        
        // Session lifecycle
        public VideoCallStatus Status { get; set; } = VideoCallStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public int? EndedByUserId { get; set; }
        public string? EndReason { get; set; }
        
        // Call quality metrics (last reported)
        public int? DoctorLatencyMs { get; set; }
        public int? PatientLatencyMs { get; set; }
        public string? DoctorConnectionQuality { get; set; } // Excellent, Good, Fair, Poor
        public string? PatientConnectionQuality { get; set; }
        
        // Duration tracking
        public int DurationSeconds { get; set; } = 0;
        
        // Navigation property
        public Appointment Appointment { get; set; } = null!;
    }
    
    /// <summary>
    /// Status of the video call session
    /// </summary>
    public enum VideoCallStatus
    {
        Pending = 1,        // Session created, waiting for participants
        WaitingForDoctor = 2,
        WaitingForPatient = 3,
        InProgress = 4,     // Both parties connected
        Completed = 5,      // Call ended normally
        Cancelled = 6,      // Call was cancelled before starting
        Failed = 7          // Technical failure
    }
}
