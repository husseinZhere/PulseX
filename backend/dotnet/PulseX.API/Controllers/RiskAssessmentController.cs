using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.RiskAssessment;
using PulseX.Core.Interfaces;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Patient")]
    public class RiskAssessmentController : ControllerBase
    {
        private readonly RiskAssessmentService _riskAssessmentService;
        private readonly IUserRepository _userRepository;

        public RiskAssessmentController(
            RiskAssessmentService riskAssessmentService,
            IUserRepository userRepository)
        {
            _riskAssessmentService = riskAssessmentService;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Calculate risk assessment using internal algorithm (fallback/testing)
        /// </summary>
        [HttpPost("calculate")]
        public async Task<IActionResult> CalculateRisk([FromBody] CreateHeartRiskAssessmentDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Get patient record from userId
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || user.Patient == null)
                {
                    return BadRequest(new { message = "Patient profile not found. Please complete your registration." });
                }

                var result = await _riskAssessmentService.CreateHeartRiskAssessmentAsync(user.Patient.Id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Process AI-generated heart risk assessment result from external AI model
        /// This endpoint receives the payload from the AI team's API
        /// </summary>
        [HttpPost("process-ai-result")]
        public async Task<IActionResult> ProcessAIResult([FromBody] ProcessAIResultDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Get patient record from userId
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || user.Patient == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _riskAssessmentService.ProcessAIResultAsync(
                    user.Patient.Id, 
                    dto.AIResponse, 
                    dto.OriginalInput
                );
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get the latest risk assessment for the logged-in patient
        /// Used for dashboard snapshot display
        /// </summary>
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Get patient record from userId
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || user.Patient == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _riskAssessmentService.GetLatestRiskAssessmentAsync(user.Patient.Id);
                if (result == null)
                {
                    return NotFound(new { message = "No risk assessment found" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get dashboard summary with top recommendation
        /// Optimized for dashboard display
        /// </summary>
        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || user.Patient == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var result = await _riskAssessmentService.GetDashboardSummaryAsync(user.Patient.Id);
                if (result == null)
                {
                    return NotFound(new { message = "No risk assessment found" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed view of a specific risk assessment
        /// </summary>
        [HttpGet("{assessmentId}")]
        public async Task<IActionResult> GetAssessmentDetail(int assessmentId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var result = await _riskAssessmentService.GetRiskAssessmentDetailAsync(assessmentId);
                if (result == null)
                {
                    return NotFound(new { message = "Risk assessment not found" });
                }

                // Verify patient owns this assessment
                var user = await _userRepository.GetByIdAsync(userId);
                if (user?.Patient?.Id != result.PatientId)
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
        /// Get risk assessment history for the logged-in patient
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Get patient record from userId
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || user.Patient == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var results = await _riskAssessmentService.GetRiskHistoryAsync(user.Patient.Id);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all assessments with full details
        /// </summary>
        [HttpGet("all")]
        public async Task<IActionResult> GetAllAssessments()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || user.Patient == null)
                {
                    return BadRequest(new { message = "Patient profile not found" });
                }

                var results = await _riskAssessmentService.GetAllAssessmentsAsync(user.Patient.Id);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get the latest risk assessment for a specific patient (Doctor/Admin access)
        /// </summary>
        [HttpGet("patient/{patientId}/latest")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetPatientLatest(int patientId)
        {
            try
            {
                var result = await _riskAssessmentService.GetLatestRiskAssessmentAsync(patientId);
                if (result == null)
                {
                    return NotFound(new { message = "No risk assessment found for this patient" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get risk assessment history for a specific patient (Doctor/Admin access)
        /// </summary>
        [HttpGet("patient/{patientId}/history")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetPatientHistory(int patientId)
        {
            try
            {
                var results = await _riskAssessmentService.GetRiskHistoryAsync(patientId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed assessment for a specific patient (Doctor/Admin access)
        /// </summary>
        [HttpGet("patient/{patientId}/assessment/{assessmentId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetPatientAssessmentDetail(int patientId, int assessmentId)
        {
            try
            {
                var result = await _riskAssessmentService.GetRiskAssessmentDetailAsync(assessmentId);
                if (result == null)
                {
                    return NotFound(new { message = "Risk assessment not found" });
                }

                // Verify assessment belongs to specified patient
                if (result.PatientId != patientId)
                {
                    return BadRequest(new { message = "Assessment does not belong to this patient" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
