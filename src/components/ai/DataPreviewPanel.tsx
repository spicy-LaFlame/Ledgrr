import { useState } from 'react';
import { ChevronDown, ChevronRight, Shield } from 'lucide-react';

interface DataPreviewPanelProps {
  data: unknown;
  title?: string;
}

const DataPreviewPanel: React.FC<DataPreviewPanelProps> = ({ data, title = 'Data to be sent' }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-slate-700">{title}</span>
          <span className="text-xs text-slate-400">(no employee names, rates, or hours)</span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="p-4 max-h-64 overflow-y-auto bg-white">
          <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DataPreviewPanel;
