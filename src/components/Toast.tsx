import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  actionLabel,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${getBgColor()} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ maxWidth: '400px' }}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium text-gray-800">{message}</span>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;