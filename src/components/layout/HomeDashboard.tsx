import React from 'react';
import { Flame, FolderPlus, FolderOpen, LayoutTemplate, Clock, ArrowRight, Sparkles, Terminal } from 'lucide-react';

export interface HomeDashboardProps {
  onOpenProject: (path: string) => void;
  onNewProject: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenProject,
  onNewProject,
}) => {
  const recentProjects = [
    { name: 'ai-web-app', path: '~/projects/ai-web-app', updated: '2h ago', badge: 'AI', color: 'bg-accent-blue/15 text-accent-blue' },
    { name: 'portfolio-site', path: '~/projects/portfolio-site', updated: '5h ago', badge: 'P', color: 'bg-accent/15 text-accent' },
    { name: 'mobile-app', path: '~/projects/mobile-app', updated: '1d ago', badge: 'M', color: 'bg-emerald-500/15 text-emerald-500' },
    { name: 'ecommerce', path: '~/projects/ecommerce', updated: '2d ago', badge: 'E', color: 'bg-purple-500/15 text-purple-400' },
  ];

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
            Welcome back, Developer
          </h1>
          <p className="text-xs text-text-muted">
            Your local AI-powered development environment. Zero cloud dependencies, zero telemetry.
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg border border-border bg-surface flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-medium">Recent Projects</span>
            <span className="text-xl font-bold text-text">4 Total</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border bg-surface flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-medium">Pending Actions</span>
            <span className="text-xl font-bold text-emerald-500">0 Tasks</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border bg-surface flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-medium">Local Runtime</span>
            <span className="text-xl font-bold text-accent">Ollama 0.40.4</span>
          </div>
        </div>

        {/* Quick Start Cards */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Quick Start
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={onNewProject}
              className="p-4 rounded-lg border border-border bg-surface hover:border-accent/60 hover:bg-surface-hover/50 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text">New Project</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Scaffold with Vite & React</p>
              </div>
            </div>

            <div
              onClick={() => onOpenProject('d:/don\'t_know/forge')}
              className="p-4 rounded-lg border border-border bg-surface hover:border-accent/60 hover:bg-surface-hover/50 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text">Open Folder</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Open local directory</p>
              </div>
            </div>

            <div
              className="p-4 rounded-lg border border-border bg-surface hover:border-accent/60 hover:bg-surface-hover/50 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text">View Templates</h4>
                <p className="text-[11px] text-text-muted mt-0.5">AI Agents, Fullstack, REA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Recent Workspaces
            </span>
            <span className="text-[11px] text-accent hover:underline cursor-pointer">View All →</span>
          </div>

          <div className="flex flex-col divide-y divide-border border border-border rounded-lg bg-surface overflow-hidden">
            {recentProjects.map((proj) => (
              <div
                key={proj.name}
                onClick={() => onOpenProject(proj.path)}
                className="flex items-center justify-between p-3 hover:bg-surface-hover cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${proj.color}`}>
                    {proj.badge}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-text">{proj.name}</h5>
                    <span className="font-mono text-[10px] text-text-muted">{proj.path}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{proj.updated}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
