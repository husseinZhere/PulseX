using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class StoryRepository : IStoryRepository
    {
        private readonly ApplicationDbContext _context;

        public StoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Story?> GetByIdAsync(int id)
        {
            return await _context.Stories
                .Include(s => s.Patient).ThenInclude(p => p.User)
                .Include(s => s.Comments)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Story>> GetAllAsync()
        {
            return await _context.Stories
                .Include(s => s.Patient).ThenInclude(p => p.User)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Story>> GetPublishedAsync()
        {
            return await _context.Stories
                .Include(s => s.Patient).ThenInclude(p => p.User)
                .Where(s => s.IsPublished && !s.IsHidden)
                .OrderByDescending(s => s.PublishedAt)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Story> Stories, int TotalCount)> GetPublishedPagedAsync(
            int page, int pageSize, string? tag = null)
        {
            var query = _context.Stories
                .Include(s => s.Patient).ThenInclude(p => p.User)
                .Include(s => s.Comments)
                .Where(s => s.IsPublished && !s.IsHidden);

            if (!string.IsNullOrWhiteSpace(tag))
            {
                query = query.Where(s => s.Tags != null && s.Tags.Contains(tag));
            }

            var totalCount = await query.CountAsync();

            var stories = await query
                .OrderByDescending(s => s.PublishedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (stories, totalCount);
        }

        public async Task<IEnumerable<Story>> GetByPatientIdAsync(int patientId)
        {
            return await _context.Stories
                .Include(s => s.Patient).ThenInclude(p => p.User)
                .Where(s => s.PatientId == patientId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Story>> GetRelatedAsync(int storyId, List<string> tags, int take = 3)
        {
            var query = _context.Stories
                .Include(s => s.Patient).ThenInclude(p => p.User)
                .Where(s => s.IsPublished && !s.IsHidden && s.Id != storyId);

            if (tags.Any())
            {
                query = query.Where(s => s.Tags != null &&
                    tags.Any(t => s.Tags.Contains(t)));
            }

            return await query
                .OrderByDescending(s => s.LikesCount)
                .Take(take)
                .ToListAsync();
        }

        public async Task<Story> AddAsync(Story story)
        {
            await _context.Stories.AddAsync(story);
            await _context.SaveChangesAsync();
            return story;
        }

        public async Task UpdateAsync(Story story)
        {
            story.UpdatedAt = DateTime.UtcNow;
            _context.Stories.Update(story);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var story = await _context.Stories.FindAsync(id);
            if (story != null)
            {
                _context.Stories.Remove(story);
                await _context.SaveChangesAsync();
            }
        }
    }
}
