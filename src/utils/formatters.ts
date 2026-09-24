import { Severity, AlertStatus, IncidentStatus } from '../types';

export function formatTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return isoString;
  }
}

export function getSeverityConfig(severity: Severity) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return {
        label: 'CRITICAL',
        color: 'text-rose-400',
        bg: 'bg-rose-950/60',
        border: 'border-rose-800/70',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-500',
        hex: '#f43f5e',
      };
    case 'HIGH':
      return {
        label: 'HIGH',
        color: 'text-orange-400',
        bg: 'bg-orange-950/60',
        border: 'border-orange-800/70',
        badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        dot: 'bg-orange-500',
        hex: '#f97316',
      };
    case 'MEDIUM':
      return {
        label: 'MEDIUM',
        color: 'text-amber-300',
        bg: 'bg-amber-950/60',
        border: 'border-amber-800/70',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-500',
        hex: '#eab308',
      };
    case 'LOW':
    default:
      return {
        label: 'LOW',
        color: 'text-sky-400',
        bg: 'bg-sky-950/60',
        border: 'border-sky-800/70',
        badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        dot: 'bg-sky-400',
        hex: '#38bdf8',
      };
  }
}

export function getStatusConfig(status: AlertStatus | IncidentStatus | string) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return {
        label: 'OPEN',
        color: 'text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'INVESTIGATING':
      return {
        label: 'INVESTIGATING',
        color: 'text-cyan-400',
        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        dot: 'bg-cyan-400 animate-pulse',
      };
    case 'ESCALATED':
      return {
        label: 'ESCALATED',
        color: 'text-purple-400',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        dot: 'bg-purple-400',
      };
    case 'CONTAINED':
      return {
        label: 'CONTAINED',
        color: 'text-indigo-400',
        badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        dot: 'bg-indigo-400',
      };
    case 'RESOLVED':
      return {
        label: 'RESOLVED',
        color: 'text-slate-400',
        badge: 'bg-slate-500/15 text-slate-300 border-slate-600/40',
        dot: 'bg-slate-400',
      };
    case 'FALSE_POSITIVE':
      return {
        label: 'FALSE POSITIVE',
        color: 'text-slate-500',
        badge: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
        dot: 'bg-slate-500',
      };
    default:
      return {
        label: status || 'UNKNOWN',
        color: 'text-slate-400',
        badge: 'bg-slate-800 text-slate-300 border-slate-700',
        dot: 'bg-slate-500',
      };
  }
}
