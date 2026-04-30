import React from 'react';
import { useFormik } from 'formik';
import { registerSchema } from '../../schemas/registerSchema';
import { useNavigate, Link } from 'react-router-dom';
import Select from 'react-select'; // المكتبة الجديدة
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TbLogin2 } from "react-icons/tb";
import { FaUserGroup } from "react-icons/fa6";
import { IoDocumentTextSharp } from "react-icons/io5";
import { RiGroupLine } from "react-icons/ri";
import { CiCalendar } from "react-icons/ci";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdOutlineErrorOutline } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi2";
import Logo from '../../assets/logo/logo.svg';
const Register = () => {
  const navigate = useNavigate();

  // تجهيز الخيارات للمكتبة الجديدة
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const yearOptions = years.map(y => ({ value: y, label: y.toString() }));
  const monthOptions = months.map((m, i) => ({ value: i, label: m }));

  // ستايل المكتبة المخصص ليطابق ديزاين PulseX
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '34px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      fontSize: '13px',
      fontWeight: '700',
      minWidth: '110px',
      boxShadow: 'none',
      cursor: 'pointer',
      zIndex: 9999,
      '&:hover': { borderColor: '#333CF5' }
    }),menu: (base) => ({ 
    ...base, 
    zIndex: 9999 
  }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      fontSize: '12px',
      zIndex: 9999,
      fontWeight: '600',
      backgroundColor: isSelected ? '#333CF5' : isFocused ? '#F1F5F9' : 'white',
      color: isSelected ? 'white' : '#010218',
      cursor: 'pointer',
    }),
    singleValue: (base) => ({ ...base, color: '#333CF5' }),
    dropdownIndicator: (base) => ({ ...base, color: '#333CF5', padding: '4px' }),
    indicatorSeparator: () => ({ display: 'none' }),
    menuPortal: (base) => ({ 
    ...base, 
    zIndex: 9999 
  }),
  };

  const formik = useFormik({
    initialValues: { firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: null, gender: '', acceptTerms: false },
    validationSchema: registerSchema,
    onSubmit: (values) => {
      const payload = { ...values, dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : null };
      console.log("Submitting to API...", payload);
      navigate('/login');
    },
  });

  return (
    <div className="min-h-screen bg-[#F6F7F8] pb-20">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-gray-100 flex items-center px-10 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-black-main-text">
          <img src={Logo} alt="PulseX" className="w-8 h-8" />
          <span>PulseX</span>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto py-10 px-4 flex flex-col items-center">
        {/* Header */}
        <header className="text-center mb-8 max-w-2xl">
          <h1 className="text-2xl md:text-[30px] font-bold text-black-main-text mb-3">Create Your Patient Account</h1>
          <p className="text-gray-500 text-[13px] leading-relaxed">Join thousands of patients who trust MedConnect Portal for their healthcare needs.</p>
        </header>

        {/* Form box */}
        <div className="bg-white p-6 md:p-10 rounded-[28px] shadow-[0px_10px_60px_rgba(0,0,0,0.03)] w-full max-w-[780px] border border-gray-50">
          <div className="text-center mb-7">
            <h3 className="font-bold text-[18px] text-black-main-text">Personal Information</h3>
            <p className="text-gray-500 text-[12px] mt-2">Please provide your basic contact information</p>
          </div>

          <form onSubmit={formik.handleSubmit}>
            {/* Inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: 'First Name', name: 'firstName', placeholder: 'Enter your first name' },
                { label: 'Last Name', name: 'lastName', placeholder: 'Enter your last name' },
                { label: 'Email Address', name: 'email', placeholder: 'Enter your Email Address' },
                { label: 'Password', name: 'password', placeholder: 'Create a strong password', type: 'password' },
                { label: 'Phone Number', name: 'phone', placeholder: '+20 1000000000' }
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-[12px] font-bold mb-2.5 tracking-wider text-black-main-text ">
                    {f.label} <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...formik.getFieldProps(f.name)}
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    className={`w-full px-6 py-3.5 rounded-full border outline-none transition-all text-[14px] focus:ring-4 focus:ring-brand-main/10 bg-white ${
                      formik.touched[f.name] && formik.errors[f.name]
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                  {formik.touched[f.name] && formik.errors[f.name] && (
                    <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5 font-medium ml-4">
                      <MdOutlineErrorOutline /> {formik.errors[f.name]}
                    </div>
                  )}
                </div>
              ))}

              {/* Date of Birth */}
              <div>
                <label className="block text-[12px] font-bold mb-2.5 tracking-wider text-black-main-text">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <div className="relative w-full">
                  <CiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl z-10" />
                  <DatePicker
                    selected={formik.values.dateOfBirth}
                    onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                    onBlur={() => formik.setFieldTouched('dateOfBirth', true)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    popperPlacement="bottom-start"
                    popperModifiers={[{ name: "flip", options: { fallbackPlacements: [] } }]}
                    className={`!pl-12 !pr-6 w-full px-6 py-3.5 rounded-full border outline-none transition-all text-[14px] focus:ring-4 focus:ring-brand-main/10 bg-white ${
                      formik.touched.dateOfBirth && formik.errors.dateOfBirth ? '!border-red-400 !bg-red-50' : 'border-gray-200'
                    }`}
                    renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-2xl mb-3 border border-gray-100">
                        <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-white rounded-full"><IoIosArrowBack /></button>
                        <div className="flex gap-2 items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
                          <Select
                            styles={customSelectStyles}
                            options={monthOptions}
                            value={monthOptions[date.getMonth()]}
                            onChange={(opt) => changeMonth(opt.value)}
                            isSearchable={false}
                            menuPortalTarget={document.body}
                          />
                          <Select
                            styles={customSelectStyles}
                            options={yearOptions}
                            value={yearOptions.find(y => y.value === date.getFullYear())}
                            onChange={(opt) => changeYear(opt.value)}
                            isSearchable={true}
                            menuPortalTarget={document.body}
                          />
                        </div>
                        <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-white rounded-full"><IoIosArrowForward /></button>
                      </div>
                    )}
                  />
                </div>
                {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5 font-medium ml-4">
                    <MdOutlineErrorOutline /> {formik.errors.dateOfBirth}
                  </div>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="mt-8">
              <label className="block text-[12px] font-bold mb-3 tracking-wider text-black-main-text ">
                Gender <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-5">
                {['Male', 'Female'].map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-full border cursor-pointer transition-all font-bold text-[15px] bg-white ${
                      formik.values.gender === g
                        ? 'border-brand-main bg-brand-main/5 text-brand-main'
                        : 'border-gray-200 text-black-main-text'
                    }`}
                  >
                    <input type="radio" className="hidden" name="gender" onChange={() => formik.setFieldValue('gender', g)} checked={formik.values.gender === g} />
                    <div className={`w-4 h-4 rounded-full border-2 ${formik.values.gender === g ? 'border-brand-main bg-brand-main' : 'border-gray-300'}`} />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-black-main-text font-bold text-[16px] mb-4">
                <HiOutlineDocumentText className="text-brand-main text-xl" /> Terms & Consent <span className="text-red-400">*</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" {...formik.getFieldProps('acceptTerms')} className="mt-1 w-5 h-5 accent-brand-main cursor-pointer" />
                <div>
                  <p className="text-[14px] text-black-main-text font-medium">
                    I agree to the <span className="text-brand-main underline cursor-pointer">Terms of Service and Privacy Policy</span>
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1">By checking this box, you agree to our terms and conditions</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-brand-main hover:bg-[#252CBF] text-white font-bold py-4 px-20 rounded-full shadow-lg transition-all active:scale-95 block mx-auto mt-10"
            >
              Submit
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-12 p-8 bg-[#F1F5F9] rounded-[24px] text-center">
            <p className="flex items-center justify-center gap-2 font-semibold text-black-main-text">
              <RiGroupLine className="text-brand-main" /> Already have an account?
            </p>
            <p className="text-[13px] text-gray-500 mt-2 mb-6">If you're an existing patient, sign in to access your records.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#00C853] hover:bg-[#13A956] text-white font-bold py-3.5 px-10 rounded-xl transition-all shadow-md active:scale-95 mt-4"
            >
              Sign In to Existing Account <TbLogin2 />
            </Link>
          </div>
        </div>

        {/* Footer features */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 text-center w-full max-w-[1000px] border-t border-gray-100 pt-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-brand-main/10 rounded-full flex items-center justify-center text-brand-main text-2xl">
              <FaUserGroup />
            </div>
            <h4 className="font-bold text-[16px] text-black-main-text">Expert Care Team</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[250px]">Connect with board-certified physicians and specialists.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-[#15A96D]/10 rounded-full flex items-center justify-center text-[#00C853] text-2xl">
              <CiCalendar />
            </div>
            <h4 className="font-bold text-[16px] text-black-main-text">Easy Scheduling</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[250px]">Book appointments 24/7 with our online system.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-[#D0791D]/10 rounded-full flex items-center justify-center text-[#D0791D] text-2xl">
              <IoDocumentTextSharp />
            </div>
            <h4 className="font-bold text-[16px] text-black-main-text">Digital Records</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[250px]">Access your medical history anytime, anywhere.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Register;