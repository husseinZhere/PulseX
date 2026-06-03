import {
  LuBookOpen,
  LuTrash2,
  LuThumbsUp,
  LuMessageCircle,
  LuCalendarDays,
  LuImage,
} from 'react-icons/lu';

const StoriesSection = ({ stories, navigate, setDeleteTarget }) => {
  return (
    <article className="bg-white dark:bg-[#111827] rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] dark:from-[#052E1F]/45 dark:to-[#064E3B]/40 border-b border-transparent dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <LuBookOpen size={18} className="text-[#00A63E]" />
          <h2 id="settings-stories-heading" className="text-black-main-text dark:text-[#E2E8F0] text-[18px] font-bold">My Published Stories</h2>
        </div>
        <span className="text-xs font-bold text-[#008236] dark:text-[#A7F3D0] bg-[#DCFCE7] dark:bg-[#14532D] px-3 py-1 rounded-full">
          {stories.length} Published
        </span>
      </div>

      <div className="p-4 sm:p-6">
        {stories.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <LuBookOpen size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No published stories yet</p>
            <p className="text-xs mt-1">Write your first story to share with the community.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {stories.map(story => (
              <article
                key={story.id}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                {story.image ? (
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-40 sm:w-32 sm:h-24 rounded-xl object-cover shrink-0 cursor-pointer"
                    onClick={() => navigate(`/patient/stories/${story.id}`, { state: { from: 'settings' } })}
                  />
                ) : (
                  <div
                    className="w-full h-40 sm:w-32 sm:h-24 rounded-xl shrink-0 cursor-pointer bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                    onClick={() => navigate(`/patient/stories/${story.id}`, { state: { from: 'settings' } })}
                  >
                    <LuImage size={28} className="text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="font-bold text-black-main-text dark:text-[#E2E8F0] text-lg sm:text-base cursor-pointer hover:text-brand-main transition-colors line-clamp-1"
                      onClick={() => navigate(`/patient/stories/${story.id}`, { state: { from: 'settings' } })}
                    >
                      {story.title}
                    </h3>

                    <button
                      onClick={() => setDeleteTarget(story.id)}
                      className="text-[#E7000B] cursor-pointer hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all h-fit shrink-0"
                      title="Delete story"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                    {story.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DBEAFE] dark:bg-[#1E3A8A]/40 text-[#155DFC] dark:text-[#BFDBFE] border border-blue-100 dark:border-[#2563EB]/35"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-[#4A5565] dark:text-gray-400 line-clamp-2 mb-2">{story.excerpt}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 sm:gap-3 text-[14px] text-[#4A5565] dark:text-gray-400">
                    <span className="flex items-center gap-1 min-w-0">
                      <LuCalendarDays size={12} /> {story.date}
                    </span>
                    <span className="flex items-center gap-1 min-w-0">
                      <LuThumbsUp size={12} /> {story.likes}
                    </span>
                    <span className="flex items-center gap-1 min-w-0">
                      <LuMessageCircle size={12} /> {story.comments}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate('/patient/write-story')}
            className="bg-brand-main cursor-pointer hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-colors text-sm w-full sm:w-auto"
          >
            + Write Story
          </button>
        </div>
      </div>
    </article>
  );
};

export default StoriesSection;
