import React, { useState } from 'react';

export interface SplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  initialSplit?: number; // percentage (e.g. 50)
  minSize?: number; // min px for primary panel
  primary: React.ReactNode;
  secondary: React.ReactNode;
  className?: string;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  direction = 'horizontal',
  initialSplit = 50,
  minSize = 100,
  primary,
  secondary,
  className = '',
}) => {
  const [split, setSplit] = useState(initialSplit);
  const [isDragging, setIsDragging] = useState(false);

  const isHorizontal = direction === 'horizontal';

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (isHorizontal) {
      const offset = e.clientX - rect.left;
      const pct = Math.max(10, Math.min(90, (offset / rect.width) * 100));
      setSplit(pct);
    } else {
      const offset = e.clientY - rect.top;
      const pct = Math.max(10, Math.min(90, (offset / rect.height) * 100));
      setSplit(pct);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full flex ${
        isHorizontal ? 'flex-row' : 'flex-col'
      } overflow-hidden select-none ${className}`}
    >
      <div
        style={{
          [isHorizontal ? 'width' : 'height']: `${split}%`,
          [isHorizontal ? 'minWidth' : 'minHeight']: `${minSize}px`,
        }}
        className="h-full overflow-hidden"
      >
        {primary}
      </div>

      <div
        onMouseDown={handleMouseDown}
        className={`${
          isHorizontal
            ? 'w-1 cursor-col-resize hover:bg-accent'
            : 'h-1 cursor-row-resize hover:bg-accent'
        } bg-border shrink-0 transition-colors z-10`}
      />

      <div
        style={{
          [isHorizontal ? 'width' : 'height']: `${100 - split}%`,
          [isHorizontal ? 'minWidth' : 'minHeight']: `${minSize}px`,
        }}
        className="h-full flex-1 overflow-hidden"
      >
        {secondary}
      </div>
    </div>
  );
};
