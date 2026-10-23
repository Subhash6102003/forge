import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { Bot, User, ChevronDown, ChevronRight, CheckCircle2, Circle, Loader2, Copy, Check } from 'lucide-react';
import { ContextChip } from './ContextChip';

export interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [stepsOpen, setStepsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const isAssistant = message.sender === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-lg text-xs transition-colors ${
      isAssistant ? 'bg-surface/60 border border-border/60' : 'bg-surface-hover/50 ml-4'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between text-text-muted">
        <div className="flex items-center gap-2">
          {isAssistant ? (
            <div className="w-5 h-5 rounded bg-accent/20 text-accent flex items-center justify-center font-bold">
              <Bot className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded bg-text-muted/20 text-text flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="font-semibold text-text text-[11px]">
            {isAssistant ? 'Forge Assistant' : 'You'}
          </span>
          {message.mode && (
            <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider bg-surface-active text-text-muted">
              {message.mode}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleCopy}
            className="text-text-muted hover:text-text p-1 rounded transition-colors"
            title="Copy message"
          >
            {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Structured Steps if available */}
      {message.steps && message.steps.length > 0 && (
        <div className="mt-1 border border-border/80 rounded bg-bg/50 overflow-hidden">
          <div
            onClick={() => setStepsOpen(!stepsOpen)}
            className="flex items-center justify-between px-2.5 py-1.5 cursor-pointer bg-surface hover:bg-surface-hover select-none"
          >
            <span className="font-medium text-[11px] text-text">
              Plan ({message.steps.filter((s) => s.status === 'completed').length}/{message.steps.length} completed)
            </span>
            {stepsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </div>
          {stepsOpen && (
            <div className="p-2 flex flex-col gap-1.5 border-t border-border/60">
              {message.steps.map((step, idx) => (
                <div key={step.id || idx} className="flex items-start gap-2 text-text">
                  {step.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />}
                  {step.status === 'running' && <Loader2 className="w-3.5 h-3.5 text-accent animate-spin shrink-0 mt-0.5" />}
                  {step.status === 'pending' && <Circle className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-medium text-[11px]">{step.title}</span>
                    {step.description && <p className="text-[10px] text-text-muted mt-0.5">{step.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Context Chips Attached to Message */}
      {message.contextChips && message.contextChips.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {message.contextChips.map((chip) => (
            <ContextChip key={chip.id} chip={chip} />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="text-text leading-relaxed whitespace-pre-wrap font-sans text-xs">
        {message.content}
      </div>

      {message.isStreaming && (
        <div className="flex items-center gap-1.5 text-text-muted text-[11px] animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Generating changes...</span>
        </div>
      )}
    </div>
  );
};
