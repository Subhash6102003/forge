import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone, Tablet, Monitor, RefreshCw, ExternalLink, Globe,
  ArrowRight, Play, Square, Loader2
} from 'lucide-react';
import { PreviewDevice } from '../../types';

export interface PreviewPanelProps {
  onSelectElement?: (elementInfo: string) => void;
  initialUrl?: string;
  detectedServerUrl?: string;
  onRunProject?: () => void;
  onStopProject?: () => void;
  runStatus?: 'running' | 'stopped' | 'failed' | 'idle';
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  onSelectElement,
  initialUrl = '',
  detectedServerUrl = '',
  onRunProject,
  onStopProject,
  runStatus = 'idle',
}) => {
  const [device, setDevice] = useState<PreviewDevice>('responsive');
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [reloadKey, setReloadKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Automatically update preview URL when dev server URL is detected
  useEffect(() => {
    if (detectedServerUrl) {
      setUrl(detectedServerUrl);
      setInputUrl(detectedServerUrl);
      setUrlError(null);
    }
  }, [detectedServerUrl]);

  // Subscribe to real-time URL detection from Forge Run process
  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.run?.onUrlDetected) {
      const cleanup = forgeAPI.run.onUrlDetected((detectedUrl: string) => {
        setUrl(detectedUrl);
        setInputUrl(detectedUrl);
        setUrlError(null);
      });
      return cleanup;
    }
  }, []);

  const isLocalhostUrl = (target: string): boolean => {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(target.trim());
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setReloadKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `http://${target}`;
    }

    if (!isLocalhostUrl(target)) {
      setUrlError('Security policy: Only localhost dev server URLs (e.g. http://localhost:5173) are allowed.');
      return;
    }

    setUrlError(null);
    setUrl(target);
    setInputUrl(target);
    setReloadKey((prev) => prev + 1);
  };

  const handleOpenExternal = async () => {
    if (!url) return;
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.shell?.openExternal) {
      try {
        await forgeAPI.shell.openExternal(url);
      } catch (err: any) {
        setUrlError(err.message);
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const getContainerStyles = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] h-[667px] border border-border shadow-modal rounded-2xl overflow-hidden';
      case 'tablet':
        return 'w-[768px] h-[600px] border border-border shadow-modal rounded-xl overflow-hidden';
      case 'desktop':
      case 'responsive':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface border-l border-border select-none overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-titlebar text-xs shrink-0 gap-2">
        {/* Quick Run / Stop Dev Server Button */}
        {runStatus === 'running' ? (
          <button
            onClick={onStopProject}
            className="flex items-center gap-1 px-2 py-1 rounded bg-accent-red/20 text-rose-300 hover:bg-accent-red/30 border border-accent-red/40 text-[10px] font-bold transition-colors shrink-0"
            title="Stop Dev Server Process"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={onRunProject}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 text-[10px] font-bold transition-colors shrink-0"
            title="Run Project Dev Server (npm run dev)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        )}

        {/* URL Input Form */}
        <form onSubmit={handleUrlSubmit} className="flex items-center gap-1.5 flex-1 min-w-0">
          <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setUrlError(null);
            }}
            placeholder={runStatus === 'running' ? 'Waiting for dev server URL…' : 'Dev server idle (click Run)'}
            className="flex-1 bg-input-bg text-text text-[11px] font-mono px-2 py-0.5 rounded border border-border focus:outline-none focus:border-accent min-w-0 placeholder:text-text-muted/50"
          />
          <button
            type="submit"
            className="p-1 text-text-muted hover:text-text rounded transition-colors shrink-0"
            title="Navigate (Localhost only)"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </form>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Responsive device switches */}
          <div className="flex items-center bg-surface border border-border rounded p-0.5">
            <button
              onClick={() => setDevice('responsive')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                device === 'responsive' ? 'bg-accent/15 text-accent font-bold' : 'text-text-muted hover:text-text'
              }`}
            >
              Auto
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
            disabled={!url}
            className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors disabled:opacity-40"
            title="Reload Preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenExternal}
            disabled={!url}
            className="flex items-center gap-1 px-1.5 py-1 text-[10px] font-medium text-text-muted hover:text-text hover:bg-surface-hover rounded border border-border transition-colors disabled:opacity-40"
            title="Open in default OS browser"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Browser</span>
          </button>
        </div>
      </div>

      {urlError && (
        <div className="px-3 py-1 bg-accent-red/10 border-b border-accent-red/30 text-[10px] text-rose-400">
          {urlError}
        </div>
      )}

      {/* Embedded Live Preview Canvas Area */}
      <div className="flex-1 bg-bg/40 p-2 overflow-auto flex items-center justify-center relative">
        <div className={`bg-white transition-all duration-normal flex flex-col ${getContainerStyles()}`}>
          {url ? (
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={url}
              title="Live Application Preview"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-muted bg-surface select-none">
              <Globe className="w-10 h-10 mb-3 opacity-30 text-accent" />
              <div className="font-semibold text-xs text-text mb-1">
                {runStatus === 'running'
                  ? 'Dev Server Starting…'
                  : runStatus === 'failed'
                  ? 'Dev Server Setup'
                  : 'Live Preview Ready'}
              </div>
              <p className="text-[11px] max-w-xs mb-4 text-text-muted">
                {runStatus === 'running'
                  ? 'Your project is starting. The preview will automatically connect as soon as the port is ready.'
                  : runStatus === 'failed'
                  ? 'Unable to auto-detect dev script. You can start the built-in static dev server or enter your localhost port above.'
                  : 'Start your project development server to interact with the live preview directly here.'}
              </p>
              {runStatus === 'running' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-active border border-border text-xs text-text">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>Listening for localhost port…</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={onRunProject}
                    className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-md bg-accent text-white font-semibold text-xs hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Dev Server (Run)</span>
                  </button>
                  <button
                    onClick={() => {
                      setUrl('http://localhost:5173');
                      setInputUrl('http://localhost:5173');
                      setUrlError(null);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1 rounded text-xs bg-surface-active hover:bg-surface-hover text-text border border-border transition-colors cursor-pointer"
                  >
                    <Globe className="w-3 h-3 text-accent" />
                    <span>Connect http://localhost:5173</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
