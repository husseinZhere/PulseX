/**
 * GenderToggle — Shared reusable gender selector
 *
 * Props:
 *  value      {string}   — current selected value ('Male' | 'Female')
 *  onChange   {fn}       — called with the new value string
 *  error      {string}   — optional error message
 *  options    {Array}    — optional custom options array (default: ['Male','Female'])
 *
 * Usage:
 *   <GenderToggle
 *     value={formik.values.gender}
 *     onChange={(val) => formik.setFieldValue('gender', val)}
 *     error={formik.touched.gender && formik.errors.gender}
 *   />
 */

import React from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';

/* Color map — add more keys if you extend options */
const OPTION_COLORS = {
  Male: { active: '#155DFC', dot: '#155DFC' },
  Female: { active: '#E60076', dot: '#E60076' },
};
const DEFAULT_COLOR = { active: '#333CF5', dot: '#333CF5' };

const DEFAULT_OPTIONS = ['Male', 'Female'];

export default function GenderToggle({
  value,
  onChange,
  error,
  options = DEFAULT_OPTIONS,
  label = 'Gender',
  required = true,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[12.5px] font-semibold text-[#364153] dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-0.5"> *</span>}
        </label>
      )}

      <div className="flex items-center gap-3 w-full">
        {options.map((opt) => {
          const isSelected = value === opt;
          const colors = OPTION_COLORS[opt] ?? DEFAULT_COLOR;

          return (
            <button
              key={opt}
              type="button"
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-[13px] font-semibold rounded-[10px] border transition-all ${isSelected ? 'text-white' : 'bg-white dark:bg-[#0F172A] text-[#364153] dark:text-gray-200 border-[#d1d5dc] dark:border-[#4B5563]'}`}
              style={
                isSelected
                  ? { background: colors.active, color: '#fff', borderColor: colors.active, boxShadow: `0 4px 14px ${colors.active}44` }
                  : undefined
              }
              onClick={() => onChange(opt)}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border-2 shrink-0"
                style={
                  isSelected
                    ? { borderColor: '#fff', background: '#fff', boxShadow: `inset 0 0 0 2px ${colors.dot}` }
                    : { borderColor: '#d1d5dc', background: '#fff' }
                }
              />
              {opt}
            </button>
          );
        })}
      </div>

      {error && (
        <span className="flex   flex-1  justify-center items-center gap-1.5 text-[12px] text-red-500 mt-0.5">
          <HiOutlineExclamationCircle className="text-[14px] shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}
