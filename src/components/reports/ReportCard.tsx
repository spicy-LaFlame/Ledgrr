import { Download } from 'lucide-react';

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  format: 'Excel' | 'PDF';
  onGenerate: () => void;
  isGenerating?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
  icon,
  title,
  description,
  format,
  onGenerate,
  isGenerating = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              format === 'Excel'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {format}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4">{description}</p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
