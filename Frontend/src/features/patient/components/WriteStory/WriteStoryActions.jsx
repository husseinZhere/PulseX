const WriteStoryActions = ({ onCancel, onPublish }) => {
  return (
    <footer className="flex justify-end gap-3 pt-2">
      <button
        onClick={onCancel}
        className="px-7 py-2.5  cursor-pointer rounded-full border border-gray-300 text-sm font-semibold text-black-main-text dark:text-[#E2E8F0] bg-white dark:bg-[#111827] hover:bg-gray-50 transition"
      >
        Cancel
      </button>
      <button
        onClick={onPublish}
        className="px-7 py-2.5 rounded-full cursor-pointer bg-brand-main text-white text-sm font-semibold hover:bg-[#2730d4] transition shadow-sm"
      >
        Publish Story
      </button>
    </footer>
  );
};

export default WriteStoryActions;
