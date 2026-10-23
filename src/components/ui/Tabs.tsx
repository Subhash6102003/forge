import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  closable?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  onClose?: (id: string) => void;
  variant?: 'editor' | 'panel' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  onClose,
  variant = 'editor',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <div className={`flex items-center gap-1 p-0.5 bg-surface rounded-md border border-border ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-sm font-medium transition-all duration-fast ${
                isActive
                  ? 'bg-accent text-white shadow-subtle'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-active text-text-muted'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center border-b border-border bg-titlebar overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`group relative flex items-center gap-2 px-3 py-2 text-xs border-r border-border cursor-pointer select-none transition-colors duration-fast ${
              isActive
                ? 'bg-editor-bg text-text font-medium border-t-2 border-t-accent'
                : 'bg-transparent text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span className="truncate max-w-[140px]">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-surface-active text-text-muted">
                {tab.badge}
              </span>
            )}
            {tab.closable && onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-surface-active text-text-muted hover:text-text rounded p-0.5 ml-1 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
