import React from 'react';
import { DataCard } from '../../components/cards/DataCard';
import { BookOpen, Database, Search, Layers, BarChart3, CheckCircle2, Compass, ShieldCheck } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Banner */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          <span>Academic System Architecture</span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          System Documentation and Technical Specifications
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Comprehensive engineering documentation covering Kimball star schema design, algorithmic derivations, and module responsibilities.
        </p>
      </div>

      {/* Project Identity */}
      <DataCard title="Capstone Project Identity" subtitle="B.Tech Computer Science & Engineering Capstone Project">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Project Title</span>
            <p className="font-bold text-slate-800 mt-1 text-sm font-heading">
              Smart Tourism Intelligence and Visitor Analytics Platform Using Destination Demand Mining and Spatial-Web Analytics
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Core Domains</span>
            <p className="font-semibold text-slate-700 mt-1">
              Data Warehousing, Data Mining, Web Mining, Machine Learning, Geospatial Analytics, and Business Intelligence.
            </p>
          </div>
        </div>
      </DataCard>

      {/* 4 Academic Modules Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard title="Module 1: Data Collection & MySQL Warehouse" subtitle="Data Ingestion, ETL, and Dimensional Modeling">
          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Ingestion & Parsing:</strong> Accepts CSV and XLSX files, validates headers, and prevents path traversal.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>ETL Pipeline:</strong> Deduplication, missing-value resolution, Tamil Nadu coordinate boundary verification [8°-13.6°N].</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Kimball Star Schema:</strong> 4 dimension tables (dim_destination, dim_location, dim_date, dim_tourism_category) and 2 fact tables (fact_visitor_analytics, fact_tourism_reviews).</span>
            </li>
          </ul>
        </DataCard>

        <DataCard title="Module 2: Web Mining & Tourism Demand Patterns" subtitle="NLP Text Mining, Sentiment Analysis, and Forecasting">
          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>TF-IDF Term Extraction:</strong> Computes Term Frequency-Inverse Document Frequency scores over tokenized review corpora.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Latent Dirichlet Allocation:</strong> Discovers latent semantic topics with statistical term probability weights.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>VADER Sentiment Classifier:</strong> Lexicon-based polarity scoring categorized into Positive, Neutral, and Negative.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Holt-Winters Forecasting:</strong> Longitudinal exponential smoothing with MAE, RMSE, and MAPE error metrics.</span>
            </li>
          </ul>
        </DataCard>

        <DataCard title="Module 3: K-Means Clustering & Spatial Analytics" subtitle="Unsupervised Learning, Dimensionality Reduction, and GIS">
          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Feature Standardization:</strong> StandardScaler transformation (&mu;=0, &sigma;=1) on multi-dimensional vectors.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>K-Means Clustering:</strong> Cluster partition algorithm with inertia calculation and silhouette score evaluation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>PCA 2D Projection:</strong> Dimensionality reduction mapping high-dimensional spaces to 2D Cartesian coordinates.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Haversine Geodesic Distance:</strong> Great-circle spherical distance calculations preventing planar distortion.</span>
            </li>
          </ul>
        </DataCard>

        <DataCard title="Module 4: Executive Business Intelligence Dashboard" subtitle="Synthesized Decision Support and Reporting">
          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Unified Telemetry:</strong> Integrates facts, sentiment, and spatial clusters into a unified executive view.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Data-Driven Insights:</strong> Automated insight generation derived strictly from empirical database results.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Multi-Format Exports:</strong> Live executive PDF brief generation via fpdf2 and filtered CSV export.</span>
            </li>
          </ul>
        </DataCard>
      </div>
    </div>
  );
};

