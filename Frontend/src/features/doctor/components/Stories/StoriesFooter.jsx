import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const StoriesFooter = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
}) => {
  return (
    <footer className="mt-8 md:mt-12 flex flex-col-reverse md:flex-row justify-between items-center gap-6 py-5 relative">
      <div className="flex items-center flex-wrap justify-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
        <button
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] flex items-center justify-center transition-colors cursor-pointer hover:border-brand-main disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onPrev}
          disabled={currentPage === 1}
        >
          <HiOutlineChevronLeft />
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            className={`cursor-pointer w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center text-[13px] font-semibold transition-colors ${
              currentPage === i + 1
                ? 'bg-brand-main text-white border-brand-main'
                : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700 text-black-main-text dark:text-[#E2E8F0] hover:border-brand-main'
            }`}
            onClick={() => onGoToPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] flex items-center justify-center transition-colors cursor-pointer hover:border-brand-main disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          <HiOutlineChevronRight />
        </button>
      </div>

      <div className="w-full md:w-auto md:ml-auto" aria-hidden="true" />
    </footer>
  );
};

export default StoriesFooter;
