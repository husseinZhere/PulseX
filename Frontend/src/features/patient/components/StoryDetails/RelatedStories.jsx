const RelatedStories = ({ stories, tagCls, onReadStory }) => {
  if (!stories?.length) return null;

  return (
    <section aria-label="Related stories">
      <h3 className="text-base font-bold text-black-main-text dark:text-[#E2E8F0] mb-4">You may also like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stories.map((r) => (
          <article key={r.id} className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div>
                <p className="text-xs font-semibold text-black-main-text dark:text-[#E2E8F0]">{r.author}</p>
                <p className="text-xs text-[#6B7280] dark:text-gray-400">{r.date}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0] leading-snug">{r.title}</p>
            <div className="flex flex-wrap gap-1">
              {r.tags.map((t) => (
                <span key={t} className={`px-2 py-0.5 rounded-full text-xs border ${tagCls(t)}`}>{t}</span>
              ))}
            </div>
            <button onClick={() => onReadStory(r.id)} className="text-xs font-semibold cursor-pointer text-brand-main hover:underline text-left mt-auto">
              Read Story →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RelatedStories;
