import apiClient from './api';
import { ThreatIntelligence } from '../types';

export const threatApi = {
  getAllThreats: async (): Promise<ThreatIntelligence[]> => {
    const res = await apiClient.get<ThreatIntelligence[]>('/threats');
    return res.data;
  },

  getThreatByIp: async (ip: string): Promise<ThreatIntelligence> => {
    const res = await apiClient.get<ThreatIntelligence>(`/threats/${ip}`);
    return res.data;
  },
};

export default threatApi;
