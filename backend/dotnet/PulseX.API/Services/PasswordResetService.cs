using PulseX.API.Helpers;
using PulseX.Core.DTOs.Auth;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class PasswordResetService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetRepository _passwordResetRepository;
        private readonly IEmailService _emailService;
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly ILogger<PasswordResetService> _logger;

        public PasswordResetService(
            IUserRepository userRepository,
            IPasswordResetRepository passwordResetRepository,
            IEmailService emailService,
            IActivityLogRepository activityLogRepository,
            ILogger<PasswordResetService> logger)
        {
            _userRepository = userRepository;
            _passwordResetRepository = passwordResetRepository;
            _emailService = emailService;
            _activityLogRepository = activityLogRepository;
            _logger = logger;
        }

        public async Task SendPasswordResetOtpAsync(ForgotPasswordDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null)
            {
                throw new Exception("Email not found");
            }

            if (!user.IsActive)
            {
                throw new Exception("Account is deactivated");
            }

            var otp = GenerateOtp();

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Email = dto.Email,
                Token = otp,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                IsUsed = false
            };

            await _passwordResetRepository.AddAsync(resetToken);

            await _emailService.SendPasswordResetEmailAsync(dto.Email, user.FullName, otp);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = user.Id,
                Action = "Password Reset Requested",
                EntityType = "User",
                EntityId = user.Id,
                Details = $"Password reset OTP sent to {dto.Email}"
            });

            _logger.LogInformation($"OTP sent to {dto.Email}");
        }

        public async Task<VerifyOtpResponseDto> VerifyOtpAsync(VerifyOtpDto dto)
        {
            var resetTokenRecord = await _passwordResetRepository.GetByEmailAndTokenAsync(dto.Email, dto.Otp);

            if (resetTokenRecord == null)
            {
                throw new Exception("Invalid OTP code");
            }

            if (resetTokenRecord.ExpiresAt < DateTime.UtcNow)
            {
                throw new Exception("OTP code has expired");
            }

            if (resetTokenRecord.IsUsed)
            {
                throw new Exception("OTP code has already been used");
            }

            // Generate GUID ResetToken
            var resetToken = Guid.NewGuid().ToString();
            var resetTokenExpiry = DateTime.UtcNow.AddMinutes(5);

            resetTokenRecord.ResetToken = resetToken;
            resetTokenRecord.ResetTokenExpiresAt = resetTokenExpiry;

            await _passwordResetRepository.UpdateAsync(resetTokenRecord);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = resetTokenRecord.UserId,
                Action = "OTP Verified",
                EntityType = "User",
                EntityId = resetTokenRecord.UserId,
                Details = $"OTP verified for {dto.Email}, ResetToken generated"
            });

            _logger.LogInformation($"OTP verified for {dto.Email}, ResetToken: {resetToken}");

            return new VerifyOtpResponseDto
            {
                IsValid = true,
                ResetToken = resetToken,
                ExpiresAt = resetTokenExpiry,
                Message = "OTP verified successfully. You have 5 minutes to reset your password."
            };
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                throw new Exception("Passwords do not match");
            }

            if (dto.NewPassword.Length < 6)
            {
                throw new Exception("Password must be at least 6 characters long");
            }

            if (string.IsNullOrWhiteSpace(dto.ResetToken))
            {
                throw new Exception("Reset token is required");
            }

            var resetTokenRecord = await _passwordResetRepository.GetByResetTokenAsync(dto.ResetToken);

            if (resetTokenRecord == null)
            {
                throw new Exception("Invalid reset token");
            }

            if (!resetTokenRecord.ResetTokenExpiresAt.HasValue || 
                resetTokenRecord.ResetTokenExpiresAt.Value < DateTime.UtcNow)
            {
                // Delete expired token
                await _passwordResetRepository.DeleteAsync(resetTokenRecord);
                throw new Exception("Reset token has expired. Please request a new OTP.");
            }

            if (resetTokenRecord.IsUsed)
            {
                throw new Exception("Reset token has already been used");
            }

            var user = resetTokenRecord.User ?? await _userRepository.GetByIdAsync(resetTokenRecord.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            // Update password
            user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Delete token after successful password reset (security best practice)
            await _passwordResetRepository.DeleteAsync(resetTokenRecord);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = user.Id,
                Action = "Password Reset Completed",
                EntityType = "User",
                EntityId = user.Id,
                Details = $"Password successfully reset for {resetTokenRecord.Email}"
            });

            // Cleanup expired tokens
            await _passwordResetRepository.DeleteExpiredTokensAsync();

            _logger.LogInformation($"Password reset successful for {resetTokenRecord.Email}");
        }

        private static string GenerateOtp()
        {
            // Cryptographically secure 6-digit OTP (000000–999999)
            var bytes = new byte[4];
            System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
            var value = BitConverter.ToUInt32(bytes, 0) % 1_000_000;
            return value.ToString("D6"); // always 6 digits with leading zeros
        }
    }
}
