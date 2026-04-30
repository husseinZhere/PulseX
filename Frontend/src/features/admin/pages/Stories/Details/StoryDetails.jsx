import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineHeart,
  HiOutlineShare,
  HiOutlineTrash,
} from 'react-icons/hi2';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import Toast from '../../../../../components/Toast/Toast';
import { applyStoriesSeo } from '../shared/seo';
import {
  deleteStoryAdmin,
  getStoryDetail,
  hideStoryAdmin,
} from '../../../../../services/storyService';
import { resolveFileUrl } from '../../../../../utils/api';

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const toStoryStatus = (story) => {
  const explicitStatus = String(story?.status || '').toLowerCase();
  const isHidden = Boolean(story?.isHidden ?? story?.IsHidden);
  const isPublished = Boolean(story?.isPublished ?? story?.IsPublished ?? true);

  if (explicitStatus === 'deleted') return 'Deleted';
  if (isHidden || explicitStatus === 'hidden') return 'Hidden';
  if (!isPublished) return 'Deleted';
  return 'Published';
};

const mapComment = (comment) => ({
  id: comment.id,
  author: comment.commenterName || comment.author || 'Unknown',
  role: comment.commenterRole || comment.role || null,
  avatar: resolveFileUrl(comment.commenterAvatar || comment.avatar || ''),
  time: comment.timeAgo || comment.time || '',
  text: comment.content || comment.text || '',
  likes: comment.likesCount ?? comment.likes ?? 0,
  replies: comment.repliesCount ?? comment.replies ?? 0,
  flagged: Boolean(comment.isFlagged ?? comment.flagged),
});

const mapStory = (rawStory) => ({
  id: rawStory.id ?? rawStory.storyId,
  title: rawStory.title || 'Untitled',
  desc: rawStory.snippet || rawStory.contentPreview || '',
  content: rawStory.content || '',
  author: rawStory.patientName || rawStory.authorName || rawStory.author || 'Anonymous',
  avatar: resolveFileUrl(rawStory.patientAvatar || rawStory.authorAvatar || rawStory.avatar || ''),
  date: rawStory.publishedAt
    ? new Date(rawStory.publishedAt).toLocaleDateString('en-US')
    : (rawStory.publishedAtFormatted || (rawStory.createdAt ? new Date(rawStory.createdAt).toLocaleDateString('en-US') : '')),
  status: toStoryStatus(rawStory),
  tags: normalizeTags(rawStory.tags),
  likes: rawStory.likesCount ?? rawStory.likes ?? 0,
  shares: rawStory.sharesCount ?? rawStory.shares ?? 0,
  commentsCount: rawStory.commentsCount ?? 0,
  coverFull: resolveFileUrl(rawStory.imageUrl || rawStory.coverImage || rawStory.coverFull || ''),
  comments: Array.isArray(rawStory.comments) ? rawStory.comments.map(mapComment) : [],
});

export default function StoryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [hideModal, setHideModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    let ignore = false;

    const loadStory = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await getStoryDetail(Number(id));
        const payload = response?.data || response;
        if (!ignore) {
          setStory(mapStory(payload || {}));
        }
      } catch (err) {
        if (!ignore) {
          setStory(null);
          setLoadError(err?.response?.data?.message || err?.message || 'Story not found.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      loadStory();
    }

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    const pageTitle = story ? `${story.title} | Story Details | PulseX Admin` : 'Story Details | PulseX Admin';
    const description = story
      ? `Review and moderate the patient story titled ${story.title}, including engagement and comments.`
      : 'Review a full patient story, moderation status, engagement, and comments from the admin panel.';

    applyStoriesSeo({
      title: pageTitle,
      description,
      keywords: 'PulseX story details, story moderation, admin story review',
    });
  }, [story]);

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => setToast((current) => ({ ...current, visible: false })), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!story) return;

    try {
      await deleteStoryAdmin(story.id);
      setDeleteModal(false);
      showToast('Story Deleted Successfully', 'Your changes have been saved successfully.');
      setTimeout(() => navigate('/admin/stories/list'), 1200);
    } catch (err) {
      setDeleteModal(false);
      showToast('Delete Failed', err?.response?.data?.message || err?.message || 'Operation failed');
    }
  };

  const handleHideConfirm = async () => {
    if (!story) return;

    try {
      const response = await hideStoryAdmin(story.id);
      const apiStory = response?.data || response;
      const nextStatus = apiStory ? toStoryStatus(apiStory) : (story.status === 'Hidden' ? 'Published' : 'Hidden');

      setStory((previous) => (previous ? { ...previous, status: nextStatus } : previous));
      setHideModal(false);
      showToast(
        nextStatus === 'Hidden' ? 'Story Hidden Successfully' : 'Story Unhidden Successfully',
        'Your changes have been saved successfully.'
      );
    } catch (err) {
      setHideModal(false);
      showToast('Action Failed', err?.response?.data?.message || err?.message || 'Operation failed');
    }
  };

  if (isLoading) {
    return (
      <main className="h-full" aria-label="Story details page">
        <section className="flex flex-col items-center justify-center gap-4 px-4 py-20 sm:px-6">
          <h1 className="text-[18px] font-semibold text-black-main-text dark:text-[#E2E8F0]">Loading story details...</h1>
        </section>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="h-full" aria-label="Story details page">
        <section className="flex flex-col items-center justify-center gap-4 px-4 py-20 sm:px-6">
          <h1 className="text-[18px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{loadError || 'Story not found.'}</h1>
          <button
            onClick={() => navigate('/admin/stories/list')}
            className="cursor-pointer flex items-center gap-2 rounded-[10px] bg-[#EFF6FF] dark:bg-[#1E3A8A]/35 px-4 py-2 text-[13px] font-semibold text-[#155dfc] dark:text-[#93C5FD] transition-colors hover:bg-[#dbeafe] dark:hover:bg-[#1E3A8A]/55"
          >
            <HiArrowLeft /> Back to Stories
          </button>
        </section>
      </main>
    );
  }

  const previewComments = story.comments.slice(0, 2);
  const totalComments = story.commentsCount;

  const statusClass =
    story.status === 'Published'
      ? 'bg-[#DCFCE7] text-[#059669]'
      : story.status === 'Hidden'
        ? 'bg-[#FEF9C3] text-[#CA8A04]'
        : 'bg-red-100 text-red-600';

  return (
    <main className="h-full" aria-label="Story details page">
      <section className="flex flex-col gap-6 p-4 sm:p-5 lg:p-6" aria-labelledby="story-details-title">
        <Toast
          visible={toast.visible}
          title={toast.title}
          message={toast.message}
          type="success"
          onClose={() => setToast((current) => ({ ...current, visible: false }))}
        />

        <ConfirmModal
          isOpen={deleteModal}
          title="Delete Story?"
          desc="Are you sure you want to delete this story? This action is permanent and cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal(false)}
        />

        <ConfirmModal
          isOpen={hideModal}
          title={story.status === 'Hidden' ? 'Unhide Story?' : 'Hide Story?'}
          desc={
            story.status === 'Hidden'
              ? 'This story will become visible to the public again.'
              : 'This story will be hidden from public view.'
          }
          onConfirm={handleHideConfirm}
          onCancel={() => setHideModal(false)}
        />

        <header className="flex flex-col gap-0.5">
          <h1 id="story-details-title" className="flex items-center gap-2 text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">
            <span aria-hidden="true">📖</span>
            Patient Story Details
          </h1>
          <p className="text-[18px] text-gray-text-dim2">Read full patient journey and shared experiences.</p>
        </header>

        <article className="flex flex-col items-start gap-4 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-[0px_2px_3px_0px_rgba(0,0,0,0.10)] outline-1 -outline-offset-1 outline-gray-100 dark:outline-gray-700 sm:flex-row sm:p-5">
          {story.avatar ? (
            <img
              src={story.avatar}
              alt={story.author}
              className="h-14 w-14 shrink-0 rounded-full border-2 border-white dark:border-gray-800 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#EEF2FF] text-[18px] font-bold text-[#333CF5] shadow-sm dark:border-gray-800 dark:bg-[#1E293B] dark:text-[#93C5FD]">
              {story.author?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-bold text-black-main-text dark:text-[#E2E8F0]">{story.author}</h2>
            <p className="mt-0.5 text-[14px] text-gray-text-dim2">Shared publicly to inspire other patients</p>
            <p className="mt-0.5 text-[14px] text-gray-600 dark:text-gray-300">{story.date}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(story.tags?.length ? story.tags : ['Success Story', 'Lifestyle', 'Health']).map((tagValue, index) => (
                <span
                  key={tagValue}
                  className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${index === 0
                      ? 'bg-[#DCFCE7] text-[#059669]'
                      : index === 1
                        ? 'bg-[#EFF6FF] text-[#155dfc] dark:bg-[#1E3A8A]/35 dark:text-[#93C5FD]'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                >
                  {tagValue}
                </span>
              ))}
            </div>
          </div>
          <span className={`self-start rounded-full px-2.5 py-1 text-[12px] font-bold sm:self-auto ${statusClass}`}>
            {story.status}
          </span>
        </article>

        <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827] p-4 sm:p-5 lg:p-6" aria-labelledby="story-content-title">
          <h2 id="story-content-title" className="text-[30px] font-bold leading-snug text-black-main-text dark:text-[#E2E8F0]">
            {story.title}
          </h2>
          <div className="flex flex-col gap-3">
            {(story.content || story.desc || '').split('\n\n').map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={`${story.id}-paragraph-${index}`} className="text-[16px] leading-relaxed text-gray-600 dark:text-gray-300">
                  {paragraph.trim()}
                </p>
              ) : null
            )}
          </div>
          {story.coverFull ? (
            <img
              src={story.coverFull}
              alt={story.title}
              className="mt-2 max-h-90 w-full rounded-xl object-cover"
            />
          ) : null}
        </article>

        <section className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:gap-6 sm:px-5" aria-label="Story engagement summary">
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-900/20 p-1.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300">
            <HiOutlineHeart className="rounded-full text-[18px] text-red-700" />
            <span>{story.likes}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-1.5 text-[13px] font-semibold text-blue-600 dark:text-blue-300">
            <HiOutlineChatBubbleOvalLeft className="text-[18px]" />
            <span>{totalComments}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-600 dark:text-gray-300">
            <HiOutlineShare className="text-[18px]" />
            <span>{story.shares}</span>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827] p-4 sm:p-5" aria-label="Story comments preview">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0]">Comments ({totalComments})</h3>
            <button
              onClick={() => navigate(`/admin/stories/${id}/comments`)}
              className="cursor-pointer text-[12px] font-semibold text-[#155dfc] hover:underline"
            >
              View All {'->'}
            </button>
          </header>

          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {previewComments.length === 0 ? (
              <li className="text-[16px] text-gray-400">No comments yet.</li>
            ) : (
              previewComments.map((comment) => (
                <li
                  key={comment.id}
                  className="last:border-0 flex items-start gap-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] p-4 outline-[0.80px] outline-offset-[-0.80px] outline-gray-200 dark:outline-gray-700 sm:p-5"
                >
                  {comment.avatar ? (
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="h-8 w-8 shrink-0 rounded-full border border-gray-100 dark:border-gray-800 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-main to-[#9810fa] text-[16px] font-bold text-white">
                      {comment.author[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{comment.author}</span>
                      <span className="text-[12px] text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-[14px] leading-relaxed text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <footer className="flex flex-col items-stretch justify-between gap-3 rounded-3xl bg-white dark:bg-[#111827] p-4 pt-2 shadow-[0px_2px_3px_0px_rgba(0,0,0,0.10)] outline-1 -outline-offset-1 outline-gray-100 dark:outline-gray-700 sm:flex-row sm:items-center sm:p-5">
          <button
            onClick={() => navigate('/admin/stories/list')}
            className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 text-[14px] font-semibold text-black-main-text dark:text-[#E2E8F0] sm:justify-start"
          >
            <HiArrowLeft /> Back to Stories
          </button>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => setHideModal(true)}
              disabled={story.status === 'Deleted'}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-200 dark:bg-[#1E293B] px-4 py-2 text-[14px] font-semibold text-black-main-text dark:text-[#E2E8F0] transition-colors hover:bg-gray-300 dark:hover:bg-[#334155] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {story.status === 'Hidden' ? (
                <>
                  <HiOutlineEye /> Unhide Story
                </>
              ) : (
                <>
                  <HiOutlineEyeSlash /> Hide Story
                </>
              )}
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              disabled={story.status === 'Deleted'}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-red-700 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiOutlineTrash /> Delete Story
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
