using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Report;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    /// <summary>
    /// Admin Reports Management Controller
    /// Handles all content reporting moderation actions for Stories, Comments, and Replies
    /// </summary>
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/reports")]
    public class ReportsManagementController : ControllerBase
    {
        private readonly ContentReportService _reportService;
        private readonly ILogger<ReportsManagementController> _logger;

        public ReportsManagementController(
            ContentReportService reportService,
            ILogger<ReportsManagementController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard statistics for reports management
        /// Returns: Total Reports, Pending Review, Reviewed, Dismissed
        /// </summary>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(ReportStatisticsDto), 200)]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var stats = await _reportService.GetStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve report statistics");
                return StatusCode(500, new { message = "Failed to retrieve statistics" });
            }
        }

        /// <summary>
        /// Get all reports with optional status filter
        /// Status options: Pending, Reviewed, Dismissed, or null for all
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ContentReportDto>), 200)]
        public async Task<IActionResult> GetAllReports([FromQuery] string? status = null)
        {
            try
            {
                // Validate status if provided
                if (!string.IsNullOrWhiteSpace(status))
                {
                    var validStatuses = new[] { "Pending", "Reviewed", "Dismissed" };
                    if (!validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
                    {
                        return BadRequest(new { message = $"Invalid status. Must be one of: {string.Join(", ", validStatuses)}" });
                    }
                }

                var reports = await _reportService.GetAllReportsAsync(status);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve reports with status filter: {Status}", status);
                return StatusCode(500, new { message = "Failed to retrieve reports" });
            }
        }

        /// <summary>
        /// Get a specific report by ID
        /// </summary>
        [HttpGet("{reportId}")]
        [ProducesResponseType(typeof(ContentReportDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetReportById(int reportId)
        {
            try
            {
                var report = await _reportService.GetReportByIdAsync(reportId);
                if (report == null)
                    return NotFound(new { message = "Report not found" });

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve report {ReportId}", reportId);
                return StatusCode(500, new { message = "Failed to retrieve report" });
            }
        }

        /// <summary>
        /// Mark a report as Reviewed (without deleting content)
        /// Useful for keeping audit trail
        /// </summary>
        [HttpPatch("{reportId}/review")]
        [ProducesResponseType(typeof(ContentReportDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> MarkReviewed(int reportId, [FromBody] UpdateReportStatusDto dto)
        {
            try
            {
                var adminUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                // Force status to Reviewed
                dto.Status = "Reviewed";

                var updatedReport = await _reportService.UpdateReportStatusAsync(reportId, adminUserId, dto);
                
                _logger.LogInformation(
                    "Admin {AdminId} marked report {ReportId} as Reviewed", 
                    adminUserId, reportId);

                return Ok(updatedReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to mark report {ReportId} as reviewed", reportId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Dismiss a report (marks as invalid/non-violating)
        /// Clears from active queue
        /// </summary>
        [HttpPatch("{reportId}/dismiss")]
        [ProducesResponseType(typeof(ContentReportDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DismissReport(int reportId, [FromBody] UpdateReportStatusDto dto)
        {
            try
            {
                var adminUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                // Force status to Dismissed
                dto.Status = "Dismissed";

                var updatedReport = await _reportService.UpdateReportStatusAsync(reportId, adminUserId, dto);
                
                _logger.LogInformation(
                    "Admin {AdminId} dismissed report {ReportId}", 
                    adminUserId, reportId);

                return Ok(updatedReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to dismiss report {ReportId}", reportId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete the reported content (Story or Comment) and mark report as Reviewed
        /// This is the primary moderation action for violating content
        /// </summary>
        [HttpDelete("{reportId}/delete-content")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteReportedContent(int reportId, [FromBody] UpdateReportStatusDto dto)
        {
            try
            {
                var adminUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var result = await _reportService.DeleteReportedContentAsync(reportId, adminUserId, dto.AdminNote);
                
                _logger.LogInformation(
                    "Admin {AdminId} deleted {ContentType} #{ContentId} from report {ReportId}", 
                    adminUserId, result.ContentType, result.ContentId, reportId);

                return Ok(new
                {
                    success = true,
                    message = $"{result.ContentType} successfully deleted",
                    deletedContentType = result.ContentType,
                    deletedContentId = result.ContentId,
                    report = result.UpdatedReport
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete content for report {ReportId}", reportId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Bulk action: Delete multiple reports' content at once
        /// </summary>
        [HttpPost("bulk-delete")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> BulkDeleteContent([FromBody] BulkDeleteReportsDto dto)
        {
            try
            {
                var adminUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var results = await _reportService.BulkDeleteReportedContentAsync(
                    dto.ReportIds, 
                    adminUserId, 
                    dto.AdminNote);

                _logger.LogInformation(
                    "Admin {AdminId} performed bulk delete on {Count} reports", 
                    adminUserId, dto.ReportIds.Count);

                return Ok(new
                {
                    success = true,
                    totalProcessed = results.Count,
                    results
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to perform bulk delete");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Bulk action: Dismiss multiple reports at once
        /// </summary>
        [HttpPost("bulk-dismiss")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> BulkDismissReports([FromBody] BulkDismissReportsDto dto)
        {
            try
            {
                var adminUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var results = await _reportService.BulkDismissReportsAsync(
                    dto.ReportIds, 
                    adminUserId, 
                    dto.AdminNote);

                _logger.LogInformation(
                    "Admin {AdminId} performed bulk dismiss on {Count} reports", 
                    adminUserId, dto.ReportIds.Count);

                return Ok(new
                {
                    success = true,
                    totalDismissed = results.Count,
                    reports = results
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to perform bulk dismiss");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all flagged comments for a specific story
        /// Used in "All Comments" management view
        /// </summary>
        [HttpGet("story/{storyId}/flagged-comments")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetFlaggedCommentsForStory(int storyId)
        {
            try
            {
                var flaggedComments = await _reportService.GetFlaggedCommentsForStoryAsync(storyId);
                
                return Ok(new
                {
                    storyId,
                    flaggedCommentIds = flaggedComments.FlaggedCommentIds,
                    totalFlagged = flaggedComments.FlaggedCommentIds.Count,
                    reports = flaggedComments.Reports
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve flagged comments for story {StoryId}", storyId);
                return StatusCode(500, new { message = "Failed to retrieve flagged comments" });
            }
        }

        /// <summary>
        /// Quick delete a comment directly (without going through report)
        /// Used in "All Comments" view with trash icon
        /// </summary>
        [HttpDelete("comment/{commentId}")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> QuickDeleteComment(int commentId, [FromBody] QuickDeleteDto dto)
        {
            try
            {
                var adminUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                await _reportService.QuickDeleteCommentAsync(commentId, adminUserId, dto.Reason);
                
                _logger.LogInformation(
                    "Admin {AdminId} quick-deleted comment {CommentId}", 
                    adminUserId, commentId);

                return Ok(new
                {
                    success = true,
                    message = "Comment successfully deleted"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete comment {CommentId}", commentId);
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
