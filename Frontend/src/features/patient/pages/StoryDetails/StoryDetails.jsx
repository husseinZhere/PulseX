import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Toast from '../../../../components/Toast/Toast';
import AddCommentBox from '../../components/StoryDetails/AddCommentBox';
import CommentsPreview from '../../components/StoryDetails/CommentsPreview';
import EngagementBar from '../../components/StoryDetails/EngagementBar';
import RelatedStories from '../../components/StoryDetails/RelatedStories';
import ReportModal from '../../components/StoryDetails/ReportModal';
import StoryArticle from '../../components/StoryDetails/StoryArticle';
import StoryAuthorSection from '../../components/StoryDetails/StoryAuthorSection';
import StoryDetailsFooter from '../../components/StoryDetails/StoryDetailsFooter';
import StoryDetailsHeader from '../../components/StoryDetails/StoryDetailsHeader';
import {
  addComment,
  getStoryDetail,
  likeStory,
  shareStory,
  deleteMyStory,
  getMyStories,
} from '../../../../services/storyService';
import { reportStory as submitStoryReport } from '../../../../services/reportService';
import { resolveFileUrl } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import ConfirmModal from '../../../admin/components/ConfirmModal/ConfirmModal';

const ssGet = (key, id) => { try { return JSON.parse(sessionStorage.getItem(key) || '[]').includes(id); } catch { return false; } };
const ssSet = (key, id) => { try { const a = JSON.parse(sessionStorage.getItem(key) || '[]'); if (!a.includes(id)) { a.push(id); sessionStorage.setItem(key, JSON.stringify(a)); } } catch { /* ignore */ } };
const LIKED_KEY = 'pulsex_liked_stories';
const SHARED_KEY = 'pulsex_shared_stories';

const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
};

const TAG_COLOURS = {
  Lifestyle: 'bg-[#FFF3E0] text-[#F57C00] border-[#FFE0B2]',
  Health: 'bg-[#E8EAF6] text-brand-main border-[#C5CAE9]',
  Fitness: 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
  Recovery: 'bg-[#FCE4EC] text-[#C62828] border-[#FFCDD2]',
  'Mental Health': 'bg-[#F3E5F5] text-[#6A1B9A] border-[#E1BEE7]',
  Wellness: 'bg-[#E0F7FA] text-[#00695C] border-[#B2EBF2]',
  Sleep: 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]',
};

const tagCls = (t) => TAG_COLOURS[t] || 'bg-gray-100 text-gray-600 border-gray-200';
const REPORT_CATS = ['Spam', 'Misinformation', 'Hate Speech', 'Harassment', 'Other'];
const normalizeReportCategory = (category) =>
  !category || category === 'select category'
    ? 'Other'
    : category === 'Hate Speech'
      ? 'InappropriateContent'
      : category;

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

const splitContent = (content) =>
  String(content || '')
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const mapComment = (comment) => {
  const userName = comment.commenterName || comment.user || 'Unknown';
  return {
    id: comment.id,
    user: userName,
    avatar: resolveFileUrl(comment.commenterAvatar || comment.avatar || ''),
    initials: userName.charAt(0).toUpperCase(),
    time: comment.timeAgo || comment.time || '',
    text: comment.content || comment.text || '',
  };
};

const mapStory = (rawStory) => {
  const mappedStory = {
    id: rawStory.id ?? rawStory.storyId,
    author: rawStory.patientName || rawStory.authorName || rawStory.author || 'Anonymous',
    authorImg: resolveFileUrl(rawStory.patientAvatar || rawStory.authorAvatar || rawStory.avatar || ''),
    date: rawStory.publishedAt
      ? new Date(rawStory.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : (rawStory.publishedAtFormatted || (rawStory.createdAt ? new Date(rawStory.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '')),
    categories: normalizeTags(rawStory.tags),
    title: rawStory.title || 'Untitled',
    content: splitContent(rawStory.content || rawStory.snippet || ''),
    coverImg: resolveFileUrl(rawStory.imageUrl || rawStory.coverImage || rawStory.coverImg || ''),
    patientUserId: rawStory.patientUserId ?? rawStory.PatientUserId ?? null,
    likes: rawStory.likesCount ?? rawStory.likes ?? 0,
    commentsCount: rawStory.commentsCount ?? 0,
    shares: rawStory.sharesCount ?? rawStory.shares ?? 0,
    comments: Array.isArray(rawStory.comments) ? rawStory.comments.map(mapComment) : [],
  };

  return {
    story: mappedStory,
    relatedStories: Array.isArray(rawStory.relatedStories)
      ? rawStory.relatedStories.map((relatedStory) => ({
        id: relatedStory.id ?? relatedStory.storyId,
        author: relatedStory.patientName || relatedStory.authorName || relatedStory.author || 'Anonymous',
        date: relatedStory.publishedAt
          ? new Date(relatedStory.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : (relatedStory.publishedAtFormatted || ''),
        title: relatedStory.title || 'Untitled',
        tags: normalizeTags(relatedStory.tags),
      }))
      : [],
  };
};

const PatientStoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // When the user opened this story from their Settings page, "Back" should
  // return there instead of the public Stories feed.
  const cameFromSettings = location.state?.from === 'settings';
  const backTarget = cameFromSettings ? '/patient/settings' : '/patient/stories';

  useEffect(() => {
    document.title = 'Story Details | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Read patient stories in full with comments and related stories.');
    }
  }, []);

  const [story, setStory] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [reportStory, setReportStory] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [myStoryIds, setMyStoryIds] = useState(new Set());

  // Ownership is decided from the patient's own stories list (works without any
  // backend change) and falls back to patientUserId when the API returns it.
  useEffect(() => {
    let ignore = false;
    getMyStories()
      .then((data) => {
        if (ignore) return;
        const list = Array.isArray(data) ? data : (data?.stories ?? []);
        setMyStoryIds(new Set(list.map((s) => Number(s.id))));
      })
      .catch(() => { /* not a patient or no stories → not owner */ });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadStory = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await getStoryDetail(Number(id));
        const payload = response?.data || response || {};
        const mapped = mapStory(payload);

        if (ignore) return;

        setStory(mapped.story);
        setRelatedStories(mapped.relatedStories);
        setComments(mapped.story.comments);
        setCommentsCount(mapped.story.commentsCount);
        setLikesCount(mapped.story.likes);
        setSharesCount(mapped.story.shares);
        setIsLiked(ssGet(LIKED_KEY, mapped.story.id));
        setComment('');
        setReportStory(false);
        setShowCommentBox(false);
      } catch (err) {
        if (ignore) return;

        setStory(null);
        setRelatedStories([]);
        setComments([]);
        setCommentsCount(0);
        setLikesCount(0);
        setSharesCount(0);
        setLoadError(err?.response?.data?.message || err?.message || 'Failed to load story details.');
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

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
  };

  const isOwnStory = !!(
    story && (
      myStoryIds.has(Number(story.id)) ||
      (user?.userId != null && story.patientUserId != null &&
        Number(story.patientUserId) === Number(user.userId))
    )
  );

  const handleDeleteStory = async () => {
    try {
      await deleteMyStory(story.id);
      setShowDeleteConfirm(false);
      navigate(backTarget);
    } catch (err) {
      setShowDeleteConfirm(false);
      showToast('Delete Failed', err?.response?.data?.message || 'Please try again.');
    }
  };

  const handleLike = async () => {
    if (!story || isLiked) return;

    try {
      const response = await likeStory(story.id);
      const nextLikes = response?.likesCount ?? response?.data?.likesCount ?? (likesCount + 1);
      setLikesCount(nextLikes);
      setIsLiked(true);
      ssSet(LIKED_KEY, story.id);
    } catch (err) {
      showToast('Like Failed', err?.response?.data?.message || err?.message || 'Please try again.');
    }
  };

  const handleShare = async () => {
    if (!story) return;

    let copied = false;
    try {
      await copyToClipboard(window.location.href);
      copied = true;
    } catch {
      // ignore
    }

    if (!ssGet(SHARED_KEY, story.id)) {
      try {
        const response = await shareStory(story.id);
        const nextShares = response?.sharesCount ?? response?.data?.sharesCount ?? (sharesCount + 1);
        setSharesCount(nextShares);
        ssSet(SHARED_KEY, story.id);
      } catch {
        // Keep UX smooth even if share tracking fails.
      }
    }

    showToast(copied ? 'Link Copied!' : 'Share', copied ? 'Story link copied to clipboard.' : `Copy this link: ${window.location.href}`);
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;

    if (!story) return;

    try {
      const response = await addComment(story.id, { content: comment.trim() });
      const createdComment = response?.data || response;
      const mappedComment = mapComment(createdComment || {
        id: Date.now(),
        commenterName: 'You',
        commenterAvatar: null,
        timeAgo: 'Just now',
        content: comment.trim(),
      });

      setComments((previous) => [mappedComment, ...previous]);
      setCommentsCount((previous) => previous + 1);
      setComment('');
      showToast('Comment Posted', 'Your comment has been added successfully.');
    } catch (err) {
      showToast('Comment Failed', err?.response?.data?.message || err?.message || 'Please try again.');
    }
  };

  if (isLoading) {
    return (
      <main className="story-details-root w-full flex flex-col gap-5 p-4 sm:p-6 bg-white dark:bg-[#111827] rounded-[22px]">
        <StoryDetailsHeader />
        <section className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-[16px] text-gray-500 dark:text-gray-300">
          Loading story details...
        </section>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="story-details-root w-full flex flex-col gap-5 p-4 sm:p-6 bg-white dark:bg-[#111827] rounded-[22px]">
        <StoryDetailsHeader />
        <section className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[16px] text-gray-600 dark:text-gray-300">{loadError || 'Story not found.'}</p>
          <button
            onClick={() => navigate('/patient/stories')}
            className="mt-4 px-4 py-2 rounded-full bg-brand-main text-white text-sm font-semibold hover:bg-[#2730d4] transition"
          >
            Back to Stories
          </button>
        </section>
      </main>
    );
  }

  return (
    <>
      <Toast
        visible={toast.visible} title={toast.title} message={toast.message} duration={3000}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {reportStory && (
        <ReportModal
          title="Report story"
          onClose={() => setReportStory(false)}
          onSubmit={async ({ category, reason }) => {
            try {
              await submitStoryReport(story.id, {
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Story?"
        desc="Are you sure you want to permanently delete this story? This action cannot be undone."
        onConfirm={handleDeleteStory}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <main className="story-details-root w-full flex flex-col gap-5 p-4 sm:p-6 bg-white dark:bg-[#111827] rounded-[22px]">
        <div className="flex items-center justify-between">
          <StoryDetailsHeader />
          {isOwnStory && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/patient/write-story/${id}`, { state: { from: location.state?.from } })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-brand-main hover:text-[#2730d4] hover:bg-brand-main/10 transition-all border border-transparent cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Story
              </button>
            </div>
          )}
        </div>

        <aside className="sr-only">
          <p>Story details, engagement actions, and related stories.</p>
        </aside>

        <StoryAuthorSection story={story} tagCls={tagCls} />

        <StoryArticle story={story} />

        <EngagementBar
          isLiked={isLiked}
          likesCount={likesCount}
          commentsCount={commentsCount}
          shares={sharesCount}
          showCommentBox={showCommentBox}
          onLike={handleLike}
          onToggleComments={() => setShowCommentBox(!showCommentBox)}
          onShare={handleShare}
          onReport={() => setReportStory(true)}
        />

        {showCommentBox && (
          <>
            <AddCommentBox
              storyAuthorImg={story.authorImg}
              comment={comment}
              onChange={(e) => setComment(e.target.value)}
              onCancel={() => { setComment(''); setShowCommentBox(false); }}
              onPost={handlePostComment}
            />

            <CommentsPreview
              comments={comments.slice(0, 3)}
              totalCount={commentsCount}
              onViewAll={() => navigate(`/patient/stories/${id}/comments`)}
            />
          </>
        )}

        <RelatedStories
          stories={relatedStories}
          tagCls={tagCls}
          onReadStory={(storyIdValue) => navigate(`/patient/stories/${storyIdValue}`)}
        />

        <StoryDetailsFooter
          onBack={() => navigate(backTarget)}
          backLabel={cameFromSettings ? 'Back to Settings' : 'Back to Stories'}
          onWriteStory={() => navigate('/patient/write-story')}
        />

        <style dangerouslySetInnerHTML={{
          __html: `
          .story-details-root button { cursor: pointer; }
          .story-details-root::-webkit-scrollbar { width: 6px; }
          .story-details-root::-webkit-scrollbar-track { background: transparent; }
          .story-details-root::-webkit-scrollbar-thumb { background: #333cf540; border-radius: 999px; }
          .story-details-root::-webkit-scrollbar-thumb:hover { background: #333CF5; }
          @media (max-width: 640px) { .story-details-root::-webkit-scrollbar { width: 4px; } }
        `}} />
      </main>
    </>
  );
};

export default PatientStoryDetails;
