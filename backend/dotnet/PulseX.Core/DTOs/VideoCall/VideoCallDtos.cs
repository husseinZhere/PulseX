using System.ComponentModel.DataAnnotations;

namespace PulseX.Core.DTOs.VideoCall
{
    // ═══════════════════════════════════════════════════════════════════════════
    // SESSION MANAGEMENT DTOs
    // ═══════════════════════════════════════════════════════════════════════════
    
    /// <summary>
    /// Response when checking if a video call is available for an appointment
    /// </summary>
    public class VideoCallAvailabilityDto
    {
        public int AppointmentId { get; set; }
        public bool IsAvailable { get; set; }
        public string? Reason { get; set; }
        public DateTime? AppointmentTime { get; set; }
        public int MinutesUntilAvailable { get; set; }
        public int MinutesRemaining { get; set; }
        public bool CanJoin { get; set; }
        public string? SessionId { get; set; }
    }
    
    /// <summary>
    /// Response when joining a video call session
    /// </summary>
    public class JoinVideoCallResponseDto
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        
        // Session details
        public string SessionId { get; set; } = string.Empty;
        public string ChannelName { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string AppId { get; set; } = string.Empty;  // Agora App ID
        
        // Participant info
        public ParticipantInfoDto CurrentUser { get; set; } = null!;
        public ParticipantInfoDto OtherParticipant { get; set; } = null!;
        
        // Appointment context
        public int AppointmentId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public int AllowedDurationMinutes { get; set; }
    }
    
    /// <summary>
    /// Information about a call participant
    /// </summary>
    public class ParticipantInfoDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;  // "Doctor" or "Patient"
        public string? ProfilePicture { get; set; }
        public string? Specialization { get; set; }  // For doctors
        public bool IsConnected { get; set; }
        public string ConnectionStatus { get; set; } = "Disconnected";  // Connected, Connecting, Disconnected
    }
    
    /// <summary>
    /// Video call session details for dashboard display
    /// </summary>
    public class VideoCallSessionDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public string ChannelName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        public ParticipantInfoDto Doctor { get; set; } = null!;
        public ParticipantInfoDto Patient { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public int DurationSeconds { get; set; }
        
        // Media states
        public bool IsDoctorVideoEnabled { get; set; }
        public bool IsDoctorAudioEnabled { get; set; }
        public bool IsPatientVideoEnabled { get; set; }
        public bool IsPatientAudioEnabled { get; set; }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SIGNALING DTOs (for SignalR)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /// <summary>
    /// WebRTC signaling: ICE candidate exchange
    /// </summary>
    public class IceCandidateDto
    {
        [Required]
        public string SessionId { get; set; } = string.Empty;
        
        [Required]
        public string Candidate { get; set; } = string.Empty;
        
        public string? SdpMid { get; set; }
        public int? SdpMLineIndex { get; set; }
    }
    
    /// <summary>
    /// WebRTC signaling: SDP offer/answer exchange
    /// </summary>
    public class SdpMessageDto
    {
        [Required]
        public string SessionId { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = string.Empty;  // "offer" or "answer"
        
        [Required]
        public string Sdp { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// Media state change notification
    /// </summary>
    public class MediaStateChangeDto
    {
        [Required]
        public string SessionId { get; set; } = string.Empty;
        
        public bool? VideoEnabled { get; set; }
        public bool? AudioEnabled { get; set; }
    }
    
    /// <summary>
    /// Connection quality report
    /// </summary>
    public class ConnectionQualityDto
    {
        [Required]
        public string SessionId { get; set; } = string.Empty;
        
        public int LatencyMs { get; set; }
        public int JitterMs { get; set; }
        public int PacketLossPercent { get; set; }
        public int Bitrate { get; set; }
        public string Quality { get; set; } = "Unknown";  // Excellent, Good, Fair, Poor
    }
    
    /// <summary>
    /// Participant connection event (join/leave)
    /// </summary>
    public class ParticipantEventDto
    {
        public string SessionId { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;  // "joined", "left", "reconnecting"
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Request from caller to ring the other participant.
    /// </summary>
    public class IncomingCallRequestDto
    {
        [Required]
        public int AppointmentId { get; set; }

        public string? SessionId { get; set; }
    }

    /// <summary>
    /// Incoming call payload delivered to callee.
    /// </summary>
    public class IncomingCallDto
    {
        public int AppointmentId { get; set; }
        public string SessionId { get; set; } = string.Empty;

        public int CallerUserId { get; set; }
        public string CallerRole { get; set; } = string.Empty;
        public string CallerName { get; set; } = string.Empty;
        public string? CallerProfilePicture { get; set; }

        public int DoctorId { get; set; }
        public int DoctorUserId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string? DoctorProfilePicture { get; set; }

        public int PatientId { get; set; }
        public int PatientUserId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientProfilePicture { get; set; }

        public int TargetUserId { get; set; }
        public string TargetRole { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Request from callee to decline an incoming call.
    /// </summary>
    public class DeclineIncomingCallRequestDto
    {
        [Required]
        public int AppointmentId { get; set; }

        [Required]
        public string SessionId { get; set; } = string.Empty;

        [Required]
        public int CallerUserId { get; set; }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CALL CONTROL DTOs
    // ═══════════════════════════════════════════════════════════════════════════
    
    /// <summary>
    /// Request to end a video call
    /// </summary>
    public class EndCallRequestDto
    {
        [Required]
        public string SessionId { get; set; } = string.Empty;
        
        public string? Reason { get; set; }
    }
    
    /// <summary>
    /// Response after ending a call
    /// </summary>
    public class EndCallResponseDto
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public int DurationSeconds { get; set; }
        public string RedirectTo { get; set; } = string.Empty;  // URL/route to redirect
        public int? AppointmentId { get; set; }
        public bool AppointmentCompleted { get; set; }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // POST-CALL WORKFLOW DTOs
    // ═══════════════════════════════════════════════════════════════════════════
    
    /// <summary>
    /// Summary of the completed call for the doctor
    /// </summary>
    public class CallSummaryForDoctorDto
    {
        public int AppointmentId { get; set; }
        public int SessionId { get; set; }
        
        // Patient info for prescription
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientAge { get; set; }
        public string? PatientGender { get; set; }
        
        // Call stats
        public DateTime CallStartTime { get; set; }
        public DateTime CallEndTime { get; set; }
        public int DurationMinutes { get; set; }
        
        // Previous appointment notes
        public string? AppointmentNotes { get; set; }
        
        // Action required
        public bool PrescriptionRequired { get; set; } = true;
        public string PrescriptionUrl { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// Summary for the patient after call ends
    /// </summary>
    public class CallSummaryForPatientDto
    {
        public int AppointmentId { get; set; }
        
        // Doctor info
        public string DoctorName { get; set; } = string.Empty;
        public string? DoctorSpecialization { get; set; }
        public string? DoctorProfilePicture { get; set; }
        
        // Call stats
        public int DurationMinutes { get; set; }
        public DateTime CallEndTime { get; set; }
        
        // Next steps
        public bool CanRateVisit { get; set; }
        public string RatingUrl { get; set; } = string.Empty;
        public string DashboardUrl { get; set; } = string.Empty;
        public string? Message { get; set; }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DASHBOARD INTEGRATION DTOs
    // ═══════════════════════════════════════════════════════════════════════════
    
    /// <summary>
    /// Upcoming video call info for dashboard display
    /// </summary>
    public class UpcomingVideoCallDto
    {
        public int AppointmentId { get; set; }
        public DateTime AppointmentTime { get; set; }
        
        // Other party info
        public string OtherPartyName { get; set; } = string.Empty;
        public string OtherPartyRole { get; set; } = string.Empty;
        public string? OtherPartyProfilePicture { get; set; }
        public string? OtherPartySpecialization { get; set; }
        
        // Time calculations
        public int MinutesUntilCall { get; set; }
        public bool CanJoinNow { get; set; }
        public bool IsJoinButtonVisible { get; set; }  // 5 min before + during
        
        // Session info (if exists)
        public string? SessionId { get; set; }
        public bool IsOtherPartyWaiting { get; set; }
    }
}
