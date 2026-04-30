import api, { aiApi } from '../utils/api';

export const chatViaBackend = (message) =>
  api.post('/api/Chatbot/chat', { message }).then((r) => r.data);

export const chatWithDoctorViaBackend = (doctorId, message) =>
  api.post(`/api/Chatbot/chat/${doctorId}`, { message }).then((r) => r.data);

export const chatViaAiDirect = (message, userData = {}, sessionId = null) =>
  aiApi
    .post('/api/chat', {
      message,
      user_data: userData,
      session_id: sessionId,
    })
    .then((r) => r.data);
