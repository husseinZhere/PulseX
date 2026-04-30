using System.ComponentModel.DataAnnotations;

namespace PulseX.Core.DTOs.Report
{
    /// <summary>Allowed report categories � matches the UI dropdown exactly.</summary>
    public static class ReportCategory
    {
        public const string Spam                 = "Spam";
        public const string Harassment           = "Harassment";
        public const string Misinformation       = "Misinformation";
        public const string InappropriateContent = "InappropriateContent";
        public const string Other                = "Other";

        private static readonly HashSet<string> Valid = new()
        {
            Spam, Harassment, Misinformation, InappropriateContent, Other
        };

        public static bool IsValid(string value) => Valid.Contains(value);
    }

    /// <summary>Payload sent by a patient or doctor to file a report.</summary>
    public class SubmitReportDto
    {
        /// <summary>"Story" or "Comment" — set by the controller from the route, not the request body.</summary>
        public string TargetType { get; set; } = string.Empty;

        /// <summary>ID of the story or comment — set by the controller from the route, not the request body.</summary>
        public int TargetId { get; set; }

        /// <summary>One of: Spam, Harassment, Misinformation, InappropriateContent, Other</summary>
        [Required]
        public string Category { get; set; } = string.Empty;

        /// <summary>Free-text description of the problem (optional).</summary>
        [MaxLength(1000)]
        public string? Reason { get; set; }
    }

    /// <summary>Full report card shown in the admin Reports Management page.</summary>
    public class ContentReportDto
    {
        public int Id { get; set; }

        public int ReporterUserId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string TimeAgo { get; set; } = string.Empty;

        public string TargetType { get; set; } = string.Empty;
        public int TargetId { get; set; }
        public string TargetContentSnapshot { get; set; } = string.Empty;
        public string TargetAuthorName { get; set; } = string.Empty;

        public int? StoryId { get; set; }
        public string StoryTitle { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? AdminNote { get; set; }
    }

    /// <summary>The four statistic cards at the top of the Reports Management page.</summary>
    public class ReportStatisticsDto
    {
        public int TotalReports { get; set; }
        public int PendingReview { get; set; }
        public int Reviewed { get; set; }
        public int Dismissed { get; set; }
    }

    /// <summary>Payload for admin actions: Mark Reviewed or Dismiss.</summary>
    public class UpdateReportStatusDto
    {
        /// <summary>"Reviewed" or "Dismissed"</summary>
        [Required]
        public string Status { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? AdminNote { get; set; }
    }

    /// <summary>Bulk delete multiple reports' content</summary>
    public class BulkDeleteReportsDto
    {
        [Required]
        public List<int> ReportIds { get; set; } = new();

        [MaxLength(500)]
        public string? AdminNote { get; set; }
    }

    /// <summary>Bulk dismiss multiple reports</summary>
    public class BulkDismissReportsDto
    {
        [Required]
        public List<int> ReportIds { get; set; } = new();

        [MaxLength(500)]
        public string? AdminNote { get; set; }
    }

    /// <summary>Quick delete comment from All Comments view</summary>
    public class QuickDeleteDto
    {
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>Result of content deletion operation</summary>
    public class DeleteContentResultDto
    {
        public string ContentType { get; set; } = string.Empty;
        public int ContentId { get; set; }
        public ContentReportDto UpdatedReport { get; set; } = null!;
    }

    /// <summary>Flagged comments for a story</summary>
    public class FlaggedCommentsDto
    {
        public HashSet<int> FlaggedCommentIds { get; set; } = new();
        public List<ContentReportDto> Reports { get; set; } = new();
    }
}
