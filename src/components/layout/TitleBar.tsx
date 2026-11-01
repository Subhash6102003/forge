import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Minus,
  Square,
  X,
  Flame,
  Globe,
  FilePlus,
  FolderOpen,
  Save,
  Play,
  Square as StopIcon,
  Terminal as TerminalIcon,
  HelpCircle,
  Settings,
  Cpu,
  Layers,
  Sparkles,
  Command,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export interface MenuItemDef {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

export interface TitleBarProps {
  onOpenCommandPalette: () => void;
  isSidePanelOpen: boolean;
  onToggleSidePanel: () => void;
  isBottomPanelOpen: boolean;
  onToggleBottomPanel: () => void;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
  isPreviewOpen?: boolean;
  onTogglePreview?: () => void;

  // File menu
  onNewFile?: () => void;
  onOpenFile?: () => void;
  onOpenFolder?: () => void;
  onSave?: () => void;
  onSaveAll?: () => void;
  onCloseEditor?: () => void;
  onCloseAllEditors?: () => void;
  onHomeDashboard?: () => void;
  onExit?: () => void;

  // Edit menu
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onFindInFiles?: () => void;
  onInlineAI?: () => void;

  // Selection menu
  onSelectAll?: () => void;

  // View menu
  onSelectView?: (view: any) => void;
  onToggleThemeMode?: () => void;

  // Go menu
  onGoToFile?: () => void;
  onNextTab?: () => void;
  onPrevTab?: () => void;

  // Run menu
  onRunProject?: () => void;
  onStopProject?: () => void;
  onStartLiveServer?: () => void;
  isProjectRunning?: boolean;

  // Terminal menu
  onNewTerminal?: () => void;
  onClearTerminal?: () => void;
  onOpenLocalLLMTerminal?: () => void;
  onOpenAILog?: () => void;
  onOpenProblems?: () => void;
  onOpenOutput?: () => void;

  // Help menu
  onShowShortcuts?: () => void;
  onScanModels?: () => void;
  onAbout?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onOpenCommandPalette,
  isSidePanelOpen,
  onToggleSidePanel,
  isBottomPanelOpen,
  onToggleBottomPanel,
  isAssistantOpen,
  onToggleAssistant,
  isPreviewOpen = false,
  onTogglePreview,

  onNewFile,
  onOpenFile,
  onOpenFolder,
  onSave,
  onSaveAll,
  onCloseEditor,
  onCloseAllEditors,
  onHomeDashboard,
  onExit,

  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onFindInFiles,
  onInlineAI,

  onSelectAll,

  onSelectView,
  onToggleThemeMode,

  onGoToFile,
  onNextTab,
  onPrevTab,

  onRunProject,
  onStopProject,
  onStartLiveServer,
  isProjectRunning = false,

  onNewTerminal,
  onClearTerminal,
  onOpenLocalLLMTerminal,
  onOpenAILog,
  onOpenProblems,
  onOpenOutput,

  onShowShortcuts,
  onScanModels,
  onAbout,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Window Controls Handlers
  const handleMinimize = () => {
    const forgeAPI = (window as any).forgeAPI;
    forgeAPI?.windowControls?.minimize?.();
  };

  const handleMaximize = () => {
    const forgeAPI = (window as any).forgeAPI;
    forgeAPI?.windowControls?.maximize?.();
  };

  const handleClose = () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.windowControls?.close) {
      forgeAPI.windowControls.close();
    } else {
      window.close();
    }
  };

  // Dropdown menus dictionary
  const menus: Record<string, MenuItemDef[]> = {
    File: [
      { label: 'New File', shortcut: 'Ctrl+N', action: onNewFile },
      { label: 'Open File...', shortcut: 'Ctrl+O', action: onOpenFile },
      { label: 'Open Folder...', shortcut: 'Ctrl+K Ctrl+O', action: onOpenFolder },
      { divider: true, label: '' },
      { label: 'Save', shortcut: 'Ctrl+S', action: onSave },
      { label: 'Save All', shortcut: 'Ctrl+Alt+S', action: onSaveAll },
      { divider: true, label: '' },
      { label: 'Close Editor', shortcut: 'Ctrl+W', action: onCloseEditor },
      { label: 'Close All Editors', shortcut: 'Ctrl+K Ctrl+W', action: onCloseAllEditors },
      { divider: true, label: '' },
      { label: 'Home Dashboard', shortcut: 'Ctrl+H', action: onHomeDashboard },
      { label: 'Exit Forge', shortcut: 'Alt+F4', action: onExit, danger: true },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: onUndo },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: onRedo },
      { divider: true, label: '' },
      { label: 'Cut', shortcut: 'Ctrl+X', action: onCut },
      { label: 'Copy', shortcut: 'Ctrl+C', action: onCopy },
      { label: 'Paste', shortcut: 'Ctrl+V', action: onPaste },
      { divider: true, label: '' },
      { label: 'Find in Files', shortcut: 'Ctrl+Shift+F', action: onFindInFiles },
      { label: 'Inline AI Edit...', shortcut: 'Ctrl+I', action: onInlineAI },
    ],
    Selection: [
      { label: 'Select All', shortcut: 'Ctrl+A', action: onSelectAll },
    ],
    View: [
      { label: 'Command Palette...', shortcut: 'Ctrl+K', action: onOpenCommandPalette },
      { divider: true, label: '' },
      { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: () => onSelectView?.('explorer') },
      { label: 'Search', shortcut: 'Ctrl+Shift+F', action: () => onSelectView?.('search') },
      { label: 'Source Control / CICD Lens', shortcut: 'Ctrl+Shift+G', action: () => onSelectView?.('git') },
      { label: 'Model Studio & Port Portal', shortcut: 'Ctrl+Shift+M', action: () => onSelectView?.('models') },
      { label: 'Packages & Extensions', shortcut: 'Ctrl+Shift+X', action: () => onSelectView?.('extensions') },
      { label: 'AI Skills Engine', shortcut: 'Ctrl+Shift+S', action: () => onSelectView?.('skills') },
      { label: 'Reverse Engineering (REA)', shortcut: 'Ctrl+Shift+R', action: () => onSelectView?.('rea') },
      { divider: true, label: '' },
      { label: 'Toggle Primary Side Bar', shortcut: 'Ctrl+B', action: onToggleSidePanel },
      { label: 'Toggle Panel (Terminal)', shortcut: 'Ctrl+`', action: onToggleBottomPanel },
      { label: 'Toggle Live Preview', shortcut: 'Ctrl+Shift+P', action: onTogglePreview },
      { label: 'Toggle AI Assistant', shortcut: 'Ctrl+Shift+L', action: onToggleAssistant },
      { divider: true, label: '' },
      { label: 'Toggle Light / Dark Mode', action: onToggleThemeMode },
    ],
    Go: [
      { label: 'Go to File...', shortcut: 'Ctrl+P', action: onGoToFile || onOpenCommandPalette },
      { label: 'Go to Symbol in Workspace...', shortcut: 'Ctrl+T', action: onOpenCommandPalette },
      { divider: true, label: '' },
      { label: 'Next Editor Tab', shortcut: 'Ctrl+PageDown', action: onNextTab },
      { label: 'Previous Editor Tab', shortcut: 'Ctrl+PageUp', action: onPrevTab },
    ],
    Run: [
      {
        label: isProjectRunning ? 'Dev Server is Running' : 'Start Dev Server (npm run dev)',
        shortcut: 'F5',
        action: onRunProject,
        disabled: isProjectRunning,
      },
      {
        label: 'Stop Dev Server',
        shortcut: 'Shift+F5',
        action: onStopProject,
        disabled: !isProjectRunning,
      },
      { divider: true, label: '' },
      { label: 'Launch Static Live Server (Port 8080)', action: onStartLiveServer },
      { label: 'Open Browser Preview', shortcut: 'Ctrl+Shift+P', action: onTogglePreview },
    ],
    Terminal: [
      { label: 'New / Restart PowerShell Terminal', shortcut: 'Ctrl+Shift+`', action: onNewTerminal },
      { label: 'Clear PowerShell Terminal', shortcut: 'Ctrl+L', action: onClearTerminal },
      { divider: true, label: '' },
      { label: 'Open Local LLM Running Terminal', action: onOpenLocalLLMTerminal },
      { label: 'Open AI Log Console', action: onOpenAILog },
      { label: 'Open Problems View', action: onOpenProblems },
      { label: 'Open Output View', action: onOpenOutput },
    ],
    Help: [
      { label: 'Welcome / Home Dashboard', shortcut: 'Ctrl+H', action: onHomeDashboard },
      { label: 'Keyboard Shortcuts Reference', action: onShowShortcuts || onOpenCommandPalette },
      { label: 'Scan AI Models & Local LLMs', action: onScanModels || (() => onSelectView?.('models')) },
      { divider: true, label: '' },
      { label: 'About Forge IDE', action: onAbout },
    ],
  };

  const menuHeaders = Object.keys(menus);

  return (
    <div
      ref={menuBarRef}
      className="h-[38px] w-full bg-titlebar border-b border-border flex items-center justify-between px-3 select-none z-30 shrink-0 relative"
    >
      {/* Left: App Logo & Interactive Menus */}
      <div className="flex items-center gap-3">
        <div
          onClick={onHomeDashboard}
          title="Forge Home Dashboard"
          className="flex items-center gap-1.5 font-semibold text-text text-xs tracking-wide cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center text-accent">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-bold tracking-tight">Forge</span>
        </div>

        {/* Top Interactive Menu Bar */}
        <div className="hidden md:flex items-center gap-0.5 text-[11px] text-text-muted relative">
          {menuHeaders.map((menuName) => {
            const isOpen = activeMenu === menuName;
            return (
              <div key={menuName} className="relative">
                <button
                  onClick={() => setActiveMenu(isOpen ? null : menuName)}
                  onMouseEnter={() => {
                    if (activeMenu !== null) {
                      setActiveMenu(menuName);
                    }
                  }}
                  className={`px-2 py-1 rounded transition-colors duration-fast ${
                    isOpen
                      ? 'bg-surface-active text-text font-medium'
                      : 'hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  {menuName}
                </button>

                {/* Dropdown Menu Popup */}
                {isOpen && (
                  <div className="absolute top-full left-0 mt-1 min-w-[240px] max-w-[320px] bg-surface/98 backdrop-blur-md border border-border rounded-md shadow-2xl py-1 text-xs select-none z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                    {menus[menuName].map((item, idx) => {
                      if (item.divider) {
                        return <div key={`div-${idx}`} className="h-px bg-border my-1" />;
                      }

                      return (
                        <button
                          key={item.label || idx}
                          disabled={item.disabled}
                          onClick={() => {
                            setActiveMenu(null);
                            if (item.action && !item.disabled) {
                              item.action();
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs transition-colors duration-fast ${
                            item.disabled
                              ? 'opacity-40 cursor-not-allowed text-text-muted'
                              : item.danger
                              ? 'text-accent-red hover:bg-accent-red hover:text-white cursor-pointer'
                              : 'text-text-muted hover:text-text hover:bg-surface-hover cursor-pointer'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.shortcut && (
                            <span className="text-[10px] font-mono text-text-muted/70 tracking-tight ml-4 shrink-0">
                              {item.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
          tooltip="Toggle Bottom Panel (Ctrl+`)"
          onClick={onToggleBottomPanel}
        >
          <PanelBottom className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton
          size="xs"
          active={isPreviewOpen}
          tooltip="Toggle Live Preview (Ctrl+Shift+P)"
          onClick={onTogglePreview}
        >
          <Globe className="w-3.5 h-3.5" />
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

        {/* Real Electron Window Controls */}
        <div className="flex items-center">
          <button
            onClick={handleMinimize}
            title="Minimize"
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:bg-surface-hover rounded transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={handleMaximize}
            title="Maximize / Restore"
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:bg-surface-hover rounded transition-colors"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleClose}
            title="Close"
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:bg-accent-red hover:text-white rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
