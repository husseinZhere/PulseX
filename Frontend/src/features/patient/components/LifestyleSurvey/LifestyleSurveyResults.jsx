import PatientAIAlert from '../HeartRisk/PatientAIAlert';
import PatientNextStep from '../PatientNextStep/PatientNextStep';

const normalizeSurveyResult = (result) => {
  if (!result || typeof result !== 'object') return null;

  const riskLevel = String(result.riskLevel || result.risk_level || '').trim() || 'Low';
  const riskMessage =
    String(result.riskMessage || result.risk_message || '').trim()
    || 'AI analysis completed for your latest survey responses.';
  const recommendationMessage =
    String(result.recommendationMessage || result.recommendation_message || '').trim()
    || 'Follow your care plan and monitor your health indicators regularly.';
  const requiresFullAssessment = Boolean(
    result.requiresFullAssessment ?? result.requires_full_assessment
  );
  const riskFactors = Array.isArray(result.riskFactors)
    ? result.riskFactors.filter(Boolean)
    : [];

  return {
    riskLevel,
    riskMessage,
    recommendationMessage,
    requiresFullAssessment,
    riskFactors,
  };
};

const LifestyleSurveyResults = ({ result }) => {
  const surveyResult = normalizeSurveyResult(result);
  if (!surveyResult) return null;

  return (
    <section className="mt-16 flex flex-col items-center justify-center w-full space-y-12" aria-label="Results">
      <aside className="w-full p-5 flex justify-center">
        <PatientAIAlert
          riskLevel={surveyResult.riskLevel}
          riskMessage={surveyResult.riskMessage}
          recommendationMessage={surveyResult.recommendationMessage}
          riskFactors={surveyResult.riskFactors}
        />
      </aside>

      <aside className="w-full p-5 flex justify-center">
        <PatientNextStep
          requiresFullAssessment={surveyResult.requiresFullAssessment}
          riskLevel={surveyResult.riskLevel}
        />
      </aside>
    </section>
  );
};

export default LifestyleSurveyResults;
