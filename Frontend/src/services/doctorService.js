import api from '../utils/api';

export const listDoctors = (params = {}) =>
  api.get('/api/DoctorBooking/doctors', { params }).then((r) => r.data);

export const getDoctorProfilePublic = (doctorId) =>
  api.get(`/api/Doctor/${doctorId}`).then((r) => r.data);

export const getDoctorProfileForPatient = (doctorId) =>
  api.get(`/api/DoctorBooking/doctors/${doctorId}/profile`).then((r) => r.data);

export const getAvailableSlots = (doctorId, date) =>
  api
    .get(`/api/DoctorBooking/doctors/${doctorId}/slots`, { params: { date } })
    .then((r) => r.data);

export const canChatWithDoctor = (doctorId) =>
  api.get(`/api/DoctorBooking/doctors/${doctorId}/can-chat`).then((r) => r.data);

export const getDoctorRatings = (doctorId) =>
  api.get(`/api/Doctor/${doctorId}/ratings`).then((r) => r.data);

export const submitDoctorRating = (payload) =>
  api.post('/api/Doctor/rate', payload).then((r) => r.data);

export const getDoctorDashboard = () =>
  api.get('/api/Doctor/dashboard').then((r) => r.data);

export const getDoctorSelfProfile = () =>
  api.get('/api/Doctor/profile').then((r) => r.data);

export const updateDoctorSelfProfile = (payload) =>
  api.put('/api/Doctor/profile', payload).then((r) => r.data);

export const uploadDoctorProfilePicture = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api
    .post('/api/Doctor/profile/upload-picture', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const getDoctorPatients = () =>
  api.get('/api/Doctor/patients').then((r) => r.data);

export const getDoctorPatientProfile = (patientId) =>
  api.get(`/api/Doctor/patients/${patientId}`).then((r) => r.data);

export const addPatientMedicalData = (patientId, payload) =>
  api.post(`/api/Doctor/patients/${patientId}/medical-data`, payload).then((r) => r.data);

export const getPendingRatings = () =>
  api.get('/api/Doctor/pending-ratings').then((r) => r.data);
