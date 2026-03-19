import { Sparkles, User } from 'lucide-react';
import type { ClaudeMessage } from '../../ai/types';

interface QueryHistoryProps {
  messages: ClaudeMessage[];
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? '' : ''}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            msg.role === 'user' ? 'bg-slate-200' : 'bg-violet-100'
          }`}>
            {msg.role === 'user'
              ? <User className="w-4 h-4 text-slate-600" />
              : <Sparkles className="w-4 h-4 text-violet-600" />
            }
          </div>
          <div className={`flex-1 rounded-xl px-4 py-3 text-sm leading-relaxed ${
            msg.role === 'user'
              ? 'bg-slate-100 text-slate-800'
              : 'bg-violet-50 text-slate-800'
          }`}>
            {msg.content.split('\n').map((line, li) => (
              <p key={li} className={li > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QueryHistory;
