import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { formatCompactNumber } from '../../utils/format';

interface PieChartWidgetProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  innerRadius?: number;
}

export const PieChartWidget: React.FC<PieChartWidgetProps> = ({
  data = [],
  height = 320,
  innerRadius = 50,
}) => {
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [data]);

  // Aggregate smaller slices if more than 6 items to keep chart clear and prevent clipping
  const { chartData, displayLegend } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], displayLegend: [] };
    }

    const sorted = [...data].sort((a, b) => b.value - a.value);

    if (sorted.length <= 6) {
      return { chartData: sorted, displayLegend: sorted };
    }

    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);
    const otherSum = others.reduce((acc, curr) => acc + curr.value, 0);

    const consolidated = [...top5, { name: 'Other Categories', value: otherSum }];
    return { chartData: consolidated, displayLegend: sorted };
  }, [data]);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <span>No category distribution data available</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Pie Graphic Container */}
      <div style={{ width: '100%', height: Math.min(height, 200) }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Tooltip
              contentStyle={{
                backgroundColor: '#101D35',
                borderColor: '#1E293B',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              }}
              formatter={(value: unknown, name: unknown) => {
                const valNum = Number(value);
                const pct = total > 0 ? ((valNum / total) * 100).toFixed(1) : '0.0';
                return [`${valNum.toLocaleString()} visitors (${pct}%)`, String(name)];
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Structured, Non-overlapping Responsive Legend Grid */}
      <div className="max-h-36 overflow-y-auto custom-scrollbar px-1 divide-y divide-slate-100 text-xs">
        {displayLegend.map((item, index) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <div key={item.name} className="flex items-center justify-between py-1.5 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-slate-700 font-medium" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right shrink-0">
                <span className="text-slate-500 font-mono text-[11px]">
                  {formatCompactNumber(item.value)}
                </span>
                <span className="font-semibold text-slate-800 text-[11px] w-11 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
