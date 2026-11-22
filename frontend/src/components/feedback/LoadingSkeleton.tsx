import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'table' | 'chart' | 'text';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'card',
}) => {
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-5 animate-pulse ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-7 bg-slate-200 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-slate-100 rounded w-3/4"></div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-4 bg-slate-100 rounded w-5/6"></div>
    </div>
  );
};

