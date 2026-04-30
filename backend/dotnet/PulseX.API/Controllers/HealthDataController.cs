using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.HealthData;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthDataController : ControllerBase
    {
        private readonly HealthDataService _healthDataService;

        public HealthDataController(HealthDataService healthDataService)
        {
            _healthDataService = healthDataService;
        }

        /// <summary>
        /// Add health data (Patient or Doctor can add)
        /// </summary>
        [HttpPost("add")]
        [Authorize(Roles = "Patient,Doctor")]
        public async Task<IActionResult> AddHealthData([FromBody] CreateHealthDataDto healthDataDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                if (!int.TryParse(userId, out int patientId))
                    return BadRequest(new { message = "Invalid user ID format" });

                var healthData = await _healthDataService.AddHealthDataAsync(patientId, healthDataDto);
                return Ok(new { message = "Health data added successfully", data = healthData });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Doctor adds vital signs for patient
        /// </summary>
        [HttpPost("doctor/add-vital-signs/{patientId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DoctorAddVitalSigns(int patientId, [FromBody] AddVitalSignsDto dto)
        {
            try
            {
                var result = await _healthDataService.AddVitalSignsByDoctorAsync(patientId, dto);
                return Ok(new { message = "Vital signs added successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get patient health data (for both patient and doctor)
        /// </summary>
        [HttpGet("my-health-data")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyHealthData()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                if (!int.TryParse(userId, out int patientId))
                    return BadRequest(new { message = "Invalid user ID format" });

                var healthData = await _healthDataService.GetPatientHealthDataAsync(patientId);
                return Ok(healthData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Doctor gets patient vital signs
        /// </summary>
        [HttpGet("doctor/patient-vital-signs/{patientId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetPatientVitalSigns(int patientId)
        {
            try
            {
                var vitalSigns = await _healthDataService.GetPatientVitalSignsAsync(patientId);
                return Ok(vitalSigns);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
