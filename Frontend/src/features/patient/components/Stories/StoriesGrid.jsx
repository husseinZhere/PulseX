import { HiOutlineArrowRight } from 'react-icons/hi';
import { LuBookOpen, LuPencil } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const StoriesGrid = ({ stories, onReadStory }) => {
  const navigate = useNavigate();

  if (!stories || stories.length === 0) {
    return (
      <section className="w-full flex-1 min-h-[350px] bg-white dark:bg-[#111827] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center p-8 text-center mt-6 transition-all animate-fade-in">
        <div className="w-[88px] h-[88px] bg-[#EEF2FF] dark:bg-[#1E293B] rounded-full flex items-center justify-center mb-6 text-brand-main shadow-inner relative">
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-brand-main"></div>
          <LuBookOpen className="text-[40px] relative z-10" />
        </div>
        <h3 className="text-[22px] font-bold text-black-main-text dark:text-[#E2E8F0] mb-3">No Stories Yet</h3>
        <p className="text-[15px] text-gray-500 dark:text-gray-400 max-w-[380px] mx-auto leading-relaxed mb-8">
          Be the first to share your health journey. Your story could inspire, motivate, and give hope to others in the PulseX community.
        </p>
        <button
          onClick={() => navigate('/patient/write-story')}
          className="flex items-center gap-2 bg-brand-main text-white px-8 py-[14px] rounded-2xl font-bold text-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(51,60,245,0.4)] active:scale-95 group"
        >
          <LuPencil className="text-[18px] group-hover:rotate-12 transition-transform duration-300" />
          Write the First Story
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-wrap gap-6" aria-label="Stories">
      {stories.map((story) => (
        <article
          key={story.id}
          className="w-full lg:flex-[1_1_calc(50%-12px)] lg:max-w-[calc(50%-12px)] bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 hover:border-brand-main transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-6">
            {story.img ? (
              <img src={story.img} alt={story.author} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#EEF2FF] dark:bg-[#1E293B] text-brand-main dark:text-[#93C5FD] text-[16px] font-bold flex items-center justify-center">
                {story.author?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div>
              <h4 className="text-[14px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{story.author}</h4>
              <span className="text-[12px] text-gray-400 dark:text-gray-500">{story.date}</span>
            </div>
          </div>

          <h3 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0] leading-snug mb-3">{story.title}</h3>

          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
            {story.excerpt || 'Read this patient story and discover the full journey.'}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 mt-4 sm:mt-0">
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-4 py-1 rounded-full text-[11px] font-medium ${tag === 'Lifestyle' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-brand-main'
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
