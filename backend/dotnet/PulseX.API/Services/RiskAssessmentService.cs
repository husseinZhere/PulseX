using AutoMapper;
using PulseX.Core.DTOs.RiskAssessment;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace PulseX.API.Services
{
    public class RiskAssessmentService
    {
        private readonly IRiskAssessmentRepository _riskAssessmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IHealthDataRepository _healthDataRepository;
        private readonly IPatientNotificationRepository _patientNotificationRepository;
        private readonly INotificationRepository _doctorNotificationRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<RiskAssessmentService> _logger;

        public RiskAssessmentService(
            IRiskAssessmentRepository riskAssessmentRepository,
            IPatientRepository patientRepository,
            IHealthDataRepository healthDataRepository,
            IPatientNotificationRepository patientNotificationRepository,
            INotificationRepository doctorNotificationRepository,
            IDoctorRepository doctorRepository,
            IMapper mapper,
            ILogger<RiskAssessmentService> logger)
        {
            _riskAssessmentRepository = riskAssessmentRepository;
            _patientRepository = patientRepository;
            _healthDataRepository = healthDataRepository;
            _patientNotificationRepository = patientNotificationRepository;
            _doctorNotificationRepository = doctorNotificationRepository;
            _doctorRepository = doctorRepository;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Process AI-generated heart risk assessment result
        /// This is the main endpoint for receiving external AI model results
        /// </summary>
        public async Task<HeartRiskAssessmentResultDto> ProcessAIResultAsync(int patientId, AIHeartRiskResponseDto aiResponse, CreateHeartRiskAssessmentDto originalInput)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Serialize recommendations and key factors to JSON
            var recommendationsJson = JsonSerializer.Serialize(aiResponse.Recommendations);
            var keyFactorsJson = JsonSerializer.Serialize(aiResponse.KeyFactors);

            // Create assessment entity with AI data
            var assessment = new RiskAssessment
            {
                PatientId = patientId,
                RiskScore = aiResponse.RiskScore,
                RiskLevel = aiResponse.RiskLevel,
                RiskCategory = aiResponse.RiskCategory,
                Summary = aiResponse.Summary,
                Recommendation = GetPrimaryRecommendation(aiResponse.Recommendations),
                RecommendationsJson = recommendationsJson,
                KeyFactorsJson = keyFactorsJson,
                AIModelVersion = aiResponse.ModelVersion,
                AIConfidenceScore = aiResponse.ConfidenceScore,
                AIRequestId = aiResponse.RequestId,
                AIProcessedAt = aiResponse.ProcessedAt ?? DateTime.UtcNow,
                IsAIGenerated = true,
                
                // Original input data
                CholesterolLevel = originalInput.CholesterolLevel,
                SleepHours = originalInput.SleepHours,
                AlcoholConsumption = originalInput.AlcoholConsumption,
                PhysicalActivity = originalInput.PhysicalActivity,
                PreviousHeartIssues = originalInput.PreviousHeartIssues,
                FamilyHistory = originalInput.FamilyHistory,
                AssessedAt = DateTime.UtcNow
            };

            await _riskAssessmentRepository.AddAsync(assessment);

            _logger.LogInformation($"AI Risk Assessment processed for Patient {patientId}: Score {aiResponse.RiskScore}%, Level: {aiResponse.RiskLevel}");

            // Create patient notification
            await CreatePatientNotificationAsync(patientId, assessment, aiResponse);

            // If High risk, notify doctors
            if (aiResponse.RiskLevel.Equals("High", StringComparison.OrdinalIgnoreCase))
            {
                await NotifyDoctorsForHighRiskAsync(patientId, assessment);
            }

            return MapToResultDto(assessment, patient, aiResponse.Recommendations);
        }

        /// <summary>
        /// Create heart risk assessment using internal calculation (fallback/testing)
        /// </summary>
        public async Task<HeartRiskAssessmentResultDto> CreateHeartRiskAssessmentAsync(int patientId, CreateHeartRiskAssessmentDto dto)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Calculate Risk Score (Internal calculation)
            var riskScore = CalculateRiskScore(dto);
            
            // Generate Insights and Recommendations
            var (summary, recommendation, keyFactors, recommendations) = GenerateInsights(riskScore, dto);
            
            // Determine Risk Level
            string riskLevel = riskScore < 30 ? "Low" : riskScore < 70 ? "Medium" : "High";
            string riskCategory = GetRiskCategory(riskScore);

            // Serialize recommendations
            var recommendationsJson = JsonSerializer.Serialize(recommendations);
            var keyFactorsJson = JsonSerializer.Serialize(keyFactors.Select(f => new AIKeyFactorDto 
            { 
                Factor = f, 
                Severity = GetFactorSeverity(riskScore),
                Description = f
            }));

            var assessment = new RiskAssessment
            {
                PatientId = patientId,
                RiskScore = riskScore,
                RiskLevel = riskLevel,
                RiskCategory = riskCategory,
                Summary = summary,
                Recommendation = recommendation,
                RecommendationsJson = recommendationsJson,
                KeyFactorsJson = keyFactorsJson,
                CholesterolLevel = dto.CholesterolLevel,
                SleepHours = dto.SleepHours,
                AlcoholConsumption = dto.AlcoholConsumption,
                PhysicalActivity = dto.PhysicalActivity,
                PreviousHeartIssues = dto.PreviousHeartIssues,
                FamilyHistory = dto.FamilyHistory,
                IsAIGenerated = false,
                AssessedAt = DateTime.UtcNow
            };

            await _riskAssessmentRepository.AddAsync(assessment);

            _logger.LogInformation($"Risk Assessment created for Patient {patientId}: Score {riskScore}%");

            // Create patient notification
            await CreatePatientNotificationForInternalAssessmentAsync(patientId, assessment, recommendations);

            // If High risk, notify doctors
            if (riskLevel == "High")
            {
                await NotifyDoctorsForHighRiskAsync(patientId, assessment);
            }

            return MapToResultDto(assessment, patient, recommendations);
        }

        public async Task<HeartRiskAssessmentResultDto?> GetLatestRiskAssessmentAsync(int patientId)
        {
            var assessments = await _riskAssessmentRepository.GetByPatientIdAsync(patientId);
            var latest = assessments.OrderByDescending(a => a.AssessedAt).FirstOrDefault();

            if (latest == null)
            {
                return null;
            }

            var patient = await _patientRepository.GetByIdAsync(patientId);
            var recommendations = DeserializeRecommendations(latest.RecommendationsJson);

            return MapToResultDto(latest, patient, recommendations);
        }

        public async Task<HeartRiskAssessmentDetailDto?> GetRiskAssessmentDetailAsync(int assessmentId)
        {
            var assessment = await _riskAssessmentRepository.GetByIdAsync(assessmentId);
            if (assessment == null)
            {
                return null;
            }

            var patient = await _patientRepository.GetByIdAsync(assessment.PatientId);
            var recommendations = DeserializeRecommendations(assessment.RecommendationsJson);
            var keyFactors = DeserializeKeyFactors(assessment.KeyFactorsJson);

            return new HeartRiskAssessmentDetailDto
            {
                Id = assessment.Id,
                PatientId = assessment.PatientId,
                PatientName = patient?.User?.FullName ?? "Unknown",
                RiskScore = assessment.RiskScore,
                RiskLevel = assessment.RiskLevel,
                RiskCategory = assessment.RiskCategory ?? GetRiskCategory(assessment.RiskScore),
                StatusColor = GetStatusColor(assessment.RiskLevel),
                StatusIcon = GetStatusIcon(assessment.RiskLevel),
                Summary = assessment.Summary ?? "",
                Recommendations = recommendations,
                KeyFactors = keyFactors,
                IsAIGenerated = assessment.IsAIGenerated,
                AIModelVersion = assessment.AIModelVersion,
                AIConfidenceScore = assessment.AIConfidenceScore,
                AssessedAt = assessment.AssessedAt,
                AIProcessedAt = assessment.AIProcessedAt,
                CholesterolLevel = assessment.CholesterolLevel,
                SleepHours = assessment.SleepHours,
                AlcoholConsumption = assessment.AlcoholConsumption,
                PhysicalActivity = assessment.PhysicalActivity,
                PreviousHeartIssues = assessment.PreviousHeartIssues,
                FamilyHistory = assessment.FamilyHistory
            };
        }

        public async Task<List<RiskAssessmentHistoryDto>> GetRiskHistoryAsync(int patientId)
        {
            var assessments = await _riskAssessmentRepository.GetByPatientIdAsync(patientId);

            return assessments.OrderByDescending(a => a.AssessedAt).Select(a => new RiskAssessmentHistoryDto
            {
                Id = a.Id,
                RiskScore = a.RiskScore,
                RiskLevel = a.RiskLevel,
                RiskCategory = a.RiskCategory ?? GetRiskCategory(a.RiskScore),
                Summary = a.Summary ?? "",
                StatusColor = GetStatusColor(a.RiskLevel),
                AssessedAt = a.AssessedAt,
                RecommendationCount = CountRecommendations(a.RecommendationsJson),
                IsAIGenerated = a.IsAIGenerated
            }).ToList();
        }

        public async Task<DashboardRiskSummaryDto?> GetDashboardSummaryAsync(int patientId)
        {
            var assessments = await _riskAssessmentRepository.GetByPatientIdAsync(patientId);
            var latest = assessments.OrderByDescending(a => a.AssessedAt).FirstOrDefault();

            if (latest == null)
            {
                return null;
            }

            var recommendations = DeserializeRecommendations(latest.RecommendationsJson);
            var topRecommendation = recommendations
                .OrderByDescending(r => r.Priority == "Urgent" ? 3 : r.Priority == "High" ? 2 : r.Priority == "Medium" ? 1 : 0)
                .FirstOrDefault();

            return new DashboardRiskSummaryDto
            {
                Id = latest.Id,
                RiskScore = latest.RiskScore,
                RiskLevel = latest.RiskLevel,
                RiskCategory = latest.RiskCategory ?? GetRiskCategory(latest.RiskScore),
                Summary = latest.Summary ?? "Assessment completed",
                TopRecommendation = topRecommendation,
                StatusColor = GetStatusColor(latest.RiskLevel),
                StatusIcon = GetStatusIcon(latest.RiskLevel),
                AssessedAt = latest.AssessedAt,
                TotalRecommendations = recommendations.Count,
                UrgentRecommendations = recommendations.Count(r => r.Priority == "Urgent" || r.Priority == "High")
            };
        }

        public async Task<List<HeartRiskAssessmentResultDto>> GetAllAssessmentsAsync(int patientId)
        {
            var assessments = await _riskAssessmentRepository.GetByPatientIdAsync(patientId);
            var patient = await _patientRepository.GetByIdAsync(patientId);

            return assessments.OrderByDescending(a => a.AssessedAt).Select(a => 
            {
                var recommendations = DeserializeRecommendations(a.RecommendationsJson);
                return MapToResultDto(a, patient, recommendations);
            }).ToList();
        }

        #region Private Helper Methods

        private async Task CreatePatientNotificationAsync(int patientId, RiskAssessment assessment, AIHeartRiskResponseDto aiResponse)
        {
            var (title, message, iconType, priority) = GetNotificationContent(aiResponse.RiskLevel, aiResponse.RiskScore);

            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "HeartRiskAssessment",
                Priority = priority,
                Title = title,
                Message = message,
                RelatedRiskAssessmentId = assessment.Id,
                RiskLevel = aiResponse.RiskLevel,
                ActionUrl = "/patient/heart-risk",
                IconType = iconType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _patientNotificationRepository.AddAsync(notification);
            _logger.LogInformation($"Patient notification created for assessment {assessment.Id}");
        }

        private async Task CreatePatientNotificationForInternalAssessmentAsync(int patientId, RiskAssessment assessment, List<AIRecommendationDto> recommendations)
        {
            var (title, message, iconType, priority) = GetNotificationContent(assessment.RiskLevel, assessment.RiskScore);

            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "HeartRiskAssessment",
                Priority = priority,
                Title = title,
                Message = message,
                RelatedRiskAssessmentId = assessment.Id,
                RiskLevel = assessment.RiskLevel,
                ActionUrl = "/patient/heart-risk",
                IconType = iconType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _patientNotificationRepository.AddAsync(notification);
        }

        private async Task NotifyDoctorsForHighRiskAsync(int patientId, RiskAssessment assessment)
        {
            // Get all approved doctors to notify about high-risk patient
            var doctors = await _doctorRepository.GetAllAsync();
            var approvedDoctors = doctors.Where(d => d.IsApproved).Take(5); // Notify up to 5 doctors

            foreach (var doctor in approvedDoctors)
            {
                var notification = new DoctorNotification
                {
                    DoctorId = doctor.Id,
                    Type = "AIRiskAlert",
                    Priority = "Urgent",
                    Title = "High Risk Patient Alert",
                    Message = $"Patient completed heart risk assessment with HIGH RISK score ({assessment.RiskScore}%). Immediate review recommended.",
                    RelatedPatientId = patientId,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _doctorNotificationRepository.AddAsync(notification);
            }

            _logger.LogWarning($"High risk alert sent to doctors for Patient {patientId}. Risk Score: {assessment.RiskScore}%");
        }

        private (string title, string message, string iconType, string priority) GetNotificationContent(string riskLevel, decimal riskScore)
        {
            return riskLevel.ToLower() switch
            {
                "low" => (
                    "Heart Assessment Complete - Low Risk",
                    $"Great news! Your heart risk score is {riskScore}%. Continue maintaining your healthy lifestyle.",
                    "success",
                    "Low"
                ),
                "medium" => (
                    "Heart Assessment Complete - Moderate Risk",
                    $"Your heart risk score is {riskScore}%. Review the recommendations to improve your heart health.",
                    "warning",
                    "Normal"
                ),
                "high" => (
                    "Heart Assessment Alert - High Risk",
                    $"Important: Your heart risk score is {riskScore}%. Please consult a cardiologist soon.",
                    "alert",
                    "Urgent"
                ),
                _ => (
                    "Heart Assessment Complete",
                    $"Your heart risk assessment is complete. Risk score: {riskScore}%",
                    "info",
                    "Normal"
                )
            };
        }

        private HeartRiskAssessmentResultDto MapToResultDto(RiskAssessment assessment, Patient? patient, List<AIRecommendationDto> recommendations)
        {
            var keyFactors = ExtractKeyFactors(assessment);

            return new HeartRiskAssessmentResultDto
            {
                Id = assessment.Id,
                PatientId = assessment.PatientId,
                PatientName = patient?.User?.FullName ?? "Unknown",
                RiskScore = assessment.RiskScore,
                RiskLevel = assessment.RiskLevel,
                RiskCategory = assessment.RiskCategory ?? GetRiskCategory(assessment.RiskScore),
                StatusColor = GetStatusColor(assessment.RiskLevel),
                StatusIcon = GetStatusIcon(assessment.RiskLevel),
                Summary = assessment.Summary ?? "",
                Recommendation = assessment.Recommendation ?? "",
                KeyFactors = keyFactors,
                Recommendations = recommendations,
                IsAIGenerated = assessment.IsAIGenerated,
                AIModelVersion = assessment.AIModelVersion,
                AIConfidenceScore = assessment.AIConfidenceScore,
                ModelAccuracy = assessment.AIConfidenceScore ?? 98.5m,
                AssessedAt = assessment.AssessedAt,
                CholesterolLevel = assessment.CholesterolLevel,
                SleepHours = assessment.SleepHours,
                AlcoholConsumption = assessment.AlcoholConsumption,
                PhysicalActivity = assessment.PhysicalActivity,
                PreviousHeartIssues = assessment.PreviousHeartIssues,
                FamilyHistory = assessment.FamilyHistory
            };
        }

        private string GetPrimaryRecommendation(List<AIRecommendationDto> recommendations)
        {
            var urgent = recommendations.FirstOrDefault(r => r.Priority == "Urgent");
            if (urgent != null) return urgent.Description;

            var high = recommendations.FirstOrDefault(r => r.Priority == "High");
            if (high != null) return high.Description;

            return recommendations.FirstOrDefault()?.Description ?? "Continue monitoring your health regularly.";
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

        private List<AIKeyFactorDto> DeserializeKeyFactors(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new List<AIKeyFactorDto>();
            
            try
            {
                return JsonSerializer.Deserialize<List<AIKeyFactorDto>>(json) ?? new List<AIKeyFactorDto>();
            }
            catch
            {
                return new List<AIKeyFactorDto>();
            }
        }

        private int CountRecommendations(string? json)
        {
            return DeserializeRecommendations(json).Count;
        }

        private string GetStatusColor(string riskLevel)
        {
            return riskLevel.ToLower() switch
            {
                "low" => "green",
                "medium" => "orange",
                "high" => "red",
                _ => "gray"
            };
        }

        private string GetStatusIcon(string riskLevel)
        {
            return riskLevel.ToLower() switch
            {
                "low" => "success",
                "medium" => "warning",
                "high" => "alert",
                _ => "info"
            };
        }

        private string GetFactorSeverity(decimal riskScore)
        {
            return riskScore switch
            {
                < 30 => "Low",
                < 50 => "Medium",
                < 70 => "High",
                _ => "Critical"
            };
        }

        // Internal Risk Calculation
        private decimal CalculateRiskScore(CreateHeartRiskAssessmentDto dto)
        {
            decimal score = 0;

            // Cholesterol Impact (0-20 points)
            score += dto.CholesterolLevel switch
            {
                "normal" => 0,
                "borderline" => 10,
                "high" => 20,
                _ => 5
            };

            // Sleep Impact (0-15 points)
            score += dto.SleepHours switch
            {
                "<6" => 15,
                "6-8" => 0,
                ">8" => 5,
                _ => 0
            };

            // Alcohol Impact (0-15 points)
            score += dto.AlcoholConsumption switch
            {
                "low" => 0,
                "medium" => 8,
                "high" => 15,
                _ => 0
            };

            // Physical Activity Impact (0-15 points)
            score += dto.PhysicalActivity switch
            {
                "low" => 15,
                "medium" => 7,
                "high" => 0,
                _ => 0
            };

            // Previous Heart Issues (0-20 points)
            if (dto.PreviousHeartIssues)
                score += 20;

            // Family History (0-15 points)
            if (dto.FamilyHistory)
                score += 15;

            return Math.Min(100, Math.Max(0, score));
        }

        private (string summary, string recommendation, List<string> keyFactors, List<AIRecommendationDto> recommendations) GenerateInsights(decimal riskScore, CreateHeartRiskAssessmentDto dto)
        {
            string summary;
            string recommendation;
            var keyFactors = new List<string>();
            var recommendations = new List<AIRecommendationDto>();
            int recId = 1;

            if (riskScore < 30)
            {
                summary = "Excellent heart health condition. Your cardiovascular system shows strong indicators and minimal risk factors.";
                recommendation = "Continue maintaining your healthy lifestyle. Regular check-ups every 6 months are recommended.";
                
                recommendations.Add(new AIRecommendationDto
                {
                    Id = recId++,
                    Type = "Lifestyle",
                    Priority = "Low",
                    Title = "Maintain Current Lifestyle",
                    Description = "Continue your healthy habits including regular exercise and balanced diet.",
                    ActionRequired = false,
                    Timeframe = "Ongoing",
                    Icon = "heart"
                });
                
                recommendations.Add(new AIRecommendationDto
                {
                    Id = recId++,
                    Type = "Monitoring",
                    Priority = "Low",
                    Title = "Regular Check-ups",
                    Description = "Schedule routine cardiovascular check-ups every 6 months.",
                    ActionRequired = false,
                    Timeframe = "Every 6 months",
                    Icon = "calendar"
                });
            }
            else if (riskScore < 50)
            {
                summary = "Generally stable condition with some areas that need attention. Early intervention can prevent complications.";
                recommendation = "Consider consulting with a cardiologist. Focus on improving diet and increasing physical activity.";
                
                if (dto.CholesterolLevel == "borderline")
                {
                    keyFactors.Add("Borderline cholesterol - dietary changes recommended");
                    recommendations.Add(new AIRecommendationDto
                    {
                        Id = recId++,
                        Type = "Diet",
                        Priority = "Medium",
                        Title = "Cholesterol Management",
                        Description = "Reduce saturated fats and increase fiber intake to manage cholesterol levels.",
                        ActionRequired = true,
                        Timeframe = "This week",
                        Icon = "nutrition"
                    });
                }
                if (dto.PhysicalActivity == "low")
                {
                    keyFactors.Add("Low physical activity - aim for 30 min exercise daily");
                    recommendations.Add(new AIRecommendationDto
                    {
                        Id = recId++,
                        Type = "Exercise",
                        Priority = "Medium",
                        Title = "Increase Physical Activity",
                        Description = "Start with 30 minutes of moderate exercise daily, such as brisk walking.",
                        ActionRequired = true,
                        Timeframe = "This week",
                        Icon = "fitness"
                    });
                }
                if (dto.SleepHours == "<6")
                {
                    keyFactors.Add("Insufficient sleep - target 7-8 hours per night");
                    recommendations.Add(new AIRecommendationDto
                    {
                        Id = recId++,
                        Type = "Sleep",
                        Priority = "Medium",
                        Title = "Improve Sleep Quality",
                        Description = "Aim for 7-8 hours of quality sleep per night for optimal heart health.",
                        ActionRequired = true,
                        Timeframe = "This week",
                        Icon = "sleep"
                    });
                }
            }
            else if (riskScore < 70)
            {
                summary = "Moderate risk detected. Multiple factors indicate potential cardiovascular concerns requiring medical attention.";
                recommendation = "Schedule an appointment with a cardiologist soon. Consider lifestyle modifications and possible medication.";
                
                recommendations.Add(new AIRecommendationDto
                {
                    Id = recId++,
                    Type = "Medical",
                    Priority = "High",
                    Title = "Consult a Cardiologist",
                    Description = "Schedule an appointment with a cardiologist for comprehensive evaluation.",
                    ActionRequired = true,
                    Timeframe = "Within 2 weeks",
                    Icon = "medical"
                });

                if (dto.CholesterolLevel == "high")
                {
                    keyFactors.Add("High cholesterol - immediate medical review needed");
                    recommendations.Add(new AIRecommendationDto
                    {
                        Id = recId++,
                        Type = "Medical",
                        Priority = "High",
                        Title = "Cholesterol Treatment",
                        Description = "High cholesterol detected. Medical intervention may be necessary.",
                        ActionRequired = true,
                        Timeframe = "Within 1 week",
                        Icon = "warning"
                    });
                }
                if (dto.AlcoholConsumption == "high")
                {
                    keyFactors.Add("High alcohol consumption - reduction strongly advised");
                    recommendations.Add(new AIRecommendationDto
                    {
                        Id = recId++,
                        Type = "Lifestyle",
                        Priority = "High",
                        Title = "Reduce Alcohol Intake",
                        Description = "Significantly reduce alcohol consumption to lower cardiovascular risk.",
                        ActionRequired = true,
                        Timeframe = "Immediately",
                        Icon = "warning"
                    });
                }
                if (dto.PreviousHeartIssues)
                {
                    keyFactors.Add("Previous heart issues - continuous monitoring essential");
                }
                if (dto.FamilyHistory)
                {
                    keyFactors.Add("Family history present - genetic predisposition factor");
                }
            }
            else
            {
                summary = "High risk condition detected. Immediate medical evaluation is strongly recommended to prevent serious complications.";
                recommendation = "URGENT: Please consult a cardiologist within 48 hours. Avoid strenuous activities until medical clearance.";
                
                recommendations.Add(new AIRecommendationDto
                {
                    Id = recId++,
                    Type = "Medical",
                    Priority = "Urgent",
                    Title = "Immediate Medical Consultation",
                    Description = "URGENT: Schedule an appointment with a cardiologist within 48 hours.",
                    ActionRequired = true,
                    Timeframe = "Within 48 hours",
                    Icon = "emergency"
                });

                recommendations.Add(new AIRecommendationDto
                {
                    Id = recId++,
                    Type = "Lifestyle",
                    Priority = "Urgent",
                    Title = "Activity Restriction",
                    Description = "Avoid strenuous physical activities until cleared by a medical professional.",
                    ActionRequired = true,
                    Timeframe = "Immediately",
                    Icon = "warning"
                });

                keyFactors.Add("Multiple high-risk factors identified");
                if (dto.PreviousHeartIssues)
                {
                    keyFactors.Add("Previous heart complications - requires immediate attention");
                }
                if (dto.CholesterolLevel == "high")
                {
                    keyFactors.Add("Critical cholesterol levels detected");
                }
                if (dto.PhysicalActivity == "low" && dto.AlcoholConsumption == "high")
                {
                    keyFactors.Add("Lifestyle factors significantly elevating risk");
                }
            }

            if (keyFactors.Count == 0)
            {
                keyFactors.Add("Excellent lifestyle choices");
                keyFactors.Add("Strong cardiovascular indicators");
            }

            return (summary, recommendation, keyFactors, recommendations);
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

        private List<string> ExtractKeyFactors(RiskAssessment assessment)
        {
            // First try to deserialize from JSON
            if (!string.IsNullOrEmpty(assessment.KeyFactorsJson))
            {
                try
                {
                    var keyFactors = JsonSerializer.Deserialize<List<AIKeyFactorDto>>(assessment.KeyFactorsJson);
                    if (keyFactors != null && keyFactors.Count > 0)
                    {
                        return keyFactors.Select(k => k.Factor).ToList();
                    }
                }
                catch { }
            }

            // Fallback to extracting from assessment fields
            var factors = new List<string>();

            if (assessment.CholesterolLevel == "high")
                factors.Add("High cholesterol detected");
            if (assessment.PhysicalActivity == "low")
                factors.Add("Low physical activity");
            if (assessment.PreviousHeartIssues)
                factors.Add("Previous heart issues");
            if (assessment.FamilyHistory)
                factors.Add("Family history present");
            if (assessment.SleepHours == "<6")
                factors.Add("Insufficient sleep");
            if (assessment.AlcoholConsumption == "high")
                factors.Add("High alcohol consumption");

            if (factors.Count == 0)
                factors.Add("No major risk factors identified");

            return factors;
        }

        #endregion
    }
}
