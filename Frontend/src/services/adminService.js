import api from '../utils/api';

export const getAdminDashboard = () =>
  api.get('/api/Admin/dashboard').then((r) => r.data);

export const getAllUsers = () =>
  api.get('/api/Admin/users').then((r) => r.data);

export const getAllActivityLogs = () =>
  api.get('/api/Admin/activity-logs').then((r) => r.data);

export const getUserActivityLogs = (userId) =>
  api.get(`/api/Admin/activity-logs/${userId}`).then((r) => r.data);

export const createDoctor = (payload, profilePicture) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, value instanceof Date ? value.toISOString() : value);
    }
  });
  if (profilePicture) form.append('profilePicture', profilePicture);
  return api
    .post('/api/Admin/doctors/create', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const createPatient = (payload, profilePicture) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, value instanceof Date ? value.toISOString() : value);
    }
  });
  if (profilePicture) form.append('profilePicture', profilePicture);
  return api
    .post('/api/Admin/patients/create', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const updateDoctor = (doctorUserId, payload, profilePicture) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, value instanceof Date ? value.toISOString() : value);
    }
  });
  if (profilePicture) form.append('profilePicture', profilePicture);
  return api
    .put(`/api/Admin/doctors/${doctorUserId}/update`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const updatePatient = (patientUserId, payload, profilePicture) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, value instanceof Date ? value.toISOString() : value);
    }
  });
  if (profilePicture) form.append('profilePicture', profilePicture);
  return api
    .put(`/api/Admin/patients/${patientUserId}/update`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const deleteDoctor = (doctorUserId) =>
  api.delete(`/api/Admin/doctors/${doctorUserId}`).then((r) => r.data);

export const deletePatient = (patientUserId) =>
  api.delete(`/api/Admin/patients/${patientUserId}`).then((r) => r.data);

export const deleteStoryByAdmin = (storyId, reason) =>
  api
    .delete(`/api/Admin/moderation/stories/${storyId}`, { data: { reason } })
    .then((r) => r.data);

export const deleteCommentByAdmin = (commentId, reason) =>
  api
    .delete(`/api/Admin/moderation/comments/${commentId}`, { data: { reason } })
    .then((r) => r.data);
