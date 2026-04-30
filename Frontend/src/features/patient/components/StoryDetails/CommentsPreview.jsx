import Avatar from './Avatar';

const CommentsPreview = ({ comments, totalCount, onViewAll }) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4" aria-label="Comments preview">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-black-main-text dark:text-[#E2E8F0]">Comments ({totalCount})</h3>
        <button
          onClick={onViewAll}
          className="text-xs cursor-pointer font-semibold text-brand-main hover:underline flex items-center gap-1"
        >
          View All <span>›</span>
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {comments.map((c) => (
          <article key={c.id} className="flex items-start gap-3 bg-[#F9FAFB] dark:bg-[#0F172A] rounded-xl p-3 border border-transparent dark:border-gray-700">
            <Avatar img={c.avatar} initials={c.initials} size="w-8 h-8" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-black-main-text dark:text-[#E2E8F0]">{c.user}</p>
                <p className="text-xs text-[#6A7282] dark:text-gray-400">{c.time}</p>
              </div>
              <p className="text-xs text-[#364153] dark:text-gray-300 mt-0.5">{c.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CommentsPreview;
