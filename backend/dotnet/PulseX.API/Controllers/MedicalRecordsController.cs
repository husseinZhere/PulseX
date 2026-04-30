using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly MedicalRecordManagementService _medicalRecordService;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public MedicalRecordsController(
            MedicalRecordManagementService medicalRecordService,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            _medicalRecordService = medicalRecordService;
            _configuration = configuration;
            _environment = environment;
        }

        /// <summary>
        /// Upload medical record (ECG or X-Ray)
        /// </summary>
        [HttpPost("upload")]
        [Authorize(Roles = "Patient")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadRecord([FromForm] UploadMedicalRecordRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var result = await _medicalRecordService.UploadMedicalRecordAsync(userId, request.RecordType, request.File, request.Notes);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all medical records with summary for logged-in patient
        /// </summary>
        [HttpGet("my-records")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyRecords()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var result = await _medicalRecordService.GetAllRecordsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get medical records by type (ECG or X-Ray)
        /// </summary>
        [HttpGet("my-records/{recordType}")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyRecordsByType(string recordType)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var result = await _medicalRecordService.GetRecordsByTypeAsync(userId, recordType);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a medical record
        /// </summary>
        [HttpDelete("{recordId}")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> DeleteRecord(int recordId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                await _medicalRecordService.DeleteRecordAsync(userId, recordId);
                return Ok(new { message = "Record deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Generate QR Code for sharing medical records with doctor
        /// </summary>
        [HttpGet("generate-qr")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GenerateQRCode()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var result = await _medicalRecordService.GenerateQRCodeAsync(userId, baseUrl);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Download all medical records as PDF
        /// </summary>
        [HttpGet("download-pdf")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> DownloadAllRecordsAsPdf()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var pdfBytes = await _medicalRecordService.GeneratePdfWithAllRecordsAsync(userId);
                return File(pdfBytes, "application/pdf", $"MedicalRecords_{DateTime.UtcNow:yyyyMMdd}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Public view of medical records via QR Code scan (no auth required)
        /// </summary>
        [HttpGet("public/{patientId}")]
        [AllowAnonymous]
        public async Task<IActionResult> ViewPublicPatientRecords(int patientId)
        {
            try
            {
                var result = await _medicalRecordService.GetAllRecordsByPatientIdAsync(patientId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// View medical records via QR Code (Doctor access)
        /// </summary>
        [HttpGet("view/{patientId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> ViewPatientRecords(int patientId)
        {
            try
            {
                var result = await _medicalRecordService.GetAllRecordsByPatientIdAsync(patientId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Download patient records as PDF (Doctor access)
        /// </summary>
        [HttpGet("view/{patientId}/download-pdf")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> DownloadPatientRecordsAsPdf(int patientId)
        {
            try
            {
                var pdfBytes = await _medicalRecordService.GeneratePdfByPatientIdAsync(patientId);
                return File(pdfBytes, "application/pdf", $"Patient_{patientId}_MedicalRecords_{DateTime.UtcNow:yyyyMMdd}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    /// <summary>
    /// Request model for uploading medical records
    /// </summary>
    public class UploadMedicalRecordRequest
    {
        /// <summary>
        /// Record type: "ECG", "X-Ray", or "Medical File"
        /// </summary>
        public string RecordType { get; set; } = string.Empty;

        /// <summary>
        /// Medical record file (Image or PDF, max 10MB)
        /// </summary>
        public IFormFile File { get; set; } = null!;

        /// <summary>
        /// Optional notes about the record
        /// </summary>
        public string? Notes { get; set; }
    }
}
