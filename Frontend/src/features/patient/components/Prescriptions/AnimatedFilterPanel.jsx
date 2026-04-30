import React, { useEffect, useRef, useState } from 'react';

const FILTER_OPTIONS = ['All', 'Active Only', 'Completed Only'];

const AnimatedFilterPanel = ({ open, filter, onSelect }) => {
  const panelRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => {
        if (panelRef.current) setHeight(panelRef.current.scrollHeight);
      });
    } else {
      setHeight(0);
      const t = setTimeout(() => setMounted(false), 380);
      return () => clearTimeout(t);
    }
  }, [open]);

  const getTabClass = (opt) => {
    const base =
      'px-4 py-[7px] rounded-xl text-[13px] font-semibold cursor-pointer border-none transition-all duration-300 ';
    if (filter !== opt) return base + 'bg-[#F3F4F6] text-[#364153] dark:bg-[#1F2937] dark:text-gray-300 dark:hover:bg-[#374151] hover:bg-[#e5e7eb] hover:scale-[1.03]';
    switch (opt) {
      case 'Active Only':
        return base + 'bg-[#00A63E] text-white shadow-md scale-[1.04]';
      case 'Completed Only':
        return base + 'bg-[#4A5565] dark:bg-gray-600 text-white shadow-md scale-[1.04]';
      default:
        return base + 'bg-brand-main text-white shadow-md scale-[1.04]';
    }
  };

  if (!mounted && !open) return null;

  return (
    <div
      style={{
        overflow: 'hidden',
        maxHeight: height,
        opacity: open ? 1 : 0,
        transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
      }}
    >
      <div
        ref={panelRef}
        className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-800"
      >
        {FILTER_OPTIONS.map((f, i) => (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className={getTabClass(f)}
            style={{
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0)' : 'translateY(-8px)',
              transition: `opacity 0.3s ease ${i * 60 + 60}ms, transform 0.3s ease ${i * 60 + 60}ms`,
            }}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnimatedFilterPanel;
