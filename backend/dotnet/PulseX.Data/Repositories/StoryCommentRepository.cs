using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class StoryCommentRepository : IStoryCommentRepository
    {
        private readonly ApplicationDbContext _context;

        public StoryCommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<StoryComment>> GetByStoryIdAsync(int storyId)
        {
            return await _context.StoryComments
                .Where(c => c.StoryId == storyId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        // Returns only top-level comments, each pre-loaded with their direct replies
        public async Task<IEnumerable<StoryComment>> GetTopLevelWithRepliesAsync(int storyId)
        {
            return await _context.StoryComments
                .Where(c => c.StoryId == storyId && c.ParentCommentId == null)
                .Include(c => c.Replies)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<StoryComment?> GetByIdAsync(int id)
        {
            return await _context.StoryComments
                .Include(c => c.Replies)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<StoryComment> AddAsync(StoryComment comment)
        {
            await _context.StoryComments.AddAsync(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task UpdateAsync(StoryComment comment)
        {
            _context.StoryComments.Update(comment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var comment = await _context.StoryComments.FindAsync(id);
            if (comment != null)
            {
                _context.StoryComments.Remove(comment);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> CountByStoryIdAsync(int storyId)
        {
            return await _context.StoryComments.CountAsync(c => c.StoryId == storyId);
        }
    }
}
