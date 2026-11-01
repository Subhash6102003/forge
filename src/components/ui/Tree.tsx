import React, { useState } from 'react';
import { FileItem } from '../../types';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Trash2, Edit2 } from 'lucide-react';
import { FileIcon } from './FileIcon';

export interface TreeProps {
  items: FileItem[];
  selectedPath?: string;
  onSelect: (item: FileItem) => void;
  onToggleExpand?: (path: string) => void;
  onDelete?: (item: FileItem) => void;
  onRename?: (item: FileItem) => void;
}

export const Tree: React.FC<TreeProps> = ({
  items,
  selectedPath,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set<string>());

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
          className={`group flex items-center gap-1.5 py-1 px-2 text-xs cursor-pointer rounded transition-colors duration-fast ${
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
            <FileIcon fileName={item.name} size="xs" />
          )}

          <span className="truncate flex-1">{item.name}</span>
          {item.isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          )}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {onRename && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(item);
                }}
                className="p-0.5 rounded text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
                title={`Rename ${item.name}`}
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="p-0.5 rounded text-text-muted hover:text-rose-400 hover:bg-surface-hover transition-colors"
                title={`Delete ${item.name}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
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
