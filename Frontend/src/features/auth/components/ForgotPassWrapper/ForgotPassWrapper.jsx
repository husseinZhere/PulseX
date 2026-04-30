import React from 'react';

const ForgotPassWrapper = ({ title, description, children, buttonText, onSubmit, showLogo = true, footer }) => {
  return (
    <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#020617] flex items-center justify-center p-6 font-inter animate-fade-in">
      <div className="w-full max-w-[420px] flex flex-col ">

        {/* Logo Section */}
        {showLogo && (
          <div className="mb-5">
            <span className="font-bold text-2xl text-black-main-text ">
              Pulse<span className="font-bold text-2xl text-brand-main">X</span>
            </span>
          </div>
        )}

        {/* Text Content */}
        <h2 className="text-[28px] font-bold text-black-main-text mb-3 tracking-tight">
          {title}
        </h2>
        <p className="text-gray-text-dim2  text-[14px] mb-10 leading-relaxed max-w-[340px]">
          {description}
        </p>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="w-full space-y-6 rounded-[24px] bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
          <div className="w-full">
            {children}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-main hover:bg-brand-dark text-white font-bold py-4 rounded-full shadow-lg shadow-brand-main/20 transition-all active:scale-95 text-[15px]"
          >
            {buttonText}
          </button>

          {/* الجزء اللي بيظهر فيه الـ Resend Email */}
          {footer && (
            <div className="w-full flex justify-center pt-2">
              {footer}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassWrapper;
