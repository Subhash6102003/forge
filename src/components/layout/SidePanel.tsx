import React from 'react';
import { ActivityView } from './ActivityBar';
import { FileItem } from '../../types';
import { FileExplorerView } from '../views/FileExplorerView';
import { SearchView } from '../views/SearchView';
import { GitView } from '../views/GitView';
import { SkillsView } from '../views/SkillsView';
import { ArtStudioView } from '../views/ArtStudioView';
import { ReaInspectorView } from '../views/ReaInspectorView';
import { SettingsView } from '../views/SettingsView';
import { ThemeId, ThemeMode } from '../../types';

export interface SidePanelProps {
  activeView: ActivityView;
  files: FileItem[];
  selectedPath?: string;
  onSelectFile: (file: FileItem) => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onOpenFile?: (path: string) => void;
  onViewDiff?: (file: string) => void;
  onRunSlashCommand?: (cmd: string) => void;
  currentTheme: ThemeId;
  currentMode: ThemeMode;
  onThemeChange: (theme: ThemeId) => void;
  onModeChange: (mode: ThemeMode) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  ponytailLevel?: 'lite' | 'full' | 'ultra' | 'off';
  onPonytailLevelChange?: (level: 'lite' | 'full' | 'ultra' | 'off') => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  activeView,
  files,
  selectedPath,
  onSelectFile,
  onNewFile,
  onNewFolder,
  onOpenFile,
  onViewDiff,
  onRunSlashCommand,
  currentTheme,
  currentMode,
  onThemeChange,
  onModeChange,
  selectedModel,
  onModelChange,
  ponytailLevel,
  onPonytailLevelChange,
}) => {
  return (
    <div className="w-[280px] h-full bg-surface border-r border-border flex flex-col shrink-0 select-none overflow-hidden">
      {activeView === 'explorer' && (
        <FileExplorerView
          files={files}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
          onNewFile={onNewFile}
          onNewFolder={onNewFolder}
        />
      )}
      {activeView === 'search' && (
        <SearchView onOpenFile={onOpenFile} />
      )}
      {activeView === 'git' && (
        <GitView onViewDiff={onViewDiff} />
      )}
      {activeView === 'skills' && (
        <SkillsView
          onRunSlashCommand={onRunSlashCommand}
          ponytailLevel={ponytailLevel}
          onPonytailLevelChange={onPonytailLevelChange}
        />
      )}
      {activeView === 'art' && (
        <ArtStudioView />
      )}
      {activeView === 'rea' && (
        <ReaInspectorView />
      )}
      {activeView === 'settings' && (
        <SettingsView
          currentTheme={currentTheme}
          currentMode={currentMode}
          onThemeChange={onThemeChange}
          onModeChange={onModeChange}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
        />
      )}
    </div>
  );
};
