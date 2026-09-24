import apiClient from './api';
import { SecurityLog, PaginatedResponse } from '../types';

export interface LogFilterParams {
  search?: string;
  severity?: string;
  hostname?: string;
  username?: string;
  sourceIp?: string;
  eventType?: string;
  page?: number;
  limit?: number;
}

export const logApi = {
  getLogs: async (params: LogFilterParams = {}): Promise<PaginatedResponse<SecurityLog>> => {
    const res = await apiClient.get<PaginatedResponse<SecurityLog>>('/logs', { params });
    return res.data;
  },

  createLog: async (log: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<SecurityLog> => {
    const res = await apiClient.post<SecurityLog>('/logs', log);
    return res.data;
  },
};

export default logApi;
