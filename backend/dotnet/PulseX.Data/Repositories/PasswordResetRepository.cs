using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class PasswordResetRepository : IPasswordResetRepository
    {
        private readonly ApplicationDbContext _context;

        public PasswordResetRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PasswordResetToken?> GetByEmailAndTokenAsync(string email, string token)
        {
            return await _context.PasswordResetTokens
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Email == email && p.Token == token && !p.IsUsed);
        }

        public async Task<PasswordResetToken?> GetByResetTokenAsync(string resetToken)
        {
            return await _context.PasswordResetTokens
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.ResetToken == resetToken && !p.IsUsed);
        }

        public async Task AddAsync(PasswordResetToken resetToken)
        {
            await _context.PasswordResetTokens.AddAsync(resetToken);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(PasswordResetToken resetToken)
        {
            _context.PasswordResetTokens.Update(resetToken);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(PasswordResetToken resetToken)
        {
            _context.PasswordResetTokens.Remove(resetToken);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteExpiredTokensAsync()
        {
            var expiredTokens = await _context.PasswordResetTokens
                .Where(p => p.ExpiresAt < DateTime.UtcNow || 
                           (p.ResetTokenExpiresAt.HasValue && p.ResetTokenExpiresAt.Value < DateTime.UtcNow))
                .ToListAsync();

            _context.PasswordResetTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }
    }
}
