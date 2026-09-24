import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import alertApi from '../services/alertApi';
import { SecurityAlert, PaginatedResponse } from '../types';
import AlertFilters, { FilterState } from '../components/AlertFilters';
import AlertTable from '../components/AlertTable';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import RealtimeCriticalBanner from '../components/RealtimeCriticalBanner';
import StreamStatusBadge from '../components/StreamStatusBadge';
import { useRealtimeAlerts } from '../context/RealtimeAlertContext';
import { ShieldAlert, RefreshCw, Plus, Filter, Radio } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { subscribeToAlerts } = useRealtimeAlerts();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    severity: searchParams.get('severity') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    type: searchParams.get('type') || 'ALL',
    sourceIp: searchParams.get('sourceIp') || '',
    date: searchParams.get('date') || '',
  });

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<SecurityAlert> = await alertApi.getAlerts({
        search: filters.search,
        severity: filters.severity !== 'ALL' ? filters.severity : undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined,
        type: filters.type !== 'ALL' ? filters.type : undefined,
        sourceIp: filters.sourceIp || undefined,
        date: filters.date || undefined,
        page: currentPage,
        limit: pageSize,
      });

      setAlerts(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError('Unable to load alerts. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filters, currentPage]);

  // Real-time stream subscription for live alert pushes
  useEffect(() => {
    const unsubscribe = subscribeToAlerts((incomingAlert, eventType) => {
      if (eventType === 'alert:created') {
        // Highlight new alert
        setNewAlertIds((prev) => {
          const next = new Set(prev);
          next.add(incomingAlert.id);
          return next;
        });

        // Always increment total count
        setTotal((prev) => prev + 1);

        // If currently viewing page 1, check if filter matches and dynamically prepend
        if (currentPage === 1) {
          const matchesSeverity = filters.severity === 'ALL' || filters.severity === incomingAlert.severity;
          const matchesStatus = filters.status === 'ALL' || filters.status === incomingAlert.status;
          const matchesType = filters.type === 'ALL' || filters.type === incomingAlert.type;
          const matchesIp = !filters.sourceIp || incomingAlert.sourceIp.includes(filters.sourceIp);

          if (matchesSeverity && matchesStatus && matchesType && matchesIp) {
            setAlerts((prev) => {
              const filtered = prev.filter((a) => a.id !== incomingAlert.id);
              return [incomingAlert, ...filtered].slice(0, pageSize);
            });
          }
        }
      } else if (eventType === 'alert:updated') {
        setAlerts((prev) => prev.map((a) => (a.id === incomingAlert.id ? incomingAlert : a)));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToAlerts, currentPage, filters, pageSize]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    const params: Record<string, string> = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.severity !== 'ALL') params.severity = newFilters.severity;
    if (newFilters.status !== 'ALL') params.status = newFilters.status;
    if (newFilters.type !== 'ALL') params.type = newFilters.type;
    if (newFilters.sourceIp) params.sourceIp = newFilters.sourceIp;
    if (newFilters.date) params.date = newFilters.date;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      severity: 'ALL',
      status: 'ALL',
      type: 'ALL',
      sourceIp: '',
      date: '',
    };
    setFilters(defaultFilters);
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Critical Threat Banner */}
      <RealtimeCriticalBanner />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              SECURITY ALERTS
            </h1>
            <span className="ml-2 rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300 border border-cyan-800/60">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Filter, triage, and escalate detected security events across all network sensors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StreamStatusBadge showControls={true} />

          <button
            onClick={fetchAlerts}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <AlertFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Content Area: Loading, Error, Empty, or Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading alerts from backend SIEM..." />
      ) : error ? (
        <ErrorMessage
          title="Alert Fetch Error"
          message={error}
          onRetry={fetchAlerts}
        />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No alerts found"
          description="There are no security alerts matching your current filter criteria."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          <AlertTable alerts={alerts} newAlertIds={newAlertIds} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default Alerts;
