using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Doctor;
using PulseX.Core.DTOs.Appointment;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorBookingController : ControllerBase
    {
        private readonly DoctorBookingService _doctorBookingService;

        public DoctorBookingController(DoctorBookingService doctorBookingService)
        {
            _doctorBookingService = doctorBookingService;
        }

        /// <summary>
        /// Get list of doctors with filtering and pagination
        /// </summary>
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctorsList([FromQuery] DoctorListRequestDto request)
        {
            try
            {
                var response = await _doctorBookingService.GetDoctorsListAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get doctor profile with chat authorization check
        /// </summary>
        [HttpGet("doctors/{doctorId}/profile")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetDoctorProfile(int doctorId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var profile = await _doctorBookingService.GetDoctorProfileAsync(doctorId, userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get available time slots for a doctor on a specific date
        /// </summary>
        [HttpGet("doctors/{doctorId}/slots")]
        public async Task<IActionResult> GetAvailableSlots(int doctorId, [FromQuery] DateTime date)
        {
            try
            {
                var slots = await _doctorBookingService.GetAvailableSlotsAsync(doctorId, date);
                return Ok(slots);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create appointment with payment (simulated)
        /// </summary>
        [HttpPost("appointments")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var summary = await _doctorBookingService.CreateAppointmentAsync(userId, dto);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Check if patient can chat with doctor
        /// </summary>
        [HttpGet("doctors/{doctorId}/can-chat")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> CanChatWithDoctor(int doctorId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var canChat = await _doctorBookingService.CheckChatAuthorizationAsync(userId, doctorId);
                return Ok(new { canChat });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Activate chat for appointment (Doctor only - after completing appointment)
        /// </summary>
        [HttpPost("appointments/{appointmentId}/activate-chat")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> ActivateChat(int appointmentId, [FromQuery] int expiryDays = 7)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var doctorId = await _doctorBookingService.GetDoctorIdByUserIdAsync(userId);
                if (!doctorId.HasValue)
                {
                    return BadRequest(new { message = "Doctor not found" });
                }

                var summary = await _doctorBookingService.ActivateChatAsync(doctorId.Value, appointmentId, expiryDays);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Check if video call is available for appointment (within time window)
        /// </summary>
        [HttpGet("appointments/{appointmentId}/video-available")]
        [Authorize(Roles = "Patient,Doctor")]
        public async Task<IActionResult> IsVideoCallAvailable(int appointmentId)
        {
            try
            {
                var isAvailable = await _doctorBookingService.IsVideoCallAvailableAsync(appointmentId);
                return Ok(new 
                { 
                    appointmentId,
                    isVideoCallAvailable = isAvailable,
                    message = isAvailable 
                        ? "Video call is available now" 
                        : "Video call is only available within 1 hour of appointment time"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
