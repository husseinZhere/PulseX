using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IPasswordResetRepository
    {
        Task<PasswordResetToken?> GetByEmailAndTokenAsync(string email, string token);
        Task<PasswordResetToken?> GetByResetTokenAsync(string resetToken);
        Task AddAsync(PasswordResetToken resetToken);
        Task UpdateAsync(PasswordResetToken resetToken);
        Task DeleteAsync(PasswordResetToken resetToken);
        Task DeleteExpiredTokensAsync();
    }
}
