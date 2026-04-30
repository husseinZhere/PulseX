import { MdOutlineEventNote } from 'react-icons/md';

const AppointmentsHeader = () => {
  return (
    <header className="flex flex-col mb-4 px-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-[8px]">
          <div className="flex items-center justify-center shrink-0">
            <MdOutlineEventNote className="text-[#010218] dark:text-[#E2E8F0] text-[32px]" aria-label="Appointments" />
          </div>
          <h1 className="text-[24px] font-bold tracking-[0.24px] text-[#010218] dark:text-[#E2E8F0]">Appointments</h1>
        </div>
        <p className="text-[16px] text-[#757575] leading-[24px]">
          Manage and view all your scheduled visits easily.
        </p>
      </div>
    </header>
  );
};

export default AppointmentsHeader;
