namespace PulseX.Core.DTOs.Story
{
    public class StoryCommentDto
    {
        public int Id { get; set; }
        public int StoryId { get; set; }
        public int? ParentCommentId { get; set; }
        public int UserId { get; set; }
        public string CommenterName { get; set; } = string.Empty;
        public string CommenterRole { get; set; } = string.Empty;
        public string? CommenterAvatar { get; set; }
        public string Content { get; set; } = string.Empty;
        public int LikesCount { get; set; }
        public int RepliesCount { get; set; }
        public string TimeAgo { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // True when this comment has at least one Pending report � drives the
        // red "Flagged for Review" banner shown in the admin All Comments view.
        public bool IsFlagged { get; set; }

        // Nested replies (only populated on top-level comments)
        public List<StoryCommentDto> Replies { get; set; } = new();
    }

    public class StoryDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int PatientUserId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientAvatar { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Snippet { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public List<string> Tags { get; set; } = new();

        // Engagement
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
        public int SharesCount { get; set; }
        public int ViewsCount { get; set; }

        public bool IsPublished { get; set; }
        public bool IsHidden { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string PublishedAtFormatted { get; set; } = string.Empty;
    }

    public class StoryDetailDto : StoryDto
    {
        // Preview comments (first 3) shown inline on the story detail page
        public List<StoryCommentDto> Comments { get; set; } = new();
        public List<StoryDto> RelatedStories { get; set; } = new();
    }

    // Full "All Comments" page response � top-level comments with nested replies
    public class StoryCommentsPageDto
    {
        public int StoryId { get; set; }
        public string StoryTitle { get; set; } = string.Empty;
        public int TotalComments { get; set; }
        public List<StoryCommentDto> Comments { get; set; } = new();
    }

    public class StoryPagedDto
    {
        public List<StoryDto> Stories { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPrevious { get; set; }
        public bool HasNext { get; set; }
    }

    public class AddCommentDto
    {
        public string Content { get; set; } = string.Empty;
    }

    public class ReplyCommentDto
    {
        public string Content { get; set; } = string.Empty;
    }
}
