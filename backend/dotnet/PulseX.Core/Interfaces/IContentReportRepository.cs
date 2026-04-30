using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IContentReportRepository
    {
        Task<ContentReport?> GetByIdAsync(int id);
        Task<IEnumerable<ContentReport>> GetAllAsync();
        Task<IEnumerable<ContentReport>> GetByStatusAsync(string status);
        Task<ContentReport> AddAsync(ContentReport report);
        Task UpdateAsync(ContentReport report);
        Task<int> CountByStatusAsync(string status);
        Task<int> CountAllAsync();

        // Returns the set of comment IDs that have at least one Pending report,
        // scoped to the comments that belong to a given story.
        Task<HashSet<int>> GetFlaggedCommentIdsForStoryAsync(int storyId);
    }
}
