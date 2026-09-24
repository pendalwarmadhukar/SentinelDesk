import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SeverityDistributionChartProps {
  data: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const COLORS = {
  CRITICAL: '#f43f5e',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#38bdf8',
};

export const SeverityDistributionChart: React.FC<SeverityDistributionChartProps> = ({ data }) => {
  const chartData = [
    { name: 'CRITICAL', value: data?.critical ?? 0, color: COLORS.CRITICAL },
    { name: 'HIGH', value: data?.high ?? 0, color: COLORS.HIGH },
    { name: 'MEDIUM', value: data?.medium ?? 0, color: COLORS.MEDIUM },
    { name: 'LOW', value: data?.low ?? 0, color: COLORS.LOW },
  ].filter((item) => item.value > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono',
              color: '#f8fafc',
            }}
            formatter={(value: any, name: any) => [
              `${value} (${total ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-[11px] font-mono font-semibold text-slate-300 mr-2">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeverityDistributionChart;
