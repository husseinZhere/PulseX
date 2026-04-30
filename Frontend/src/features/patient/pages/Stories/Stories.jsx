import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoriesFooter from '../../components/Stories/StoriesFooter';
import StoriesGrid from '../../components/Stories/StoriesGrid';
import StoriesHeader from '../../components/Stories/StoriesHeader';
import { getPublishedStories } from '../../../../services/storyService';
import { resolveFileUrl } from '../../../../utils/api';

const PatientStories = () => {
  const navigate = useNavigate();
  const [allStories, setAllStories] = useState([]);
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    document.title = 'Stories | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Read and share inspiring patient journeys from the PulseX community.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const resp = await getPublishedStories({ page: currentPage, pageSize: itemsPerPage });
        const items = resp?.items || resp?.stories || (Array.isArray(resp) ? resp : []);
        const total = resp?.totalPages || Math.ceil((resp?.total || items.length) / itemsPerPage) || 1;
        if (ignore) return;
        setAllStories(items.map((s) => ({
          id: s.id ?? s.storyId,
          author: s.patientName || s.authorName || s.author || 'Anonymous',
          date: s.publishedAt
            ? new Date(s.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : (s.publishedAtFormatted || ''),
          title: s.title || 'Untitled',
          tags: s.tags || [],
          excerpt: s.snippet || s.contentPreview || s.content?.slice(0, 180) || '',
          img: resolveFileUrl(s.patientAvatar || s.authorAvatar || s.avatar || ''),
        })));
        setTotalPages(total);
      } catch (err) {
        console.error('Load stories failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, [currentPage]);

  const currentStories = allStories;

  return (
    <>
      <main className="p-[24px] bg-[#FAFBFF] dark:bg-[#0B1120] rounded-[22px]">
        <StoriesHeader />

        <aside className="sr-only">
          <p>Patient stories listing with pagination and quick actions.</p>
        </aside>

        <StoriesGrid stories={currentStories} onReadStory={(storyId) => navigate(`/patient/stories/${storyId}`)} />

        {currentStories.length > 0 && (
          <StoriesFooter
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            onGoToPage={(page) => setCurrentPage(page)}
            onWriteStory={() => navigate('/patient/write-story')}
          />
        )}
      </main>
    </>
  );
};

export default PatientStories;
