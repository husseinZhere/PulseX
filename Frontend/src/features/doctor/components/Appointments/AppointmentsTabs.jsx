const AppointmentsTabs = ({ activeTab, onChange }) => {
  return (
    <nav className="flex items-center my-2" aria-label="Appointment tabs">
      <div className="flex bg-white dark:bg-[#111827] border-[0.6px] border-[#D7D8DC] rounded-[24px] p-1.5 shadow-[0px_2px_3px_rgba(0,0,0,0.1)] h-[54px] w-full max-w-[285px]">
        <button
          className={`flex-1 rounded-[16px] text-[14px] leading-none transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'upcoming'
              ? 'bg-[#333CF5] text-white font-semibold shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)]'
              : 'text-[#010218] dark:text-[#E2E8F0] font-medium hover:bg-gray-50 dark:bg-[#111827]'
          }`}
          onClick={() => onChange('upcoming')}
          aria-current={activeTab === 'upcoming' ? 'page' : undefined}
        >
          Upcoming
        </button>

        <button
          className={`flex-1 rounded-[16px] text-[14px] leading-none transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'completed'
              ? 'bg-[#333CF5] text-white font-semibold shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)]'
              : 'text-[#010218] dark:text-[#E2E8F0] font-medium hover:bg-gray-50 dark:bg-[#111827]'
          }`}
          onClick={() => onChange('completed')}
          aria-current={activeTab === 'completed' ? 'page' : undefined}
        >
          Completed
        </button>
      </div>
    </nav>
  );
};

export default AppointmentsTabs;
