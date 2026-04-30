import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import ForgotPassWrapper from '../../components/ForgotPassWrapper/ForgotPassWrapper';
import {
  emailStageSchema,
  otpStageSchema,
  resetPasswordStageSchema
} from '../../schemas/forgotPasswordSchema';
import { MdCheckCircle } from "react-icons/md";

const ForgotPassword = () => {
  const [stage, setStage] = useState(1);
  const navigate = useNavigate();

  // 1. فورميك المرحلة الأولى (Email)
  const emailFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: emailStageSchema,
    onSubmit: (values) => {
      console.log("Stage 1 Success:", values.email);
      setStage(2); // الانتقال للمرحلة التانية
    }
  });

  // 2. فورميك المرحلة الثانية (OTP)
  const otpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: otpStageSchema,
    onSubmit: (values) => {
      console.log("Stage 2 Success:", values.otp);
      setStage(3);
    }
  });

  // 3. فورميك المرحلة الثالثة (New Password)
  const resetFormik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: resetPasswordStageSchema,
    onSubmit: (values) => {
      console.log("Stage 3 Success:", values.password);
      setStage(4);
    }
  });

  return (
    <div className="font-inter">
      {/* المرحلة الأولى: إدخال الإيميل */}
      {stage === 1 && (
        <ForgotPassWrapper
          title="Forget password"
          description="Enter your email for the verification process, we will send a 6-digit code to your email."
          buttonText="Continue"
          onSubmit={emailFormik.handleSubmit}
        >
          <input
            {...emailFormik.getFieldProps('email')}
            type="email"
            className="w-full p-4 rounded-full border border-gray-text-dim2  bg-[#F8FAFD] 
           shadow-sm transition-all outline-none 
           focus:bg-white focus:ring-4 focus:ring-brand-main/10 focus:shadow-md"placeholder="Enter your email"
          />
          {emailFormik.touched.email && emailFormik.errors.email}
        </ForgotPassWrapper>
      )}

      {/* المرحلة الثانية: كود التحقق */}
      {stage === 2 && (
        <ForgotPassWrapper
          title="Verification"
          description="Enter your 6-digit code that you received on your email"
          buttonText="Verify"
          onSubmit={otpFormik.handleSubmit}
        >
          <input
            {...otpFormik.getFieldProps('otp')}
            maxLength="6"
            className="w-full p-4 rounded-full border border-gray-100 bg-[#F8FAFD] focus:bg-white focus:ring-4 focus:ring-brand-main/10 outline-none text-center text-3xl tracking-[1rem] font-bold"
            placeholder="000000"
          />
          {otpFormik.touched.otp && otpFormik.errors.otp}
          <div className="mt-4 text-brand-main text-sm font-bold cursor-pointer " onClick={() => console.log("Resend OTP")}>
            Resend email
          </div>
        </ForgotPassWrapper>

      )}

      {/* المرحلة الثالثة: الباسورد الجديد */}
      {stage === 3 && (
        <ForgotPassWrapper
          title="New Password"
          description="Set the new password for your account so you can login and access all features."
          buttonText="Change Password"
          onSubmit={resetFormik.handleSubmit}
        >
          <div className="space-y-4">
            <input
              {...resetFormik.getFieldProps('password')}
              type="password"
              className="w-full p-4 rounded-full border border-gray-100 bg-[#F6F7F8] focus:bg-white focus:ring-4 focus:ring-brand-main/10 outline-none"
              placeholder="New Password"
            />
            <input
              {...resetFormik.getFieldProps('confirmPassword')}
              type="password"
              className="w-full p-4 rounded-full border border-gray-100 bg-[#F6F7F8] focus:bg-white focus:ring-4 focus:ring-brand-main/10 outline-none"
              placeholder="Confirm Password"
            />
            {(resetFormik.touched.password && resetFormik.errors.password) || (resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword)}
          </div>
        </ForgotPassWrapper>
      )}

      {/* المرحلة الرابعة: النجاح */}
      {stage === 4 && (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-24 h-24 bg-[#00C853]/10 rounded-full flex items-center justify-center mb-6">
            <MdCheckCircle className="text-[#00C853] text-7xl" />
          </div>
          <h2 className="text-2xl font-bold text-black-main-text mb-2">Password changed</h2>
          <p className="text-gray-text-dim text-sm mb-10 max-w-[500px]">Your password has been changed successfully</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full max-w-[400px] bg-brand-main hover:bg-brand-dark text-white font-bold py-4 rounded-full shadow-lg transition-all active:scale-95"
          >
            Log in
          </button>
        </div>
      )}
    </div>
  );
};

// الـ Export اللي كان ناقص ومسبب الخطأ!
export default ForgotPassword;
