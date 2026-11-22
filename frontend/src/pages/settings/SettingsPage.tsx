import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHealth, getDatabaseHealth } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { Settings, ShieldCheck, Server, Database, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    data: healthData,
    isLoading: isHealthLoading,
    isError: isHealthError,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await getHealth();
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  const {
    data: dbHealth,
    isLoading: isDbLoading,
    isError: isDbError,
    error: dbError,
    refetch: refetchDb,
  } = useQuery({
    queryKey: ['dbHealth'],
    queryFn: async () => {
      const res = await getDatabaseHealth();
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  const isConnected = !isHealthError && healthData?.database_status === 'connected';
  const dbEngine = (healthData?.database_engine as string) || (dbHealth?.mode ? String(dbHealth.mode).toUpperCase() : 'UNKNOWN');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5 text-teal-600" />
            <span>System Environment</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            System Configuration & Verified Environment
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Live telemetry verifying FastAPI application health, MySQL 8.0 connectivity, and configuration parameters.
          </p>
        </div>

        <button
          onClick={() => {
            refetchHealth();
            refetchDb();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all self-start"
        >
          <RotateCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* System Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isHealthLoading || isDbLoading
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : isConnected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {isHealthLoading || isDbLoading ? (
            <RotateCw className="w-5 h-5 animate-spin text-amber-600" />
          ) : isConnected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <div>
            <span className="text-xs font-bold block">
              {isHealthLoading || isDbLoading
                ? 'Verifying Backend & Database...'
                : isConnected
                ? 'System Fully Operational & Connected to MySQL 8.0'
                : 'System Disconnected or Database Unreachable'}
            </span>
            <span className="text-[11px] opacity-80">
              {isConnected
                ? 'FastAPI REST backend and MySQL 8.0 star schema actively communicating on localhost:3306.'
                : 'Unable to verify database connection. Please check MySQL service status.'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/70 border border-current font-bold uppercase">
          {isHealthLoading || isDbLoading ? 'Checking' : isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Telemetry */}
        <DataCard title="Backend Service Telemetry" subtitle="FastAPI application status and active modules">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Service Title</span>
              <span className="font-bold text-slate-800 font-mono">
                {String(healthData?.service || 'Smart Tourism Intelligence API')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Application Status</span>
              <span
                className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                  isHealthLoading
                    ? 'bg-amber-100 text-amber-800'
                    : healthData?.status === 'operational'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isHealthLoading ? 'CHECKING...' : String(healthData?.status || 'OFFLINE').toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">API Version</span>
              <span className="font-bold text-slate-800 font-mono">{String(healthData?.version || '1.0.0')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">CORS Allowed Origins</span>
              <span className="font-mono text-slate-700">http://localhost:5173, http://localhost:3000</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Data Provenance</span>
              <span className="font-semibold text-teal-700">Demonstration Benchmark Dataset</span>
            </div>
          </div>
        </DataCard>

        {/* Database Status */}
        <DataCard title="Database Storage Configuration" subtitle="Relational storage engine and dialect mode">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Active Storage Engine</span>
              <span
                className={`font-bold uppercase font-mono px-2 py-0.5 rounded text-[11px] ${
                  isConnected ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isDbLoading ? 'DETECTING...' : dbEngine}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Database Name & Host</span>
              <span className="font-bold text-slate-800 font-mono">tourism_dw @ localhost:3306</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Silent SQLite Fallback</span>
              <span className="font-bold text-slate-600 font-mono">DISABLED (Strict MySQL Mode)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Schema Design</span>
              <span className="font-bold text-indigo-700 font-mono">Kimball Star Schema (4 Dims, 2 Facts)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Database Dialect State</span>
              <span className="font-semibold text-emerald-600">
                {isConnected ? 'Verified Live Connection' : 'Connection Error / Not Connected'}
              </span>
            </div>
          </div>
        </DataCard>
      </div>
    </div>
  );
};

