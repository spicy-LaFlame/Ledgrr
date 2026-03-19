import { useState } from 'react';
import { Copy, Download, Check, RefreshCw } from 'lucide-react';

interface NarrativeEditorProps {
  text: string;
  onChange: (text: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  tokenUsage?: { input: number; output: number };
}

const NarrativeEditor: React.FC<NarrativeEditorProps> = ({
  text,
  onChange,
  onRegenerate,
  isRegenerating,
  tokenUsage,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrative_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Generated Narrative</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => onChange(e.target.value)}
        rows={12}
        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
      />

      {tokenUsage && (
        <p className="text-xs text-slate-400">
          Tokens used: {tokenUsage.input} input + {tokenUsage.output} output
        </p>
      )}
    </div>
  );
};

export default NarrativeEditor;
