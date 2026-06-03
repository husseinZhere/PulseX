import { HiOutlinePencilAlt } from 'react-icons/hi';

const StoryDetailsFooter = ({ onBack, onWriteStory, backLabel = 'Back to Stories' }) => {
  return (
    <footer className="flex flex-col sm:flex-row justify-end gap-3 py-2">
      <button
        onClick={onBack}
        className="w-full sm:w-auto px-6 py-2.5 cursor-pointer rounded-full border border-gray-300 text-sm font-semibold text-black-main-text dark:text-[#E2E8F0] bg-white dark:bg-[#111827] hover:bg-gray-50 transition"
      >
        {backLabel}
      </button>
      <button
        onClick={onWriteStory}
        className="w-full sm:w-auto flex items-center justify-center cursor-pointer gap-1.5 px-6 py-2.5 rounded-full bg-brand-main text-white text-sm font-semibold hover:bg-[#2730d4] transition"
      >
        <HiOutlinePencilAlt /> Write Story
      </button>
    </footer>
  );
};

export default StoryDetailsFooter;
