import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { OverviewDashboard } from './pages/overview/OverviewDashboard';
import { DataUploadPage } from './pages/module1/DataUploadPage';
import { ETLPage } from './pages/module1/ETLPage';
import { DatabasePage } from './pages/module1/DatabasePage';
import { WebMiningPage } from './pages/module2/WebMiningPage';
import { DemandPage } from './pages/module2/DemandPage';
import { ClusteringPage } from './pages/module3/ClusteringPage';
import { SpatialPage } from './pages/module3/SpatialPage';
import { InsightsDashboardPage } from './pages/module4/InsightsDashboardPage';
import { DocumentationPage } from './pages/documentation/DocumentationPage';
import { SettingsPage } from './pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewDashboard />} />
            
            {/* Module 1: Data Collection & MySQL */}
            <Route path="module1">
              <Route index element={<Navigate to="upload" replace />} />
              <Route path="upload" element={<DataUploadPage />} />
              <Route path="etl" element={<ETLPage />} />
              <Route path="database" element={<DatabasePage />} />
            </Route>

            {/* Module 2: Web Mining & Demand */}
            <Route path="module2">
              <Route index element={<Navigate to="mining" replace />} />
              <Route path="mining" element={<WebMiningPage />} />
              <Route path="demand" element={<DemandPage />} />
            </Route>

            {/* Module 3: K-Means & Spatial Analytics */}
            <Route path="module3">
              <Route index element={<Navigate to="clustering" replace />} />
              <Route path="clustering" element={<ClusteringPage />} />
              <Route path="spatial" element={<SpatialPage />} />
            </Route>

            {/* Module 4: BI Insights Dashboard */}
            <Route path="module4">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InsightsDashboardPage />} />
            </Route>

            {/* Documentation & Settings */}
            <Route path="documentation" element={<DocumentationPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

