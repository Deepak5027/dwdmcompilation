import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview } from '../../services/api';
import { StatCard } from '../../components/cards/StatCard';
import { InsightCard } from '../../components/cards/InsightCard';
import { DataCard } from '../../components/cards/DataCard';
import { AreaChartWidget } from '../../components/charts/AreaChartWidget';
import { PieChartWidget } from '../../components/charts/PieChartWidget';
import { BarChartWidget } from '../../components/charts/BarChartWidget';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton';
import { UploadCloud, Play, Map, Database, ArrowRight, Sparkles } from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async () => {
      const res = await getDashboardOverview();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
        <LoadingSkeleton variant="chart" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rose-200 text-rose-700">
        <h3 className="font-bold text-base mb-2">Unable to connect to backend telemetry</h3>
        <p className="text-xs text-rose-500 mb-4">{(error as Error)?.message || 'FastAPI service unreachable'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Format category distribution for Pie Chart
  const pieData = (data.category_distribution || []).map((c) => ({
    name: c.category,
    value: c.visitors,
  }));

  // Top destination bar chart data
  const barData = (data.top_destinations || []).slice(0, 5).map((d) => {
    const raw = String(d.destination_name || '');
    const shortName = raw.length > 15 ? raw.slice(0, 13) + '…' : raw;
    return {
      name: shortName,
      fullName: raw,
      visitors: d.visitors,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Platform Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101D35] via-[#172B4D] to-[#0F2A4A] p-8 text-white shadow-lg border border-[#1E293B]">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tamil Nadu Visitor Intelligence & Spatial Mining</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Demonstration Data &bull; MySQL 8.0 Warehouse
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-heading tracking-tight mb-2">
            Smart Tourism Intelligence Platform
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
            Demonstration platform executing destination demand mining, Kimball star schema data warehousing in MySQL 8.0, VADER sentiment classification, and Scikit-learn geospatial K-Means clustering.
          </p>

          {/* Action triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/module1/upload')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/25"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Dataset</span>
            </button>
            <button
              onClick={() => navigate('/module1/etl')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <Database className="w-4 h-4" />
              <span>ETL Pipeline</span>
            </button>
            <button
              onClick={() => navigate('/module3/spatial')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <Map className="w-4 h-4" />
              <span>Spatial Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi) => (
          <StatCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            trendPct={kpi.trend_pct}
            trendDirection={kpi.trend_direction as 'up' | 'down' | 'neutral'}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Primary Analytics Section: Trends & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Monthly Visitor Curve */}
        <div className="lg:col-span-2">
          <DataCard
            title="Monthly Longitudinal Visitor Footfall"
            subtitle="Extracted and aggregated across Kimball star schema fact table"
            action={
              <button
                onClick={() => navigate('/module2/demand')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>Full Trends</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {data.visitor_trends && data.visitor_trends.length > 0 ? (
              <AreaChartWidget
                data={data.visitor_trends as unknown as Array<Record<string, unknown>>}
                xKey="period"
                yKey="visitor_count"
                height={280}
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No monthly footfall observations found in star schema fact table.</span>
              </div>
            )}
          </DataCard>
        </div>

        {/* Tourism Category Proportions */}
        <div>
          <DataCard
            title="Category Footfall Proportions"
            subtitle="Relative visitor share across domain classifications"
          >
            <PieChartWidget data={pieData} height={280} innerRadius={55} />
          </DataCard>
        </div>
      </div>

      {/* Leaderboard & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Destination Leaderboard */}
        <div>
          <DataCard
            title="Top Destinations by Footfall"
            subtitle="Peak recorded annual tourist visits"
            action={
              <button
                onClick={() => navigate('/module4/dashboard')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                Leaderboard
              </button>
            }
          >
          {barData.length > 0 ? (
            <BarChartWidget
              data={barData as unknown as Array<Record<string, unknown>>}
              xKey="name"
              yKey="visitors"
              barColor="#0D9488"
              height={260}
            />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <span>No destination records found in MySQL warehouse.</span>
            </div>
          )}
          </DataCard>
        </div>

        {/* Dynamic Data-Driven Insights Engine */}
        <div className="lg:col-span-2">
          <DataCard
            title="Executive Insights Engine"
            subtitle="Automated analytical syntheses computed from benchmark demonstration records in MySQL"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.insights.map((ins) => (
                <InsightCard
                  key={ins.id}
                  category={ins.category}
                  title={ins.title}
                  description={ins.description}
                  metricLabel={ins.metric_label}
                  metricValue={ins.metric_value}
                  badgeVariant={ins.badge_variant as 'teal' | 'indigo' | 'sky' | 'emerald'}
                />
              ))}
            </div>
          </DataCard>
        </div>
      </div>
    </div>
  );
};

