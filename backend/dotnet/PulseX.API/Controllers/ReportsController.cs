using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Report;
using PulseX.Core.Enums;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ContentReportService _reportService;

        public ReportsController(ContentReportService reportService)
        {
            _reportService = reportService;
        }

        // ?? User-facing: submit a report on a story ???????????????????????
        /// <summary>
        /// Any authenticated user (patient or doctor) reports a story.
        /// Category: Spam | Harassment | Misinformation | InappropriateContent | Other
        /// </summary>
        [HttpPost("stories/{storyId:int}")]
        [Authorize]
        public async Task<IActionResult> ReportStory(int storyId, [FromBody] SubmitReportDto dto)
        {
            try
            {
                dto.TargetType = "Story";
                dto.TargetId   = storyId;

                var result = await _reportService.SubmitReportAsync(GetUserId(), GetRole(), dto);
                return Ok(new { message = "Report submitted successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ?? User-facing: submit a report on a comment / reply ?????????????
        /// <summary>
        /// Any authenticated user (patient or doctor) reports a comment or reply.
        /// Category: Spam | Harassment | Misinformation | InappropriateContent | Other
        /// </summary>
        [HttpPost("comments/{commentId:int}")]
        [Authorize]
        public async Task<IActionResult> ReportComment(int commentId, [FromBody] SubmitReportDto dto)
        {
            try
            {
                dto.TargetType = "Comment";
                dto.TargetId   = commentId;

                var result = await _reportService.SubmitReportAsync(GetUserId(), GetRole(), dto);
                return Ok(new { message = "Report submitted successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ?? Admin: list all reports (optionally filtered by status) ????????
        /// <summary>
        /// Returns all reports. Pass ?status=Pending / Reviewed / Dismissed to filter.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReports([FromQuery] string? status = null)
        {
            try
            {
                var reports = await _reportService.GetAllReportsAsync(status);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ?? Admin: statistics cards ???????????????????????????????????????
        /// <summary>
        /// Returns the four statistic counters shown at the top of the
        /// Reports Management page (Total, Pending, Reviewed, Dismissed).
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var stats = await _reportService.GetStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ?? Admin: mark a report as Reviewed or Dismissed ?????????????????
        /// <summary>
        /// Updates a report's status to "Reviewed" or "Dismissed".
        /// Optionally attach an admin note.
        /// </summary>
        [HttpPut("{reportId:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateReportStatus(
            int reportId, [FromBody] UpdateReportStatusDto dto)
        {
            try
            {
                var result = await _reportService.UpdateReportStatusAsync(reportId, GetUserId(), dto);
                return Ok(new { message = $"Report marked as {dto.Status}", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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
