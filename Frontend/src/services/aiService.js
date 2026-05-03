import { aiApi } from '../utils/api';

/**
 * Analyse a chest X-ray image for cardiac findings.
 * Returns: { success, result: { imageType, prediction, confidence, riskLevel,
 *             recommendation, modelVersion, limitations, positive_findings,
 *             finding_probabilities, mode } }
 */
export const analyzeXRay = (file) => {
  const form = new FormData();
  form.append('file', file);
  return aiApi
    .post('/api/xray/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/**
 * Analyse a CT image.
 * NOTE: CT analysis is not currently implemented. The service returns an honest
 * "not available" response with a recommendation to consult a radiologist.
 * Returns: { success: false, result: { imageType: 'ct', prediction, riskLevel,
 *             recommendation, limitations } }
 */
export const analyzeCt = (file) => {
  const form = new FormData();
  form.append('file', file);
  return aiApi
    .post('/api/ct/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const uploadEcgToAi = (file, patientId = 'unknown') => {
  const form = new FormData();
  form.append('file', file);
  form.append('patient_id', String(patientId));
  return aiApi
    .post('/api/ecg/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const aiHealthCheck = () => aiApi.get('/health').then((r) => r.data);

export const aiServiceInfo = () => aiApi.get('/').then((r) => r.data);
