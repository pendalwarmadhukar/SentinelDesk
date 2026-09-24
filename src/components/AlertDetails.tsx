import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecurityAlert, Severity, AlertStatus } from '../types';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { formatTimestamp, formatRelativeTime } from '../utils/formatters';
import {
  ShieldAlert,
  SearchCode,
  Flame,
  CheckCircle2,
  XCircle,
  Network,
  Clock,
  User,
  Server,
  Terminal,
  Send,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

interface AlertDetailsProps {
  alert: SecurityAlert;
  onUpdateStatus: (newStatus: AlertStatus) => Promise<void>;
  onUpdateSeverity: (newSeverity: Severity) => Promise<void>;
  onAddNote: (content: string) => Promise<void>;
  onEscalate: () => void;
  isLoading?: boolean;
}

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  onUpdateStatus,
  onUpdateSeverity,
  onAddNote,
  onEscalate,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      await onAddNote(noteContent.trim());
      setNoteContent('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/alerts')}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Alerts
            </button>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-sm font-bold text-cyan-400">{alert.id}</span>
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{alert.title}</h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">{alert.description}</p>
        </div>

        {/* Action Buttons: Investigate, Escalate, Resolve, False Positive */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/investigation?alertId=${alert.id}`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3 py-2 text-xs font-semibold transition-colors"
          >
            <SearchCode className="h-4 w-4" />
            Investigate
          </button>

          <button
            onClick={onEscalate}
            disabled={alert.status === 'ESCALATED' || isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <Flame className="h-4 w-4" />
            Escalate to Incident
          </button>

          <button
            onClick={() => onUpdateStatus('RESOLVED')}
            disabled={alert.status === 'RESOLVED' || isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />
            Resolve
          </button>

          <button
            onClick={() => onUpdateStatus('FALSE_POSITIVE')}
            disabled={alert.status === 'FALSE_POSITIVE' || isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <XCircle className="h-4 w-4" />
            False Positive
          </button>
        </div>
      </div>

      {/* Grid: Alert Metadata & Network Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Vector */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <Network className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              Network Vector
            </h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Source IP:</span>
              <button
                onClick={() => navigate(`/threats/${encodeURIComponent(alert.sourceIp)}`)}
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                {alert.sourceIp}
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Destination IP:</span>
              <span className="text-slate-200">{alert.destinationIp || '10.0.4.15'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Ports (Src → Dst):</span>
              <span className="text-slate-200">
                {alert.sourcePort || 54112} → {alert.destinationPort || 22}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-200">
                {alert.protocol}
              </span>
            </div>
          </div>
        </div>

        {/* Identity & Host */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <Server className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              Host &amp; Identity
            </h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Hostname:</span>
              <span className="text-slate-200 font-semibold">{alert.hostname}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Account / User:</span>
              <span className="text-amber-300">{alert.username || 'unknown'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Assigned Analyst:</span>
              <span className="text-slate-200">{alert.assignedTo || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Event Count:</span>
              <span className="text-rose-400 font-bold">{alert.eventCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              Telemetry Window
            </h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex flex-col border-b border-slate-800/60 pb-1">
              <span className="text-slate-400 text-[10px]">FIRST SEEN:</span>
              <span className="text-slate-200">{formatTimestamp(alert.firstSeen)}</span>
            </div>
            <div className="flex flex-col border-b border-slate-800/60 pb-1">
              <span className="text-slate-400 text-[10px]">LAST SEEN:</span>
              <span className="text-slate-200">{formatTimestamp(alert.lastSeen)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Age:</span>
              <span className="text-cyan-400">{formatRelativeTime(alert.firstSeen)}</span>
            </div>
          </div>
        </div>

        {/* Status Control */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              Triage Controls
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">SET SEVERITY:</label>
              <select
                value={alert.severity}
                onChange={(e) => onUpdateSeverity(e.target.value as Severity)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">SET STATUS:</label>
              <select
                value={alert.status}
                onChange={(e) => onUpdateStatus(e.target.value as AlertStatus)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Lower Grid: Investigation Notes, Activity Timeline, Related Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Related Events and Investigation Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Related Events */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Correlated SIEM Events ({alert.relatedEvents?.length || 0})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Rule Correlation Match
              </span>
            </div>

            {(!alert.relatedEvents || alert.relatedEvents.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-4">No additional raw events clustered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                    <tr>
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Message</th>
                      <th className="pb-2">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {alert.relatedEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatTimestamp(ev.timestamp)}
                        </td>
                        <td className="py-2.5 text-cyan-400">{ev.eventType}</td>
                        <td className="py-2.5 text-slate-200 max-w-sm">{ev.message}</td>
                        <td className="py-2.5">
                          <SeverityBadge severity={ev.severity} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Investigation Notes */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <SearchCode className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold tracking-wide text-white">
                Investigation Notes ({alert.investigationNotes?.length || 0})
              </h3>
            </div>

            {/* Note input */}
            <form onSubmit={handleNoteSubmit} className="mb-4">
              <div className="relative">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record telemetry findings, IOCs, containment steps..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500/70 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!noteContent.trim() || isSubmittingNote}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  {isSubmittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {(!alert.investigationNotes || alert.investigationNotes.length === 0) ? (
                <p className="text-xs text-slate-500 italic">No notes logged yet.</p>
              ) : (
                alert.investigationNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-semibold text-cyan-400">{note.author}</span>
                      <span className="text-slate-500">{formatTimestamp(note.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Activity Timeline */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wide text-white">Activity Timeline</h3>
          </div>

          <div className="relative pl-6 space-y-5 border-l border-slate-800 font-mono text-xs">
            {(!alert.activityTimeline || alert.activityTimeline.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No activity recorded.</p>
            ) : (
              alert.activityTimeline.map((item) => (
                <div key={item.id} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-200">{item.action}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{item.user}</span>
                      <span>{formatRelativeTime(item.timestamp)}</span>
                    </div>
                    {item.details && (
                      <p className="text-[11px] text-slate-400 mt-1">{item.details}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetails;
