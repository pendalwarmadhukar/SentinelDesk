import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Telemetry Ingestion Error',
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-6 text-center shadow-lg">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold uppercase tracking-wider text-rose-300 font-mono">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 px-4 py-2 text-xs font-semibold text-rose-300 border border-rose-500/40 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
