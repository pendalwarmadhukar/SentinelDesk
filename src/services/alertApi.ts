import apiClient from './api';
import { SecurityAlert, AlertStatus, Severity, PaginatedResponse } from '../types';

export interface AlertFilterParams {
  search?: string;
  severity?: string;
  status?: string;
  type?: string;
  sourceIp?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export const alertApi = {
  getAlerts: async (params: AlertFilterParams = {}): Promise<PaginatedResponse<SecurityAlert>> => {
    const res = await apiClient.get<PaginatedResponse<SecurityAlert>>('/alerts', { params });
    return res.data;
  },

  getAlertById: async (id: string): Promise<SecurityAlert> => {
    const res = await apiClient.get<SecurityAlert>(`/alerts/${id}`);
    return res.data;
  },

  updateAlertStatus: async (id: string, status: AlertStatus): Promise<SecurityAlert> => {
    const res = await apiClient.patch<SecurityAlert>(`/alerts/${id}/status`, { status });
    return res.data;
  },

  updateAlertSeverity: async (id: string, severity: Severity): Promise<SecurityAlert> => {
    const res = await apiClient.patch<SecurityAlert>(`/alerts/${id}/severity`, { severity });
    return res.data;
  },

  addInvestigationNote: async (id: string, note: { author: string; content: string }): Promise<SecurityAlert> => {
    const res = await apiClient.post<SecurityAlert>(`/alerts/${id}/notes`, note);
    return res.data;
  },

  escalateToIncident: async (alertId: string, details?: { title?: string; description?: string }): Promise<any> => {
    const res = await apiClient.post(`/alerts/${alertId}/escalate`, details || {});
    return res.data;
  },

  simulateAlert: async (customData?: Partial<SecurityAlert>): Promise<{ success: boolean; data: SecurityAlert }> => {
    const res = await apiClient.post('/alerts/simulate', customData || {});
    return res.data;
  },

  toggleStream: async (active?: boolean): Promise<{ active: boolean }> => {
    const res = await apiClient.post('/alerts/stream/toggle', { active });
    return res.data;
  },
};

export default alertApi;
