import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const DoctorPagination = ({ safePage, totalPages, pageNums, onGoTo }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Pagination">
      <button
        onClick={() => onGoTo(safePage - 1)}
        disabled={safePage === 1}
        className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-gray-500 hover:border-brand-main hover:text-brand-main disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <HiChevronLeft />
      </button>

      {pageNums.map((n) => (
        <button
          key={n}
          onClick={() => onGoTo(n)}
          className={`w-8 h-8 rounded-full text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed
            ${safePage === n
              ? 'bg-brand-main text-white shadow'
              : 'bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-main hover:text-brand-main'}`}
          aria-current={safePage === n ? 'page' : undefined}
        >
          {n}
        </button>
      ))}

      <button
        onClick={() => onGoTo(safePage + 1)}
        disabled={safePage === totalPages}
        className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-gray-500 hover:border-brand-main hover:text-brand-main disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <HiChevronRight />
      </button>
    </nav>
  );
};

export default DoctorPagination;
