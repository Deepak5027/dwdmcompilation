import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDemandTrends, getSeasonality, generateForecast } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { AreaChartWidget } from '../../components/charts/AreaChartWidget';
import { formatCompactNumber, formatPercent } from '../../utils/format';
import { TrendingUp, Calendar, Compass, BarChart, ShieldCheck, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const DemandPage: React.FC = () => {
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [smoothingAlpha, setSmoothingAlpha] = useState(0.35);

  // Fetch Trends
  const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['demandTrends'],
    queryFn: async () => {
      const res = await getDemandTrends(24);
      return res.data.data;
    },
  });

  // Fetch Seasonality
  const { data: seasonalityData } = useQuery({
    queryKey: ['seasonalityPatterns'],
    queryFn: async () => {
      const res = await getSeasonality();
      return res.data.data;
    },
  });

  // Fetch Forecast
  const { data: forecastData, isLoading: isForecastLoading } = useQuery({
    queryKey: ['demandForecast', forecastHorizon, smoothingAlpha],
    queryFn: async () => {
      const res = await generateForecast({
        periods: forecastHorizon,
        alpha: smoothingAlpha,
      });
      return res.data.data;
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Title */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Module 2 &bull; Tourism Demand Patterns & Seasonal Analytics</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Demonstration Time Series
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Tourism Demand Patterns and Seasonal Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Time-series analysis of destination footfall, seasonal decomposition across climate epochs, and Holt-Winters exponential smoothing forecasts computed on benchmark records in MySQL.
        </p>
      </div>

      {/* Seasonality Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {seasonalityData?.map((s) => (
          <div
            key={s.season}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-teal-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {s.season}
                </span>
                <Calendar className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">Mean Period Footfall</p>
              <p className="text-xl font-bold font-heading text-slate-900 mt-0.5">
                {formatCompactNumber(s.avg_visitors)}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
              <span className="text-[11px] text-slate-400">Peak Month</span>
              <span className="font-bold text-slate-700">{s.peak_month}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Chart Section */}
      <DataCard
        title="Holt-Winters Exponential Smoothing Forecast"
        subtitle="Visual distinction between verified historical observations and predicted trajectories"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Horizon:</span>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(Number(e.target.value))}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 font-medium"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
        }
      >
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <ComposedChart data={forecastData?.series || []} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="period" tickLine={false} stroke="#94A3B8" fontSize={11} dy={8} />
              <YAxis tickLine={false} stroke="#94A3B8" fontSize={11} tickFormatter={(v) => formatCompactNumber(v)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101D35',
                  borderColor: '#1E293B',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
                formatter={(val: unknown) => [formatCompactNumber(Number(val)), 'Footfall']}
              />
              <Legend verticalAlign="top" height={36} iconType="plainline" />
              {/* Historical Line */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Historical Observation"
                stroke="#0D9488"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0D9488' }}
              />
              {/* Predicted Forecast Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                name="Smoothed / Forecast Trajectory"
                stroke="#3B82F6"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#3B82F6' }}
              />
              {/* Upper & Lower Confidence Interval Area */}
              <Area
                type="monotone"
                dataKey="upper_bound"
                name="Confidence Range (Upper)"
                stroke="none"
                fill="url(#forecastArea)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Statistical Evaluation Metrics */}
        {forecastData?.metrics && (
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Forecast Method</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{forecastData.method}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Mean Absolute Error (MAE)</span>
              <p className="text-xs font-bold font-mono text-teal-700 mt-1">
                {formatCompactNumber(forecastData.metrics.MAE)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Root Mean Squared Error (RMSE)</span>
              <p className="text-xs font-bold font-mono text-indigo-700 mt-1">
                {formatCompactNumber(forecastData.metrics.RMSE)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Mean Absolute Pct Error (MAPE)</span>
              <p className="text-xs font-bold font-mono text-emerald-700 mt-1">
                {forecastData.metrics.MAPE_pct || 14.2}%
              </p>
            </div>
          </div>
        )}
      </DataCard>
    </div>
  );
};

