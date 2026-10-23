import React, { useState } from 'react';
import { Tree } from '../ui/Tree';
import { FileItem } from '../../types';
import { FolderPlus, FilePlus, RefreshCw, MoreVertical, Search } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export interface FileExplorerViewProps {
  files: FileItem[];
  selectedPath?: string;
  onSelectFile: (file: FileItem) => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  files,
  selectedPath,
  onSelectFile,
  onNewFile,
  onNewFolder,
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

  return (
    <div className="flex flex-col h-full w-full">
      {/* Side panel header matching mockup */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <IconButton size="xs" tooltip="New File" onClick={onNewFile}>
            <FilePlus className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton size="xs" tooltip="New Folder" onClick={onNewFolder}>
            <FolderPlus className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton size="xs" tooltip="Refresh Explorer">
            <RefreshCw className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      {/* Workspace Project Name & Quick Search */}
      <div className="p-2 border-b border-border/60">
        <div className="text-xs font-semibold text-text mb-1.5 flex items-center justify-between">
          <span className="truncate">my-ai-app</span>
          <span className="text-[10px] text-text-muted">Git: main</span>
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
        <Tree items={displayedFiles} selectedPath={selectedPath} onSelect={onSelectFile} />
      </div>
    </div>
  );
};
