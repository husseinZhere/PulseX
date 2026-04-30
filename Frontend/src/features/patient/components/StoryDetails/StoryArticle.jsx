const StoryArticle = ({ story }) => {
  return (
    <article className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
      <h2 className="text-3xl sm:text-2xl font-bold text-black-main-text dark:text-[#E2E8F0] mb-5">{story.title}</h2>
      <div className="flex flex-col gap-4 text-[16px] text-[#374151] dark:text-gray-300 leading-relaxed">
        {story.content.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
        <img src={story.coverImg} alt="Story cover" className="w-full rounded-xl object-cover max-h-[320px]" />
        {story.content.slice(2).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  );
};

export default StoryArticle;
