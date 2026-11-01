import React, { useState, useEffect } from 'react';
import { Flame, FolderPlus, FolderOpen, FileUp, Clock, ArrowRight, Folder } from 'lucide-react';

export interface HomeDashboardProps {
  onOpenFolder: () => void;
  onOpenFile: () => void;
  onOpenRecent: (path: string) => void;
  onNewProject: () => void;
  recentWorkspaces?: string[];
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenFolder,
  onOpenFile,
  onOpenRecent,
  onNewProject,
  recentWorkspaces: propRecents,
}) => {
  const [recents, setRecents] = useState<string[]>(propRecents || []);

  useEffect(() => {
    if (!propRecents) {
      const forgeAPI = (window as any).forgeAPI;
      if (forgeAPI?.fs?.getRecentWorkspaces) {
        forgeAPI.fs.getRecentWorkspaces().then((list: string[]) => {
          if (Array.isArray(list)) setRecents(list);
        });
      }
    } else {
      setRecents(propRecents);
    }
  }, [propRecents]);

  return (
    <div className="flex-1 h-full w-full bg-bg overflow-y-auto p-8 select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center text-accent">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Forge Desktop</span>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight font-sans">
            Welcome to Forge
          </h1>
          <p className="text-xs text-text-muted">
            Production-grade, local-first AI Desktop IDE. Open a workspace or file to begin.
          </p>
        </div>

        {/* Quick Start Action Cards */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Quick Start
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={onOpenFolder}
              className="p-4 rounded-lg border border-border bg-surface hover:border-accent/60 hover:bg-surface-hover/50 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text">Open Folder</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Open a local project directory</p>
              </div>
            </div>

            <div
              onClick={onOpenFile}
              className="p-4 rounded-lg border border-border bg-surface hover:border-accent/60 hover:bg-surface-hover/50 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FileUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text">Open File</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Open any single code file</p>
              </div>
            </div>

            <div
              onClick={onNewProject}
              className="p-4 rounded-lg border border-border bg-surface hover:border-accent/60 hover:bg-surface-hover/50 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text">Create New Project</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Scaffold a new file or directory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workspaces Table (Real persisted history) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Recent Workspaces
            </span>
          </div>

          {recents.length === 0 ? (
            <div className="p-6 rounded-lg border border-border bg-surface text-center text-xs text-text-muted flex flex-col items-center justify-center gap-1.5">
              <Folder className="w-6 h-6 opacity-30 text-text-muted" />
              <span>No recent workspaces found.</span>
              <span className="text-[11px]">Open a folder above to start working.</span>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border border border-border rounded-lg bg-surface overflow-hidden">
              {recents.map((folderPath) => {
                const folderName = folderPath.split(/[/\\]/).pop() || folderPath;
                return (
                  <div
                    key={folderPath}
                    onClick={() => onOpenRecent(folderPath)}
                    className="flex items-center justify-between p-3 hover:bg-surface-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                        <Folder className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-text">{folderName}</h5>
                        <span className="font-mono text-[10px] text-text-muted">{folderPath}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted/60" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
