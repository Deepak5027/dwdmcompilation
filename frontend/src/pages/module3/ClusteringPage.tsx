import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { executeClustering, runElbowMethod } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { ScatterChartWidget } from '../../components/charts/ScatterChartWidget';
import { DataTable } from '../../components/tables/DataTable';
import { ClusteringResult, TableColumn } from '../../types';
import { Layers, Play, RotateCw, Sparkles, CheckCircle2, Award, Info, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const ClusteringPage: React.FC = () => {
  const [kValue, setKValue] = useState(3);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'avg_visitors',
    'avg_rating',
    'total_reviews',
    'demand_score',
  ]);

  // Execute Clustering via Mutation
  const clusterMutation = useMutation({
    mutationFn: async () => {
      const res = await executeClustering({
        k_value: kValue,
        features: selectedFeatures,
        max_iterations: 300,
        random_state: 42,
      });
      return res.data.data;
    },
  });

  // Automatically execute model once on initial mount with defaults
  useEffect(() => {
    clusterMutation.mutate();
  }, []);

  const clusterData = clusterMutation.data;
  const isClusteringLoading = clusterMutation.isPending;
  const isClusteringError = clusterMutation.isError;
  const clusteringErrorMessage = (clusterMutation.error as Error)?.message;

  // Fetch Elbow Data
  const {
    data: elbowData,
    isLoading: isElbowLoading,
    isError: isElbowError,
    error: elbowError,
    refetch: refetchElbow,
  } = useQuery({
    queryKey: ['elbowMethodData'],
    queryFn: async () => {
      const res = await runElbowMethod();
      return res.data.data;
    },
  });

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const columns: TableColumn<any>[] = [
    {
      key: 'destination_name',
      label: 'Destination Name',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{String(val)}</span>
          <span className="text-[11px] text-slate-400 block">{row.district} &bull; {row.tourism_category}</span>
        </div>
      ),
    },
    {
      key: 'cluster_label',
      label: 'Assigned Cluster Cohort',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          {String(val)}
        </span>
      ),
    },
    {
      key: 'features',
      label: 'Feature Profile (Standardized Inputs)',
      render: (val: any) => (
        <div className="font-mono text-[11px] text-slate-600">
          Footfall: {val?.avg_visitors?.toLocaleString() ?? 'N/A'} | Rating: {val?.avg_rating ?? 'N/A'} | Reviews: {val?.total_reviews ?? 'N/A'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Title & Academic Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Module 3 &bull; K-Means Clustering & Spatial Tourism Analytics</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Demonstration Data: Tamil Nadu Tourism Benchmark
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          K-Means Clustering and Model Evaluation
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Standardized feature vectors, multi-dimensional K-Means clustering, PCA 2D projection, inertia elbow validation, and silhouette coefficient calculation executed via Scikit-learn on MySQL warehouse records.
        </p>
      </div>

      {/* Error state alert */}
      {isClusteringError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold block">Clustering Model Execution Error</span>
            <span>{clusteringErrorMessage || 'Failed to fit K-Means model on current database records.'}</span>
            <button
              onClick={() => clusterMutation.mutate()}
              className="mt-2 block px-3 py-1 rounded bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
            >
              Retry Model Fitting
            </button>
          </div>
        </div>
      )}

      {/* Configuration & Parameter Bar */}
      <DataCard title="Model Hyperparameters & Feature Space" subtitle="Configure Scikit-learn execution parameters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* K Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Number of Clusters (k = {kValue})
            </label>
            <input
              type="range"
              min={2}
              max={6}
              value={kValue}
              onChange={(e) => setKValue(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>k=2</span>
              <span>k=3</span>
              <span>k=4</span>
              <span>k=5</span>
              <span>k=6</span>
            </div>
          </div>

          {/* Feature Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Feature Vector Components ({selectedFeatures.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'avg_visitors', label: 'Footfall' },
                { id: 'avg_rating', label: 'Rating' },
                { id: 'total_reviews', label: 'Review Count' },
                { id: 'demand_score', label: 'Demand Index' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFeature(f.id)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                    selectedFeatures.includes(f.id)
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={() => clusterMutation.mutate()}
              disabled={isClusteringLoading || selectedFeatures.length < 2}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isClusteringLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Fitting Scikit-learn Clusters...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute K-Means Model</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DataCard>

      {/* Model Quality Assessment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Silhouette Score S(i)</p>
            <p className="text-2xl font-bold font-mono text-teal-600 mt-1">
              {clusterData?.silhouette_score !== undefined
                ? clusterData.silhouette_score.toFixed(4)
                : isClusteringLoading
                ? 'Fitting...'
                : '—'}
            </p>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
              {clusterData?.silhouette_score !== undefined
                ? clusterData.silhouette_score >= 0.5
                  ? '• Strong cluster cohesion'
                  : '• Moderate cluster cohesion'
                : 'Awaiting execution'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Sum of Squared Errors (Inertia)</p>
            <p className="text-2xl font-bold font-mono text-indigo-600 mt-1">
              {clusterData?.inertia !== undefined
                ? clusterData.inertia.toFixed(2)
                : isClusteringLoading
                ? 'Fitting...'
                : '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {clusterData?.inertia !== undefined ? 'Within-cluster distance' : 'Awaiting execution'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Feature Normalization</p>
            <p className="text-lg font-bold text-slate-800 mt-1">StandardScaler</p>
            <p className="text-[10px] text-slate-400 mt-1">&mu; = 0, &sigma; = 1 zero-mean scaling</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics: PCA 2D Projection & Elbow Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PCA 2D Scatter Plot */}
        <DataCard
          title="Principal Component Analysis (PCA) 2D Projection"
          subtitle="Dimensionality reduction showing destination cluster separation (Demonstration data)"
        >
          {clusterData?.pca_points && clusterData.pca_points.length > 0 ? (
            <ScatterChartWidget points={clusterData.pca_points} height={320} />
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Layers className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No PCA Projection Available</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Click "Execute K-Means Model" to standardize features, fit clusters, and reduce dimensions via PCA.
              </p>
            </div>
          )}
        </DataCard>

        {/* Elbow Curve */}
        <DataCard
          title="Elbow Method Curve"
          subtitle="Inertia vs. k value identifying optimal cluster inflection point"
        >
          <div style={{ width: '100%', height: 320 }}>
            {isElbowLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <RotateCw className="w-5 h-5 animate-spin text-teal-600" />
                <span>Calculating Elbow curve across k=2 to k=8...</span>
              </div>
            ) : isElbowError ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                <AlertCircle className="w-6 h-6 text-rose-500" />
                <span className="text-xs font-semibold text-rose-700">Failed to calculate Elbow curve</span>
                <span className="text-[11px] text-slate-500 max-w-xs">
                  {(elbowError as Error)?.message || 'Endpoint calculation error'}
                </span>
                <button
                  onClick={() => refetchElbow()}
                  className="mt-1 px-3 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700 font-semibold transition-colors"
                >
                  Retry Calculation
                </button>
              </div>
            ) : elbowData && elbowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={elbowData} margin={{ top: 20, right: 25, bottom: 20, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="k"
                    stroke="#94A3B8"
                    fontSize={11}
                    label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    label={{ value: 'Inertia (SSE)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B', offset: -5 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101D35',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    formatter={(val: unknown) => [Number(val).toFixed(2), 'Inertia (SSE)']}
                    labelFormatter={(val) => `Clusters: k=${val}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="inertia"
                    name="Inertia"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: '#0D9488' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No Elbow curve data available.
              </div>
            )}
          </div>
        </DataCard>
      </div>

      {/* Destination Cluster Assignments Table */}
      <DataCard
        title="Destination Cluster Assignments & Profiles"
        subtitle={`Individual destination assignments computed via Scikit-learn K-Means (Total: ${clusterData?.assignments?.length || 0} destinations)`}
      >
        <DataTable
          columns={columns}
          data={clusterData?.assignments || []}
          pageSize={8}
          searchPlaceholder="Filter assigned destinations..."
        />
      </DataCard>
    </div>
  );
};
