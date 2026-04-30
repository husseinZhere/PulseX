import React, { useState } from 'react';
import { useFormik } from 'formik';
import { loginSchema } from '../../../../schemas/authSchema';
import { useNavigate, Link } from 'react-router-dom';
import { TbLogin2 } from 'react-icons/tb';
import { useAuth } from '../../../../context/AuthContext';
import { roleHomePath } from '../../../../components/ProtectedRoute/ProtectedRoute';

const heartImage = '/image/LoginPhoto.svg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '', rememberMe: false },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      setServerError('');
      try {
        const user = await login(values.email.trim(), values.password);
        navigate(roleHomePath(user.role));
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Invalid email or password';
        setServerError(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex bg-[#FAFBFD] dark:bg-[#020617] font-inter">
      <div className="hidden lg:flex lg:w-1/2 h-full items-center justify-center bg-white dark:bg-[#0B1220]">
        <img
          src={heartImage}
          alt="Heart Care"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-[#0F172A] p-[40px] rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)] border border-transparent dark:border-gray-800 w-full max-w-[480px]">
          <div className="text-center mb-8">
            <h2 className="text-[28px] font-bold text-black-main-text mb-2">Welcome Back</h2>
            <p className="text-gray-text-dim text-[14px]">Sign in to access your heartcare account</p>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[14px] font-medium text-black-main-text mb-2">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                {...formik.getFieldProps('email')}
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-full border bg-white dark:bg-[#111827] dark:text-[#E2E8F0] transition-all outline-none text-[14px] placeholder:text-gray-400 dark:placeholder:text-gray-500
                  ${formik.touched.email && formik.errors.email ? 'border-error ring-1 ring-error/20' : 'border-gray-200 dark:border-gray-700 focus:border-brand-main focus:ring-4 focus:ring-brand-main/10'}`}
              />
              {formik.touched.email && formik.errors.email && formik.errors.email}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-black-main-text mb-2">
                Password <span className="text-error">*</span>
              </label>
              <input
                {...formik.getFieldProps('password')}
                type="password"
                placeholder="Enter your Password"
                className={`w-full px-4 py-3 rounded-full border bg-white dark:bg-[#111827] dark:text-[#E2E8F0] transition-all outline-none text-[14px] placeholder:text-gray-400 dark:placeholder:text-gray-500
                  ${formik.touched.password && formik.errors.password ? 'border-error ring-1 ring-error/20' : 'border-gray-200 dark:border-gray-700 focus:border-brand-main focus:ring-4 focus:ring-brand-main/10'}`}
              />
              {formik.touched.password && formik.errors.password && formik.errors.password}
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2 cursor-pointer text-[13px]">
                <input
                  type="checkbox"
                  {...formik.getFieldProps('rememberMe')}
                  className="w-4 h-4 accent-brand-main cursor-pointer"
                />
                <span className="text-gray-text-dim">Remember me</span>
              </div>
              <Link to="/forgot-password" className="text-brand-main font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-brand-main hover:bg-[#252CBF] text-white font-bold py-3 rounded-full transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {formik.isSubmitting ? 'Signing in…' : (<><TbLogin2 /> Sign In</>)}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-gray-text-dim">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-main font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
