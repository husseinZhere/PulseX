import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowSmallLeft } from "react-icons/hi2";
import NotFoundimg from '../../../../assets/Images/Notfound.png';

const NotFound = () => {
  return (
    <div className="fixed inset-0 min-h-screen w-full bg-white dark:bg-[#111827] flex items-center justify-center font-roboto z-[9999]">
      <div className="text-center px-6">
        <div className="relative mb-10 flex justify-center items-center">
          <img 
            src={NotFoundimg} 
            alt="404 Astronaut" 
            className="max-w-[550px] md:max-w-[500px] h-auto object-contain dark:invert dark:hue-rotate-180 dark:mix-blend-screen"
          />
        </div>

        {/* النصوص التوضيحية مطابق للصورة بالظبط */}
        <h2 className="text-[28px] md:text-[32px] font-extrabold text-black-main-text dark:text-[#E2E8F0] mb-3">
          Page Not Found
        </h2>
        
        <p className="text-[#64748B] text-[15px] md:text-[16px] max-w-[400px] mx-auto leading-relaxed mb-10">
          This page doesn't exist or was removed! <br />
          We suggest you go back to home.
        </p>

        {/* زرار العودة للوحة التحكم */}
        <Link 
          to="/patient/dashboard" 
          className="bg-brand-main hover:bg-[#252CBF] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-brand-main/20 transition-all active:scale-95 inline-flex items-center gap-2"
        >
          <HiArrowSmallLeft className="text-xl" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;