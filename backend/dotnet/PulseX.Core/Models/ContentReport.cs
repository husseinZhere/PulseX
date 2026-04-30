namespace PulseX.Core.Models
{
    public class ContentReport
    {
        public int Id { get; set; }

        // Who filed the report
        public int ReporterUserId { get; set; }
        public string ReporterName { get; set; } = string.Empty;

        // What is being reported
        public string TargetType { get; set; } = string.Empty;  // "Story" | "Comment"
        public int TargetId { get; set; }

        // Snapshot of the offending content (stored so admin can read it even if deleted)
        public string TargetContentSnapshot { get; set; } = string.Empty;
        public string TargetAuthorName { get; set; } = string.Empty;

        // Context — which story the content lives in
        public int? StoryId { get; set; }
        public string StoryTitle { get; set; } = string.Empty;

        // Report details
        public string Category { get; set; } = string.Empty; // Spam | Harassment | Misinformation | InappropriateContent | Other
        public string Reason { get; set; } = string.Empty;

        // Lifecycle
        public string Status { get; set; } = "Pending"; // Pending | Reviewed | Dismissed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public int? ReviewedByAdminId { get; set; }
        public string? AdminNote { get; set; }
    }
}
