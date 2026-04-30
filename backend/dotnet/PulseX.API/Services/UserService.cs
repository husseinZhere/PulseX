using AutoMapper;
using PulseX.API.Helpers;
using PulseX.Core.DTOs.User;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using Microsoft.Extensions.Logging;

namespace PulseX.API.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IHealthDataRepository _healthDataRepository;
        private readonly IPatientHealthInfoRepository _patientHealthInfoRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly ILogger<UserService> _logger;
        private readonly IMapper _mapper;

        public UserService(
            IUserRepository userRepository,
            IPatientRepository patientRepository,
            IHealthDataRepository healthDataRepository,
            IPatientHealthInfoRepository patientHealthInfoRepository,
            IAppointmentRepository appointmentRepository,
            IMedicalRecordRepository medicalRecordRepository,
            ILogger<UserService> logger,
            IMapper mapper)
        {
            _userRepository = userRepository;
            _patientRepository = patientRepository;
            _healthDataRepository = healthDataRepository;
            _patientHealthInfoRepository = patientHealthInfoRepository;
            _appointmentRepository = appointmentRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _logger = logger;
            _mapper = mapper;
        }

        // ===== NEW PATIENT PROFILE METHODS =====

        public async Task<PatientProfileDto> GetPatientProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || user.Role != UserRole.Patient)
            {
                throw new Exception("Patient not found");
            }

            var patient = user.Patient;
            if (patient == null)
            {
                throw new Exception("Patient profile not found");
            }

            // Get latest health info
            var latestHealthInfo = await _patientHealthInfoRepository.GetLatestByPatientIdAsync(patient.Id);
            var healthData = (await _healthDataRepository.GetByPatientIdAsync(patient.Id)).ToList();
            var healthInfoLastUpdated = latestHealthInfo?.UpdatedAt ?? latestHealthInfo?.CreatedAt;
            var latestHeight = GetLatestHealthDataByTypes(healthData, "Height");
            var latestWeight = GetLatestHealthDataByTypes(healthData, "Weight");
            var latestBloodPressure = GetLatestHealthDataByTypes(healthData, "BloodPressure", "Blood Pressure");
            var latestBloodSugar = GetLatestHealthDataByTypes(healthData, "BloodSugar", "Blood Sugar");
            var latestCholesterol = GetLatestHealthDataByTypes(healthData, "Cholesterol");
            var latestBloodCount = GetLatestHealthDataByTypes(healthData, "BloodCount", "Blood Count");
            var latestHeartRate = GetLatestHealthDataByTypes(healthData, "HeartRate", "Heart Rate");

            // Map health information
            var healthInfo = new HealthInformationDto
            {
                Height = SelectLatestDecimal(latestHealthInfo?.Height, healthInfoLastUpdated, latestHeight),
                Weight = SelectLatestDecimal(latestHealthInfo?.Weight, healthInfoLastUpdated, latestWeight),
                BloodPressure = SelectLatestString(latestHealthInfo?.BloodPressure, healthInfoLastUpdated, latestBloodPressure),
                BloodSugar = SelectLatestDecimal(latestHealthInfo?.BloodSugar, healthInfoLastUpdated, latestBloodSugar),
                Cholesterol = SelectLatestDecimal(null, null, latestCholesterol),
                BloodCount = SelectLatestString(latestHealthInfo?.BloodCount, healthInfoLastUpdated, latestBloodCount),
                HeartRate = SelectLatestString(latestHealthInfo?.HeartRate, healthInfoLastUpdated, latestHeartRate),
                LastUpdated = GetLatestDate(
                    healthInfoLastUpdated,
                    latestHeight?.RecordedAt,
                    latestWeight?.RecordedAt,
                    latestBloodPressure?.RecordedAt,
                    latestBloodSugar?.RecordedAt,
                    latestCholesterol?.RecordedAt,
                    latestBloodCount?.RecordedAt,
                    latestHeartRate?.RecordedAt)
            };
            healthInfo.HasHealthData = HasHealthInformationData(healthInfo);

            return new PatientProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                ProfilePicture = user.ProfilePicture,
                PatientId = patient.PatientId,
                DateOfBirth = patient.DateOfBirth,
                Gender = patient.Gender,
                Location = patient.Location,
                About = patient.About,
                Age = patient.DateOfBirth.HasValue 
                    ? DateTime.Now.Year - patient.DateOfBirth.Value.Year 
                    : null,
                HealthInformation = healthInfo.HasHealthData ? healthInfo : null,
                EmailNotificationsEnabled = patient.EmailNotificationsEnabled,
                DarkModeEnabled = patient.DarkModeEnabled
            };
        }

        public async Task<PatientProfileDto> UpdatePatientProfileAsync(int userId, UpdatePatientProfileDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient profile not found");
            }

            // Update User fields
            if (!string.IsNullOrEmpty(dto.FirstName) || !string.IsNullOrEmpty(dto.LastName))
            {
                var firstName = dto.FirstName ?? user.FullName.Split(' ')[0];
                var lastName = dto.LastName ?? (user.FullName.Contains(' ') ? user.FullName.Split(' ', 2)[1] : "");
                user.FullName = $"{firstName} {lastName}".Trim();
            }

            if (!string.IsNullOrEmpty(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;

            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Update Patient fields
            if (dto.DateOfBirth.HasValue)
                patient.DateOfBirth = dto.DateOfBirth;

            if (!string.IsNullOrEmpty(dto.Gender))
                patient.Gender = dto.Gender;

            if (!string.IsNullOrEmpty(dto.Location))
                patient.Location = dto.Location;

            if (dto.About != null) // Allow empty string to clear About
                patient.About = dto.About;

            await _patientRepository.UpdateAsync(patient);

            return await GetPatientProfileAsync(userId);
        }

        public async Task UpdateProfilePictureAsync(int userId, string profilePictureUrl)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            user.ProfilePicture = profilePictureUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
        }

        public async Task UpdateAccountSettingsAsync(int userId, UpdateAccountSettingsDto dto)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient profile not found");
            }

            if (dto.EmailNotificationsEnabled.HasValue)
                patient.EmailNotificationsEnabled = dto.EmailNotificationsEnabled.Value;

            if (dto.DarkModeEnabled.HasValue)
                patient.DarkModeEnabled = dto.DarkModeEnabled.Value;

            await _patientRepository.UpdateAsync(patient);
        }

        // ===== EXISTING METHODS =====

        public async Task<UserProfileDto> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            if (!string.IsNullOrEmpty(dto.FullName))
                user.FullName = dto.FullName;
            
            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;

            await _userRepository.UpdateAsync(user);

            if (user.Role == UserRole.Patient && user.Patient != null)
            {
                var patient = user.Patient;
                
                if (dto.DateOfBirth.HasValue)
                    patient.DateOfBirth = dto.DateOfBirth;
                
                if (!string.IsNullOrEmpty(dto.Gender))
                    patient.Gender = dto.Gender;

                await _patientRepository.UpdateAsync(patient);
            }

            return await GetProfileAsync(userId);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            // Verify current password
            if (!PasswordHelper.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            {
                throw new Exception("Current password is incorrect");
            }

            // Validate new password requirements
            if (dto.NewPassword.Length < 8)
            {
                throw new Exception("Password must be at least 8 characters long");
            }

            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.NewPassword, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"))
            {
                throw new Exception("Password must contain uppercase, lowercase letters and at least one number");
            }

            if (dto.NewPassword != dto.ConfirmNewPassword)
            {
                throw new Exception("Passwords do not match");
            }

            // Update password
            user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
        }

        public async Task<PatientDashboardDto> GetPatientDashboardAsync(int patientUserId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(patientUserId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
            var now = DateTime.UtcNow;
            
            var upcomingAppointments = appointments
                .Where(a => a.AppointmentDate > now && a.Status == AppointmentStatus.Scheduled)
                .OrderBy(a => a.AppointmentDate)
                .Take(5)
                .Select(a => new UpcomingAppointmentInfoDto
                {
                    Id = a.Id,
                    DoctorName = a.Doctor.User.FullName,
                    Specialization = a.Doctor.Specialization,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status.ToString()
                })
                .ToList();

            var medicalRecords = await _medicalRecordRepository.GetByPatientIdAsync(patient.Id);
            var healthData = await _healthDataRepository.GetByPatientIdAsync(patient.Id);
            
            var latestHealthData = healthData.OrderByDescending(h => h.RecordedAt).FirstOrDefault();
            var latestHealthMetric = latestHealthData != null 
                ? $"{latestHealthData.DataType}: {latestHealthData.Value} {latestHealthData.Unit}"
                : null;

            var aiRiskScore = CalculateAIRiskScore(healthData);

            return new PatientDashboardDto
            {
                UpcomingAppointments = appointments.Count(a => a.AppointmentDate > now && a.Status == AppointmentStatus.Scheduled),
                CompletedAppointments = appointments.Count(a => a.Status == AppointmentStatus.Completed),
                TotalMedicalRecords = medicalRecords.Count(),
                TotalHealthDataEntries = healthData.Count(),
                LatestHealthMetric = latestHealthMetric,
                NextAppointments = upcomingAppointments,
                AIRiskScore = aiRiskScore
            };
        }

        private string CalculateAIRiskScore(IEnumerable<Core.Models.HealthData> healthData)
        {
            if (!healthData.Any())
            {
                return "No data available";
            }

            var recentBP = healthData
                .Where(h => h.DataType.ToLower().Contains("blood") && h.DataType.ToLower().Contains("pressure"))
                .OrderByDescending(h => h.RecordedAt)
                .FirstOrDefault();

            if (recentBP != null)
            {
                var bpValue = recentBP.Value;
                if (bpValue.Contains("/"))
                {
                    var parts = bpValue.Split('/');
                    if (parts.Length == 2 && int.TryParse(parts[0], out int systolic))
                    {
                        if (systolic > 140)
                            return "High Risk - Please consult your doctor";
                        else if (systolic > 130)
                            return "Moderate Risk - Monitor closely";
                        else
                            return "Low Risk - Keep monitoring";
                    }
                }
            }

            return "Normal - Continue healthy habits";
        }

        private static string NormalizeDataTypeKey(string? dataType)
        {
            if (string.IsNullOrWhiteSpace(dataType))
            {
                return string.Empty;
            }

            return new string(dataType.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
        }

        private static Core.Models.HealthData? GetLatestHealthDataByTypes(IEnumerable<Core.Models.HealthData> healthData, params string[] acceptedTypes)
        {
            var accepted = acceptedTypes
                .Select(NormalizeDataTypeKey)
                .Where(key => !string.IsNullOrWhiteSpace(key))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            return healthData
                .Where(item => accepted.Contains(NormalizeDataTypeKey(item.DataType)))
                .OrderByDescending(item => item.RecordedAt)
                .FirstOrDefault();
        }

        private static decimal? ParseNullableDecimal(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return decimal.TryParse(value, out var parsed) ? parsed : null;
        }

        private static DateTime? GetLatestDate(params DateTime?[] values)
        {
            var nonNullValues = values.Where(value => value.HasValue).Select(value => value!.Value).ToList();
            return nonNullValues.Count == 0 ? null : nonNullValues.Max();
        }

        private static string? SelectLatestString(string? healthInfoValue, DateTime? healthInfoDate, Core.Models.HealthData? healthData)
        {
            if (healthData != null && (string.IsNullOrWhiteSpace(healthInfoValue) || !healthInfoDate.HasValue || healthData.RecordedAt >= healthInfoDate.Value))
            {
                return healthData.Value;
            }

            return healthInfoValue;
        }

        private static decimal? SelectLatestDecimal(decimal? healthInfoValue, DateTime? healthInfoDate, Core.Models.HealthData? healthData)
        {
            var healthDataValue = ParseNullableDecimal(healthData?.Value);
            if (healthDataValue.HasValue && (!healthInfoValue.HasValue || !healthInfoDate.HasValue || healthData!.RecordedAt >= healthInfoDate.Value))
            {
                return healthDataValue;
            }

            return healthInfoValue;
        }

        private static bool HasHealthInformationData(HealthInformationDto info)
        {
            return info.Height.HasValue ||
                   info.Weight.HasValue ||
                   !string.IsNullOrWhiteSpace(info.BloodPressure) ||
                   info.BloodSugar.HasValue ||
                   info.Cholesterol.HasValue ||
                   !string.IsNullOrWhiteSpace(info.BloodCount) ||
                   !string.IsNullOrWhiteSpace(info.HeartRate);
        }

        /// <summary>
        /// Update patient health data
        /// </summary>
        public async Task<HealthInformationDto> UpdateHealthDataAsync(int userId, UpdateHealthDataDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || user.Role != UserRole.Patient)
            {
                throw new Exception("Patient not found");
            }

            var patient = user.Patient;
            if (patient == null)
            {
                throw new Exception("Patient profile not found");
            }

            // Create new health info record
            var healthInfo = new PatientHealthInfo
            {
                PatientId = patient.Id,
                HeartRate = dto.HeartRate,
                BloodPressure = dto.BloodPressure,
                BloodCount = dto.BloodCount,
                Height = dto.Height,
                Weight = dto.Weight,
                BloodSugar = dto.BloodSugar,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _patientHealthInfoRepository.AddAsync(healthInfo);

            // Return updated health information
            return new HealthInformationDto
            {
                Height = healthInfo.Height,
                Weight = healthInfo.Weight,
                BloodPressure = healthInfo.BloodPressure,
                BloodSugar = healthInfo.BloodSugar,
                Cholesterol = dto.Cholesterol,
                BloodCount = healthInfo.BloodCount,
                HeartRate = healthInfo.HeartRate,
                LastUpdated = healthInfo.CreatedAt,
                HasHealthData = true
            };
        }

        /// <summary>
        /// Get health data options for dropdowns
        /// </summary>
        public HealthDataOptionsDto GetHealthDataOptions()
        {
            return new HealthDataOptionsDto();
        }
    }
}
