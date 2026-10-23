import React, { useState } from 'react';
import { GitBranch, GitCommit, Check, Plus, Minus, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface GitViewProps {
  onViewDiff?: (file: string) => void;
}

export const GitView: React.FC<GitViewProps> = ({ onViewDiff }) => {
  const [commitMsg, setCommitMsg] = useState('');

  const changedFiles = [
    { name: 'src/components/Header.tsx', status: 'M', additions: 12, deletions: 4 },
    { name: 'src/styles/theme.ts', status: 'M', additions: 8, deletions: 1 },
    { name: 'src/lib/ai.ts', status: 'A', additions: 45, deletions: 0 },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Source Control: Git
        </span>
        <div className="flex items-center gap-1 text-[11px] text-text-muted">
          <GitBranch className="w-3 h-3 text-accent" />
          <span>main</span>
        </div>
      </div>

      <div className="p-3 border-b border-border/60 flex flex-col gap-2">
        <textarea
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="Commit message (Ctrl+Enter to commit)..."
          rows={3}
          className="w-full bg-input-bg text-text text-xs p-2 rounded border border-border focus:outline-none focus:border-accent resize-none placeholder:text-text-muted/60"
        />
        <Button
          size="sm"
          variant="primary"
          icon={<GitCommit className="w-3.5 h-3.5" />}
          disabled={!commitMsg.trim()}
        >
          Commit to main
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between px-1 text-[10px] text-text-muted font-semibold uppercase">
          <span>Changes ({changedFiles.length})</span>
          <button className="hover:text-text">Stage All</button>
        </div>

        {changedFiles.map((file) => (
          <div
            key={file.name}
            onClick={() => onViewDiff?.(file.name)}
            className="flex items-center justify-between p-1.5 rounded hover:bg-surface-hover cursor-pointer border border-transparent hover:border-border transition-colors select-none"
          >
            <div className="flex items-center gap-2 truncate">
              <span className={`text-[10px] font-bold font-mono px-1 rounded ${
                file.status === 'M' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'
              }`}>
                {file.status}
              </span>
              <span className="text-text truncate">{file.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
              <span className="text-accent-green">+{file.additions}</span>
              <span className="text-accent-red">-{file.deletions}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
