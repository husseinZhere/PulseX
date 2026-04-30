namespace PulseX.Core.Models
{
    public class StoryComment
    {
        public int Id { get; set; }
        public int StoryId { get; set; }

        // null = top-level comment; set = a reply to another comment
        public int? ParentCommentId { get; set; }

        // UserId of the commenter (patient or doctor)
        public int UserId { get; set; }
        public string CommenterName { get; set; } = string.Empty;
        public string CommenterRole { get; set; } = string.Empty; // "Patient" or "Doctor"
        public string? CommenterAvatar { get; set; }

        public string Content { get; set; } = string.Empty;
        public int LikesCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Story Story { get; set; } = null!;
        public StoryComment? ParentComment { get; set; }
        public ICollection<StoryComment> Replies { get; set; } = new List<StoryComment>();
    }
}
