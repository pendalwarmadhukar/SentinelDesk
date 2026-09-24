import apiClient from './api';
import { Incident, IncidentStatus, Severity, PaginatedResponse } from '../types';

export interface IncidentFilterParams {
  search?: string;
  status?: string;
  severity?: string;
  assignedAnalyst?: string;
  page?: number;
  limit?: number;
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  severity: Severity;
  assignedAnalyst: string;
  relatedAlerts?: string[];
}

export const incidentApi = {
  getIncidents: async (params: IncidentFilterParams = {}): Promise<PaginatedResponse<Incident>> => {
    const res = await apiClient.get<PaginatedResponse<Incident>>('/incidents', { params });
    return res.data;
  },

  getIncidentById: async (id: string): Promise<Incident> => {
    const res = await apiClient.get<Incident>(`/incidents/${id}`);
    return res.data;
  },

  createIncident: async (payload: CreateIncidentPayload): Promise<Incident> => {
    const res = await apiClient.post<Incident>('/incidents', payload);
    return res.data;
  },

  updateIncident: async (id: string, updates: Partial<Incident>): Promise<Incident> => {
    const res = await apiClient.patch<Incident>(`/incidents/${id}`, updates);
    return res.data;
  },

  updateStatus: async (id: string, status: IncidentStatus): Promise<Incident> => {
    const res = await apiClient.patch<Incident>(`/incidents/${id}`, { status });
    return res.data;
  },

  updateSeverity: async (id: string, severity: Severity): Promise<Incident> => {
    const res = await apiClient.patch<Incident>(`/incidents/${id}`, { severity });
    return res.data;
  },

  updateAssignedAnalyst: async (id: string, assignedAnalyst: string): Promise<Incident> => {
    const res = await apiClient.patch<Incident>(`/incidents/${id}`, { assignedAnalyst });
    return res.data;
  },

  addInvestigationNote: async (id: string, note: { author: string; content: string }): Promise<Incident> => {
    const res = await apiClient.post<Incident>(`/incidents/${id}/notes`, note);
    return res.data;
  },

  executeResponseAction: async (
    id: string,
    action: { action: string; executedBy: string }
  ): Promise<Incident> => {
    const res = await apiClient.post<Incident>(`/incidents/${id}/actions`, action);
    return res.data;
  },
};

export default incidentApi;
