import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiStar,
} from 'react-icons/hi';

const to12h = (t) => {
  if (!t) return t;
  const [hStr, mStr = '00'] = t.split(':');
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
};

const BookingSidebar = ({
  doctor,
  stepperDateLabel,
  selectedTime,
  locationLabel,
}) => {
  return (
    <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex flex-col items-start gap-6">
      <section className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2 w-full" aria-label="Doctor info">
        <img
          src={doctor.img}
          alt={`Avatar of ${doctor.name}`}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-50 shadow-sm"
        />
        <div className="mt-2 flex flex-col items-center lg:items-start">
          <span className="text-[10px] font-bold text-black-main-text dark:text-[#E2E8F0]">{doctor.title}</span>
          <h2 className="text-[22px] font-bold text-black-main-text dark:text-[#E2E8F0] leading-tight">{doctor.name}</h2>
          <div className="flex items-center justify-center lg:justify-start gap-1.5 mt-1">
            <HiStar className="text-yellow-400 text-sm" aria-label="Rating" />
            <span className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0]">{doctor.rate}</span>
            <span className="text-[16px] text-gray-500 dark:text-gray-400">({doctor.reviews} reviews)</span>
          </div>
          <p className="text-2xl font-black text-black-main-text dark:text-[#E2E8F0] mt-2">
            ${doctor.price}<span className="text-sm text-gray-500 dark:text-gray-400 font-normal"> / session</span>
          </p>
        </div>
      </section>

      <section className="flex flex-row lg:flex-col items-start justify-between sm:justify-center gap-2 lg:gap-0 w-full mt-4 lg:pl-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide" aria-label="Booking progress">
        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 relative shrink-0 flex-1 lg:flex-none">
          <div className="w-8 h-8 rounded-full bg-brand-main flex items-center justify-center relative z-10 shadow-[0_8px_18px_rgba(59,91,254,0.30)] dark:shadow-[0_8px_18px_rgba(37,44,191,0.45)]">
            <HiOutlineCalendar className="text-white text-sm" aria-label="Date" />
          </div>
          <span className="text-xs font-bold text-brand-main whitespace-nowrap text-center lg:text-left">{stepperDateLabel}</span>
          <div className={`lg:hidden absolute top-4 left-[50%] w-full h-[2px] border-t-2 border-dashed transition-colors duration-500 z-0 ${selectedTime ? 'border-brand-main' : 'border-gray-200'}`} />
        </div>

        <div className={`hidden lg:block h-7 ml-[15px] border-l-2 border-dashed transition-colors duration-500 ${selectedTime ? 'border-brand-main' : 'border-gray-200'}`} />

        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 relative shrink-0 flex-1 lg:flex-none">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-300 ${selectedTime ? 'bg-brand-main border-brand-main shadow-[0_8px_18px_rgba(59,91,254,0.30)] dark:shadow-[0_8px_18px_rgba(37,44,191,0.45)]' : 'bg-white dark:bg-[#0F172A] border-gray-200 dark:border-gray-700'}`}>
            <HiOutlineClock className={`text-sm ${selectedTime ? 'text-white' : 'text-gray-300'}`} aria-label="Time" />
          </div>
          <span className={`text-xs font-bold whitespace-nowrap text-center lg:text-left ${selectedTime ? 'text-brand-main' : 'text-gray-300'}`}>
            {selectedTime ? to12h(selectedTime) : 'Select Time'}
          </span>
          <div className="lg:hidden absolute top-4 left-[50%] w-full h-[2px] border-t-2 border-dashed border-gray-200 dark:border-gray-700 z-0" />
        </div>

        <div className="hidden lg:block h-7 ml-[15px] border-l-2 border-dashed border-gray-200 dark:border-gray-700" />

        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 relative shrink-0 flex-1 lg:flex-none">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center relative z-10">
            <HiOutlineCreditCard className="text-gray-300 text-sm" aria-label="Payment" />
          </div>
          <span className="text-xs font-bold text-gray-300 whitespace-nowrap text-center lg:text-left">Payment Type</span>
        </div>
      </section>

      <aside className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#0F172A] rounded-2xl px-4 py-3 text-[11px] text-gray-500 dark:text-gray-400 font-bold w-full mt-auto border border-gray-100 dark:border-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16" fill="none" role="img" aria-label="Location">
          <g clipPath="url(#clip0_548_5423)">
            <path d="M6.74062 15.6C8.34375 13.5938 12 8.73125 12 6C12 2.6875 9.3125 0 6 0C2.6875 0 0 2.6875 0 6C0 8.73125 3.65625 13.5938 5.25938 15.6C5.64375 16.0781 6.35625 16.0781 6.74062 15.6ZM6 4C6.53043 4 7.03914 4.21071 7.41421 4.58579C7.78929 4.96086 8 5.46957 8 6C8 6.53043 7.78929 7.03914 7.41421 7.41421C7.03914 7.78929 6.53043 8 6 8C5.46957 8 4.96086 7.78929 4.58579 7.41421C4.21071 7.03914 4 6.53043 4 6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4Z" fill="#9CA3AF" />
          </g>
          <defs>
            <clipPath id="clip0_548_5423">
              <path d="M0 0H12V16H0V0Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
        {locationLabel}
      </aside>
    </aside>
  );
};

export default BookingSidebar;
