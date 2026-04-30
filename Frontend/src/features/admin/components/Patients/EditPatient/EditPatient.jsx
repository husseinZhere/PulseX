import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import ConfirmModal from '../../ConfirmModal/ConfirmModal';
import { LuUpload, LuUser } from 'react-icons/lu';
import { TbTrash } from 'react-icons/tb';
import {
  HiOutlineEnvelope, HiOutlinePhone, HiOutlineCalendarDays,
  HiOutlineLockClosed,
  HiMiniUserPlus, HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { editPatientValidationSchema } from '../../PatientForm/shared/patientValidationSchema';
import FieldError from '../../PatientForm/shared/FieldError';
import InputField from '../../PatientForm/shared/InputField';
import { GenderToggle } from '../../shared';
import { getAllUsers, updatePatient, deletePatient } from '../../../../../services/adminService';
import { resolveFileUrl } from '../../../../../utils/api';

export default function EditPatient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [imagePreview, setImagePreview] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: null, password: '', gender: 'Female', image: null },
    validationSchema: editPatientValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const payload = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phoneNumber: values.phone,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
          gender: values.gender,
        };
        await updatePatient(Number(id), payload, values.image instanceof File ? values.image : null);
        navigate('/admin/patients/list', {
          state: { success: true, title: 'Updated Successfully', message: 'Patient profile updated.' },
        });
      } catch (err) {
        setServerError(
          err?.response?.data?.message || err?.message || 'Failed to update patient'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const normalizeGender = (g) => {
    if (!g) return null;
    const s = String(g).toLowerCase().trim();
    if (s === 'female' || s === 'f' || s === '1') return 'Female';
    if (s === 'male' || s === 'm' || s === '0') return 'Male';
    return null;
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const users = await getAllUsers();
        const user = (users || []).find((u) => u.id === Number(id));
        if (!user || ignore) return;
        const [firstName, ...rest] = (user.fullName || '').split(' ');
        formik.setValues({
          firstName: firstName || '',
          lastName: rest.join(' ') || '',
          email: user.email,
          phone: user.phoneNumber || '',
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
          password: '',
          gender: normalizeGender(user.gender) || 'Female',
          image: null,
        });
        if (user.profilePicture) setImagePreview(resolveFileUrl(user.profilePicture));
      } catch (err) {
        setServerError(err?.message || 'Failed to load patient');
      }
    };
    load();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteConfirm = async () => {
    try {
      await deletePatient(Number(id));
      setIsDeleteModalOpen(false);
      navigate('/admin/patients/list', { state: { success: true, title: 'Deleted' } });
    } catch (err) {
      setServerError(err?.response?.data?.message || err?.message || 'Failed to delete');
      setIsDeleteModalOpen(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (!file) return;
    formik.setFieldValue('image', file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <section className="bg-white dark:bg-[#111827]  overflow-hidden min-h-screen">

      {/* Header - Blue Solid Style */}
      <header className="bg-[#155dfc] p-4 md:p-8 flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-white/20 text-white text-[24px]">
          <HiMiniUserPlus />
        </div>
        <div>
          <h1 className="text-[24px] font-bold text-white leading-tight">Edit Patient</h1>
          <p className="text-[16px] text-blue-100/90 font-normal">View, edit, and manage all registered Patients.</p>
        </div>
      </header>

      <form onSubmit={formik.handleSubmit} className="py-6 md:py-12 px-4 md:px-8 lg:pl-8 lg:pr-[145px]">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">

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
                </div>
              )}
            </label>
          </div>

          {/* Column 2: Personal Information */}
          <div className="bg-[#F9FAFB] dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-[24px] p-8 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-8 text-[#155dfc]">
              <LuUser className="text-[20px]" />
              <span className="text-[18px] font-normal text-[#101828] dark:text-[#E2E8F0]">Personal Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField label="First Name" name="firstName" formik={formik} placeholder="Enter first name" />
              <InputField label="Last Name" name="lastName" formik={formik} placeholder="Enter last name" />
              <InputField label="Email Address" name="email" icon={HiOutlineEnvelope} formik={formik} placeholder="patient@pulsex.com" />
              <InputField label="Phone Number" name="phone" icon={HiOutlinePhone} formik={formik} placeholder="+20 1000000000" />

              <div className="flex flex-col gap-2">
                <label className="text-[16px] font-normal text-[#344054] dark:text-gray-300">Date of Birth <span className="text-[#DC2626]">*</span></label>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-full border bg-white dark:bg-[#0B1120] ${formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}>
                  <HiOutlineCalendarDays className="text-gray-400 dark:text-gray-500 text-[20px]" />
                  <DatePicker
                    selected={formik.values.dateOfBirth}
                    onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                    className="w-full outline-none text-[16px] font-normal bg-transparent text-gray-900 dark:text-[#E2E8F0]"
                    placeholderText="Select date"
                    maxDate={new Date()}
                    minDate={new Date("1900-01-01")}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                  />
                </div>
                <FieldError msg={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? formik.errors.dateOfBirth : ''} />
              </div>

              <InputField label="Password" name="password" type="password" icon={HiOutlineLockClosed} formik={formik} placeholder="Leave empty to keep current" />
            </div>

            <div className="mt-8">
              <GenderToggle
                value={formik.values.gender?.toLowerCase() === 'male' ? 'Male' : 'Female'}
                onChange={(value) => formik.setFieldValue('gender', value)}
              />
              <FieldError msg={formik.touched.gender && formik.errors.gender ? formik.errors.gender : ''} />
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-4 mt-8 md:mt-12 w-full">
          <button type="button" onClick={() => navigate('/admin/patients/list')} className="w-full sm:w-auto px-12 py-3.5 rounded-full bg-[#E4E7EC] text-[#344054] text-[16px] font-normal cursor-pointer flex justify-center text-center">
            Cancel
          </button>

          <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="w-full justify-center sm:w-auto flex items-center gap-2 px-10 py-3.5 rounded-full bg-[#DC2626] text-white border border-red-200 text-[16px] font-normal hover:bg-[#fc4242] transition-all cursor-pointer">
            <TbTrash className="text-[20px] shrink-0" /> Delete
          </button>

          <button type="submit" disabled={formik.isSubmitting} className="w-full justify-center sm:w-auto flex items-center gap-2 px-12 py-3.5 rounded-full bg-[#333CF5] text-white text-[16px] font-normal hover:bg-[#2830d4] transition-all shadow-lg cursor-pointer">
            <HiOutlineCheckCircle className="text-[20px] shrink-0" />
            {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <ConfirmModal isOpen={isDeleteModalOpen} title="Delete Patient?" desc="Are you sure you want to delete this patient? This action is permanent." onConfirm={handleDeleteConfirm} onCancel={() => setIsDeleteModalOpen(false)} />
    </section>
  );
}