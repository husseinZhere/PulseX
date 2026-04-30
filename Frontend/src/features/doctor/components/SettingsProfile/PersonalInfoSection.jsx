import { useRef, useState } from 'react';
import { LuCalendar, LuMail, LuMapPin, LuPhone, LuUser } from 'react-icons/lu';
import { HiOutlineCheck } from 'react-icons/hi2';
import { GenderToggle } from '../../../admin/components/shared';

const InputField = ({ label, icon, value, onChange, required = false }) => (
  <label className="block">
    <span className="mb-1 block text-[14px] font-bold text-[#364153] dark:text-gray-200">
      {label}
      {required ? <span className="ml-1 text-[#DC2626]">*</span> : null}
    </span>
    <div className="flex h-[46px] items-center gap-2 rounded-[14px] border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] px-4 transition-colors focus-within:border-[#333CF5]">
      <span className="text-[16px] text-[#9CA3AF]">{icon}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full bg-transparent text-[16px]  dark:text-gray-100 outline-none  text-[#111827] dark:text-gray-100"
      />
    </div>
  </label>
);

const PersonalInfoSection = ({ form, setForm, onSave, onPhotoUploaded }) => {
  const fileRef = useRef(null);
  const [photoError, setPhotoError] = useState('');

  const onField = (field, value) => setForm((state) => ({ ...state, [field]: value }));

  const openPhotoPicker = () => {
    fileRef.current?.click();
  };

  const onPhotoKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPhotoPicker();
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const hasValidExtension = allowedExtensions.includes(fileExtension);
    const hasValidType = file.type
      ? allowedTypes.includes(file.type.toLowerCase())
      : false;
    const maxSizeInBytes = 5 * 1024 * 1024;

    if (!hasValidType && !hasValidExtension) {
      setPhotoError('Please upload a JPG, PNG, or GIF image.');
      event.target.value = '';
      return;
    }

    if (file.size > maxSizeInBytes) {
      setPhotoError('Image size must be 5MB or less.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((state) => ({ ...state, photo: reader.result }));
      if (onPhotoUploaded) {
        onPhotoUploaded(reader.result, file);
      }
      setPhotoError('');
    };

    reader.onerror = () => {
      setPhotoError('Could not read this file. Please try a different image.');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]" aria-labelledby="doctor-personal-title">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-gray-700 bg-gradient-to-r from-[#eff6ff] to-[#eef2ff] dark:from-[#0B1120] dark:to-[#111827] px-6 py-4">
        <LuUser className="text-[20px] text-[#2563EB] dark:text-[#60A5FA]" />
        <h2 id="doctor-personal-title" className="text-[18px] font-bold text-[#101828] dark:text-[#E2E8F0]">Personal Information</h2>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
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
              <img
                src={form.photo}
                alt="Doctor profile"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="text-[12px] font-semibold text-white">Change</span>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {photoError ? (
              <p className="mt-1 text-center text-[12px] font-medium text-[#DC2626] dark:text-[#FCA5A5] lg:max-w-[170px]">{photoError}</p>
            ) : null}

            <div className="text-center">
              <p className="text-[12px] leading-snug text-[#6a7282] dark:text-gray-400">JPG, PNG or GIF</p>
              <p className="text-[12px] leading-snug text-[#6a7282] dark:text-gray-400">Max size 5MB</p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="First Name" icon={<LuUser />} value={form.firstName} onChange={(v) => onField('firstName', v)} required />
            <InputField label="Last Name" icon={<LuUser />} value={form.lastName} onChange={(v) => onField('lastName', v)} required />
            <InputField label="Email Address" icon={<LuMail />} value={form.email} onChange={(v) => onField('email', v)} required />
            <InputField label="Phone Number" icon={<LuPhone />} value={form.phone} onChange={(v) => onField('phone', v)} required />
            <InputField label="Date of Birth" icon={<LuCalendar />} value={form.dob} onChange={(v) => onField('dob', v)} />
            <InputField label="Location" icon={<LuMapPin />} value={form.location} onChange={(v) => onField('location', v)} />

            <InputField
              label="Years of Experience"
              icon={<LuCalendar />}
              value={form.experienceYears}
              onChange={(v) => onField('experienceYears', v)}
            />

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
            onClick={onSave}
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
