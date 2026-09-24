import apiClient from './api';
import { AuthResponse, User } from '../types';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', credentials);
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const res = await apiClient.patch<User>('/users/profile', userData);
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },

  toggleMfa: async (enabled: boolean): Promise<{ success: boolean; mfaEnabled: boolean; mfaType: string }> => {
    const res = await apiClient.post('/auth/mfa/toggle', { enabled });
    return res.data;
  },

  generateApiToken: async (): Promise<{ token: string }> => {
    const res = await apiClient.post('/auth/api-tokens');
    return res.data;
  },

  revokeApiToken: async (): Promise<{ success: boolean }> => {
    const res = await apiClient.delete('/auth/api-tokens');
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    }
  },
};

export default authApi;
