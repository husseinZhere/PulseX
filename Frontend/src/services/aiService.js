import { aiApi } from '../utils/api';

export const analyzeXRay = (file) => {
  const form = new FormData();
  form.append('file', file);
  return aiApi
    .post('/api/xray/analyze', form, {
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
