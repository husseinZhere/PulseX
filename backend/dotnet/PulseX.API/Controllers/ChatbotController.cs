using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly ChatbotService _chatbotService;
        private readonly DoctorBookingService _doctorBookingService;

        public ChatbotController(
            ChatbotService chatbotService,
            DoctorBookingService doctorBookingService)
        {
            _chatbotService = chatbotService;
            _doctorBookingService = doctorBookingService;
        }

        /// <summary>
        /// Chat with doctor (requires confirmed appointment)
        /// </summary>
        [HttpPost("chat/{doctorId}")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> ChatWithDoctor(int doctorId, [FromBody] ChatMessageDto message)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Check chat authorization
                var canChat = await _doctorBookingService.CheckChatAuthorizationAsync(userId, doctorId);
                if (!canChat)
                {
                    return StatusCode(403, new { 
                        message = "Access denied. You need a confirmed appointment with this doctor to chat.",
                        requiresBooking = true
                    });
                }

                var response = await _chatbotService.GetChatbotResponseAsync(userId, message.Message);
                return Ok(new { message = "Response generated successfully", data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// General chatbot (no authorization required)
        /// </summary>
        [HttpPost("chat")]
        [Authorize]
        public async Task<IActionResult> Chat([FromBody] ChatMessageDto message)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var response = await _chatbotService.GetChatbotResponseAsync(userId, message.Message);
                return Ok(new { message = "Response generated successfully", data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class ChatMessageDto
    {
        public string Message { get; set; } = string.Empty;
    }
}
