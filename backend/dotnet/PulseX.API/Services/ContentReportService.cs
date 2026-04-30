using PulseX.Core.DTOs.Report;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class ContentReportService
    {
        private readonly IContentReportRepository _reportRepository;
        private readonly IStoryRepository _storyRepository;
        private readonly IStoryCommentRepository _commentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUserRepository _userRepository;
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly ILogger<ContentReportService> _logger;

        public ContentReportService(
            IContentReportRepository reportRepository,
            IStoryRepository storyRepository,
            IStoryCommentRepository commentRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            IUserRepository userRepository,
            IActivityLogRepository activityLogRepository,
            ILogger<ContentReportService> logger)
        {
            _reportRepository   = reportRepository;
            _storyRepository    = storyRepository;
            _commentRepository  = commentRepository;
            _patientRepository  = patientRepository;
            _doctorRepository   = doctorRepository;
            _userRepository     = userRepository;
            _activityLogRepository = activityLogRepository;
            _logger             = logger;
        }

        // ?? Submit a report (patient or doctor) ???????????????????????????
        public async Task<ContentReportDto> SubmitReportAsync(
            int reporterUserId, UserRole role, SubmitReportDto dto)
        {
            if (!ReportCategory.IsValid(dto.Category))
                throw new Exception($"Invalid category '{dto.Category}'. " +
                    "Allowed: Spam, Harassment, Misinformation, InappropriateContent, Other");

            var validTargetTypes = new HashSet<string> { "Story", "Comment" };
            if (!validTargetTypes.Contains(dto.TargetType))
                throw new Exception("TargetType must be 'Story' or 'Comment'");

            // Resolve reporter name
            var reporterName = await ResolveUserNameAsync(reporterUserId, role);

            // Resolve snapshot of the reported content
            string contentSnapshot;
            string authorName;
            int? storyId = null;
            string storyTitle = string.Empty;

            if (dto.TargetType == "Story")
            {
                var story = await _storyRepository.GetByIdAsync(dto.TargetId)
                    ?? throw new Exception("Story not found");

                contentSnapshot = story.Title;
                authorName      = story.Patient?.User?.FullName ?? "Unknown";
                storyId         = story.Id;
                storyTitle      = story.Title;
            }
            else // Comment
            {
                var comment = await _commentRepository.GetByIdAsync(dto.TargetId)
                    ?? throw new Exception("Comment not found");

                contentSnapshot = comment.Content;
                authorName      = comment.CommenterName;
                storyId         = comment.StoryId;

                var parentStory = await _storyRepository.GetByIdAsync(comment.StoryId);
                storyTitle = parentStory?.Title ?? string.Empty;
            }

            var report = new ContentReport
            {
                ReporterUserId        = reporterUserId,
                ReporterName          = reporterName,
                TargetType            = dto.TargetType,
                TargetId              = dto.TargetId,
                TargetContentSnapshot = contentSnapshot,
                TargetAuthorName      = authorName,
                StoryId               = storyId,
                StoryTitle            = storyTitle,
                Category              = dto.Category,
                Reason                = dto.Reason?.Trim() ?? string.Empty,
                Status                = "Pending",
                CreatedAt             = DateTime.UtcNow
            };

            await _reportRepository.AddAsync(report);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId     = reporterUserId,
                Action     = "Report Submitted",
                EntityType = "ContentReport",
                EntityId   = report.Id,
                Details    = $"{reporterName} reported a {dto.TargetType} for '{dto.Category}'" +
                             (string.IsNullOrEmpty(storyTitle) ? "" : $" on story \"{storyTitle}\"") +
                             (string.IsNullOrEmpty(dto.Reason) ? "." : $". Reason: {dto.Reason}")
            });

            _logger.LogInformation(
                "Report #{Id} filed by User {UserId} on {Type} #{TargetId} — Category: {Cat}",
                report.Id, reporterUserId, dto.TargetType, dto.TargetId, dto.Category);

            return MapToDto(report);
        }

        // ?? Admin: get all reports ????????????????????????????????????????
        public async Task<IEnumerable<ContentReportDto>> GetAllReportsAsync(string? status = null)
        {
            IEnumerable<ContentReport> reports = string.IsNullOrWhiteSpace(status)
                ? await _reportRepository.GetAllAsync()
                : await _reportRepository.GetByStatusAsync(status);

            return reports.Select(MapToDto);
        }

        // ?? Admin: get report by ID ???????????????????????????????????????
        public async Task<ContentReportDto?> GetReportByIdAsync(int reportId)
        {
            var report = await _reportRepository.GetByIdAsync(reportId);
            return report == null ? null : MapToDto(report);
        }

        // ?? Admin: statistics cards ???????????????????????????????????????
        public async Task<ReportStatisticsDto> GetStatisticsAsync()
        {
            return new ReportStatisticsDto
            {
                TotalReports  = await _reportRepository.CountAllAsync(),
                PendingReview = await _reportRepository.CountByStatusAsync("Pending"),
                Reviewed      = await _reportRepository.CountByStatusAsync("Reviewed"),
                Dismissed     = await _reportRepository.CountByStatusAsync("Dismissed")
            };
        }

        // ?? Admin: mark reviewed ??????????????????????????????????????????
        public async Task<ContentReportDto> UpdateReportStatusAsync(
            int reportId, int adminUserId, UpdateReportStatusDto dto)
        {
            var allowedStatuses = new HashSet<string> { "Reviewed", "Dismissed" };
            if (!allowedStatuses.Contains(dto.Status))
                throw new Exception("Status must be 'Reviewed' or 'Dismissed'");

            var report = await _reportRepository.GetByIdAsync(reportId)
                ?? throw new Exception("Report not found");

            report.Status          = dto.Status;
            report.ReviewedAt      = DateTime.UtcNow;
            report.ReviewedByAdminId = adminUserId;
            report.AdminNote       = dto.AdminNote;

            await _reportRepository.UpdateAsync(report);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId     = adminUserId,
                Action     = $"Report {dto.Status}",
                EntityType = "ContentReport",
                EntityId   = reportId,
                Details    = $"Report #{reportId} ({report.Category} on {report.TargetType} #{report.TargetId}) " +
                             $"marked as {dto.Status}. Note: {dto.AdminNote ?? "�"}"
            });

            return MapToDto(report);
        }

        // ?? Admin: delete reported content and mark report as reviewed ??????????
        public async Task<DeleteContentResultDto> DeleteReportedContentAsync(
            int reportId, int adminUserId, string? adminNote = null)
        {
            var report = await _reportRepository.GetByIdAsync(reportId)
                ?? throw new Exception("Report not found");

            if (report.Status != "Pending")
                throw new Exception($"Cannot delete content for a {report.Status} report");

            // Delete the actual content
            if (report.TargetType == "Story")
            {
                await _storyRepository.DeleteAsync(report.TargetId);
                _logger.LogInformation("Deleted story #{StoryId} based on report #{ReportId}", 
                    report.TargetId, reportId);
            }
            else if (report.TargetType == "Comment")
            {
                await _commentRepository.DeleteAsync(report.TargetId);
                _logger.LogInformation("Deleted comment #{CommentId} based on report #{ReportId}", 
                    report.TargetId, reportId);
            }
            else
            {
                throw new Exception($"Unknown target type: {report.TargetType}");
            }

            // Update report status to Reviewed
            report.Status = "Reviewed";
            report.ReviewedAt = DateTime.UtcNow;
            report.ReviewedByAdminId = adminUserId;
            report.AdminNote = adminNote ?? $"Content deleted by admin due to policy violation ({report.Category})";

            await _reportRepository.UpdateAsync(report);

            // Log the action
            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Content Deleted",
                EntityType = report.TargetType,
                EntityId = report.TargetId,
                Details = $"Deleted {report.TargetType} #{report.TargetId} from Report #{reportId}. " +
                         $"Reason: {report.Category}. Admin note: {report.AdminNote}"
            });

            return new DeleteContentResultDto
            {
                ContentType = report.TargetType,
                ContentId = report.TargetId,
                UpdatedReport = MapToDto(report)
            };
        }

        // ?? Admin: bulk delete multiple reports' content ???????????????????
        public async Task<List<DeleteContentResultDto>> BulkDeleteReportedContentAsync(
            List<int> reportIds, int adminUserId, string? adminNote = null)
        {
            var results = new List<DeleteContentResultDto>();

            foreach (var reportId in reportIds)
            {
                try
                {
                    var result = await DeleteReportedContentAsync(reportId, adminUserId, adminNote);
                    results.Add(result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to delete content for report {ReportId} during bulk operation", reportId);
                    // Continue with other reports
                }
            }

            return results;
        }

        // ?? Admin: bulk dismiss multiple reports ???????????????????????????
        public async Task<List<ContentReportDto>> BulkDismissReportsAsync(
            List<int> reportIds, int adminUserId, string? adminNote = null)
        {
            var results = new List<ContentReportDto>();

            foreach (var reportId in reportIds)
            {
                try
                {
                    var dto = new UpdateReportStatusDto
                    {
                        Status = "Dismissed",
                        AdminNote = adminNote
                    };
                    var result = await UpdateReportStatusAsync(reportId, adminUserId, dto);
                    results.Add(result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to dismiss report {ReportId} during bulk operation", reportId);
                    // Continue with other reports
                }
            }

            return results;
        }

        // ?? Admin: get flagged comments for a story ???????????????????????????
        public async Task<FlaggedCommentsDto> GetFlaggedCommentsForStoryAsync(int storyId)
        {
            var flaggedCommentIds = await _reportRepository.GetFlaggedCommentIdsForStoryAsync(storyId);

            // Get all pending reports for comments in this story
            var allReports = await _reportRepository.GetByStatusAsync("Pending");
            var storyCommentReports = allReports
                .Where(r => r.TargetType == "Comment" && r.StoryId == storyId)
                .Select(MapToDto)
                .ToList();

            return new FlaggedCommentsDto
            {
                FlaggedCommentIds = flaggedCommentIds,
                Reports = storyCommentReports
            };
        }

        // ?? Admin: quick delete a comment from "All Comments" view ????????????
        public async Task QuickDeleteCommentAsync(int commentId, int adminUserId, string reason)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId)
                ?? throw new Exception("Comment not found");

            // Delete the comment
            await _commentRepository.DeleteAsync(commentId);

            // Log the action
            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Quick Delete Comment",
                EntityType = "StoryComment",
                EntityId = commentId,
                Details = $"Quick deleted comment #{commentId} by {comment.CommenterName}. Reason: {reason}"
            });

            _logger.LogInformation(
                "Admin {AdminId} quick-deleted comment #{CommentId}. Reason: {Reason}",
                adminUserId, commentId, reason);
        }

        // ?? Helpers ???????????????????????????????????????????????????????
        private async Task<string> ResolveUserNameAsync(int userId, UserRole role)
        {
            if (role == UserRole.Patient)
            {
                var patient = await _patientRepository.GetByUserIdAsync(userId);
                return patient?.User?.FullName ?? "Unknown";
            }
            if (role == UserRole.Doctor)
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId);
                return doctor?.User?.FullName ?? "Unknown";
            }
            var user = await _userRepository.GetByIdAsync(userId);
            return user?.FullName ?? "Unknown";
        }

        private static ContentReportDto MapToDto(ContentReport r) => new()
        {
            Id                    = r.Id,
            ReporterUserId        = r.ReporterUserId,
            ReporterName          = r.ReporterName,
            TimeAgo               = BuildTimeAgo(r.CreatedAt),
            TargetType            = r.TargetType,
            TargetId              = r.TargetId,
            TargetContentSnapshot = r.TargetContentSnapshot,
            TargetAuthorName      = r.TargetAuthorName,
            StoryId               = r.StoryId,
            StoryTitle            = r.StoryTitle,
            Category              = r.Category,
            Reason                = r.Reason,
            Status                = r.Status,
            CreatedAt             = r.CreatedAt,
            ReviewedAt            = r.ReviewedAt,
            AdminNote             = r.AdminNote
        };

        private static string BuildTimeAgo(DateTime dt)
        {
            var diff = DateTime.UtcNow - dt;
            if (diff.TotalMinutes < 60)
                return $"{(int)diff.TotalMinutes} min ago";
            if (diff.TotalHours < 24)
                return $"{(int)diff.TotalHours} hour{((int)diff.TotalHours == 1 ? "" : "s")} ago";
            if (diff.TotalDays < 30)
                return $"{(int)diff.TotalDays} day{((int)diff.TotalDays == 1 ? "" : "s")} ago";
            return dt.ToString("MMM d, yyyy");
        }
    }
}
