import { LuCalendar, LuCheck, LuMail, LuMapPin, LuPhone, LuUser } from 'react-icons/lu';
import { GenderToggle } from '../../../admin/components/shared';
import { InputField } from './FormPrimitives';

const PersonalInfoSection = ({ form, fileRef, photo, handlePhotoChange, handleField, handleSaveProfile }) => {
  return (
    <article className="bg-white dark:bg-[#111827] rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-[#EFF6FF] to-[#EEF2FF] dark:from-[#1E3A8A]/25 dark:to-[#312E81]/25 border-b border-transparent dark:border-[#334155]">
        <LuUser size={18} className="text-[#155DFC]" />
        <h2 id="settings-personal-heading" className="text-black-main-text dark:text-[#E2E8F0] text-[18px] font-bold">Personal Information</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-2 shrink-0 w-full lg:w-auto">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1 self-start lg:self-center">Profile Photo</p>
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors relative group"
              onClick={() => fileRef.current.click()}
            >
              <img
                src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${form.firstName} ${form.lastName}`.trim() || 'Patient')}&background=333CF5&color=fff&size=128`}
                className="w-full h-full object-cover"
                alt="Profile"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold">Change</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <span className="text-[10px] text-gray-400 text-center leading-relaxed">
              JPG, PNG or GIF<br />Max size 5MB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
            <InputField label="First Name" icon={<LuUser />} value={form.firstName} onChange={v => handleField('firstName', v)} required />
            <InputField label="Last Name" icon={<LuUser />} value={form.lastName} onChange={v => handleField('lastName', v)} />
            <InputField label="Email Address" icon={<LuMail />} value={form.email} onChange={v => handleField('email', v)} required />
            <InputField label="Phone Number" icon={<LuPhone />} value={form.phone} onChange={v => handleField('phone', v)} />
            <InputField label="Date of Birth" icon={<LuCalendar />} value={form.dob} onChange={v => handleField('dob', v)} />
            <InputField label="Location" icon={<LuMapPin />} value={form.location} onChange={v => handleField('location', v)} />
            <div className="sm:col-span-2">
              <GenderToggle
                value={form.gender}
                onChange={val => handleField('gender', val)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveProfile}
            className="bg-brand-main cursor-pointer hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm w-full sm:w-auto"
          >
            <LuCheck size={16} /> Save Changes
          </button>
        </div>
      </div>
    </article>
  );
};

export default PersonalInfoSection;
