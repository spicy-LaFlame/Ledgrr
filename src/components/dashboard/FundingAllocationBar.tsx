import { formatCurrency } from '../../utils/formatters';

interface FundingAllocationBarProps {
  totalFYFunding: number;
  totalBudgeted: number;
  totalSpent: number;
}

const FundingAllocationBar: React.FC<FundingAllocationBarProps> = ({
  totalFYFunding,
  totalBudgeted,
  totalSpent,
}) => {
  if (totalFYFunding === 0) return null;

  const spentPct = (totalSpent / totalFYFunding) * 100;
  const plannedNotSpentPct = (Math.max(totalBudgeted - totalSpent, 0) / totalFYFunding) * 100;
  const unplannedPct = Math.max(100 - spentPct - plannedNotSpentPct, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-cyan-900">Funding Allocation</h3>
        <span className="text-xs text-slate-500">
          Total FY Funding: {formatCurrency(totalFYFunding)}
        </span>
      </div>

      <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
        {spentPct > 0 && (
          <div
            className="bg-cyan-700 transition-all duration-300"
            style={{ width: `${spentPct}%` }}
            title={`Spent: ${formatCurrency(totalSpent)}`}
          />
        )}
        {plannedNotSpentPct > 0 && (
          <div
            className="bg-cyan-400 transition-all duration-300"
            style={{ width: `${plannedNotSpentPct}%` }}
            title={`Planned (not spent): ${formatCurrency(totalBudgeted - totalSpent)}`}
          />
        )}
        {unplannedPct > 0 && (
          <div
            className="bg-slate-200 transition-all duration-300"
            style={{ width: `${unplannedPct}%` }}
            title={`Unplanned: ${formatCurrency(totalFYFunding - totalBudgeted)}`}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-2">
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-700" />
          Spent: {formatCurrency(totalSpent)} ({spentPct.toFixed(1)}%)
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          Planned: {formatCurrency(Math.max(totalBudgeted - totalSpent, 0))} ({plannedNotSpentPct.toFixed(1)}%)
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          Unplanned: {formatCurrency(Math.max(totalFYFunding - totalBudgeted, 0))} ({unplannedPct.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

export default FundingAllocationBar;
