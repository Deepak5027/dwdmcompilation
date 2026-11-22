import React from 'react';
import { Sparkles, TrendingUp, Compass, Layers, CheckCircle2 } from 'lucide-react';

interface InsightCardProps {
  category: string;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  badgeVariant?: 'teal' | 'indigo' | 'sky' | 'emerald' | 'amber';
}

const BADGE_STYLES: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const InsightCard: React.FC<InsightCardProps> = ({
  category,
  title,
  description,
  metricLabel,
  metricValue,
  badgeVariant = 'teal',
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              BADGE_STYLES[badgeVariant] || BADGE_STYLES.teal
            }`}
          >
            {category}
          </span>
          <Sparkles className="w-4 h-4 text-slate-300" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 font-heading mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400">{metricLabel}</span>
        <span className="text-xs font-bold text-slate-800 font-heading bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {metricValue}
        </span>
      </div>
    </div>
  );
};

