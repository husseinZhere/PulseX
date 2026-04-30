import { LuBell, LuLock, LuMoon } from 'react-icons/lu';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { SettingRow, Toggle } from './FormPrimitives';
import { useTheme } from '../../../../context/ThemeContext';

const AccountSettingsSection = ({ setPwError, setPwModal, emailNotif, setEmailNotif }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-[#111827] rounded-[22px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
      <div
        className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-4 dark:bg-gradient-to-r dark:from-[#0B1120] dark:to-[#111827] bg-gradient-to-r from-[#FFF7ED] to-[#FEF2F2]"
      >
        <HiOutlineCog6Tooth size={18} className="text-[#f97316] dark:text-[#FB923C]" />
        <h2 id="settings-account-heading" className="text-[#101828] dark:text-[#E2E8F0] text-[18px] font-bold">Account Settings</h2>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        <SettingRow
          icon={<LuLock className="text-[#9CA3AF] dark:text-[#6A7282]" />}
          title={<span className="text-[#101828] dark:text-[#E2E8F0]">Change Password</span>}
          desc={<span className="text-[#6A7282] dark:text-gray-400">Update your password regularly for security</span>}
          action={
            <button
              onClick={() => { setPwError(''); setPwModal(true); }}
              className="text-[#155DFC] dark:text-[#60A5FA] cursor-pointer font-bold text-sm hover:underline"
            >
              Change
            </button>
          }
        />
        <SettingRow
          icon={<LuBell className="text-[#9CA3AF] dark:text-[#6A7282]" />}
          title={<span className="text-[#101828] dark:text-[#E2E8F0]">Email Notifications</span>}
          desc={<span className="text-[#6A7282] dark:text-gray-400">Receive email updates about your account</span>}
          action={<Toggle checked={emailNotif} onChange={() => setEmailNotif(v => !v)} />}
        />
        <SettingRow
          icon={<LuMoon className="text-[#9CA3AF] dark:text-[#6A7282]" />}
          title={<span className="text-[#101828] dark:text-[#E2E8F0]">Dark Mode</span>}
          desc={<span className="text-[#6A7282] dark:text-gray-400">Switch to dark theme</span>}
          action={<Toggle checked={isDark} onChange={() => toggleTheme()} />}
        />
      </div>
    </div>
  );
};

export default AccountSettingsSection;
