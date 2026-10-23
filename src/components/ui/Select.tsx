import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="relative inline-flex items-center w-full">
      {icon && (
        <span className="absolute left-2.5 text-text-muted pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full bg-surface text-text text-xs rounded-md border border-border py-1.5 ${
          icon ? 'pl-8' : 'pl-2.5'
        } pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-text">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 pointer-events-none text-text-muted text-[10px]">
        ▼
      </div>
    </div>
  );
};
