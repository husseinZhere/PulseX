namespace PulseX.Core.Models
{
    public class Story
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }

        // Comma-separated tags e.g. "Lifestyle,Health,Recovery"
        public string? Tags { get; set; }

        // Engagement counters
        public int LikesCount { get; set; } = 0;
        public int SharesCount { get; set; } = 0;
        public int ViewsCount { get; set; } = 0;

        public bool IsPublished { get; set; } = false;
        public bool IsHidden { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Patient Patient { get; set; } = null!;
        public ICollection<StoryComment> Comments { get; set; } = new List<StoryComment>();
    }
}
