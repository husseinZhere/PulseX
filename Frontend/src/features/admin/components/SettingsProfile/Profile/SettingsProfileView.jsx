import { useEffect, useRef, useState } from 'react';
import {
  LuCalendar,
  LuCheck,
  LuLock,
  LuMail,
  LuMapPin,
  LuMoon,
  LuPhone,
  LuUser,
  LuVolume2,
} from 'react-icons/lu';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import Toast from '../../../../../components/Toast/Toast';
import { GenderToggle } from '../../shared';
import PasswordChangeModal from './PasswordChangeModal';
import { useTheme } from '../../../../../context/ThemeContext';
import { isMuted, toggleMute } from '../../../../../utils/notificationSound';
import { readProfilePhoto, writeProfilePhoto } from '../../../../../utils/profilePhotoStorage';
import { useAuth } from '../../../../../context/AuthContext';
import { getAdminProfile, uploadAdminProfilePicture } from '../../../../../services/adminService';
import { resolveFileUrl } from '../../../../../utils/api';

export default function SettingsProfileView() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ visible: false, title: '', msg: '', type: 'success' });
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(() => readProfilePhoto('admin') || null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    location: '',
    gender: 'male',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    getAdminProfile()
      .then((profile) => {
        if (ignore || !profile) return;
        const [firstName, ...rest] = (profile.fullName || '').split(' ');
        setForm((prev) => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: rest.join(' ') || prev.lastName,
          email: profile.email || prev.email,
          phone: profile.phoneNumber || prev.phone,
        }));
        if (profile.profilePicture) {
          const url = resolveFileUrl(profile.profilePicture);
          setPhoto(url);
          writeProfilePhoto('admin', url);
        }
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  const [pwModal, setPwModal] = useState(false);
  const [muted, setMuted] = useState(isMuted);
  const { isDark, toggleTheme } = useTheme();

  const showToast = (title, msg, type = 'success') => {
    setToast({ visible: true, title, msg, type });
    setTimeout(() => setToast((current) => ({ ...current, visible: false })), 3500);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Photo must be under 5MB.', 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);

    uploadAdminProfilePicture(file)
      .then((response) => {
        const serverPhoto = response?.profilePicture || response?.photoUrl || '';
        const resolvedPhoto = resolveFileUrl(serverPhoto);
        if (resolvedPhoto) {
          setPhoto(resolvedPhoto);
          writeProfilePhoto('admin', resolvedPhoto);
        }
        showToast('Photo Updated', 'Your profile photo has been changed successfully.');
      })
      .catch(() => {
        showToast('Upload Failed', 'Could not upload photo. Please try again.');
      });

    event.target.value = '';
  };

  const handleField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const handleSaveProfile = () =>
    showToast('Saved Successfully', 'Your changes have been saved successfully.');

  return (
    <section className="flex flex-col gap-6 p-6" aria-label="Settings and profile">
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast((current) => ({ ...current, visible: false }))}
      />

      <header className="flex flex-col gap-1 pb-4" aria-labelledby="settings-profile-title">
        <div className="flex items-center gap-2">
          <HiOutlineCog6Tooth className="text-[22px] text-black-main-text dark:text-[#E2E8F0]" />
          <h1 id="settings-profile-title" className="text-[24px] leading-tight text-black-main-text dark:text-[#E2E8F0] sm:font-bold">
            Settings &amp; Profile
          </h1>
        </div>
        <p className="ml-2 text-[18px] text-gray-text-dim2 dark:text-gray-400">
          Manage your personal details and account preferences.
        </p>
      </header>

      <section className="overflow-hidden rounded-[22px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm" aria-label="Personal information">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 px-5 py-4 bg-gradient-to-r from-[#EFF6FF] to-[#EEF2FF] dark:from-[#1E3A8A]/25 dark:to-[#312E81]/25">
          <LuUser size={18} className="text-[#155DFC]" />
          <span className="text-[18px] font-bold text-[#101828] dark:text-[#E2E8F0]">Personal Information</span>
        </div>

        <div className="p-5 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <p className="mb-1 self-start text-[14px] font-semibold text-[#364153] dark:text-gray-300 lg:self-center">
                Profile Photo
              </p>
              <div
                className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400"
                onClick={() => fileRef.current.click()}
              >
                <img
                  src={
                    photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(`${form.firstName} ${form.lastName}`)}&background=333CF5&color=fff&size=128`
                  }
                  onError={(e) => {
                    setPhoto(null);
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${form.firstName} ${form.lastName}`)}&background=333CF5&color=fff&size=128`;
                  }}
                  className="h-full w-full object-cover"
                  alt="Profile"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-[14px] font-semibold text-white">Change</span>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <span className="text-center text-[12px] leading-relaxed text-gray-400">
                JPG, PNG or GIF
                <br />
                Max size 5MB
              </span>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="First Name"
                icon={<LuUser />}
                value={form.firstName}
                onChange={(value) => handleField('firstName', value)}
                required
              />
              <InputField
                label="Last Name"
                icon={<LuUser />}
                value={form.lastName}
                onChange={(value) => handleField('lastName', value)}
                required
              />
              <InputField
                label="Email Address"
                icon={<LuMail />}
                value={form.email}
                onChange={(value) => handleField('email', value)}
                required
              />
              <InputField
                label="Phone Number"
                icon={<LuPhone />}
                value={form.phone}
                onChange={(value) => handleField('phone', value)}
                required
              />
              <InputField
                label="Date of Birth"
                icon={<LuCalendar />}
                value={form.dob}
                onChange={(value) => handleField('dob', value)}
                required
              />
              <InputField
                label="Location"
                icon={<LuMapPin />}
                value={form.location}
                onChange={(value) => handleField('location', value)}
                required
              />
              <div className="sm:col-span-2">
                <GenderToggle
                  value={form.gender === 'male' ? 'Male' : 'Female'}
                  onChange={(value) => handleField('gender', value.toLowerCase())}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-brand-main px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-blue-700"
            >
              <LuCheck size={15} /> Save Changes
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[22px] border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#111827] shadow-sm transition-colors" aria-label="Account settings">
        <div
          className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 px-5 py-4 bg-gradient-to-r from-[#FFF7ED] to-[#FEF2F2] dark:from-[#0B1120] dark:to-[#111827]"
        >
          <HiOutlineCog6Tooth size={18} className="text-[#F54900] dark:text-[#FB923C]" />
          <span className="text-[18px] font-bold text-[#101828] dark:text-[#E2E8F0]">Account Settings</span>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          <SettingRow
            icon={<LuLock />}
            title="Change Password"
            desc="Update your password regularly for security"
            action={
              <button
                onClick={() => {
                  setPwModal(true);
                }}
                className="cursor-pointer text-[14px] font-bold text-[#155DFC] dark:text-[#60A5FA] hover:underline"
              >
                Change
              </button>
            }
          />
          <SettingRow
            icon={<LuMoon />}
            title="Dark Mode"
            desc="Switch to dark theme"
            action={<Toggle checked={isDark} onChange={() => toggleTheme()} />}
          />
          <SettingRow
            icon={<LuVolume2 />}
            title="Notification Sounds"
            desc="Play sounds for new messages and notifications"
            action={<Toggle checked={!muted} onChange={() => setMuted(toggleMute())} />}
          />
        </div>
      </section>

      <PasswordChangeModal
        isOpen={pwModal}
        onClose={() => setPwModal(false)}
        onSuccess={() =>
          showToast('Password Changed Successfully', 'Your changes have been saved successfully.')
        }
      />

      <style>{`@keyframes pwSlideIn { from { transform: translateY(-18px) scale(.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }`}</style>
    </section>
  );
}

function InputField({ label, icon, value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-normal text-[#364153] dark:text-gray-300">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#f9fafb] dark:bg-[#0B1120] px-3.5 py-2.5 transition-colors focus-within:border-[#155DFC]">
        <span className="shrink-0 text-[14px] text-gray-400 dark:text-gray-500">{icon}</span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-[14px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
        />
      </div>
    </div>
  );
}

function SettingRow({ icon, title, desc, action }) {
  return (
    <article className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-lg text-gray-400 dark:text-[#6A7282]">{icon}</span>
        <div>
          <h3 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0]">{title}</h3>
          <p className="mt-0.5 text-[14px] text-gray-400 dark:text-gray-400">{desc}</p>
        </div>
      </div>
      {action}
    </article>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`cursor-pointer relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#155DFC]' : 'bg-[#D1D5DB] dark:bg-[#374151]'}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}