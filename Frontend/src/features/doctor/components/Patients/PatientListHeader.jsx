import { HiOutlineUsers } from 'react-icons/hi2';

const PatientListHeader = () => {
  return (
    <header className="flex flex-col gap-1" aria-labelledby="doctor-patients-title">
      <div className="flex items-center gap-2">
        <HiOutlineUsers className="text-[20px] text-black-main-text dark:text-[#E2E8F0]" />
        <h1 id="doctor-patients-title" className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">
          Patient List
        </h1>
      </div>
      <p className="text-[18px] text-[#6B7280]">View and manage all your patients easily.</p>
    </header>
  );
};

export default PatientListHeader;
