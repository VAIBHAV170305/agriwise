import React from 'react';

/**
 * Shimmer Skeleton Loader for modern card and list placeholding
 */
export default function ShimmerSkeleton({ rows = 3, height = 24, borderRadius = 8, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', ...style }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton-shimmer"
          style={{
            height: `${height}px`,
            borderRadius: `${borderRadius}px`,
            width: idx === rows - 1 && rows > 1 ? '70%' : '100%'
          }}
        />
      ))}
    </div>
  );
}
