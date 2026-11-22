import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Users, MapPin, Database, Star, TrendingUp, Smile, Layers, Award, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  trendPct?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  subtitle: string;
  icon?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  MapPin,
  Database,
  Star,
  TrendingUp,
  Smile,
  Layers,
  Award,
  Activity,
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trendPct,
  trendDirection = 'up',
  subtitle,
  icon = 'Activity',
}) => {
  const IconComponent = ICON_MAP[icon] || Activity;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="my-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-heading text-slate-900 tracking-tight">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400 truncate max-w-[170px]">{subtitle}</span>
        {trendPct !== undefined && (
          <div
            className={`flex items-center gap-0.5 font-bold ${
              trendDirection === 'up'
                ? 'text-emerald-600'
                : trendDirection === 'down'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            {trendDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trendPct}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

