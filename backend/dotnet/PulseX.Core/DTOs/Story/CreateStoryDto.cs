namespace PulseX.Core.DTOs.Story
{
    public class CreateStoryDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        // Comma-separated list of chosen tags e.g. "Lifestyle,Health"
        public string? Tags { get; set; }

        // Populated by the API layer after saving the uploaded cover image
        public string? ImageUrl { get; set; }
    }
}
