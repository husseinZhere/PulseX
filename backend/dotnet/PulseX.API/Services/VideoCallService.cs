using Microsoft.EntityFrameworkCore;
using PulseX.API.Helpers;
using PulseX.Core.DTOs.VideoCall;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using PulseX.Data;
using System.Security.Cryptography;

namespace PulseX.API.Services
{
    /// <summary>
    /// Service for managing video call sessions between doctors and patients
    /// </summary>
    public class VideoCallService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<VideoCallService> _logger;

        // Configuration for Agora/Twilio (set in appsettings.json)
        private readonly string _videoSdkAppId;
        private readonly string _videoSdkSecret;

        // Video call settings
        private const int JOIN_WINDOW_MINUTES_BEFORE = 5;
        private const int DEFAULT_CALL_DURATION_MINUTES = 30;

        // AppointmentDate is stored in Egypt local time (unspecified kind).
        private static readonly TimeZoneInfo EgyptTz =
            TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

        private static DateTime EgyptNow =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, EgyptTz);

        public VideoCallService(
            ApplicationDbContext context,
            IAppointmentRepository appointmentRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            IActivityLogRepository activityLogRepository,
            IConfiguration configuration,
            ILogger<VideoCallService> logger)
        {
            _context = context;
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _activityLogRepository = activityLogRepository;
            _configuration = configuration;
            _logger = logger;

            _videoSdkAppId = _configuration["VideoCall:AppId"] ?? "YOUR_AGORA_APP_ID";
            _videoSdkSecret = _configuration["VideoCall:Secret"] ?? "YOUR_AGORA_SECRET";
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // APPOINTMENT-BASED ACCESS CONTROL
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Check if a video call is available for an appointment
        /// Only available 5 minutes before and during the scheduled time
        /// </summary>
        public async Task<VideoCallAvailabilityDto> CheckAvailabilityAsync(int appointmentId, int userId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null)
            {
                return new VideoCallAvailabilityDto
                {
                    AppointmentId = appointmentId,
                    IsAvailable = false,
                    Reason = "Appointment not found"
                };
            }

            // Verify user is a participant
            bool isDoctor = appointment.Doctor?.UserId == userId;
            bool isPatient = appointment.Patient?.UserId == userId;

            if (!isDoctor && !isPatient)
            {
                return new VideoCallAvailabilityDto
                {
                    AppointmentId = appointmentId,
                    IsAvailable = false,
                    Reason = "You are not a participant in this appointment"
                };
            }

            // Only block cancelled appointments — Completed, Scheduled, Confirmed can all join
            if (appointment.Status == AppointmentStatus.Cancelled)
            {
                return new VideoCallAvailabilityDto
                {
                    AppointmentId = appointmentId,
                    IsAvailable = false,
                    Reason = "Appointment has been cancelled"
                };
            }

            // Check time window — 5 min before until 24 h after (same window as chat)
            var now = EgyptNow;
            var appointmentTime = appointment.AppointmentDate;
            var joinWindowStart = appointmentTime.AddMinutes(-JOIN_WINDOW_MINUTES_BEFORE);
            var joinWindowEnd = appointmentTime.AddHours(24);

            var minutesUntilAvailable = (int)(joinWindowStart - now).TotalMinutes;
            var minutesRemaining = (int)(joinWindowEnd - now).TotalMinutes;

            bool canJoin = now >= joinWindowStart && now <= joinWindowEnd;

            // Check if session exists
            var existingSession = await _context.Set<VideoCallSession>()
                .FirstOrDefaultAsync(s => s.AppointmentId == appointmentId && 
                    (s.Status == VideoCallStatus.Pending || 
                     s.Status == VideoCallStatus.WaitingForDoctor ||
                     s.Status == VideoCallStatus.WaitingForPatient ||
                     s.Status == VideoCallStatus.InProgress));

            return new VideoCallAvailabilityDto
            {
                AppointmentId = appointmentId,
                IsAvailable = canJoin,
                Reason = canJoin ? null : 
                    minutesUntilAvailable > 0 ? 
                        $"Call will be available in {minutesUntilAvailable} minutes" :
                        "Call window has expired",
                AppointmentTime = appointmentTime,
                MinutesUntilAvailable = Math.Max(0, minutesUntilAvailable),
                MinutesRemaining = Math.Max(0, minutesRemaining),
                CanJoin = canJoin,
                SessionId = existingSession?.SessionId
            };
        }

        /// <summary>
        /// Get upcoming video calls for dashboard display
        /// </summary>
        public async Task<List<UpcomingVideoCallDto>> GetUpcomingCallsAsync(int userId, string role)
        {
            var now = EgyptNow;
            var lookAheadEnd = now.AddHours(24); // Show calls in next 24 hours

            IQueryable<Appointment> query;

            if (role == "Doctor")
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId);
                if (doctor == null) return new List<UpcomingVideoCallDto>();

                query = _context.Appointments
                    .Include(a => a.Patient).ThenInclude(p => p.User)
                    .Where(a => a.DoctorId == doctor.Id &&
                                a.AppointmentDate >= now.AddMinutes(-DEFAULT_CALL_DURATION_MINUTES) &&
                                a.AppointmentDate <= lookAheadEnd &&
                                (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed));
            }
            else
            {
                var patient = await _patientRepository.GetByUserIdAsync(userId);
                if (patient == null) return new List<UpcomingVideoCallDto>();

                query = _context.Appointments
                    .Include(a => a.Doctor).ThenInclude(d => d.User)
                    .Where(a => a.PatientId == patient.Id &&
                                a.AppointmentDate >= now.AddMinutes(-DEFAULT_CALL_DURATION_MINUTES) &&
                                a.AppointmentDate <= lookAheadEnd &&
                                (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed));
            }

            var appointments = await query.OrderBy(a => a.AppointmentDate).ToListAsync();

            var result = new List<UpcomingVideoCallDto>();

            foreach (var appt in appointments)
            {
                var joinWindowStart = appt.AppointmentDate.AddMinutes(-JOIN_WINDOW_MINUTES_BEFORE);
                var joinWindowEnd = appt.AppointmentDate.AddMinutes(DEFAULT_CALL_DURATION_MINUTES);
                var canJoinNow = now >= joinWindowStart && now <= joinWindowEnd;
                var isButtonVisible = now >= joinWindowStart.AddMinutes(-5) && now <= joinWindowEnd;

                var session = await _context.Set<VideoCallSession>()
                    .FirstOrDefaultAsync(s => s.AppointmentId == appt.Id &&
                        (s.Status == VideoCallStatus.Pending ||
                         s.Status == VideoCallStatus.WaitingForDoctor ||
                         s.Status == VideoCallStatus.WaitingForPatient ||
                         s.Status == VideoCallStatus.InProgress));

                bool isOtherPartyWaiting = false;
                if (session != null)
                {
                    isOtherPartyWaiting = role == "Doctor" ? session.IsPatientConnected : session.IsDoctorConnected;
                }

                if (role == "Doctor")
                {
                    result.Add(new UpcomingVideoCallDto
                    {
                        AppointmentId = appt.Id,
                        AppointmentTime = appt.AppointmentDate,
                        OtherPartyName = appt.Patient?.User?.FullName ?? "Unknown Patient",
                        OtherPartyRole = "Patient",
                        OtherPartyProfilePicture = appt.Patient?.User?.ProfilePicture,
                        MinutesUntilCall = (int)(appt.AppointmentDate - now).TotalMinutes,
                        CanJoinNow = canJoinNow,
                        IsJoinButtonVisible = isButtonVisible,
                        SessionId = session?.SessionId,
                        IsOtherPartyWaiting = isOtherPartyWaiting
                    });
                }
                else
                {
                    result.Add(new UpcomingVideoCallDto
                    {
                        AppointmentId = appt.Id,
                        AppointmentTime = appt.AppointmentDate,
                        OtherPartyName = $"Dr. {appt.Doctor?.User?.FullName ?? "Unknown"}",
                        OtherPartyRole = "Doctor",
                        OtherPartyProfilePicture = appt.Doctor?.ProfilePicture ?? appt.Doctor?.User?.ProfilePicture,
                        OtherPartySpecialization = appt.Doctor?.Specialization,
                        MinutesUntilCall = (int)(appt.AppointmentDate - now).TotalMinutes,
                        CanJoinNow = canJoinNow,
                        IsJoinButtonVisible = isButtonVisible,
                        SessionId = session?.SessionId,
                        IsOtherPartyWaiting = isOtherPartyWaiting
                    });
                }
            }

            return result;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // SESSION MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Create or join an existing video call session
        /// </summary>
        public async Task<JoinVideoCallResponseDto> JoinCallAsync(int appointmentId, int userId, string role)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null)
            {
                return new JoinVideoCallResponseDto
                {
                    Success = false,
                    Message = "Appointment not found"
                };
            }

            // Find or create session
            var session = await _context.Set<VideoCallSession>()
                .FirstOrDefaultAsync(s => s.AppointmentId == appointmentId &&
                    s.Status != VideoCallStatus.Completed &&
                    s.Status != VideoCallStatus.Cancelled &&
                    s.Status != VideoCallStatus.Failed);

            if (session == null)
            {
                // Create new session
                session = new VideoCallSession
                {
                    AppointmentId = appointmentId,
                    SessionId = GenerateSessionId(),
                    ChannelName = $"pulsex_appt_{appointmentId}_{DateTime.UtcNow:yyyyMMddHHmmss}",
                    Status = VideoCallStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                // Generate tokens for video SDK
                session.DoctorToken = GenerateVideoToken(session.ChannelName, appointment.Doctor!.UserId);
                session.PatientToken = GenerateVideoToken(session.ChannelName, appointment.Patient!.UserId);

                _context.Set<VideoCallSession>().Add(session);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Created new video call session {SessionId} for appointment {AppointmentId}",
                    session.SessionId, appointmentId);
            }

            // Always (re)generate fresh Agora tokens on every join. A session created
            // by an older build (or before the token format was fixed) would otherwise
            // hand out an INVALID token, and tokens expire after a couple of hours.
            // Regenerating guarantees a valid token for this channel each time.
            session.DoctorToken  = GenerateVideoToken(session.ChannelName, appointment.Doctor!.UserId);
            session.PatientToken = GenerateVideoToken(session.ChannelName, appointment.Patient!.UserId);

            // Update connection status
            if (role == "Doctor")
            {
                session.IsDoctorConnected = true;
                session.DoctorJoinedAt = DateTime.UtcNow;
                session.Status = session.IsPatientConnected ? VideoCallStatus.InProgress : VideoCallStatus.WaitingForPatient;
            }
            else
            {
                session.IsPatientConnected = true;
                session.PatientJoinedAt = DateTime.UtcNow;
                session.Status = session.IsDoctorConnected ? VideoCallStatus.InProgress : VideoCallStatus.WaitingForDoctor;
            }

            // If both connected, mark as started
            if (session.IsDoctorConnected && session.IsPatientConnected && session.StartedAt == null)
            {
                session.StartedAt = DateTime.UtcNow;
                session.Status = VideoCallStatus.InProgress;

                // Update appointment to mark video call as active
                appointment.IsVideoCallActive = true;
                appointment.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Prepare participant info
            var currentUser = role == "Doctor"
                ? new ParticipantInfoDto
                {
                    UserId = appointment.Doctor!.UserId,
                    Name = $"Dr. {appointment.Doctor.User.FullName}",
                    Role = "Doctor",
                    ProfilePicture = appointment.Doctor.ProfilePicture ?? appointment.Doctor.User.ProfilePicture,
                    Specialization = appointment.Doctor.Specialization,
                    IsConnected = true,
                    ConnectionStatus = "Connected"
                }
                : new ParticipantInfoDto
                {
                    UserId = appointment.Patient!.UserId,
                    Name = appointment.Patient.User.FullName,
                    Role = "Patient",
                    ProfilePicture = appointment.Patient.User.ProfilePicture,
                    IsConnected = true,
                    ConnectionStatus = "Connected"
                };

            var otherParticipant = role == "Doctor"
                ? new ParticipantInfoDto
                {
                    UserId = appointment.Patient!.UserId,
                    Name = appointment.Patient.User.FullName,
                    Role = "Patient",
                    ProfilePicture = appointment.Patient.User.ProfilePicture,
                    IsConnected = session.IsPatientConnected,
                    ConnectionStatus = session.IsPatientConnected ? "Connected" : "Disconnected"
                }
                : new ParticipantInfoDto
                {
                    UserId = appointment.Doctor!.UserId,
                    Name = $"Dr. {appointment.Doctor.User.FullName}",
                    Role = "Doctor",
                    ProfilePicture = appointment.Doctor.ProfilePicture ?? appointment.Doctor.User.ProfilePicture,
                    Specialization = appointment.Doctor.Specialization,
                    IsConnected = session.IsDoctorConnected,
                    ConnectionStatus = session.IsDoctorConnected ? "Connected" : "Disconnected"
                };

            return new JoinVideoCallResponseDto
            {
                Success = true,
                Message = "Successfully joined video call",
                SessionId = session.SessionId,
                ChannelName = session.ChannelName,
                Token = role == "Doctor" ? session.DoctorToken! : session.PatientToken!,
                AppId = _videoSdkAppId,
                CurrentUser = currentUser,
                OtherParticipant = otherParticipant,
                AppointmentId = appointmentId,
                AppointmentTime = appointment.AppointmentDate,
                AllowedDurationMinutes = DEFAULT_CALL_DURATION_MINUTES
            };
        }

        /// <summary>
        /// Handle participant joining a session (called from SignalR hub)
        /// </summary>
        public async Task ParticipantJoinedAsync(string sessionId, int userId, string role)
        {
            var session = await _context.Set<VideoCallSession>()
                .Include(s => s.Appointment)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null)
            {
                _logger.LogWarning("Participant tried to join non-existent session {SessionId}", sessionId);
                return;
            }

            if (role == "Doctor")
            {
                session.IsDoctorConnected = true;
                session.DoctorJoinedAt ??= DateTime.UtcNow;
            }
            else
            {
                session.IsPatientConnected = true;
                session.PatientJoinedAt ??= DateTime.UtcNow;
            }

            // Update status
            if (session.IsDoctorConnected && session.IsPatientConnected)
            {
                session.Status = VideoCallStatus.InProgress;
                session.StartedAt ??= DateTime.UtcNow;
                
                // Update appointment
                session.Appointment.IsVideoCallActive = true;
                session.Appointment.UpdatedAt = DateTime.UtcNow;
            }
            else if (session.IsDoctorConnected)
            {
                session.Status = VideoCallStatus.WaitingForPatient;
            }
            else
            {
                session.Status = VideoCallStatus.WaitingForDoctor;
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Handle participant leaving a session (called from SignalR hub)
        /// </summary>
        public async Task ParticipantLeftAsync(string sessionId, int userId, string role)
        {
            var session = await _context.Set<VideoCallSession>()
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null) return;

            if (role == "Doctor")
            {
                session.IsDoctorConnected = false;
            }
            else
            {
                session.IsPatientConnected = false;
            }

            // If both left, consider it ended
            if (!session.IsDoctorConnected && !session.IsPatientConnected && 
                session.Status == VideoCallStatus.InProgress)
            {
                session.Status = VideoCallStatus.Completed;
                session.EndedAt = DateTime.UtcNow;
                session.EndReason = "Both participants disconnected";

                if (session.StartedAt.HasValue)
                {
                    session.DurationSeconds = (int)(session.EndedAt.Value - session.StartedAt.Value).TotalSeconds;
                }
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Get current session participants info
        /// </summary>
        public async Task<List<ParticipantInfoDto>> GetSessionParticipantsAsync(string sessionId)
        {
            var session = await _context.Set<VideoCallSession>()
                .Include(s => s.Appointment)
                    .ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
                .Include(s => s.Appointment)
                    .ThenInclude(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null) return new List<ParticipantInfoDto>();

            var appointment = session.Appointment;

            return new List<ParticipantInfoDto>
            {
                new ParticipantInfoDto
                {
                    UserId = appointment.Doctor!.UserId,
                    Name = $"Dr. {appointment.Doctor.User.FullName}",
                    Role = "Doctor",
                    ProfilePicture = appointment.Doctor.ProfilePicture ?? appointment.Doctor.User.ProfilePicture,
                    Specialization = appointment.Doctor.Specialization,
                    IsConnected = session.IsDoctorConnected,
                    ConnectionStatus = session.IsDoctorConnected ? "Connected" : "Disconnected"
                },
                new ParticipantInfoDto
                {
                    UserId = appointment.Patient!.UserId,
                    Name = appointment.Patient.User.FullName,
                    Role = "Patient",
                    ProfilePicture = appointment.Patient.User.ProfilePicture,
                    IsConnected = session.IsPatientConnected,
                    ConnectionStatus = session.IsPatientConnected ? "Connected" : "Disconnected"
                }
            };
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // MEDIA STATE & QUALITY
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Update media state (video/audio enabled)
        /// </summary>
        public async Task UpdateMediaStateAsync(string sessionId, int userId, string role,
            bool? videoEnabled = null, bool? audioEnabled = null)
        {
            var session = await _context.Set<VideoCallSession>()
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null) return;

            if (role == "Doctor")
            {
                if (videoEnabled.HasValue) session.IsDoctorVideoEnabled = videoEnabled.Value;
                if (audioEnabled.HasValue) session.IsDoctorAudioEnabled = audioEnabled.Value;
            }
            else
            {
                if (videoEnabled.HasValue) session.IsPatientVideoEnabled = videoEnabled.Value;
                if (audioEnabled.HasValue) session.IsPatientAudioEnabled = audioEnabled.Value;
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Update connection quality metrics
        /// </summary>
        public async Task UpdateConnectionQualityAsync(string sessionId, int userId, string role,
            int latencyMs, string quality)
        {
            var session = await _context.Set<VideoCallSession>()
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null) return;

            if (role == "Doctor")
            {
                session.DoctorLatencyMs = latencyMs;
                session.DoctorConnectionQuality = quality;
            }
            else
            {
                session.PatientLatencyMs = latencyMs;
                session.PatientConnectionQuality = quality;
            }

            await _context.SaveChangesAsync();
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // END CALL & POST-CALL WORKFLOW
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// End the video call and update appointment status
        /// </summary>
        public async Task<EndCallResponseDto> EndCallAsync(string sessionId, int userId, string? reason = null)
        {
            var session = await _context.Set<VideoCallSession>()
                .Include(s => s.Appointment)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null)
            {
                return new EndCallResponseDto
                {
                    Success = false,
                    Message = "Session not found"
                };
            }

            var hadConnectedConsultation =
                session.StartedAt.HasValue ||
                session.Status == VideoCallStatus.InProgress ||
                (session.IsDoctorConnected && session.IsPatientConnected);

            // End the session. A call that never connected should not complete the appointment.
            session.Status = hadConnectedConsultation
                ? VideoCallStatus.Completed
                : VideoCallStatus.Cancelled;
            session.EndedAt = DateTime.UtcNow;
            session.EndedByUserId = userId;
            session.EndReason = reason ?? "Call ended by participant";
            session.IsDoctorConnected = false;
            session.IsPatientConnected = false;

            if (session.StartedAt.HasValue)
            {
                session.DurationSeconds = (int)(session.EndedAt.Value - session.StartedAt.Value).TotalSeconds;
            }

            var appointment = session.Appointment;
            appointment.IsVideoCallActive = false;
            appointment.UpdatedAt = DateTime.UtcNow;
            // Do NOT set appointment.Status = Completed here.
            // Appointment status is managed by the 24-hour auto-complete logic in AppointmentService,
            // so multiple call sessions can be started within the same appointment window.

            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = userId,
                Action = hadConnectedConsultation ? "VideoCallEnded" : "VideoCallCancelled",
                EntityType = "Appointment",
                EntityId = appointment.Id,
                Details = hadConnectedConsultation
                    ? $"Video call session {sessionId} ended. Duration: {session.DurationSeconds} seconds."
                    : $"Video call session {sessionId} was cancelled before both participants connected."
            });

            _logger.LogInformation(
                "Video call session {SessionId} ended with status {Status}. Duration: {Duration}s. Appointment {AppointmentId} completed: {AppointmentCompleted}.",
                sessionId, session.Status, session.DurationSeconds, appointment.Id, hadConnectedConsultation);

            return new EndCallResponseDto
            {
                Success = true,
                Message = hadConnectedConsultation
                    ? "Call ended successfully"
                    : "Call cancelled before it connected",
                DurationSeconds = session.DurationSeconds,
                AppointmentId = appointment.Id,
                AppointmentCompleted = hadConnectedConsultation
            };
        }

        /// <summary>
        /// Get call summary for doctor (for prescription creation)
        /// </summary>
        public async Task<CallSummaryForDoctorDto?> GetCallSummaryForDoctorAsync(int appointmentId, int doctorUserId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null || appointment.Doctor?.UserId != doctorUserId)
                return null;

            var session = await _context.Set<VideoCallSession>()
                .Where(s => s.AppointmentId == appointmentId)
                .OrderByDescending(s => s.EndedAt)
                .FirstOrDefaultAsync();

            // Calculate patient age
            string? patientAge = null;
            if (appointment.Patient?.DateOfBirth.HasValue == true)
            {
                var dob = appointment.Patient.DateOfBirth.Value;
                var age = DateTime.Today.Year - dob.Year;
                if (dob > DateTime.Today.AddYears(-age)) age--;
                patientAge = $"{age} years";
            }

            return new CallSummaryForDoctorDto
            {
                AppointmentId = appointmentId,
                SessionId = session?.Id ?? 0,
                PatientId = appointment.Patient!.Id,
                PatientName = appointment.Patient.User.FullName,
                PatientAge = patientAge,
                PatientGender = appointment.Patient.Gender,
                CallStartTime = session?.StartedAt ?? appointment.AppointmentDate,
                CallEndTime = session?.EndedAt ?? DateTime.UtcNow,
                DurationMinutes = session != null ? session.DurationSeconds / 60 : 0,
                AppointmentNotes = appointment.Notes,
                PrescriptionRequired = true,
                PrescriptionUrl = $"/api/prescriptions/appointment/{appointmentId}"
            };
        }

        /// <summary>
        /// Get call summary for patient (for rating)
        /// </summary>
        public async Task<CallSummaryForPatientDto?> GetCallSummaryForPatientAsync(int appointmentId, int patientUserId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Rating)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null || appointment.Patient?.UserId != patientUserId)
                return null;

            var session = await _context.Set<VideoCallSession>()
                .Where(s => s.AppointmentId == appointmentId)
                .OrderByDescending(s => s.EndedAt)
                .FirstOrDefaultAsync();

            return new CallSummaryForPatientDto
            {
                AppointmentId = appointmentId,
                DoctorName = $"Dr. {appointment.Doctor!.User.FullName}",
                DoctorSpecialization = appointment.Doctor.Specialization,
                DoctorProfilePicture = appointment.Doctor.ProfilePicture ?? appointment.Doctor.User.ProfilePicture,
                DurationMinutes = session != null ? session.DurationSeconds / 60 : 0,
                CallEndTime = session?.EndedAt ?? DateTime.UtcNow,
                CanRateVisit = appointment.Rating == null,
                RatingUrl = $"/patient/appointments/{appointmentId}/rate",
                DashboardUrl = "/patient/dashboard",
                Message = "Your consultation has been completed. Your doctor will send you a prescription shortly."
            };
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // HELPER METHODS
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Generate unique session ID
        /// </summary>
        private static string GenerateSessionId()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[16];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes).Replace("+", "").Replace("/", "").Replace("=", "")[..20];
        }

        private string GenerateVideoToken(string channelName, int userId)
        {
            if (string.IsNullOrEmpty(_videoSdkAppId) || _videoSdkAppId == "YOUR_AGORA_APP_ID" ||
                string.IsNullOrEmpty(_videoSdkSecret) || _videoSdkSecret == "YOUR_AGORA_SECRET")
            {
                // No credentials configured → Agora testing mode (frontend passes null token)
                return string.Empty;
            }

            return AgoraTokenBuilder.BuildTokenWithUid(
                _videoSdkAppId,
                _videoSdkSecret,
                channelName,
                (uint)userId,
                tokenExpireSeconds: 7200);
        }

        /// <summary>
        /// Get session by ID
        /// </summary>
        public async Task<VideoCallSessionDto?> GetSessionAsync(string sessionId)
        {
            var session = await _context.Set<VideoCallSession>()
                .Include(s => s.Appointment)
                    .ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
                .Include(s => s.Appointment)
                    .ThenInclude(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null) return null;

            var appointment = session.Appointment;

            return new VideoCallSessionDto
            {
                Id = session.Id,
                AppointmentId = session.AppointmentId,
                SessionId = session.SessionId,
                ChannelName = session.ChannelName,
                Status = session.Status.ToString(),
                Doctor = new ParticipantInfoDto
                {
                    UserId = appointment.Doctor!.UserId,
                    Name = $"Dr. {appointment.Doctor.User.FullName}",
                    Role = "Doctor",
                    ProfilePicture = appointment.Doctor.ProfilePicture ?? appointment.Doctor.User.ProfilePicture,
                    Specialization = appointment.Doctor.Specialization,
                    IsConnected = session.IsDoctorConnected,
                    ConnectionStatus = session.IsDoctorConnected ? "Connected" : "Disconnected"
                },
                Patient = new ParticipantInfoDto
                {
                    UserId = appointment.Patient!.UserId,
                    Name = appointment.Patient.User.FullName,
                    Role = "Patient",
                    ProfilePicture = appointment.Patient.User.ProfilePicture,
                    IsConnected = session.IsPatientConnected,
                    ConnectionStatus = session.IsPatientConnected ? "Connected" : "Disconnected"
                },
                CreatedAt = session.CreatedAt,
                StartedAt = session.StartedAt,
                EndedAt = session.EndedAt,
                DurationSeconds = session.DurationSeconds,
                IsDoctorVideoEnabled = session.IsDoctorVideoEnabled,
                IsDoctorAudioEnabled = session.IsDoctorAudioEnabled,
                IsPatientVideoEnabled = session.IsPatientVideoEnabled,
                IsPatientAudioEnabled = session.IsPatientAudioEnabled
            };
        }

        /// <summary>
        /// Build incoming call payload used by SignalR ringing flow.
        /// </summary>
        public async Task<IncomingCallDto?> BuildIncomingCallAsync(int appointmentId, int callerUserId, string callerRole, string? sessionId = null)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null)
            {
                return null;
            }

            var isDoctorCaller = appointment.Doctor?.UserId == callerUserId;
            var isPatientCaller = appointment.Patient?.UserId == callerUserId;

            if (!isDoctorCaller && !isPatientCaller)
            {
                return null;
            }

            // Mirror the CanChat gate from AppointmentService: a participant can
            // only ring the other party while the chat window is open. Blocks
            // a client from bypassing the disabled UI button and ringing anyway.
            if (appointment.Status == AppointmentStatus.Cancelled)
            {
                return null;
            }

            var nowUtc = DateTime.UtcNow;
            var nowEgypt = EgyptNow;
            var chatOpen = false;
            if (appointment.ChatExpiryDate.HasValue && nowUtc < appointment.ChatExpiryDate.Value)
            {
                chatOpen = true;
            }
            else if (appointment.PaymentMethod == PaymentMethod.Cash &&
                     !appointment.ChatExpiryDate.HasValue &&
                     nowEgypt >= appointment.AppointmentDate &&
                     nowEgypt <= appointment.AppointmentDate.AddHours(24))
            {
                chatOpen = true;
            }

            if (!chatOpen)
            {
                _logger.LogInformation(
                    "Blocked NotifyIncomingCall for appointment {AppointmentId} — chat window closed",
                    appointmentId);
                return null;
            }

            var resolvedSessionId = sessionId;
            if (string.IsNullOrWhiteSpace(resolvedSessionId))
            {
                var activeSession = await _context.Set<VideoCallSession>()
                    .Where(s => s.AppointmentId == appointmentId &&
                        s.Status != VideoCallStatus.Completed &&
                        s.Status != VideoCallStatus.Cancelled &&
                        s.Status != VideoCallStatus.Failed)
                    .OrderByDescending(s => s.CreatedAt)
                    .FirstOrDefaultAsync();

                resolvedSessionId = activeSession?.SessionId;
            }

            if (string.IsNullOrWhiteSpace(resolvedSessionId))
            {
                return null;
            }

            var doctorName = $"Dr. {appointment.Doctor?.User?.FullName ?? "Unknown"}";
            var doctorProfilePicture = appointment.Doctor?.ProfilePicture ?? appointment.Doctor?.User?.ProfilePicture;

            var patientName = appointment.Patient?.User?.FullName ?? "Unknown";
            var patientProfilePicture = appointment.Patient?.User?.ProfilePicture;

            var targetUserId = isDoctorCaller ? appointment.Patient!.UserId : appointment.Doctor!.UserId;
            var targetRole = isDoctorCaller ? "Patient" : "Doctor";

            return new IncomingCallDto
            {
                AppointmentId = appointmentId,
                SessionId = resolvedSessionId,
                CallerUserId = callerUserId,
                CallerRole = isDoctorCaller ? "Doctor" : "Patient",
                CallerName = isDoctorCaller ? doctorName : patientName,
                CallerProfilePicture = isDoctorCaller ? doctorProfilePicture : patientProfilePicture,
                DoctorId = appointment.Doctor?.Id ?? 0,
                DoctorUserId = appointment.Doctor?.UserId ?? 0,
                DoctorName = doctorName,
                DoctorProfilePicture = doctorProfilePicture,
                PatientId = appointment.Patient?.Id ?? 0,
                PatientUserId = appointment.Patient?.UserId ?? 0,
                PatientName = patientName,
                PatientProfilePicture = patientProfilePicture,
                TargetUserId = targetUserId,
                TargetRole = targetRole,
                Timestamp = DateTime.UtcNow
            };
        }
    }
}
