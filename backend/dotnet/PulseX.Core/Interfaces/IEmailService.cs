namespace PulseX.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string otp);
        Task SendContactFormEmailAsync(string senderName, string senderEmail, string subject, string message);
    }
}
