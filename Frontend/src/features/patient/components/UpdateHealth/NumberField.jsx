function NumberField({
  label,
  icon,
  iconLabel,
  value,
  onChange,
  placeholder,
  unit,
  required,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-[#344054] dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex items-center bg-[#f9fafb] dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 gap-2.5 focus-within:border-[#155DFC] transition-colors">
        <span className="text-gray-400 dark:text-gray-500 text-[14px] shrink-0" aria-label={iconLabel}>
          {icon}
        </span>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="cursor-pointer bg-transparent outline-none w-full text-sm text-black-main-text dark:text-[#E2E8F0] placeholder-gray-400 dark:placeholder-gray-600"
        />
        {unit && <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

export default NumberField;
