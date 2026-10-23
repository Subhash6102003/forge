import React, { useState, useEffect, useRef } from 'react';
import { Search, FilePlus, FolderOpen, Terminal, Sparkles, GitCommit, Eye, Palette, Code, Check } from 'lucide-react';

export interface CommandItem {
  id: string;
  category: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-surface border border-border rounded-lg shadow-modal overflow-hidden flex flex-col animate-slide-down"
      >
        {/* Search Bar */}
        <div className="flex items-center px-3.5 py-3 border-b border-border gap-2.5 bg-titlebar">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-text placeholder:text-text-muted/60 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-active text-text-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-72 overflow-y-auto p-1.5">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer select-none transition-colors duration-fast ${
                    isSelected ? 'bg-surface-active text-text font-medium' : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-text-muted shrink-0">{cmd.icon || <Code className="w-3.5 h-3.5" />}</span>
                    <span className="text-text font-medium">{cmd.label}</span>
                    <span className="text-[10px] text-text-muted/70 px-1 py-0.2 rounded bg-surface/50 border border-border/40">
                      {cmd.category}
                    </span>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface text-text-muted rounded border border-border">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
