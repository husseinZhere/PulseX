import api from '../utils/api';

export const getFormDataForPatient = (patientId) =>
  api.get(`/api/Prescriptions/form-data/patient/${patientId}`).then((r) => r.data);

export const searchPatients = (searchTerm) =>
  api
    .get('/api/Prescriptions/search-patients', { params: { searchTerm } })
    .then((r) => r.data);

export const createPrescription = (payload) =>
  api.post('/api/Prescriptions/create', payload).then((r) => r.data);

export const getMyPrescriptions = (params = {}) =>
  api.get('/api/Prescriptions/my-prescriptions', { params }).then((r) => r.data);

export const getMyPrescriptionStats = () =>
  api.get('/api/Prescriptions/my-prescriptions/stats').then((r) => r.data);

export const getPrescriptionById = (prescriptionId) =>
  api.get(`/api/Prescriptions/${prescriptionId}`).then((r) => r.data);

export const getPrescriptionDetails = (prescriptionId) =>
  api.get(`/api/Prescriptions/${prescriptionId}/details`).then((r) => r.data);

export const markPrescriptionAsRead = (prescriptionId) =>
  api.put(`/api/Prescriptions/${prescriptionId}/mark-read`).then((r) => r.data);
