import { Download, Sparkles } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  format: 'Excel' | 'PDF';
  onGenerate: () => void;
  isGenerating?: boolean;
  onNarrative?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  icon,
  title,
  description,
  format,
  onGenerate,
  isGenerating = false,
  onNarrative,
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-cyan-900">{title}</h3>
            <Badge variant={format === 'Excel' ? 'success' : 'info'}>
              {format}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mb-4">{description}</p>
          <div className="flex items-center gap-2">
            <Button
              onClick={onGenerate}
              loading={isGenerating}
              icon={<Download className="w-4 h-4" />}
            >
              Generate
            </Button>
            {onNarrative && (
              <button
                onClick={onNarrative}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-violet-700 bg-violet-50 text-sm font-medium rounded-xl hover:bg-violet-100 transition-colors duration-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                AI Narrative
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReportCard;
