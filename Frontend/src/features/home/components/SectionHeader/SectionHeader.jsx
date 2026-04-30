import React from 'react';

const SectionHeader = ({ title, subtitle, align = 'center' }) => {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  
  return (
    <div className={`mb-16 ${alignClass}`}>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
      {subtitle && <p className="text-xl text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;