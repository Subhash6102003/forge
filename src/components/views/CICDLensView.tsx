import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, GitPullRequest, GitCommit, ArrowUpRight, ArrowDownLeft,
  RefreshCw, CheckCircle2, XCircle, Clock, Play, Search, User, Filter,
  ExternalLink, ChevronRight, ChevronDown, Check, UploadCloud, DownloadCloud,
  FileCode, Layers, ShieldCheck, Terminal as TerminalIcon
} from 'lucide-react';
import { GitBranchInfo, GitCommitItem, GitWorkingChanges } from '../../types/forgeAPI';

export interface CICDLensViewProps {
  workspacePath?: string;
  onViewDiff?: (filePath: string) => void;
  onOpenTerminal?: () => void;
}

export const CICDLensView: React.FC<CICDLensViewProps> = ({
  workspacePath,
  onViewDiff,
  onOpenTerminal,
}) => {
  const [branchInfo, setBranchInfo] = useState<GitBranchInfo>({
    branch: '',
    upstream: '',
    ahead: 0,
    behind: 0,
  });
  const [commits, setCommits] = useState<GitCommitItem[]>([]);
  const [workingChanges, setWorkingChanges] = useState<GitWorkingChanges>({ count: 0, files: [] });
  const [selectedCommit, setSelectedCommit] = useState<GitCommitItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<'push' | 'pull' | 'fetch' | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [showWorkingDetails, setShowWorkingDetails] = useState(false);

  const loadGitData = useCallback(async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (!forgeAPI?.git || !workspacePath) return;

    setIsLoading(true);
    try {
      const [bInfo, cList, wChanges] = await Promise.all([
        forgeAPI.git.getBranchInfo(),
        forgeAPI.git.getCommits(40),
        forgeAPI.git.getWorkingChanges(),
      ]);

      if (bInfo) setBranchInfo(bInfo);
      if (Array.isArray(cList)) setCommits(cList);
      if (wChanges) setWorkingChanges(wChanges);
    } catch {
      // workspace might not be git repo
    } finally {
      setIsLoading(false);
    }
  }, [workspacePath]);

  useEffect(() => {
    loadGitData();
  }, [loadGitData]);

  const handleSyncAction = async (action: 'push' | 'pull' | 'fetch') => {
    const forgeAPI = (window as any).forgeAPI;
    if (!forgeAPI?.git?.sync) return;

    setIsSyncing(action);
    try {
      await forgeAPI.git.sync(action);
      await loadGitData();
    } catch {
      // Handled in terminal
    } finally {
      setIsSyncing(null);
    }
  };

  const handleCommitWorkingChanges = async () => {
    if (!commitMessage.trim()) return;
    const forgeAPI = (window as any).forgeAPI;
    if (!forgeAPI?.git?.commit) return;

    try {
      await forgeAPI.git.commit(commitMessage.trim());
      setCommitMessage('');
      await loadGitData();
    } catch {}
  };

  if (!workspacePath) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 text-center text-text-muted">
        <GitPullRequest className="w-10 h-10 mb-2 opacity-30 text-accent" />
        <h3 className="text-xs font-semibold text-text mb-1">CICD Lens</h3>
        <p className="text-[11px] max-w-xs">Open a project repository to inspect branches, visual commit graph, and CI/CD pipelines.</p>
      </div>
    );
  }

  const filteredCommits = commits.filter((c) =>
    searchQuery ? c.message.toLowerCase().includes(searchQuery.toLowerCase()) || c.author.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col h-full w-full bg-surface text-text select-none overflow-hidden text-xs">
      {/* Top Header matching reference image: Branch Chip + Upstream Chip */}
      <div className="p-2 border-b border-border bg-titlebar flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          {/* Branch chip */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/15 border border-accent/40 text-accent text-[11px] font-mono font-semibold max-w-[240px] truncate shadow-xs">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="px-1 py-0.2 rounded bg-accent/20 text-[10px] font-bold">
              {commits.length}
            </span>
            <span className="truncate">{branchInfo.branch || 'main'}</span>
          </div>

          {/* Upstream chip */}
          {branchInfo.upstream ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-active border border-border text-text-muted text-[11px] font-mono">
              <GitBranch className="w-3 h-3 text-accent" />
              <span className="text-[10px]">→</span>
              <span className="text-text truncate max-w-[120px]">{branchInfo.upstream}</span>
              {(branchInfo.ahead > 0 || branchInfo.behind > 0) && (
                <div className="flex items-center gap-1 ml-1 text-[10px]">
                  {branchInfo.ahead > 0 && <span className="text-amber-400 font-bold">↑{branchInfo.ahead}</span>}
                  {branchInfo.behind > 0 && <span className="text-accent-blue font-bold">↓{branchInfo.behind}</span>}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-text-muted italic">Local branch (no remote)</span>
          )}
        </div>

        {/* View Controls & Action Bar */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-text px-1">
              GRAPH
            </span>
            <div className="h-3 w-px bg-border/60 mx-1" />
            {/* Sync Action Buttons */}
            <button
              onClick={() => handleSyncAction('fetch')}
              disabled={!!isSyncing}
              className="p-1 text-text-muted hover:text-text rounded hover:bg-surface-hover transition-colors"
              title="git fetch"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'fetch' || isLoading ? 'animate-spin text-accent' : ''}`} />
            </button>
            <button
              onClick={() => handleSyncAction('pull')}
              disabled={!!isSyncing}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
              title="git pull (Download changes)"
            >
              <DownloadCloud className="w-3 h-3 text-accent-blue" /> Pull
            </button>
            <button
              onClick={() => handleSyncAction('push')}
              disabled={!!isSyncing || branchInfo.ahead === 0}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                branchInfo.ahead > 0 ? 'bg-accent/20 text-accent border border-accent/40 font-bold hover:bg-accent/30' : 'text-text-muted/60 opacity-60'
              }`}
              title="git push (Upload commits)"
            >
              <UploadCloud className="w-3 h-3" /> Push {branchInfo.ahead > 0 ? `(${branchInfo.ahead})` : ''}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {onOpenTerminal && (
              <button
                onClick={onOpenTerminal}
                className="p-1 text-text-muted hover:text-text rounded hover:bg-surface-hover"
                title="Open Terminal"
              >
                <TerminalIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Message Box */}
        <div className="relative flex items-center">
          <Search className="w-3 h-3 text-text-muted absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="> MESSAGE or author..."
            className="w-full bg-input-bg text-text text-[11px] pl-6 pr-2 py-1 rounded border border-border focus:outline-none focus:border-accent font-mono placeholder:text-text-muted/50"
          />
        </div>
      </div>

      {/* Main Graph & Commits Scrollable Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Working Changes Row matching reference image */}
        <div className="border-b border-border/80 bg-surface-active/60">
          <div
            onClick={() => setShowWorkingDetails(!showWorkingDetails)}
            className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 font-bold text-[10px]">
                {workingChanges.count}
              </div>
              <span className="font-bold text-xs italic text-text flex items-center gap-1">
                Working Changes
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted text-[10px]">
              <span>{workingChanges.count > 0 ? 'Uncommitted changes' : 'Clean tree'}</span>
              {showWorkingDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Expanded Working Changes Commit Box */}
          {showWorkingDetails && (
            <div className="p-3 border-t border-border/40 bg-surface flex flex-col gap-2">
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                {workingChanges.files.length === 0 ? (
                  <span className="text-[10px] text-text-muted italic px-1">No working directory modifications.</span>
                ) : (
                  workingChanges.files.map((f, i) => (
                    <div
                      key={i}
                      onClick={() => onViewDiff?.(f.filePath)}
                      className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-surface-hover cursor-pointer text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`font-mono text-[10px] px-1 rounded ${
                          f.status.includes('M') ? 'text-amber-400 bg-amber-400/10' :
                          f.status.includes('A') || f.status.includes('?') ? 'text-emerald-400 bg-emerald-400/10' :
                          'text-rose-400 bg-rose-400/10'
                        }`}>
                          {f.status}
                        </span>
                        <span className="font-mono text-text truncate">{f.filePath}</span>
                      </div>
                      <span className="text-[10px] text-accent hover:underline">Diff</span>
                    </div>
                  ))
                )}
              </div>

              {workingChanges.count > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message (e.g. feat: add CICD Lens)..."
                    className="flex-1 bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommitWorkingChanges();
                    }}
                  />
                  <button
                    onClick={handleCommitWorkingChanges}
                    disabled={!commitMessage.trim()}
                    className="px-3 py-1 bg-accent text-white font-bold text-xs rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    Commit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Commit Railway Graph List */}
        <div className="flex flex-col flex-1 divide-y divide-border/30">
          {filteredCommits.length === 0 ? (
            <div className="p-6 text-center text-text-muted italic text-[11px]">
              No git commits found.
            </div>
          ) : (
            filteredCommits.map((c, idx) => {
              const isSelected = selectedCommit?.hash === c.hash;
              const hasPrev = idx < filteredCommits.length - 1;
              const isUnpushed = c.isUnpushed;

              return (
                <div
                  key={c.hash}
                  onClick={() => setSelectedCommit(isSelected ? null : c)}
                  className={`flex items-stretch hover:bg-surface-hover/60 cursor-pointer transition-colors relative ${
                    isSelected ? 'bg-accent/10 border-l-2 border-accent' : ''
                  }`}
                >
                  {/* Left Column: Railway Graph Lines & Nodes */}
                  <div className="w-10 shrink-0 flex items-center justify-center relative">
                    {/* Vertical connecting line */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-accent/40" />
                    {/* Node Circle */}
                    <div className={`relative z-10 w-3 h-3 rounded-full flex items-center justify-center shadow-xs ${
                      isUnpushed
                        ? 'bg-amber-400 border-2 border-surface ring-2 ring-amber-400/30'
                        : isSelected
                        ? 'bg-accent border-2 border-white'
                        : 'bg-accent-blue border-2 border-surface'
                    }`} />
                  </div>

                  {/* Main Commit Info Row matching reference image */}
                  <div className="flex-1 py-2 pr-3 flex items-center justify-between gap-2 min-w-0">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Scope / Repo Badge */}
                        <span className="px-1.5 py-0.2 rounded bg-surface-active text-[9px] font-mono font-bold text-text-muted border border-border">
                          {c.shortHash}
                        </span>

                        {isUnpushed && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px]">
                            UNPUSHED
                          </span>
                        )}

                        <span className="font-medium text-text text-xs truncate max-w-full">
                          {c.message}
                        </span>
                      </div>

                      <span className="text-[10px] text-text-muted truncate">
                        {c.author} • {c.relativeTime}
                      </span>
                    </div>

                    {/* Right Info: Author Avatar + CI/CD Ring + Timestamp */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Author Avatar Pill */}
                      <div className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold text-[9px] flex items-center justify-center uppercase">
                        {c.author.slice(0, 2)}
                      </div>

                      {/* CI/CD Status Ring matching screenshot */}
                      <div title={`CI/CD Status: ${c.cicdStatus}`}>
                        {c.cicdStatus === 'passed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {c.cicdStatus === 'failed' && (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        {c.cicdStatus === 'pending' && (
                          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                        )}
                      </div>

                      <span className="text-[10px] text-text-muted font-mono w-6 text-right">
                        {c.relativeTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Commit Detail Drawer */}
      {selectedCommit && (
        <div className="border-t border-border bg-surface-active p-3 flex flex-col gap-2 text-xs animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="font-bold text-text flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-accent" /> Commit {selectedCommit.shortHash}
            </span>
            <div className="flex items-center gap-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                selectedCommit.cicdStatus === 'passed' ? 'bg-emerald-500/20 text-emerald-400' :
                selectedCommit.cicdStatus === 'failed' ? 'bg-rose-500/20 text-rose-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                CI/CD: {selectedCommit.cicdStatus.toUpperCase()}
              </span>
            </div>
          </div>
          <p className="text-text text-xs font-medium font-sans">
            {selectedCommit.message}
          </p>
          <div className="flex items-center justify-between text-[10px] text-text-muted border-t border-border/40 pt-1.5">
            <span>Author: <strong>{selectedCommit.author}</strong> ({selectedCommit.email})</span>
            <span className="font-mono">{new Date(selectedCommit.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
