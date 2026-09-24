import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Alerts from '../pages/Alerts';
import AlertDetailsPage from '../pages/AlertDetailsPage';
import SecurityLogs from '../pages/SecurityLogs';
import Incidents from '../pages/Incidents';
import IncidentDetailsPage from '../pages/IncidentDetailsPage';
import Investigation from '../pages/Investigation';
import ThreatIntelligencePage from '../pages/ThreatIntelligence';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected SOC Operations Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:id" element={<AlertDetailsPage />} />
          <Route path="/logs" element={<SecurityLogs />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/threats" element={<ThreatIntelligencePage />} />
          <Route path="/threats/:ip" element={<ThreatIntelligencePage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
