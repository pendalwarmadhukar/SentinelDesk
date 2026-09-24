import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardApi from '../services/dashboardApi';
import alertApi from '../services/alertApi';
import { DashboardStats, SecurityAlert } from '../types';
import StatCard from '../components/StatCard';
import AlertTable from '../components/AlertTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SeverityDistributionChart from '../components/charts/SeverityDistributionChart';
import AlertsTimelineChart from '../components/charts/AlertsTimelineChart';
import IncidentStatusChart from '../components/charts/IncidentStatusChart';
import TopSourceIpsChart from '../components/charts/TopSourceIpsChart';
import EventTypeChart from '../components/charts/EventTypeChart';
import RealtimeCriticalBanner from '../components/RealtimeCriticalBanner';
import StreamStatusBadge from '../components/StreamStatusBadge';
import { useRealtimeAlerts } from '../context/RealtimeAlertContext';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Flame,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Radio,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { subscribeToAlerts } = useRealtimeAlerts();

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [statsData, alertsData] = await Promise.all([
        dashboardApi.getStats(),
        alertApi.getAlerts({ limit: 6 }),
      ]);
      if (statsData && typeof statsData === 'object') {
        setStats(statsData);
      }
      if (alertsData && Array.isArray(alertsData.data)) {
        setRecentAlerts(alertsData.data);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load SOC telemetry and metrics. Please retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Subscribe to live SSE / WebSocket alert stream updates
  useEffect(() => {
    const unsubscribe = subscribeToAlerts((incomingAlert, eventType, updatedStats) => {
      if (eventType === 'alert:created') {
        // Track newly arrived alert for visual highlight badge
        setNewAlertIds((prev) => {
          const next = new Set(prev);
          next.add(incomingAlert.id);
          return next;
        });

        // Prepend to recent alerts table
        setRecentAlerts((prev) => {
          const filtered = prev.filter((a) => a.id !== incomingAlert.id);
          return [incomingAlert, ...filtered].slice(0, 7);
        });

        // Update stats immediately
        if (updatedStats && typeof updatedStats === 'object') {
          setStats(updatedStats);
        } else {
          setStats((prev) => {
            if (!prev) return prev;
            const sevKey = incomingAlert.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
            const currDist = prev.severityDistribution || { critical: 0, high: 0, medium: 0, low: 0 };
            return {
              ...prev,
              totalAlerts: (prev.totalAlerts ?? 0) + 1,
              criticalAlerts: incomingAlert.severity === 'CRITICAL' ? (prev.criticalAlerts ?? 0) + 1 : prev.criticalAlerts,
              highAlerts: incomingAlert.severity === 'HIGH' ? (prev.highAlerts ?? 0) + 1 : prev.highAlerts,
              mediumAlerts: incomingAlert.severity === 'MEDIUM' ? (prev.mediumAlerts ?? 0) + 1 : prev.mediumAlerts,
              lowAlerts: incomingAlert.severity === 'LOW' ? (prev.lowAlerts ?? 0) + 1 : prev.lowAlerts,
              totalLogEvents: (prev.totalLogEvents ?? 0) + 1,
              severityDistribution: {
                ...currDist,
                [sevKey]: ((currDist as any)[sevKey] ?? 0) + 1,
              },
            };
          });
        }
      } else if (eventType === 'alert:updated') {
        setRecentAlerts((prev) => prev.map((a) => (a.id === incomingAlert.id ? incomingAlert : a)));
        if (updatedStats) {
          setStats(updatedStats);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToAlerts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading) {
    return <LoadingSpinner message="Ingesting real-time SOC metrics & telemetry..." size="lg" />;
  }

  if (error || !stats || typeof stats !== 'object') {
    return <ErrorMessage message={error || 'Failed to initialize SOC dashboard'} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Real-time Critical Threat Banner */}
      <RealtimeCriticalBanner />

      {/* Top SOC Overview Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              SOC OPERATIONS OVERVIEW
            </h1>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Live Threat Surface &amp; Real-Time SIEM Event Monitoring Pipeline
          </p>
        </div>

        {/* Realtime stream status badge and analyst controls */}
        <div className="flex flex-wrap items-center gap-3">
          <StreamStatusBadge showControls={true} />

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/alerts')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3.5 py-2 text-xs font-semibold font-mono transition-colors"
          >
            All Alerts <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 8 Primary SOC Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Alerts */}
        <StatCard
          title="Total Alerts"
          value={stats.totalAlerts ?? 0}
          subtitle="All severities"
          icon={ShieldAlert}
          variant="default"
          onClick={() => navigate('/alerts')}
        />
        {/* Critical Alerts */}
        <StatCard
          title="Critical"
          value={stats.criticalAlerts ?? 0}
          subtitle="Needs triage"
          icon={AlertOctagon}
          variant="critical"
          onClick={() => navigate('/alerts?severity=CRITICAL')}
        />
        {/* High Alerts */}
        <StatCard
          title="High"
          value={stats.highAlerts ?? 0}
          subtitle="Priority queue"
          icon={AlertTriangle}
          variant="high"
          onClick={() => navigate('/alerts?severity=HIGH')}
        />
        {/* Medium Alerts */}
        <StatCard
          title="Medium"
          value={stats.mediumAlerts ?? 0}
          subtitle="Standard queue"
          icon={Activity}
          variant="medium"
          onClick={() => navigate('/alerts?severity=MEDIUM')}
        />
        {/* Low Alerts */}
        <StatCard
          title="Low"
          value={stats.lowAlerts ?? 0}
          subtitle="Informational"
          icon={Activity}
          variant="low"
          onClick={() => navigate('/alerts?severity=LOW')}
        />
        {/* Open Incidents */}
        <StatCard
          title="Open Inc."
          value={stats.openIncidents ?? 0}
          subtitle="Active response"
          icon={Flame}
          variant="high"
          onClick={() => navigate('/incidents')}
        />
        {/* Resolved Incidents */}
        <StatCard
          title="Resolved"
          value={stats.resolvedIncidents ?? 0}
          subtitle="Closed / Contained"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/incidents?status=RESOLVED')}
        />
        {/* Total Log Events */}
        <StatCard
          title="Log Events"
          value={stats.totalLogEvents ?? 0}
          subtitle="Ingested SIEM"
          icon={Terminal}
          variant="info"
          onClick={() => navigate('/logs')}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Timeline (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">Alert Timeline (Past 8 Hours)</h2>
              <p className="text-[11px] text-slate-400 font-mono">Volume of alerts ingested by severity</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              <TrendingUp className="h-3 w-3" /> Live Feed
            </span>
          </div>
          <AlertsTimelineChart data={stats.alertsOverTime || []} />
        </div>

        {/* Severity Distribution (1 col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">Severity Breakdown</h2>
              <p className="text-[11px] text-slate-400 font-mono">Active distribution</p>
            </div>
          </div>
          <SeverityDistributionChart
            data={stats.severityDistribution || { critical: 0, high: 0, medium: 0, low: 0 }}
          />
        </div>
      </div>

      {/* Secondary Charts: Incident Status, Top Source IPs, Event Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Incident Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              Incident Status Pipeline
            </h3>
            <p className="text-[11px] text-slate-400">Cases currently tracked</p>
          </div>
          <IncidentStatusChart data={stats.incidentStatusDistribution || []} />
        </div>

        {/* Top Source IPs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              Top Hostile Source IPs
            </h3>
            <p className="text-[11px] text-slate-400">Click bar to inspect threat profile</p>
          </div>
          <TopSourceIpsChart data={stats.topSourceIps || []} />
        </div>

        {/* Event Type Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              Detections by Attack Type
            </h3>
            <p className="text-[11px] text-slate-400">Top security categories</p>
          </div>
          <EventTypeChart data={stats.eventTypeDistribution || []} />
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-white font-mono uppercase">
              Recent Alerts
            </h2>
            <p className="text-xs text-slate-400">Latest threat triggers requiring analyst triage</p>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View Full Alert Queue ({stats.totalAlerts}) →
          </button>
        </div>

        <AlertTable alerts={recentAlerts} newAlertIds={newAlertIds} />
      </div>
    </div>
  );
};

export default Dashboard;
