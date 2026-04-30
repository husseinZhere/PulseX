import React from 'react';

const SectionWrapper = ({ id, children, className = "" }) => {
  return (
    // استخدام py-20 (تعادل 80px) كمسافة ثابتة بين كل سكشن والآخر
    // استخدام px-6 md:px-12 لتوحيد الهوامش الجانبية أيضاً
    <section id={id} className={`py-20 px-6 md:px-12 lg:px-20 ${className}`}>
      <div className="max-w-[1440px] mx-auto w-full">
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;