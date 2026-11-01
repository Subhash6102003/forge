import React, { useState } from 'react';
import { Tree } from '../ui/Tree';
import { FileItem } from '../../types';
import { FolderPlus, FilePlus, RefreshCw, FolderOpen, Search } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export interface FileExplorerViewProps {
  files: FileItem[];
  selectedPath?: string;
  onSelectFile: (file: FileItem) => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onDeleteFile?: (file: FileItem) => void;
  onRenameFile?: (file: FileItem) => void;
  onOpenFolder?: () => void;
  onRefresh?: () => void;
  workspaceName?: string;
  workspacePath?: string;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  files,
  selectedPath,
  onSelectFile,
  onNewFile,
  onNewFolder,
  onDeleteFile,
  onRenameFile,
  onOpenFolder,
  onRefresh,
  workspaceName = '',
  workspacePath = '',
}) => {
  const [filter, setFilter] = useState('');

  const filterTree = (items: FileItem[], query: string): FileItem[] => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    const result: FileItem[] = [];

    for (const item of items) {
      if (item.type === 'directory' && item.children) {
        const filteredChildren = filterTree(item.children, q);
        if (filteredChildren.length > 0 || item.name.toLowerCase().includes(q)) {
          result.push({
            ...item,
            children: filteredChildren,
          });
        }
      } else if (item.name.toLowerCase().includes(q)) {
        result.push(item);
      }
    }
    return result;
  };

  const displayedFiles = filterTree(files, filter);
  const isWorkspaceOpen = Boolean(workspaceName || workspacePath);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Side panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <IconButton size="xs" tooltip="Open Folder (Ctrl+O)" onClick={onOpenFolder}>
            <FolderOpen className="w-3.5 h-3.5 text-accent" />
          </IconButton>
          <IconButton size="xs" tooltip="New File" onClick={onNewFile}>
            <FilePlus className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton size="xs" tooltip="New Folder" onClick={onNewFolder}>
            <FolderPlus className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton size="xs" tooltip="Refresh Explorer" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      {/* Workspace Project Name & Quick Search */}
      <div className="p-2 border-b border-border/60">
        <div className="text-xs font-semibold text-text mb-1.5 flex items-center justify-between">
          <span className="truncate max-w-[170px]" title={workspaceName || 'No Folder Opened'}>
            {workspaceName || 'No Folder Opened'}
          </span>
          <button
            onClick={onOpenFolder}
            className="text-[10px] text-accent hover:underline cursor-pointer"
          >
            {isWorkspaceOpen ? 'Switch Folder' : 'Open Folder'}
          </button>
        </div>
        <div className="relative">
          <Search className="w-3 h-3 text-text-muted absolute left-2 top-2 pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-input-bg text-text text-xs pl-6 pr-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {displayedFiles.length > 0 ? (
          <Tree
            items={displayedFiles}
            selectedPath={selectedPath}
            onSelect={onSelectFile}
            onDelete={onDeleteFile}
            onRename={onRenameFile}
          />
        ) : filter.trim() ? (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
            <span className="text-xs text-text-muted">No files match &quot;{filter}&quot;</span>
            <button
              onClick={() => setFilter('')}
              className="text-[11px] text-accent hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        ) : isWorkspaceOpen ? (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-active/60 border border-border flex items-center justify-center text-accent">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-text">Workspace is empty</span>
              <span className="text-[11px] text-text-muted max-w-[200px]">
                Create a file or folder in <span className="text-text font-medium">{workspaceName || 'this directory'}</span> to begin.
              </span>
            </div>
            <div className="flex flex-col w-full gap-1.5 mt-1">
              <button
                onClick={onNewFile}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>New File</span>
              </button>
              <button
                onClick={onNewFolder}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-accent text-text rounded text-xs font-medium hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Folder</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
            <span className="text-xs text-text-muted">No folder opened</span>
            <button
              onClick={onOpenFolder}
              className="px-3 py-1 bg-accent text-white rounded text-xs font-medium hover:opacity-90 cursor-pointer"
            >
              Open Folder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

