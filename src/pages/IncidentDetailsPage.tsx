import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import incidentApi from '../services/incidentApi';
import { Incident, IncidentStatus, Severity } from '../types';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import IncidentTimeline from '../components/IncidentTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatTimestamp, formatRelativeTime } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import {
  Flame,
  ArrowLeft,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Send,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [newActionName, setNewActionName] = useState('');

  const fetchIncident = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await incidentApi.getIncidentById(id);
      setIncident(data);
    } catch (err: any) {
      console.error('Error fetching incident:', err);
      setError(err?.response?.data?.message || 'Incident not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleUpdateStatus = async (newStatus: IncidentStatus) => {
    if (!id) return;
    try {
      const updated = await incidentApi.updateStatus(id, newStatus);
      setIncident(updated);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleUpdateSeverity = async (newSeverity: Severity) => {
    if (!id) return;
    try {
      const updated = await incidentApi.updateSeverity(id, newSeverity);
      setIncident(updated);
    } catch (err: any) {
      console.error('Error updating severity:', err);
    }
  };

  const handleUpdateAnalyst = async (analyst: string) => {
    if (!id) return;
    try {
      const updated = await incidentApi.updateAssignedAnalyst(id, analyst);
      setIncident(updated);
    } catch (err: any) {
      console.error('Error updating assigned analyst:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteContent.trim() || !user) return;
    setIsSubmittingNote(true);
    try {
      const updated = await incidentApi.addInvestigationNote(id, {
        author: user.name,
        content: noteContent.trim(),
      });
      setIncident(updated);
      setNoteContent('');
    } catch (err: any) {
      console.error('Error adding note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleExecuteAction = async (actionText: string) => {
    if (!id || !user) return;
    try {
      const updated = await incidentApi.executeResponseAction(id, {
        action: actionText,
        executedBy: user.name,
      });
      setIncident(updated);
    } catch (err: any) {
      console.error('Error executing action:', err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={`Loading incident record ${id}...`} />;
  }

  if (error || !incident) {
    return <ErrorMessage message={error || 'Incident could not be found.'} onRetry={fetchIncident} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/incidents')}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Incidents
              </button>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-sm font-bold text-purple-400">{incident.id}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{incident.title}</h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Inline Editor Controls for Status, Severity, Analyst */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-950/80 p-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">STATUS</label>
              <select
                value={incident.status}
                onChange={(e) => handleUpdateStatus(e.target.value as IncidentStatus)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="CONTAINED">CONTAINED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">SEVERITY</label>
              <select
                value={incident.severity}
                onChange={(e) => handleUpdateSeverity(e.target.value as Severity)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">ANALYST</label>
              <select
                value={incident.assignedAnalyst}
                onChange={(e) => handleUpdateAnalyst(e.target.value)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none"
              >
                <option value="Alex Vance">Alex Vance (Lead)</option>
                <option value="Sarah Connor">Sarah Connor</option>
                <option value="Jordan Miller">Jordan Miller</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata & Quick Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Assigned Analyst</span>
          <p className="mt-1 font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
            <User className="h-4 w-4 text-cyan-400" />
            {incident.assignedAnalyst}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Linked Alerts</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {incident.relatedAlerts.map((altId) => (
              <button
                key={altId}
                onClick={() => navigate(`/alerts/${altId}`)}
                className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-mono text-cyan-300 hover:bg-cyan-500/20"
              >
                {altId}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Declared</span>
          <p className="mt-1 font-mono text-xs text-slate-300">
            {formatTimestamp(incident.createdAt)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Last Activity</span>
          <p className="mt-1 font-mono text-xs text-purple-400">
            {formatRelativeTime(incident.updatedAt)}
          </p>
        </div>
      </div>

      {/* Main Grid: Response Actions, Investigation Notes, Incident Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Response Actions & Investigation Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Response Actions Playbook */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Response Actions &amp; Containment Playbook
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SOC Orchestration</span>
            </div>

            <div className="space-y-3">
              {incident.responseActions.map((act) => (
                <div
                  key={act.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 font-mono text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {act.status === 'EXECUTED' ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <span className={act.status === 'EXECUTED' ? 'text-slate-200' : 'text-slate-300 font-semibold'}>
                      {act.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] self-end sm:self-auto">
                    {act.executedBy && (
                      <span className="text-slate-400">by {act.executedBy}</span>
                    )}
                    {act.status === 'PENDING' ? (
                      <button
                        onClick={() => handleExecuteAction(act.action)}
                        className="rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 font-semibold transition-colors flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" /> Execute Now
                      </button>
                    ) : (
                      <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px]">
                        COMPLETED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action runner */}
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                Trigger Ad-Hoc Containment Action:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActionName}
                  onChange={(e) => setNewActionName(e.target.value)}
                  placeholder="e.g. Block Port 22 across External Edge ACL"
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-purple-500/80 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newActionName.trim()) {
                      handleExecuteAction(newActionName.trim());
                      setNewActionName('');
                    }
                  }}
                  disabled={!newActionName.trim()}
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40"
                >
                  Dispatch Action
                </button>
              </div>
            </div>
          </div>

          {/* Investigation Notes */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold tracking-wide text-white">
                Incident Response Notes ({incident.investigationNotes?.length || 0})
              </h3>
            </div>

            <form onSubmit={handleAddNote} className="mb-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log containment updates, forensic dumps, legal disclosures..."
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!noteContent.trim() || isSubmittingNote}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                {isSubmittingNote ? 'Saving...' : 'Add Note'}
              </button>
            </form>

            <div className="space-y-3">
              {incident.investigationNotes?.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-semibold text-purple-400">{note.author}</span>
                    <span className="text-slate-500">{formatTimestamp(note.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Incident Timeline */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold tracking-wide text-white">Incident Timeline</h3>
          </div>
          <IncidentTimeline timeline={incident.timeline} />
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailsPage;
