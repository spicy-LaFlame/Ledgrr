import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { useFiscalPeriods } from '../../hooks/useAllocations';
import type { ClaudeMessage } from '../../ai/types';
import QueryHistory from './QueryHistory';

const QueryBox: React.FC = () => {
  const { isConfigured, askQuestion, isLoading, error } = useAI();
  const { currentFiscalYear } = useFiscalPeriods();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ClaudeMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isConfigured) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentFiscalYear) return;

    const question = input.trim();
    setInput('');

    // Add user message
    const newMessages: ClaudeMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);

    try {
      const result = await askQuestion(question, messages, currentFiscalYear.id);
      setMessages(prev => [...prev, { role: 'assistant', content: result.answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    }

    inputRef.current?.focus();
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-slate-700">AI Budget Assistant</h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            Based on aggregated data only
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div ref={containerRef} className="p-5 max-h-96 overflow-y-auto">
          <QueryHistory messages={messages} />
          {isLoading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-5 py-4 border-t border-slate-100">
        {error && !isLoading && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your budget data or agreements..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default QueryBox;
