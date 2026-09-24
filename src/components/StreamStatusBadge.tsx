import React from 'react';
import { useRealtimeAlerts } from '../context/RealtimeAlertContext';
import { Radio, Volume2, VolumeX, Pause, Play, Zap, Bell, BellOff, BellRing } from 'lucide-react';

export const StreamStatusBadge: React.FC<{ showControls?: boolean }> = ({ showControls = true }) => {
  const {
    connectionStatus,
    streamProtocol,
    isLiveStreaming,
    toggleLiveStreaming,
    audioEnabled,
    setAudioEnabled,
    simulateIncomingAlert,
    desktopPermission,
    desktopNotificationsEnabled,
    setDesktopNotificationsEnabled,
    requestDesktopNotificationPermission,
  } = useRealtimeAlerts();

  const [isSimulating, setIsSimulating] = React.useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await simulateIncomingAlert();
    } finally {
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  const handleDesktopAlertClick = async () => {
    if (desktopPermission === 'granted') {
      setDesktopNotificationsEnabled(!desktopNotificationsEnabled);
    } else if (desktopPermission === 'default') {
      await requestDesktopNotificationPermission();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
      {/* Stream Status indicator */}
      <div
        className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs backdrop-blur-sm transition-all ${
          connectionStatus === 'connected'
            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : connectionStatus === 'connecting'
            ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
            : 'border-slate-800 bg-slate-900/60 text-slate-400'
        }`}
        title={`Live alert ingestion stream active via ${streamProtocol.toUpperCase()}`}
      >
        <span className="relative flex h-2 w-2">
          {connectionStatus === 'connected' && isLiveStreaming && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              connectionStatus === 'connected'
                ? isLiveStreaming
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
        </span>
        <span className="font-semibold tracking-wider text-[11px] uppercase">
          {connectionStatus === 'connected'
            ? isLiveStreaming
              ? `LIVE ${streamProtocol.toUpperCase()}`
              : 'STREAM PAUSED'
            : 'CONNECTING...'}
        </span>
      </div>

      {showControls && (
        <div className="flex items-center gap-1.5">
          {/* Pause / Resume button */}
          <button
            onClick={toggleLiveStreaming}
            title={isLiveStreaming ? 'Pause live alert feed' : 'Resume live alert feed'}
            className="inline-flex items-center gap-1 rounded border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {isLiveStreaming ? (
              <>
                <Pause className="h-3 w-3 text-amber-400" />
                <span className="hidden sm:inline">Pause Feed</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-emerald-400" />
                <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Mute alert chime' : 'Enable alert sound'}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-colors ${
              audioEnabled
                ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40'
                : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
            }`}
          >
            {audioEnabled ? <Volume2 className="h-3 w-3 text-cyan-400" /> : <VolumeX className="h-3 w-3" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          {/* Native Desktop Alerts Toggle / Permission Request */}
          {desktopPermission !== 'unsupported' && (
            <button
              onClick={handleDesktopAlertClick}
              disabled={desktopPermission === 'denied'}
              title={
                desktopPermission === 'granted'
                  ? desktopNotificationsEnabled
                    ? 'Native OS desktop notifications active for CRITICAL & HIGH incidents (Click to mute)'
                    : 'Native desktop notifications muted (Click to enable)'
                  : desktopPermission === 'denied'
                  ? 'Desktop alerts blocked in browser settings'
                  : 'Click to enable native browser desktop notifications'
              }
              className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                desktopPermission === 'granted' && desktopNotificationsEnabled
                  ? 'border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                  : desktopPermission === 'default'
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 animate-pulse'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
              }`}
            >
              {desktopPermission === 'granted' && desktopNotificationsEnabled ? (
                <>
                  <BellRing className="h-3 w-3 text-purple-400 animate-pulse" />
                  <span className="hidden sm:inline">Desktop Alerts On</span>
                </>
              ) : desktopPermission === 'default' ? (
                <>
                  <Bell className="h-3 w-3 text-amber-400" />
                  <span className="hidden sm:inline">Enable Desktop Alerts</span>
                </>
              ) : (
                <>
                  <BellOff className="h-3 w-3 text-slate-500" />
                  <span className="hidden sm:inline">Desktop Alerts Off</span>
                </>
              )}
            </button>
          )}

          {/* Instant Attack Simulation Button */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            title="Push test security alert into SIEM stream immediately"
            className="inline-flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50"
          >
            <Zap className={`h-3 w-3 text-rose-400 ${isSimulating ? 'animate-bounce' : ''}`} />
            <span>Simulate Inbound Threat</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StreamStatusBadge;
