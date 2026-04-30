import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineArrowUturnLeft,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineExclamationTriangle,
  HiOutlineHandThumbUp,
  HiOutlineTrash,
} from 'react-icons/hi2';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import Toast from '../../../../../components/Toast/Toast';
import { applyStoriesSeo } from '../shared/seo';
import { getAllCommentsAdmin } from '../../../../../services/storyService';
import { deleteCommentByAdmin } from '../../../../../services/adminService';
import { resolveFileUrl } from '../../../../../utils/api';

const mapComment = (comment, isReply = false) => ({
  id: comment.id,
  author: comment.commenterName || comment.author || 'Unknown',
  role: comment.commenterRole || comment.role || '',
  avatar: resolveFileUrl(comment.commenterAvatar || comment.avatar || ''),
  time: comment.timeAgo || comment.time || '',
  text: comment.content || comment.text || '',
  likes: comment.likesCount ?? comment.likes ?? 0,
  replies: comment.repliesCount ?? comment.replies?.length ?? 0,
  flagged: Boolean(comment.isFlagged ?? comment.flagged),
  isReply,
});

const flattenComments = (comments = []) => {
  const flat = [];

  comments.forEach((topLevelComment) => {
    flat.push(mapComment(topLevelComment, false));

    if (Array.isArray(topLevelComment.replies)) {
      topLevelComment.replies.forEach((reply) => {
        flat.push(mapComment(reply, true));
      });
    }
  });

  return flat;
};

export default function StoryAllCommentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = Number(searchParams.get('highlight')) || null;
  const highlightRef = useRef(null);

  const [storyTitle, setStoryTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, commentId: null });
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await getAllCommentsAdmin(Number(id));
      const payload = response?.data || response || {};
      const flatComments = flattenComments(payload.comments || []);

      setStoryTitle(payload.storyTitle || 'Patient Story');
      setComments(flatComments);
      setTotalComments(payload.totalComments ?? flatComments.length);
    } catch (err) {
      setStoryTitle('Patient Story');
      setComments([]);
      setTotalComments(0);
      setLoadError(err?.response?.data?.message || err?.message || 'Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (!isLoading && highlightId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [isLoading, highlightId]);

  useEffect(() => {
    const pageTitle = storyTitle
      ? `Comments on ${storyTitle} | PulseX Admin`
      : 'Story Comments | PulseX Admin';
    const description = storyTitle
      ? `Review and moderate comments for the story ${storyTitle}.`
      : 'Review and moderate all comments related to patient stories in the admin panel.';

    applyStoriesSeo({
      title: pageTitle,
      description,
      keywords: 'PulseX story comments, comments moderation, admin comments',
    });
  }, [storyTitle]);

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => setToast((current) => ({ ...current, visible: false })), 3000);
  };

  const handleDeleteClick = (commentId) => {
    setDeleteModal({ open: true, commentId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCommentByAdmin(
        deleteModal.commentId,
        'Removed by admin from story comments moderation.'
      );

      setDeleteModal({ open: false, commentId: null });
      await loadComments();
      showToast('Comment Deleted', 'The comment has been removed successfully.');
    } catch (err) {
      setDeleteModal({ open: false, commentId: null });
      showToast('Delete Failed', err?.response?.data?.message || err?.message || 'Operation failed');
    }
  };

  if (isLoading) {
    return (
      <main className="h-full" aria-label="Story comments page">
        <section className="flex flex-col items-center justify-center gap-4 p-5 py-20">
          <h1 className="text-[18px] font-semibold text-black-main-text dark:text-[#E2E8F0]">Loading comments...</h1>
        </section>
      </main>
    );
  }

  if (loadError && comments.length === 0) {
    return (
      <main className="h-full" aria-label="Story comments page">
        <section className="flex flex-col items-center justify-center gap-4 p-5 py-20">
          <h1 className="text-[18px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{loadError}</h1>
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

  return (
    <main className="h-full" aria-label="Story comments page">
      <section className="flex flex-col gap-6 p-6" aria-labelledby="story-comments-title">
        <Toast
          visible={toast.visible}
          title={toast.title}
          message={toast.message}
          type="success"
          onClose={() => setToast((current) => ({ ...current, visible: false }))}
        />

        <ConfirmModal
          isOpen={deleteModal.open}
          title="Delete Comment?"
          desc="Are you sure you want to delete this comment? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, commentId: null })}
        />

        <button
          onClick={() => navigate(`/admin/stories/${id}`)}
          className="cursor-pointer self-start flex items-center gap-2 px-4 text-[14px] font-semibold text-[#4A5565] dark:text-gray-300 hover:text-black-main-text dark:hover:text-[#E2E8F0] transition-colors"
        >
          <HiArrowLeft /> Back to Story
        </button>

        <header className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5 text-black-main-text dark:text-[#E2E8F0]">
            <HiOutlineChatBubbleOvalLeft className="text-[22px]" />
            <h1 id="story-comments-title" className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">
              All Comments
            </h1>
          </div>
          <p className="text-[18px] text-gray-text-dim2">
            {totalComments} comments on &ldquo;{storyTitle}&rdquo;
          </p>
        </header>

        <ul className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Story comments list">
          {comments.length === 0 ? (
            <li className="py-12 text-center text-[14px] text-gray-400">No comments yet.</li>
          ) : (
            comments.map((comment) => {
              const isHighlighted = comment.id === highlightId;
              return (
              <li
                key={comment.id}
                ref={isHighlighted ? highlightRef : null}
                className={`overflow-hidden rounded-[14px] border p-4 transition-all ${
                  isHighlighted
                    ? 'border-[#155DFC] dark:border-blue-500 bg-[#EFF6FF] dark:bg-blue-900/20 ring-2 ring-[#155DFC]/30'
                    : comment.flagged
                    ? 'border-[#FFA2A2] dark:border-red-800 bg-white dark:bg-[#111827]'
                    : 'border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]'
                }`}
              >
                {isHighlighted ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-[#155DFC]/30 bg-[#155DFC] px-4 py-2 mb-3 text-center text-[13px] font-semibold text-white sm:flex-row sm:text-left">
                    <HiOutlineExclamationTriangle className="shrink-0 text-[15px]" />
                    <span>Reported Comment — This is the content flagged in the report</span>
                  </div>
                ) : comment.flagged ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#FFA2A2] dark:border-red-800 bg-[#FFE2E2] dark:bg-red-900/20 px-4 py-2 text-center text-[14px] font-semibold text-[#C10007] dark:text-red-300 sm:flex-row sm:text-left">
                    <HiOutlineExclamationTriangle className="shrink-0 text-[15px]" />
                    <span>Flagged for Review - Potentially Inappropriate Content</span>
                  </div>
                ) : null}

                <article className="flex flex-col items-center gap-3 p-4 sm:flex-row sm:items-start">
                  {comment.avatar ? (
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="h-9 w-9 shrink-0 rounded-full border border-gray-100 dark:border-gray-800 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-main to-[#9810fa] text-[16px] font-bold text-white">
                      {comment.author[0]}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-2xl border-none p-2 text-center sm:items-start sm:text-left">
                    <header className="flex w-full flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <span className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{comment.author}</span>
                        {comment.isReply ? (
                          <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[12px] font-semibold text-[#333CF5] dark:bg-[#1E3A8A]/40 dark:text-[#93C5FD]">
                            Reply
                          </span>
                        ) : null}
                        {comment.role ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${comment.role === 'Doctor'
                                ? 'bg-[#DBEAFE] dark:bg-[#1E3A8A]/35 text-brand-main dark:text-[#93C5FD]'
                                : 'bg-[#F3F4F6] dark:bg-gray-700/40 text-[#364153] dark:text-gray-300'
                              }`}
                          >
                            {comment.role}
                          </span>
                        ) : null}
                      </div>

                      <button
                        onClick={() => handleDeleteClick(comment.id)}
                        title="Delete comment"
                        className="h-7 w-7 cursor-pointer flex items-center justify-center rounded-[7px] text-[#E7000B] transition-colors hover:bg-red-100 shrink-0"
                      >
                        <HiOutlineTrash className="text-[20px]" />
                      </button>
                    </header>

                    <div className="flex w-full items-center justify-center gap-1 text-[14px] text-[#6A7282] sm:justify-start">
                      <span>📅</span>
                      {comment.time}
                    </div>

                    <p className="text-[14px] leading-relaxed text-[#364153] dark:text-gray-300">{comment.text}</p>

                    <footer className="mt-1 flex w-full items-center justify-center gap-4 sm:justify-start">
                      <span className="flex items-center gap-1.5 text-[14px] text-[#4A5565] dark:text-gray-400">
                        <HiOutlineHandThumbUp className="text-[14px]" />
                        {comment.likes}
                      </span>
                      <span className="flex items-center gap-1.5 text-[14px] text-[#4A5565] dark:text-gray-400">
                        <HiOutlineArrowUturnLeft className="text-[14px]" />
                        {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
                      </span>
                    </footer>
                  </div>
                </article>
              </li>
              );
            })
          )}
        </ul>
      </section>
    </main>
  );
}
