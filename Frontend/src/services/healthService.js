import api from '../utils/api';

export const addHealthData = (payload) =>
  api.post('/api/HealthData/add', payload).then((r) => r.data);

export const getMyHealthData = () =>
  api.get('/api/HealthData/my-health-data').then((r) => r.data);

export const doctorAddVitalSigns = (patientId, payload) =>
  api.post(`/api/HealthData/doctor/add-vital-signs/${patientId}`, payload).then((r) => r.data);

export const doctorGetPatientVitalSigns = (patientId) =>
  api.get(`/api/HealthData/doctor/patient-vital-signs/${patientId}`).then((r) => r.data);

export const analyzeHealthSurvey = (payload) =>
  api.post('/api/HealthSurvey/analyze', payload).then((r) => r.data);
