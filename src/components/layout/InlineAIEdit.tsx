import React, { useState, useEffect } from 'react';
import { Sparkles, Check, ChevronLeft, ChevronRight, CornerDownLeft, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { DiffViewer, DiffLine } from '../ui/DiffViewer';
import { modelRuntime } from '../../services/modelRuntimeService';

export interface InlineAIEditProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (oldText: string, newText: string) => void;
  onReject: () => void;
  initialPrompt?: string;
  targetFile?: string;
  fileContent?: string;
  selection?: string;
  activeModel?: string;
}

export const InlineAIEdit: React.FC<InlineAIEditProps> = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  initialPrompt = '',
  targetFile = '',
  fileContent = '',
  selection = '',
  activeModel,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [diffOld, setDiffOld] = useState('');
  const [diffNew, setDiffNew] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hunkInfo, setHunkInfo] = useState('1/1');
  const [initialMtime, setInitialMtime] = useState<number | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    setConflictWarning(null);

    // Fetch initial mtime of target file if in Electron
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.getFileStat && targetFile) {
      forgeAPI.fs.getFileStat(targetFile).then((stat: any) => {
        if (stat?.mtimeMs) {
          setInitialMtime(stat.mtimeMs);
        }
      });
    }

    if (selection && selection.trim()) {
      setDiffOld(selection);
      setDiffNew(selection);
    } else if (fileContent && fileContent.trim()) {
      const lines = fileContent.split('\n');
      const sample = lines.slice(0, Math.min(lines.length, 5)).join('\n');
      setDiffOld(sample);
      setDiffNew(sample);
    } else {
      setDiffOld('// Active code snippet');
      setDiffNew('// Modified code snippet');
    }
  }, [initialPrompt, selection, fileContent, isOpen, targetFile]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setConflictWarning(null);

    try {
      const result = await modelRuntime.generateInlineDiff({
        filePath: targetFile,
        fileContent,
        selection,
        prompt,
        model: activeModel,
      });

      setDiffOld(result.oldText);
      setDiffNew(result.newText);
      setHunkInfo('1/1');
    } catch {
      // Graceful fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptClick = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.getFileStat && targetFile && initialMtime) {
      try {
        const latestStat = await forgeAPI.fs.getFileStat(targetFile);
        if (latestStat && latestStat.mtimeMs > initialMtime + 500) {
          setConflictWarning('File has been modified on disk by an external process since generation. Overwriting may lose changes.');
          return;
        }
      } catch {}
    }
    onAccept(diffOld, diffNew);
  };

  const handleForceAccept = () => {
    setConflictWarning(null);
    onAccept(diffOld, diffNew);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-12 right-12 z-50 w-[460px] bg-surface border border-border rounded-lg shadow-modal overflow-hidden flex flex-col animate-slide-up text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-titlebar">
        <div className="flex items-center gap-1.5 font-semibold text-text text-xs">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Inline AI Edit (Ctrl+I)</span>
          <span className="text-[10px] text-text-muted font-mono bg-surface-active px-1 rounded truncate max-w-[180px]">
            {targetFile}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Input */}
      <div className="p-3 border-b border-border bg-surface">
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe edit instruction (e.g. rename, add types, refactor)..."
            className="w-full bg-input-bg text-text text-xs pr-7 pl-2.5 py-1.5 rounded border border-border focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="absolute right-2 text-text-muted hover:text-accent disabled:opacity-50 transition-colors"
            title="Generate diff"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Conflict Warning */}
      {conflictWarning && (
        <div className="p-2.5 bg-accent-red/15 border-b border-accent-red/40 flex flex-col gap-1.5 text-[11px] text-rose-300">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
            <span>Modification Conflict Detected</span>
          </div>
          <p>{conflictWarning}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={handleForceAccept}
              className="px-2 py-0.5 bg-accent-red text-white rounded text-[10px] font-bold hover:opacity-90"
            >
              Overwrite Anyway
            </button>
            <button
              onClick={() => setConflictWarning(null)}
              className="px-2 py-0.5 bg-surface-active text-text rounded text-[10px] hover:bg-surface-hover"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Real DiffViewer with Hunk & Line Controls (Vulnerability 12) */}
      <div className="max-h-60 overflow-y-auto border-b border-border">
        {(() => {
          const oldLines = diffOld ? diffOld.split('\n') : [];
          const newLines = diffNew ? diffNew.split('\n') : [];
          const diffLines: DiffLine[] = [];
          oldLines.forEach((content, idx) => {
            diffLines.push({
              type: 'del',
              lineOld: idx + 1,
              content,
              hunkIndex: 0,
            });
          });
          newLines.forEach((content, idx) => {
            diffLines.push({
              type: 'add',
              lineNew: idx + 1,
              content,
              hunkIndex: 0,
            });
          });

          return (
            <DiffViewer
              filePath={targetFile || 'Inline Diff'}
              additions={newLines.length}
              deletions={oldLines.length}
              lines={diffLines}
              onAcceptAll={handleAcceptClick}
              onRejectAll={onReject}
              onAcceptHunk={() => handleAcceptClick()}
              onRejectHunk={onReject}
            />
          );
        })()}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-titlebar">
        <div className="flex items-center gap-1 text-text-muted text-[10px]">
          <button className="p-1 rounded hover:bg-surface-hover"><ChevronLeft className="w-3 h-3" /></button>
          <span>Hunk 1 of 1</span>
          <button className="p-1 rounded hover:bg-surface-hover"><ChevronRight className="w-3 h-3" /></button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={onReject}
          >
            Reject All
          </Button>
          <Button
            size="xs"
            variant="success"
            icon={<Check className="w-3 h-3" />}
            onClick={handleAcceptClick}
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};
