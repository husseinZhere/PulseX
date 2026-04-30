using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Admin;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;
        private readonly IWebHostEnvironment _environment;

        public AdminController(AdminService adminService, IWebHostEnvironment environment)
        {
            _adminService = adminService;
            _environment = environment;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        [HttpPost("doctors/create")]
        public async Task<IActionResult> CreateDoctor([FromForm] CreateDoctorByAdminDto dto, IFormFile? profilePicture)
        {
            try
            {
                var adminId = GetUserId();
                string? profilePicturePath = null;

                if (profilePicture != null)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(profilePicture.FileName).ToLower();

                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Only JPG, JPEG, and PNG files are allowed" });
                    }

                    if (profilePicture.Length > 10 * 1024 * 1024) // 10MB
                    {
                        return BadRequest(new { message = "File size must be less than 10MB" });
                    }

                    var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? _environment.ContentRootPath : _environment.WebRootPath;
                    var uploadsFolder = Path.Combine(webRoot, "uploads", "doctors");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await profilePicture.CopyToAsync(fileStream);
                    }

                    profilePicturePath = $"/uploads/doctors/{uniqueFileName}";
                }

                var result = await _adminService.CreateDoctorByAdminAsync(dto, adminId, profilePicturePath);
                return Ok(new { message = "Doctor created successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("patients/create")]
        public async Task<IActionResult> CreatePatient([FromForm] CreatePatientByAdminDto dto, IFormFile? profilePicture)
        {
            try
            {
                var adminId = GetUserId();
                string? profilePicturePath = null;

                if (profilePicture != null)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(profilePicture.FileName).ToLower();

                    if (!allowedExtensions.Contains(extension))
                        return BadRequest(new { message = "Only JPG, JPEG, and PNG files are allowed" });

                    if (profilePicture.Length > 10 * 1024 * 1024)
                        return BadRequest(new { message = "File size must be less than 10MB" });

                    var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? _environment.ContentRootPath : _environment.WebRootPath;
                    var uploadsFolder = Path.Combine(webRoot, "uploads", "patients");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await profilePicture.CopyToAsync(fileStream);
                    }

                    profilePicturePath = $"/uploads/patients/{uniqueFileName}";
                }

                var result = await _adminService.CreatePatientByAdminAsync(dto, adminId, profilePicturePath);
                return Ok(new { message = "Patient created successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _adminService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("users/{userId}/status")]
        public async Task<IActionResult> UpdateUserStatus(string userId, [FromBody] UpdateUserStatusDto statusDto)
        {
            try
            {
                var adminId = GetUserId();

                if (!int.TryParse(userId, out int userIdInt))
                    return BadRequest(new { message = "Invalid user ID format" });

                var user = await _adminService.UpdateUserStatusAsync(userIdInt, statusDto, adminId);
                return Ok(new { message = "User status updated successfully", data = user });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("activity-logs")]
        public async Task<IActionResult> GetAllActivityLogs()
        {
            try
            {
                var logs = await _adminService.GetAllActivityLogsAsync();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("activity-logs/{userId}")]
        public async Task<IActionResult> GetUserActivityLogs(string userId)
        {
            try
            {
                if (!int.TryParse(userId, out int userIdInt))
                    return BadRequest(new { message = "Invalid user ID format" });

                var logs = await _adminService.GetUserActivityLogsAsync(userIdInt);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("doctors/pending")]
        public async Task<IActionResult> GetPendingDoctors()
        {
            try
            {
                var doctors = await _adminService.GetPendingDoctorsAsync();
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("doctors/{doctorId}/approve")]
        public async Task<IActionResult> ApproveDoctor(int doctorId, [FromBody] ApproveDoctorDto dto)
        {
            try
            {
                var adminId = GetUserId();
                var result = await _adminService.ApproveDoctorAsync(doctorId, adminId, dto);
                return Ok(new 
                { 
                    message = dto.IsApproved ? "Doctor approved successfully" : "Doctor rejected",
                    data = result 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("doctors/{doctorUserId}/update")]
        public async Task<IActionResult> UpdateDoctor(int doctorUserId, [FromForm] UpdateDoctorByAdminDto dto, IFormFile? profilePicture)
        {
            try
            {
                var adminId = GetUserId();
                string? profilePicturePath = null;

                if (profilePicture != null)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(profilePicture.FileName).ToLower();

                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Only JPG, JPEG, and PNG files are allowed" });
                    }

                    if (profilePicture.Length > 10 * 1024 * 1024)
                    {
                        return BadRequest(new { message = "File size must be less than 10MB" });
                    }

                    var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? _environment.ContentRootPath : _environment.WebRootPath;
                    var uploadsFolder = Path.Combine(webRoot, "uploads", "doctors");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await profilePicture.CopyToAsync(fileStream);
                    }

                    profilePicturePath = $"/uploads/doctors/{uniqueFileName}";
                }

                var result = await _adminService.UpdateDoctorByAdminAsync(doctorUserId, dto, adminId, profilePicturePath);
                return Ok(new { message = "Doctor updated successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("patients/{patientUserId}/update")]
        public async Task<IActionResult> UpdatePatient(int patientUserId, [FromForm] UpdatePatientByAdminDto dto, IFormFile? profilePicture)
        {
            try
            {
                var adminId = GetUserId();
                string? profilePicturePath = null;

                if (profilePicture != null)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(profilePicture.FileName).ToLower();

                    if (!allowedExtensions.Contains(extension))
                        return BadRequest(new { message = "Only JPG, JPEG, and PNG files are allowed" });

                    if (profilePicture.Length > 10 * 1024 * 1024)
                        return BadRequest(new { message = "File size must be less than 10MB" });

                    var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? _environment.ContentRootPath : _environment.WebRootPath;
                    var uploadsFolder = Path.Combine(webRoot, "uploads", "patients");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await profilePicture.CopyToAsync(fileStream);
                    }

                    profilePicturePath = $"/uploads/patients/{uniqueFileName}";
                }

                var result = await _adminService.UpdatePatientByAdminAsync(patientUserId, dto, adminId, profilePicturePath);
                return Ok(new { message = "Patient updated successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("doctors/{doctorUserId:int}")]
        public async Task<IActionResult> DeleteDoctor(int doctorUserId)
        {
            try
            {
                var adminId = GetUserId();
                await _adminService.DeleteDoctorByAdminAsync(doctorUserId, adminId);
                return Ok(new { message = "Doctor deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("patients/{patientUserId:int}")]
        public async Task<IActionResult> DeletePatient(int patientUserId)
        {
            try
            {
                var adminId = GetUserId();
                await _adminService.DeletePatientByAdminAsync(patientUserId, adminId);
                return Ok(new { message = "Patient deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var dashboard = await _adminService.GetAdminDashboardAsync();
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ?? Content Moderation ????????????????????????????????????????????

        /// <summary>
        /// Permanently delete a story that violates community rules
        /// (bullying, wrong medical information, etc.).
        /// </summary>
        [HttpDelete("moderation/stories/{storyId:int}")]
        public async Task<IActionResult> DeleteStory(int storyId, [FromBody] ModerateContentDto dto)
        {
            try
            {
                await _adminService.DeleteStoryByAdminAsync(storyId, GetUserId(), dto);
                return Ok(new { message = "Story removed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Permanently delete a comment or reply that violates community rules
        /// (bullying, wrong medical information, etc.).
        /// </summary>
        [HttpDelete("moderation/comments/{commentId:int}")]
        public async Task<IActionResult> DeleteComment(int commentId, [FromBody] ModerateContentDto dto)
        {
            try
            {
                await _adminService.DeleteCommentByAdminAsync(commentId, GetUserId(), dto);
                return Ok(new { message = "Comment removed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
