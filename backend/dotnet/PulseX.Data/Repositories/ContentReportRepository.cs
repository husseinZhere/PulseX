using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class ContentReportRepository : IContentReportRepository
    {
        private readonly ApplicationDbContext _context;

        public ContentReportRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ContentReport?> GetByIdAsync(int id)
            => await _context.ContentReports.FindAsync(id);

        public async Task<IEnumerable<ContentReport>> GetAllAsync()
            => await _context.ContentReports
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<ContentReport>> GetByStatusAsync(string status)
            => await _context.ContentReports
                .Where(r => r.Status == status)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

        public async Task<ContentReport> AddAsync(ContentReport report)
        {
            await _context.ContentReports.AddAsync(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task UpdateAsync(ContentReport report)
        {
            _context.ContentReports.Update(report);
            await _context.SaveChangesAsync();
        }

        public async Task<int> CountByStatusAsync(string status)
            => await _context.ContentReports.CountAsync(r => r.Status == status);

        public async Task<int> CountAllAsync()
            => await _context.ContentReports.CountAsync();

        public async Task<HashSet<int>> GetFlaggedCommentIdsForStoryAsync(int storyId)
        {
            var ids = await _context.ContentReports
                .Where(r => r.TargetType == "Comment"
                         && r.StoryId == storyId
                         && r.Status == "Pending")
                .Select(r => r.TargetId)
                .Distinct()
                .ToListAsync();

            return ids.ToHashSet();
        }
    }
}
