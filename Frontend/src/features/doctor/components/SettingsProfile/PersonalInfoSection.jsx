import { useRef, useState } from 'react';
import { LuCalendar, LuMail, LuMapPin, LuPhone, LuUser } from 'react-icons/lu';
import { HiOutlineCheck } from 'react-icons/hi2';
import { GenderToggle } from '../../../admin/components/shared';

const EGYPTIAN_PHONE = /^01[0125][0-9]{8}$/;

const maxDobDoctor = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 22);
  return d.toISOString().split('T')[0];
};

const ErrorMsg = ({ msg }) =>
  msg ? <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{msg}</p> : null;

const InputField = ({ label, icon, value, onChange, required = false, error }) => (
  <label className="block">
    <span className="mb-1 block text-[14px] font-bold text-[#364153] dark:text-gray-200">
      {label}
      {required ? <span className="ml-1 text-[#DC2626]">*</span> : null}
    </span>
    <div className={`flex h-[46px] items-center gap-2 rounded-[14px] border ${error ? 'border-[#DC2626]' : 'border-[#E5E7EB] dark:border-gray-700'} bg-[#F9FAFB] dark:bg-[#0B1120] px-4 transition-colors focus-within:border-[#333CF5]`}>
      <span className="text-[16px] text-[#9CA3AF]">{icon}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full bg-transparent text-[16px] dark:text-gray-100 outline-none text-[#111827]"
      />
    </div>
    <ErrorMsg msg={error} />
  </label>
);

const DateField = ({ label, value, onChange, max, required = false, error }) => (
  <label className="block">
    <span className="mb-1 block text-[14px] font-bold text-[#364153] dark:text-gray-200">
      {label}
      {required ? <span className="ml-1 text-[#DC2626]">*</span> : null}
    </span>
    <div className={`flex h-[46px] items-center gap-2 rounded-[14px] border ${error ? 'border-[#DC2626]' : 'border-[#E5E7EB] dark:border-gray-700'} bg-[#F9FAFB] dark:bg-[#0B1120] px-4 transition-colors focus-within:border-[#333CF5]`}>
      <LuCalendar className="text-[16px] text-[#9CA3AF] shrink-0" />
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        max={max}
        min="1900-01-01"
        className="h-full w-full bg-transparent text-[16px] dark:text-gray-100 outline-none text-[#111827] dark:[color-scheme:dark]"
      />
    </div>
    <ErrorMsg msg={error} />
  </label>
);

const validate = (form) => {
  const errs = {};
  if (!form.firstName?.trim()) errs.firstName = 'First name is required';
  if (!form.lastName?.trim()) errs.lastName = 'Last name is required';
  if (!form.email?.trim()) {
    errs.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errs.email = 'Invalid email format';
  }
  if (!form.phone?.trim()) {
    errs.phone = 'Phone number is required';
  } else if (!EGYPTIAN_PHONE.test(form.phone)) {
    errs.phone = 'Must be a valid Egyptian number (e.g. 01012345678)';
  }
  if (form.dob) {
    const maxDob = new Date();
    maxDob.setFullYear(maxDob.getFullYear() - 22);
    if (new Date(form.dob) > maxDob) errs.dob = 'Doctor must be at least 22 years old';
  }
  return errs;
};

const PersonalInfoSection = ({ form, setForm, onSave, onPhotoUploaded, onPhotoError }) => {
  const fileRef = useRef(null);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState({});

  const onField = (field, value) => setForm((state) => ({ ...state, [field]: value }));

  const openPhotoPicker = () => fileRef.current?.click();

  const onPhotoKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhotoPicker(); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedTypes.includes(file.type?.toLowerCase()) && !allowedExtensions.includes(ext)) {
      setPhotoError('Please upload a JPG, PNG, or GIF image.');
      onPhotoError?.('Invalid File Type', 'Please upload a JPG, PNG, or GIF image.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size must be 5MB or less.');
      onPhotoError?.('File Too Large', 'Photo must be under 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((state) => ({ ...state, photo: reader.result }));
      onPhotoUploaded?.(reader.result, file);
      setPhotoError('');
    };
    reader.onerror = () => setPhotoError('Could not read this file. Please try a different image.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave();
  };

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]" aria-labelledby="doctor-personal-title">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-gray-700 bg-gradient-to-r from-[#eff6ff] to-[#eef2ff] dark:from-[#0B1120] dark:to-[#111827] px-6 py-4">
        <LuUser className="text-[20px] text-[#2563EB] dark:text-[#60A5FA]" />
        <h2 id="doctor-personal-title" className="text-[18px] font-bold text-[#101828] dark:text-[#E2E8F0]">Personal Information</h2>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
          {/* Profile photo */}
          <div className="flex w-full shrink-0 flex-col items-center gap-2 lg:w-auto">
            <p className="mb-1 self-start text-sm font-semibold text-[#364153] dark:text-gray-300 lg:self-center">Profile Photo</p>
            <div
              role="button"
              tabIndex={0}
              onClick={openPhotoPicker}
              onKeyDown={onPhotoKeyDown}
              className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-[#D1D5DB] dark:border-gray-600 transition-colors hover:border-[#333CF5] focus-visible:border-[#333CF5] sm:h-28 sm:w-28"
              aria-label="Upload doctor profile photo"
            >
              {form.photo ? (
                <img src={form.photo} alt="Doctor profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#333CF5] to-[#7C3AED] text-white text-[28px] font-bold">
                  {`${(form.firstName || 'D')[0] || 'D'}${(form.lastName || '')[0] || ''}`.toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="text-[12px] font-semibold text-white">Change</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" onChange={handlePhotoChange} className="hidden" />
            {photoError ? (
              <p className="mt-1 text-center text-[12px] font-medium text-[#DC2626] dark:text-[#FCA5A5] lg:max-w-[170px]">{photoError}</p>
            ) : null}
            <div className="text-center">
              <p className="text-[12px] leading-snug text-[#6a7282] dark:text-gray-400">JPG, PNG or GIF</p>
              <p className="text-[12px] leading-snug text-[#6a7282] dark:text-gray-400">Max size 5MB</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="First Name" icon={<LuUser />} value={form.firstName} onChange={(v) => onField('firstName', v)} required error={errors.firstName} />
            <InputField label="Last Name" icon={<LuUser />} value={form.lastName} onChange={(v) => onField('lastName', v)} required error={errors.lastName} />
            <InputField label="Email Address" icon={<LuMail />} value={form.email} onChange={(v) => onField('email', v)} required error={errors.email} />
            <InputField label="Phone Number" icon={<LuPhone />} value={form.phone} onChange={(v) => onField('phone', v)} required error={errors.phone} />
            <DateField label="Date of Birth" value={form.dob} onChange={(v) => onField('dob', v)} max={maxDobDoctor()} error={errors.dob} />
            <InputField label="Location" icon={<LuMapPin />} value={form.location} onChange={(v) => onField('location', v)} />
            <InputField label="Years of Experience" icon={<LuCalendar />} value={form.experienceYears} onChange={(v) => onField('experienceYears', v)} />
            <div className="sm:col-span-2">
              <GenderToggle
                value={form.gender === 'male' ? 'Male' : 'Female'}
                onChange={(value) => onField('gender', value.toLowerCase())}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="cursor-pointer inline-flex h-12 w-full sm:w-[200px] items-center justify-center gap-2 rounded-[24px] bg-[#333CF5] text-[16px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#2C34D8]"
          >
            <HiOutlineCheck className="text-[18px]" /> Save Changes
          </button>
        </div>
      </div>
    </section>
  );
};

export default PersonalInfoSection;
