import React, { useState } from 'react';
import { Search as SearchIcon, ArrowRight, FileCode } from 'lucide-react';
import { Input } from '../ui/Input';

export interface SearchViewProps {
  onOpenFile?: (path: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onOpenFile }) => {
  const [query, setQuery] = useState('');

  const dummyResults = [
    { file: 'src/components/Header.tsx', line: 12, match: 'const [searchOpen, setSearchOpen] = useState(false);' },
    { file: 'src/components/Header.tsx', line: 24, match: '<Search className="h-5 w-5" />' },
    { file: 'src/App.tsx', line: 45, match: 'import { Header } from "./components/Header";' },
  ].filter(r => query === '' || r.match.toLowerCase().includes(query.toLowerCase()) || r.file.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Search
        </span>
      </div>
      <div className="p-3 border-b border-border/60">
        <Input
          placeholder="Search in files (e.g. Header, useState)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<SearchIcon className="w-3.5 h-3.5" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
        <span className="text-[10px] text-text-muted px-1">
          {dummyResults.length} results across 2 files
        </span>
        {dummyResults.map((res, i) => (
          <div
            key={i}
            onClick={() => onOpenFile?.(res.file)}
            className="p-1.5 rounded hover:bg-surface-hover cursor-pointer border border-transparent hover:border-border transition-colors select-none"
          >
            <div className="flex items-center gap-1.5 text-text font-medium text-[11px] mb-0.5">
              <FileCode className="w-3 h-3 text-accent-blue" />
              <span>{res.file}</span>
              <span className="text-text-muted text-[10px]">:{res.line}</span>
            </div>
            <div className="font-mono text-[11px] text-text-muted bg-surface/80 px-1.5 py-0.5 rounded truncate">
              {res.match}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
