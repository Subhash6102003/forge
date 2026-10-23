import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  icon,
  clearable,
  onClear,
  error,
  className = '',
  value,
  ...props
}, ref) => {
  return (
    <div className="relative w-full flex flex-col gap-1">
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-2.5 text-text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          value={value}
          className={`w-full bg-input-bg text-text text-sm rounded-md border ${
            error ? 'border-accent-red focus:ring-accent-red/20' : 'border-border focus:border-accent focus:ring-accent/20'
          } py-1.5 ${icon ? 'pl-8' : 'pl-3'} ${clearable && value ? 'pr-8' : 'pr-3'} placeholder:text-text-muted/60 focus:outline-none focus:ring-2 transition-all duration-fast ${className}`}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 text-text-muted hover:text-text focus:outline-none"
          >
            ×
          </button>
        )}
      </div>
      {error && <span className="text-xs text-accent-red">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
