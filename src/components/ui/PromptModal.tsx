import React, { useState, useEffect, useRef } from 'react';
import { X, FilePlus, FolderPlus, Edit3, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface PromptModalConfig {
  isOpen: boolean;
  type: 'file' | 'folder' | 'rename' | 'confirm';
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void | Promise<void>;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalConfig> = ({
  isOpen,
  type,
  title,
  description,
  defaultValue = '',
  placeholder = '',
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
      setIsSubmitting(false);

      // Auto-focus and highlight base name on mount
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          if (defaultValue) {
            const dotIdx = defaultValue.lastIndexOf('.');
            if (dotIdx > 0 && type !== 'folder') {
              inputRef.current.setSelectionRange(0, dotIdx);
            } else {
              inputRef.current.select();
            }
          }
        }
      }, 50);
    }
  }, [isOpen, defaultValue, type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return type === 'folder' ? 'Folder name cannot be empty' : 'File name cannot be empty';
    }
    if (trimmed.includes('..')) {
      return 'Directory traversal ("..") is not allowed';
    }
    // Check forbidden characters
    if (/[*?"<>|:]/.test(trimmed)) {
      return 'Name contains invalid characters (* ? " < > | :)';
    }
    if (type === 'folder' && (trimmed.startsWith('/') || trimmed.endsWith('/'))) {
      return 'Folder name should not start or end with a slash';
    }
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const validationError = validate(value);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(value.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'file':
        return <FilePlus className="w-4 h-4 text-accent" />;
      case 'folder':
        return <FolderPlus className="w-4 h-4 text-accent" />;
      case 'rename':
        return <Edit3 className="w-4 h-4 text-accent" />;
      default:
        return <AlertCircle className="w-4 h-4 text-accent" />;
    }
  };

  const fileTemplates = [
    { label: 'Java', ext: '.java', defaultName: 'Main.java' },
    { label: 'TypeScript', ext: '.ts', defaultName: 'index.ts' },
    { label: 'React', ext: '.tsx', defaultName: 'App.tsx' },
    { label: 'JavaScript', ext: '.js', defaultName: 'index.js' },
    { label: 'Python', ext: '.py', defaultName: 'main.py' },
    { label: 'HTML', ext: '.html', defaultName: 'index.html' },
    { label: 'Markdown', ext: '.md', defaultName: 'README.md' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-active/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center">
              {getIcon()}
            </div>
            <h3 className="text-sm font-semibold text-text">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text rounded-md p-1 transition-colors hover:bg-surface-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          {description && (
            <p className="text-xs text-text-muted leading-relaxed">{description}</p>
          )}

          <div className="flex flex-col gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              className={`w-full bg-input-bg text-text text-sm rounded-lg border ${
                error
                  ? 'border-accent-red focus:ring-accent-red/20'
                  : 'border-border focus:border-accent focus:ring-accent/20'
              } px-3 py-2 placeholder:text-text-muted/60 focus:outline-none focus:ring-2 transition-all duration-fast`}
            />

            {error && (
              <span className="text-xs text-accent-red flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </span>
            )}
          </div>

          {/* Quick Extension Chips for File Creation */}
          {type === 'file' && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/70">
                Quick Templates
              </span>
              <div className="flex flex-wrap gap-1.5">
                {fileTemplates.map((t) => (
                  <button
                    key={t.ext}
                    type="button"
                    onClick={() => {
                      if (!value || value.trim() === '') {
                        setValue(t.defaultName);
                      } else if (!value.includes('.')) {
                        setValue(`${value}${t.ext}`);
                      } else {
                        const base = value.substring(0, value.lastIndexOf('.'));
                        setValue(`${base}${t.ext}`);
                      }
                      inputRef.current?.focus();
                    }}
                    className="px-2 py-0.5 text-[11px] rounded bg-surface border border-border/80 hover:border-accent hover:text-accent text-text-muted transition-colors cursor-pointer"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60 mt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !value.trim()}
            >
              {isSubmitting ? 'Creating…' : confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
