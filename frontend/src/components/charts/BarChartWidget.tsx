import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactNumber } from '../../utils/format';

interface BarChartWidgetProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  barColor?: string;
  height?: number;
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({
  data,
  xKey,
  yKey,
  barColor = '#3B82F6',
  height = 300,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            stroke="#94A3B8"
            fontSize={11}
            dy={8}
            interval={0}
          />
          <YAxis
            tickLine={false}
            stroke="#94A3B8"
            fontSize={11}
            tickFormatter={(val) => formatCompactNumber(Number(val))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#101D35',
              borderColor: '#1E293B',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            }}
            formatter={(val: unknown) => [
              `${Number(val).toLocaleString()} visitors`,
              'Annual Footfall',
            ]}
          />
          <Bar dataKey={yKey} fill={barColor} radius={[6, 6, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
