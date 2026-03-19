import { useState } from 'react';
import { X, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import type { SafeProjectData } from '../../ai/types';
import DataPreviewPanel from './DataPreviewPanel';
import NarrativeEditor from './NarrativeEditor';

interface NarrativeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  data: SafeProjectData | SafeProjectData[];
  title: string;
}

type Stage = 'preview' | 'loading' | 'result' | 'error';

const NarrativeGenerator: React.FC<NarrativeGeneratorProps> = ({
  isOpen,
  onClose,
  data,
  title,
}) => {
  const { generateNarrative, isLoading, error, clearError } = useAI();
  const [stage, setStage] = useState<Stage>('preview');
  const [narrative, setNarrative] = useState('');
  const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number } | undefined>();
  const [instructions, setInstructions] = useState('');

  const handleGenerate = async () => {
    setStage('loading');
    clearError();
    try {
      const result = await generateNarrative(data, instructions || undefined);
      setNarrative(result.text);
      setTokenUsage({ input: result.inputTokens, output: result.outputTokens });
      setStage('result');
    } catch {
      setStage('error');
    }
  };

  const handleRegenerate = async () => {
    await handleGenerate();
  };

  const handleClose = () => {
    setStage('preview');
    setNarrative('');
    setTokenUsage(undefined);
    setInstructions('');
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-slate-900">Generate Narrative</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-slate-600">{title}</p>

          {/* Data Preview — always visible */}
          <DataPreviewPanel data={data} />

          {/* Instructions */}
          {(stage === 'preview' || stage === 'result') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional instructions (optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="e.g., Focus on Q3 spending, Keep it under 200 words..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          )}

          {/* Loading */}
          {stage === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Generating narrative...</span>
            </div>
          )}

          {/* Error */}
          {stage === 'error' && error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Generation failed</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {stage === 'result' && (
            <NarrativeEditor
              text={narrative}
              onChange={setNarrative}
              onRegenerate={handleRegenerate}
              isRegenerating={isLoading}
              tokenUsage={tokenUsage}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {stage === 'result' ? 'Done' : 'Cancel'}
          </button>
          {(stage === 'preview' || stage === 'error') && (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarrativeGenerator;
