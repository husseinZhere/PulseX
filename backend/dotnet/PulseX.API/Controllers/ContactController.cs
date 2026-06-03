using Microsoft.AspNetCore.Mvc;
using PulseX.Core.DTOs.Contact;
using PulseX.Core.Interfaces;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IEmailService emailService, ILogger<ContactController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] ContactFormDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid form data." });

            try
            {
                await _emailService.SendContactFormEmailAsync(dto.Name, dto.Email, dto.Subject, dto.Message);
                _logger.LogInformation("Contact form submitted by {Email}", dto.Email);
                return Ok(new { message = "Your message has been sent successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send contact form email from {Email}", dto.Email);
                return StatusCode(500, new { message = "Failed to send message. Please try again later." });
            }
        }
    }
}
