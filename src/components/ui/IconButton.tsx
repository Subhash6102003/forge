import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'secondary' | 'primary' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  active?: boolean;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  active = false,
  tooltip,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md transition-colors duration-fast focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:opacity-40 disabled:cursor-not-allowed';

  const sizeClasses = {
    xs: 'w-6 h-6 p-1 text-xs',
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-8 h-8 p-1.5 text-sm',
    lg: 'w-10 h-10 p-2 text-base',
  }[size];

  const variantClasses = {
    ghost: active 
      ? 'bg-surface-active text-text font-medium' 
      : 'bg-transparent text-text-muted hover:text-text hover:bg-surface-hover',
    secondary: 'bg-surface text-text hover:bg-surface-hover border border-border',
    primary: 'bg-accent text-white hover:opacity-90',
    danger: 'text-accent-red hover:bg-accent-red/10',
  }[variant];

  return (
    <button
      title={tooltip}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
