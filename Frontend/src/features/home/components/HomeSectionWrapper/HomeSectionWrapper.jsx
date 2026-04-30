import React from 'react';

const HomeSectionWrapper = ({ children, id, className = "", bgColor = "bg-[]" }) => {
  return (
    // py-24 (96px) تضمن مسافة احترافية جداً بين كل سكشن والتاني
    <section 
      id={id} 
      className={`w-full py-24 ${bgColor} ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-[80px]">
        {children}
      </div>
    </section>
  );
};

export default HomeSectionWrapper;
