using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly DoctorBookingService _doctorBookingService;

        public NotificationsController(
            NotificationService notificationService,
            DoctorBookingService doctorBookingService)
        {
            _notificationService = notificationService;
            _doctorBookingService = doctorBookingService;
        }

        /// <summary>
        /// Get all notifications for logged-in doctor
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetNotifications()
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

                var notifications = await _notificationService.GetDoctorNotificationsAsync(doctorId.Value);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get unread notifications only
        /// </summary>
        [HttpGet("unread")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetUnreadNotifications()
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

                var notifications = await _notificationService.GetUnreadNotificationsAsync(doctorId.Value);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark notification as read
        /// </summary>
        [HttpPut("{notificationId}/mark-read")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                await _notificationService.MarkAsReadAsync(notificationId);
                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("mark-all-read")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> MarkAllAsRead()
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

                await _notificationService.MarkAllAsReadAsync(doctorId.Value);
                return Ok(new { message = "All notifications marked as read" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete notification
        /// </summary>
        [HttpDelete("{notificationId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteNotification(int notificationId)
        {
            try
            {
                await _notificationService.DeleteNotificationAsync(notificationId);
                return Ok(new { message = "Notification deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
