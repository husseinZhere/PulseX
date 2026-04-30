import api from '../utils/api';

export const getMySchedule = () =>
  api.get('/api/DoctorSchedule/my-schedule').then((r) => r.data);

export const saveWeeklySchedule = (payload) =>
  api.post('/api/DoctorSchedule/weekly', payload).then((r) => r.data);

export const addSingleSlot = (payload) =>
  api.post('/api/DoctorSchedule/single', payload).then((r) => r.data);

export const deleteSlot = (slotId) =>
  api.delete(`/api/DoctorSchedule/${slotId}`).then((r) => r.data);

export const getPublicAvailableSlots = (doctorId, date) =>
  api
    .get(`/api/DoctorSchedule/available/${doctorId}`, { params: { date } })
    .then((r) => r.data);
