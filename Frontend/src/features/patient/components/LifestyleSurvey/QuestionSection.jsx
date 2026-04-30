const QuestionSection = ({
  icon,
  label,
  question,
  options,
  selected,
  onSelect,
  className = 'flex-1 w-full',
}) => (
  <article className={className}>
    <div className="flex items-center gap-2.5 text-black-main-text dark:text-white text-[18px] font-roboto font-semibold mb-1.5">
      <span aria-label={label}>{icon}</span> {label}
    </div>
    <p className="text-[16px] text-gray-700 dark:text-gray-400 mb-3 ml-6">{question}</p>
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <label
            key={opt}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[24px] text-[13px] font-medium border transition-all cursor-pointer ${active
                ? 'border-brand-main dark:border-brand-main text-brand-main dark:text-white bg-blue-50 dark:bg-brand-main/20'
                : 'border-gray-200 dark:border-gray-700 text-black-main-text dark:text-gray-300 bg-white dark:bg-[#1E293B] hover:border-brand-main hover:bg-[#f5f5ff] dark:hover:border-gray-500 dark:hover:bg-gray-800'
              }`}
          >
            <input
              type="radio"
              name={label}
              value={opt}
              checked={active}
              onChange={() => onSelect(opt)}
              className="sr-only"
            />
            <span
              className={`w-3.5 h-3.5 rounded-full border shrink-0 transition-all ${active
                  ? 'border-brand-main bg-brand-main shadow-[inset_0_0_0_2.5px_white] dark:shadow-[inset_0_0_0_2.5px_#1E293B]'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent'
                }`}
            />
            {opt}
          </label>
        );
      })}
    </div>
  </article>
);

export default QuestionSection;
