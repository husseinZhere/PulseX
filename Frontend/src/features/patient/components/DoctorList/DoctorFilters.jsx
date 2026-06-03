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
    <section
      className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 mb-6 bg-[#F1F2F5] dark:bg-[#0F172A] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
      aria-label="Doctor filters"
    >
      {/* Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Rating:</span>
          <select
            value={rating}
            onChange={(e) => onRatingChange(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] outline-none focus:border-brand-main cursor-pointer"
          >
            <option value="all">Highest Rated</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Location:</span>
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] outline-none focus:border-brand-main cursor-pointer max-w-[200px]"
          >
            {locations.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Price Range:</span>
          <select
            value={priceRange}
            onChange={(e) => onPriceRangeChange(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-[#111827] text-black-main-text dark:text-[#E2E8F0] outline-none focus:border-brand-main cursor-pointer"
          >
            {priceRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Search — always at the end */}
      <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 bg-white dark:bg-[#111827] shadow-sm w-full sm:w-auto">
        <HiSearch className="text-gray-400 dark:text-gray-500 shrink-0" aria-label="Search" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name"
          className="text-sm outline-none bg-transparent text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 w-full sm:w-40"
        />
      </div>
    </section>
  );
};

export default DoctorFilters;
