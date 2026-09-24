import React from 'react';
import { ActivityEvent } from '../types';
import { formatTimestamp, formatRelativeTime } from '../utils/formatters';
import { Clock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface IncidentTimelineProps {
  timeline: ActivityEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ timeline }) => {
  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 border-l border-slate-800 font-mono text-xs">
        {timeline.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No timeline entries yet.</p>
        ) : (
          timeline.map((event) => (
            <div key={event.id} className="relative">
              {/* Timeline pin */}
              <span className="absolute -left-[31px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500 ring-4 ring-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>

              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span className="font-semibold text-slate-200">{event.action}</span>
                  <span className="text-slate-500">{formatTimestamp(event.timestamp)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-purple-400">
                  <span>Logged by: {event.user}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(event.timestamp)}</span>
                </div>
                {event.details && (
                  <p className="mt-2 text-xs text-slate-300 font-sans border-t border-slate-800/60 pt-1.5">
                    {event.details}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncidentTimeline;
