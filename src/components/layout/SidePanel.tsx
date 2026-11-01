import React from 'react';
import { ActivityView } from './ActivityBar';
import { FileItem } from '../../types';
import { FileExplorerView } from '../views/FileExplorerView';
import { SearchView } from '../views/SearchView';
import { GitView } from '../views/GitView';
import { CICDLensView } from '../views/CICDLensView';
import { SkillsView } from '../views/SkillsView';
import { ModelStudioView } from '../views/ModelStudioView';
import { ExtensionsView } from '../views/ExtensionsView';
import { ArtStudioView } from '../views/ArtStudioView';
import { ReaInspectorView } from '../views/ReaInspectorView';
import { SettingsView } from '../views/SettingsView';
import { StudioView } from '../views/StudioView';
import { ThemeId, ThemeMode } from '../../types';

export interface SidePanelProps {
  activeView: ActivityView;
  files: FileItem[];
  selectedPath?: string;
  onSelectFile: (file: FileItem) => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onDeleteFile?: (file: FileItem) => void;
  onRenameFile?: (file: FileItem) => void;
  onOpenFile?: (path: string) => void;
  onOpenFolder?: () => void;
  onRefresh?: () => void;
  workspaceName?: string;
  workspacePath?: string;
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
  onDeleteFile,
  onRenameFile,
  onOpenFile,
  onOpenFolder,
  onRefresh,
  workspaceName,
  workspacePath,
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
    <div
      className={`${
        activeView === 'studio' ? 'w-[520px]' : 'w-[280px]'
      } h-full bg-surface border-r border-border flex flex-col shrink-0 select-none overflow-hidden transition-all duration-fast`}
    >
      {activeView === 'studio' && (
        <StudioView workspacePath={workspacePath} onOpenFile={onOpenFile} />
      )}
      {activeView === 'explorer' && (
        <FileExplorerView
          files={files}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
          onNewFile={onNewFile}
          onNewFolder={onNewFolder}
          onDeleteFile={onDeleteFile}
          onRenameFile={onRenameFile}
          onOpenFolder={onOpenFolder}
          onRefresh={onRefresh}
          workspaceName={workspaceName}
          workspacePath={workspacePath}
        />
      )}
      {activeView === 'search' && (
        <SearchView onOpenFile={onOpenFile} workspacePath={workspacePath} />
      )}
      {activeView === 'git' && (
        <GitView onViewDiff={onViewDiff} workspacePath={workspacePath} />
      )}
      {activeView === 'cicd' && (
        <CICDLensView
          workspacePath={workspacePath}
          onViewDiff={onViewDiff}
          onOpenTerminal={() => onRunSlashCommand?.('/terminal')}
        />
      )}
      {activeView === 'skills' && (
        <SkillsView
          onRunSlashCommand={onRunSlashCommand}
          ponytailLevel={ponytailLevel}
          onPonytailLevelChange={onPonytailLevelChange}
        />
      )}
      {activeView === 'models' && (
        <ModelStudioView
          selectedModel={selectedModel}
          onModelChange={onModelChange}
        />
      )}
      {activeView === 'extensions' && (
        <ExtensionsView workspacePath={workspacePath} />
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
