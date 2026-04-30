using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;

namespace PulseX.API.Controllers
{
    /// <summary>
    /// Proxy endpoints that forward AI requests from the authenticated frontend
    /// to the Python FastAPI AI service. Keeps JWT auth on the edge and hides the
    /// AI base URL from the browser.
    /// </summary>
    [ApiController]
    [Route("api/Ai")]
    [Authorize]
    public class AiProxyController : ControllerBase
    {
        private readonly AiServiceClient _ai;

        public AiProxyController(AiServiceClient ai)
        {
            _ai = ai;
        }

        [HttpGet("health")]
        [AllowAnonymous]
        public async Task<IActionResult> Health()
        {
            var ok = await _ai.IsHealthyAsync();
            return Ok(new { aiServiceHealthy = ok });
        }

        [HttpPost("xray/analyze")]
        [Authorize(Roles = "Patient,Doctor")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AnalyzeXRay(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await _ai.AnalyzeXRayAsync(stream, file.FileName, file.ContentType);
                return Ok(new { success = true, result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("recommendation")]
        [Authorize(Roles = "Patient,Doctor")]
        public async Task<IActionResult> Recommendation([FromBody] AiFraminghamRequest request)
        {
            try
            {
                var result = await _ai.GetFraminghamRecommendationAsync(request);
                return Ok(new { success = true, result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AiChatRequest request)
        {
            try
            {
                var result = await _ai.ChatAsync(request);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
