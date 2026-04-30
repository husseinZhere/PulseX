import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../../../../components/Toast/Toast';
import AddCommentSection from '../../components/AllComments/AddCommentSection';
import AllCommentsHeader from '../../components/AllComments/AllCommentsHeader';
import CommentsList from '../../components/AllComments/CommentsList';
import ReportModal from '../../components/AllComments/ReportModal';
import {
  addComment,
  getAllComments,
  likeComment,
  replyToComment,
} from '../../../../services/storyService';
import { reportComment } from '../../../../services/reportService';
import { getDoctorSelfProfile } from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { readProfilePhoto } from '../../../../utils/profilePhotoStorage';

const REPORT_CATS = ['Spam', 'Misinformation', 'Hate Speech', 'Harassment', 'Other'];
const normalizeReportCategory = (category) =>
  !category || category === 'select category'
    ? 'Other'
    : category === 'Hate Speech'
      ? 'InappropriateContent'
      : category;

const mapComment = (comment) => {
  const userName = comment.commenterName || comment.user || 'Unknown';
  return {
    id: comment.id,
    user: userName,
    initials: userName.charAt(0).toUpperCase(),
    avatar: resolveFileUrl(comment.commenterAvatar || comment.avatar || ''),
    time: comment.timeAgo || comment.time || '',
    text: comment.content || comment.text || '',
    likes: comment.likesCount ?? comment.likes ?? 0,
    replies: Array.isArray(comment.replies) ? comment.replies.map(mapComment) : [],
  };
};

const updateLikeInTree = (items, targetId, nextLikes) =>
  items.map((item) => {
    if (item.id === targetId) {
      return { ...item, likes: nextLikes };
    }

    if (item.replies?.length) {
      return { ...item, replies: updateLikeInTree(item.replies, targetId, nextLikes) };
    }

    return item;
  });

const addReplyInTree = (items, parentId, reply) =>
  items.map((item) => {
    if (item.id === parentId) {
      return { ...item, replies: [...item.replies, reply] };
    }

    if (item.replies?.length) {
      return { ...item, replies: addReplyInTree(item.replies, parentId, reply) };
    }

    return item;
  });

const DoctorAllComments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const storyId = Number(id);

  const userInitials = (user?.fullName || 'D').charAt(0).toUpperCase();
  const [userAvatar, setUserAvatar] = useState(() => readProfilePhoto('doctor') || '');

  useEffect(() => {
    if (userAvatar) return;
    getDoctorSelfProfile()
      .then((profile) => {
        const pic = profile?.profilePicture;
        if (pic) setUserAvatar(resolveFileUrl(pic));
      })
      .catch(() => {});
  }, [userAvatar]);

  useEffect(() => {
    document.title = 'All Comments | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Read and manage story comments from the doctor workspace.');
    }
  }, []);

  const [storyTitle, setStoryTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [likedIds, setLikedIds] = useState({});
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  const showToast = (title, message) => setToast({ visible: true, title, message });

  useEffect(() => {
    let ignore = false;

    const loadComments = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await getAllComments(storyId);
        const payload = response?.data || response || {};
        const mappedComments = Array.isArray(payload.comments) ? payload.comments.map(mapComment) : [];

        if (ignore) return;

        setStoryTitle(payload.storyTitle || 'Patient Story');
        setComments(mappedComments);
        setCommentsCount(payload.totalComments ?? mappedComments.length);
      } catch (err) {
        if (ignore) return;

        setStoryTitle('Patient Story');
        setComments([]);
        setCommentsCount(0);
        setLoadError(err?.response?.data?.message || err?.message || 'Failed to load comments.');
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    if (Number.isFinite(storyId)) {
      loadComments();
    }

    return () => {
      ignore = true;
    };
  }, [storyId]);

  const handleLike = async (commentId, replyId = null) => {
    const key = replyId ? `${commentId}-${replyId}` : `${commentId}`;
    if (likedIds[key]) return;

    const targetId = replyId || commentId;

    try {
      const response = await likeComment(storyId, targetId);
      const nextLikes = response?.likesCount ?? response?.data?.likesCount;

      setLikedIds((prev) => ({ ...prev, [key]: true }));
      if (typeof nextLikes === 'number') {
        setComments((prev) => updateLikeInTree(prev, targetId, nextLikes));
      }
    } catch (err) {
      showToast('Like Failed', err?.response?.data?.message || err?.message || 'Please try again.');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await addComment(storyId, { content: newComment.trim() });
      const created = response?.data || response;
      const mapped = mapComment(created || {
        id: Date.now(),
        commenterName: user?.fullName || 'You',
        commenterAvatar: null,
        timeAgo: 'Just now',
        content: newComment.trim(),
      });
      if (!mapped.avatar && userAvatar) mapped.avatar = userAvatar;

      setComments((prev) => [mapped, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setNewComment('');
      showToast('Comment Posted', 'Your comment has been added.');
    } catch (err) {
      showToast('Comment Failed', err?.response?.data?.message || err?.message || 'Please try again.');
    }
  };

  const handlePostReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const response = await replyToComment(storyId, commentId, { content: replyText.trim() });
      const created = response?.data || response;
      const mappedReply = mapComment(created || {
        id: Date.now(),
        commenterName: user?.fullName || 'You',
        commenterAvatar: null,
        timeAgo: 'Just now',
        content: replyText.trim(),
      });
      if (!mappedReply.avatar && userAvatar) mappedReply.avatar = userAvatar;

      setComments((prev) => addReplyInTree(prev, commentId, mappedReply));
      setCommentsCount((prev) => prev + 1);
      setReplyText('');
      setReplyingTo(null);
      showToast('Reply Posted', 'Your reply has been added.');
    } catch (err) {
      showToast('Reply Failed', err?.response?.data?.message || err?.message || 'Please try again.');
    }
  };

  if (isLoading) {
    return (
      <main className="w-full flex flex-col gap-5 p-5" style={{ "--comments-muted": "#757575" }}>
        <section className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-[16px] text-gray-500 dark:text-gray-300">
          Loading comments...
        </section>
      </main>
    );
  }

  if (loadError && comments.length === 0) {
    return (
      <main className="w-full flex flex-col gap-5 p-5" style={{ "--comments-muted": "#757575" }}>
        <section className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[16px] text-gray-600 dark:text-gray-300">{loadError}</p>
          <button
            onClick={() => navigate(`/doctor/stories/${id}`)}
            className="mt-4 px-4 py-2 rounded-full bg-brand-main text-white text-sm font-semibold hover:bg-[#2730d4] transition"
          >
            Back to Story
          </button>
        </section>
      </main>
    );
  }

  return (
    <>
      <Toast visible={toast.visible} title={toast.title} message={toast.message} duration={3000}
        onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      {reportTarget && (
        <ReportModal
          onClose={() => setReportTarget(null)}
          onSubmit={async ({ category, reason }) => {
            try {
              await reportComment(reportTarget, {
                category: normalizeReportCategory(category),
                reason: reason?.trim() || 'No details provided.',
              });
              showToast('Report Submitted', 'Thank you for your feedback.');
            } catch (err) {
              showToast('Report Failed', err?.response?.data?.message || 'Please try again.');
            }
          }}
          categories={REPORT_CATS}
        />
      )}

      <main className="w-full flex flex-col gap-5 p-5" style={{ "--comments-muted": "#757575" }}>
        <AllCommentsHeader
          onBack={() => navigate(`/doctor/stories/${id}`)}
          commentsCount={commentsCount}
          storyTitle={storyTitle}
        />

        <aside className="sr-only">
          <p>Full comments thread with replies and reporting actions.</p>
        </aside>

        <AddCommentSection
          newComment={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onPost={handlePostComment}
          userAvatar={userAvatar}
          userInitials={userInitials}
        />

        <CommentsList
          comments={comments}
          likedIds={likedIds}
          replyingTo={replyingTo}
          replyText={replyText}
          onLike={handleLike}
          onReplyToggle={(idValue) => { setReplyingTo(replyingTo === idValue ? null : idValue); setReplyText(''); }}
          onReplyTextChange={(e) => setReplyText(e.target.value)}
          onReplyCancel={() => setReplyingTo(null)}
          onPostReply={handlePostReply}
          onReport={setReportTarget}
          userAvatar={userAvatar}
          userInitials={userInitials}
        />

        <footer className="sr-only">
          <p>End of comments page.</p>
        </footer>
      </main>
    </>
  );
};

export default DoctorAllComments;
