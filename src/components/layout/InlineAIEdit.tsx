import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, ChevronLeft, ChevronRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface InlineAIEditProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (oldText: string, newText: string) => void;
  onReject: () => void;
  initialPrompt?: string;
  targetFile?: string;
}

export const InlineAIEdit: React.FC<InlineAIEditProps> = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  initialPrompt = "Update the button text to 'Start building'",
  targetFile = 'src/components/Header.tsx',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [diffOld, setDiffOld] = useState('<button className="px-4 py-1.5 bg-accent">Start a new project</button>');
  const [diffNew, setDiffNew] = useState('<button className="px-4 py-1.5 bg-accent">Start building</button>');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (initialPrompt.toLowerCase().includes('profile') || initialPrompt.toLowerCase().includes('user menu')) {
        setDiffOld('<div className="flex items-center gap-2">');
        setDiffNew('<div className="flex items-center gap-2">\n  <button onClick={() => setMenuOpen(!menuOpen)}>Profile</button>');
      } else if (initialPrompt.toLowerCase().includes('title') || initialPrompt.toLowerCase().includes('hero')) {
        setDiffOld('<h2 className="text-xl font-bold">Build something amazing</h2>');
        setDiffNew('<h2 className="text-xl font-bold">Build with Forge Local AI</h2>');
      } else {
        setDiffOld('<button className="px-4 py-1.5 bg-accent">Start a new project</button>');
        setDiffNew('<button className="px-4 py-1.5 bg-accent">Start building</button>');
      }
    }
  }, [initialPrompt]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (prompt.toLowerCase().includes('dark') || prompt.toLowerCase().includes('theme')) {
        setDiffOld('className="bg-white text-black"');
        setDiffNew('className="bg-surface text-text border border-border"');
      } else {
        setDiffOld('<button className="px-4 py-1.5 bg-accent">Start a new project</button>');
        setDiffNew(`<button className="px-4 py-1.5 bg-accent">${prompt.replace(/update|change|to/gi, '').trim() || 'Start building'}</button>`);
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-12 right-12 z-50 w-[440px] bg-surface border border-border rounded-lg shadow-modal overflow-hidden flex flex-col animate-slide-up text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-titlebar">
        <div className="flex items-center gap-1.5 font-semibold text-text text-xs">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Inline AI Edit (Ctrl+I)</span>
          <span className="text-[10px] text-text-muted font-mono bg-surface-active px-1 rounded">
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
            placeholder="Describe the change to make (e.g. improve styles, add validation)..."
            className="w-full bg-input-bg text-text text-xs pr-7 pl-2.5 py-1.5 rounded border border-border focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleGenerate}
            className="absolute right-2 text-text-muted hover:text-accent transition-colors"
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

      {/* Inline Diff Box */}
      <div className="p-2.5 bg-editor-bg border-b border-border flex flex-col gap-1 font-mono text-[11px]">
        <div className="flex items-center justify-between text-[10px] text-text-muted mb-0.5 font-sans">
          <span>Proposed Change (Ponytail Minimal Diff)</span>
          <span className="font-mono">1/1</span>
        </div>

        <div className="bg-accent-red/15 text-rose-300 px-2 py-1 rounded flex items-center gap-2 overflow-x-auto whitespace-pre">
          <span className="font-bold select-none text-accent-red">-</span>
          <span>{diffOld}</span>
        </div>

        <div className="bg-accent-green/15 text-emerald-300 px-2 py-1 rounded flex items-center gap-2 overflow-x-auto whitespace-pre">
          <span className="font-bold select-none text-accent-green">+</span>
          <span>{diffNew}</span>
        </div>
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
            Reject
          </Button>
          <Button
            size="xs"
            variant="success"
            icon={<Check className="w-3 h-3" />}
            onClick={() => onAccept(diffOld, diffNew)}
          >
            Accept Diff
          </Button>
        </div>
      </div>
    </div>
  );
};
