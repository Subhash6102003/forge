import React, { useState } from 'react';
import { AIMode, ChatMessage as ChatMessageType, ContextChip as ContextChipType } from '../../types';
import { ChatMessage } from '../ui/ChatMessage';
import { ContextChip } from '../ui/ContextChip';
import { Send, Paperclip, Sparkles, ChevronDown, Bot, Scissors, X, Shield, Layout, Palette } from 'lucide-react';
import { Button } from '../ui/Button';
import { PonytailLevel } from '../../services/ponytailEngine';

export interface AIChatPanelProps {
  messages: ChatMessageType[];
  onSendMessage: (content: string, mode: AIMode, context: ContextChipType[]) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  ponytailLevel?: PonytailLevel;
  onPonytailLevelChange?: (level: PonytailLevel) => void;
  onClose?: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  messages,
  onSendMessage,
  selectedModel,
  onModelChange,
  ponytailLevel = 'full',
  onPonytailLevelChange,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<AIMode>('plan');
  const [input, setInput] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeChips, setActiveChips] = useState<ContextChipType[]>([
    { id: '1', label: 'Current File', type: 'file', value: 'Header.tsx', active: true },
    { id: '2', label: 'Selection', type: 'selection', value: 'lines 12-25', active: false },
    { id: '3', label: 'Folder', type: 'folder', value: 'components', active: false },
    { id: '4', label: 'Project', type: 'project', value: 'my-ai-app', active: false },
  ]);

  const availableModels = [
    { id: 'Local Model (Llama 3.1 8B)', short: 'Llama 3.1 8B', desc: '8B params - Recommended' },
    { id: 'Local Model (Qwen 2.5 Coder 7B)', short: 'Qwen 2.5 Coder', desc: '7B params - Fast code gen' },
    { id: 'Local Model (CodeLlama 13B)', short: 'CodeLlama 13B', desc: '13B params - High precision' },
    { id: 'Local Model (Mistral 7B)', short: 'Mistral 7B', desc: '7B params - Balanced' },
  ];

  const toggleChip = (chip: ContextChipType) => {
    setActiveChips((prev) =>
      prev.map((c) => (c.id === chip.id ? { ...c, active: !c.active } : c))
    );
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input, activeMode, activeChips.filter((c) => c.active));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-[360px] h-full bg-surface border-l border-border flex flex-col shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-titlebar">
        <div className="flex items-center gap-1.5 font-bold text-xs text-text">
          <Bot className="w-4 h-4 text-accent" />
          <span>AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Pills: Plan / Build / Ask */}
      <div className="p-2.5 border-b border-border/80 flex flex-col gap-2 relative">
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-surface-active rounded-md">
          {(['plan', 'build', 'ask'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`py-1 text-xs font-semibold rounded capitalize transition-all duration-fast ${
                activeMode === m
                  ? 'bg-surface text-text shadow-xs border border-border/60'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* 1-Click Ponytail Mode Aggression Pill */}
        <div className="flex items-center justify-between p-1.5 bg-accent/5 rounded border border-accent/30 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-text">
            <Scissors className="w-3.5 h-3.5 text-accent" />
            <span>Ponytail Mode:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['lite', 'full', 'ultra', 'off'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onPonytailLevelChange?.(lvl)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                  ponytailLevel === lvl
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-text-muted hover:text-text bg-surface'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <div
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center justify-between px-2 py-1.5 bg-input-bg rounded border border-border text-xs text-text cursor-pointer hover:border-accent/60 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium truncate">{selectedModel}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </div>

          {isModelDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-modal p-1 flex flex-col gap-0.5 animate-slide-up text-xs">
              {availableModels.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onModelChange(m.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`flex flex-col p-2 rounded cursor-pointer transition-colors ${
                    selectedModel === m.id
                      ? 'bg-accent/15 text-text font-medium'
                      : 'hover:bg-surface-hover text-text-muted hover:text-text'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{m.short}</span>
                    <span className="text-[10px] text-emerald-500 font-mono">Local</span>
                  </div>
                  <span className="text-[10px] text-text-muted">{m.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context Selector Chips */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          {activeChips.map((chip) => (
            <ContextChip key={chip.id} chip={chip} onToggle={toggleChip} />
          ))}
        </div>

        {/* Active Skills Chips */}
        <div className="flex items-center gap-1 text-[10px] text-text-muted pt-1 border-t border-border/40">
          <span className="shrink-0 font-medium">Skills:</span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-accent-blue font-mono">
            subhash-uiux
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-emerald-500 font-mono">
            subhash-developer
          </span>
          <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono font-bold">
            ponytail -53%
          </span>
        </div>
      </div>

      {/* Chat Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Chat Input Box */}
      <div className="p-3 border-t border-border bg-titlebar flex flex-col gap-2">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or run /ponytail-audit, /ponytail-debt..."
            rows={2}
            className="w-full bg-input-bg text-text text-xs p-2.5 pr-8 rounded-md border border-border focus:outline-none focus:border-accent resize-none placeholder:text-text-muted/60"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            <button className="text-text-muted hover:text-text p-1 transition-colors" title="Attach file or context">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-1 rounded bg-accent text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
