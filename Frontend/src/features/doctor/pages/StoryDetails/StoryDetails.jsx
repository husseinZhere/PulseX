import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '../../../../services/storyService';
import { reportStory as submitStoryReport } from '../../../../services/reportService';
import { resolveFileUrl } from '../../../../utils/api';

const TAG_COLOURS = {
  Lifestyle: 'bg-[#FFF3E0] dark:bg-[#1E293B] text-[#F57C00] border-[#FFE0B2]',
  Health: 'bg-[#E8EAF6] dark:bg-[#1E293B] text-brand-main border-[#C5CAE9]',
  Fitness: 'bg-[#E8F5E9] dark:bg-[#1E293B] text-[#2E7D32] border-[#C8E6C9]',
  Recovery: 'bg-[#FCE4EC] dark:bg-[#1E293B] text-[#C62828] border-[#FFCDD2]',
  'Mental Health': 'bg-[#F3E5F5] dark:bg-[#1E293B] text-[#6A1B9A] border-[#E1BEE7]',
  Wellness: 'bg-[#E0F7FA] dark:bg-[#1E293B] text-[#00695C] border-[#B2EBF2]',
  Sleep: 'bg-[#E3F2FD] dark:bg-[#1E293B] text-[#1565C0] border-[#BBDEFB]',
};

const tagCls = (tag) => TAG_COLOURS[tag] || 'bg-gray-100 text-gray-600 border-gray-200 dark:border-gray-700';
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
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
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
  const story = {
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
    likes: rawStory.likesCount ?? rawStory.likes ?? 0,
    commentsCount: rawStory.commentsCount ?? 0,
    shares: rawStory.sharesCount ?? rawStory.shares ?? 0,
    comments: Array.isArray(rawStory.comments) ? rawStory.comments.map(mapComment) : [],
  };

  return {
    story,
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

const DoctorStoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Story Details | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Read story details and patient engagement from the doctor workspace.');
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
        setIsLiked(false);
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

  const handleLike = async () => {
    if (!story || isLiked) return;

    try {
      const response = await likeStory(story.id);
      const nextLikes = response?.likesCount ?? response?.data?.likesCount ?? (likesCount + 1);
      setLikesCount(nextLikes);
      setIsLiked(true);
    } catch (err) {
      showToast('Like Failed', err?.response?.data?.message || err?.message || 'Please try again.');
    }
  };

  const handleShare = async () => {
    if (!story) return;

    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard may fail outside secure browser contexts.
    }

    try {
      const response = await shareStory(story.id);
      const nextShares = response?.sharesCount ?? response?.data?.sharesCount ?? (sharesCount + 1);
      setSharesCount(nextShares);
    } catch {
      // Keep the UI responsive even if share tracking fails.
    }

    showToast('Link Copied!', 'Story link copied to clipboard.');
  };

  const handlePostComment = async () => {
    if (!comment.trim() || !story) return;

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
      <main className="story-details-root w-full flex flex-col gap-5 p-4 sm:p-6" style={{ "--story-muted": "#757575" }}>
        <StoryDetailsHeader />
        <section className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-[16px] text-gray-500 dark:text-gray-300">
          Loading story details...
        </section>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="story-details-root w-full flex flex-col gap-5 p-4 sm:p-6" style={{ "--story-muted": "#757575" }}>
        <StoryDetailsHeader />
        <section className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[16px] text-gray-600 dark:text-gray-300">{loadError || 'Story not found.'}</p>
          <button
            onClick={() => navigate('/doctor/stories')}
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

      <main className="story-details-root w-full flex flex-col gap-5 p-4 sm:p-6" style={{ "--story-muted": "#757575" }}>
        <StoryDetailsHeader />

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
              onViewAll={() => navigate(`/doctor/stories/${id}/comments`)}
            />
          </>
        )}

        <RelatedStories
          stories={relatedStories}
          tagCls={tagCls}
          onReadStory={(storyIdValue) => navigate(`/doctor/stories/${storyIdValue}`)}
        />

        <StoryDetailsFooter
          onBack={() => navigate('/doctor/stories')}
        />

        <style dangerouslySetInnerHTML={{ __html: `
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

export default DoctorStoryDetails;
