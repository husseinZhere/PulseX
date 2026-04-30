using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Message;
using PulseX.Core.Enums;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly MessageService _messageService;

        public MessageController(MessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpPost("send")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SendMessage([FromForm] SendMessageDto messageDto, IFormFile? attachment)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                if (!int.TryParse(userId, out int userIdInt))
                    return BadRequest(new { message = "Invalid user ID format" });

                var roleString = User.FindFirst(ClaimTypes.Role)?.Value;
                if (string.IsNullOrEmpty(roleString) || !Enum.TryParse<UserRole>(roleString, out var role))
                {
                    return BadRequest(new { message = "Invalid or missing user role" });
                }

                var message = await _messageService.SendMessageAsync(userIdInt, role, messageDto, attachment);
                return Ok(new { message = "Message sent successfully", data = message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("appointment/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> GetAppointmentMessages(string appointmentId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                if (!int.TryParse(appointmentId, out int appointmentIdInt))
                    return BadRequest(new { message = "Invalid appointment ID format" });

                if (!int.TryParse(userId, out int userIdInt))
                    return BadRequest(new { message = "Invalid user ID format" });

                var roleString = User.FindFirst(ClaimTypes.Role)?.Value;
                if (string.IsNullOrEmpty(roleString) || !Enum.TryParse<UserRole>(roleString, out var role))
                {
                    return BadRequest(new { message = "Invalid or missing user role" });
                }

                var messages = await _messageService.GetAppointmentMessagesAsync(appointmentIdInt, userIdInt, role);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("inbox/unread")]
        [Authorize(Roles = "Patient,Doctor")]
        public async Task<IActionResult> GetUnreadInbox()
        {
            try
            {
                var userId = GetUserId();
                var role = GetRole();
                var inbox = await _messageService.GetUnreadInboxAsync(userId, role);
                return Ok(inbox);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var userId))
            {
                throw new Exception("Invalid token");
            }

            return userId;
        }

        private UserRole GetRole()
        {
            var roleString = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
            if (!Enum.TryParse<UserRole>(roleString, out var role))
            {
                throw new Exception("Invalid role");
            }

            return role;
        }
    }
}
