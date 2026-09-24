import { INITIAL_ALERTS, INITIAL_DASHBOARD_STATS, INITIAL_INCIDENTS, INITIAL_LOGS, INITIAL_THREATS, INITIAL_USER } from './mockData';
import { SecurityAlert, SecurityLog, Incident, ThreatIntelligence, DashboardStats, User } from '../types';

const STORAGE_KEYS = {
  ALERTS: 'sentinel_alerts_v1',
  LOGS: 'sentinel_logs_v1',
  INCIDENTS: 'sentinel_incidents_v1',
  THREATS: 'sentinel_threats_v1',
  STATS: 'sentinel_stats_v1',
  USER: 'sentinel_user_v1',
};

class MockStorage {
  private alerts: SecurityAlert[];
  private logs: SecurityLog[];
  private incidents: Incident[];
  private threats: ThreatIntelligence[];
  private stats: DashboardStats;
  private user: User;

  constructor() {
    this.alerts = this.load(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    this.logs = this.load(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    this.incidents = this.load(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    this.threats = this.load(STORAGE_KEYS.THREATS, INITIAL_THREATS);
    this.stats = this.load(STORAGE_KEYS.STATS, INITIAL_DASHBOARD_STATS);
    this.user = this.load(STORAGE_KEYS.USER, INITIAL_USER);
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }

  // Alerts
  getAlerts() {
    return [...this.alerts];
  }

  getAlertById(id: string) {
    return this.alerts.find((a) => a.id === id);
  }

  updateAlert(id: string, updates: Partial<SecurityAlert>) {
    const idx = this.alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.alerts[idx] = { ...this.alerts[idx], ...updates };
      this.save(STORAGE_KEYS.ALERTS, this.alerts);
      return this.alerts[idx];
    }
    return null;
  }

  addAlertNote(id: string, author: string, content: string) {
    const alert = this.getAlertById(id);
    if (alert) {
      const newNote = {
        id: `note-${Date.now()}`,
        author,
        content,
        timestamp: new Date().toISOString(),
      };
      const updatedTimeline = [
        {
          id: `act-${Date.now()}`,
          action: `Note added by ${author}`,
          user: author,
          timestamp: new Date().toISOString(),
        },
        ...alert.activityTimeline,
      ];
      return this.updateAlert(id, {
        investigationNotes: [newNote, ...alert.investigationNotes],
        activityTimeline: updatedTimeline,
      });
    }
    return null;
  }

  createAlert(data: Partial<SecurityAlert>): SecurityAlert {
    const randomId = `ALT-${Math.floor(1030 + Math.random() * 8970)}`;
    const newAlert: SecurityAlert = {
      id: data.id || randomId,
      type: data.type || 'Suspicious Login',
      title: data.title || `Suspicious Activity Detected: ${data.type || 'Anomaly'}`,
      description: data.description || 'Automated SIEM telemetry pattern matched high-risk threshold.',
      severity: data.severity || 'CRITICAL',
      status: data.status || 'OPEN',
      sourceIp: data.sourceIp || '198.51.100.22',
      destinationIp: data.destinationIp || '10.0.1.15',
      sourcePort: data.sourcePort || 44321,
      destinationPort: data.destinationPort || 443,
      protocol: data.protocol || 'TCP',
      username: data.username || 'sec-admin',
      hostname: data.hostname || 'core-gateway-01',
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      eventCount: data.eventCount || 1,
      investigationNotes: data.investigationNotes || [],
      activityTimeline: data.activityTimeline || [
        {
          id: `act-${Date.now()}`,
          action: 'Alert Ingested via Real-Time SIEM Kafka Event Stream',
          user: 'Sentinel Ingestion Engine',
          timestamp: new Date().toISOString(),
        },
      ],
      relatedEvents: data.relatedEvents || [],
    };

    this.alerts = [newAlert, ...this.alerts];
    this.save(STORAGE_KEYS.ALERTS, this.alerts);

    // Dispatch browser event for local reactive updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sentinel:alert:created', { detail: newAlert }));
    }

    return newAlert;
  }

  // Logs
  getLogs() {
    return [...this.logs];
  }

  addLog(log: Omit<SecurityLog, 'id' | 'timestamp'>) {
    const newLog: SecurityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    this.logs = [newLog, ...this.logs];
    this.save(STORAGE_KEYS.LOGS, this.logs);
    return newLog;
  }

  // Incidents
  getIncidents() {
    return [...this.incidents];
  }

  getIncidentById(id: string) {
    return this.incidents.find((i) => i.id === id);
  }

  updateIncident(id: string, updates: Partial<Incident>) {
    const idx = this.incidents.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.incidents[idx] = {
        ...this.incidents[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save(STORAGE_KEYS.INCIDENTS, this.incidents);
      return this.incidents[idx];
    }
    return null;
  }

  addIncidentNote(id: string, author: string, content: string) {
    const inc = this.getIncidentById(id);
    if (inc) {
      const newNote = {
        id: `inc-note-${Date.now()}`,
        author,
        content,
        timestamp: new Date().toISOString(),
      };
      return this.updateIncident(id, {
        investigationNotes: [newNote, ...inc.investigationNotes],
      });
    }
    return null;
  }

  addResponseAction(id: string, actionName: string, executedBy: string) {
    const inc = this.getIncidentById(id);
    if (inc) {
      const newAction = {
        id: `resp-${Date.now()}`,
        action: actionName,
        status: 'EXECUTED' as const,
        executedBy,
        timestamp: new Date().toISOString(),
      };
      return this.updateIncident(id, {
        responseActions: [newAction, ...inc.responseActions],
      });
    }
    return null;
  }

  createIncident(data: {
    title: string;
    description: string;
    severity: Incident['severity'];
    assignedAnalyst: string;
    relatedAlerts?: string[];
  }): Incident {
    const newInc: Incident = {
      id: `INC-${Math.floor(400 + Math.random() * 500)}`,
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: 'OPEN',
      assignedAnalyst: data.assignedAnalyst,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedAlerts: data.relatedAlerts || [],
      timeline: [
        {
          id: `act-${Date.now()}`,
          action: 'Incident Created',
          user: data.assignedAnalyst,
          timestamp: new Date().toISOString(),
        },
      ],
      investigationNotes: [],
      responseActions: [],
    };
    this.incidents = [newInc, ...this.incidents];
    this.save(STORAGE_KEYS.INCIDENTS, this.incidents);
    return newInc;
  }

  // Threats
  getThreats() {
    return [...this.threats];
  }

  getThreatByIp(ip: string) {
    return this.threats.find((t) => t.ip === ip);
  }

  // Stats
  getStats(): DashboardStats {
    const critical = this.alerts.filter((a) => a.severity === 'CRITICAL').length;
    const high = this.alerts.filter((a) => a.severity === 'HIGH').length;
    const medium = this.alerts.filter((a) => a.severity === 'MEDIUM').length;
    const low = this.alerts.filter((a) => a.severity === 'LOW').length;
    const openInc = this.incidents.filter((i) => i.status !== 'RESOLVED').length;
    const resolvedInc = this.incidents.filter((i) => i.status === 'RESOLVED').length;

    return {
      ...this.stats,
      totalAlerts: this.alerts.length,
      criticalAlerts: critical,
      highAlerts: high,
      mediumAlerts: medium,
      lowAlerts: low,
      openIncidents: openInc,
      resolvedIncidents: resolvedInc,
      totalLogEvents: this.logs.length + 148280,
      severityDistribution: { critical, high, medium, low },
    };
  }

  // User Profile
  getUser(): User {
    return this.user;
  }

  updateUser(updates: Partial<User>) {
    this.user = { ...this.user, ...updates };
    this.save(STORAGE_KEYS.USER, this.user);
    // Notify window if user profile changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sentinel:user:updated', { detail: this.user }));
    }
    return this.user;
  }

  generateApiToken() {
    const token = `snt_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 10)}`;
    this.updateUser({ apiToken: token });
    return token;
  }

  revokeApiToken() {
    this.updateUser({ apiToken: undefined });
    return true;
  }

  resetToDefault() {
    this.alerts = INITIAL_ALERTS;
    this.logs = INITIAL_LOGS;
    this.incidents = INITIAL_INCIDENTS;
    this.threats = INITIAL_THREATS;
    this.stats = INITIAL_DASHBOARD_STATS;
    this.user = INITIAL_USER;
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.THREATS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const mockStorage = new MockStorage();
