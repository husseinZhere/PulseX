using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IStoryCommentRepository
    {
        Task<IEnumerable<StoryComment>> GetByStoryIdAsync(int storyId);
        Task<IEnumerable<StoryComment>> GetTopLevelWithRepliesAsync(int storyId);
        Task<StoryComment?> GetByIdAsync(int id);
        Task<StoryComment> AddAsync(StoryComment comment);
        Task UpdateAsync(StoryComment comment);
        Task DeleteAsync(int id);
        Task<int> CountByStoryIdAsync(int storyId);
    }
}
