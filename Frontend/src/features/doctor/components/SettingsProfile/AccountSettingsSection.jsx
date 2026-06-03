import { useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { LuLock, LuMoon, LuVolume2 } from 'react-icons/lu';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { isMuted, toggleMute } from '../../../../utils/notificationSound';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onChange(); }}
    className={`cursor-pointer relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#333CF5]' : 'bg-[#D1D5DB]'}`}
    aria-pressed={checked}
  >
    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SettingRow = ({ icon, title, desc, action }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
    <div className="flex items-start gap-4">
      <span className="mt-0.5 text-[20px] text-[#9CA3AF]">{icon}</span>
      <div>
        <h3 className="text-[16px] font-bold text-[#101828] dark:text-[#E2E8F0]">{title}</h3>
        <p className="text-[14px] text-[#6A7282] dark:text-gray-400">{desc}</p>
      </div>
    </div>
    {action}
  </div>
);

const AccountSettingsSection = ({ onOpenPassword }) => {
  const { isDark, toggleTheme } = useTheme();
  const [muted, setMuted] = useState(isMuted);

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]" aria-labelledby="doctor-account-title">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-gray-700 bg-gradient-to-r from-[#fff7ed] to-[#fef2f2] dark:from-[#0B1120] dark:to-[#111827] px-6 py-4">
        <HiOutlineCog6Tooth className="text-[20px] text-[#F97316] dark:text-[#FB923C]" />
        <h2 id="doctor-account-title" className="text-[18px] font-bold text-[#101828] dark:text-[#E2E8F0]">Account Settings</h2>
      </div>

      <div className="divide-y divide-[#F3F4F6] dark:divide-gray-800">
        <SettingRow
          icon={<LuLock />}
          title="Change Password"
          desc="Update your password regularly for security"
          action={
            <button
              type="button"
              onClick={onOpenPassword}
              className="cursor-pointer text-[14px] font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
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
  );
};

export default AccountSettingsSection;
