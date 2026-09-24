import apiClient from './api';
import { SecurityAlert, Incident } from '../types';

export interface InvestigationWorkspaceData {
  alert: SecurityAlert;
  incident?: Incident;
}

export const investigationApi = {
  getInvestigationData: async (alertId: string): Promise<InvestigationWorkspaceData> => {
    const alertRes = await apiClient.get<SecurityAlert>(`/alerts/${alertId}`);
    let incident: Incident | undefined;
    try {
      const incRes = await apiClient.get<Incident>(`/incidents/by-alert/${alertId}`);
      incident = incRes.data;
    } catch {
      // not escalated to incident yet
    }
    return { alert: alertRes.data, incident };
  },

  saveInvestigation: async (
    alertId: string,
    payload: {
      notes: string;
      analyst: string;
      status?: SecurityAlert['status'];
      severity?: SecurityAlert['severity'];
    }
  ): Promise<SecurityAlert> => {
    const res = await apiClient.post<SecurityAlert>(`/investigations/${alertId}/save`, payload);
    return res.data;
  },

  escalateToIncident: async (
    alertId: string,
    payload: {
      title: string;
      description: string;
      severity: SecurityAlert['severity'];
      assignedAnalyst: string;
    }
  ): Promise<Incident> => {
    const res = await apiClient.post<Incident>(`/investigations/${alertId}/escalate`, payload);
    return res.data;
  },
};

export default investigationApi;
