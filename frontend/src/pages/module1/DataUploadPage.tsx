import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatasets, uploadDataset, getDatasetPreview, deleteDataset } from '../../services/api';
import { FileUpload } from '../../components/forms/FileUpload';
import { DataCard } from '../../components/cards/DataCard';
import { DataTable } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/feedback/StatusBadge';
import { formatDate, formatFileSize } from '../../utils/format';
import { Dataset, TableColumn } from '../../types';
import { Eye, Trash2, CheckCircle2, AlertCircle, FileSpreadsheet, Sparkles } from 'lucide-react';

export const DataUploadPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [description, setDescription] = useState('');
  const [previewDatasetId, setPreviewDatasetId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Dataset List
  const { data: datasetsData, isLoading } = useQuery({
    queryKey: ['datasetsList'],
    queryFn: async () => {
      const res = await getDatasets(1, 50);
      return res.data.data;
    },
  });

  // Fetch Preview when an ID is selected
  const { data: previewData, isLoading: isPreviewLoading } = useQuery({
    queryKey: ['datasetPreview', previewDatasetId],
    queryFn: async () => {
      if (!previewDatasetId) return null;
      const res = await getDatasetPreview(previewDatasetId, 25);
      return res.data.data;
    },
    enabled: !!previewDatasetId,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('Please select a file to upload');
      if (!datasetName.trim()) throw new Error('Dataset name is mandatory');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', datasetName);
      formData.append('source', sourceName || 'Direct Field Ingestion');
      formData.append('description', description || 'Tourism visitor observation telemetry');
      formData.append('geographic_coverage', 'Tamil Nadu, India');

      return await uploadDataset(formData);
    },
    onSuccess: () => {
      setSelectedFile(null);
      setDatasetName('');
      setSourceName('');
      setDescription('');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['datasetsList'] });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteDataset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasetsList'] });
      if (previewDatasetId) setPreviewDatasetId(null);
    },
  });

  const columns: TableColumn<Dataset>[] = [
    {
      key: 'name',
      label: 'Dataset Identifier',
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{String(val)}</div>
          <div className="text-[11px] text-slate-400">{row.filename}</div>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Source / Provenance',
      render: (val) => <span className="text-slate-600 text-xs">{String(val || 'Direct Ingestion')}</span>,
    },
    {
      key: 'row_count',
      label: 'Volume',
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {val ? `${val} rows` : `${formatFileSize(row.file_size)}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Pipeline State',
      render: (val) => <StatusBadge status={String(val)} />,
    },
    {
      key: 'upload_date',
      label: 'Ingestion Date',
      render: (val) => <span className="text-xs text-slate-500">{formatDate(String(val))}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewDatasetId(row.id)}
            className="p-1 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
            title="Inspect Data Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove dataset "${row.name}"?`)) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete dataset"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Title Banner */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Module 1 &bull; Data Collection & Upload</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Demonstration Data Archive
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Tourism Data Collection, Upload & Inspection
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Ingest, validate, and inspect tourism observation datasets before triggering ETL transformations into the MySQL 8.0 Kimball star schema.
        </p>
      </div>

      {/* Upload Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropzone Column */}
        <div className="lg:col-span-1">
          <DataCard title="Dataset Ingestion Gate" subtitle="Upload CSV or XLSX file">
            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (!datasetName) {
                  setDatasetName(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                }
              }}
              onClear={() => setSelectedFile(null)}
              error={errorMessage}
            />

            {/* Ingestion Parameters Form */}
            {selectedFile && (
              <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Dataset Title *</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g. Tamil Nadu Summer 2024 Tourism Survey"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Source / Attribution</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g. State Tourism Board / Open Data"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Scope, methodology, or geographical boundary notes"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  onClick={() => uploadMutation.mutate()}
                  disabled={uploadMutation.isPending}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? 'Validating & Uploading...' : 'Confirm Ingestion'}
                </button>
              </div>
            )}
          </DataCard>
        </div>

        {/* Datasets Table */}
        <div className="lg:col-span-2">
          <DataCard
            title="Ingested Tourism Datasets"
            subtitle="Uploaded datasets awaiting or processed through the ETL pipeline"
          >
            <DataTable
              columns={columns}
              data={(datasetsData?.items as unknown as Dataset[]) || []}
              pageSize={6}
              searchPlaceholder="Filter uploaded datasets..."
            />
          </DataCard>
        </div>
      </div>

      {/* Dataset Preview Section */}
      {previewDatasetId && previewData && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <DataCard
            title={`Dataset Record Inspection (ID: ${previewDatasetId})`}
            subtitle={`Inspecting preview sample of ${previewData.preview_rows} rows from ${previewData.total_rows} total records`}
            action={
              <button
                onClick={() => setPreviewDatasetId(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Close Preview
              </button>
            }
          >
            <div className="overflow-x-auto max-h-96 rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    {previewData.columns.map((c) => (
                      <th key={c} className="px-3 py-2.5 whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {previewData.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {previewData.columns.map((col) => (
                        <td key={col} className="px-3 py-2 whitespace-nowrap text-slate-700">
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataCard>
        </div>
      )}
    </div>
  );
};

