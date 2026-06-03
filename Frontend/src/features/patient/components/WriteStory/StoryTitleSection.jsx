const StoryTitleSection = ({ title, setTitle, errors, setErrors }) => {
  return (
    <article className="flex flex-col gap-2">
      <h2 className="sr-only">Story Title</h2>
      <label className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0]">
        Story Title <span className="text-[var(--ws-danger)]">*</span>
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setErrors((er) => ({ ...er, title: '' })); }}
        placeholder="Give your story a compelling title..."
        className={`w-full px-4 py-3 rounded-xl border text-[16px] outline-none transition bg-white dark:bg-[#0B1120] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 ${errors.title ? 'border-[var(--ws-danger)]' : 'border-[var(--ws-border)] dark:border-gray-700 focus:border-brand-main'}`}
      />
      {errors.title && <p className="text-xs text-[var(--ws-danger)]">{errors.title}</p>}
    </article>
  );
};

export default StoryTitleSection;
