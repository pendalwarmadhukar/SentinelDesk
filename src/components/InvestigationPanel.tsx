import React, { useState } from 'react';
import { SecurityAlert, Severity, AlertStatus } from '../types';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { formatTimestamp } from '../utils/formatters';
import {
  Save,
  Flame,
  CheckCircle2,
  XCircle,
  Terminal,
  Shield,
  Clock,
  User,
  Server,
  Globe,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvestigationPanelProps {
  alert: SecurityAlert;
  onSaveInvestigation: (notes: string, status?: AlertStatus, severity?: Severity) => Promise<void>;
  onEscalate: () => void;
  onResolve: () => void;
  onFalsePositive: () => void;
  isSaving?: boolean;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  alert,
  onSaveInvestigation,
  onEscalate,
  onResolve,
  onFalsePositive,
  isSaving = false,
}) => {
  const navigate = useNavigate();
  const [activeNotes, setActiveNotes] = useState(
    alert.investigationNotes?.[0]?.content ||
      'Multiple failed SSH authentication attempts detected from the same source IP within a short period.'
  );
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>(alert.severity);
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus>(alert.status);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    await onSaveInvestigation(activeNotes, selectedStatus, selectedSeverity);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>INVESTIGATION WORKSPACE</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">{alert.id}</span>
            <SeverityBadge severity={alert.severity} size="sm" />
            <StatusBadge status={alert.status} size="sm" />
          </div>
          <h2 className="mt-1 text-lg font-bold text-white tracking-tight">{alert.title}</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Saving...' : 'Save Investigation'}
          </button>

          <button
            onClick={onEscalate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-3.5 py-2 text-xs font-semibold transition-colors"
          >
            <Flame className="h-3.5 w-3.5" />
            Escalate Incident
          </button>

          <button
            onClick={onResolve}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 text-xs font-semibold transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolve
          </button>

          <button
            onClick={onFalsePositive}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 text-xs font-semibold transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            Mark False Positive
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-400 font-mono">
          ✓ Investigation notes and status parameters persisted successfully.
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Evidence & Notes Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Target & Vector Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] font-mono text-slate-500 block">SOURCE IP</span>
              <button
                onClick={() => navigate(`/threats/${encodeURIComponent(alert.sourceIp)}`)}
                className="font-mono text-xs font-bold text-cyan-400 hover:underline mt-0.5 block truncate"
              >
                {alert.sourceIp}
              </button>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] font-mono text-slate-500 block">DESTINATION</span>
              <span className="font-mono text-xs font-bold text-slate-200 mt-0.5 block truncate">
                {alert.destinationIp}:{alert.destinationPort}
              </span>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] font-mono text-slate-500 block">HOST / ASSET</span>
              <span className="font-mono text-xs font-bold text-slate-200 mt-0.5 block truncate">
                {alert.hostname}
              </span>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] font-mono text-slate-500 block">USERNAME</span>
              <span className="font-mono text-xs font-bold text-amber-300 mt-0.5 block truncate">
                {alert.username}
              </span>
            </div>
          </div>

          {/* Investigation Notes Editor */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Analyst Findings &amp; Forensic Notes
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Markdown / Plaintext Supported
              </span>
            </div>

            <textarea
              value={activeNotes}
              onChange={(e) => setActiveNotes(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-cyan-500/70 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 leading-relaxed"
              placeholder="Record forensic evidence, attack path analysis, MITRE ATT&CK technique IDs, containment steps..."
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono text-slate-400">Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as AlertStatus)}
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-mono text-slate-200"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="ESCALATED">ESCALATED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono text-slate-400">Severity:</label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value as Severity)}
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-mono text-slate-200"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                {activeNotes.length} characters
              </span>
            </div>
          </div>

          {/* Related Events Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold tracking-wide text-white">
                Clustered Telemetry Events ({alert.relatedEvents?.length || 0})
              </h3>
            </div>

            {(!alert.relatedEvents || alert.relatedEvents.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-2">No raw events clustered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                    <tr>
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Message</th>
                      <th className="pb-2 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {alert.relatedEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td className="py-2 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatTimestamp(ev.timestamp)}
                        </td>
                        <td className="py-2 text-cyan-400">{ev.eventType}</td>
                        <td className="py-2 text-slate-200">{ev.message}</td>
                        <td className="py-2 text-right">
                          <SeverityBadge severity={ev.severity} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 column: Timeline & History */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold tracking-wide text-white">Event Timeline</h3>
            </div>

            <div className="relative pl-6 space-y-5 border-l border-slate-800 font-mono text-xs">
              {alert.activityTimeline?.map((item) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                  <p className="font-semibold text-slate-200">{item.action}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {item.user} • {formatTimestamp(item.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationPanel;
