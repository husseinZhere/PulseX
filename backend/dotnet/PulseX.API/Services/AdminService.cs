using AutoMapper;
using PulseX.API.Helpers;
using PulseX.Core.DTOs.Admin;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class AdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly IStoryRepository _storyRepository;
        private readonly IStoryCommentRepository _storyCommentRepository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _webHostEnvironment; // أضفنا ده عشان نعرف مسار السيرفر

        public AdminService(
            IUserRepository userRepository,
            IDoctorRepository doctorRepository,
            IPatientRepository patientRepository,
            IAppointmentRepository appointmentRepository,
            IActivityLogRepository activityLogRepository,
            IStoryRepository storyRepository,
            IStoryCommentRepository storyCommentRepository,
            IMapper mapper,
            IWebHostEnvironment webHostEnvironment)
        {
            _userRepository = userRepository;
            _doctorRepository = doctorRepository;
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _activityLogRepository = activityLogRepository;
            _storyRepository = storyRepository;
            _storyCommentRepository = storyCommentRepository;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
        }

        private static string WithDrPrefix(string name)
        {
            var t = name.Trim();
            return System.Text.RegularExpressions.Regex.IsMatch(t, @"^DR\.?\s", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
                ? t : $"DR. {t}";
        }

        public async Task<UserManagementDto> CreateDoctorByAdminAsync(CreateDoctorByAdminDto dto, int adminUserId, string? profilePicturePath = null)
        {
            if (await _userRepository.ExistsAsync(dto.Email))
            {
                throw new Exception("Email already exists");
            }

            var fullName = WithDrPrefix($"{dto.FirstName} {dto.LastName}".Trim());

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = PasswordHelper.HashPassword(dto.Password),
                FullName = fullName,
                PhoneNumber = dto.PhoneNumber,
                Role = UserRole.Doctor,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                DateOfBirth = dto.DateOfBirth ?? DateTime.UtcNow.AddYears(-30),
                ProfilePicture = profilePicturePath
            };

            await _userRepository.AddAsync(user);

            var doctor = new Doctor
            {
                UserId = user.Id,
                ConsultationPrice = dto.ConsultationPrice,
                ClinicLocation = dto.ClinicLocation,
                ProfilePicture = profilePicturePath,
                IsApproved = true,
                ApprovedByAdminId = adminUserId,
                ApprovedAt = DateTime.UtcNow,
                  Gender = dto.Gender
              };

            await _doctorRepository.AddAsync(doctor);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Doctor Created by Admin",
                EntityType = "Doctor",
                EntityId = doctor.Id,
                Details = $"Admin created doctor account for {user.FullName}"
            });

            return _mapper.Map<UserManagementDto>(user);
        }

        private async Task<string> GenerateUniquePatientIdAsync()
        {
            var lastPatient = await _patientRepository.GetLastPatientAsync();
            if (lastPatient?.PatientId == null
                || lastPatient.PatientId.Length <= 3
                || !lastPatient.PatientId.StartsWith("PAT")
                || !int.TryParse(lastPatient.PatientId.Substring(3), out int lastNumber))
            {
                return "PAT001";
            }
            return $"PAT{lastNumber + 1:D3}";
        }

        public async Task<UserManagementDto> CreatePatientByAdminAsync(CreatePatientByAdminDto dto, int adminUserId, string? profilePicturePath = null)
        {
            if (await _userRepository.ExistsAsync(dto.Email))
            {
                throw new Exception("Email already exists");
            }

            var fullName = $"{dto.FirstName} {dto.LastName}".Trim();

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = PasswordHelper.HashPassword(dto.Password),
                FullName = fullName,
                PhoneNumber = dto.PhoneNumber,
                Role = UserRole.Patient,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ProfilePicture = profilePicturePath
            };

            await _userRepository.AddAsync(user);

            var patientId = await GenerateUniquePatientIdAsync();
            var patient = new Patient
            {
                UserId = user.Id,
                PatientId = patientId,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender
            };

            await _patientRepository.AddAsync(patient);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Patient Created by Admin",
                EntityType = "Patient",
                EntityId = patient.Id,
                Details = $"Admin created patient account for {user.FullName}"
            });

            return _mapper.Map<UserManagementDto>(user);
        }

        public async Task<UserManagementDto> UpdateDoctorByAdminAsync(int doctorUserId, UpdateDoctorByAdminDto dto, int adminUserId, string? newProfilePicturePath = null)
        {
            var user = await _userRepository.GetByIdAsync(doctorUserId);
            if (user == null || user.Role != UserRole.Doctor)
            {
                throw new Exception("Doctor not found");
            }

            var doctor = user.Doctor;
            if (doctor == null)
            {
                throw new Exception("Doctor profile not found");
            }

            if (!string.IsNullOrEmpty(dto.FirstName) && !string.IsNullOrEmpty(dto.LastName))
            {
                user.FullName = WithDrPrefix($"{dto.FirstName} {dto.LastName}".Trim());
            }

            if (!string.IsNullOrEmpty(dto.Email))
            {
                user.Email = dto.Email.Trim().ToLowerInvariant();
            }

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
            {
                user.PhoneNumber = dto.PhoneNumber;
            }

            if (dto.DateOfBirth.HasValue)
            {
                user.DateOfBirth = dto.DateOfBirth.Value;
            }

            if (dto.IsActive.HasValue)
            {
                user.IsActive = dto.IsActive.Value;
            }

            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = PasswordHelper.HashPassword(dto.Password);
            }

            if (!string.IsNullOrEmpty(newProfilePicturePath))
            {
                user.ProfilePicture = newProfilePicturePath;
            }

            await _userRepository.UpdateAsync(user);

            if (dto.ConsultationPrice.HasValue)
            {
                doctor.ConsultationPrice = dto.ConsultationPrice.Value;
            }

            if (!string.IsNullOrEmpty(dto.ClinicLocation))
            {
                doctor.ClinicLocation = dto.ClinicLocation;
            }

            if (!string.IsNullOrEmpty(newProfilePicturePath))
            {
                if (!string.IsNullOrEmpty(doctor.ProfilePicture))
                {
                    var webRoot = string.IsNullOrEmpty(_webHostEnvironment.WebRootPath) ? _webHostEnvironment.ContentRootPath : _webHostEnvironment.WebRootPath;
                    var oldFilePath = Path.Combine(webRoot, doctor.ProfilePicture.TrimStart('/'));
                    if (File.Exists(oldFilePath))
                        File.Delete(oldFilePath);
                }
                doctor.ProfilePicture = newProfilePicturePath;
            }

            await _doctorRepository.UpdateAsync(doctor);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Doctor Updated by Admin",
                EntityType = "Doctor",
                EntityId = doctor.Id,
                Details = $"Admin updated doctor {user.FullName}"
            });

            return _mapper.Map<UserManagementDto>(user);
        }

        public async Task<UserManagementDto> UpdatePatientByAdminAsync(int patientUserId, UpdatePatientByAdminDto dto, int adminUserId, string? newProfilePicturePath = null)
        {
            var user = await _userRepository.GetByIdAsync(patientUserId);
            if (user == null || user.Role != UserRole.Patient)
            {
                throw new Exception("Patient not found");
            }

            var patient = user.Patient;
            if (patient == null)
            {
                throw new Exception("Patient profile not found");
            }

            if (!string.IsNullOrEmpty(dto.FirstName) && !string.IsNullOrEmpty(dto.LastName))
            {
                user.FullName = $"{dto.FirstName} {dto.LastName}".Trim();
            }

            if (!string.IsNullOrEmpty(dto.Email))
            {
                user.Email = dto.Email.Trim().ToLowerInvariant();
            }

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
            {
                user.PhoneNumber = dto.PhoneNumber;
            }

            if (dto.IsActive.HasValue)
            {
                user.IsActive = dto.IsActive.Value;
            }

            if (!string.IsNullOrEmpty(newProfilePicturePath))
            {
                user.ProfilePicture = newProfilePicturePath;
            }

            await _userRepository.UpdateAsync(user);

            if (dto.DateOfBirth.HasValue)
            {
                patient.DateOfBirth = dto.DateOfBirth;
            }

            if (!string.IsNullOrEmpty(dto.Gender))
            {
                patient.Gender = dto.Gender;
            }

            await _patientRepository.UpdateAsync(patient);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Patient Updated by Admin",
                EntityType = "Patient",
                EntityId = patient.Id,
                Details = $"Admin updated patient {user.FullName}"
            });

            return _mapper.Map<UserManagementDto>(user);
        }

        public async Task<IEnumerable<UserManagementDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<UserManagementDto>>(users);
        }

        public async Task DeleteDoctorByAdminAsync(int doctorUserId, int adminUserId)
        {
            var user = await _userRepository.GetByIdAsync(doctorUserId);
            if (user == null || user.Role != UserRole.Doctor)
            {
                throw new Exception("Doctor not found");
            }

            var fullName = user.FullName;

            await _userRepository.DeleteAsync(doctorUserId);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Doctor Deleted by Admin",
                EntityType = "Doctor",
                EntityId = doctorUserId,
                Details = $"Admin deleted doctor account for {fullName}"
            });
        }

        public async Task DeletePatientByAdminAsync(int patientUserId, int adminUserId)
        {
            var user = await _userRepository.GetByIdAsync(patientUserId);
            if (user == null || user.Role != UserRole.Patient)
            {
                throw new Exception("Patient not found");
            }

            var fullName = user.FullName;

            await _userRepository.DeleteAsync(patientUserId);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Patient Deleted by Admin",
                EntityType = "Patient",
                EntityId = patientUserId,
                Details = $"Admin deleted patient account for {fullName}"
            });
        }

        public async Task<UserManagementDto> UpdateUserStatusAsync(int userId, UpdateUserStatusDto dto, int adminUserId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            user.IsActive = dto.IsActive;
            await _userRepository.UpdateAsync(user);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = "Update User Status",
                EntityType = "User",
                EntityId = userId,
                Details = $"User {user.FullName} status changed to {(dto.IsActive ? "Active" : "Inactive")}"
            });

            return _mapper.Map<UserManagementDto>(user);
        }

        public async Task<IEnumerable<ActivityLogDto>> GetAllActivityLogsAsync()
        {
            var logs = await _activityLogRepository.GetAllAsync();
            var logDtos = new List<ActivityLogDto>();

            foreach (var log in logs)
            {
                var user = await _userRepository.GetByIdAsync(log.UserId);
                var dto = _mapper.Map<ActivityLogDto>(log);
                dto.UserName = user?.FullName ?? "Unknown";
                logDtos.Add(dto);
            }
            return logDtos;
        }

        public async Task<IEnumerable<ActivityLogDto>> GetUserActivityLogsAsync(int userId)
        {
            var logs = await _activityLogRepository.GetByUserIdAsync(userId);
            var user = await _userRepository.GetByIdAsync(userId);

            return logs.Select(log =>
            {
                var dto = _mapper.Map<ActivityLogDto>(log);
                dto.UserName = user?.FullName ?? "Unknown";
                return dto;
            });
        }

        public async Task<IEnumerable<UserManagementDto>> GetPendingDoctorsAsync()
        {
            var doctors = await _doctorRepository.GetAllAsync();
            var pendingDoctors = doctors.Where(d => !d.IsApproved).ToList();

            return pendingDoctors.Select(d => new UserManagementDto
            {
                Id = d.User.Id,
                Email = d.User.Email,
                FullName = d.User.FullName,
                Role = d.User.Role.ToString(),
                IsActive = d.User.IsActive,
                CreatedAt = d.User.CreatedAt
            }).ToList();
        }

        public async Task<UserManagementDto> ApproveDoctorAsync(int doctorId, int adminUserId, ApproveDoctorDto dto)
        {
            var doctor = await _doctorRepository.GetByIdAsync(doctorId);
            if (doctor == null) throw new Exception("Doctor not found");

            doctor.IsApproved = dto.IsApproved;
            if (dto.IsApproved)
            {
                doctor.ApprovedByAdminId = adminUserId;
                doctor.ApprovedAt = DateTime.UtcNow;
            }

            await _doctorRepository.UpdateAsync(doctor);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = dto.IsApproved ? "Approve Doctor" : "Reject Doctor",
                EntityType = "Doctor",
                EntityId = doctorId,
                Details = dto.IsApproved
                    ? $"Doctor {doctor.User.FullName} approved"
                    : $"Doctor {doctor.User.FullName} rejected. Reason: {dto.RejectionReason}"
            });

            return _mapper.Map<UserManagementDto>(doctor.User);
        }

        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var doctors = await _doctorRepository.GetAllAsync();
            var patients = users.Where(u => u.Role == UserRole.Patient).ToList();

            var allAppointments = new List<Appointment>();
            foreach (var doctor in doctors)
            {
                var doctorAppointments = await _appointmentRepository.GetByDoctorIdAsync(doctor.Id);
                allAppointments.AddRange(doctorAppointments);
            }

            var now = DateTime.UtcNow;
            var todayAppointments = allAppointments.Count(a => a.AppointmentDate.Date == now.Date);
            var completedAppointments = allAppointments.Count(a => a.Status == AppointmentStatus.Completed);
            var cancelledAppointments = allAppointments.Count(a => a.Status == AppointmentStatus.Cancelled);

            var totalRevenue = allAppointments
                .Where(a => a.Status == AppointmentStatus.Completed && a.PaymentStatus == PaymentStatus.Paid)
                .Sum(a => doctors.FirstOrDefault(d => d.Id == a.DoctorId)?.ConsultationPrice ?? 0);

            var recentLogs = await _activityLogRepository.GetAllAsync();
            var recentActivities = recentLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(10)
                .Select(l =>
                {
                    var user = users.FirstOrDefault(u => u.Id == l.UserId);
                    return new RecentActivityDto
                    {
                        Action = l.Action,
                        UserName = user?.FullName ?? "Unknown",
                        Timestamp = l.Timestamp
                    };
                })
                .ToList();

            return new AdminDashboardDto
            {
                TotalPatients = patients.Count,
                TotalDoctors = doctors.Count(),
                ApprovedDoctors = doctors.Count(d => d.IsApproved),
                PendingDoctors = doctors.Count(d => !d.IsApproved),
                TotalAppointments = allAppointments.Count,
                TodayAppointments = todayAppointments,
                CompletedAppointments = completedAppointments,
                CancelledAppointments = cancelledAppointments,
                TotalRevenue = totalRevenue,
                RecentActivities = recentActivities
            };
        }

        // ── Content Moderation ────────────────────────────────────────────

        /// <summary>
        /// Permanently delete a story. Used when a story contains bullying or
        /// medically incorrect information.
        /// </summary>
        public async Task DeleteStoryByAdminAsync(int storyId, int adminUserId, ModerateContentDto dto)
        {
            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId     = adminUserId,
                Action     = "Admin Deleted Story",
                EntityType = "Story",
                EntityId   = storyId,
                Details    = $"Story '{story.Title}' (owner PatientId={story.PatientId}) " +
                             $"deleted by admin. Reason: {dto.Reason}"
            });

            await _storyRepository.DeleteAsync(storyId);
        }

        /// <summary>
        /// Permanently delete a single comment (or reply). Used when a comment
        /// contains bullying or medically incorrect information.
        /// </summary>
        public async Task DeleteCommentByAdminAsync(int commentId, int adminUserId, ModerateContentDto dto)
        {
            var comment = await _storyCommentRepository.GetByIdAsync(commentId)
                ?? throw new Exception("Comment not found");

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId     = adminUserId,
                Action     = "Admin Deleted Comment",
                EntityType = "StoryComment",
                EntityId   = commentId,
                Details    = $"Comment by '{comment.CommenterName}' on StoryId={comment.StoryId} " +
                             $"deleted by admin. Reason: {dto.Reason}"
            });

            await _storyCommentRepository.DeleteAsync(commentId);
        }
    }
}
