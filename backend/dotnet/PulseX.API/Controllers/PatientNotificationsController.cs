using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.Interfaces;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/patient/notifications")]
    [Authorize(Roles = "Patient")]
    public class PatientNotificationsController : ControllerBase
    {
        private readonly PatientNotificationService _notificationService;
        private readonly IUserRepository _userRepository;

        public PatientNotificationsController(
            PatientNotificationService notificationService,
            IUserRepository userRepository)
        {
            _notificationService = notificationService;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Get all notifications for the logged-in patient
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _notificationService.GetPatientNotificationsAsync(patientId.Value);
                return Ok(result);
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
        public async Task<IActionResult> GetUnreadNotifications()
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _notificationService.GetUnreadNotificationsAsync(patientId.Value);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get recent notifications (for dashboard display)
        /// </summary>
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentNotifications([FromQuery] int count = 5)
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _notificationService.GetRecentNotificationsAsync(patientId.Value, count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get notifications by type (e.g., HeartRiskAssessment, HealthAlert)
        /// </summary>
        [HttpGet("type/{type}")]
        public async Task<IActionResult> GetNotificationsByType(string type)
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _notificationService.GetNotificationsByTypeAsync(patientId.Value, type);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific notification by ID
        /// </summary>
        [HttpGet("{notificationId}")]
        public async Task<IActionResult> GetNotification(int notificationId)
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _notificationService.GetNotificationByIdAsync(notificationId);
                if (result == null)
                {
                    return NotFound(new { message = "Notification not found" });
                }

                // Verify patient owns this notification
                if (result.PatientId != patientId.Value)
                {
                    return Forbid();
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                // Verify patient owns this notification
                var notification = await _notificationService.GetNotificationByIdAsync(notificationId);
                if (notification == null)
                {
                    return NotFound(new { message = "Notification not found" });
                }
                if (notification.PatientId != patientId.Value)
                {
                    return Forbid();
                }

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
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                await _notificationService.MarkAllAsReadAsync(patientId.Value);
                return Ok(new { message = "All notifications marked as read" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> DeleteNotification(int notificationId)
        {
            try
            {
                var patientId = await GetPatientIdAsync();
                if (patientId == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                // Verify patient owns this notification
                var notification = await _notificationService.GetNotificationByIdAsync(notificationId);
                if (notification == null)
                {
                    return NotFound(new { message = "Notification not found" });
                }
                if (notification.PatientId != patientId.Value)
                {
                    return Forbid();
                }

                await _notificationService.DeleteNotificationAsync(notificationId);
                return Ok(new { message = "Notification deleted" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #region Private Helper Methods

        private async Task<int?> GetPatientIdAsync()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return null;
            }

            var user = await _userRepository.GetByIdAsync(userId);
            return user?.Patient?.Id;
        }

        #endregion
    }
}
