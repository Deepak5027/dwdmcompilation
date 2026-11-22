import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactNumber } from '../../utils/format';

interface AreaChartWidgetProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  strokeColor?: string;
  fillColor?: string;
  height?: number;
  yLabel?: string;
}

export const AreaChartWidget: React.FC<AreaChartWidgetProps> = ({
  data,
  xKey,
  yKey,
  strokeColor = '#0D9488',
  fillColor = '#0D9488',
  height = 300,
  yLabel,
}) => {
  // Format period for display: "2023-01" -> "Jan 2023"
  const formatPeriodLabel = (val: string) => {
    if (!val) return '';
    const parts = String(val).split('-');
    if (parts.length === 2) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (monthNum >= 1 && monthNum <= 12) {
        return `${months[monthNum - 1]} ${year}`;
      }
    }
    return val;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 25, left: 15, bottom: 25 }}
        >
          <defs>
            <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={true}
            stroke="#94A3B8"
            fontSize={11}
            tickMargin={8}
            tickFormatter={formatPeriodLabel}
          />
          <YAxis
            tickLine={false}
            stroke="#94A3B8"
            fontSize={11}
            tickMargin={8}
            tickFormatter={(val) => formatCompactNumber(Number(val))}
            label={
              yLabel
                ? {
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#64748B', fontSize: 11, fontWeight: 500 },
                    offset: -5,
                  }
                : undefined
            }
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
            labelFormatter={(label) => `Period: ${formatPeriodLabel(String(label))}`}
            formatter={(value: unknown) => [
              `${Number(value).toLocaleString()} visitors`,
              'Recorded Footfall',
            ]}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={strokeColor}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#gradient-${yKey})`}
            dot={{ r: 4, fill: strokeColor, stroke: '#FFFFFF', strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: strokeColor, stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
