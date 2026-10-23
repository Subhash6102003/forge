import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto h-full">
      {icon && <div className="mb-3 text-text-muted opacity-80">{icon}</div>}
      <h4 className="text-sm font-semibold text-text mb-1">{title}</h4>
      {description && <p className="text-xs text-text-muted leading-relaxed mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
