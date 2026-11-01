import React from 'react';
import { Check, X, CheckCheck, XCircle } from 'lucide-react';
import { Button } from './Button';

export interface DiffLine {
  type: 'add' | 'del' | 'normal';
  lineOld?: number;
  lineNew?: number;
  content: string;
  hunkIndex?: number;
}

export interface DiffViewerProps {
  filePath: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onAcceptHunk?: (hunkIndex: number) => void;
  onRejectHunk?: (hunkIndex: number) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  filePath,
  additions,
  deletions,
  lines,
  onAcceptAll,
  onRejectAll,
  onAcceptHunk,
  onRejectHunk,
}) => {
  // Group lines into hunks by hunkIndex
  const hunksMap = new Map<number, DiffLine[]>();
  lines.forEach((l) => {
    const idx = l.hunkIndex !== undefined ? l.hunkIndex : 0;
    if (!hunksMap.has(idx)) hunksMap.set(idx, []);
    hunksMap.get(idx)!.push(l);
  });

  const hunkIndices = Array.from(hunksMap.keys());

  return (
    <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden text-xs">
      {/* Diff Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-titlebar">
        <div className="flex items-center gap-2 font-mono">
          <span className="font-semibold text-text truncate">{filePath}</span>
          <span className="text-accent-green font-medium">+{additions}</span>
          <span className="text-accent-red font-medium">-{deletions}</span>
        </div>
        <div className="flex items-center gap-2">
          {onAcceptAll && (
            <Button
              size="xs"
              variant="success"
              icon={<CheckCheck className="w-3 h-3" />}
              onClick={onAcceptAll}
            >
              Accept All
            </Button>
          )}
          {onRejectAll && (
            <Button
              size="xs"
              variant="secondary"
              icon={<XCircle className="w-3 h-3" />}
              onClick={onRejectAll}
            >
              Reject All
            </Button>
          )}
        </div>
      </div>

      {/* Diff Lines by Hunk */}
      <div className="font-mono text-xs overflow-x-auto divide-y divide-border/20 py-1 bg-editor-bg">
        {hunkIndices.map((hunkIdx) => {
          const hunkLines = hunksMap.get(hunkIdx) || [];
          return (
            <div key={hunkIdx} className="flex flex-col">
              {/* Hunk Header with Action Controls */}
              <div className="flex items-center justify-between px-3 py-1 bg-surface-active/60 border-y border-border/40 text-[10px] text-text-muted select-none font-sans">
                <span className="font-mono font-semibold text-text">Hunk {hunkIdx + 1} of {hunkIndices.length}</span>
                <div className="flex items-center gap-1.5">
                  {onAcceptHunk && (
                    <button
                      onClick={() => onAcceptHunk(hunkIdx)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-emerald-400 bg-accent-green/10 hover:bg-accent-green/20 font-medium"
                    >
                      <Check className="w-3 h-3" /> Accept Hunk
                    </button>
                  )}
                  {onRejectHunk && (
                    <button
                      onClick={() => onRejectHunk(hunkIdx)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-rose-400 bg-accent-red/10 hover:bg-accent-red/20 font-medium"
                    >
                      <X className="w-3 h-3" /> Reject Hunk
                    </button>
                  )}
                </div>
              </div>

              {hunkLines.map((line, idx) => {
                let bg = 'hover:bg-surface-hover/30';
                let textColor = 'text-text';
                let prefix = ' ';

                if (line.type === 'add') {
                  bg = 'bg-accent-green/10 text-emerald-400 font-medium';
                  prefix = '+';
                } else if (line.type === 'del') {
                  bg = 'bg-accent-red/10 text-rose-400 font-medium';
                  prefix = '-';
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-center px-2 py-0.5 select-text ${bg} ${textColor}`}
                  >
                    <div className="w-8 shrink-0 text-right pr-2 text-text-muted/60 select-none text-[10px]">
                      {line.lineOld || ''}
                    </div>
                    <div className="w-8 shrink-0 text-right pr-2 text-text-muted/60 select-none text-[10px]">
                      {line.lineNew || ''}
                    </div>
                    <div className="w-4 shrink-0 text-center select-none font-bold">
                      {prefix}
                    </div>
                    <div className="whitespace-pre overflow-visible flex-1">
                      {line.content}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
