import { MdOutlineBarChart } from 'react-icons/md';
import { STAT_ITEMS } from './constants.jsx';

const StatisticsCard = ({ stats }) => {
  return (
    <div
      className="bg-white dark:bg-[#111827] rounded-[28px] overflow-hidden w-full lg:w-96 shrink-0 border border-[#F3F4F6] dark:border-gray-800"
      style={{
        boxShadow: '0px 15px 35px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center gap-4 px-8 py-5 border-b border-gray-50 dark:border-gray-800 bg-[#FAFBFF] dark:bg-[#0F172A]">
        <div
          className="w-11 h-11 rounded-[15px] flex items-center justify-center text-white shadow-inner"
          style={{ background: '#155DFC' }}
        >
          <MdOutlineBarChart className="text-xl" />
        </div>
        <span className="text-[18px] font-black tracking-tight text-black-main-text dark:text-[#E2E8F0]">
          Statistics
        </span>
      </div>

      <div className="flex flex-col p-4 gap-2">
        {STAT_ITEMS.map((s) => (
          <div
            key={s.key}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 rounded-[20px] bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#1F2937] transition-colors cursor-default"
          >
            <div className="flex items-center gap-4">
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                style={{ background: s.iconBg, color: s.iconColor }}
              >
                {s.icon}
              </span>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-gray-500 dark:text-gray-400">{s.label}</span>
                <span className="sm:hidden text-[26px] font-black leading-tight" style={{ color: s.valueColor }}>
                  {stats[s.key]}
                </span>
              </div>
            </div>
            <span className="hidden sm:inline text-[26px] font-black" style={{ color: s.valueColor }}>
              {stats[s.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCard;
