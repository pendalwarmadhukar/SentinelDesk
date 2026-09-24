import React from 'react';
import { Filter, X, Calendar, Search } from 'lucide-react';
import { AlertType, Severity, AlertStatus } from '../types';

export interface FilterState {
  search: string;
  severity: string;
  status: string;
  type: string;
  sourceIp: string;
  date: string;
}

interface AlertFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const ALERT_TYPES: AlertType[] = [
  'Brute Force',
  'Port Scan',
  'Suspicious Login',
  'Malware Indicator',
  'Privilege Escalation',
  'Suspicious Process',
  'Network Anomaly',
];

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const STATUSES: AlertStatus[] = [
  'OPEN',
  'INVESTIGATING',
  'ESCALATED',
  'RESOLVED',
  'FALSE_POSITIVE',
];

export const AlertFilters: React.FC<AlertFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.search ||
    filters.severity !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.type !== 'ALL' ||
    filters.sourceIp ||
    filters.date;

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-md backdrop-blur-xs">
      <div className="flex flex-col gap-3">
        {/* Top search and filter inputs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search alert, ID, host..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500/70 focus:outline-none"
            />
          </div>

          {/* Severity Dropdown */}
          <div>
            <select
              value={filters.severity}
              onChange={(e) => handleChange('severity', e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs font-mono text-slate-200 focus:border-cyan-500/70 focus:outline-none"
            >
              <option value="ALL">Severity: All</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs font-mono text-slate-200 focus:border-cyan-500/70 focus:outline-none"
            >
              <option value="ALL">Status: All</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Type Dropdown */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs font-mono text-slate-200 focus:border-cyan-500/70 focus:outline-none"
            >
              <option value="ALL">Type: All</option>
              {ALERT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Source IP */}
          <div>
            <input
              type="text"
              value={filters.sourceIp}
              onChange={(e) => handleChange('sourceIp', e.target.value)}
              placeholder="Source IP (e.g. 192.168.1.20)"
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500/70 focus:outline-none"
            />
          </div>
        </div>

        {/* Date and Reset bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950/80 py-1 px-2 text-xs font-mono text-slate-300 focus:border-cyan-500/70 focus:outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertFilters;
