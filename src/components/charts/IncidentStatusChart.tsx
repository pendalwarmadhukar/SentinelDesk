import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IncidentStatus } from '../../types';

interface IncidentStatusChartProps {
  data: Array<{
    status: IncidentStatus;
    count: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#10b981',
  INVESTIGATING: '#06b6d4',
  CONTAINED: '#8b5cf6',
  RESOLVED: '#64748b',
};

export const IncidentStatusChart: React.FC<IncidentStatusChartProps> = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="status"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            fontFamily="JetBrains Mono"
          />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono',
              color: '#f8fafc',
            }}
            formatter={(value: any) => [`${value} incidents`, 'Count']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#38bdf8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncidentStatusChart;
