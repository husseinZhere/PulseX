import api from '../utils/api';

export const checkVideoCallAvailability = (appointmentId) =>
  api.get(`/api/VideoCall/availability/${appointmentId}`).then((r) => r.data);

export const getUpcomingVideoCalls = () =>
  api.get('/api/VideoCall/upcoming').then((r) => r.data);

export const joinVideoCall = (appointmentId) =>
  api.post(`/api/VideoCall/join/${appointmentId}`).then((r) => r.data);

export const getVideoSession = (sessionId) =>
  api.get(`/api/VideoCall/session/${sessionId}`).then((r) => r.data);

export const getVideoSessionParticipants = (sessionId) =>
  api.get(`/api/VideoCall/session/${sessionId}/participants`).then((r) => r.data);

export const endVideoCall = (sessionId, reason) =>
  api.post(`/api/VideoCall/session/${sessionId}/end`, { reason }).then((r) => r.data);

export const updateMediaState = (sessionId, payload) =>
  api.put(`/api/VideoCall/session/${sessionId}/media`, payload).then((r) => r.data);

export const updateConnectionQuality = (sessionId, payload) =>
  api.put(`/api/VideoCall/session/${sessionId}/quality`, payload).then((r) => r.data);

export const getDoctorCallSummary = (appointmentId) =>
  api.get(`/api/VideoCall/summary/doctor/${appointmentId}`).then((r) => r.data);

export const getPatientCallSummary = (appointmentId) =>
  api.get(`/api/VideoCall/summary/patient/${appointmentId}`).then((r) => r.data);
