import React, { useState, useEffect } from 'react';
import logApi from '../services/logApi';
import { SecurityLog, PaginatedResponse, Severity } from '../types';
import LogTable from '../components/LogTable';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Terminal, RefreshCw, Search, Download, Filter, X } from 'lucide-react';

export const SecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<SecurityLog> = await logApi.getLogs({
        search,
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        page: currentPage,
        limit: pageSize,
      });

      setLogs(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      setError('Unable to stream security logs from SIEM.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, severityFilter, currentPage]);

  // Optional auto-refresh timer for live SOC feel
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, search, severityFilter, currentPage]);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Hostname', 'Username', 'Source IP', 'Event Type', 'Message', 'Severity'];
    const rows = logs.map((l) => [
      l.timestamp,
      l.hostname,
      l.username,
      l.sourceIp,
      l.eventType,
      `"${l.message.replace(/"/g, '""')}"`,
      l.severity,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinel_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              SECURITY LOG STREAM
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Immutable raw host, network, authentication, and endpoint telemetry logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-mono transition-colors ${
              autoRefresh
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
            {autoRefresh ? 'Live Streaming ON' : 'Auto Stream OFF'}
          </button>

          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3 py-2 text-xs font-semibold font-mono transition-colors disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
              placeholder="Search logs by IP, hostname, username, or message..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-8 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500/70 focus:outline-none"
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

          <div className="w-full sm:w-48">
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-mono text-slate-200 focus:border-cyan-500/70 focus:outline-none"
            >
              <option value="ALL">Severity: All</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / States */}
      {isLoading ? (
        <LoadingSpinner message="Ingesting raw audit logs..." />
      ) : error ? (
        <ErrorMessage title="Log Stream Error" message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No security logs match query"
          description="Try broadening your search term or reset severity filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSeverityFilter('ALL');
          }}
        />
      ) : (
        <div className="space-y-4">
          <LogTable logs={logs} />
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

export default SecurityLogs;
