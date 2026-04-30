import React from 'react';

const HomeWrapper = ({ id, title, description, children, className = "" }) => {
  return (
    <section id={id} className={`py-24 px-6 md:px-12 lg:px-20 ${className}`}>
      <div className="max-w-[1250px] mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-black-main-text mb-5 font-poppins tracking-tight">
            {title}
          </h2>
          <p className="text-gray-text-dim2 text-[16px] leading-relaxed font-medium">
            {description}
          </p>
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
};

export default HomeWrapper;