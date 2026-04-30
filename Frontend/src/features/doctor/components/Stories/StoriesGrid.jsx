import { HiOutlineArrowRight } from 'react-icons/hi';

const StoriesGrid = ({ stories, onReadStory }) => {
  return (
    <section className="flex flex-wrap gap-6" aria-label="Stories">
      {stories.map((story) => (
        <article
          key={story.id}
          className="w-full lg:flex-[1_1_calc(50%-12px)] lg:max-w-[calc(50%-12px)] bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none hover:-translate-y-1 hover:border-brand-main transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-6">
            <img src={story.img} alt={story.author} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h4 className="text-[14px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{story.author}</h4>
              <span className="text-[12px] text-gray-400">{story.date}</span>
            </div>
          </div>

          <h3 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0] leading-snug mb-3">{story.title}</h3>

          <p className="text-[13px] text-gray-500 leading-relaxed mb-6 line-clamp-3">
            "Last year, my heart health was at a critical point. Thanks to the right care and community support, I transformed my life..."
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 mt-4 sm:mt-0">
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-4 py-1 rounded-full text-[11px] font-medium ${
                    tag === 'Lifestyle' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-brand-main'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              className="flex items-center cursor-pointer gap-2 text-[12px] font-semibold text-brand-main hover:gap-3 transition-all"
              onClick={() => onReadStory(story.id)}
            >
              Read Story <HiOutlineArrowRight />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

export default StoriesGrid;
