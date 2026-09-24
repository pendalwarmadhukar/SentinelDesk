import React, { useState } from 'react';
import { Settings as SettingsIcon, Server, Bell, Shield, Database, RefreshCw, CheckCircle2, BellRing, BellOff } from 'lucide-react';
import { API_URL } from '../services/api';
import { mockStorage } from '../services/mockStorage';
import { useRealtimeAlerts } from '../context/RealtimeAlertContext';

export const Settings: React.FC = () => {
  const {
    audioEnabled,
    setAudioEnabled,
    desktopPermission,
    desktopNotificationsEnabled,
    setDesktopNotificationsEnabled,
    requestDesktopNotificationPermission,
  } = useRealtimeAlerts();

  const [pollingInterval, setPollingInterval] = useState('10');
  const [retentionDays, setRetentionDays] = useState('90');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    mockStorage.resetToDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
          SOC PLATFORM SETTINGS
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Backend API configuration, SIEM ingest parameters, and local telemetry cache
        </p>
      </div>

      <div className="space-y-6">
        {/* Backend API Configuration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Server className="h-5 w-5" />
            <h3 className="text-sm font-semibold uppercase font-mono tracking-wide text-white">
              Backend API Gateway Configuration
            </h3>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            SentinelDesk connects via Axios to your Node.js + Express.js + MongoDB backend using the{' '}
            <code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">VITE_API_URL</code>{' '}
            environment variable.
          </p>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Configured Base URL:</span>
              <span className="text-cyan-400 font-bold">{API_URL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Authentication Scheme:</span>
              <span className="text-slate-200">HTTP Bearer (JWT)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client Timeout:</span>
              <span className="text-slate-200">8000ms</span>
            </div>
          </div>
        </div>

        {/* Telemetry Ingestion Options */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-purple-400">
            <Shield className="h-5 w-5" />
            <h3 className="text-sm font-semibold uppercase font-mono tracking-wide text-white">
              SIEM &amp; Alert Ingest Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5">STREAM POLLING FREQUENCY</label>
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none"
              >
                <option value="5">Every 5 seconds (Real-Time)</option>
                <option value="10">Every 10 seconds (Standard)</option>
                <option value="30">Every 30 seconds (Conservative)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">LOG RETENTION WINDOW</label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none"
              >
                <option value="30">30 Days Hot Storage</option>
                <option value="90">90 Days (SOC 2 Standard)</option>
                <option value="365">365 Days (Full Compliance)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div>
              <p className="font-semibold text-slate-200">Audio Alarm on Critical Alerts</p>
              <p className="text-[11px] text-slate-500">Synthesized radar chime when severity is CRITICAL or HIGH</p>
            </div>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                audioEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {audioEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-200">Native OS Desktop Notifications</p>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                  desktopPermission === 'granted'
                    ? 'border-purple-500/40 bg-purple-950/40 text-purple-300'
                    : desktopPermission === 'default'
                    ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}>
                  {desktopPermission === 'granted' ? 'PERMISSION GRANTED' : desktopPermission === 'default' ? 'ACTION NEEDED' : desktopPermission.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Trigger system-level browser desktop popups on CRITICAL and HIGH severity incidents
              </p>
            </div>
            {desktopPermission === 'granted' ? (
              <button
                onClick={() => setDesktopNotificationsEnabled(!desktopNotificationsEnabled)}
                className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                  desktopNotificationsEnabled
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {desktopNotificationsEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            ) : desktopPermission === 'default' ? (
              <button
                onClick={requestDesktopNotificationPermission}
                className="rounded px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
              >
                REQUEST PERMISSION
              </button>
            ) : (
              <span className="text-[11px] text-rose-400 font-mono">Blocked in Browser</span>
            )}
          </div>
        </div>

        {/* Local Test Data Reset */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Database className="h-5 w-5" />
            <h3 className="text-sm font-semibold uppercase font-mono tracking-wide text-white">
              Local Cache &amp; Simulation Engine
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            Reset all modified alert notes, incident states, and custom simulated logs to default
            SOC test vectors.
          </p>

          {resetSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Reset completed! Reloading telemetry workspace...</span>
            </div>
          )}

          <div>
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset All SOC Test Data to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
