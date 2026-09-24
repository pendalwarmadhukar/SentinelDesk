import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '../types';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import { Flame, ArrowUpRight, User, ShieldAlert } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  isLoading?: boolean;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/60 shadow-lg backdrop-blur-xs">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="border-b border-slate-800/80 bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <tr>
            <th className="py-3 px-4">Incident ID</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Assigned Analyst</th>
            <th className="py-3 px-4">Created</th>
            <th className="py-3 px-4">Updated</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 font-mono">
          {incidents.map((incident) => (
            <tr
              key={incident.id}
              onClick={() => navigate(`/incidents/${incident.id}`)}
              className="group cursor-pointer transition-colors hover:bg-slate-800/50"
            >
              {/* Incident ID */}
              <td className="py-3 px-4 font-bold text-purple-400 group-hover:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-purple-400" />
                  {incident.id}
                </span>
              </td>

              {/* Title */}
              <td className="py-3 px-4 font-sans font-medium text-slate-100 max-w-sm">
                <div className="truncate font-semibold">{incident.title}</div>
                <div className="text-[11px] text-slate-400 truncate max-w-xs">
                  {incident.relatedAlerts.length} linked alert(s)
                </div>
              </td>

              {/* Severity */}
              <td className="py-3 px-4">
                <SeverityBadge severity={incident.severity} size="sm" />
              </td>

              {/* Status */}
              <td className="py-3 px-4">
                <StatusBadge status={incident.status} size="sm" />
              </td>

              {/* Assigned Analyst */}
              <td className="py-3 px-4 text-slate-300">
                <span className="flex items-center gap-1.5 font-sans">
                  <User className="h-3 w-3 text-slate-500" />
                  {incident.assignedAnalyst || 'Unassigned'}
                </span>
              </td>

              {/* Created */}
              <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                {formatRelativeTime(incident.createdAt)}
              </td>

              {/* Updated */}
              <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                {formatRelativeTime(incident.updatedAt)}
              </td>

              {/* Action */}
              <td className="py-3 px-4 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/incidents/${incident.id}`);
                  }}
                  className="inline-flex items-center gap-1 rounded border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
                >
                  Manage <ArrowUpRight className="h-3 w-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentTable;
