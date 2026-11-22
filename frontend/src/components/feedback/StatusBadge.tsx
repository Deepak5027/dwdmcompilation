import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = (status || '').toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['completed', 'loaded', 'active', 'success'].includes(norm)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['running', 'processing', 'validating'].includes(norm)) {
    colorClasses = 'bg-teal-50 text-teal-700 border-teal-200 animate-pulse';
  } else if (['uploaded', 'pending'].includes(norm)) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (['error', 'failed', 'validation_error', 'etl_error'].includes(norm)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${colorClasses}`}
    >
      {status}
    </span>
  );
};

