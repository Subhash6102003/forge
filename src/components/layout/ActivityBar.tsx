import React from 'react';
import { Files, Search, GitBranch, Sparkles, Palette, Cpu, Settings, User } from 'lucide-react';

export type ActivityView = 'explorer' | 'search' | 'git' | 'skills' | 'art' | 'rea' | 'settings';

export interface ActivityBarProps {
  activeView: ActivityView;
  onSelectView: (view: ActivityView) => void;
  isSidePanelOpen: boolean;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onSelectView,
  isSidePanelOpen,
}) => {
  const topItems: Array<{ id: ActivityView; label: string; icon: React.ReactNode }> = [
    { id: 'explorer', label: 'Explorer', icon: <Files className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'git', label: 'Source Control', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'skills', label: 'AI Skills', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'art', label: 'Art Studio', icon: <Palette className="w-5 h-5" /> },
    { id: 'rea', label: 'REA Reverse Engineering', icon: <Cpu className="w-5 h-5" /> },
  ];

  return (
    <div className="w-[48px] h-full bg-activity-bar border-r border-border flex flex-col items-center justify-between py-2 shrink-0 select-none z-20">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-2 w-full">
        {topItems.map((item) => {
          const isActive = activeView === item.id && isSidePanelOpen;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={item.label}
              className={`relative flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-fast ${
                isActive
                  ? 'text-accent bg-surface shadow-xs'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover/60'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-accent rounded-r" />
              )}
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-2 w-full">
        <button
          onClick={() => onSelectView('settings')}
          title="Settings"
          className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-fast ${
            activeView === 'settings' && isSidePanelOpen
              ? 'text-accent bg-surface shadow-xs'
              : 'text-text-muted hover:text-text hover:bg-surface-hover/60'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          title="Account / Workspace Profile"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-active text-text-muted hover:text-text transition-colors duration-fast"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
