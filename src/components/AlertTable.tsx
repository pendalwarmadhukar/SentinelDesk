import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SecurityAlert } from '../types';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import { ArrowUpRight, ShieldAlert, Terminal, Eye } from 'lucide-react';

interface AlertTableProps {
  alerts: SecurityAlert[];
  isLoading?: boolean;
  onSelectAlert?: (alert: SecurityAlert) => void;
  newAlertIds?: Set<string>;
}

export const AlertTable: React.FC<AlertTableProps> = ({
  alerts,
  isLoading = false,
  onSelectAlert,
  newAlertIds = new Set(),
}) => {
  const navigate = useNavigate();

  const handleRowClick = (alert: SecurityAlert) => {
    if (onSelectAlert) {
      onSelectAlert(alert);
    } else {
      navigate(`/alerts/${alert.id}`);
    }
  };

  const handleIpClick = (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    navigate(`/threats/${encodeURIComponent(ip)}`);
  };

  const handleInvestigateClick = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    navigate(`/investigation?alertId=${alertId}`);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/60 shadow-lg backdrop-blur-xs">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="border-b border-slate-800/80 bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <tr>
            <th className="py-3 px-4">Alert ID</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Source IP</th>
            <th className="py-3 px-4">Target</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Time</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 font-mono">
          {alerts.map((alert) => {
            const isNew = newAlertIds.has(alert.id);
            return (
              <tr
                key={alert.id}
                onClick={() => handleRowClick(alert)}
                className={`group cursor-pointer transition-all duration-300 hover:bg-slate-800/50 ${
                  isNew
                    ? 'bg-cyan-950/30 border-l-2 border-l-cyan-400 animate-in fade-in duration-500'
                    : ''
                }`}
              >
                {/* Alert ID */}
                <td className="py-3 px-4 font-bold text-cyan-400 group-hover:text-cyan-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className={`h-3.5 w-3.5 ${isNew ? 'text-cyan-400 animate-pulse' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                    <span>{alert.id}</span>
                    {isNew && (
                      <span className="inline-flex items-center rounded bg-cyan-500/20 px-1 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/40 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                </td>

              {/* Type */}
              <td className="py-3 px-4 font-sans font-medium text-slate-200">
                <span className="truncate max-w-[150px] inline-block">{alert.type}</span>
              </td>

              {/* Source IP */}
              <td className="py-3 px-4">
                <button
                  onClick={(e) => handleIpClick(e, alert.sourceIp)}
                  className="rounded px-1.5 py-0.5 font-mono text-slate-300 bg-slate-800/60 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700/60 transition-colors"
                  title="View threat intelligence"
                >
                  {alert.sourceIp}
                </button>
              </td>

              {/* Target */}
              <td className="py-3 px-4 text-slate-400">
                <span className="truncate max-w-[140px] inline-block" title={`${alert.hostname} (${alert.protocol})`}>
                  {alert.protocol || alert.hostname}
                </span>
              </td>

              {/* Severity */}
              <td className="py-3 px-4">
                <SeverityBadge severity={alert.severity} size="sm" />
              </td>

              {/* Status */}
              <td className="py-3 px-4">
                <StatusBadge status={alert.status} size="sm" />
              </td>

              {/* Time */}
              <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                {formatRelativeTime(alert.lastSeen)}
              </td>

              {/* Action */}
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => handleInvestigateClick(e, alert.id)}
                    className="inline-flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    title="Open in Investigation Workspace"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/alerts/${alert.id}`);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    title="View details"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default AlertTable;
