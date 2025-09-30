/**
 * Command Handler - Handles slash commands in the app
 * Provides a terminal-like interface for commands
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, ChevronUp, Send } from 'lucide-react';
import meaningCommand from '../commands/meaningCommand';

interface CommandOutput {
  command: string;
  result: string;
  success: boolean;
  timestamp: Date;
}

const CommandHandler: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load command history from localStorage
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      setCommandHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    // Focus input when opened
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = async (commandText: string) => {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    // Add to command history
    const newCommandHistory = [...commandHistory.filter(c => c !== trimmed), trimmed].slice(-50);
    setCommandHistory(newCommandHistory);
    localStorage.setItem('commandHistory', JSON.stringify(newCommandHistory));

    let output: CommandOutput;

    // Parse command and arguments
    const [command, ...args] = trimmed.split(' ');
    const argString = args.join(' ');

    switch (command.toLowerCase()) {
      case '/meaning':
        const result = await meaningCommand.execute(argString);
        output = {
          command: trimmed,
          result: formatMeaningResult(result),
          success: result.success,
          timestamp: new Date()
        };
        break;

      case '/meaning-status':
      case '/status':
        const status = meaningCommand.getStatus();
        output = {
          command: trimmed,
          result: formatStatusResult(status),
          success: true,
          timestamp: new Date()
        };
        break;

      case '/meaning-stop':
      case '/stop':
        const stopResult = meaningCommand.stop();
        output = {
          command: trimmed,
          result: stopResult.message,
          success: stopResult.success,
          timestamp: new Date()
        };
        break;

      case '/meaning-clear':
      case '/clear':
        const clearResult = meaningCommand.clear();
        output = {
          command: trimmed,
          result: clearResult.message,
          success: clearResult.success,
          timestamp: new Date()
        };
        break;

      case '/help':
        output = {
          command: trimmed,
          result: getHelpText(),
          success: true,
          timestamp: new Date()
        };
        break;

      case '/cls':
      case '/clear-screen':
        setHistory([]);
        setInput('');
        return;

      default:
        output = {
          command: trimmed,
          result: `❌ Unknown command: ${command}\nType /help for available commands`,
          success: false,
          timestamp: new Date()
        };
    }

    setHistory(prev => [...prev, output]);
    setInput('');
    setHistoryIndex(-1);
  };

  const formatMeaningResult = (result: any): string => {
    if (!result.success) return result.message;

    let output = result.message;
    if (result.details) {
      output += '\n\n📊 **Statistics:**';
      output += `\n• Total names: ${result.details.totalNames.toLocaleString()}`;
      output += `\n• Already enriched: ${result.details.alreadyEnriched.toLocaleString()}`;
      output += `\n• Pending: ${result.details.pending.toLocaleString()}`;
      output += `\n• Processing now: ${result.details.toProcess}`;
      output += `\n• Overall progress: ${result.details.progress}`;
    }
    return output;
  };

  const formatStatusResult = (status: any): string => {
    let output = '📊 **Enrichment Status**\n\n';

    if (status.isProcessing) {
      output += `⏳ **Currently Processing:** ${status.currentName}\n\n`;
    } else {
      output += '✅ **Status:** Idle\n\n';
    }

    output += '**Progress:**\n';
    output += `• Enriched: ${status.progress.processed.toLocaleString()} names\n`;
    output += `• Pending: ${status.progress.pending.toLocaleString()} names\n`;
    output += `• Total: ${status.progress.total.toLocaleString()} names\n`;
    output += `• Completion: ${status.progress.percentage}%\n`;

    if (status.originDistribution && Object.keys(status.originDistribution).length > 0) {
      output += '\n**Top Origins:**\n';
      const topOrigins = Object.entries(status.originDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5);

      topOrigins.forEach(([origin, count]) => {
        output += `• ${origin}: ${count} names\n`;
      });
    }

    return output;
  };

  const getHelpText = (): string => {
    return `
🚀 **Available Commands**

**Name Enrichment:**
• \`/meaning [number]\` - Process names with AI
• \`/status\` - Check enrichment progress
• \`/stop\` - Stop current processing
• \`/clear\` - Clear all enrichment data

**System:**
• \`/help\` - Show this help
• \`/cls\` - Clear terminal screen

**Examples:**
• \`/meaning\` - Process 50 names
• \`/meaning 100\` - Process 100 names
• \`/status\` - Check progress

**Tips:**
• Use ↑/↓ arrows for command history
• Names are auto-flagged to prevent duplicates
• Progress saves automatically
    `.trim();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
        title="Open Command Terminal"
      >
        <Terminal className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* Terminal Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50">
          <div className="w-full max-w-3xl bg-gray-900 rounded-t-xl shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-sm font-mono text-gray-300">Command Terminal</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Output Area */}
            <div
              ref={outputRef}
              className="h-80 overflow-y-auto p-4 font-mono text-sm bg-gray-900"
            >
              {history.length === 0 ? (
                <div className="text-gray-500">
                  Type <span className="text-green-400">/help</span> for available commands
                </div>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">$</span>
                      <span className="text-gray-300">{item.command}</span>
                    </div>
                    <div className={`mt-1 ml-4 whitespace-pre-wrap ${
                      item.success ? 'text-gray-400' : 'text-red-400'
                    }`}>
                      {item.result}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-t border-gray-700">
              <span className="text-green-400 font-mono">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-gray-200 font-mono text-sm outline-none placeholder:text-gray-600"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={() => handleCommand(input)}
                className="p-2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Footer Hint */}
            <div className="px-4 py-2 bg-gray-850 text-xs text-gray-500 font-mono">
              ↑/↓ history • ESC close • /help commands
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default CommandHandler;