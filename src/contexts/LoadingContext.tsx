import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingAnimation from '../components/LoadingAnimation';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Finding your perfect name...');
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = useCallback((customMessage?: string) => {
    setLoadingCount((prev) => prev + 1);
    if (customMessage) {
      setMessage(customMessage);
    }
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingCount((prev) => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsLoading(false);
        // Reset to default message
        setTimeout(() => {
          setMessage('Finding your perfect name...');
        }, 300);
      }
      return newCount;
    });
  }, []);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, customMessage?: string): Promise<T> => {
      showLoading(customMessage);
      try {
        const result = await promise;
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  const value: LoadingContextType = {
    isLoading,
    message,
    showLoading,
    hideLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isLoading && <LoadingAnimation fullScreen message={message} />}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Convenience hook for async operations
export const useAsyncWithLoading = () => {
  const { withLoading } = useLoading();

  return useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      message?: string
    ): Promise<T> => {
      return withLoading(asyncFn(), message);
    },
    [withLoading]
  );
};

export default LoadingContext;
