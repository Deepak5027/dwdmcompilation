// === API Response Types ===
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[] | null;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// === Dataset Types ===
export interface Dataset {
  id: number;
  name: string;
  filename: string;
  original_filename?: string;
  source: string;
  description: string;
  upload_date: string;
  row_count?: number;
  column_count?: number;
  file_size?: number;
  status: string;
  geographic_coverage?: string;
  collection_date?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatasetPreview {
  columns: string[];
  rows: Record<string, any>[];
  total_rows: number;
  preview_rows?: number;
}

export interface DatasetValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  column_stats: Record<string, any>;
  detected_columns: string[];
  missing_required_columns: string[];
}

// === ETL Types ===
export interface ETLJob {
  id: number;
  dataset_id: number;
  status: string;
  started_at: string;
  completed_at?: string;
  records_processed: number;
  records_accepted: number;
  records_rejected: number;
  duplicates_found: number;
  missing_values_handled: number;
  validation_failures?: number;
  processing_duration_seconds: number;
  error_log?: string;
  transformation_log?: string;
  created_at?: string;
}

// === Web Mining & Sentiment Types ===
export interface KeywordResult {
  keyword: string;
  tfidf_score: number;
  frequency: number;
  destination_id?: string;
}

export interface TopicResult {
  topic_id: number;
  label: string;
  top_terms: string[];
  term_weights: Record<string, number>;
  sample_excerpts: string[];
}

export interface SentimentResult {
  destination_id: string;
  destination_name: string;
  positive: number;
  neutral: number;
  negative: number;
  average_score: number;
  total_reviews: number;
}

// === Demand & Forecasting Types ===
export interface DemandTrend {
  period: string;
  visitor_count: number;
  review_count?: number;
  average_rating?: number;
  demand_measure?: number;
  growth_rate?: number;
}

export interface SeasonalPattern {
  season: string;
  avg_visitors: number;
  destinations_count: number;
  peak_month?: string;
  visitor_share_pct?: number;
}

export interface ForecastResult {
  period: string;
  actual?: number;
  predicted: number;
  lower_bound?: number;
  upper_bound?: number;
  is_forecast: boolean;
}

// === Clustering Types ===
export interface ClusteringConfig {
  k_value: number;
  features: string[];
  max_iterations: number;
  random_state: number;
}

export interface PCAPoint {
  destination_id: string;
  destination_name: string;
  pca_x: number;
  pca_y: number;
  cluster_id: number;
  cluster_label: string;
}

export interface ClusterAssignment {
  destination_id: string;
  destination_name: string;
  district?: string;
  tourism_category?: string;
  cluster_id?: number;
  cluster?: number;
  cluster_label?: string;
  features?: Record<string, number>;
}

export interface ElbowPoint {
  k: number;
  inertia: number;
}

export interface ClusteringResult {
  id: number;
  k_value: number;
  inertia: number;
  silhouette_score: number;
  cluster_labels: string[];
  cluster_sizes?: Record<string, number>;
  cluster_centroids?: Array<Record<string, number>>;
  pca_points?: PCAPoint[];
  pca_data?: PCAPoint[];
  assignments?: ClusterAssignment[];
  cluster_assignments?: ClusterAssignment[];
  elbow_data?: ElbowPoint[];
  features_used?: string[];
  created_at: string;
}

// === Spatial Types ===
export interface SpatialDestination {
  destination_id: string;
  destination_name: string;
  city?: string;
  district: string;
  state?: string;
  latitude: number;
  longitude: number;
  tourism_category: string;
  visitor_count: number;
  average_rating: number;
  sentiment_score?: number;
  cluster_id?: number;
  cluster?: number;
  cluster_label?: string;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight?: number;
  intensity?: number;
  destination_name?: string;
}

// === Dashboard Types ===
export interface KPICard {
  id: string;
  title: string;
  value: string;
  numeric_value: number;
  unit?: string;
  trend_pct?: number;
  trend_direction: string;
  subtitle: string;
  icon: string;
}

export interface InsightCard {
  id?: string;
  category: string;
  title: string;
  description: string;
  metric_label: string;
  metric_value: string;
  badge_variant?: string;
  trend?: string;
  icon?: string;
}

export interface DashboardOverview {
  kpis: KPICard[];
  insights: InsightCard[];
  visitor_trends: DemandTrend[];
  category_distribution: Array<{ category: string; visitors: number; destinations_count: number }>;
  top_destinations: Array<{
    destination_id: string;
    destination_name: string;
    district: string;
    category: string;
    visitors: number;
    rating: number;
    demand: number;
  }>;
  sentiment_overview: Record<string, any>;
  cluster_summary: Record<string, any>;
  regional_metrics: Array<Record<string, any>>;
  last_updated: string;
}

// === Navigation & Component Types ===
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}
