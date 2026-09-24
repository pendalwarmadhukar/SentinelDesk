/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { RealtimeAlertProvider } from './context/RealtimeAlertContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <RealtimeAlertProvider>
            <AppRoutes />
          </RealtimeAlertProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
