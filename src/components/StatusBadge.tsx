import React from 'react';
import { AlertStatus, IncidentStatus } from '../types';
import { getStatusConfig } from '../utils/formatters';

interface StatusBadgeProps {
  status: AlertStatus | IncidentStatus | string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = true,
  size = 'md',
}) => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium tracking-wider',
    md: 'text-xs px-2.5 py-0.5 font-semibold tracking-wider',
    lg: 'text-sm px-3 py-1 font-bold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border uppercase font-mono ${config.badge} ${sizeClasses[size]}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
