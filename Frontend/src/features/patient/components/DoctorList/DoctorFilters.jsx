import { HiSearch } from 'react-icons/hi';

const DoctorFilters = ({
  search,
  onSearch,
  rating,
  onRatingChange,
  location,
  onLocationChange,
  priceRange,
  onPriceRangeChange,
  locations,
  priceRanges,
}) => {
  return (
    <section className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-6 mb-6 bg-[#F1F2F5] dark:bg-[#0F172A] p-4 lg:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800" aria-label="Doctor filters">
      <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 lg:px-3 lg:py-1.5 bg-white dark:bg-[#111827] w-full sm:w-auto sm:ml-auto order-first sm:order-last shadow-sm sm:shadow-none">
        <HiSearch className="text-gray-400 dark:text-gray-500 text-sm lg:text-base shrink-0" aria-label="Search" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name"
          className="text-xs lg:text-sm outline-none bg-transparent text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 w-full sm:w-32 lg:w-40"
        />
      </div>

      <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-2.5 sm:gap-6 w-full sm:w-auto order-last sm:order-first">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs lg:text-sm text-black-main-text dark:text-[#E2E8F0] flex-1 sm:flex-none">
          <span className="font-medium whitespace-nowrap pl-1 sm:pl-0 text-gray-600 dark:text-gray-300">Rating:</span>
          <select
            value={rating}
            onChange={(e) => onRatingChange(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 lg:px-3 lg:py-1.5 text-xs lg:text-sm bg-white dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] outline-none focus:border-brand-main cursor-pointer w-full sm:w-auto"
          >
            <option value="all">Highest Rated</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs lg:text-sm text-black-main-text dark:text-[#E2E8F0] flex-1 sm:flex-none">
          <span className="font-medium whitespace-nowrap pl-1 sm:pl-0 text-gray-600 dark:text-gray-300">Location:</span>
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 lg:px-3 lg:py-1.5 text-xs lg:text-sm bg-white dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] outline-none focus:border-brand-main cursor-pointer w-full sm:w-auto"
          >
            {locations.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs lg:text-sm text-black-main-text dark:text-[#E2E8F0] flex-1 sm:flex-none">
          <span className="font-medium whitespace-nowrap pl-1 sm:pl-0 text-gray-600 dark:text-gray-300">Price Range:</span>
          <select
            value={priceRange}
            onChange={(e) => onPriceRangeChange(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 lg:px-3 lg:py-1.5 text-xs lg:text-sm bg-white dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] outline-none focus:border-brand-main cursor-pointer w-full sm:w-auto"
          >
            {priceRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
};

export default DoctorFilters;
