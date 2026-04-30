import React from 'react';
import FieldError from './FieldError';

const InputField = ({
  label,
  name,
  type = 'text',
  formik,
  placeholder,
  icon: Icon,
  requiredColorClass = 'text-red-500',
  errorColorClass = 'text-red-500',
}) => {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[16px] font-normal text-[#344054] dark:text-gray-300">
        {label} <span className={requiredColorClass}>*</span>
      </label>
      <div className={`flex items-center gap-2 px-4 py-3 rounded-full border bg-white dark:bg-[#0B1120] transition-all ${hasError ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus-within:border-[#155dfc] focus-within:ring-2 focus-within:ring-[#155dfc]/10'}`}>
        {Icon && <Icon className="text-gray-400 dark:text-gray-500 shrink-0 text-[20px]" />}
        <input
          type={type}
          className="flex-1 border-none outline-none bg-transparent text-[16px] font-normal text-gray-900 dark:text-[#E2E8F0] placeholder-gray-400 dark:placeholder:text-gray-500"
          placeholder={placeholder}
          {...formik.getFieldProps(name)}
        />
      </div>
      <FieldError msg={hasError ? formik.errors[name] : ''} textClassName={errorColorClass} />
    </div>
  );
};

export default InputField;
