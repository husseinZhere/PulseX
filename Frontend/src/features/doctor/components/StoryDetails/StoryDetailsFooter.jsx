const StoryDetailsFooter = ({ onBack }) => {
  return (
    <footer className="flex flex-col sm:flex-row justify-end gap-3 py-2">
      <button
        onClick={onBack}
        className="w-full sm:w-auto px-6 py-2.5 cursor-pointer rounded-full border border-gray-300 text-sm font-semibold text-black-main-text dark:text-[#E2E8F0] bg-white dark:bg-[#111827] hover:bg-gray-50 dark:bg-[#111827] transition"
      >
        Back to Stories
      </button>
    </footer>
  );
};

export default StoryDetailsFooter;
