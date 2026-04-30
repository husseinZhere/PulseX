using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PulseX.API.Helpers;
using PulseX.API.Hubs;
using PulseX.API.Services;
using PulseX.Core.Interfaces;
using PulseX.Data;
using PulseX.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PulseX API",
        Version = "v1",
        Description = "Backend API for PulseX Graduation Project"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 3. Configure Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 4. Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        NameClaimType = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    };

    // Enable SignalR to receive JWT from query string (for WebSocket connections)
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            // If the request is for our SignalR hub, read the token from query string
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// 5. Configure AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// 6. Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
builder.Services.AddScoped<IHealthDataRepository, HealthDataRepository>();
builder.Services.AddScoped<IPatientHealthInfoRepository, PatientHealthInfoRepository>();
builder.Services.AddScoped<IStoryRepository, StoryRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IRiskAssessmentRepository, RiskAssessmentRepository>();
builder.Services.AddScoped<IPasswordResetRepository, PasswordResetRepository>();
builder.Services.AddScoped<IDoctorRatingRepository, DoctorRatingRepository>();
builder.Services.AddScoped<IMedicalRecordRepository, MedicalRecordRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
builder.Services.AddScoped<IDoctorScheduleRepository, DoctorScheduleRepository>();
builder.Services.AddScoped<IStoryCommentRepository, StoryCommentRepository>();
builder.Services.AddScoped<IContentReportRepository, ContentReportRepository>();
builder.Services.AddScoped<IPatientNotificationRepository, PatientNotificationRepository>();

// 7. Register Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<DoctorService>();
builder.Services.AddScoped<DoctorBookingService>();
builder.Services.AddScoped<AppointmentService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<HealthDataService>();
builder.Services.AddScoped<StoryService>();
builder.Services.AddScoped<ChatbotService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<RiskAssessmentService>();
builder.Services.AddScoped<PasswordResetService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<PatientDashboardService>();
builder.Services.AddScoped<MedicalRecordManagementService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<PrescriptionService>();
builder.Services.AddScoped<HealthSurveyService>(); // 🆕 Add this
builder.Services.AddScoped<DoctorScheduleService>();
builder.Services.AddScoped<ContentReportService>();
builder.Services.AddScoped<VideoCallService>(); // Video call service for consultations
builder.Services.AddScoped<PatientNotificationService>(); // Patient notification service

// AI service HTTP bridge (Python FastAPI on port 8001)
builder.Services.AddHttpClient<AiServiceClient>(client =>
{
    var baseUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8001";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(60);
});

// 8. Register SignalR for real-time video call signaling
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// 9. Register Helpers
builder.Services.AddScoped<JwtHelper>();

// 10. Configure CORS (updated to support SignalR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR
    });
});

var app = builder.Build();

// 11. Seed default admin account
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var userRepository = services.GetRequiredService<IUserRepository>();
        var adminEmail = "admin@pulsex.com";
        if (!await userRepository.ExistsAsync(adminEmail))
        {
            var adminUser = new PulseX.Core.Models.User
            {
                Email = adminEmail,
                PasswordHash = PulseX.API.Helpers.PasswordHelper.HashPassword("Admin@123"),
                FullName = "System Administrator",  // ✅ Single name is fine for admin
                PhoneNumber = "1234567890",
                Role = PulseX.Core.Enums.UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await userRepository.AddAsync(adminUser);
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding admin.");
    }
}

// 12. Configure Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "PulseX API V1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Serve uploaded files from ContentRootPath/uploads (works even when wwwroot doesn't exist)
var uploadsDir = Path.Combine(builder.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsDir);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsDir),
    RequestPath = "/uploads"
});

// Also serve from wwwroot if it exists
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR Hub for video call signaling
app.MapHub<VideoCallHub>("/hubs/videocall");
app.MapHub<ChatHub>("/hubs/chat");

app.Run();