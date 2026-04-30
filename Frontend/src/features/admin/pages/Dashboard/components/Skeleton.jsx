import React from 'react';

const Skeleton = () => (
  <div className="admin-skeleton-row flex items-center gap-3 py-3">
    <div className="admin-skeleton-shimmer w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="admin-skeleton-shimmer h-3 rounded w-3/4" />
      <div className="admin-skeleton-shimmer h-2.5 rounded w-1/2" />
    </div>
    <div className="admin-skeleton-shimmer w-12 h-7 rounded-lg" />
  </div>
);

export default Skeleton;
