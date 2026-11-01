import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, RefreshCw, Folder } from 'lucide-react';
import { Button } from '../ui/Button';

export interface GitViewProps {
  onViewDiff?: (file: string) => void;
  workspacePath?: string;
}

export const GitView: React.FC<GitViewProps> = ({ onViewDiff, workspacePath }) => {
  const [commitMsg, setCommitMsg] = useState('');
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGit, setHasGit] = useState<boolean | null>(null);

  const loadGitStatus = async () => {
    if (!workspacePath) return;
    const forgeAPI = (window as any).forgeAPI;
    if (!forgeAPI?.terminal) return;

    setIsLoading(true);
    try {
      // Check git status via terminal write — read output via run:output in a temp process
      // Since we only have a terminal and fs, we detect git by checking for .git folder
      const tree = await forgeAPI.fs.readDir(workspacePath);
      const hasGitDir = tree.some((n: any) => n.name === '.git' && n.type === 'directory');
      setHasGit(hasGitDir);
      if (!hasGitDir) {
        setBranch('');
        setStatus('');
        setIsLoading(false);
        return;
      }
      // Try to read HEAD file to get branch name
      try {
        const headContent = await forgeAPI.fs.readFile(`${workspacePath}/.git/HEAD`);
        const match = headContent.match(/ref: refs\/heads\/(.+)/);
        setBranch(match ? match[1].trim() : 'HEAD');
      } catch {
        setBranch('main');
      }
      setStatus('');
    } catch {
      setHasGit(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setHasGit(null);
    setBranch('');
    setStatus('');
    loadGitStatus();
  }, [workspacePath]);

  if (!workspacePath) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Source Control</span>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center gap-2">
          <GitBranch className="w-8 h-8 opacity-20 text-text-muted" />
          <span className="text-xs text-text-muted">Open a workspace folder to use source control.</span>
        </div>
      </div>
    );
  }

  if (hasGit === false) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Source Control</span>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center gap-2">
          <Folder className="w-8 h-8 opacity-20 text-text-muted" />
          <span className="text-xs font-semibold text-text">No Git Repository</span>
          <p className="text-[11px] text-text-muted">
            This folder is not a git repository. Open the Terminal tab and run{' '}
            <code className="font-mono bg-surface px-1 py-0.5 rounded border border-border">git init</code>{' '}
            to initialize one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Source Control
        </span>
        <div className="flex items-center gap-2">
          {branch && (
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <GitBranch className="w-3 h-3 text-accent" />
              <span className="font-mono">{branch}</span>
            </div>
          )}
          <button
            onClick={loadGitStatus}
            disabled={isLoading}
            className="p-1 text-text-muted hover:text-text rounded transition-colors"
            title="Refresh git status"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-border/60 flex flex-col gap-2">
        <textarea
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="Commit message — use Terminal to commit (git commit -m '...')"
          rows={3}
          className="w-full bg-input-bg text-text text-xs p-2 rounded border border-border focus:outline-none focus:border-accent resize-none placeholder:text-text-muted/60"
        />
        <Button
          size="sm"
          variant="primary"
          icon={<GitCommit className="w-3.5 h-3.5" />}
          disabled={!commitMsg.trim()}
          onClick={() => {
            const forgeAPI = (window as any).forgeAPI;
            if (forgeAPI?.terminal?.write) {
              forgeAPI.terminal.write(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"\r`);
              setCommitMsg('');
            }
          }}
        >
          Commit via Terminal
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 text-xs">
        <div className="text-[11px] text-text-muted italic">
          Live git diff is shown in the Terminal. Use the terminal below to run{' '}
          <code className="font-mono bg-surface px-1 rounded border border-border">git status</code>,{' '}
          <code className="font-mono bg-surface px-1 rounded border border-border">git diff</code>, or{' '}
          <code className="font-mono bg-surface px-1 rounded border border-border">git log</code>.
        </div>
        <div className="flex flex-col gap-1 mt-2">
          {['git status', 'git diff --stat', 'git log --oneline -10'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                const forgeAPI = (window as any).forgeAPI;
                if (forgeAPI?.terminal?.write) {
                  forgeAPI.terminal.write(`${cmd}\r`);
                }
              }}
              className="text-left px-2 py-1 font-mono text-[11px] text-accent bg-accent/5 hover:bg-accent/10 rounded border border-accent/20 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
