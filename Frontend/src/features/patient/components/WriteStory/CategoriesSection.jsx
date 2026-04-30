const CategoriesSection = ({ categories, selectedCats, toggleCat, chipStyle }) => {
  return (
    <article className="flex flex-col gap-3">
      <h2 className="sr-only">Story Categories</h2>
      <label className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0]">Story Categories</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const sel = selectedCats.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={`flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition ${chipStyle(cat, sel)}`}
            >
              {cat}
              {sel && <span className="text-xs">✓</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">Select one or more categories that best describe your story</p>
    </article>
  );
};

export default CategoriesSection;
