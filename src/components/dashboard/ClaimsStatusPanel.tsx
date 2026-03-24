import { formatCurrency } from '../../utils/formatters';
import type { ClaimsSummary } from '../../hooks/useClaims';

interface ClaimsStatusPanelProps {
  summary: ClaimsSummary;
  fiscalYearName: string;
}

const ClaimsStatusPanel: React.FC<ClaimsStatusPanelProps> = ({ summary, fiscalYearName }) => {
  const { totalClaimed, totalReceived, outstanding, pending } = summary;
  const hasData = totalClaimed > 0 || pending > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-cyan-900">Claims Overview</h3>
          <span className="text-xs text-slate-500">FY {fiscalYearName}</span>
        </div>
        <p className="text-sm text-slate-500 text-center py-6">No claims recorded for this period</p>
      </div>
    );
  }

  const total = totalClaimed + pending;
  const receivedPct = total > 0 ? (totalReceived / total) * 100 : 0;
  const outstandingPct = total > 0 ? (outstanding / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-cyan-900">Claims Overview</h3>
        <span className="text-xs text-slate-500">FY {fiscalYearName}</span>
      </div>

      {/* Inline metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Claimed</p>
          <p className="text-lg font-bold text-cyan-900">{formatCurrency(totalClaimed)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Received</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Outstanding</p>
          <p className="text-lg font-bold text-amber-600">{formatCurrency(outstanding)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
          <p className="text-lg font-bold text-slate-500">{formatCurrency(pending)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
        {receivedPct > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${receivedPct}%` }}
          />
        )}
        {outstandingPct > 0 && (
          <div
            className="bg-amber-400 transition-all duration-300"
            style={{ width: `${outstandingPct}%` }}
          />
        )}
        {pendingPct > 0 && (
          <div
            className="bg-slate-300 transition-all duration-300"
            style={{ width: `${pendingPct}%` }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-2">
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Received {receivedPct.toFixed(0)}%
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          Outstanding {outstandingPct.toFixed(0)}%
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          Pending {pendingPct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default ClaimsStatusPanel;
