import React from 'react';
import { FiPlus } from "react-icons/fi";

// ملاحظة: مرري مسار الصورة في بروب imgSrc
const EmptyState = ({ 
  imgSrc, 
  title, 
  description, 
  buttonLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full bg-white dark:bg-[#111827] rounded-[24px]">
      {/* الصورة الكبيرة الملحقة */}
      <div className="mb-6">
        <img 
          src={imgSrc} 
          alt="Empty State" 
          className="w-[280px] h-auto object-contain" 
        />
      </div>

      {/* النصوص */}
      <h3 className="text-[28px] font-bold text-[#101828] dark:text-[#E2E8F0] mb-4">
        {title}
      </h3>
      
      <p className="text-[18px] text-gray-400 text-center max-w-[500px] mb-10 leading-relaxed font-normal">
        {description}
      </p>

      {/* زر الإضافة بنفس التصميم الأزرق */}
      {buttonLabel && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-10 py-4 bg-[#333CF5] text-white rounded-full text-[16px] font-semibold hover:bg-[#2830d4] transition-all shadow-md cursor-pointer"
        >
          <FiPlus className="text-[20px]" />
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;