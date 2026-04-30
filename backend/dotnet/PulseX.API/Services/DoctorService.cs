using AutoMapper;
using PulseX.Core.DTOs.Doctor;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using System.Globalization;
using System.Text.Json;

namespace PulseX.API.Services
{
    public class DoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IDoctorRatingRepository _ratingRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHealthDataRepository _healthDataRepository;
        private readonly IPatientHealthInfoRepository _patientHealthInfoRepository;
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IRiskAssessmentRepository _riskAssessmentRepository;
        private readonly IMapper _mapper;

        private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };
        private static readonly TimeZoneInfo EgyptTz =
            TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

        private static DateTime EgyptNow =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, EgyptTz);

        public DoctorService(
            IDoctorRepository doctorRepository,
            IDoctorRatingRepository ratingRepository,
            IPatientRepository patientRepository,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IHealthDataRepository healthDataRepository,
            IPatientHealthInfoRepository patientHealthInfoRepository,
            IMedicalRecordRepository medicalRecordRepository,
            IRiskAssessmentRepository riskAssessmentRepository,
            IMapper mapper)
        {
            _doctorRepository = doctorRepository;
            _ratingRepository = ratingRepository;
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _healthDataRepository = healthDataRepository;
            _patientHealthInfoRepository = patientHealthInfoRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _riskAssessmentRepository = riskAssessmentRepository;
            _mapper = mapper;
        }

        // Deserialize the JSON string stored in Doctor.ProfessionalExperience into the typed list
        private static List<ProfessionalExperienceItemDto> DeserializeExperience(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new();
            try
            {
                return JsonSerializer.Deserialize<List<ProfessionalExperienceItemDto>>(json, _jsonOptions) ?? new();
            }
            catch
            {
                return new();
            }
        }

        private static bool IsOpenAppointment(Appointment appointment) =>
            appointment.Status != AppointmentStatus.Cancelled;

        private static bool IsBookableAppointment(Appointment appointment) =>
            appointment.Status == AppointmentStatus.Scheduled ||
            appointment.Status == AppointmentStatus.Confirmed;

        private static bool IsHighRisk(RiskAssessment risk) =>
            risk.RiskScore >= 70 ||
            risk.RiskLevel.Equals("High", StringComparison.OrdinalIgnoreCase);

        private static string FormatTimeAgo(DateTime value)
        {
            var diff = DateTime.UtcNow - value;
            if (diff.TotalSeconds < 60) return "Just now";
            if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} min ago";
            if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} hour ago";
            return $"{(int)Math.Max(1, diff.TotalDays)} day ago";
        }

        private static decimal CalculatePercentChange(int current, int previous)
        {
            if (previous == 0)
            {
                return current > 0 ? 100 : 0;
            }

            return Math.Round(((decimal)(current - previous) / previous) * 100, 1);
        }

        private static int CalculateAge(DateTime dateOfBirth)
        {
            var today = DateTime.Today;
            var age = today.Year - dateOfBirth.Year;
            if (today < dateOfBirth.AddYears(age)) age--;
            return Math.Max(age, 0);
        }

        private static string NormalizeRiskLevel(RiskAssessment? latestRisk)
        {
            if (latestRisk == null)
            {
                return "Unknown";
            }

            // Prefer the stored label first so doctor and patient views stay aligned.
            if (!string.IsNullOrWhiteSpace(latestRisk.RiskLevel))
            {
                var riskLevel = latestRisk.RiskLevel.Trim();
                if (riskLevel.Equals("High", StringComparison.OrdinalIgnoreCase) ||
                    riskLevel.Contains("High", StringComparison.OrdinalIgnoreCase))
                {
                    return "High";
                }

                if (riskLevel.Equals("Medium", StringComparison.OrdinalIgnoreCase) ||
                    riskLevel.Equals("Moderate", StringComparison.OrdinalIgnoreCase) ||
                    riskLevel.Contains("Medium", StringComparison.OrdinalIgnoreCase) ||
                    riskLevel.Contains("Moderate", StringComparison.OrdinalIgnoreCase))
                {
                    return "Medium";
                }

                if (riskLevel.Equals("Low", StringComparison.OrdinalIgnoreCase) ||
                    riskLevel.Contains("Low", StringComparison.OrdinalIgnoreCase))
                {
                    return "Low";
                }
            }

            // Fall back to score bucketing only when label is missing/invalid.
            if (latestRisk.RiskScore >= 0 && latestRisk.RiskScore < 30)
            {
                return "Low";
            }

            if (latestRisk.RiskScore >= 30 && latestRisk.RiskScore < 70)
            {
                return "Medium";
            }

            if (latestRisk.RiskScore >= 70 && latestRisk.RiskScore <= 100)
            {
                return "High";
            }

            return "Unknown";
        }

        private static RiskAssessment? SelectPreferredRiskAssessment(IEnumerable<RiskAssessment> assessments)
        {
            var ordered = assessments
                .OrderByDescending(assessment => assessment.AssessedAt)
                .ThenByDescending(assessment => assessment.Id)
                .ToList();

            if (ordered.Count == 0)
            {
                return null;
            }

            var latestAi = ordered.FirstOrDefault(assessment => assessment.IsAIGenerated);
            return latestAi ?? ordered.First();
        }

        private static string NormalizeDataTypeKey(string? dataType)
        {
            if (string.IsNullOrWhiteSpace(dataType))
            {
                return string.Empty;
            }

            return new string(dataType.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
        }

        private static HealthData? GetLatestHealthDataByTypes(IEnumerable<HealthData> healthData, params string[] acceptedTypes)
        {
            if (healthData == null || acceptedTypes.Length == 0)
            {
                return null;
            }

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

            if (decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedInvariant))
            {
                return parsedInvariant;
            }

            if (decimal.TryParse(value, NumberStyles.Any, CultureInfo.CurrentCulture, out var parsedCurrent))
            {
                return parsedCurrent;
            }

            return null;
        }

        private static DateTime? GetLatestDate(params DateTime?[] values)
        {
            var nonNullValues = values.Where(value => value.HasValue).Select(value => value!.Value).ToList();
            if (nonNullValues.Count == 0)
            {
                return null;
            }

            return nonNullValues.Max();
        }

        private static bool HasHealthInformationData(DoctorPatientHealthInformationDto info)
        {
            return info.Height.HasValue ||
                   info.Weight.HasValue ||
                   !string.IsNullOrWhiteSpace(info.BloodPressure) ||
                   info.BloodSugar.HasValue ||
                   info.Cholesterol.HasValue ||
                   !string.IsNullOrWhiteSpace(info.BloodCount) ||
                   !string.IsNullOrWhiteSpace(info.HeartRate);
        }

        private static string? SelectLatestString(string? healthInfoValue, DateTime? healthInfoDate, HealthData? healthData)
        {
            if (healthData != null && (string.IsNullOrWhiteSpace(healthInfoValue) || !healthInfoDate.HasValue || healthData.RecordedAt >= healthInfoDate.Value))
            {
                return healthData.Value;
            }

            return healthInfoValue;
        }

        private static decimal? SelectLatestDecimal(decimal? healthInfoValue, DateTime? healthInfoDate, HealthData? healthData)
        {
            var healthDataValue = ParseNullableDecimal(healthData?.Value);
            if (healthDataValue.HasValue && (!healthInfoValue.HasValue || !healthInfoDate.HasValue || healthData!.RecordedAt >= healthInfoDate.Value))
            {
                return healthDataValue;
            }

            return healthInfoValue;
        }

        private static DoctorPatientHealthInformationDto? MergeHealthInformation(
            DoctorPatientHealthInformationDto? latestHealthInfo,
            HealthData? latestHeight,
            HealthData? latestWeight,
            HealthData? latestBloodPressure,
            HealthData? latestBloodSugar,
            HealthData? latestCholesterol,
            HealthData? latestBloodCount,
            HealthData? latestHeartRate)
        {
            var healthInfoDate = latestHealthInfo?.LastUpdated;
            var merged = new DoctorPatientHealthInformationDto
            {
                Height = SelectLatestDecimal(latestHealthInfo?.Height, healthInfoDate, latestHeight),
                Weight = SelectLatestDecimal(latestHealthInfo?.Weight, healthInfoDate, latestWeight),
                BloodPressure = SelectLatestString(latestHealthInfo?.BloodPressure, healthInfoDate, latestBloodPressure),
                BloodSugar = SelectLatestDecimal(latestHealthInfo?.BloodSugar, healthInfoDate, latestBloodSugar),
                Cholesterol = SelectLatestDecimal(latestHealthInfo?.Cholesterol, healthInfoDate, latestCholesterol),
                BloodCount = SelectLatestString(latestHealthInfo?.BloodCount, healthInfoDate, latestBloodCount),
                HeartRate = SelectLatestString(latestHealthInfo?.HeartRate, healthInfoDate, latestHeartRate),
                LastUpdated = GetLatestDate(
                    latestHealthInfo?.LastUpdated,
                    latestHeight?.RecordedAt,
                    latestWeight?.RecordedAt,
                    latestBloodPressure?.RecordedAt,
                    latestBloodSugar?.RecordedAt,
                    latestCholesterol?.RecordedAt,
                    latestBloodCount?.RecordedAt,
                    latestHeartRate?.RecordedAt)
            };

            merged.HasHealthData = HasHealthInformationData(merged);
            return merged.HasHealthData ? merged : null;
        }

        private static string BuildLastVisitRelative(DateTime? lastVisit)
        {
            if (!lastVisit.HasValue)
            {
                return "Never";
            }

            var nowEgypt = EgyptNow;
            var daysSince = (nowEgypt - lastVisit.Value).TotalDays;

            if (daysSince < 1)
            {
                return "Today";
            }

            if (daysSince < 7)
            {
                return $"{(int)daysSince} days ago";
            }

            if (daysSince < 30)
            {
                return $"{(int)(daysSince / 7)} weeks ago";
            }

            return $"{(int)(daysSince / 30)} months ago";
        }

        private static (string chatStatus, bool canChat) BuildChatStatus(Appointment? lastAppointment)
        {
            if (lastAppointment == null)
            {
                return ("Open Chat", false);
            }

            if (lastAppointment.ChatExpiryDate.HasValue)
            {
                var timeLeft = lastAppointment.ChatExpiryDate.Value - DateTime.UtcNow;
                if (timeLeft.TotalHours >= 1)
                {
                    return ($"{(int)timeLeft.TotalHours}h left", true);
                }

                if (timeLeft.TotalMinutes > 0)
                {
                    return ("< 1h left", true);
                }

                return ("Open Chat", false);
            }

            var nowEgypt = EgyptNow;
            if (lastAppointment.PaymentMethod == PaymentMethod.Cash &&
                nowEgypt >= lastAppointment.AppointmentDate &&
                nowEgypt <= lastAppointment.AppointmentDate.AddHours(24))
            {
                var hoursLeft = (lastAppointment.AppointmentDate.AddHours(24) - nowEgypt).TotalHours;
                return ($"{(int)hoursLeft}h left", true);
            }

            return ("Open Chat", false);
        }

        public async Task<IEnumerable<DoctorListDto>> GetAllDoctorsAsync(bool approvedOnly = true)
        {
            var doctors = await _doctorRepository.GetAllAsync();

            if (approvedOnly)
            {
                doctors = doctors.Where(d => d.IsApproved).ToList();
            }

            return _mapper.Map<IEnumerable<DoctorListDto>>(doctors);
        }

        public async Task<DoctorProfileDto> GetDoctorProfileAsync(int doctorId)
        {
            var doctor = await _doctorRepository.GetByIdAsync(doctorId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            var dto = _mapper.Map<DoctorProfileDto>(doctor);
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctorId);
            dto.TotalPatients = appointments.Select(a => a.PatientId).Distinct().Count();
            return dto;
        }

        public async Task<DoctorDashboardDto> GetDoctorDashboardAsync(int doctorUserId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(doctorUserId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            var nowEgypt = EgyptNow;
            var today = nowEgypt.Date;
            var startOfWeek = today.AddDays(-6);
            var previousWeekStart = startOfWeek.AddDays(-7);
            var previousWeekEnd = startOfWeek.AddDays(-1);

            var appointments = (await _appointmentRepository.GetByDoctorIdAsync(doctor.Id)).ToList();
            var activeAppointments = appointments.Where(IsOpenAppointment).ToList();

            var uniquePatientIds = activeAppointments.Select(a => a.PatientId).Distinct().ToList();
            var totalPatients = uniquePatientIds.Count;
            var previousTotalPatients = activeAppointments
                .Where(a => a.AppointmentDate.Date < startOfWeek)
                .Select(a => a.PatientId)
                .Distinct()
                .Count();
            var patientsGrowthPercent = CalculatePercentChange(totalPatients, previousTotalPatients);

            var criticalPatients = new List<CriticalPatientDto>();
            var previousCriticalCases = 0;
            foreach (var patientId in uniquePatientIds)
            {
                var patient = await _patientRepository.GetByIdAsync(patientId);
                if (patient?.User == null) continue;

                var riskAssessments = (await _riskAssessmentRepository.GetByPatientIdAsync(patientId))
                    .OrderByDescending(r => r.AssessedAt)
                    .ToList();
                var latestRisk = riskAssessments.FirstOrDefault();
                var previousRisk = riskAssessments
                    .Where(r => r.AssessedAt.Date <= previousWeekEnd)
                    .OrderByDescending(r => r.AssessedAt)
                    .FirstOrDefault();

                if (previousRisk != null && IsHighRisk(previousRisk))
                {
                    previousCriticalCases++;
                }

                if (latestRisk == null || !IsHighRisk(latestRisk)) continue;

                var age = DateTime.Now.Year - patient.User.DateOfBirth.Year;
                if (DateTime.Now < patient.User.DateOfBirth.AddYears(age)) age--;

                var lastAppointment = activeAppointments
                    .Where(a => a.PatientId == patientId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefault();

                criticalPatients.Add(new CriticalPatientDto
                {
                    PatientId = patient.Id,
                    PatientName = patient.User.FullName,
                    ProfilePicture = patient.User.ProfilePicture,
                    Age = age,
                    RiskLevel = "High Risk",
                    RiskScore = latestRisk.RiskScore,
                    LastCondition = latestRisk.Summary ?? latestRisk.RiskLevel,
                    LastVisit = lastAppointment?.AppointmentDate,
                    StatusBadge = "High Risk"
                });
            }
            var criticalGrowthPercent = CalculatePercentChange(criticalPatients.Count, previousCriticalCases);

            var todayAppointmentsList = activeAppointments
                .Where(a => a.AppointmentDate.Date == today)
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new UpcomingAppointmentDto
                {
                    Id = a.Id,
                    PatientName = a.Patient?.User?.FullName ?? "Patient",
                    PatientProfilePicture = a.Patient?.User?.ProfilePicture,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status.ToString(),
                    AppointmentTime = a.AppointmentDate.ToString("hh:mm tt")
                })
                .ToList();

            var upcomingAppointments = activeAppointments
                .Where(a => a.AppointmentDate >= nowEgypt && IsBookableAppointment(a))
                .OrderBy(a => a.AppointmentDate)
                .Take(5)
                .Select(a => new UpcomingAppointmentDto
                {
                    Id = a.Id,
                    PatientName = a.Patient?.User?.FullName ?? "Patient",
                    PatientProfilePicture = a.Patient?.User?.ProfilePicture,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status.ToString(),
                    AppointmentTime = a.AppointmentDate.ToString("hh:mm tt")
                })
                .ToList();

            var completedAppointments = appointments.Count(a => a.Status == AppointmentStatus.Completed);

            var estimatedEarnings = appointments
                .Where(a => a.Status == AppointmentStatus.Completed && a.PaymentStatus == PaymentStatus.Paid)
                .Sum(a => doctor.ConsultationPrice);

            var recentMessages = activeAppointments
                .SelectMany(a => a.Messages
                    .Where(m => !m.IsRead && a.Patient?.User != null && m.SenderId == a.Patient.UserId)
                    .Select(m => new RecentMessageDto
                    {
                        MessageId = m.Id,
                        AppointmentId = a.Id,
                        PatientId = a.PatientId,
                        PatientUserId = a.Patient!.UserId,
                        PatientName = a.Patient.User.FullName,
                        PatientProfilePicture = a.Patient.User.ProfilePicture,
                        MessagePreview = string.IsNullOrWhiteSpace(m.Content)
                            ? "Attachment"
                            : (m.Content.Length > 80 ? m.Content.Substring(0, 80) + "..." : m.Content),
                        SentAt = m.SentAt,
                        IsUnread = !m.IsRead,
                        UnreadCount = 1,
                        TimeAgo = FormatTimeAgo(m.SentAt)
                    }))
                .OrderByDescending(m => m.SentAt)
                .Take(6)
                .ToList();

            var weeklyOverview = new WeeklyOverviewDto();

            for (var i = 0; i < 7; i++)
            {
                var day = startOfWeek.AddDays(i);
                var dayAppointments = activeAppointments
                    .Where(a => a.AppointmentDate.Date == day.Date)
                    .ToList();

                weeklyOverview.DailyStats.Add(new DailyStatsDto
                {
                    Day = day.ToString("ddd"),
                    PatientsCount = dayAppointments.Select(a => a.PatientId).Distinct().Count(),
                    AppointmentsCount = dayAppointments.Count
                });
            }

            weeklyOverview.TotalPatientsThisWeek = activeAppointments
                .Where(a => a.AppointmentDate.Date >= startOfWeek && a.AppointmentDate.Date <= today)
                .Select(a => a.PatientId)
                .Distinct()
                .Count();

            weeklyOverview.TotalAppointmentsThisWeek = activeAppointments
                .Count(a => a.AppointmentDate.Date >= startOfWeek && a.AppointmentDate.Date <= today);

            var previousWeekAppointments = activeAppointments
                .Count(a => a.AppointmentDate.Date >= previousWeekStart && a.AppointmentDate.Date <= previousWeekEnd);

            weeklyOverview.ChangePercentage = CalculatePercentChange(
                weeklyOverview.TotalAppointmentsThisWeek,
                previousWeekAppointments);

            return new DoctorDashboardDto
            {
                DoctorName = doctor.User?.FullName ?? "Doctor",
                DoctorProfilePicture = !string.IsNullOrWhiteSpace(doctor.ProfilePicture)
                    ? doctor.ProfilePicture
                    : doctor.User?.ProfilePicture,
                TotalPatients = totalPatients,
                CriticalCases = criticalPatients.Count,
                UpcomingAppointments = upcomingAppointments.Count,
                TodayAppointments = todayAppointmentsList.Count,
                CompletedAppointments = completedAppointments,
                PatientsGrowthPercent = patientsGrowthPercent,
                CriticalGrowthPercent = criticalGrowthPercent,
                AppointmentsGrowthPercent = weeklyOverview.ChangePercentage,
                AverageRating = doctor.AverageRating,
                TotalRatings = doctor.TotalRatings,
                EstimatedEarnings = estimatedEarnings,
                NextAppointments = upcomingAppointments,
                TodayAppointmentsList = todayAppointmentsList,
                CriticalPatients = criticalPatients.OrderByDescending(p => p.RiskScore).Take(5).ToList(),
                RecentMessages = recentMessages,
                WeeklyOverview = weeklyOverview
            };
        }

        public async Task<DoctorRatingDto> SubmitRatingAsync(int patientUserId, SubmitRatingDto dto)
        {
            // Validate rating value
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new Exception("Rating must be between 1 and 5");
            }

            // Get patient
            var patient = await _patientRepository.GetByUserIdAsync(patientUserId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Check if appointment exists and belongs to patient
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            if (appointment == null)
            {
                throw new Exception("Appointment not found");
            }

            if (appointment.PatientId != patient.Id)
            {
                throw new Exception("This appointment does not belong to you");
            }

            // Check if appointment is completed
            if (appointment.Status != AppointmentStatus.Completed)
            {
                throw new Exception("You can only rate completed appointments");
            }

            // Check if already rated
            if (await _ratingRepository.HasRatedAppointmentAsync(dto.AppointmentId))
            {
                throw new Exception("You have already rated this appointment");
            }

            // Create rating
            var rating = new DoctorRating
            {
                DoctorId = appointment.DoctorId,
                PatientId = patient.Id,
                AppointmentId = dto.AppointmentId,
                Rating = dto.Rating,
                Review = dto.Review
            };

            await _ratingRepository.AddAsync(rating);

            // Update doctor average rating
            var doctor = await _doctorRepository.GetByIdAsync(appointment.DoctorId);
            if (doctor != null)
            {
                var allRatings = await _ratingRepository.GetByDoctorIdAsync(doctor.Id);
                doctor.TotalRatings = allRatings.Count();
                doctor.AverageRating = (decimal)allRatings.Average(r => r.Rating);
                await _doctorRepository.UpdateAsync(doctor);
            }

            return new DoctorRatingDto
            {
                Id = rating.Id,
                DoctorId = rating.DoctorId,
                PatientId = rating.PatientId,
                PatientName = patient.User.FullName,
                Rating = rating.Rating,
                Review = rating.Review,
                CreatedAt = rating.CreatedAt
            };
        }

        public async Task<IEnumerable<DoctorRatingDto>> GetDoctorRatingsAsync(int doctorId)
        {
            var ratings = await _ratingRepository.GetByDoctorIdAsync(doctorId);
            return ratings.Select(r => new DoctorRatingDto
            {
                Id = r.Id,
                DoctorId = r.DoctorId,
                PatientId = r.PatientId,
                PatientName = r.Patient.User.FullName,
                Rating = r.Rating,
                Review = r.Review,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        /// <summary>
        /// Get Doctor's own profile (for Settings page)
        /// </summary>
        public async Task<DoctorSettingsProfileDto> GetDoctorSettingsProfileAsync(int userId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            return new DoctorSettingsProfileDto
            {
                Id = doctor.Id,
                FullName = doctor.User!.FullName,
                Email = doctor.User.Email,
                PhoneNumber = doctor.User.PhoneNumber,
                  ProfilePicture = doctor.ProfilePicture,
                  DateOfBirth = doctor.User?.DateOfBirth,
                  Gender = doctor.Gender,
                Specialization = doctor.Specialization,
                LicenseNumber = doctor.LicenseNumber,
                ConsultationPrice = doctor.ConsultationPrice,
                ClinicLocation = doctor.ClinicLocation,
                Bio = doctor.Bio,
                YearsOfExperience = doctor.YearsOfExperience,
                Education = doctor.Education,
                ProfessionalExperience = DeserializeExperience(doctor.ProfessionalExperience),
                Certifications = doctor.Certifications,
                Languages = doctor.Languages,
                AvailableHours = doctor.AvailableHours,
                AverageRating = doctor.AverageRating,
                TotalRatings = doctor.TotalRatings,
                IsApproved = doctor.IsApproved
            };
        }

        /// <summary>
        /// Update Doctor's profile (in Settings page)
        /// </summary>
        public async Task<DoctorSettingsProfileDto> UpdateDoctorSettingsProfileAsync(int userId, UpdateDoctorProfileDto dto)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            // Update User fields if provided
            var userUpdated = false;
            if (!string.IsNullOrEmpty(dto.FirstName) || !string.IsNullOrEmpty(dto.LastName))
            {
                var firstName = dto.FirstName ?? doctor.User.FullName.Split(' ')[0];
                var lastName = dto.LastName ?? (doctor.User.FullName.Contains(' ') ? doctor.User.FullName.Split(' ', 2)[1] : "");
                doctor.User.FullName = $"{firstName} {lastName}".Trim();
                userUpdated = true;
            }
            if (dto.PhoneNumber != null)
            {
                doctor.User.PhoneNumber = dto.PhoneNumber;
                userUpdated = true;
            }
            if (dto.DateOfBirth.HasValue)
            {
                doctor.User.DateOfBirth = dto.DateOfBirth.Value;
                userUpdated = true;
            }
            if (userUpdated)
            {
                await _userRepository.UpdateAsync(doctor.User);
            }

            if (dto.Gender != null) doctor.Gender = dto.Gender;
            
            doctor.Specialization = dto.Specialization ?? doctor.Specialization;
            if (dto.LicenseNumber != null) doctor.LicenseNumber = dto.LicenseNumber;
            if (dto.ConsultationPrice.HasValue) doctor.ConsultationPrice = dto.ConsultationPrice.Value;
            if (dto.ClinicLocation != null) doctor.ClinicLocation = dto.ClinicLocation;
            if (dto.Bio != null) doctor.Bio = dto.Bio;
            if (dto.YearsOfExperience.HasValue) doctor.YearsOfExperience = dto.YearsOfExperience.Value;
            if (dto.Education != null) doctor.Education = dto.Education;
            if (dto.ProfessionalExperience != null) doctor.ProfessionalExperience = JsonSerializer.Serialize(dto.ProfessionalExperience, _jsonOptions);
            if (dto.Certifications != null) doctor.Certifications = dto.Certifications;
            if (dto.Languages != null) doctor.Languages = dto.Languages;
            if (dto.AvailableHours != null) doctor.AvailableHours = dto.AvailableHours;

            await _doctorRepository.UpdateAsync(doctor);

            return await GetDoctorSettingsProfileAsync(userId);
        }

        /// <summary>
        /// Upload Doctor's profile picture
        /// </summary>
        public async Task<string> UpdateDoctorProfilePictureAsync(int userId, string filePath)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            doctor.ProfilePicture = filePath;
            await _doctorRepository.UpdateAsync(doctor);

            return filePath;
        }

        /// <summary>
        /// Get appointments that need rating (for patient)
        /// </summary>
        public async Task<IEnumerable<PendingRatingDto>> GetPendingRatingsAsync(int patientUserId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(patientUserId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
            var pendingRatings = new List<PendingRatingDto>();

            foreach (var appointment in appointments)
            {
                // Only completed appointments that haven't been rated
                if (appointment.Status == AppointmentStatus.Completed)
                {
                    var alreadyRated = await _ratingRepository.HasRatedAppointmentAsync(appointment.Id);
                    if (!alreadyRated)
                    {
                        var doctor = await _doctorRepository.GetByIdAsync(appointment.DoctorId);
                        if (doctor != null)
                        {
                            pendingRatings.Add(new PendingRatingDto
                            {
                                AppointmentId = appointment.Id,
                                DoctorId = doctor.Id,
                                DoctorName = doctor.User!.FullName,
                                DoctorSpecialization = doctor.Specialization,
                                DoctorProfilePicture = doctor.ProfilePicture,
                                AppointmentDate = appointment.AppointmentDate,
                                CompletedDate = appointment.UpdatedAt ?? appointment.AppointmentDate
                            });
                        }
                    }
                }
            }

            return pendingRatings.OrderByDescending(p => p.CompletedDate);
        }

        /// <summary>
        /// Get list of patients for doctor (Patient List page)
        /// </summary>
        public async Task<IEnumerable<DoctorPatientListItemDto>> GetDoctorPatientsAsync(int doctorUserId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(doctorUserId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctor.Id);

            // Get unique patients from appointments
            var patientIds = appointments.Select(a => a.PatientId).Distinct();
            var patientsList = new List<DoctorPatientListItemDto>();

            foreach (var patientId in patientIds)
            {
                var patient = await _patientRepository.GetByIdAsync(patientId);
                if (patient?.User == null) continue;

                var patientAppointments = appointments.Where(a => a.PatientId == patientId).ToList();
                var lastAppointment = patientAppointments.OrderByDescending(a => a.AppointmentDate).FirstOrDefault();

                // Calculate age
                var age = CalculateAge(patient.User.DateOfBirth);

                // Determine visit type (from last appointment)
                var visitType = lastAppointment?.PaymentMethod == PaymentMethod.Cash ? "Clinic" : "Online";

                // Chat status
                var (chatStatus, canChat) = BuildChatStatus(lastAppointment);

                // Risk level (from latest risk assessment)
                var riskAssessments = await _riskAssessmentRepository.GetByPatientIdAsync(patientId);
                var latestRisk = SelectPreferredRiskAssessment(riskAssessments);
                var riskLevel = NormalizeRiskLevel(latestRisk);

                // Last visit relative time
                var lastVisitRelative = BuildLastVisitRelative(lastAppointment?.AppointmentDate);

                patientsList.Add(new DoctorPatientListItemDto
                {
                    PatientId = patient.Id,
                    AppointmentId = lastAppointment?.Id ?? 0,
                    PatientName = patient.User.FullName,
                    ProfilePicture = patient.User.ProfilePicture,
                    Age = age,
                    Gender = patient.Gender?.ToString() ?? "Unknown",
                    VisitType = visitType,
                    ChatStatus = chatStatus,
                    CanChat = canChat,
                    RiskLevel = riskLevel,
                    RiskScore = latestRisk?.RiskScore,
                    LastVisit = lastAppointment?.AppointmentDate,
                    LastVisitRelative = lastVisitRelative
                });
            }

            return patientsList.OrderByDescending(p => p.LastVisit);
        }

        /// <summary>
        /// Get detailed patient profile for doctor (when doctor clicks "View Record")
        /// </summary>
        public async Task<DoctorPatientProfileDto> GetPatientProfileForDoctorAsync(int doctorUserId, int patientId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(doctorUserId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            // Verify doctor has appointment with this patient
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctor.Id);
            var hasAppointment = appointments.Any(a => a.PatientId == patientId);
            if (!hasAppointment)
            {
                throw new Exception("You don't have access to this patient's records");
            }

            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient?.User == null)
            {
                throw new Exception("Patient not found");
            }

            var patientAppointments = appointments
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToList();
            var lastAppointment = patientAppointments.FirstOrDefault();

            // Calculate age
            var age = CalculateAge(patient.User.DateOfBirth);
            var visitType = lastAppointment?.PaymentMethod == PaymentMethod.Cash ? "Clinic" : "Online";
            var (chatStatus, _) = BuildChatStatus(lastAppointment);
            var lastVisitRelative = BuildLastVisitRelative(lastAppointment?.AppointmentDate);

            // Get latest health data and support both old/new naming styles for DataType keys.
            var healthData = (await _healthDataRepository.GetByPatientIdAsync(patientId)).ToList();
            var latestHeartRate = GetLatestHealthDataByTypes(healthData, "HeartRate", "Heart Rate");
            var latestBloodPressure = GetLatestHealthDataByTypes(healthData, "BloodPressure", "Blood Pressure");
            var latestBloodSugar = GetLatestHealthDataByTypes(healthData, "BloodSugar", "Blood Sugar");
            var latestCholesterol = GetLatestHealthDataByTypes(healthData, "Cholesterol");
            var latestBloodCount = GetLatestHealthDataByTypes(healthData, "BloodCount", "Blood Count");
            var latestHeight = GetLatestHealthDataByTypes(healthData, "Height");
            var latestWeight = GetLatestHealthDataByTypes(healthData, "Weight");
            var latestBodyTemp = GetLatestHealthDataByTypes(healthData, "BodyTemperature", "Body Temperature");

            // Get medical records
            var medicalRecords = await _medicalRecordRepository.GetByPatientIdAsync(patientId);
            var recordItems = medicalRecords
                .OrderByDescending(mr => mr.UploadedAt)
                .Select(mr => new MedicalRecordItemDto
                {
                    Id = mr.Id,
                    FileName = string.IsNullOrWhiteSpace(mr.FileName) ? mr.RecordType : mr.FileName,
                    RecordType = mr.RecordType,
                    UploadDate = mr.UploadedAt,
                    FilePath = mr.FilePath,
                        FileSize = mr.FileSize,
                        FileType = mr.FileType
                })
                .ToList();

            // Risk level
            var riskAssessments = await _riskAssessmentRepository.GetByPatientIdAsync(patientId);
            var latestRisk = SelectPreferredRiskAssessment(riskAssessments);
            var riskLevel = NormalizeRiskLevel(latestRisk);

            var latestHealthInfoEntity = await _patientHealthInfoRepository.GetLatestByPatientIdAsync(patientId);
            var latestHealthInfo = latestHealthInfoEntity == null
                ? null
                : new DoctorPatientHealthInformationDto
                {
                    Height = latestHealthInfoEntity.Height,
                    Weight = latestHealthInfoEntity.Weight,
                    BloodPressure = latestHealthInfoEntity.BloodPressure,
                    BloodSugar = latestHealthInfoEntity.BloodSugar,
                    BloodCount = latestHealthInfoEntity.BloodCount,
                    HeartRate = latestHealthInfoEntity.HeartRate,
                    LastUpdated = latestHealthInfoEntity.UpdatedAt ?? latestHealthInfoEntity.CreatedAt,
                    HasHealthData = true
                };

            var mergedHealthInfo = MergeHealthInformation(
                latestHealthInfo,
                latestHeight,
                latestWeight,
                latestBloodPressure,
                latestBloodSugar,
                latestCholesterol,
                latestBloodCount,
                latestHeartRate);

            return new DoctorPatientProfileDto
            {
                PatientId = patient.Id,
                PatientCode = patient.PatientId,
                PatientName = patient.User.FullName,
                Email = patient.User.Email,
                PhoneNumber = patient.User.PhoneNumber,
                ProfilePicture = patient.User.ProfilePicture,
                DateOfBirth = patient.DateOfBirth ?? patient.User.DateOfBirth,
                Age = age,
                Gender = patient.Gender?.ToString() ?? "Unknown",
                Location = patient.Location,
                About = patient.About,
                RiskLevel = riskLevel,
                RiskScore = latestRisk?.RiskScore,
                RiskAssessedAt = latestRisk?.AssessedAt,
                LastVisit = lastAppointment?.AppointmentDate,
                LastVisitRelative = lastVisitRelative,
                VisitType = visitType,
                ChatStatus = chatStatus,
                HealthInformation = mergedHealthInfo,
                HeartRate = latestHeartRate != null ? new VitalSignDto { Value = latestHeartRate.Value, Unit = "bpm", LastUpdated = latestHeartRate.RecordedAt } : null,
                BloodPressure = latestBloodPressure != null ? new VitalSignDto { Value = latestBloodPressure.Value, Unit = "mmHg", LastUpdated = latestBloodPressure.RecordedAt } : null,
                BloodSugar = latestBloodSugar != null ? new VitalSignDto { Value = latestBloodSugar.Value, Unit = "mg/dL", LastUpdated = latestBloodSugar.RecordedAt } : null,
                Cholesterol = latestCholesterol != null ? new VitalSignDto { Value = latestCholesterol.Value, Unit = "mg/dL", LastUpdated = latestCholesterol.RecordedAt } : null,
                BloodCount = latestBloodCount != null ? new VitalSignDto { Value = latestBloodCount.Value, Unit = "%", LastUpdated = latestBloodCount.RecordedAt } : null,
                BodyTemperature = latestBodyTemp != null ? new VitalSignDto { Value = latestBodyTemp.Value, Unit = "°C", LastUpdated = latestBodyTemp.RecordedAt } : null,
                MedicalRecords = recordItems,
                QRCodeData = patient.QRCodeData,
                QRCodeGeneratedAt = patient.QRCodeGeneratedAt,
                TotalFilesCount = recordItems.Count
            };
        }

        /// <summary>
        /// Add/Update patient's medical data (doctor only)
        /// </summary>
        public async Task AddPatientMedicalDataAsync(int doctorUserId, int patientId, AddPatientMedicalDataDto dto)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(doctorUserId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            // Verify doctor has appointment with this patient
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctor.Id);
            var hasAppointment = appointments.Any(a => a.PatientId == patientId);
            if (!hasAppointment)
            {
                throw new Exception("You don't have access to add data for this patient");
            }

            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Add health data entries
            var healthDataList = new List<Core.Models.HealthData>();

            if (dto.BodyTemperature.HasValue)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "BodyTemperature",
                    Value = dto.BodyTemperature.Value.ToString(),
                    RecordedAt = DateTime.UtcNow
                });
            }

            if (dto.Height.HasValue)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "Height",
                    Value = dto.Height.Value.ToString(),
                    RecordedAt = DateTime.UtcNow
                });
            }

            if (dto.Weight.HasValue)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "Weight",
                    Value = dto.Weight.Value.ToString(),
                    RecordedAt = DateTime.UtcNow
                });
            }

            if (dto.HeartRate != null)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "HeartRate",
                    Value = dto.HeartRate,
                    RecordedAt = DateTime.UtcNow
                });
            }

            if (dto.BloodPressure != null)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "BloodPressure",
                    Value = dto.BloodPressure,
                    RecordedAt = DateTime.UtcNow
                });
            }

            if (dto.BloodSugar.HasValue)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "BloodSugar",
                    Value = dto.BloodSugar.Value.ToString(),
                    RecordedAt = DateTime.UtcNow
                });
            }

            if (dto.Cholesterol.HasValue)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "Cholesterol",
                    Value = dto.Cholesterol.Value.ToString(),
                    RecordedAt = DateTime.UtcNow
                });
            }

            if (dto.BloodCount != null)
            {
                healthDataList.Add(new Core.Models.HealthData
                {
                    PatientId = patientId,
                    DataType = "BloodCount",
                    Value = dto.BloodCount,
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Save all health data
            foreach (var healthData in healthDataList)
            {
                await _healthDataRepository.AddAsync(healthData);
            }

            if (dto.Height.HasValue ||
                dto.Weight.HasValue ||
                dto.BloodSugar.HasValue ||
                !string.IsNullOrWhiteSpace(dto.BloodPressure) ||
                !string.IsNullOrWhiteSpace(dto.BloodCount) ||
                !string.IsNullOrWhiteSpace(dto.HeartRate))
            {
                await _patientHealthInfoRepository.AddAsync(new PatientHealthInfo
                {
                    PatientId = patientId,
                    Height = dto.Height,
                    Weight = dto.Weight,
                    BloodSugar = dto.BloodSugar,
                    BloodPressure = dto.BloodPressure,
                    BloodCount = dto.BloodCount,
                    HeartRate = dto.HeartRate,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }
        }
    }
}



