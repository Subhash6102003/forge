import React, { useState, useCallback, useRef } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { FileIcon } from '../ui/FileIcon';

export interface SearchResult {
  file: string;
  line: number;
  match: string;
}

export interface SearchViewProps {
  onOpenFile?: (path: string) => void;
  workspacePath?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ onOpenFile, workspacePath }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }
      if (!workspacePath) {
        setResults([]);
        setSearched(true);
        return;
      }

      setIsSearching(true);
      setSearched(false);

      const forgeAPI = (window as any).forgeAPI;
      if (!forgeAPI?.fs?.readDir || !forgeAPI?.fs?.readFile) {
        setIsSearching(false);
        setSearched(true);
        return;
      }

      const found: SearchResult[] = [];
      const BINARY_EXTS = new Set(['png','jpg','jpeg','gif','ico','svg','pdf','woff','woff2','ttf','eot','exe','dll','so','zip','tar','gz','bin','lock']);
      const MAX_RESULTS = 200;

      const searchDir = async (dirPath: string) => {
        if (found.length >= MAX_RESULTS) return;
        try {
          const tree = await forgeAPI.fs.readDir(dirPath);
          for (const node of tree) {
            if (found.length >= MAX_RESULTS) break;
            if (node.type === 'file') {
              const ext = node.name.split('.').pop()?.toLowerCase() || '';
              if (BINARY_EXTS.has(ext)) continue;
              try {
                const content: string = await forgeAPI.fs.readFile(node.path);
                const lines = content.split('\n');
                const lower = q.toLowerCase();
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].toLowerCase().includes(lower)) {
                    found.push({ file: node.path, line: i + 1, match: lines[i].trim().slice(0, 120) });
                    if (found.length >= MAX_RESULTS) break;
                  }
                }
              } catch { /* unreadable */ }
            } else if (node.type === 'directory' && node.children === undefined) {
              await searchDir(node.path);
            }
          }
        } catch { /* access denied */ }
      };

      await searchDir(workspacePath);
      setResults(found);
      setIsSearching(false);
      setSearched(true);
    },
    [workspacePath]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 400);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const uniqueFiles = new Set(results.map((r) => r.file)).size;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Search
        </span>
      </div>

      <div className="p-3 border-b border-border/60">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={workspacePath ? 'Search in workspace files…' : 'Open a folder first to search'}
            disabled={!workspacePath}
            className="w-full bg-input-bg text-text text-xs pl-7 pr-6 py-1.5 rounded border border-border focus:outline-none focus:border-accent placeholder:text-text-muted/50 disabled:opacity-50"
          />
          {isSearching && (
            <Loader2 className="absolute right-2 w-3.5 h-3.5 text-accent animate-spin" />
          )}
          {!isSearching && query && (
            <button onClick={handleClear} className="absolute right-2 text-text-muted hover:text-text">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
        {!workspacePath && (
          <div className="text-[11px] text-text-muted italic px-1 mt-2 text-center">
            Open a workspace folder to enable search.
          </div>
        )}

        {searched && results.length === 0 && !isSearching && (
          <div className="text-[11px] text-text-muted italic px-1 mt-2 text-center">
            No matches for <strong>"{query}"</strong> in workspace.
          </div>
        )}

        {results.length > 0 && (
          <span className="text-[10px] text-text-muted px-1 pb-1">
            {results.length} result{results.length !== 1 ? 's' : ''} across {uniqueFiles} file{uniqueFiles !== 1 ? 's' : ''}
            {results.length >= 200 && ' (limit 200)'}
          </span>
        )}

        {results.map((res, i) => {
          const fileName = res.file.split(/[/\\]/).pop() || res.file;
          const relPath = res.file.replace(workspacePath || '', '').replace(/^[/\\]/, '');
          return (
            <div
              key={i}
              onClick={() => onOpenFile?.(res.file)}
              className="p-1.5 rounded hover:bg-surface-hover cursor-pointer border border-transparent hover:border-border transition-colors select-none"
            >
              <div className="flex items-center gap-1.5 text-text font-medium text-[11px] mb-0.5">
                <FileIcon fileName={fileName} size="xs" />
                <span className="font-semibold">{fileName}</span>
                <span className="text-text-muted text-[10px]">:{res.line}</span>
                <span className="text-text-muted/50 text-[10px] truncate ml-auto">{relPath}</span>
              </div>
              <div className="font-mono text-[11px] text-text-muted bg-surface/80 px-1.5 py-0.5 rounded truncate">
                {res.match}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
