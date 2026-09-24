export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';

export type AlertType =
  | 'Brute Force'
  | 'Port Scan'
  | 'Suspicious Login'
  | 'Malware Indicator'
  | 'Privilege Escalation'
  | 'Suspicious Process'
  | 'Network Anomaly';

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';

export interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface RelatedEvent {
  id: string;
  timestamp: string;
  eventType: string;
  message: string;
  severity: Severity;
  sourceIp: string;
}

export interface SecurityAlert {
  id: string; // e.g. "ALT-1024"
  type: AlertType;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  username: string;
  hostname: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  assignedTo?: string;
  investigationNotes: Note[];
  activityTimeline: ActivityEvent[];
  relatedEvents: RelatedEvent[];
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  hostname: string;
  username: string;
  sourceIp: string;
  eventType: string;
  message: string;
  severity: Severity;
}

export interface ResponseAction {
  id: string;
  action: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  executedBy?: string;
  timestamp: string;
}

export interface Incident {
  id: string; // e.g. "INC-402"
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  assignedAnalyst: string;
  assignedAnalystEmail?: string;
  createdAt: string;
  updatedAt: string;
  relatedAlerts: string[];
  timeline: ActivityEvent[];
  investigationNotes: Note[];
  responseActions: ResponseAction[];
}

export interface ThreatIntelligence {
  ip: string;
  threatType: string;
  riskLevel: Severity;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  country?: string;
  asn?: string;
  reputationScore?: number; // 0-100 (100 = malicious)
  associatedAlertsCount?: number;
  recommendedAction?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  badge?: string;
  department?: string;
  shift?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  clearanceLevel?: string;
  workstation?: string;
  timezone?: string;
  bio?: string;
  mfaEnabled?: boolean;
  mfaType?: string;
  lastLogin?: string;
  activeIp?: string;
  alertsTriageCount?: number;
  incidentsResolvedCount?: number;
  avgResponseTimeMinutes?: number;
  apiToken?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  openIncidents: number;
  resolvedIncidents: number;
  totalLogEvents: number;
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  alertsOverTime: Array<{
    timestamp: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }>;
  incidentStatusDistribution: Array<{
    status: IncidentStatus;
    count: number;
  }>;
  topSourceIps: Array<{
    ip: string;
    events: number;
    threatType: string;
    riskLevel: Severity;
  }>;
  eventTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
