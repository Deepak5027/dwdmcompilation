import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

interface PCAScatterPoint {
  destination_id: string;
  destination_name: string;
  pca_x: number;
  pca_y: number;
  cluster_id: number;
  cluster_label: string;
}

interface ScatterChartWidgetProps {
  points: PCAScatterPoint[];
  height?: number;
}

export const ScatterChartWidget: React.FC<ScatterChartWidgetProps> = ({
  points,
  height = 360,
}) => {
  // Group points by cluster
  const clusterGroups = points.reduce((acc, pt) => {
    acc[pt.cluster_id] = acc[pt.cluster_id] || [];
    acc[pt.cluster_id].push(pt);
    return acc;
  }, {} as Record<number, PCAScatterPoint[]>);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            type="number"
            dataKey="pca_x"
            name="Principal Component 1"
            tickLine={false}
            stroke="#94A3B8"
            fontSize={11}
            label={{ value: 'PCA Component 1 (Footfall & Scale)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748B' }}
          />
          <YAxis
            type="number"
            dataKey="pca_y"
            name="Principal Component 2"
            tickLine={false}
            stroke="#94A3B8"
            fontSize={11}
            label={{ value: 'PCA Component 2 (Rating & Sentiment)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
          />
          <ZAxis range={[70, 70]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (payload && payload.length) {
                const data = payload[0].payload as PCAScatterPoint;
                return (
                  <div className="bg-[#101D35] text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
                    <p className="font-bold text-teal-400 mb-1">{data.destination_name}</p>
                    <p className="text-slate-300">Cluster: {data.cluster_label}</p>
                    <p className="text-slate-400 text-[10px] mt-1">
                      PC1: {data.pca_x.toFixed(2)} | PC2: {data.pca_y.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          {Object.entries(clusterGroups).map(([clusterId, pts], idx) => (
            <Scatter
              key={clusterId}
              name={pts[0]?.cluster_label || `Cluster ${clusterId}`}
              data={pts}
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

