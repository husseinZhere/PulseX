import React from 'react';
import { useFormik } from 'formik';
import { loginSchema } from '../../schemas/authSchema';
import { useNavigate, Link } from 'react-router-dom';
import { TbLogin2 } from "react-icons/tb";
import heartImage from '../../../public/image/LoginPhoto.svg'; 
const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: '', password: '', rememberMe: false },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      // محاكاة الربط مع الباك إند
      setTimeout(() => {
        if (values.email === 'admin@test.com') navigate('/admin/dashboard');
        else if (values.email === 'doctor@test.com') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
        setSubmitting(false);
      }, 1000);
    },
  });

  return (
    <div className="min-h-screen flex bg-[#FAFBFD] font-inter">
  <div className="hidden lg:flex lg:w-1/2 h-full items-center justify-center bg-white">
    <img 
      src={heartImage} 
      alt="Heart Care" 
      className="w-full h-full object-cover" 
    />
  </div>

      {/* القسم الأيمن: الفورم */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white p-[40px] rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] w-full max-w-[480px]">
          
          <div className="text-center mb-8">
            <h2 className="text-[28px] font-bold text-black-main-text mb-2">Welcome Back</h2>
            <p className="text-gray-text-dim text-[14px]">Sign in to access your heartcare account</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[14px] font-medium text-black-main-text mb-2">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                {...formik.getFieldProps('email')}
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-full border bg-white transition-all outline-none text-[14px]
                  ${formik.touched.email && formik.errors.email ? 'border-error ring-1 ring-error/20' : 'border-gray-200 focus:border-brand-main focus:ring-4 focus:ring-brand-main/10'}`}
              />
              {formik.touched.email && formik.errors.email && formik.errors.email}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[14px] font-medium text-black-main-text mb-2">
                Password <span className="text-error">*</span>
              </label>
              <input
                {...formik.getFieldProps('password')}
                type="password"
                placeholder="Enter your Password"
                className={`w-full px-4 py-3 rounded-full border bg-white transition-all outline-none text-[14px]
                  ${formik.touched.password && formik.errors.password ? 'border-error ring-1 ring-error/20' : 'border-gray-200 focus:border-brand-main focus:ring-4 focus:ring-brand-main/10'}`}
              />
              {formik.touched.password && formik.errors.password && formik.errors.password}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 cursor-pointer text-[13px]">
<input 
  type="checkbox"
  id="rememberMe" 
  {...formik.getFieldProps('rememberMe')}
  className="
    w-4 h-4 
    rounded 
    border-gray-300 
    cursor-pointer
  
    accent-brand-main

    checked:bg-white
   
    focus:ring-2 
    focus:ring-brand-main/20
    transition-all
  " 
/>
  
  {/* الـ htmlFor لازم يكون نفس اسم الـ id بالظبط */}
  <label 
    htmlFor="rememberMe" 
    className="text-black-main-text cursor-pointer select-none"
  >
    Remember me
  </label>
</div>
              <Link to="/forgot-password" name="forgot" className="font-semibold text-brand-main hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-brand-main hover:bg-brand-dark text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:bg-gray-300"
            >
              {formik.isSubmitting ? "Loading..." : (
                <>Continue to Dashboard <TbLogin2 size={20} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-[14px]">
            <p className="text-gray-text-dim">
              Don't have an account? {' '}
              <Link to="/register" className="font-bold text-brand-main hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;