import { ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string } | null;
  trendPositive?: boolean;
  subValue?: string;
  onArrowClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendPositive,
  subValue,
  onArrowClick,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{icon}</span>
          <span className="text-sm font-medium text-slate-600">{title}</span>
        </div>
        {onArrowClick ? (
          <button
            onClick={onArrowClick}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </button>
        ) : (
          <div className="p-1">
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </div>
        )}
      </div>
      <div className="mb-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
      {trend && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              trendPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trendPositive && '↑ '}{trend.value.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400">{trend.label}</span>
        </div>
      )}
      {subValue && (
        <div className="mt-1">
          <span className="text-xs text-slate-400">{subValue}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
