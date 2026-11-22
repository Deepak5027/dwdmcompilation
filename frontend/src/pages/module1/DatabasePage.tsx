import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getDatabaseTables, getDatabaseSchema, executeQuery } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { Database, Terminal, ShieldAlert, Table as TableIcon, Layers, Play, CheckCircle } from 'lucide-react';

export const DatabasePage: React.FC = () => {
  const [sqlQuery, setSqlQuery] = useState('SELECT destination_id, destination_name, city, tourism_category, latitude, longitude FROM dim_destination LIMIT 10;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: Record<string, unknown>[]; returned_count: number } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Fetch Tables
  const { data: tablesData, isLoading: isTablesLoading } = useQuery({
    queryKey: ['warehouseTables'],
    queryFn: async () => {
      const res = await getDatabaseTables();
      return res.data.data;
    },
  });

  // Fetch Schema Structure
  const { data: schemaData } = useQuery({
    queryKey: ['warehouseSchema'],
    queryFn: async () => {
      const res = await getDatabaseSchema();
      return res.data.data;
    },
  });

  // Query Execution Mutation
  const queryMutation = useMutation({
    mutationFn: async (sql: string) => {
      setQueryError(null);
      const res = await executeQuery(sql);
      return res.data.data;
    },
    onSuccess: (data) => {
      setQueryResult(data);
    },
    onError: (err: Error) => {
      setQueryError(err.message);
      setQueryResult(null);
    },
  });

  const handleRunQuery = () => {
    if (!sqlQuery.trim()) return;
    queryMutation.mutate(sqlQuery);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Title */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Module 1 &bull; MySQL Database Management & Star Schema</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Demonstration Star Schema Archive
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          MySQL Database Management & Kimball Star Schema
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Relational data warehouse architecture implementing surrogate keys, explicit grain definitions, dimension normalization, and indexed fact tables in MySQL 8.0.
        </p>
      </div>

      {/* Database Metadata Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            SQL
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Engine Dialect</p>
            <p className="text-sm font-bold text-teal-700 font-mono">
              {isTablesLoading ? 'DETECTING...' : tablesData?.database_engine === 'MYSQL' ? 'MySQL 8.0 (Active)' : tablesData?.database_engine || 'DISCONNECTED'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            DW
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Schema Architecture</p>
            <p className="text-sm font-bold text-slate-800">Dimensional Star Schema</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            GR
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Fact Table Grain</p>
            <p className="text-sm font-bold text-slate-800">Monthly Destination Observation</p>
          </div>
        </div>
      </div>

      {/* Live Table Metrics Grid */}
      <DataCard title="Data Warehouse Tables" subtitle="Live record counts across dimensions and facts">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tablesData?.tables?.map((t) => (
            <div
              key={t.table_name}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-400 transition-all flex flex-col justify-between"
            >
              <div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    t.type === 'Fact'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {t.type}
                </span>
                <p className="font-mono text-xs font-bold text-slate-800 mt-2 truncate" title={t.table_name}>
                  {t.table_name}
                </p>
              </div>
              <p className="text-sm font-bold font-heading text-slate-900 mt-2">
                {t.row_count.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">rows</span>
              </p>
            </div>
          ))}
        </div>
      </DataCard>

      {/* Star Schema Interactive Diagram */}
      <DataCard
        title="Kimball Dimensional Star Schema"
        subtitle="Central fact table linked to surrounding dimensions via surrogate integer foreign keys"
      >
        <div className="p-6 bg-slate-900 rounded-xl text-white overflow-x-auto">
          <div className="min-w-[650px] flex items-center justify-center gap-8">
            {/* Left Dimensions */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-800 rounded-lg border border-teal-500/30 text-xs w-48 shadow-md">
                <span className="text-[10px] text-teal-400 font-bold uppercase">Dimension</span>
                <h4 className="font-bold text-slate-100">dim_destination</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">PK: destination_key</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-teal-500/30 text-xs w-48 shadow-md">
                <span className="text-[10px] text-teal-400 font-bold uppercase">Dimension</span>
                <h4 className="font-bold text-slate-100">dim_location</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">PK: location_key</p>
              </div>
            </div>

            {/* Central Fact */}
            <div className="p-5 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl border-2 border-indigo-500/50 text-xs w-64 shadow-2xl text-center">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/20 px-2 py-0.5 rounded">
                Central Fact Table
              </span>
              <h3 className="font-bold text-sm text-white font-heading mt-2">fact_visitor_analytics</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">PK: visitor_fact_id</p>
              <div className="text-[10px] text-slate-300 mt-3 pt-3 border-t border-indigo-500/20 text-left font-mono space-y-1">
                <div>&bull; visitor_count (Measure)</div>
                <div>&bull; review_count (Measure)</div>
                <div>&bull; average_rating (Measure)</div>
                <div>&bull; demand_measure (Measure)</div>
              </div>
            </div>

            {/* Right Dimensions */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-800 rounded-lg border border-teal-500/30 text-xs w-48 shadow-md">
                <span className="text-[10px] text-teal-400 font-bold uppercase">Dimension</span>
                <h4 className="font-bold text-slate-100">dim_date</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">PK: date_key (YYYYMMDD)</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-teal-500/30 text-xs w-48 shadow-md">
                <span className="text-[10px] text-teal-400 font-bold uppercase">Dimension</span>
                <h4 className="font-bold text-slate-100">dim_tourism_category</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">PK: category_key</p>
              </div>
            </div>
          </div>
        </div>
      </DataCard>

      {/* Safe SQL Query Workspace */}
      <DataCard
        title="SQL Query Workspace"
        subtitle="Execute read-only analytical queries against warehouse tables with security restrictions"
      >
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
              placeholder="Enter SELECT query..."
              className="w-full p-4 font-mono text-xs bg-slate-900 text-teal-300 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Read-only SELECT enforcement active. Destructive statements forbidden.</span>
            </div>
            <button
              onClick={handleRunQuery}
              disabled={queryMutation.isPending}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{queryMutation.isPending ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>

          {queryError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-mono">
              {queryError}
            </div>
          )}

          {queryResult && (
            <div className="mt-4 overflow-x-auto max-h-72 rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase font-mono">
                    {queryResult.columns.map((c) => (
                      <th key={c} className="px-3 py-2 whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {queryResult.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {queryResult.columns.map((col) => (
                        <td key={col} className="px-3 py-2 whitespace-nowrap text-slate-700">
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DataCard>
    </div>
  );
};

