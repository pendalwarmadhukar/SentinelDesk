import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TimelineDataPoint {
  timestamp: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface AlertsTimelineChartProps {
  data: TimelineDataPoint[];
}

export const AlertsTimelineChart: React.FC<AlertsTimelineChartProps> = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="timestamp"
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
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: '10px' }}
            formatter={(val) => (
              <span className="inline-block px-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {val}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="critical"
            name="Critical"
            stroke="#f43f5e"
            fillOpacity={1}
            fill="url(#colorCritical)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="high"
            name="High"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorHigh)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="medium"
            name="Medium"
            stroke="#eab308"
            fillOpacity={1}
            fill="url(#colorMedium)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="low"
            name="Low"
            stroke="#38bdf8"
            fillOpacity={1}
            fill="url(#colorLow)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AlertsTimelineChart;
