import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Severity } from '../../types';
import { useNavigate } from 'react-router-dom';

interface TopSourceIpsChartProps {
  data: Array<{
    ip: string;
    events: number;
    threatType: string;
    riskLevel: Severity;
  }>;
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#f43f5e',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#38bdf8',
};

export const TopSourceIpsChart: React.FC<TopSourceIpsChartProps> = ({ data }) => {
  const navigate = useNavigate();
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
        >
          <XAxis type="number" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
          <YAxis
            type="category"
            dataKey="ip"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            fontFamily="JetBrains Mono"
            width={95}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono',
              color: '#f8fafc',
            }}
            formatter={(value: any, name: any, item: any) => [
              `${value} events (${item.payload.threatType})`,
              'Activity',
            ]}
          />
          <Bar
            dataKey="events"
            radius={[0, 4, 4, 0]}
            onClick={(entry: any) => {
              const targetIp = entry?.ip || entry?.payload?.ip;
              if (targetIp) navigate(`/threats/${encodeURIComponent(targetIp)}`);
            }}
            cursor="pointer"
          >
            {chartData.map((entry) => (
              <Cell key={entry.ip} fill={RISK_COLORS[entry.riskLevel] || '#f97316'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopSourceIpsChart;
