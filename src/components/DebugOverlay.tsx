import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  message: string;
  type: 'log' | 'error' | 'warn';
}

const DebugOverlay: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Intercept console.log, console.error, console.warn
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (message: string, type: 'log' | 'error' | 'warn') => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-50), { timestamp, message, type }]); // Keep last 50 logs
    };

    console.log = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      // Only capture debug messages
      if (message.includes('[AUTH') || message.includes('[BUTTON') || message.includes('🔍') || message.includes('🔘') || message.includes('🎉')) {
        addLog(message, 'log');
      }
      originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      if (message.includes('[AUTH') || message.includes('[BUTTON')) {
        addLog(message, 'error');
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      if (message.includes('[AUTH') || message.includes('[BUTTON')) {
        addLog(message, 'warn');
      }
      originalWarn.apply(console, args);
    };

    // Add initial message
    console.log('🔍 [DEBUG OVERLAY] Debug overlay initialized - All logs will appear here!');

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'inset-4'} z-[9999] pointer-events-auto`}
      style={{
        maxWidth: isMinimized ? '200px' : 'calc(100vw - 2rem)',
        maxHeight: isMinimized ? '60px' : 'calc(100vh - 2rem)',
      }}
    >
      <div className="bg-black/95 text-white rounded-lg shadow-2xl border-2 border-purple-500 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-purple-500/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-xs font-bold text-purple-400">
              DEBUG LOGS ({logs.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-purple-500/20 rounded transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                Waiting for debug logs...
                <br />
                Try clicking "Sign in with Google"
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    log.type === 'error'
                      ? 'bg-red-900/20 text-red-300'
                      : log.type === 'warn'
                      ? 'bg-yellow-900/20 text-yellow-300'
                      : log.message.includes('===== LOGIN SUCCESSFUL =====')
                      ? 'bg-green-900/20 text-green-300 font-bold'
                      : log.message.includes('===== LOGIN FAILED =====')
                      ? 'bg-red-900/30 text-red-200 font-bold'
                      : 'bg-gray-900/20 text-gray-300'
                  }`}
                >
                  <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                  <span className="break-all whitespace-pre-wrap">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        {!isMinimized && (
          <div className="flex items-center justify-between p-2 border-t border-purple-500/50 flex-shrink-0">
            <button
              onClick={() => setLogs([])}
              className="text-xs px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded transition-colors"
            >
              Clear Logs
            </button>
            <div className="text-xs text-gray-400">
              {logs.length > 0 ? `Last: ${logs[logs.length - 1]?.timestamp}` : 'No logs yet'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugOverlay;
