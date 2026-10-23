import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  showClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-xl',
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full ${width} bg-surface border border-border rounded-lg shadow-modal overflow-hidden flex flex-col`}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-titlebar">
            {title && <h3 className="text-sm font-semibold text-text">{title}</h3>}
            {showClose && (
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-4 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};
