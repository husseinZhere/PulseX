import { HiOutlineCloudUpload, HiX } from 'react-icons/hi';

const CoverImageSection = ({ fileInputRef, imagePreview, handleImageChange, removeImage }) => {
  return (
    <article className="flex flex-col gap-2">
      <h2 className="sr-only">Cover Image</h2>
      <label className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0]">
        Cover Image <span className="text-gray-400 font-normal">(Optional)</span>
      </label>
      <div
        onClick={() => fileInputRef.current.click()}
        className="relative h-50 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] cursor-pointer flex flex-col items-center justify-center overflow-hidden transition hover:border-brand-main"
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition"
            >
              <HiX className="text-sm" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
              <HiOutlineCloudUpload className="text-xl text-gray-500" />
            </div>
            <p className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0]">Drag and drop your image here</p>
            <p className="text-xs text-gray-400">or click to browse files</p>
            <p className="text-xs text-gray-300 mt-1">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
          </div>
        )}
        <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} accept="image/*" />
      </div>
    </article>
  );
};

export default CoverImageSection;
