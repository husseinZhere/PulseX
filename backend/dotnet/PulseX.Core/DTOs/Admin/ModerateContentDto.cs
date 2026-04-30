using System.ComponentModel.DataAnnotations;

namespace PulseX.Core.DTOs.Admin
{
    /// <summary>
    /// Payload sent by the admin when removing a story or comment for moderation reasons.
    /// </summary>
    public class ModerateContentDto
    {
        /// <summary>
        /// Human-readable reason for removal (e.g. "Bullying", "Wrong medical information").
        /// </summary>
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;
    }
}
