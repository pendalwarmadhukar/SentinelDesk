import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-800 hover:border-slate-700',
      iconBg: 'bg-slate-800 text-slate-300',
      valColor: 'text-white',
      accentGlow: 'hover:shadow-slate-900/40',
    },
    critical: {
      border: 'border-rose-900/50 hover:border-rose-700/80 bg-gradient-to-br from-rose-950/20 to-slate-900/60',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      valColor: 'text-rose-400',
      accentGlow: 'hover:shadow-rose-950/30',
    },
    high: {
      border: 'border-orange-900/50 hover:border-orange-700/80 bg-gradient-to-br from-orange-950/20 to-slate-900/60',
      iconBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
      valColor: 'text-orange-400',
      accentGlow: 'hover:shadow-orange-950/30',
    },
    medium: {
      border: 'border-amber-900/50 hover:border-amber-700/80 bg-gradient-to-br from-amber-950/20 to-slate-900/60',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      valColor: 'text-amber-300',
      accentGlow: 'hover:shadow-amber-950/30',
    },
    low: {
      border: 'border-sky-900/50 hover:border-sky-700/80 bg-gradient-to-br from-sky-950/20 to-slate-900/60',
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
      valColor: 'text-sky-400',
      accentGlow: 'hover:shadow-sky-950/30',
    },
    success: {
      border: 'border-emerald-900/50 hover:border-emerald-700/80 bg-gradient-to-br from-emerald-950/20 to-slate-900/60',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      valColor: 'text-emerald-400',
      accentGlow: 'hover:shadow-emerald-950/30',
    },
    info: {
      border: 'border-cyan-900/50 hover:border-cyan-700/80 bg-gradient-to-br from-cyan-950/20 to-slate-900/60',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      valColor: 'text-cyan-400',
      accentGlow: 'hover:shadow-cyan-950/30',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 bg-slate-900/80 backdrop-blur-sm shadow-lg ${
        style.border
      } ${style.accentGlow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <p className={`mt-2 font-mono text-2xl font-bold tracking-tight ${style.valColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`rounded-lg p-2.5 ${style.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {subtitle && (
        <div className="mt-2.5 flex items-center text-xs text-slate-400">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
