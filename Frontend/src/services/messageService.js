import api from '../utils/api';

export const sendMessage = ({ receiverId, appointmentId, content }, attachment) => {
  const form = new FormData();
  if (receiverId != null) form.append('ReceiverId', String(receiverId));
  if (appointmentId != null) form.append('AppointmentId', String(appointmentId));
  if (content != null) form.append('Content', content);
  if (attachment) form.append('attachment', attachment);
  return api
    .post('/api/Message/send', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const getAppointmentMessages = (appointmentId) =>
  api.get(`/api/Message/appointment/${appointmentId}`).then((r) => r.data);

export const getUnreadInbox = () =>
  api.get('/api/Message/inbox/unread').then((r) => r.data);
