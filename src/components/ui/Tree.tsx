import React, { useState } from 'react';
import { FileItem } from '../../types';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, FileCode, FileJson } from 'lucide-react';

export interface TreeProps {
  items: FileItem[];
  selectedPath?: string;
  onSelect: (item: FileItem) => void;
  onToggleExpand?: (path: string) => void;
}

export const Tree: React.FC<TreeProps> = ({
  items,
  selectedPath,
  onSelect,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root', 'src', 'src/components']));

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.js')) {
      return <FileCode className="w-3.5 h-3.5 text-accent-blue shrink-0" />;
    }
    if (name.endsWith('.json')) {
      return <FileJson className="w-3.5 h-3.5 text-accent-green shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />;
  };

  const renderItem = (item: FileItem, depth: number = 0) => {
    const isDir = item.type === 'directory';
    const isExpanded = expandedPaths.has(item.path);
    const isSelected = selectedPath === item.path;

    return (
      <div key={item.path} className="flex flex-col select-none">
        <div
          onClick={() => {
            if (isDir) {
              toggleExpand(item.path);
            }
            onSelect(item);
          }}
          className={`flex items-center gap-1.5 py-1 px-2 text-xs cursor-pointer rounded transition-colors duration-fast ${
            isSelected
              ? 'bg-surface-active text-text font-medium'
              : 'text-text-muted hover:text-text hover:bg-surface-hover/60'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isDir ? (
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-text-muted" />
              ) : (
                <ChevronRight className="w-3 h-3 text-text-muted" />
              )}
            </span>
          ) : (
            <span className="w-4 h-4" />
          )}

          {isDir ? (
            isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-accent shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-accent shrink-0" />
            )
          ) : (
            getFileIcon(item.name)
          )}

          <span className="truncate">{item.name}</span>
          {item.isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent ml-auto shrink-0" />
          )}
        </div>

        {isDir && isExpanded && item.children && (
          <div className="flex flex-col">
            {item.children.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div className="flex flex-col w-full py-1">{items.map((item) => renderItem(item, 0))}</div>;
};
