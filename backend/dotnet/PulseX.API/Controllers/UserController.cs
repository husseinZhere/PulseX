using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.User;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IWebHostEnvironment _env;

        public UserController(UserService userService, IWebHostEnvironment env)
        {
            _userService = userService;
            _env = env;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        /// <summary>
        /// Get current user profile (Patient specific)
        /// </summary>
        [HttpGet("profile")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetUserId();
                var result = await _userService.GetPatientProfileAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update patient profile information
        /// </summary>
        [HttpPut("profile")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdatePatientProfileDto dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userService.UpdatePatientProfileAsync(userId, dto);
                return Ok(new { message = "Profile updated successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Upload profile picture
        /// </summary>
        [HttpPost("profile/upload-picture")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Invalid file type. Only JPG, PNG, and GIF are allowed." });
                }

                // Validate file size (5MB max)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size must not exceed 5MB" });
                }

                var userId = GetUserId();
                var fileName = $"profile_{userId}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
                var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
                var uploadsFolder = Path.Combine(webRoot, "uploads", "profile-pictures");
                
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/profile-pictures/{fileName}";
                await _userService.UpdateProfilePictureAsync(userId, fileUrl);

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
        /// Update account settings (notifications, dark mode)
        /// </summary>
        [HttpPut("settings")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> UpdateAccountSettings([FromBody] UpdateAccountSettingsDto dto)
        {
            try
            {
                var userId = GetUserId();
                await _userService.UpdateAccountSettingsAsync(userId, dto);
                return Ok(new { message = "Settings updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Logout - Clear session (optional)
        /// </summary>
        [HttpPost("logout")]
        [Authorize(Roles = "Patient")]
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
        /// Change password
        /// </summary>
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                // Check model validation
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    return BadRequest(new { 
                        message = "Validation failed",
                        errors = errors
                    });
                }

                var userId = GetUserId();
                await _userService.ChangePasswordAsync(userId, dto);
                
                return Ok(new { 
                    success = true,
                    message = "Password changed successfully" 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false,
                    message = ex.Message 
                });
            }
        }

        /// <summary>
        /// Get patient dashboard (kept for backward compatibility)
        /// </summary>
        [HttpGet("dashboard")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetPatientDashboard()
        {
            try
            {
                var userId = GetUserId();
                var dashboard = await _userService.GetPatientDashboardAsync(userId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update patient health data
        /// </summary>
        [HttpPut("health-data")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> UpdateHealthData([FromBody] UpdateHealthDataDto dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _userService.UpdateHealthDataAsync(userId, dto);
                return Ok(new { message = "Health data updated successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get health data options (for dropdowns)
        /// </summary>
        [HttpGet("health-data/options")]
        [Authorize(Roles = "Patient")]
        public IActionResult GetHealthDataOptions()
        {
            try
            {
                var options = _userService.GetHealthDataOptions();
                return Ok(options);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
