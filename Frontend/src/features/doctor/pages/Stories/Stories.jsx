import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoriesFooter from '../../components/Stories/StoriesFooter';
import StoriesGrid from '../../components/Stories/StoriesGrid';
import StoriesHeader from '../../components/Stories/StoriesHeader';
import { getPublishedStories } from '../../../../services/storyService';
import { resolveFileUrl } from '../../../../utils/api';

const DoctorStories = () => {
  const navigate = useNavigate();
  const [allStories, setAllStories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    document.title = 'Stories | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Review and follow patient stories shared in the PulseX community.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadStories = async () => {
      try {
        const resp = await getPublishedStories({ page: currentPage, pageSize: itemsPerPage });
        const items = resp?.items || resp?.stories || (Array.isArray(resp) ? resp : []);
        const total = resp?.totalPages || Math.ceil((resp?.total || items.length) / itemsPerPage) || 1;

        if (ignore) return;

        setAllStories(items.map((story) => ({
          id: story.id ?? story.storyId,
          author: story.patientName || story.authorName || story.author || 'Anonymous',
          date: story.publishedAt
            ? new Date(story.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : (story.publishedAtFormatted || ''),
          title: story.title || 'Untitled',
          tags: Array.isArray(story.tags) ? story.tags : [],
          excerpt: story.snippet || story.contentPreview || story.content?.slice(0, 180) || '',
          img: resolveFileUrl(story.patientAvatar || story.authorAvatar || story.avatar || ''),
        })));
        setTotalPages(total);
      } catch (err) {
        console.error('Load doctor stories failed', err);
        if (!ignore) {
          setAllStories([]);
          setTotalPages(1);
        }
      }
    };

    loadStories();
    return () => {
      ignore = true;
    };
  }, [currentPage]);

  return (
    <>
      <main className="p-[24px]" style={{ "--story-muted": "#757575" }}>
        <StoriesHeader />

        <aside className="sr-only">
          <p>Doctor stories listing with pagination and quick actions.</p>
        </aside>

        <StoriesGrid stories={allStories} onReadStory={(storyId) => navigate(`/doctor/stories/${storyId}`)} />

        {allStories.length > 0 && (
          <StoriesFooter
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            onGoToPage={(page) => setCurrentPage(page)}
          />
        )}
      </main>
    </>
  );
};

export default DoctorStories;
