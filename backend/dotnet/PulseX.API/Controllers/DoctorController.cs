using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Doctor;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DoctorController : ControllerBase
    {
        private readonly DoctorService _doctorService;
        private readonly IWebHostEnvironment _env;

        public DoctorController(DoctorService doctorService, IWebHostEnvironment env)
        {
            _doctorService = doctorService;
            _env = env;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDoctors([FromQuery] bool includeUnapproved = false)
        {
            try
            {
                // Only admins can see unapproved doctors
                var isAdmin = User.IsInRole("Admin");
                var approvedOnly = !includeUnapproved || !isAdmin;
                
                var doctors = await _doctorService.GetAllDoctorsAsync(approvedOnly);
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorProfile(int id)
        {
            try
            {
                var doctor = await _doctorService.GetDoctorProfileAsync(id);
                return Ok(doctor);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/ratings")]
        public async Task<IActionResult> GetDoctorRatings(int id)
        {
            try
            {
                var ratings = await _doctorService.GetDoctorRatingsAsync(id);
                return Ok(ratings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("rate")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> RateDoctor([FromBody] SubmitRatingDto dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _doctorService.SubmitRatingAsync(userId, dto);
                return Ok(new { message = "Rating submitted successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("dashboard")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorDashboard()
        {
            try
            {
                var userId = GetUserId();
                var dashboard = await _doctorService.GetDoctorDashboardAsync(userId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Logout - Doctor logout endpoint
        /// </summary>
        [HttpPost("logout")]
        [Authorize(Roles = "Doctor")]
        public IActionResult Logout()
        {
            try
            {
                var userId = GetUserId();
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                
                return Ok(new 
                { 
                    success = true,
                    message = "?? ????? ?????? ?????",
                    messageEn = "Logged out successfully",
                    user = new 
                    {
                        userId = userId,
                        userName = userName
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new 
                { 
                    success = false,
                    message = "??? ????? ??????",
                    messageEn = "Logout failed",
                    error = ex.Message 
                });
            }
        }

        /// <summary>
        /// Get doctor's own profile (for Settings page)
        /// </summary>
        [HttpGet("profile")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorProfile()
        {
            try
            {
                var userId = GetUserId();
                var profile = await _doctorService.GetDoctorSettingsProfileAsync(userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update doctor's profile (in Settings page)
        /// </summary>
        [HttpPut("profile")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateDoctorProfile([FromBody] UpdateDoctorProfileDto dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _doctorService.UpdateDoctorSettingsProfileAsync(userId, dto);
                return Ok(new { message = "Profile updated successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Upload doctor's profile picture
        /// </summary>
        [HttpPost("profile/upload-picture")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Invalid file type. Only JPG, PNG, and GIF are allowed." });
                }

                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size must not exceed 5MB" });
                }

                var userId = GetUserId();
                var fileName = $"doctor_profile_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
                var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "doctors");
                
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/doctors/{fileName}";
                await _doctorService.UpdateDoctorProfilePictureAsync(userId, fileUrl);

                return Ok(new { 
                    message = "Profile picture uploaded successfully", 
                    profilePicture = fileUrl 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get appointments that need rating (Patient only)
        /// </summary>
        [HttpGet("pending-ratings")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetPendingRatings()
        {
            try
            {
                var userId = GetUserId();
                var pendingRatings = await _doctorService.GetPendingRatingsAsync(userId);
                return Ok(pendingRatings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get list of patients for doctor (Patient List page)
        /// </summary>
        [HttpGet("patients")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorPatients()
        {
            try
            {
                var userId = GetUserId();
                var patients = await _doctorService.GetDoctorPatientsAsync(userId);
                return Ok(patients);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed patient profile (when doctor clicks "View Record")
        /// </summary>
        [HttpGet("patients/{patientId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetPatientProfile(int patientId)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _doctorService.GetPatientProfileForDoctorAsync(userId, patientId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add/Update patient's medical data (from "Add Medical Records" modal)
        /// </summary>
        [HttpPost("patients/{patientId}/medical-data")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AddPatientMedicalData(int patientId, [FromBody] AddPatientMedicalDataDto dto)
        {
            try
            {
                var userId = GetUserId();
                await _doctorService.AddPatientMedicalDataAsync(userId, patientId, dto);
                return Ok(new { message = "Medical data added successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
