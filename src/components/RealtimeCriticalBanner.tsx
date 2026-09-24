import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeAlerts } from '../context/RealtimeAlertContext';
import { AlertOctagon, ArrowRight, X, Radio, ShieldAlert } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export const RealtimeCriticalBanner: React.FC = () => {
  const { bannerAlert, dismissBanner } = useRealtimeAlerts();
  const navigate = useNavigate();

  if (!bannerAlert) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-rose-950/90 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <AlertOctagon className="h-5 w-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-rose-500/30 px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wide text-rose-200 uppercase">
                <Radio className="h-2.5 w-2.5 animate-pulse text-rose-400" />
                Real-Time Ingestion
              </span>
              <span className="font-mono text-xs font-bold text-white">{bannerAlert.id}</span>
              <SeverityBadge severity={bannerAlert.severity} size="sm" />
            </div>
            <p className="text-xs font-medium text-slate-200">
              <span className="font-semibold text-rose-300">{bannerAlert.type}:</span> {bannerAlert.title}
              <span className="ml-2 font-mono text-[11px] text-slate-400">({bannerAlert.sourceIp} &rarr; {bannerAlert.destinationIp})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => {
              dismissBanner();
              navigate(`/alerts/${bannerAlert.id}`);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-bold font-mono tracking-wide shadow transition-colors"
          >
            Investigate Now <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={dismissBanner}
            title="Dismiss notification"
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealtimeCriticalBanner;
