import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-accent/40 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1.5',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-accent text-white hover:opacity-90 active:opacity-95 shadow-subtle',
    secondary: 'bg-surface text-text hover:bg-surface-hover active:bg-surface-active border border-border',
    ghost: 'bg-transparent text-text hover:bg-surface-hover active:bg-surface-active',
    danger: 'bg-accent-red text-white hover:opacity-90 active:opacity-95',
    success: 'bg-accent-green text-white hover:opacity-90 active:opacity-95',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
