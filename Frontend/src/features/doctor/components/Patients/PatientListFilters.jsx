import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

import { HiChevronDown } from 'react-icons/hi2';

const SelectFilter = ({ label, value, onChange, options }) => (
  <label className="flex items-center gap-2 text-[14px] font-semibold text-black-main-text dark:text-[#E2E8F0]">
    <span>{label}:</span>
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-[110px] w-full cursor-pointer appearance-none rounded-full border border-[#D1D5DB] dark:border-gray-700 bg-white dark:bg-[#111827] pl-4 pr-10 text-[14px] font-normal text-[#374151] outline-none text-[#111827] dark:text-gray-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#6B7280]" />
    </div>
  </label>
);

const PatientListFilters = ({ filters, onFilterChange, search, onSearchChange }) => {
  return (
    <section className="mt-5 rounded-2xl bg-[#ECEEF2] dark:bg-[#1E293B] p-3" aria-label="Patient list filters">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_220px]">
        <SelectFilter
          label="Risk Level"
          value={filters.risk}
          onChange={(value) => onFilterChange('risk', value)}
          options={['All', 'Low', 'Medium', 'High']}
        />
        <SelectFilter
          label="Payment"
          value={filters.payment}
          onChange={(value) => onFilterChange('payment', value)}
          options={['All', 'Cash', 'Online']}
        />
        <SelectFilter
          label="Last Visit"
          value={filters.lastVisit}
          onChange={(value) => onFilterChange('lastVisit', value)}
          options={['Today', 'This Week', 'This Month']}
        />

        <label className="relative block">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name"
            className="h-10 w-full rounded-full border border-[#D1D5DB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] pl-11 pr-4 text-[14px] outline-none text-[#111827] dark:text-gray-100 placeholder:text-[#9CA3AF]"
          />
        </label>
      </div>
    </section>
  );
};

export default PatientListFilters;
