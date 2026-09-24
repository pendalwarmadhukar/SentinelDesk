import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import alertApi from '../services/alertApi';
import incidentApi from '../services/incidentApi';
import { SecurityAlert, Severity, AlertStatus } from '../types';
import AlertDetails from '../components/AlertDetails';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../hooks/useAuth';

export const AlertDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [alert, setAlert] = useState<SecurityAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const fetchAlert = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await alertApi.getAlertById(id);
      setAlert(data);
    } catch (err: any) {
      console.error('Error fetching alert details:', err);
      setError(err?.response?.data?.message || 'Unable to load alert details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
  }, [id]);

  const handleUpdateStatus = async (newStatus: AlertStatus) => {
    if (!id) return;
    try {
      const updated = await alertApi.updateAlertStatus(id, newStatus);
      setAlert(updated);
    } catch (err: any) {
      console.error('Error updating alert status:', err);
    }
  };

  const handleUpdateSeverity = async (newSeverity: Severity) => {
    if (!id) return;
    try {
      const updated = await alertApi.updateAlertSeverity(id, newSeverity);
      setAlert(updated);
    } catch (err: any) {
      console.error('Error updating alert severity:', err);
    }
  };

  const handleAddNote = async (content: string) => {
    if (!id || !user) return;
    try {
      const updated = await alertApi.addInvestigationNote(id, {
        author: user.name,
        content,
      });
      setAlert(updated);
    } catch (err: any) {
      console.error('Error adding investigation note:', err);
    }
  };

  const handleConfirmEscalate = async () => {
    if (!alert || !user) return;
    setIsEscalating(true);
    try {
      const newIncident = await incidentApi.createIncident({
        title: `Incident from ${alert.id}: ${alert.title}`,
        description: alert.description,
        severity: alert.severity,
        assignedAnalyst: user.name,
        relatedAlerts: [alert.id],
      });
      await handleUpdateStatus('ESCALATED');
      setShowEscalateModal(false);
      navigate(`/incidents/${newIncident.id}`);
    } catch (err: any) {
      console.error('Error escalating alert:', err);
    } finally {
      setIsEscalating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={`Loading alert details for ${id}...`} />;
  }

  if (error || !alert) {
    return (
      <ErrorMessage
        title="Alert Not Found"
        message={error || `Security Alert ${id} could not be located in SIEM repository.`}
        onRetry={fetchAlert}
      />
    );
  }

  return (
    <>
      <AlertDetails
        alert={alert}
        onUpdateStatus={handleUpdateStatus}
        onUpdateSeverity={handleUpdateSeverity}
        onAddNote={handleAddNote}
        onEscalate={() => setShowEscalateModal(true)}
      />

      {/* Escalate Confirmation Modal */}
      <ConfirmModal
        isOpen={showEscalateModal}
        title={`Escalate Alert ${alert.id}`}
        message={`This action will create a formal Security Incident, assign it to analyst "${user?.name}", and initiate incident response protocols. Continue?`}
        confirmText="Confirm Escalation"
        confirmVariant="danger"
        isLoading={isEscalating}
        onConfirm={handleConfirmEscalate}
        onCancel={() => setShowEscalateModal(false)}
      />
    </>
  );
};

export default AlertDetailsPage;
