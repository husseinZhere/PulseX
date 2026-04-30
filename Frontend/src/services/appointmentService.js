import api from '../utils/api';

export const bookAppointment = (payload) =>
  api.post('/api/DoctorBooking/appointments', payload).then((r) => r.data);

export const bookAppointmentLegacy = (payload) =>
  api.post('/api/Appointment/book', payload).then((r) => r.data);

export const getMyAppointments = () =>
  api.get('/api/Appointment/my-appointments').then((r) => r.data);

export const updateAppointmentStatus = (appointmentId, statusDto) =>
  api
    .put(`/api/Appointment/update-status/${appointmentId}`, statusDto)
    .then((r) => r.data);

export const activateChat = (appointmentId, expiryDays = 7) =>
  api
    .post(`/api/DoctorBooking/appointments/${appointmentId}/activate-chat`, null, {
      params: { expiryDays },
    })
    .then((r) => r.data);

export const isVideoCallAvailable = (appointmentId) =>
  api
    .get(`/api/DoctorBooking/appointments/${appointmentId}/video-available`)
    .then((r) => r.data);
