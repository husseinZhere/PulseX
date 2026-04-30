import api from '../utils/api';

export const getDoctorNotifications = () =>
  api.get('/api/Notifications').then((r) => r.data);

export const getDoctorUnreadNotifications = () =>
  api.get('/api/Notifications/unread').then((r) => r.data);

export const markDoctorNotificationRead = (notificationId) =>
  api.put(`/api/Notifications/${notificationId}/mark-read`).then((r) => r.data);

export const markAllDoctorNotificationsRead = () =>
  api.put('/api/Notifications/mark-all-read').then((r) => r.data);

export const deleteDoctorNotification = (notificationId) =>
  api.delete(`/api/Notifications/${notificationId}`).then((r) => r.data);

export const getPatientNotifications = () =>
  api.get('/api/patient/notifications').then((r) => r.data);

export const getPatientUnreadNotifications = () =>
  api.get('/api/patient/notifications/unread').then((r) => r.data);

export const markPatientNotificationRead = (notificationId) =>
  api.put(`/api/patient/notifications/${notificationId}/read`).then((r) => r.data);

export const markAllPatientNotificationsRead = () =>
  api.put('/api/patient/notifications/read-all').then((r) => r.data);

export const deletePatientNotification = (notificationId) =>
  api.delete(`/api/patient/notifications/${notificationId}`).then((r) => r.data);
