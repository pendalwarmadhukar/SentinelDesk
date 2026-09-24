import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EventTypeChartProps {
  data: Array<{
    type: string;
    count: number;
  }>;
}

const TYPE_COLORS = [
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#10b981',
  '#eab308',
];

export const EventTypeChart: React.FC<EventTypeChartProps> = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <XAxis
            dataKey="type"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
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
            formatter={(value: any) => [`${value} detections`, 'Total']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.type} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventTypeChart;
