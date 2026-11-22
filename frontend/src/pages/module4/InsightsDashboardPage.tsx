import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getDashboardOverview,
  getDestinationAnalytics,
  exportReport,
  getSpatialDestinations,
} from '../../services/api';
import { StatCard } from '../../components/cards/StatCard';
import { InsightCard } from '../../components/cards/InsightCard';
import { DataCard } from '../../components/cards/DataCard';
import { AreaChartWidget } from '../../components/charts/AreaChartWidget';
import { PieChartWidget } from '../../components/charts/PieChartWidget';
import { TourismMap } from '../../components/maps/TourismMap';
import { DataTable } from '../../components/tables/DataTable';
import { formatCompactNumber, formatRating } from '../../utils/format';
import { TableColumn } from '../../types';
import {
  BarChart3,
  Download,
  Filter,
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export const InsightsDashboardPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Fetch Dashboard Overview
  const { data: overviewData, isLoading: isOverviewLoading, refetch } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async () => {
      const res = await getDashboardOverview();
      return res.data.data;
    },
  });

  // Fetch Destinations
  const { data: destinationsData } = useQuery({
    queryKey: ['destinationLeaderboard'],
    queryFn: async () => {
      const res = await getDestinationAnalytics(20);
      return res.data.data;
    },
  });

  // Fetch Spatial Points for Mini-Map
  const { data: spatialPoints } = useQuery({
    queryKey: ['spatialDestinations'],
    queryFn: async () => {
      const res = await getSpatialDestinations();
      return res.data.data;
    },
  });

  // Export Mutation
  const exportMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'csv') => {
      setExportingFormat(format);
      const res = await exportReport({
        report_type: 'executive_brief',
        format,
        title: 'Tamil Nadu Tourism Intelligence — Executive Decision Brief',
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setExportingFormat(null);
      // Trigger download
      window.open(`http://localhost:8000${data.download_url}`, '_blank');
    },
    onError: (err: Error) => {
      setExportingFormat(null);
      alert(`Export failed: ${err.message}`);
    },
  });

  // Filter destinations
  const filteredDestinations = (destinationsData || []).filter((d) => {
    if (selectedCategory !== 'all' && d.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedDistrict !== 'all' && d.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    return true;
  });

  const columns: TableColumn<any>[] = [
    {
      key: 'destination_name',
      label: 'Destination Name',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{String(val)}</span>
          <span className="text-[11px] text-slate-400 block">{row.district} &bull; {row.category}</span>
        </div>
      ),
    },
    {
      key: 'visitors',
      label: 'Annual Footfall',
      render: (val) => (
        <span className="font-mono font-bold text-slate-700 text-xs">
          {formatCompactNumber(Number(val))}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => (
        <span className="text-xs font-bold text-amber-600">
          ★ {formatRating(Number(val))}
        </span>
      ),
    },
    {
      key: 'demand',
      label: 'Demand Index',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Number(val))}%` }}
            />
          </div>
          <span className="text-xs font-bold text-teal-700 font-mono">{Number(val).toFixed(1)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Module 4 &bull; Executive Tourism BI Dashboard</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Demonstration Intelligence Archive
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Executive Tourism BI Dashboard and Visitor Insights
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Consolidated intelligence synthesis unifying MySQL 8.0 Kimball star schema telemetry, VADER sentiment scores, Holt-Winters demand forecasting, and geospatial K-Means clustering.
          </p>
        </div>

        {/* Export Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMutation.mutate('csv')}
            disabled={!!exportingFormat}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => exportMutation.mutate('pdf')}
            disabled={!!exportingFormat}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{exportingFormat === 'pdf' ? 'Generating PDF...' : 'Download Brief (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Interactive Global Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Tourism Categories</option>
            <option value="heritage">Heritage & Monuments</option>
            <option value="temple">Temples & Pilgrimage</option>
            <option value="hill station">Hill Stations</option>
            <option value="beach">Coastal & Beach</option>
            <option value="waterfall">Waterfalls & Eco</option>
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Districts</option>
            <option value="chennai">Chennai</option>
            <option value="chengalpattu">Chengalpattu</option>
            <option value="nilgiris">Nilgiris</option>
            <option value="dindigul">Dindigul</option>
            <option value="madurai">Madurai</option>
            <option value="ramanathapuram">Ramanathapuram</option>
            <option value="kanyakumari">Kanyakumari</option>
          </select>

          {(selectedCategory !== 'all' || selectedDistrict !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDistrict('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewData?.kpis.map((kpi) => (
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

      {/* Visual Analytics Row: Longitudinal Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataCard
            title="Monthly Destination Demand Curve"
            subtitle="Footfall observations aggregated from MySQL fact_visitor_analytics (Demonstration Data)"
          >
            {overviewData?.visitor_trends && overviewData.visitor_trends.length > 0 ? (
              <AreaChartWidget
                data={(overviewData?.visitor_trends as unknown as Array<Record<string, unknown>>) || []}
                xKey="period"
                yKey="visitor_count"
                height={290}
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No monthly footfall records found in MySQL warehouse.</span>
              </div>
            )}
          </DataCard>
        </div>

        <div>
          <DataCard
            title="Visitor Category Breakdown"
            subtitle="Proportions of visitor demand across tourism categories"
          >
            <PieChartWidget
              data={(overviewData?.category_distribution || []).map((c) => ({
                name: c.category,
                value: c.visitors,
              }))}
              height={290}
              innerRadius={50}
            />
          </DataCard>
        </div>
      </div>

      {/* Destination Demand Leaderboard Table */}
      <DataCard
        title="Filtered Destination Leaderboard"
        subtitle={`Showing ${filteredDestinations.length} ranked destinations`}
      >
        <DataTable
          columns={columns}
          data={filteredDestinations}
          pageSize={8}
          searchPlaceholder="Filter leaderboard..."
        />
      </DataCard>

      {/* Mini Spatial Map & Empirical Insights Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DataCard
            title="Spatial GIS Telemetry Preview"
            subtitle="Live georeferenced destination distribution"
          >
            <TourismMap
              destinations={spatialPoints || []}
              height="360px"
            />
          </DataCard>
        </div>

        <div className="lg:col-span-2">
          <DataCard
            title="Data-Driven Executive Decision Syntheses"
            subtitle="Computed directly from warehouse aggregates and machine learning centroids"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {overviewData?.insights.map((ins) => (
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

