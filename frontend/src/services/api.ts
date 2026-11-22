import axios from 'axios';
import type {
  APIResponse,
  Dataset,
  DatasetPreview,
  DatasetValidation,
  ETLJob,
  KeywordResult,
  TopicResult,
  SentimentResult,
  DemandTrend,
  SeasonalPattern,
  ForecastResult,
  ClusteringConfig,
  ClusteringResult,
  SpatialDestination,
  HeatmapPoint,
  DashboardOverview,
  InsightCard,
  TouristDestination,
  TouristMetadata,
  TripPlanResult,
} from '../types';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for uniform error parsing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// === Health & System ===
export const getHealth = () => api.get<APIResponse<Record<string, unknown>>>('/api/health');

// === Datasets (Module 1) ===
export const uploadDataset = (formData: FormData) =>
  api.post<APIResponse<Dataset>>('/api/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getDatasets = (page = 1, pageSize = 25) =>
  api.get<APIResponse<{ items: Dataset[]; total: number; page: number; total_pages: number }>>(
    '/api/datasets',
    { params: { page, page_size: pageSize } }
  );

export const getDataset = (id: number) => api.get<APIResponse<Dataset>>(`/api/datasets/${id}`);

export const getDatasetPreview = (id: number, rows = 50) =>
  api.get<APIResponse<DatasetPreview>>(`/api/datasets/${id}/preview`, { params: { rows } });

export const validateDataset = (id: number) =>
  api.post<APIResponse<DatasetValidation>>(`/api/datasets/${id}/validate`);

export const deleteDataset = (id: number) => api.delete<APIResponse<void>>(`/api/datasets/${id}`);

// === ETL Pipeline (Module 1) ===
export const executeETL = (datasetId: number) =>
  api.post<APIResponse<Record<string, unknown>>>('/api/etl/execute', { dataset_id: datasetId });

export const getETLHistory = (limit = 20) =>
  api.get<APIResponse<ETLJob[]>>('/api/etl/history', { params: { limit } });

export const getETLReport = (id: number) =>
  api.get<APIResponse<Record<string, unknown>>>(`/api/etl/${id}/report`);

// === Database & Warehouse (Module 1) ===
export const getDatabaseTables = () =>
  api.get<APIResponse<{ database_engine: string; schema_type: string; tables: Array<{ table_name: string; row_count: number; type: string }> }>>('/api/database/tables');

export const getDatabaseSchema = () =>
  api.get<APIResponse<Record<string, unknown>>>('/api/database/schema');

export const getDatabaseHealth = () =>
  api.get<APIResponse<Record<string, unknown>>>('/api/database/health');

export const executeQuery = (sql: string) =>
  api.post<APIResponse<{ columns: string[]; rows: Record<string, unknown>[]; returned_count: number }>>(
    '/api/database/query',
    { sql }
  );

// === Web Mining & Sentiment (Module 2) ===
export const extractKeywords = (params?: { destination_id?: string; top_n?: number }) =>
  api.post<APIResponse<KeywordResult[]>>('/api/web-mining/keywords', params || {});

export const extractTopics = (params?: { n_topics?: number; top_words?: number; destination_id?: string }) =>
  api.post<APIResponse<TopicResult[]>>('/api/web-mining/topics', params || {});

export const analyzeSentiment = (params?: { destination_id?: string }) =>
  api.post<APIResponse<Record<string, unknown>>>('/api/sentiment/analyze', params || {});

export const getSentimentSummary = (destinationId?: string) =>
  api.get<APIResponse<{
    total_reviews_analyzed: number;
    positive_count: number;
    neutral_count: number;
    negative_count: number;
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
    average_compound_score: number;
    destination_breakdown: Array<{ destination_id: string; name: string; avg_score: number; positive: number; neutral: number; negative: number }>;
  }>>('/api/sentiment/summary', { params: { destination_id: destinationId } });

export const scoreSingleText = (text: string) =>
  api.post<APIResponse<{
    compound: number;
    positive: number;
    neutral: number;
    negative: number;
    category: 'positive' | 'neutral' | 'negative';
  }>>('/api/sentiment/score-text', { text });

// === Demand & Forecasting (Module 2) ===
export const getDemandTrends = (limit = 24) =>
  api.get<APIResponse<DemandTrend[]>>('/api/demand/trends', { params: { limit } });

export const getSeasonality = () =>
  api.get<APIResponse<SeasonalPattern[]>>('/api/demand/seasonality');

export const generateForecast = (params: { periods?: number; destination_id?: string; alpha?: number }) =>
  api.post<APIResponse<{
    destination_id?: string;
    method: string;
    history_points: number;
    forecast_points: number;
    series: ForecastResult[];
    metrics: Record<string, number>;
  }>>('/api/demand/forecast', params);

// === K-Means Clustering (Module 3) ===
export const executeClustering = (config: ClusteringConfig) =>
  api.post<APIResponse<ClusteringResult>>('/api/clustering/execute', config);

export const runElbowMethod = (features?: string[]) =>
  api.post<APIResponse<Array<{ k: number; inertia: number }>>>('/api/clustering/elbow', features ? { features } : {});

export const getClusteringResults = (limit = 10) =>
  api.get<APIResponse<Array<{ id: number; name: string; k_value: number; inertia: number; silhouette_score: number; created_at: string }>>>(
    '/api/clustering/results',
    { params: { limit } }
  );

export const getClusteringResultDetail = (id: number) =>
  api.get<APIResponse<ClusteringResult>>(`/api/clustering/results/${id}`);

// === Spatial Analytics (Module 3) ===
export const getSpatialDestinations = () =>
  api.get<APIResponse<SpatialDestination[]>>('/api/spatial/destinations');

export const getHeatmapData = () =>
  api.get<APIResponse<HeatmapPoint[]>>('/api/spatial/heatmap');

export const getHotspots = () =>
  api.get<APIResponse<Array<{ hotspot_id: number; center_lat: number; center_lon: number; district: string; destinations_included: string[]; total_footfall: number; average_rating: number; density_rank: string }>>>(
    '/api/spatial/hotspots'
  );

export const calculateDistance = (originId: string, destinationId: string) =>
  api.post<APIResponse<{ origin: string; destination: string; distance_km: number; origin_coords: { latitude: number; longitude: number }; destination_coords: { latitude: number; longitude: number } }>>(
    '/api/spatial/distance',
    { origin_id: originId, destination_id: destinationId }
  );

// === Dashboard & BI (Module 4) ===
export const getDashboardOverview = () =>
  api.get<APIResponse<DashboardOverview>>('/api/dashboard/overview');

export const getVisitorAnalytics = (limit = 12) =>
  api.get<APIResponse<{ trends: DemandTrend[]; category_distribution: Array<{ category: string; visitors: number; destinations_count: number }> }>>(
    '/api/dashboard/visitors',
    { params: { limit } }
  );

export const getDestinationAnalytics = (limit = 10) =>
  api.get<APIResponse<Array<{ destination_id: string; destination_name: string; district: string; category: string; visitors: number; rating: number; demand: number }>>>(
    '/api/dashboard/destinations',
    { params: { limit } }
  );

export const getDashboardInsights = () =>
  api.get<APIResponse<InsightCard[]>>('/api/dashboard/insights');

// === Reports & Export ===
export const exportReport = (params: { report_type: string; format: string; title?: string }) =>
  api.post<APIResponse<{ report_id: string; format: string; filename: string; download_url: string; record_count: number }>>(
    '/api/reports/export',
    params
  );

// === Global Search ===
export const globalSearch = (q: string) =>
  api.get<APIResponse<Array<{ type: string; title: string; subtitle: string; route: string; id: string }>>>(
    '/api/search',
    { params: { q } }
  );

// === Tourist Experience & Recommender ===
export const getTouristMetadata = () =>
  api.get<APIResponse<TouristMetadata>>('/api/tourist/metadata');

export const getTouristRecommendations = (params?: {
  district?: string;
  vibe?: string;
  origin_district?: string;
  sort_by?: string;
  min_rating?: number;
}) =>
  api.get<APIResponse<{
    total_matches: number;
    destinations: TouristDestination[];
    applied_filters: Record<string, string>;
  }>>('/api/tourist/destinations', { params });

export const planTouristTrip = (destination_ids: string[]) =>
  api.post<APIResponse<TripPlanResult>>('/api/tourist/plan-trip', { destination_ids });

