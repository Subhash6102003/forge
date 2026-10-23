import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-accent-blue" />,
    success: <CheckCircle2 className="w-4 h-4 text-accent-green" />,
    warning: <AlertTriangle className="w-4 h-4 text-accent" />,
    error: <XCircle className="w-4 h-4 text-accent-red" />,
  };

  return (
    <div className="fixed bottom-10 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-3 py-2.5 bg-surface border border-border rounded-md shadow-modal text-xs text-text animate-slide-up"
        >
          <div className="flex items-center gap-2">
            {icons[toast.type]}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-text-muted hover:text-text rounded p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
