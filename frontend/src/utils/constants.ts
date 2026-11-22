export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  path: string;
  children?: Array<{ id: string; label: string; path: string }>;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'LayoutDashboard',
    path: '/',
  },
  {
    id: 'tourist-guide',
    label: 'Tourist Guide & Recommender',
    iconName: 'Compass',
    path: '/tourist-guide',
  },
  {
    id: 'module1',
    label: 'Data & Warehouse',
    iconName: 'Database',
    path: '/module1',
    children: [
      { id: 'm1-upload', label: 'Data Ingestion & Upload', path: '/module1/upload' },
      { id: 'm1-etl', label: 'Cleaning & ETL Pipeline', path: '/module1/etl' },
      { id: 'm1-database', label: 'Star Schema Warehouse', path: '/module1/database' },
    ],
  },
  {
    id: 'module2',
    label: 'Web Mining & Demand',
    iconName: 'Search',
    path: '/module2',
    children: [
      { id: 'm2-mining', label: 'Web Mining & Sentiment', path: '/module2/mining' },
      { id: 'm2-demand', label: 'Demand Patterns & Forecast', path: '/module2/demand' },
    ],
  },
  {
    id: 'module3',
    label: 'K-Means & Spatial',
    iconName: 'Map',
    path: '/module3',
    children: [
      { id: 'm3-clustering', label: 'K-Means Clustering', path: '/module3/clustering' },
      { id: 'm3-spatial', label: 'Spatial Analytics & Hotspots', path: '/module3/spatial' },
    ],
  },
  {
    id: 'module4',
    label: 'Dashboard',
    iconName: 'BarChart3',
    path: '/module4/dashboard',
  },
  {
    id: 'documentation',
    label: 'Documentation & Architecture',
    iconName: 'BookOpen',
    path: '/documentation',
  },
  {
    id: 'settings',
    label: 'System Settings',
    iconName: 'Settings',
    path: '/settings',
  },
];

export const CHART_COLORS = [
  '#0D9488', // Primary Teal
  '#3B82F6', // Accent Blue
  '#4338CA', // Indigo
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const TAMIL_NADU_CENTER: [number, number] = [11.1271, 78.6569];
export const DEFAULT_MAP_ZOOM = 7;

