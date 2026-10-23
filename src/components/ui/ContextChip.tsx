import React from 'react';
import { X, FileCode, CheckSquare, Folder, LayoutGrid, Sparkles } from 'lucide-react';
import { ContextChip as ContextChipType } from '../../types';

export interface ContextChipProps {
  chip: ContextChipType;
  onToggle?: (chip: ContextChipType) => void;
  onRemove?: (chip: ContextChipType) => void;
}

export const ContextChip: React.FC<ContextChipProps> = ({
  chip,
  onToggle,
  onRemove,
}) => {
  const getIcon = (type: ContextChipType['type']) => {
    switch (type) {
      case 'file':
        return <FileCode className="w-3 h-3 text-accent-blue" />;
      case 'selection':
        return <CheckSquare className="w-3 h-3 text-accent" />;
      case 'folder':
        return <Folder className="w-3 h-3 text-amber-500" />;
      case 'project':
        return <LayoutGrid className="w-3 h-3 text-emerald-500" />;
      case 'skill':
        return <Sparkles className="w-3 h-3 text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onToggle?.(chip)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-fast select-none border ${
        chip.active
          ? 'bg-accent/15 border-accent/40 text-text font-semibold shadow-xs'
          : 'bg-surface border-border text-text-muted hover:border-text-muted/40 hover:text-text'
      }`}
    >
      {getIcon(chip.type)}
      <span>{chip.label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(chip);
          }}
          className="text-text-muted hover:text-text p-0.5 rounded"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};
