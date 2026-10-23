import React from 'react';

export interface DockProps {
  position: 'left' | 'right' | 'bottom';
  isOpen: boolean;
  onClose?: () => void;
  width?: string | number;
  height?: string | number;
  children: React.ReactNode;
  className?: string;
}

export const Dock: React.FC<DockProps> = ({
  position,
  isOpen,
  width = 280,
  height = 240,
  children,
  className = '',
}) => {
  if (!isOpen) return null;

  const style: React.CSSProperties = {
    ...(position === 'left' || position === 'right' ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(position === 'bottom' ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const borderClass = {
    left: 'border-r border-border',
    right: 'border-l border-border',
    bottom: 'border-t border-border',
  }[position];

  return (
    <div
      style={style}
      className={`bg-surface flex flex-col shrink-0 overflow-hidden ${borderClass} ${className}`}
    >
      {children}
    </div>
  );
};
