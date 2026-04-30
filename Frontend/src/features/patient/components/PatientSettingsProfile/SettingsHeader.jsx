import { HiOutlineCog6Tooth } from 'react-icons/hi2';

const SettingsHeader = () => {
  return (
    <header className="flex flex-col pb-2 sm:pb-4">
      <div className="flex items-center gap-1">
        <div className="w-10 h-10 flex items-center text-black-main-text dark:text-[#E2E8F0] justify-center text-[24px] shrink-0">
          <HiOutlineCog6Tooth />
        </div>
        <h1 className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">
          Settings & Profile
        </h1>
      </div>
      <p className="text-[18px] text-gray-text-dim2 dark:text-gray-400 ml-2 leading-snug">
        Manage your personal details, health data, and account preferences.
      </p>
    </header>
  );
};

export default SettingsHeader;
