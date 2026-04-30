import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../../components/Toast/Toast';
import CategoriesSection from '../../components/WriteStory/CategoriesSection';
import CoverImageSection from '../../components/WriteStory/CoverImageSection';
import StoryEditorSection from '../../components/WriteStory/StoryEditorSection';
import StoryTitleSection from '../../components/WriteStory/StoryTitleSection';
import WriteStoryActions from '../../components/WriteStory/WriteStoryActions';
import WriteStoryHeader from '../../components/WriteStory/WriteStoryHeader';
import { CATEGORIES, chipStyle, WRITE_STORY_CSS_VARS } from '../../components/WriteStory/constants';
import { restoreCaret, saveCaret, toHTML } from '../../components/WriteStory/editorUtils';
import { createStory } from '../../../../services/storyService';

const WriteStory = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    document.title = 'Write Story | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Share your personal health story to inspire the PulseX community.');
    }
  }, []);

  const [title, setTitle] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [story, setStory] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  const handleEditorInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const plainText = el.innerText;
    setStory(plainText);
    setErrors((er) => ({ ...er, story: '' }));

    const caret = saveCaret(el);
    el.innerHTML = toHTML(plainText);
    restoreCaret(el, caret);
  }, []);

  const toggleCat = (cat) =>
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Story title is required.';
    if (!story.trim()) e.story = 'Story content cannot be empty.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    try {
      const coverFile = fileInputRef.current?.files?.[0] || null;
      await createStory(
        {
          Title: title,
          Content: story,
          Tags: selectedCats.join(','),
        },
        coverFile
      );
      setToast({
        visible: true,
        title: 'Story Published Successfully',
        message: 'Your story is now live and visible to others.',
      });
      setTimeout(() => {
        setToast((t) => ({ ...t, visible: false }));
        navigate('/patient/stories');
      }, 2000);
    } catch (err) {
      setToast({
        visible: true,
        title: 'Publish Failed',
        message: err?.response?.data?.message || err?.message || 'Please try again.',
      });
    }
  };

  return (
    <>
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        duration={3000}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <main className="w-full bg-white dark:bg-[#111827] p-6 flex rounded-full flex-col gap-7" style={WRITE_STORY_CSS_VARS}>
        <WriteStoryHeader />

        <section className="flex flex-col gap-7" aria-label="Write story form">
          <section aria-labelledby="write-story-title">
            <StoryTitleSection
              title={title}
              setTitle={setTitle}
              errors={errors}
              setErrors={setErrors}
            />
          </section>

          <section aria-labelledby="write-story-categories">
            <CategoriesSection
              categories={CATEGORIES}
              selectedCats={selectedCats}
              toggleCat={toggleCat}
              chipStyle={chipStyle}
            />
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          <section aria-labelledby="write-story-cover">
            <CoverImageSection
              fileInputRef={fileInputRef}
              imagePreview={imagePreview}
              handleImageChange={handleImageChange}
              removeImage={removeImage}
            />
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          <section aria-labelledby="write-story-content">
            <StoryEditorSection
              editorRef={editorRef}
              handleEditorInput={handleEditorInput}
              errors={errors}
              story={story}
            />
          </section>

          <aside className="sr-only">
            <p>Story writing guidance and metadata area</p>
          </aside>
        </section>

        <WriteStoryActions
          onCancel={() => navigate('/patient/stories')}
          onPublish={handlePublish}
        />
      </main>
    </>
  );
};

export default WriteStory;
