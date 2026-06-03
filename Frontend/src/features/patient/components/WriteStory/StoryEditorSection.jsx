const StoryEditorSection = ({ editorRef, handleEditorInput, errors, story }) => {
  return (
    <article className="flex flex-col gap-2">
      <h2 className="sr-only">Your Story</h2>
      <label className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0]">Your Story</label>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleEditorInput}
        data-placeholder="Share your health journey in detail. What challenges did you face? How did you overcome them? What was your experience like?"
        className={`w-full min-h-[220px] px-4 py-3.5 rounded-xl border text-sm outline-none leading-relaxed transition bg-[#F6F7F8] dark:bg-[#0B1120] text-black-main-text dark:text-[#E2E8F0] whitespace-pre-wrap wrap-break-word empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 dark:empty:before:text-gray-500 empty:before:pointer-events-none ${errors.story ? 'border-red-400' : 'border-[var(--ws-border)] dark:border-gray-700 focus:border-brand-main'}`}
      />
      {errors.story && <p className="text-xs text-red-500">{errors.story}</p>}
      <p className="text-xs text-[var(--ws-editor-muted)]">{story.length} characters</p>
    </article>
  );
};

export default StoryEditorSection;
