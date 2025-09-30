import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, actionLabel?: string, onAction?: () => void) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number, actionLabel?: string, onAction?: () => void) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000, actionLabel?: string, onAction?: () => void) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, duration, actionLabel, onAction }]);
    },
    []
  );

  const success = useCallback((message: string, duration = 4000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration = 6000, actionLabel?: string, onAction?: () => void) => {
    showToast(message, 'error', duration, actionLabel, onAction);
  }, [showToast]);

  const info = useCallback((message: string, duration = 4000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration = 5000) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
            actionLabel={toast.actionLabel}
            onAction={toast.onAction}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};