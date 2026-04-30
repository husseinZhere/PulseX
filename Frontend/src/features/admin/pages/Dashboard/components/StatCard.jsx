import React from 'react';

const StatCard = ({ icon, label, value, sub, gradient, index = 0 }) => (
  <div className="admin-stat-card p-4 sm:p-5 flex flex-col items-start gap-4" style={{ '--card-delay': `${140 + (index * 90)}ms` }}>
    <div className="admin-stat-icon shrink-0" aria-hidden="true">
      <span className="admin-stat-icon-glow" style={{ background: gradient }} />
      <div
        className="admin-stat-icon-core"
        style={{ background: gradient }}
      >
        {icon}
      </div>
    </div>

    <div className="flex flex-col gap-1 min-w-0">
      <span className="admin-stat-value text-[26px] sm:text-[30px] font-bold text-white leading-tight">
        {(value ?? 0).toLocaleString()}
      </span>
      <span className="text-[13px] sm:text-[14px] font-semibold text-white/95">{label}</span>
      <span className="text-[12px] text-slate-300">{sub}</span>
    </div>
  </div>
);

export default StatCard;
