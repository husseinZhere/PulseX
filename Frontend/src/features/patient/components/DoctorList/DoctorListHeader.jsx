import { FaUserDoctor } from 'react-icons/fa6';

const DoctorListHeader = () => {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <FaUserDoctor className="text-xl text-black-main-text dark:text-[#E2E8F0]" aria-label="Doctors" />
        <h1 className="text-[24px] sm:text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">Doctor List</h1>
      </div>
      <p className="text-[18px] sm:text-[18px] text-gray-600 dark:text-gray-400">
        Find and connect with heart specialists easily.
      </p>
    </header>
  );
};

export default DoctorListHeader;
