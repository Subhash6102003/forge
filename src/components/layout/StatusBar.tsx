import React from 'react';
import { GitBranch, RefreshCw, AlertCircle, AlertTriangle, Cpu, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { StatusPill } from '../ui/StatusPill';

export interface StatusBarProps {
  branch?: string;
  problemsCount?: number;
  warningsCount?: number;
  activeModel?: string;
  tokensPerSec?: number;
  runtimeStatus?: 'healthy' | 'warning' | 'offline';
  lineCol?: string;
  encoding?: string;
  language?: string;
  ponytailActive?: boolean;
  ponytailLevel?: 'lite' | 'full' | 'ultra' | 'off';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  branch = 'main',
  problemsCount = 0,
  warningsCount = 2,
  activeModel = 'Llama 3.1 8B',
  tokensPerSec = 42.3,
  runtimeStatus = 'healthy',
  lineCol = 'Ln 24, Col 15',
  encoding = 'UTF-8',
  language = 'TSX',
  ponytailActive = true,
  ponytailLevel = 'full',
}) => {
  return (
    <div className="h-[28px] w-full bg-statusbar border-t border-border flex items-center justify-between px-3 select-none text-[11px] text-text-muted shrink-0 z-30">
      {/* Left: Git Branch & Problems */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 hover:text-text transition-colors">
          <GitBranch className="w-3.5 h-3.5 text-accent" />
          <span>{branch}</span>
        </button>

        <button className="hover:text-text transition-colors">
          <RefreshCw className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-0.5 hover:text-text transition-colors">
            <AlertCircle className="w-3 h-3 text-text-muted" />
            <span>{problemsCount}</span>
          </button>
          <button className="flex items-center gap-0.5 hover:text-text transition-colors">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>{warningsCount}</span>
          </button>
        </div>
      </div>

      {/* Center: Model, Speed, Health */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-text font-medium">
          <Cpu className="w-3.5 h-3.5 text-accent-blue" />
          <span>{activeModel}</span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px]">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="text-text font-semibold">{tokensPerSec.toFixed(1)} tokens/s</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-500 font-medium">Local Runtime Healthy</span>
        </div>

        {ponytailActive && ponytailLevel !== 'off' && (
          <div className="flex items-center gap-1 bg-accent/15 text-accent px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
            <span>Ponytail: {ponytailLevel.toUpperCase()} {ponytailLevel === 'full' ? '(-53%)' : ponytailLevel === 'ultra' ? '(-70%)' : '(-30%)'}</span>
          </div>
        )}
        {ponytailActive && ponytailLevel === 'off' && (
          <div className="flex items-center gap-1 bg-surface-active text-text-muted px-1.5 py-0.2 rounded font-mono text-[10px]">
            <span>Ponytail: OFF</span>
          </div>
        )}
      </div>

      {/* Right: Line/Col, Spaces, Encoding, Language */}
      <div className="flex items-center gap-3 font-mono text-[10px]">
        <span className="text-text-muted hover:text-text cursor-pointer">{lineCol}</span>
        <span className="text-text-muted hover:text-text cursor-pointer">Spaces: 2</span>
        <span className="text-text-muted hover:text-text cursor-pointer">{encoding}</span>
        <span className="text-text-muted hover:text-text cursor-pointer font-sans font-medium">{language}</span>
      </div>
    </div>
  );
};
