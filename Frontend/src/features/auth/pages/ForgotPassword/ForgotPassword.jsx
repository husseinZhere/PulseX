import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import ForgotPassWrapper from '../../components/ForgotPassWrapper/ForgotPassWrapper';
import {
  emailStageSchema,
  otpStageSchema,
  resetPasswordStageSchema
} from '../../../../schemas/forgotPasswordSchema';
import { MdCheckCircle } from "react-icons/md";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../../../../services/authService';

const ForgotPassword = () => {
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const emailFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: emailStageSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        await forgotPassword(values.email.trim());
        setEmail(values.email.trim());
        setStage(2);
      } catch (err) {
        setServerError(
          err?.response?.data?.message || err?.message || 'Failed to send OTP'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: otpStageSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const res = await verifyOtp(email, values.otp);
        if (res?.isValid && res?.resetToken) {
          setResetToken(res.resetToken);
          setStage(3);
        } else {
          setServerError(res?.message || 'Invalid OTP');
        }
      } catch (err) {
        setServerError(
          err?.response?.data?.message || err?.message || 'Invalid OTP'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const resetFormik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: resetPasswordStageSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        await resetPassword(resetToken, values.password, values.confirmPassword);
        setStage(4);
      } catch (err) {
        setServerError(
          err?.response?.data?.message || err?.message || 'Reset failed'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const resend = async () => {
    setServerError('');
    try {
      await forgotPassword(email);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || err?.message || 'Failed to resend OTP'
      );
    }
  };

  return (
    <div className="font-inter bg-[#FAFBFD] dark:bg-[#020617]">
      {serverError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {stage === 1 && (
        <ForgotPassWrapper
          title="Forget password"
          description="Enter your email for the verification process, we will send a 6-digit code."
          buttonText={emailFormik.isSubmitting ? 'Sending…' : 'Continue'}
          onSubmit={emailFormik.handleSubmit}
        >
          <div className="w-full">
            <input
              {...emailFormik.getFieldProps('email')}
              type="email"
              className={`w-full p-4 rounded-full border bg-[#F8FAFD] dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all focus:bg-white dark:focus:bg-[#111827] focus:ring-4 focus:ring-brand-main/10 ${emailFormik.touched.email && emailFormik.errors.email ? 'border-red-500' : 'border-gray-text-dim2 dark:border-gray-700'}`}
              placeholder="Enter your email"
            />
            {emailFormik.touched.email && emailFormik.errors.email}
          </div>
        </ForgotPassWrapper>
      )}

      {stage === 2 && (
        <ForgotPassWrapper
          title="Verification"
          description="Enter your 6-digit code that you received on your email"
          buttonText={otpFormik.isSubmitting ? 'Verifying…' : 'Verify'}
          onSubmit={otpFormik.handleSubmit}
          footer={
            <div
              className="text-brand-main text-sm font-bold cursor-pointer hover:underline pt-2"
              onClick={resend}
            >
              Resend email
            </div>
          }
        >
          <div className="w-full">
            <input
              name="otp"
              value={otpFormik.values.otp}
              onBlur={otpFormik.handleBlur}
              onChange={(event) => {
                const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 6);
                otpFormik.setFieldValue('otp', digitsOnly);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className={`w-full p-4 rounded-full border bg-[#F8FAFD] dark:bg-[#111827] text-center tracking-[0.55em] pl-[0.55em] text-xl sm:text-2xl font-bold font-mono text-black-main-text dark:text-[#E2E8F0] outline-none focus:bg-white dark:focus:bg-[#111827] focus:ring-4 focus:ring-brand-main/10 ${otpFormik.touched.otp && otpFormik.errors.otp ? 'border-red-500' : 'border-gray-text-dim2 dark:border-gray-700'}`}
              placeholder="000000"
            />
            <div className="flex justify-center">
              {otpFormik.touched.otp && otpFormik.errors.otp}
            </div>
          </div>
        </ForgotPassWrapper>
      )}

      {stage === 3 && (
        <ForgotPassWrapper
          title="New Password"
          description="Set the new password for your account."
          buttonText={resetFormik.isSubmitting ? 'Saving…' : 'Change Password'}
          onSubmit={resetFormik.handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <input
                {...resetFormik.getFieldProps('password')}
                type="password"
                className="w-full p-4 rounded-full border border-gray-text-dim2 dark:border-gray-700 bg-[#F8FAFD] dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:bg-white dark:focus:bg-[#111827] focus:ring-4 focus:ring-brand-main/10"
                placeholder="New Password"
              />
              {resetFormik.touched.password && resetFormik.errors.password}
            </div>
            <div>
              <input
                {...resetFormik.getFieldProps('confirmPassword')}
                type="password"
                className="w-full p-4 rounded-full border border-gray-text-dim2 dark:border-gray-700 bg-[#F8FAFD] dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:bg-white dark:focus:bg-[#111827] focus:ring-4 focus:ring-brand-main/10"
                placeholder="Confirm Password"
              />
              {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword}
            </div>
          </div>
        </ForgotPassWrapper>
      )}

      {stage === 4 && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-[#FAFBFD] dark:bg-[#020617]">
          <div className="w-24 h-24  rounded-full flex items-center justify-center mb-6">
            <MdCheckCircle className="text-[#00C853] text-7xl" />
          </div>
          <h2 className="text-2xl font-bold text-black-main-text mb-2 tracking-tight">Password changed</h2>
          <p className="text-gray-text-dim2  text-[15px] mb-10 max-w-[400px]">Your password has been changed successfully</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full max-w-[400px] bg-brand-main hover:bg-brand-dark text-white font-bold py-4 rounded-full shadow-lg shadow-brand-main/20 transition-all active:scale-95"
          >
            Log in
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
