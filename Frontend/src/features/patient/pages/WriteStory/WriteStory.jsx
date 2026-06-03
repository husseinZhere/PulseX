import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../../../../components/Toast/Toast';
import CategoriesSection from '../../components/WriteStory/CategoriesSection';
import CoverImageSection from '../../components/WriteStory/CoverImageSection';
import StoryEditorSection from '../../components/WriteStory/StoryEditorSection';
import StoryTitleSection from '../../components/WriteStory/StoryTitleSection';
import WriteStoryActions from '../../components/WriteStory/WriteStoryActions';
import WriteStoryHeader from '../../components/WriteStory/WriteStoryHeader';
import { CATEGORIES, chipStyle, WRITE_STORY_CSS_VARS } from '../../components/WriteStory/constants';
import { restoreCaret, saveCaret, toHTML } from '../../components/WriteStory/editorUtils';
import { createStory, updateMyStory, getStoryDetail } from '../../../../services/storyService';
import { resolveFileUrl } from '../../../../utils/api';

const WriteStory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    document.title = `${isEditing ? 'Edit' : 'Write'} Story | PulseX`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Share your personal health story to inspire the PulseX community.');
    }
  }, [isEditing]);

  const [title, setTitle] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [story, setStory] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  // Edit mode: load the existing story and prefill every field.
  useEffect(() => {
    if (!isEditing) return;
    let ignore = false;
    getStoryDetail(Number(id))
      .then((data) => {
        if (ignore) return;
        const s = data?.data || data || {};
        setTitle(s.title || '');
        const tags = Array.isArray(s.tags)
          ? s.tags
          : (typeof s.tags === 'string' ? s.tags.split(',').map((t) => t.trim()).filter(Boolean) : []);
        setSelectedCats(tags);
        const content = s.content || '';
        setStory(content);
        if (editorRef.current) editorRef.current.innerHTML = toHTML(content);
        if (s.imageUrl) setImagePreview(resolveFileUrl(s.imageUrl));
      })
      .catch(() => {
        setToast({ visible: true, title: 'Load Failed', message: 'Could not load this story.' });
      });
    return () => { ignore = true; };
  }, [id, isEditing]);

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
      const payload = {
        Title: title,
        Content: story,
        Tags: selectedCats.join(','),
      };

      if (isEditing) {
        await updateMyStory(Number(id), payload, coverFile);
      } else {
        await createStory(payload, coverFile);
      }

      setToast({
        visible: true,
        title: isEditing ? 'Story Updated Successfully' : 'Story Published Successfully',
        message: isEditing
          ? 'Your changes have been saved.'
          : 'Your story is now live and visible to others.',
      });
      setTimeout(() => {
        setToast((t) => ({ ...t, visible: false }));
        navigate(isEditing ? `/patient/stories/${id}` : '/patient/stories');
      }, 1500);
    } catch (err) {
      setToast({
        visible: true,
        title: isEditing ? 'Update Failed' : 'Publish Failed',
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

      <main className="w-full bg-white dark:bg-[#111827] p-6 flex rounded-[22px] flex-col gap-7" style={WRITE_STORY_CSS_VARS}>
        <WriteStoryHeader isEditing={isEditing} />

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
          onCancel={() => navigate(isEditing ? `/patient/stories/${id}` : '/patient/stories')}
          onPublish={handlePublish}
          isEditing={isEditing}
        />
      </main>
    </>
  );
};

export default WriteStory;
