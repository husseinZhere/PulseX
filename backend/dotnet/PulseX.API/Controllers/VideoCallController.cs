using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    /// <summary>
    /// REST API Controller for Video Call management
    /// Handles video call availability, session management, and post-call workflows
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VideoCallController : ControllerBase
    {
        private readonly VideoCallService _videoCallService;
        private readonly ILogger<VideoCallController> _logger;

        public VideoCallController(
            VideoCallService videoCallService,
            ILogger<VideoCallController> logger)
        {
            _videoCallService = videoCallService;
            _logger = logger;
        }

        #region Helper Methods

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return null;
            return userId;
        }

        private string? GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value 
                ?? User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        }

        #endregion

        // ═══════════════════════════════════════════════════════════════════════════
        // AVAILABILITY & UPCOMING CALLS
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Check if video call is available for an appointment
        /// Returns availability status, time window, and existing session info
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        [HttpGet("availability/{appointmentId}")]
        public async Task<IActionResult> CheckAvailability(int appointmentId)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var availability = await _videoCallService.CheckAvailabilityAsync(appointmentId, userId.Value);
                return Ok(new { success = true, data = availability });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking video call availability for appointment {AppointmentId}", appointmentId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get upcoming video calls for the current user
        /// Shows calls within the next 24 hours with join button visibility
        /// </summary>
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingCalls()
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var role = GetUserRole();
                if (string.IsNullOrEmpty(role))
                    return BadRequest(new { message = "User role not found" });

                var upcomingCalls = await _videoCallService.GetUpcomingCallsAsync(userId.Value, role);
                return Ok(new { success = true, data = upcomingCalls });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching upcoming video calls");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // SESSION MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Join a video call session for an appointment
        /// Creates a new session if one doesn't exist, or joins existing
        /// Returns channel credentials and participant info
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        [HttpPost("join/{appointmentId}")]
        public async Task<IActionResult> JoinCall(int appointmentId)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var role = GetUserRole();
                if (string.IsNullOrEmpty(role))
                    return BadRequest(new { message = "User role not found" });

                var response = await _videoCallService.JoinCallAsync(appointmentId, userId.Value, role);
                
                if (!response.Success)
                    return BadRequest(new { success = false, message = response.Message });

                _logger.LogInformation(
                    "User {UserId} ({Role}) joined video call for appointment {AppointmentId}",
                    userId.Value, role, appointmentId);

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining video call for appointment {AppointmentId}", appointmentId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get current session information
        /// </summary>
        /// <param name="sessionId">The session ID</param>
        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetSession(string sessionId)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var session = await _videoCallService.GetSessionAsync(sessionId);
                if (session == null)
                    return NotFound(new { success = false, message = "Session not found" });

                return Ok(new { success = true, data = session });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching session {SessionId}", sessionId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get session participants information
        /// </summary>
        /// <param name="sessionId">The session ID</param>
        [HttpGet("session/{sessionId}/participants")]
        public async Task<IActionResult> GetSessionParticipants(string sessionId)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var participants = await _videoCallService.GetSessionParticipantsAsync(sessionId);
                return Ok(new { success = true, data = participants });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching participants for session {SessionId}", sessionId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // CALL CONTROLS
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// End the video call and update appointment status to Completed
        /// Terminates the call for both participants
        /// </summary>
        /// <param name="sessionId">The session ID</param>
        /// <param name="reason">Optional reason for ending the call</param>
        [HttpPost("session/{sessionId}/end")]
        public async Task<IActionResult> EndCall(string sessionId, [FromBody] EndCallRequest? request = null)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var response = await _videoCallService.EndCallAsync(sessionId, userId.Value, request?.Reason);
                
                if (!response.Success)
                    return BadRequest(new { success = false, message = response.Message });

                _logger.LogInformation(
                    "User {UserId} ended video call session {SessionId}",
                    userId.Value, sessionId);

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending video call session {SessionId}", sessionId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Update media state (video/audio enabled/disabled)
        /// </summary>
        /// <param name="sessionId">The session ID</param>
        [HttpPut("session/{sessionId}/media")]
        public async Task<IActionResult> UpdateMediaState(string sessionId, [FromBody] UpdateMediaStateRequest request)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var role = GetUserRole();
                if (string.IsNullOrEmpty(role))
                    return BadRequest(new { message = "User role not found" });

                await _videoCallService.UpdateMediaStateAsync(
                    sessionId, userId.Value, role, 
                    request.VideoEnabled, request.AudioEnabled);

                return Ok(new { success = true, message = "Media state updated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating media state for session {SessionId}", sessionId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Update connection quality metrics
        /// Called periodically by the client to report network stats
        /// </summary>
        /// <param name="sessionId">The session ID</param>
        [HttpPut("session/{sessionId}/quality")]
        public async Task<IActionResult> UpdateConnectionQuality(string sessionId, [FromBody] UpdateConnectionQualityRequest request)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var role = GetUserRole();
                if (string.IsNullOrEmpty(role))
                    return BadRequest(new { message = "User role not found" });

                await _videoCallService.UpdateConnectionQualityAsync(
                    sessionId, userId.Value, role,
                    request.LatencyMs, request.Quality);

                return Ok(new { success = true, message = "Connection quality updated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating connection quality for session {SessionId}", sessionId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // POST-CALL WORKFLOW
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Get call summary for doctor after call ends
        /// Includes patient info and prescription creation URL
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        [HttpGet("summary/doctor/{appointmentId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetCallSummaryForDoctor(int appointmentId)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var summary = await _videoCallService.GetCallSummaryForDoctorAsync(appointmentId, userId.Value);
                if (summary == null)
                    return NotFound(new { success = false, message = "Summary not found or access denied" });

                return Ok(new { success = true, data = summary });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching doctor call summary for appointment {AppointmentId}", appointmentId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get call summary for patient after call ends
        /// Includes doctor info and rating URL
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        [HttpGet("summary/patient/{appointmentId}")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetCallSummaryForPatient(int appointmentId)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "User ID not found in token" });

                var summary = await _videoCallService.GetCallSummaryForPatientAsync(appointmentId, userId.Value);
                if (summary == null)
                    return NotFound(new { success = false, message = "Summary not found or access denied" });

                return Ok(new { success = true, data = summary });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching patient call summary for appointment {AppointmentId}", appointmentId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REQUEST MODELS
    // ═══════════════════════════════════════════════════════════════════════════

    public class EndCallRequest
    {
        public string? Reason { get; set; }
    }

    public class UpdateMediaStateRequest
    {
        public bool? VideoEnabled { get; set; }
        public bool? AudioEnabled { get; set; }
    }

    public class UpdateConnectionQualityRequest
    {
        public int LatencyMs { get; set; }
        public string Quality { get; set; } = "Good";
    }
}
