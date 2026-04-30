import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  LuUpload, LuUser, LuMail, LuPhone, LuCalendar,
  LuMapPin, LuDollarSign, LuLock, LuCheck, LuTrash2
} from "react-icons/lu";

const inputBase = "w-full px-3 py-2 text-[13px] rounded-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B1120] text-black-main-text dark:text-[#E2E8F0] placeholder-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#155dfc]/30 focus:border-[#155dfc] transition-colors";
const iconInputBase = "flex items-center gap-2 px-3 py-2 rounded-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B1120] text-[13px] text-black-main-text dark:text-[#E2E8F0] focus-within:ring-2 focus-within:ring-[#155dfc]/30 focus-within:border-[#155dfc] transition-colors";

export default function EditForm({ title, initialData, onSave, onDelete, type }) {

  const formik = useFormik({
    initialValues: initialData || {
      firstName: '', lastName: '', email: '', phone: '',
      dob: '', password: '', location: '', price: '', gender: 'female'
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      firstName: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
    }),
    onSubmit: (values) => onSave(values),
  });

  return (
    <section className="flex flex-col gap-5" aria-label={title}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#EFF6FF] text-[#155dfc] text-[18px]"><LuUser /></div>
        <div>
          <h2 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0]">{title}</h2>
          <p className="text-[12px] text-gray-500">Manage registered {type}s details.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Photo Upload Sidebar */}
        <aside className="w-full lg:w-[180px] flex flex-col gap-2">
          <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">Profile Photo</label>
          <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-[14px] border-2 border-dashed border-gray-200 dark:border-gray-700 bg-[#F6F7F8] dark:bg-[#0B1120] cursor-pointer hover:border-[#155dfc]/40 transition-colors text-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#111827] text-[#155dfc] text-[18px] shadow-sm"><LuUpload /></div>
            <strong className="text-[12px] font-semibold text-black-main-text dark:text-[#E2E8F0]">Upload Photo</strong>
            <span className="text-[11px] text-gray-400">Max 5MB</span>
          </div>
        </aside>

        {/* Form Card */}
        <form className="flex-1 flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#155dfc]"><LuUser /> Personal Information</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">First Name <span className="text-red-500">*</span></label>
              <input className={inputBase} name="firstName" {...formik.getFieldProps('firstName')} placeholder="First name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">Last Name <span className="text-red-500">*</span></label>
              <input className={inputBase} name="lastName" {...formik.getFieldProps('lastName')} placeholder="Last name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">Email Address <span className="text-red-500">*</span></label>
              <div className={iconInputBase}><LuMail className="text-gray-400 shrink-0" /><input className="flex-1 outline-none bg-transparent text-[13px]" name="email" {...formik.getFieldProps('email')} /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">Phone Number <span className="text-red-500">*</span></label>
              <div className={iconInputBase}><LuPhone className="text-gray-400 shrink-0" /><input className="flex-1 outline-none bg-transparent text-[13px]" name="phone" {...formik.getFieldProps('phone')} /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">Date of Birth <span className="text-red-500">*</span></label>
              <div className={iconInputBase}><LuCalendar className="text-gray-400 shrink-0" /><input type="date" className="flex-1 outline-none bg-transparent text-[13px]" name="dob" {...formik.getFieldProps('dob')} /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">Location <span className="text-red-500">*</span></label>
              <div className={iconInputBase}><LuMapPin className="text-gray-400 shrink-0" /><input className="flex-1 outline-none bg-transparent text-[13px]" name="location" {...formik.getFieldProps('location')} /></div>
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300">Gender <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap items-center gap-2">
              {['male', 'female'].map(g => (
                <label key={g} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer text-[13px] font-semibold transition-all ${formik.values.gender === g ? (g === 'male' ? 'bg-[#155dfc] text-white border-[#155dfc]' : 'bg-[#E60076] text-white border-[#E60076]') : 'bg-white dark:bg-[#0B1120] text-[#364153] dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}>
                  <input type="radio" name="gender" value={g} onChange={formik.handleChange} checked={formik.values.gender === g} className="hidden" />
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button type="button" className="w-full sm:w-auto px-4 py-2 text-[13px] font-semibold text-gray-600 dark:text-gray-300 bg-[#F6F7F8] dark:bg-[#0B1120] rounded-[10px] cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
        <button type="button" onClick={onDelete} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-[10px] cursor-pointer hover:bg-red-600 transition-colors"><LuTrash2 /> Delete</button>
        <button type="submit" onClick={formik.handleSubmit} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#155dfc] rounded-[10px] cursor-pointer hover:bg-[#0913C3] transition-colors"><LuCheck /> Save Changes</button>
      </div>
    </section>
  );
}
