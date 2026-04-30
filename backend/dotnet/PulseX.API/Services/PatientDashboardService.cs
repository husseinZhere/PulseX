using PulseX.Core.DTOs.Patient;
using PulseX.Core.DTOs.RiskAssessment;
using PulseX.Core.Interfaces;
using PulseX.Core.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace PulseX.API.Services
{
    public class PatientDashboardService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IHealthDataRepository _healthDataRepository;
        private readonly IRiskAssessmentRepository _riskAssessmentRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IPatientNotificationRepository _patientNotificationRepository;

        public PatientDashboardService(
            IUserRepository userRepository,
            IPatientRepository patientRepository,
            IHealthDataRepository healthDataRepository,
            IRiskAssessmentRepository riskAssessmentRepository,
            IAppointmentRepository appointmentRepository,
            IDoctorRepository doctorRepository,
            IPatientNotificationRepository patientNotificationRepository)
        {
            _userRepository = userRepository;
            _patientRepository = patientRepository;
            _healthDataRepository = healthDataRepository;
            _riskAssessmentRepository = riskAssessmentRepository;
            _appointmentRepository = appointmentRepository;
            _doctorRepository = doctorRepository;
            _patientNotificationRepository = patientNotificationRepository;
        }

        public async Task<PatientDashboardDto> GetPatientDashboardAsync(int userId)
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

            var dashboard = new PatientDashboardDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                ProfilePicture = null // Add if you have profile pictures for patients
            };

            // Get Latest Vitals
            dashboard.HeartRate = await GetLatestVitalAsync(patient.Id, "HeartRate", "BPM", 60, 100);
            dashboard.BloodPressure = await GetLatestVitalAsync(patient.Id, "BloodPressure", "mmHg", 90, 120, "systolic");
            dashboard.BloodSugar = await GetLatestVitalAsync(patient.Id, "BloodSugar", "mg/dL", 70, 140);
            dashboard.BloodCount = await GetLatestVitalAsync(patient.Id, "BloodCount", "%", 30, 45);

            // Get Latest Risk Assessment
            dashboard.LatestRiskAssessment = await GetLatestRiskAssessmentAsync(patient.Id);

            // Get Upcoming Appointments (Next 2)
            dashboard.UpcomingAppointments = await GetUpcomingAppointmentsAsync(patient.Id);

            // Get Top 3 Doctors
            dashboard.TopDoctors = await GetTopDoctorsAsync();

            // Get Weekly Health Data
            dashboard.WeeklyHealthData = await GetWeeklyHealthDataAsync(patient.Id);
            
            // Get unread notification count
            dashboard.UnreadNotificationCount = await _patientNotificationRepository.GetUnreadCountAsync(patient.Id);

            return dashboard;
        }

        private async Task<VitalCardDto?> GetLatestVitalAsync(
            int patientId, 
            string dataType, 
            string unit, 
            decimal normalMin, 
            decimal normalMax,
            string? subType = null)
        {
            var healthData = await _healthDataRepository.GetByPatientIdAsync(patientId);
            var latestVital = healthData
                .Where(h => h.DataType == dataType)
                .OrderByDescending(h => h.RecordedAt)
                .FirstOrDefault();

            if (latestVital == null)
            {
                return null;
            }

            var status = "Normal";
            var statusColor = "green";

            // Special handling for different data types
            if (dataType == "HeartRate")
            {
                status = DetermineHeartRateStatus(latestVital.Value, out statusColor);
            }
            else if (dataType == "BloodPressure")
            {
                status = DetermineBloodPressureStatus(latestVital.Value, out statusColor);
            }
            else if (dataType == "BloodSugar")
            {
                status = DetermineBloodSugarStatus(latestVital.Value, out statusColor);
            }
            else if (dataType == "BloodCount")
            {
                status = DetermineBloodCountStatus(latestVital.Value, out statusColor);
            }

            return new VitalCardDto
            {
                DataType = dataType,
                Value = latestVital.Value,
                Unit = unit,
                Status = status,
                StatusColor = statusColor,
                RecordedAt = latestVital.RecordedAt
            };
        }

        private string DetermineHeartRateStatus(string value, out string statusColor)
        {
            // Extract numeric value from formats like "Low", "Normal", "High", or direct numbers
            if (decimal.TryParse(value, out decimal numericValue))
            {
                if (numericValue < 60)
                {
                    statusColor = "blue";
                    return "Low";
                }
                else if (numericValue >= 60 && numericValue <= 100)
                {
                    statusColor = "green";
                    return "Normal";
                }
                else if (numericValue >= 101 && numericValue <= 120)
                {
                    statusColor = "yellow";
                    return "Slightly High";
                }
                else // > 120
                {
                    statusColor = "red";
                    return "High";
                }
            }
            else
            {
                // Value is already a category like "Low", "Normal", etc.
                statusColor = value switch
                {
                    "Low" => "blue",
                    "Normal" => "green",
                    "Slightly High" => "yellow",
                    "High" => "red",
                    _ => "gray"
                };
                return value;
            }
        }

        private string DetermineBloodPressureStatus(string value, out string statusColor)
        {
            // Format: "120/80" or category like "Normal", "High - Stage 1", etc.
            if (value.Contains('/'))
            {
                var parts = value.Split('/');
                if (parts.Length == 2 && decimal.TryParse(parts[0], out decimal systolic) && decimal.TryParse(parts[1], out decimal diastolic))
                {
                    if (systolic < 90 || diastolic < 60)
                    {
                        statusColor = "blue";
                        return "Low";
                    }
                    else if (systolic <= 120 && diastolic <= 80)
                    {
                        statusColor = "green";
                        return "Normal";
                    }
                    else if (systolic <= 139 && diastolic <= 89)
                    {
                        statusColor = "yellow";
                        return "Pre-Hypertension";
                    }
                    else if (systolic <= 159 && diastolic <= 99)
                    {
                        statusColor = "orange";
                        return "High - Stage 1";
                    }
                    else // >= 160/100
                    {
                        statusColor = "red";
                        return "High - Stage 2";
                    }
                }
            }
            
            // Value is already a category
            statusColor = value switch
            {
                "Low" => "blue",
                "Normal" => "green",
                "Pre-Hypertension" => "yellow",
                "High - Stage 1" => "orange",
                "High - Stage 2" => "red",
                _ => "gray"
            };
            return value;
        }

        private string DetermineBloodSugarStatus(string value, out string statusColor)
        {
            if (decimal.TryParse(value, out decimal numericValue))
            {
                if (numericValue < 70)
                {
                    statusColor = "blue";
                    return "Low";
                }
                else if (numericValue >= 70 && numericValue <= 140)
                {
                    statusColor = "green";
                    return "Normal";
                }
                else // > 140
                {
                    statusColor = "red";
                    return "High";
                }
            }
            
            statusColor = value switch
            {
                "Low" => "blue",
                "Normal" => "green",
                "High" => "red",
                _ => "gray"
            };
            return value;
        }

        private string DetermineBloodCountStatus(string value, out string statusColor)
        {
            // Remove % sign if present
            var cleanValue = value.Replace("%", "").Trim();
            
            if (decimal.TryParse(cleanValue, out decimal numericValue))
            {
                if (numericValue < 30)
                {
                    statusColor = "blue";
                    return "Low";
                }
                else if (numericValue >= 30 && numericValue <= 45)
                {
                    statusColor = "green";
                    return "Normal";
                }
                else // > 45
                {
                    statusColor = "red";
                    return "High";
                }
            }
            
            statusColor = value switch
            {
                "Low" => "blue",
                "Normal" => "green",
                "High" => "red",
                _ => "gray"
            };
            return value;
        }

        private static Core.Models.RiskAssessment? SelectPreferredRiskAssessment(IEnumerable<Core.Models.RiskAssessment> assessments)
        {
            var ordered = assessments
                .OrderByDescending(assessment => assessment.AssessedAt)
                .ToList();

            if (ordered.Count == 0)
            {
                return null;
            }

            var latestAi = ordered.FirstOrDefault(assessment => assessment.IsAIGenerated);
            return latestAi ?? ordered.First();
        }

        private async Task<RiskAssessmentSummaryDto?> GetLatestRiskAssessmentAsync(int patientId)
        {
            var assessments = await _riskAssessmentRepository.GetByPatientIdAsync(patientId);
            var latest = SelectPreferredRiskAssessment(assessments);

            if (latest == null)
            {
                return null;
            }

            string riskLevel;
            string statusColor;
            string statusIcon;
            
            if (latest.RiskScore < 30)
            {
                riskLevel = "Low Risk";
                statusColor = "green";
                statusIcon = "success";
            }
            else if (latest.RiskScore < 70)
            {
                riskLevel = "Medium Risk";
                statusColor = "orange";
                statusIcon = "warning";
            }
            else
            {
                riskLevel = "High Risk";
                statusColor = "red";
                statusIcon = "alert";
            }

            // Parse recommendations from JSON
            var recommendations = DeserializeRecommendations(latest.RecommendationsJson);
            var topRecommendation = recommendations
                .OrderByDescending(r => r.Priority == "Urgent" ? 3 : r.Priority == "High" ? 2 : r.Priority == "Medium" ? 1 : 0)
                .FirstOrDefault();

            return new RiskAssessmentSummaryDto
            {
                Id = latest.Id,
                RiskScore = latest.RiskScore,
                RiskLevel = riskLevel,
                RiskCategory = latest.RiskCategory ?? GetRiskCategory(latest.RiskScore),
                Summary = latest.Summary ?? "Stable Condition",
                Recommendation = latest.Recommendation ?? "Continue monitoring your health",
                Accuracy = latest.AIConfidenceScore ?? 98.5m,
                AssessedAt = latest.AssessedAt,
                StatusColor = statusColor,
                StatusIcon = statusIcon,
                TopRecommendation = topRecommendation,
                TotalRecommendations = recommendations.Count,
                UrgentRecommendations = recommendations.Count(r => r.Priority == "Urgent" || r.Priority == "High"),
                IsAIGenerated = latest.IsAIGenerated
            };
        }

        private List<AIRecommendationDto> DeserializeRecommendations(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new List<AIRecommendationDto>();
            
            try
            {
                return JsonSerializer.Deserialize<List<AIRecommendationDto>>(json) ?? new List<AIRecommendationDto>();
            }
            catch
            {
                return new List<AIRecommendationDto>();
            }
        }

        private string GetRiskCategory(decimal score)
        {
            return score switch
            {
                < 30 => "Stable",
                < 70 => "Monitor Closely",
                _ => "Immediate Action Required"
            };
        }

        private async Task<List<UpcomingAppointmentDto>> GetUpcomingAppointmentsAsync(int patientId)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                return new List<UpcomingAppointmentDto>();
            }

            var appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
            var upcoming = appointments
                .Where(a => a.AppointmentDate >= DateTime.UtcNow && 
                           (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed))
                .OrderBy(a => a.AppointmentDate)
                .Take(2)
                .Select(a => new UpcomingAppointmentDto
                {
                    Id = a.Id,
                    DoctorName = a.Doctor?.User?.FullName ?? "Unknown Doctor",
                    DoctorSpecialty = a.Doctor?.Specialization,
                    DoctorProfilePicture = a.Doctor?.ProfilePicture,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status.ToString(),
                    TimeSlot = a.AppointmentDate.ToString("hh:mm tt")
                })
                .ToList();

            return upcoming;
        }

        private async Task<List<TopDoctorDto>> GetTopDoctorsAsync()
        {
            var doctors = await _doctorRepository.GetAllAsync();
            var topDoctors = doctors
                .Where(d => d.IsApproved && d.User != null && d.User.IsActive)
                .OrderByDescending(d => d.AverageRating)
                .ThenByDescending(d => d.Ratings != null ? d.Ratings.Count : 0)
                .Take(3)
                .Select(d => new TopDoctorDto
                {
                    Id = d.Id,
                    FullName = d.User!.FullName,
                    Specialty = d.Specialization,
                    ClinicLocation = d.ClinicLocation,
                    AverageRating = d.AverageRating,
                    TotalRatings = d.Ratings != null ? d.Ratings.Count : 0,
                    ConsultationPrice = d.ConsultationPrice,
                    ProfilePicture = d.ProfilePicture
                })
                .ToList();

            return topDoctors;
        }

        private async Task<WeeklyHealthDataDto> GetWeeklyHealthDataAsync(int patientId)
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            var healthData = await _healthDataRepository.GetByPatientIdAsync(patientId);

            var weeklyData = healthData
                .Where(h => h.RecordedAt >= sevenDaysAgo)
                .OrderBy(h => h.RecordedAt)
                .ToList();

            var heartRateData = weeklyData
                .Where(h => h.DataType == "HeartRate")
                .GroupBy(h => h.RecordedAt.Date)
                .Select(g => new DailyHealthPointDto
                {
                    Date = g.Key,
                    Value = g.Average(h => decimal.TryParse(h.Value, out var v) ? v : 0).ToString("F0"),
                    Label = g.Key.ToString("ddd")
                })
                .ToList();

            var bloodPressureData = weeklyData
                .Where(h => h.DataType == "BloodPressure")
                .GroupBy(h => h.RecordedAt.Date)
                .Select(g => new DailyHealthPointDto
                {
                    Date = g.Key,
                    Value = g.First().Value, // Take first reading of the day
                    Label = g.Key.ToString("ddd")
                })
                .ToList();

            return new WeeklyHealthDataDto
            {
                HeartRateData = heartRateData,
                BloodPressureData = bloodPressureData
            };
        }
    }
}
