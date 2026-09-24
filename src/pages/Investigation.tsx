import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import alertApi from '../services/alertApi';
import incidentApi from '../services/incidentApi';
import { SecurityAlert, Severity, AlertStatus } from '../types';
import InvestigationPanel from '../components/InvestigationPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import { SearchCode, RefreshCw, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Investigation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showFpModal, setShowFpModal] = useState(false);

  const activeAlertId = searchParams.get('alertId') || 'ALT-1024';

  const fetchWorkspace = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await alertApi.getAlerts({ limit: 50 });
      setAlerts(response.data);

      const found = response.data.find((a) => a.id === activeAlertId) || response.data[0];
      setSelectedAlert(found || null);
    } catch (err: any) {
      console.error('Error fetching workspace:', err);
      setError('Unable to load analyst investigation workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [activeAlertId]);

  const handleSelectAlert = (id: string) => {
    setSearchParams({ alertId: id });
  };

  const handleSaveInvestigation = async (
    notes: string,
    status?: AlertStatus,
    severity?: Severity
  ) => {
    if (!selectedAlert || !user) return;
    setIsSaving(true);
    try {
      if (notes.trim()) {
        await alertApi.addInvestigationNote(selectedAlert.id, {
          author: user.name,
          content: notes.trim(),
        });
      }
      if (status && status !== selectedAlert.status) {
        await alertApi.updateAlertStatus(selectedAlert.id, status);
      }
      if (severity && severity !== selectedAlert.severity) {
        await alertApi.updateAlertSeverity(selectedAlert.id, severity);
      }
      // Refresh alert
      const updated = await alertApi.getAlertById(selectedAlert.id);
      setSelectedAlert(updated);
    } catch (err: any) {
      console.error('Error saving investigation:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmEscalate = async () => {
    if (!selectedAlert || !user) return;
    try {
      const newInc = await incidentApi.createIncident({
        title: `Escalated Investigation: ${selectedAlert.title}`,
        description: selectedAlert.description,
        severity: selectedAlert.severity,
        assignedAnalyst: user.name,
        relatedAlerts: [selectedAlert.id],
      });
      await alertApi.updateAlertStatus(selectedAlert.id, 'ESCALATED');
      setShowEscalateModal(false);
      navigate(`/incidents/${newInc.id}`);
    } catch (err: any) {
      console.error('Error escalating:', err);
    }
  };

  const handleConfirmResolve = async () => {
    if (!selectedAlert) return;
    await alertApi.updateAlertStatus(selectedAlert.id, 'RESOLVED');
    const updated = await alertApi.getAlertById(selectedAlert.id);
    setSelectedAlert(updated);
    setShowResolveModal(false);
  };

  const handleConfirmFalsePositive = async () => {
    if (!selectedAlert) return;
    await alertApi.updateAlertStatus(selectedAlert.id, 'FALSE_POSITIVE');
    const updated = await alertApi.getAlertById(selectedAlert.id);
    setSelectedAlert(updated);
    setShowFpModal(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading analyst investigation workspace..." />;
  }

  if (error || !selectedAlert) {
    return <ErrorMessage message={error || 'No alert available to investigate.'} onRetry={fetchWorkspace} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Workspace Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SearchCode className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              INVESTIGATION WORKSPACE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            In-depth event timeline forensics, target attribution, and containment actions
          </p>
        </div>

        {/* Quick Alert Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">Target Alert:</label>
          <select
            value={selectedAlert.id}
            onChange={(e) => handleSelectAlert(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 py-1.5 px-3 text-xs font-mono font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none"
          >
            {alerts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.type} ({a.severity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Investigation Panel */}
      <InvestigationPanel
        alert={selectedAlert}
        onSaveInvestigation={handleSaveInvestigation}
        onEscalate={() => setShowEscalateModal(true)}
        onResolve={() => setShowResolveModal(true)}
        onFalsePositive={() => setShowFpModal(true)}
        isSaving={isSaving}
      />

      {/* Escalation Modal */}
      <ConfirmModal
        isOpen={showEscalateModal}
        title="Escalate Alert to Incident"
        message={`Escalating ${selectedAlert.id} will notify the on-call incident response team and generate a high-priority incident ticket. Proceed?`}
        confirmText="Confirm Escalation"
        confirmVariant="danger"
        onConfirm={handleConfirmEscalate}
        onCancel={() => setShowEscalateModal(false)}
      />

      {/* Resolve Modal */}
      <ConfirmModal
        isOpen={showResolveModal}
        title="Mark Alert as Resolved"
        message={`Are you sure you want to mark ${selectedAlert.id} as RESOLVED? Threat indicators will be documented as remediated.`}
        confirmText="Resolve Alert"
        confirmVariant="primary"
        onConfirm={handleConfirmResolve}
        onCancel={() => setShowResolveModal(false)}
      />

      {/* False Positive Modal */}
      <ConfirmModal
        isOpen={showFpModal}
        title="Mark as False Positive"
        message={`Marking ${selectedAlert.id} as FALSE_POSITIVE will suppress subsequent alert thresholds for this signature.`}
        confirmText="Confirm False Positive"
        confirmVariant="warning"
        onConfirm={handleConfirmFalsePositive}
        onCancel={() => setShowFpModal(false)}
      />
    </div>
  );
};

export default Investigation;
