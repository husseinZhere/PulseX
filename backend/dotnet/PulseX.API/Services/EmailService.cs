using System.Net;
using System.Net.Mail;
using PulseX.Core.Interfaces;

namespace PulseX.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Public API
        // ─────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Send a beautiful OTP email for password reset.
        /// </summary>
        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string otp)
        {
            var subject = "🔐 Password Reset Code — PulseX";
            var body    = BuildOtpEmailHtml(userName, otp);
            await SendAsync(toEmail, subject, body);
        }

        /// <summary>
        /// Forward a contact-form submission to the platform support inbox.
        /// </summary>
        public async Task SendContactFormEmailAsync(string senderName, string senderEmail, string subject, string message)
        {
            var supportEmail = _configuration["Email:SupportEmail"] ?? _configuration["Email:Username"]!;
            var emailSubject = $"📬 Contact Form: {subject}";
            var body         = BuildContactFormHtml(senderName, senderEmail, subject, message);
            await SendAsync(supportEmail, emailSubject, body);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Core SMTP sender
        // ─────────────────────────────────────────────────────────────────────────

        private async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            var host       = _configuration["Email:SmtpHost"]   ?? "smtp.gmail.com";
            var port       = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var username   = _configuration["Email:Username"]!;
            var password   = _configuration["Email:Password"]!;
            var fromEmail  = _configuration["Email:FromEmail"]  ?? username;
            var fromName   = _configuration["Email:FromName"]   ?? "PulseX Healthcare";

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl   = true,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            using var mail = new MailMessage
            {
                From       = new MailAddress(fromEmail, fromName),
                Subject    = subject,
                Body       = htmlBody,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            try
            {
                await client.SendMailAsync(mail);
                _logger.LogInformation("✅ Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to send email to {Email}", toEmail);
                throw new Exception($"Failed to send email: {ex.Message}");
            }
        }

        // ─────────────────────────────────────────────────────────────────────────
        // HTML Template
        // ─────────────────────────────────────────────────────────────────────────

        private static string BuildContactFormHtml(string senderName, string senderEmail, string subject, string message)
        {
            var safeMessage = System.Net.WebUtility.HtmlEncode(message).Replace("\n", "<br/>");
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head><meta charset=""UTF-8""/><meta name=""viewport"" content=""width=device-width,initial-scale=1.0""/></head>
<body style=""margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f0f4ff;padding:48px 16px;"">
    <tr><td align=""center"">
      <table width=""560"" cellpadding=""0"" cellspacing=""0""
             style=""background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(59,91,219,.12);"">

        <tr>
          <td style=""background:linear-gradient(135deg,#3b5bdb 0%,#5c7cfa 100%);padding:36px 48px;text-align:center;"">
            <span style=""color:#fff;font-size:26px;font-weight:700;"">PulseX</span>
            <p style=""color:rgba(255,255,255,.8);margin:8px 0 0;font-size:13px;letter-spacing:.5px;text-transform:uppercase;"">New Contact Form Submission</p>
          </td>
        </tr>

        <tr>
          <td style=""padding:40px 48px;"">
            <h2 style=""margin:0 0 24px;font-size:20px;color:#1a1a2e;"">📬 You have a new message</h2>

            <table width=""100%"" cellpadding=""0"" cellspacing=""0""
                   style=""background:#f8faff;border:1px solid #dbe4ff;border-radius:12px;padding:24px;margin-bottom:28px;"">
              <tr>
                <td style=""padding:8px 0;"">
                  <span style=""font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;"">From</span><br/>
                  <span style=""font-size:15px;color:#1a1a2e;font-weight:600;"">{System.Net.WebUtility.HtmlEncode(senderName)}</span>
                </td>
              </tr>
              <tr>
                <td style=""padding:8px 0;border-top:1px solid #e5e7eb;"">
                  <span style=""font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;"">Email</span><br/>
                  <a href=""mailto:{senderEmail}"" style=""font-size:15px;color:#3b5bdb;text-decoration:none;"">{senderEmail}</a>
                </td>
              </tr>
              <tr>
                <td style=""padding:8px 0;border-top:1px solid #e5e7eb;"">
                  <span style=""font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;"">Subject</span><br/>
                  <span style=""font-size:15px;color:#1a1a2e;font-weight:600;"">{System.Net.WebUtility.HtmlEncode(subject)}</span>
                </td>
              </tr>
            </table>

            <p style=""font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin:0 0 10px;"">Message</p>
            <div style=""background:#f9fafb;border-left:4px solid #3b5bdb;border-radius:8px;padding:20px 24px;font-size:15px;color:#374151;line-height:1.7;margin-bottom:32px;"">
              {safeMessage}
            </div>

            <a href=""mailto:{senderEmail}?subject=Re: {System.Net.WebUtility.HtmlEncode(subject)}""
               style=""display:inline-block;background:#3b5bdb;color:#fff;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;"">
              Reply to {System.Net.WebUtility.HtmlEncode(senderName)} →
            </a>
          </td>
        </tr>

        <tr>
          <td style=""background:#f8faff;padding:20px 48px;text-align:center;border-top:1px solid #e5e7eb;"">
            <p style=""margin:0;font-size:12px;color:#9ca3af;"">© 2026 PulseX Healthcare Platform. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";
        }

        private static string BuildOtpEmailHtml(string userName, string otp)
        {
            // Format OTP with letter spacing to prevent wrapping issues on mobile
            var digits = $@"<div style=""font-size:44px;font-weight:700;letter-spacing:10px;color:#3b5bdb;margin:0;padding:12px 24px;background:#f0f4ff;border-radius:12px;border:2px solid #dbe4ff;display:inline-block;"">{otp}</div>";

            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>PulseX — Password Reset</title>
</head>
<body style=""margin:0;padding:0;background-color:#f0f4ff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;"">

  <!-- Wrapper -->
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f0f4ff;padding:48px 16px;"">
    <tr>
      <td align=""center"">

        <!-- Card -->
        <table width=""560"" cellpadding=""0"" cellspacing=""0""
               style=""background:#ffffff;border-radius:20px;overflow:hidden;
                      box-shadow:0 8px 40px rgba(59,91,219,.12);"">

          <!-- ── Header banner ── -->
          <tr>
            <td style=""background:linear-gradient(135deg,#3b5bdb 0%,#5c7cfa 100%);
                        padding:40px 48px;text-align:center;"">
              <!-- Logo / brand -->
              <span style=""color:#ffffff;font-size:28px;font-weight:700;
                            letter-spacing:-.5px;"">PulseX</span>
              <p style=""color:rgba(255,255,255,.85);margin:12px 0 0;font-size:14px;
                         letter-spacing:.5px;text-transform:uppercase;"">
                Healthcare Platform
              </p>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style=""padding:48px;"">

              <!-- Greeting -->
              <h1 style=""margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;"">
                Password Reset Request
              </h1>
              <p style=""margin:0 0 32px;font-size:18px;color:#6b7280;line-height:1.6;"">
                Hi <strong style=""color:#1a1a2e;"">{userName}</strong>, we received a request
                to reset your PulseX account password. Use the verification code below.
              </p>

              <!-- OTP block -->
              <div style=""background:#f8faff;border:1px solid #dbe4ff;border-radius:16px;
                           padding:32px;text-align:center;margin-bottom:32px;"">
                 <p style=""margin:0 0 16px;font-size:14px;font-weight:600;color:#6b7280;
                            text-transform:uppercase;letter-spacing:1px;"">
                  Your Verification Code
                </p>
                <div>{digits}</div>
                <p style=""margin:20px 0 0;font-size:14px;color:#9ca3af;"">
                  ⏱ This code expires in&nbsp;<strong style=""color:#3b5bdb;"">15 minutes</strong>
                </p>
              </div>

              <!-- Security notice -->
              <div style=""background:#fff7ed;border-left:4px solid #f97316;
                           border-radius:8px;padding:16px 20px;margin-bottom:32px;"">
                 <p style=""margin:0;font-size:16px;color:#92400e;line-height:1.6;"">
                  🔒 <strong>Security Notice:</strong> If you did not request a password
                  reset, please ignore this email. Your account remains secure.
                </p>
              </div>

              <!-- Steps -->
               <p style=""font-size:18px;color:#6b7280;margin:0 0 8px;"">
                <strong style=""color:#1a1a2e;"">What to do next:</strong>
              </p>
              <ol style=""font-size:16px;color:#6b7280;line-height:2;margin:0 0 32px;
                          padding-left:20px;"">
                <li>Enter the 6-digit code in the PulseX app.</li>
                <li>Create a new strong password.</li>
                <li>Log in and take care of your health! 💙</li>
              </ol>

              <!-- Divider -->
              <hr style=""border:none;border-top:1px solid #f3f4f6;margin:0 0 24px;"" />

              <!-- Help line -->
              <p style=""font-size:13px;color:#9ca3af;margin:0;text-align:center;"">
                Need help? Reach us at
                <a href=""mailto:pulsex.system@gmail.com""
                   style=""color:#3b5bdb;text-decoration:none;"">
                  pulsex.system@gmail.com
                </a>
              </p>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style=""background:#f8faff;padding:24px 48px;text-align:center;
                        border-top:1px solid #e5e7eb;"">
              <p style=""margin:0 0 4px;font-size:12px;color:#9ca3af;"">
                © 2026 PulseX Healthcare Platform. All rights reserved.
              </p>
              <p style=""margin:0;font-size:12px;color:#c4c9d4;"">
                This is an automated message — please do not reply directly.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>";
        }
    }
}