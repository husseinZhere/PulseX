import api from '../utils/api';

export const forgotPassword = (email) =>
  api.post('/api/Auth/forgot-password', { email }).then((r) => r.data);

export const verifyOtp = (email, otp) =>
  api.post('/api/Auth/verify-otp', { email, otp }).then((r) => r.data);

export const resetPassword = (resetToken, newPassword, confirmPassword) =>
  api
    .post('/api/Auth/reset-password', { resetToken, newPassword, confirmPassword })
    .then((r) => r.data);

export const createAdmin = (payload) =>
  api.post('/api/Auth/create/admin', payload).then((r) => r.data);
