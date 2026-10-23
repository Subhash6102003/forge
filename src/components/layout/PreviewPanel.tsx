import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, RefreshCw, ExternalLink, Flame, Home, Folder, Bot, Settings, Plus, FolderOpen } from 'lucide-react';
import { PreviewDevice } from '../../types';

export interface PreviewPanelProps {
  onSelectElement?: (elementInfo: string) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ onSelectElement }) => {
  const [device, setDevice] = useState<PreviewDevice>('responsive');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inspectorActive, setInspectorActive] = useState(true);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const getContainerStyles = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] h-[667px] border border-border shadow-modal rounded-2xl';
      case 'tablet':
        return 'w-[768px] h-[600px] border border-border shadow-modal rounded-xl';
      case 'desktop':
      case 'responsive':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface border-l border-border select-none overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-titlebar text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text">Preview</span>
          <span className="text-[10px] text-text-muted bg-surface-active px-1.5 py-0.2 rounded font-mono">
            localhost:5173
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Responsive device switches */}
          <div className="flex items-center bg-surface border border-border rounded p-0.5">
            <button
              onClick={() => setDevice('responsive')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                device === 'responsive' ? 'bg-accent/15 text-accent font-bold' : 'text-text-muted hover:text-text'
              }`}
            >
              Responsive
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1 rounded transition-colors ${
                device === 'mobile' ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text'
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1 rounded transition-colors ${
                device === 'tablet' ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1 rounded transition-colors ${
                device === 'desktop' ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text'
              }`}
              title="Desktop Full"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors"
            title="Reload Preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => window.open('http://localhost:5173', '_blank')}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-text-muted hover:text-text hover:bg-surface-hover rounded border border-border transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in Browser</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Preview Canvas Area */}
      <div className="flex-1 bg-bg/40 p-4 overflow-auto flex items-center justify-center">
        <div className={`bg-surface overflow-hidden flex flex-col transition-all duration-normal ${getContainerStyles()}`}>
          {/* Simulated App Header matching the user screenshot */}
          <header className="flex h-12 items-center justify-between px-4 border-b border-border shrink-0 bg-surface">
            <div className="flex items-center gap-2 font-bold text-sm text-text">
              <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center text-accent">
                <Flame className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>Forge</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search files, components, or commands..."
                  className="w-56 bg-input-bg text-xs px-2.5 py-1 rounded border border-border focus:outline-none"
                />
              </div>
              <div className="w-7 h-7 rounded-full bg-surface-active text-text-muted flex items-center justify-center text-xs">
                👤
              </div>
            </div>
          </header>

          {/* App Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* App Sidebar */}
            <div className="w-40 border-r border-border p-2 flex flex-col gap-1 text-xs text-text-muted shrink-0">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface-active text-text font-medium cursor-pointer">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover text-text-muted cursor-pointer">
                <Folder className="w-3.5 h-3.5" />
                <span>Projects</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover text-text-muted cursor-pointer">
                <Bot className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover text-text-muted cursor-pointer">
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </div>
            </div>

            {/* App Main Hero Content */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center">
              <div
                onClick={() => onSelectElement?.('Header Hero Title: Build something amazing')}
                className="hover:ring-2 hover:ring-accent/40 rounded p-2 transition-all cursor-pointer"
              >
                <h2 className="text-xl font-bold text-text mb-1 tracking-tight font-sans">
                  Build something amazing
                </h2>
                <p className="text-xs text-text-muted max-w-sm mb-4 leading-relaxed">
                  Your local AI-powered development environment. Generate code, build UIs, create visuals — all in one place.
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => onSelectElement?.('Button: Start a new project')}
                  className="px-4 py-1.5 bg-accent text-white rounded text-xs font-semibold hover:opacity-90 transition-opacity shadow-subtle"
                >
                  Start a new project
                </button>
                <button
                  onClick={() => onSelectElement?.('Button: Open folder')}
                  className="px-4 py-1.5 bg-surface text-text border border-border rounded text-xs font-medium hover:bg-surface-hover transition-colors"
                >
                  Open folder
                </button>
              </div>

              {/* Recent Projects List */}
              <div className="w-full max-w-md text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text">Recent Projects</span>
                  <span className="text-[10px] text-accent hover:underline cursor-pointer">View all →</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="p-2 rounded border border-border bg-surface hover:border-accent/40 transition-colors flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-accent-blue/15 text-accent-blue flex items-center justify-center font-bold text-xs">
                        AI
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-text">ai-web-app</div>
                        <div className="text-[10px] text-text-muted font-mono">~/projects/ai-web-app</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-text-muted">2h ago</span>
                  </div>

                  <div className="p-2 rounded border border-border bg-surface hover:border-accent/40 transition-colors flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-accent/15 text-accent flex items-center justify-center font-bold text-xs">
                        P
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-text">portfolio-site</div>
                        <div className="text-[10px] text-text-muted font-mono">~/projects/portfolio-site</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-text-muted">5h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
