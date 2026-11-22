import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatasets, executeETL, getETLHistory } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { DataTable } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/feedback/StatusBadge';
import { formatDate } from '../../utils/format';
import { ETLJob, TableColumn } from '../../types';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  FileCheck2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const ETLPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | ''>('');
  const [latestReport, setLatestReport] = useState<Record<string, unknown> | null>(null);

  // Load available datasets
  const { data: datasetsData } = useQuery({
    queryKey: ['datasetsList'],
    queryFn: async () => {
      const res = await getDatasets(1, 100);
      return res.data.data;
    },
  });

  // Load ETL History
  const { data: etlHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['etlHistory'],
    queryFn: async () => {
      const res = await getETLHistory(15);
      return res.data.data;
    },
  });

  // ETL Execution Mutation
  const etlMutation = useMutation({
    mutationFn: async (datasetId: number) => {
      const res = await executeETL(datasetId);
      return res.data.data;
    },
    onSuccess: (data) => {
      setLatestReport(data);
      queryClient.invalidateQueries({ queryKey: ['etlHistory'] });
      queryClient.invalidateQueries({ queryKey: ['datasetsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });

  const handleRunETL = () => {
    if (!selectedDatasetId) {
      alert('Please select a dataset to process through the ETL pipeline.');
      return;
    }
    etlMutation.mutate(Number(selectedDatasetId));
  };

  const columns: TableColumn<ETLJob>[] = [
    {
      key: 'id',
      label: 'Job Run #',
      render: (val) => <span className="font-mono font-bold text-slate-800 text-xs">ETL-00{String(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={String(val)} />,
    },
    {
      key: 'records_processed',
      label: 'Processed',
      render: (val) => <span className="text-xs font-semibold text-slate-700">{String(val)}</span>,
    },
    {
      key: 'records_accepted',
      label: 'Accepted',
      render: (val) => <span className="text-xs font-semibold text-emerald-600">{String(val)}</span>,
    },
    {
      key: 'records_rejected',
      label: 'Rejected',
      render: (val) => <span className="text-xs font-semibold text-rose-600">{String(val)}</span>,
    },
    {
      key: 'processing_duration_seconds',
      label: 'Duration',
      render: (val) => <span className="text-xs text-slate-500">{Number(val).toFixed(2)}s</span>,
    },
    {
      key: 'started_at',
      label: 'Execution Time',
      render: (val) => <span className="text-xs text-slate-400">{formatDate(String(val))}</span>,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Title */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <RotateCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
            <span>Module 1 &bull; Data Cleaning & ETL Processing</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Demonstration Data Pipeline
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Data Cleaning, Validation & ETL Processing Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Deterministic transformation pipeline executing schema validation, coordinate bounding checks, text normalization, and dimensional surrogate key loading into MySQL 8.0.
        </p>
      </div>

      {/* Visual Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1: Extract */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
              Stage 1
            </span>
            <FileCheck2 className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 font-heading">Extract</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ingests raw CSV/XLSX streams. Validates header encoding, detects column datatypes, and checks presence of mandatory geographic keys.
          </p>
        </div>

        {/* Stage 2: Transform */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
              Stage 2
            </span>
            <RotateCw className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 font-heading">Transform & Clean</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Removes exact duplicates, clips ratings [1-5], verifies Tamil Nadu coordinate boundaries [8°-13.6°N], and calculates demand indices.
          </p>
        </div>

        {/* Stage 3: Load */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
              Stage 3
            </span>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 font-heading">Load to Star Schema</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Upserts four dimensional tables (Date, Location, Category, Destination) and inserts records into FactVisitorAnalytics with surrogate keys.
          </p>
        </div>
      </div>

      {/* Execution Control Section */}
      <DataCard title="Pipeline Execution Control" subtitle="Select an ingested dataset to process">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="">-- Select Ingested Tourism Dataset --</option>
              {datasetsData?.items?.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.status.toUpperCase()} &bull; {ds.filename})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunETL}
            disabled={!selectedDatasetId || etlMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {etlMutation.isPending ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Transforming & Loading...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute ETL Pipeline</span>
              </>
            )}
          </button>
        </div>
      </DataCard>

      {/* Real Data Quality Report Display */}
      {latestReport && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <DataCard
            title="Data Quality & Validation Audit Report"
            subtitle={`Job Run #${latestReport.job_id} &bull; Dataset: ${latestReport.dataset_name}`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 font-bold uppercase">Processed</p>
                <p className="text-xl font-bold font-heading text-slate-900 mt-1">
                  {String(latestReport.records_processed)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-[11px] text-emerald-700 font-bold uppercase">Accepted</p>
                <p className="text-xl font-bold font-heading text-emerald-800 mt-1">
                  {String(latestReport.records_accepted)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <p className="text-[11px] text-rose-700 font-bold uppercase">Rejected</p>
                <p className="text-xl font-bold font-heading text-rose-800 mt-1">
                  {String(latestReport.records_rejected)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center">
                <p className="text-[11px] text-teal-700 font-bold uppercase">Acceptance Rate</p>
                <p className="text-xl font-bold font-heading text-teal-800 mt-1">
                  {String(latestReport.acceptance_rate_pct)}%
                </p>
              </div>
            </div>

            {/* Quality Summary Log */}
            <div className="p-4 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs space-y-1.5">
              <div className="text-teal-400 font-bold mb-2">=== ETL EXECUTION LOG ===</div>
              {(latestReport.transformation_summary as string[] || []).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
              <div className="text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                Execution took {Number(latestReport.duration_seconds).toFixed(2)}s &bull; Star schema updated
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {/* Historical Job Runs */}
      <DataCard title="ETL Audit Trail" subtitle="Historical batch runs and transformation timestamps">
        <DataTable
          columns={columns}
          data={(etlHistory as unknown as ETLJob[]) || []}
          pageSize={8}
          searchPlaceholder="Filter execution jobs..."
        />
      </DataCard>
    </div>
  );
};

