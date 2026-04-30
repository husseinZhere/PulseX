using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.HealthSurvey;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Patient")]
    public class HealthSurveyController : ControllerBase
    {
        private readonly HealthSurveyService _healthSurveyService;

        public HealthSurveyController(HealthSurveyService healthSurveyService)
        {
            _healthSurveyService = healthSurveyService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        /// <summary>
        /// Submit Health Lifestyle Survey and get AI-based risk assessment
        /// </summary>
        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeSurvey([FromBody] SubmitHealthSurveyDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Invalid survey data", errors = ModelState });
                }

                var userId = GetUserId();
                var result = await _healthSurveyService.AnalyzeSurveyAsync(userId, dto);
                
                return Ok(new
                {
                    success = true,
                    message = "Survey analyzed successfully",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
