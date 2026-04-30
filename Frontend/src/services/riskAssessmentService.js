import api, { aiApi } from '../utils/api';

export const calculateRiskLocal = (payload) =>
  api.post('/api/RiskAssessment/calculate', payload).then((r) => r.data);

export const processAiResult = (payload) =>
  api.post('/api/RiskAssessment/process-ai-result', payload).then((r) => r.data);

const toPlainRiskLevel = (level) => {
  const normalized = String(level || '').trim().toLowerCase();
  if (normalized.includes('high')) return 'High';
  if (normalized.includes('medium') || normalized.includes('moderate')) return 'Medium';
  return 'Low';
};

const toRiskCategory = (level) => {
  const plainLevel = toPlainRiskLevel(level);
  if (plainLevel === 'High') return 'Immediate Action Required';
  if (plainLevel === 'Medium') return 'Monitor Closely';
  return 'Stable';
};

const toRecommendations = (items = []) => {
  const list = Array.isArray(items) ? items : [items].filter(Boolean);
  return list.filter(Boolean).map((item, index) => {
    if (item && typeof item === 'object') {
      return {
        id: Number(item.id) || index + 1,
        type: item.type || 'Lifestyle',
        priority: item.priority || (index === 0 ? 'High' : 'Medium'),
        title: item.title || `Recommendation ${index + 1}`,
        description: item.description || String(item),
        action_required: item.action_required ?? true,
        timeframe: item.timeframe || 'This month',
        icon: item.icon || 'heart',
      };
    }

    return {
      id: index + 1,
      type: 'Lifestyle',
      priority: index === 0 ? 'High' : 'Medium',
      title: `Recommendation ${index + 1}`,
      description: String(item),
      action_required: true,
      timeframe: 'This month',
      icon: 'heart',
    };
  });
};

export const saveAiRiskSnapshot = ({ score, level, summary, recommendations = [] }) => {
  const plainLevel = toPlainRiskLevel(level);
  const riskScore = Number(score);

  return processAiResult({
    ai_response: {
      risk_score: Number.isFinite(riskScore) ? riskScore : 0,
      risk_level: plainLevel,
      risk_category: toRiskCategory(plainLevel),
      summary: summary || 'AI risk assessment completed.',
      recommendations: toRecommendations(recommendations),
      key_factors: [],
      model_version: 'pulsex-xray-ui-v1',
      confidence_score: Number.isFinite(riskScore) ? riskScore : null,
      request_id: `xray-${Date.now()}`,
      processed_at: new Date().toISOString(),
    },
    original_input: {
      cholesterol_level: 'Unknown',
      sleep_hours: 'Unknown',
      alcohol_consumption: 'Unknown',
      physical_activity: 'Unknown',
      previous_heart_issues: false,
      family_history: false,
    },
  });
};

export const getMyRiskAssessments = () =>
  api.get('/api/RiskAssessment/my-assessments').then((r) => r.data);

export const getRecommendationFromAi = (payload) =>
  aiApi.post('/api/recommendation', payload).then((r) => r.data);

export const getAiModelInfo = () =>
  aiApi.get('/api/recommendation/model-info').then((r) => r.data);
