import { LuSearch, LuFilter } from 'react-icons/lu';
import AnimatedFilterPanel from './AnimatedFilterPanel';

const SearchFilterBar = ({
  search,
  onSearchChange,
  filter,
  filterOpen,
  onToggleFilter,
  onSelectFilter,
}) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl px-5 py-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-3 transition-all duration-500 ease-in-out" aria-label="Search and filter">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-[#f9fafb] dark:bg-[#0F172A] border border-[#e5e7eb] dark:border-gray-700 rounded-xl px-4 py-[10px] transition-all duration-300 focus-within:border-brand-main focus-within:shadow-[0_0_0_3px_rgba(51,60,245,0.1)]">
          <LuSearch className="text-[#9ca3af] dark:text-gray-400 text-[17px] shrink-0" />
          <input
            type="text"
            placeholder="Search by Doctor or Date..."
            className="w-full bg-transparent outline-none text-[14px] text-black-main-text dark:text-[#E2E8F0] placeholder-[#9ca3af] dark:placeholder-gray-500"
            value={search}
            onChange={onSearchChange}
          />
        </div>

        <button
          onClick={onToggleFilter}
          className="w-full sm:w-auto justify-center flex items-center gap-2 bg-brand-main text-white font-semibold text-[13px] px-4 py-[10px] rounded-xl cursor-pointer border-none shadow-[0_4px_14px_rgba(51,60,245,0.3)] transition-all duration-300 active:scale-95 hover:shadow-[0_6px_20px_rgba(51,60,245,0.4)] hover:-translate-y-[1px]"
        >
          <LuFilter
            className="text-[15px] transition-transform duration-300"
            style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          Filter
          <span
            className="text-[11px] ml-1 inline-block transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        </button>
      </div>

      <AnimatedFilterPanel
        open={filterOpen}
        filter={filter}
        onSelect={onSelectFilter}
      />
    </section>
  );
};

export default SearchFilterBar;
