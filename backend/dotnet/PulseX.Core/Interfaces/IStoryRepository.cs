using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IStoryRepository
    {
        Task<Story?> GetByIdAsync(int id);
        Task<IEnumerable<Story>> GetAllAsync();
        Task<IEnumerable<Story>> GetPublishedAsync();
        Task<(IEnumerable<Story> Stories, int TotalCount)> GetPublishedPagedAsync(
            int page, int pageSize, string? tag = null);
        Task<IEnumerable<Story>> GetByPatientIdAsync(int patientId);
        Task<IEnumerable<Story>> GetRelatedAsync(int storyId, List<string> tags, int take = 3);
        Task<Story> AddAsync(Story story);
        Task UpdateAsync(Story story);
        Task DeleteAsync(int id);
    }
}
