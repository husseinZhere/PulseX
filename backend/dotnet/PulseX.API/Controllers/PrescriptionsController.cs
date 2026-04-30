using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Prescription;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionsController : ControllerBase
    {
        private readonly PrescriptionService _prescriptionService;
        private readonly DoctorBookingService _doctorBookingService;

        public PrescriptionsController(
            PrescriptionService prescriptionService,
            DoctorBookingService doctorBookingService)
        {
            _prescriptionService = prescriptionService;
            _doctorBookingService = doctorBookingService;
        }

        /// <summary>
        /// Get form data for direct context (from patient profile)
        /// </summary>
        [HttpGet("form-data/patient/{patientId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetFormDataForPatient(int patientId)
        {
            try
            {
                var formData = await _prescriptionService.GetFormDataForPatientAsync(patientId);
                return Ok(formData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Search patients (for general access from menu)
        /// </summary>
        [HttpGet("search-patients")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> SearchPatients([FromQuery] string searchTerm)
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

                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return Ok(new List<PatientSearchDto>());
                }

                var patients = await _prescriptionService.SearchPatientsAsync(doctorId.Value, searchTerm);
                return Ok(patients);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create and send prescription to patient
        /// </summary>
        [HttpPost("create")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
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

                var prescription = await _prescriptionService.CreatePrescriptionAsync(doctorId.Value, dto);
                return Ok(new
                {
                    message = "Prescription sent successfully",
                    data = prescription
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get patient prescriptions (Patient view)
        /// </summary>
        [HttpGet("my-prescriptions")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyPrescriptions(
            [FromQuery] string? status = null,         // "active", "completed", or null for all
            [FromQuery] string? searchTerm = null,     // Search by doctor name or date
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var result = await _prescriptionService.GetMyPrescriptionsWithFiltersAsync(
                    userId, status, searchTerm, page, pageSize);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get prescription statistics for patient dashboard
        /// </summary>
        [HttpGet("my-prescriptions/stats")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyPrescriptionStats()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var stats = await _prescriptionService.GetPatientPrescriptionStatsAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get prescription by ID
        /// </summary>
        [HttpGet("{prescriptionId}")]
        [Authorize(Roles = "Doctor,Patient")]
        public async Task<IActionResult> GetPrescription(int prescriptionId)
        {
            try
            {
                var prescription = await _prescriptionService.GetPrescriptionByIdAsync(prescriptionId);
                return Ok(prescription);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get prescription details (Enhanced for patient view)
        /// </summary>
        [HttpGet("{prescriptionId}/details")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetPrescriptionDetails(int prescriptionId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var details = await _prescriptionService.GetPrescriptionDetailsAsync(prescriptionId, userId);
                return Ok(details);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark prescription as read
        /// </summary>
        [HttpPut("{prescriptionId}/mark-read")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> MarkAsRead(int prescriptionId)
        {
            try
            {
                await _prescriptionService.MarkAsReadAsync(prescriptionId);
                return Ok(new { message = "Prescription marked as read" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
