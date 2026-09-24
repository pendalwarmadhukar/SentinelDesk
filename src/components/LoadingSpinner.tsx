import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading telemetry & security data...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className={`animate-spin text-cyan-400 ${sizeClasses[size]}`} />
      {message && <p className="mt-3 text-xs font-mono tracking-wider text-slate-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
