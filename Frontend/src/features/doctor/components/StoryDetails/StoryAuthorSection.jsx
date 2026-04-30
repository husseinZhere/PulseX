import Avatar from './Avatar';

const StoryAuthorSection = ({ story, tagCls }) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none" aria-label="Story author">
      <div className="mt-4 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-full sm:w-auto flex justify-center sm:justify-start">
          <Avatar img={story.authorImg} initials={story.author[0]} size="w-14 h-14" />
        </div>
        <div className="w-full text-center sm:text-left">
          <p className="font-semibold text-xl text-black-main-text dark:text-[#E2E8F0]">{story.author}</p>
          <p className="text-sm text-[#6B7280]">Shared publicly with the PulseX community</p>
          <p className="text-sm text-[#4B5563] mt-0.5">{story.date}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {story.categories.map((c) => (
              <span key={c} className={`px-3 py-1 rounded-full text-sm font-medium border ${tagCls(c)}`}>
                {c} <span className="ml-0.5">✓</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryAuthorSection;
