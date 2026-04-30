import api from '../utils/api';

export const getPatientDashboard = () =>
  api.get('/api/PatientDashboard').then((r) => r.data);

export const getPatientDashboardLegacy = () =>
  api.get('/api/User/dashboard').then((r) => r.data);

export const getUserProfile = () =>
  api.get('/api/User/profile').then((r) => r.data);

export const updateUserProfile = (payload) =>
  api.put('/api/User/profile', payload).then((r) => r.data);

export const updateAccountSettings = (payload) =>
  api.put('/api/User/settings', payload).then((r) => r.data);

export const changePassword = (payload) =>
  api.post('/api/User/change-password', payload).then((r) => r.data);

export const uploadUserProfilePicture = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api
    .post('/api/User/profile/upload-picture', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const updateHealthData = (payload) =>
  api.put('/api/User/health-data', payload).then((r) => r.data);

export const getHealthDataOptions = () =>
  api.get('/api/User/health-data/options').then((r) => r.data);
