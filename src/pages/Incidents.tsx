import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import incidentApi from '../services/incidentApi';
import { Incident, PaginatedResponse, IncidentStatus, Severity } from '../types';
import IncidentTable from '../components/IncidentTable';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Flame, Plus, RefreshCw, Search, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Incidents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal for new Incident creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState<Severity>('HIGH');
  const [isCreating, setIsCreating] = useState(false);

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<Incident> = await incidentApi.getIncidents({
        search,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: currentPage,
        limit: pageSize,
      });

      setIncidents(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error fetching incidents:', err);
      setError('Unable to load security incidents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, statusFilter, currentPage]);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const created = await incidentApi.createIncident({
        title: newTitle.trim(),
        description: newDescription.trim(),
        severity: newSeverity,
        assignedAnalyst: user?.name || 'Lead Responder',
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      navigate(`/incidents/${created.id}`);
    } catch (err: any) {
      console.error('Error creating incident:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              SECURITY INCIDENTS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Active threat campaigns, breaches, and containment playbooks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchIncidents}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-950/50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Incident
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-md backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search incidents by ID, title, or assigned responder..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-8 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-purple-500/70 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-52">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-mono text-slate-200 focus:border-purple-500/70 focus:outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="CONTAINED">CONTAINED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List / States */}
      {isLoading ? (
        <LoadingSpinner message="Loading incident management queue..." />
      ) : error ? (
        <ErrorMessage title="Incident Load Error" message={error} onRetry={fetchIncidents} />
      ) : incidents.length === 0 ? (
        <EmptyState
          title="No incidents tracked"
          description="There are currently no active incidents matching your criteria."
          actionLabel="Create Incident"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="space-y-4">
          <IncidentTable incidents={incidents} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Modal: Create Incident */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Declare New Security Incident
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Credential Stuffing Attack on Edge Gateway"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-200 focus:border-purple-500/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Initial Severity
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as Severity)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-200 focus:border-purple-500/80 focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL — Severe Threat / Active Data Compromise</option>
                  <option value="HIGH">HIGH — System Infiltration / Malicious Actor Access</option>
                  <option value="MEDIUM">MEDIUM — Suspicious Activity / Host Isolation Needed</option>
                  <option value="LOW">LOW — Minor Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Description &amp; Preliminary Scope
                </label>
                <textarea
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detail affected subnets, suspected adversary, vector, and containment steps..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs font-mono text-slate-200 focus:border-purple-500/80 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
