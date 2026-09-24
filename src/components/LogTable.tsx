import React from 'react';
import { SecurityLog } from '../types';
import SeverityBadge from './SeverityBadge';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, User, Globe } from 'lucide-react';

interface LogTableProps {
  logs: SecurityLog[];
  isLoading?: boolean;
}

export const LogTable: React.FC<LogTableProps> = ({ logs }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/60 shadow-lg backdrop-blur-xs">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="border-b border-slate-800/80 bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <tr>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Hostname</th>
            <th className="py-3 px-4">Username</th>
            <th className="py-3 px-4">Source IP</th>
            <th className="py-3 px-4">Event Type</th>
            <th className="py-3 px-4">Message</th>
            <th className="py-3 px-4 text-right">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 font-mono">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-slate-800/40 transition-colors"
            >
              {/* Timestamp */}
              <td className="py-2.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                {log.timestamp}
              </td>

              {/* Hostname */}
              <td className="py-2.5 px-4 font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-slate-500" />
                  {log.hostname}
                </span>
              </td>

              {/* Username */}
              <td className="py-2.5 px-4 text-amber-300">
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-slate-500" />
                  {log.username}
                </span>
              </td>

              {/* Source IP */}
              <td className="py-2.5 px-4">
                <button
                  onClick={() => navigate(`/threats/${encodeURIComponent(log.sourceIp)}`)}
                  className="rounded px-1.5 py-0.5 text-cyan-400 bg-slate-800/50 hover:bg-cyan-950/70 border border-slate-700/50 transition-colors"
                  title="Analyze Threat IP"
                >
                  {log.sourceIp}
                </button>
              </td>

              {/* Event Type */}
              <td className="py-2.5 px-4">
                <span className="inline-block rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 font-semibold border border-slate-700/60">
                  {log.eventType}
                </span>
              </td>

              {/* Message */}
              <td className="py-2.5 px-4 text-slate-300 max-w-xs sm:max-w-md truncate" title={log.message}>
                {log.message}
              </td>

              {/* Severity */}
              <td className="py-2.5 px-4 text-right">
                <SeverityBadge severity={log.severity} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
