import React from 'react';
import { Search, PanelLeft, PanelBottom, PanelRight, Minus, Square, X, Flame } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export interface TitleBarProps {
  onOpenCommandPalette: () => void;
  isSidePanelOpen: boolean;
  onToggleSidePanel: () => void;
  isBottomPanelOpen: boolean;
  onToggleBottomPanel: () => void;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onOpenCommandPalette,
  isSidePanelOpen,
  onToggleSidePanel,
  isBottomPanelOpen,
  onToggleBottomPanel,
  isAssistantOpen,
  onToggleAssistant,
}) => {
  const menuItems = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

  return (
    <div className="h-[38px] w-full bg-titlebar border-b border-border flex items-center justify-between px-3 select-none z-30 shrink-0">
      {/* Left: App Logo & Menus */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-text text-xs tracking-wide">
          <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center text-accent">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-bold tracking-tight">Forge</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-text-muted">
          {menuItems.map((item) => (
            <button
              key={item}
              className="px-2 py-1 rounded hover:bg-surface-hover hover:text-text transition-colors duration-fast"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center justify-between w-72 md:w-96 px-3 py-1 bg-surface border border-border rounded-md text-xs text-text-muted hover:border-accent/40 hover:text-text transition-all duration-fast shadow-xs"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          <span className="truncate">Search or type a command...</span>
        </div>
        <kbd className="px-1.5 py-0.2 text-[10px] font-mono bg-surface-active rounded border border-border">
          Ctrl+K
        </kbd>
      </button>

      {/* Right: Panel Toggles & Window Controls */}
      <div className="flex items-center gap-1">
        <IconButton
          size="xs"
          active={isSidePanelOpen}
          tooltip="Toggle Primary Side Bar (Ctrl+B)"
          onClick={onToggleSidePanel}
        >
          <PanelLeft className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton
          size="xs"
          active={isBottomPanelOpen}
          tooltip="Toggle Panel (Ctrl+`)"
          onClick={onToggleBottomPanel}
        >
          <PanelBottom className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton
          size="xs"
          active={isAssistantOpen}
          tooltip="Toggle AI Assistant (Ctrl+Shift+L)"
          onClick={onToggleAssistant}
        >
          <PanelRight className="w-3.5 h-3.5" />
        </IconButton>

        <div className="h-4 w-px bg-border mx-1.5" />

        <div className="flex items-center">
          <button className="w-6 h-6 flex items-center justify-center text-text-muted hover:bg-surface-hover rounded">
            <Minus className="w-3 h-3" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-text-muted hover:bg-surface-hover rounded">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-text-muted hover:bg-accent-red hover:text-white rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
