using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Story;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoryController : ControllerBase
    {
        private readonly StoryService _storyService;
        private readonly IPatientRepository _patientRepository;
        private readonly IWebHostEnvironment _environment;
        private readonly string _webRoot;

        private static readonly string[] AllowedCoverExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

        public StoryController(StoryService storyService, IPatientRepository patientRepository, IWebHostEnvironment environment)
        {
            _storyService = storyService;
            _patientRepository = patientRepository;
            _environment = environment;
            _webRoot = string.IsNullOrEmpty(_environment.WebRootPath)
                ? _environment.ContentRootPath
                : _environment.WebRootPath;
        }

        // ?? Patient: publish a new story ??????????????????????????????????
        /// <summary>Publish a new patient story with optional cover image</summary>
        [HttpPost("create")]
        [Authorize(Roles = "Patient")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateStory(
            [FromForm] CreateStoryDto dto, IFormFile? coverImage)
        {
            try
            {
                var userId = GetUserId();

                if (coverImage != null)
                {
                    var ext = Path.GetExtension(coverImage.FileName).ToLowerInvariant();
                    if (!AllowedCoverExtensions.Contains(ext))
                        return BadRequest(new { message = "Cover image must be JPG, PNG or GIF" });
                    if (coverImage.Length > 5 * 1024 * 1024)
                        return BadRequest(new { message = "Cover image must not exceed 5 MB" });

                    var folder = Path.Combine(_webRoot, "uploads", "story-covers");
                    Directory.CreateDirectory(folder);

                    var fileName = $"cover_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid()}{ext}";
                    using var stream = new FileStream(Path.Combine(folder, fileName), FileMode.Create);
                    await coverImage.CopyToAsync(stream);
                    dto.ImageUrl = $"/uploads/story-covers/{fileName}";
                }

                var story = await _storyService.CreateStoryAsync(userId, dto);
                return Ok(new { message = "Story published successfully", data = story });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Public: paginated feed ????????????????????????????????????????
        /// <summary>Get published stories with pagination and optional tag filter</summary>
        [HttpGet("published")]
        public async Task<IActionResult> GetPublishedStories(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 6,
            [FromQuery] string? tag = null)
        {
            try
            {
                var result = await _storyService.GetPublishedStoriesPagedAsync(page, pageSize, tag);
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Public: patient avatars for home page stories section ???????????
        /// <summary>Returns name + avatar for all patients (used by the home page stories carousel)</summary>
        [HttpGet("patient-avatars")]
        public async Task<IActionResult> GetPatientAvatars([FromQuery] int limit = 8)
        {
            var patients = await _patientRepository.GetAllAsync(limit);
            var result = patients.Select(p => new
            {
                name = p.User?.FullName ?? "",
                avatar = p.User?.ProfilePicture ?? ""
            });
            return Ok(result);
        }

        // ?? Public: single story detail + 3 preview comments + related ????
        /// <summary>Get full story details including comments and related stories</summary>
        [HttpGet("{storyId:int}")]
        public async Task<IActionResult> GetStoryDetail(int storyId)
        {
            try
            {
                var detail = await _storyService.GetStoryDetailAsync(storyId);
                return Ok(detail);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Public: All Comments page � full thread with nested replies ????
        [HttpGet("{storyId:int}/comments")]
        public async Task<IActionResult> GetAllComments(int storyId)
        {
            try
            {
                var result = await _storyService.GetAllCommentsAsync(storyId);
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Admin: All Comments � same thread but with IsFlagged populated ?
        // Used by the admin "All Comments" view to render the red flag banners.
        [HttpGet("{storyId:int}/comments/admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCommentsAdmin(int storyId)
        {
            try
            {
                var result = await _storyService.GetAllCommentsAdminAsync(storyId);
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Authenticated: post a top-level comment ???????????????????????
        [HttpPost("{storyId:int}/comments")]
        [Authorize]
        public async Task<IActionResult> AddComment(int storyId, [FromBody] AddCommentDto dto)
        {
            try
            {
                var role = GetRole();
                var comment = await _storyService.AddCommentAsync(storyId, GetUserId(), role, dto);
                return Ok(new { message = "Comment posted", data = comment });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Authenticated: reply to a comment ?????????????????????????????
        [HttpPost("{storyId:int}/comments/{commentId:int}/reply")]
        [Authorize]
        public async Task<IActionResult> ReplyToComment(
            int storyId, int commentId, [FromBody] ReplyCommentDto dto)
        {
            try
            {
                var role = GetRole();
                var reply = await _storyService.ReplyToCommentAsync(
                    storyId, commentId, GetUserId(), role, dto);
                return Ok(new { message = "Reply posted", data = reply });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Authenticated: edit own comment ???????????????????????????????
        [HttpPut("{storyId:int}/comments/{commentId:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(
            int storyId, int commentId, [FromBody] AddCommentDto dto)
        {
            try
            {
                var updated = await _storyService.UpdateCommentAsync(commentId, GetUserId(), dto.Content);
                return Ok(new { message = "Comment updated", data = updated });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Authenticated: delete own comment; Admin can delete any ????????
        [HttpDelete("{storyId:int}/comments/{commentId:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int storyId, int commentId)
        {
            try
            {
                var isAdmin = User.IsInRole("Admin");
                await _storyService.DeleteCommentAsync(commentId, GetUserId(), isAdmin);
                return Ok(new { message = "Comment deleted" });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Authenticated: like a comment ?????????????????????????????????
        [HttpPost("{storyId:int}/comments/{commentId:int}/like")]
        [Authorize]
        public async Task<IActionResult> LikeComment(int storyId, int commentId)
        {
            try
            {
                var newCount = await _storyService.LikeCommentAsync(commentId);
                return Ok(new { likesCount = newCount });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Authenticated: like a story ???????????????????????????????????
        [HttpPost("{storyId:int}/like")]
        [Authorize]
        public async Task<IActionResult> LikeStory(int storyId)
        {
            try
            {
                var newCount = await _storyService.LikeStoryAsync(storyId, GetUserId(), GetRole());
                return Ok(new { likesCount = newCount });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Authenticated: share a story ??????????????????????????????????
        [HttpPost("{storyId:int}/share")]
        [Authorize]
        public async Task<IActionResult> ShareStory(int storyId)
        {
            try
            {
                var newCount = await _storyService.ShareStoryAsync(storyId);
                return Ok(new { sharesCount = newCount });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Patient: get own published stories (Settings profile section) ??
        [HttpGet("my-stories")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyStories()
        {
            try
            {
                var stories = await _storyService.GetPatientStoriesAsync(GetUserId());
                return Ok(stories);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Patient: edit their own story ?????????????????????????????????
        [HttpPut("{storyId:int}/mine")]
        [Authorize(Roles = "Patient")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateMyStory(
            int storyId, [FromForm] CreateStoryDto dto, IFormFile? coverImage)
        {
            try
            {
                var userId = GetUserId();

                if (coverImage != null)
                {
                    var ext = Path.GetExtension(coverImage.FileName).ToLowerInvariant();
                    if (!AllowedCoverExtensions.Contains(ext))
                        return BadRequest(new { message = "Cover image must be JPG, PNG or GIF" });
                    if (coverImage.Length > 5 * 1024 * 1024)
                        return BadRequest(new { message = "Cover image must not exceed 5 MB" });

                    var folder = Path.Combine(_webRoot, "uploads", "story-covers");
                    Directory.CreateDirectory(folder);

                    var fileName = $"cover_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid()}{ext}";
                    using var stream = new FileStream(Path.Combine(folder, fileName), FileMode.Create);
                    await coverImage.CopyToAsync(stream);
                    dto.ImageUrl = $"/uploads/story-covers/{fileName}";
                }

                var story = await _storyService.UpdateOwnStoryAsync(storyId, userId, dto);
                return Ok(new { message = "Story updated successfully", data = story });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Patient: delete their own story (with confirmation) ???????????
        [HttpDelete("{storyId:int}/mine")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> DeleteMyStory(int storyId)
        {
            try
            {
                await _storyService.DeleteOwnStoryAsync(storyId, GetUserId());
                return Ok(new { message = "Story deleted successfully" });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Admin: all stories ????????????????????????????????????????????
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllStories()
        {
            try
            {
                var stories = await _storyService.GetAllStoriesAsync();
                return Ok(stories);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Admin: hide a story ???????????????????????????????????????????
        [HttpPut("hide/{storyId:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> HideStory(int storyId)
        {
            try
            {
                var story = await _storyService.HideStoryAsync(storyId, GetUserId());
                return Ok(new
                {
                    message = story.IsHidden ? "Story hidden" : "Story unhidden",
                    data = story
                });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Admin: delete any story ???????????????????????????????????????
        [HttpDelete("{storyId:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStory(int storyId)
        {
            try
            {
                await _storyService.DeleteStoryAsync(storyId, GetUserId());
                return Ok(new { message = "Story deleted" });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ?? Helpers ???????????????????????????????????????????????????????
        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new Exception("Invalid token");
            return id;
        }

        private UserRole GetRole()
        {
            var roleString = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            Enum.TryParse<UserRole>(roleString, out var role);
            return role;
        }
    }
}
