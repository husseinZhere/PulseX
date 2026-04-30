import { HiOutlineCog6Tooth } from 'react-icons/hi2';

const UpdateHealthHeader = () => {
  return (
    <header>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 text-black-main-text dark:text-[#E2E8F0]">
        <HiOutlineCog6Tooth className="text-black-main-text dark:text-[#E2E8F0]" aria-label="Settings" />
        Settings &amp; Profile
      </h1>
      <p className="text-sm text-gray-text-dim2 mt-1">
        Manage your personal details, health data, and account preferences.
      </p>
    </header>
  );
};

export default UpdateHealthHeader;
