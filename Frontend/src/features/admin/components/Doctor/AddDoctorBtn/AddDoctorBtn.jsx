import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { LuUpload, LuUser } from 'react-icons/lu';
import {
  HiOutlineEnvelope, HiOutlinePhone, HiOutlineCalendarDays,
  HiOutlineLockClosed, HiOutlineMapPin, HiOutlineCurrencyDollar, HiMiniUserPlus,
} from 'react-icons/hi2';
import { createDoctorValidationSchema } from '../../DoctorForm/shared/doctorValidationSchema';
import FieldError from '../../DoctorForm/shared/FieldError';
import InputField from '../../DoctorForm/shared/InputField';
import { GenderToggle } from '../../shared';
import { createDoctor } from '../../../../../services/adminService';

export default function AddDoctorBtn() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '', lastName: '', email: '', phone: '',
      dateOfBirth: null, password: '', location: '', price: '',
      gender: 'Male', image: null,
    },
    validationSchema: createDoctorValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const payload = {
          FirstName: values.firstName.trim(),
          LastName: values.lastName.trim(),
          Email: values.email.trim(),
          Password: values.password,
          PhoneNumber: values.phone,
          DateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : '',
          Gender: values.gender,
          ConsultationPrice: Number(values.price) || 0,
          ClinicLocation: values.location,
        };
        await createDoctor(payload, values.image);
        navigate('/admin/doctors/list', {
          state: {
            success: true,
            title: 'Doctor Created',
            message: 'Doctor account has been created successfully',
          },
        });
      } catch (err) {
        setServerError(
          err?.response?.data?.message || err?.message || 'Failed to create doctor'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (!file) return;
    formik.setFieldValue('image', file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <section className="bg-white dark:bg-[#111827] overflow-hidden min-h-screen">

      {/* Header - Matching Patient Page */}
      <header className="bg-[#155dfc] p-6 md:p-8 flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl bg-white/20 text-white text-[20px] md:text-[24px]">
          <HiMiniUserPlus />
        </div>
        <div>
          <h1 className="text-[20px] md:text-[24px] font-bold text-white leading-tight">Add New Doctor</h1>
          <p className="text-[14px] md:text-[16px] text-blue-100/90 font-normal mt-1 md:mt-0">Fill in the details to register a new doctor on the platform.</p>
        </div>
      </header>

      {serverError && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Form Content - Same Spacing as Patient Page */}
      <form onSubmit={formik.handleSubmit} className="py-8 px-4 md:py-12 md:pl-8 md:pr-8 lg:pr-[145px]">

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr] gap-8 md:gap-12">

          {/* Column 1: Upload Photo */}
          <div className="flex flex-col gap-4">
            <p className="text-[16px] font-normal text-[#344054] dark:text-gray-300">Upload Photo</p>
            <label className="border-2 border-dashed border-[#D1E1FF] dark:border-[#334155] bg-[#F0F6FF] dark:bg-[#0F172A] rounded-[20px] flex flex-col items-center justify-center p-6 min-h-[250px] cursor-pointer hover:bg-[#e6efff] dark:hover:bg-[#1E293B] transition-all">
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover rounded-[15px]" alt="preview" />
              ) : (
                <div className="text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-[#E0EBFF] dark:bg-[#1E293B] rounded-2xl flex items-center justify-center text-[#155dfc] text-[24px] mb-4">
                    <LuUpload />
                  </div>
                  <p className="text-[16px] font-normal text-[#101828] dark:text-[#E2E8F0]">Click to upload photo</p>
                  <p className="text-[14px] text-gray-500 mt-1 font-normal">PNG, JPG up to 10MB</p>
                </div>
              )}
            </label>
          </div>

          {/* Column 2: Doctor Information Form */}
          <div className="bg-[#F9FAFB] dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-[24px] p-5 md:p-8 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-6 md:mb-8 text-[#155dfc]">
              <LuUser className="text-[20px]" />
              <span className="text-[18px] font-normal text-[#101828] dark:text-[#E2E8F0]">Personal Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField label="First Name" name="firstName" formik={formik} placeholder="Enter first name" />
              <InputField label="Last Name" name="lastName" formik={formik} placeholder="Enter last name" />
              <InputField label="Email Address" name="email" type="email" formik={formik} placeholder="doctor@pulsex.com" icon={HiOutlineEnvelope} />
              <InputField label="Phone Number" name="phone" formik={formik} placeholder="+20 1000000000" icon={HiOutlinePhone} />

              <div className="flex flex-col gap-2">
                <label className="text-[16px] font-normal text-[#344054] dark:text-gray-300">Date of Birth <span className="text-red-500">*</span></label>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-full border bg-white dark:bg-[#0B1120] ${formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}>
                  <HiOutlineCalendarDays className="text-gray-400 dark:text-gray-500 text-[20px]" />
                  <DatePicker
                    selected={formik.values.dateOfBirth}
                    onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                    placeholderText="Select date"
                    maxDate={new Date()}
                    minDate={new Date("1900-01-01")}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    className="w-full outline-none text-[16px] font-normal bg-transparent text-gray-900 dark:text-[#E2E8F0]"
                  />
                </div>
                <FieldError msg={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? formik.errors.dateOfBirth : ''} textClassName="text-red-500" />
              </div>

              <InputField label="Password" name="password" type="password" formik={formik} placeholder="Create a strong password" icon={HiOutlineLockClosed} />
              <InputField label="Location" name="location" formik={formik} placeholder="Enter doctor location" icon={HiOutlineMapPin} />
              <InputField label="Consultation Price" name="price" type="number" formik={formik} placeholder="Enter price" icon={HiOutlineCurrencyDollar} />
            </div>

            <div className="mt-8">
              <GenderToggle
                value={formik.values.gender?.toLowerCase() === 'male' ? 'Male' : 'Female'}
                onChange={(value) => formik.setFieldValue('gender', value)}
              />
              <FieldError msg={formik.touched.gender && formik.errors.gender ? formik.errors.gender : ''} textClassName="text-red-500" />
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-4 mt-12">
          <button
            type="button"
            onClick={() => navigate('/admin/doctors/list')}
            className="w-full md:w-auto px-12 cursor-pointer py-3.5 rounded-full bg-[#E4E7EC] text-[#344054] text-[16px] font-normal hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full md:w-auto flex cursor-pointer items-center justify-center gap-2 px-12 py-3.5 rounded-full bg-[#333CF5] text-white text-[16px] font-normal hover:bg-[#2830d4] transition-all shadow-lg"
          >
            <HiMiniUserPlus className="text-[20px] " />
            {formik.isSubmitting ? 'Creating...' : 'Create Doctor'}
          </button>
        </div>
      </form>
    </section>
  );
}