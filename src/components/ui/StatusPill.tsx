import React from 'react';

export interface StatusPillProps {
  status: 'healthy' | 'warning' | 'offline' | 'downloading' | 'info';
  label: string;
  icon?: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  icon,
  showDot = true,
  className = '',
}) => {
  const dotColor = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    offline: 'bg-rose-500',
    downloading: 'bg-sky-500 animate-pulse',
    info: 'bg-slate-400',
  }[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface border border-border text-text select-none ${className}`}
    >
      {showDot && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};
