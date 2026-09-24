import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { mockStorage } from './mockStorage';

// Configure base API URL using environment variable as required
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Broadcast backend status (live vs fallback) to UI
export const notifyBackendStatus = (isLive: boolean, url: string = API_URL) => {
  window.dispatchEvent(
    new CustomEvent('sentinel:backend-status', {
      detail: { isLive, url },
    })
  );
};

// Request Interceptor: Attach JWT Token securely
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('sentinel_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to safely parse payload
function parsePayload(data: any) {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Response Interceptor: Seamless fallback adapter for preview environment
apiClient.interceptors.response.use(
  (response) => {
    // If response is HTML string (from Vite dev server history fallback when backend is offline/mocked), intercept as fallback
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html>') ||
        response.data.includes('<html') ||
        response.data.includes('<!DOCTYPE html>'))
    ) {
      const url = response.config.url || '';
      const method = (response.config.method || 'get').toLowerCase();
      const reqData = parsePayload(response.config.data);
      const params = response.config.params || {};

      try {
        const mockResponse = handleMockFallback(url, method, reqData, params);
        if (mockResponse !== undefined) {
          notifyBackendStatus(false);
          return {
            ...response,
            data: mockResponse,
          };
        }
      } catch (mockErr) {
        console.warn('Mock adapter response fallback error:', mockErr);
      }
    }

    notifyBackendStatus(true);
    return response;
  },
  async (error: AxiosError) => {
    const isNetworkError =
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      (error.response && error.response.status === 404);

    // If backend is not currently running or returned 404/network error,
    // handle seamlessly via Mock Adapter so the analyst can interact with the applet
    if (isNetworkError && error.config) {
      notifyBackendStatus(false);
      const url = error.config.url || '';
      const method = (error.config.method || 'get').toLowerCase();
      const reqData = parsePayload(error.config.data);
      const params = error.config.params || {};

      try {
        const mockResponse = handleMockFallback(url, method, reqData, params);
        if (mockResponse !== undefined) {
          return {
            data: mockResponse,
            status: 200,
            statusText: 'OK (Mock Fallback)',
            headers: {},
            config: error.config,
          };
        }
      } catch (mockErr) {
        console.warn('Mock adapter error:', mockErr);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * In-memory fallback router when external Node.js backend is offline
 */
function handleMockFallback(url: string, method: string, data: any, params: any): any {
  // Auth routes
  if (url.includes('/auth/login') && method === 'post') {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sentinel_mock_token_analyst',
      user: mockStorage.getUser(),
    };
  }
  if (url.includes('/auth/register') && method === 'post') {
    const newUser = mockStorage.updateUser({
      name: data.name || 'New Analyst',
      email: data.email || 'analyst@sentineldesk.internal',
      role: 'Tier 1 Junior Analyst',
    });
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sentinel_mock_token_analyst',
      user: newUser,
    };
  }
  if (url.includes('/auth/me') && method === 'get') {
    return mockStorage.getUser();
  }

  // Profile endpoints
  if ((url.includes('/users/profile') || url.includes('/auth/profile')) && (method === 'patch' || method === 'put' || method === 'post')) {
    return mockStorage.updateUser(data);
  }
  if ((url.includes('/users/profile') || url.includes('/auth/profile')) && method === 'get') {
    return mockStorage.getUser();
  }
  if (url.includes('/auth/change-password') && method === 'post') {
    return { success: true, message: 'Password updated and authentication certificates re-issued.' };
  }
  if (url.includes('/auth/mfa/toggle') && method === 'post') {
    const updated = mockStorage.updateUser({
      mfaEnabled: data.enabled ?? true,
      mfaType: data.enabled ? 'FIDO2 WebAuthn (YubiKey 5C NFC)' : 'Disabled',
    });
    return { success: true, mfaEnabled: updated.mfaEnabled, mfaType: updated.mfaType };
  }
  if (url.includes('/auth/api-tokens') && method === 'post') {
    const token = mockStorage.generateApiToken();
    return { token };
  }
  if (url.includes('/auth/api-tokens') && method === 'delete') {
    mockStorage.revokeApiToken();
    return { success: true };
  }

  // Dashboard Stats
  if (url.includes('/dashboard/stats') && method === 'get') {
    return mockStorage.getStats();
  }

  // Alerts routes
  if (url.includes('/alerts/simulate') && method === 'post') {
    const created = mockStorage.createAlert(data);
    return {
      success: true,
      data: created,
      stats: mockStorage.getStats(),
    };
  }

  if (url.includes('/alerts/stream/toggle') && method === 'post') {
    return { active: data.active ?? true };
  }

  const alertNotesMatch = url.match(/\/alerts\/([^/]+)\/notes/);
  if (alertNotesMatch && method === 'post') {
    const alertId = alertNotesMatch[1];
    const updated = mockStorage.addAlertNote(alertId, data.author || 'Analyst', data.content);
    return updated;
  }

  const alertStatusMatch = url.match(/\/alerts\/([^/]+)\/status/);
  if (alertStatusMatch && (method === 'patch' || method === 'put')) {
    const alertId = alertStatusMatch[1];
    return mockStorage.updateAlert(alertId, { status: data.status });
  }

  const alertSeverityMatch = url.match(/\/alerts\/([^/]+)\/severity/);
  if (alertSeverityMatch && (method === 'patch' || method === 'put')) {
    const alertId = alertSeverityMatch[1];
    return mockStorage.updateAlert(alertId, { severity: data.severity });
  }

  const singleAlertMatch = url.match(/\/alerts\/([^/?#]+)$/);
  if (singleAlertMatch && method === 'get') {
    const alertId = singleAlertMatch[1];
    const alert = mockStorage.getAlertById(alertId);
    if (!alert) return mockStorage.getAlerts()[0];
    return alert;
  }

  if (url.includes('/alerts') && method === 'get') {
    let alerts = mockStorage.getAlerts();
    if (params.search) {
      const q = String(params.search).toLowerCase();
      alerts = alerts.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.sourceIp.includes(q) ||
          a.hostname.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
      );
    }
    if (params.severity && params.severity !== 'ALL') {
      alerts = alerts.filter((a) => a.severity === params.severity);
    }
    if (params.status && params.status !== 'ALL') {
      alerts = alerts.filter((a) => a.status === params.status);
    }
    if (params.type && params.type !== 'ALL') {
      alerts = alerts.filter((a) => a.type === params.type);
    }
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const start = (page - 1) * limit;
    return {
      data: alerts.slice(start, start + limit),
      total: alerts.length,
      page,
      limit,
      totalPages: Math.ceil(alerts.length / limit) || 1,
    };
  }

  // Security Logs routes
  if (url.includes('/logs') && method === 'get') {
    let logs = mockStorage.getLogs();
    if (params.search) {
      const q = String(params.search).toLowerCase();
      logs = logs.filter(
        (l) =>
          l.sourceIp.includes(q) ||
          l.hostname.toLowerCase().includes(q) ||
          l.username.toLowerCase().includes(q) ||
          l.eventType.toLowerCase().includes(q) ||
          l.message.toLowerCase().includes(q)
      );
    }
    if (params.severity && params.severity !== 'ALL') {
      logs = logs.filter((l) => l.severity === params.severity);
    }
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const start = (page - 1) * limit;
    return {
      data: logs.slice(start, start + limit),
      total: logs.length,
      page,
      limit,
      totalPages: Math.ceil(logs.length / limit) || 1,
    };
  }

  // Incidents routes
  const incNotesMatch = url.match(/\/incidents\/([^/]+)\/notes/);
  if (incNotesMatch && method === 'post') {
    const incId = incNotesMatch[1];
    return mockStorage.addIncidentNote(incId, data.author || 'Analyst', data.content);
  }

  const incActionsMatch = url.match(/\/incidents\/([^/]+)\/actions/);
  if (incActionsMatch && method === 'post') {
    const incId = incActionsMatch[1];
    return mockStorage.addResponseAction(incId, data.action, data.executedBy || 'Analyst');
  }

  const singleIncPatchMatch = url.match(/\/incidents\/([^/?#]+)$/);
  if (singleIncPatchMatch && (method === 'patch' || method === 'put')) {
    const incId = singleIncPatchMatch[1];
    return mockStorage.updateIncident(incId, data);
  }

  if (singleIncPatchMatch && method === 'get') {
    const incId = singleIncPatchMatch[1];
    const inc = mockStorage.getIncidentById(incId);
    if (!inc) return mockStorage.getIncidents()[0];
    return inc;
  }

  if (url.includes('/incidents') && method === 'post') {
    return mockStorage.createIncident(data);
  }

  if (url.includes('/incidents') && method === 'get') {
    let incidents = mockStorage.getIncidents();
    if (params.search) {
      const q = String(params.search).toLowerCase();
      incidents = incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.assignedAnalyst.toLowerCase().includes(q)
      );
    }
    if (params.status && params.status !== 'ALL') {
      incidents = incidents.filter((i) => i.status === params.status);
    }
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const start = (page - 1) * limit;
    return {
      data: incidents.slice(start, start + limit),
      total: incidents.length,
      page,
      limit,
      totalPages: Math.ceil(incidents.length / limit) || 1,
    };
  }

  // Threat Intel routes
  const singleThreatMatch = url.match(/\/threats\/([^/?#]+)$/);
  if (singleThreatMatch && method === 'get') {
    const rawIp = singleThreatMatch[1];
    const ip = decodeURIComponent(rawIp);
    const item = mockStorage.getThreatByIp(ip);
    if (!item) return mockStorage.getThreats()[0];
    return item;
  }

  if (url.includes('/threats') && method === 'get') {
    return mockStorage.getThreats();
  }

  // Profile / Settings
  if (url.includes('/users/profile') && (method === 'patch' || method === 'put')) {
    return mockStorage.updateUser(data);
  }

  return undefined;
}

export default apiClient;
