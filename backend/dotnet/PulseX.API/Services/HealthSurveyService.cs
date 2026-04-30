using PulseX.Core.DTOs.HealthSurvey;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class HealthSurveyService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IRiskAssessmentRepository _riskAssessmentRepository;
        private readonly ILogger<HealthSurveyService> _logger;

        public HealthSurveyService(
            IPatientRepository patientRepository,
            IRiskAssessmentRepository riskAssessmentRepository,
            ILogger<HealthSurveyService> logger)
        {
            _patientRepository = patientRepository;
            _riskAssessmentRepository = riskAssessmentRepository;
            _logger = logger;
        }

        /// <summary>
        /// Analyze Health Survey and return risk assessment
        /// </summary>
        public async Task<HealthSurveyResultDto> AnalyzeSurveyAsync(int userId, SubmitHealthSurveyDto dto)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Calculate risk score (0-100)
            int riskScore = 0;
            var riskFactors = new List<string>();

            // 1. Cholesterol (+30 if High, +15 if Borderline)
            if (dto.CholesterolLevel == "High")
            {
                riskScore += 30;
                riskFactors.Add("High cholesterol level (?240 mg/dL)");
            }
            else if (dto.CholesterolLevel == "Borderline")
            {
                riskScore += 15;
                riskFactors.Add("Borderline cholesterol (200-239 mg/dL)");
            }

            // 2. Sleep (+15 if < 6 hours)
            if (dto.SleepHours == "< 6")
            {
                riskScore += 15;
                riskFactors.Add("Insufficient sleep (< 6 hours)");
            }

            // 3. Smoking (+20)
            if (dto.IsSmoker)
            {
                riskScore += 20;
                riskFactors.Add("Current smoker");
            }

            // 4. Alcohol (+10 if High)
            if (dto.AlcoholConsumption == "High")
            {
                riskScore += 10;
                riskFactors.Add("High alcohol consumption");
            }

            // 5. Physical Activity (+15 if Low)
            if (dto.PhysicalActivity == "Low")
            {
                riskScore += 15;
                riskFactors.Add("Low physical activity");
            }

            // 6. Previous Heart Issues (+20)
            if (dto.HasPreviousHeartIssues)
            {
                riskScore += 20;
                riskFactors.Add("Previous heart-related issues");
            }

            // 7. Family History (+10)
            if (dto.HasFamilyHistory)
            {
                riskScore += 10;
                riskFactors.Add("Family history of heart disease");
            }

            // Determine risk level
            string riskLevel;
            string riskMessage;
            bool requiresFullAssessment;

            if (riskScore >= 50)
            {
                riskLevel = "High";
                riskMessage = "Our AI detected a high probability of heart-related issues based on your responses.";
                requiresFullAssessment = true;
            }
            else if (riskScore >= 25)
            {
                riskLevel = "Medium";
                riskMessage = "Some risk factors detected. Consider a full assessment for deeper insights.";
                requiresFullAssessment = true;
            }
            else
            {
                riskLevel = "Low";
                riskMessage = "Your lifestyle choices indicate a lower risk. Keep maintaining healthy habits!";
                requiresFullAssessment = false;
            }

            var recommendationMessage = requiresFullAssessment
                ? "Higher accuracy required. Complete full heart risk assessment for deeper medical insights."
                : "Continue maintaining a healthy lifestyle and monitor your heart health regularly.";

            var riskAssessment = new RiskAssessment
            {
                PatientId = patient.Id,
                RiskScore = riskScore,
                RiskLevel = riskLevel,
                Summary = riskMessage,
                Recommendation = recommendationMessage,
                AssessedAt = DateTime.UtcNow,
                CholesterolLevel = dto.CholesterolLevel,
                SleepHours = dto.SleepHours,
                AlcoholConsumption = dto.AlcoholConsumption,
                PhysicalActivity = dto.PhysicalActivity,
                PreviousHeartIssues = dto.HasPreviousHeartIssues,
                FamilyHistory = dto.HasFamilyHistory,
                RiskCategory = riskLevel switch
                {
                    "High" => "Immediate Action Required",
                    "Medium" => "Monitor Closely",
                    _ => "Stable"
                },
                IsAIGenerated = false
            };

            await _riskAssessmentRepository.AddAsync(riskAssessment);

            _logger.LogInformation($"Health Survey analyzed for Patient {patient.Id}: Risk={riskLevel}, Score={riskScore}");

            return new HealthSurveyResultDto
            {
                Id = riskAssessment.Id,
                RiskLevel = riskLevel,
                RiskMessage = riskMessage,
                RequiresFullAssessment = requiresFullAssessment,
                RecommendationMessage = requiresFullAssessment
                    ? "*Higher accuracy required. Complete your full profile in the Heart Risk Assessment section for deeper medical insights."
                    : recommendationMessage,
                RiskFactors = riskFactors,
                CreatedAt = riskAssessment.AssessedAt
            };
        }
    }
}
