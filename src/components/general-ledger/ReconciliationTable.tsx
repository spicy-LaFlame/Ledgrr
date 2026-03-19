import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, AlertTriangle } from 'lucide-react';
import type { ReconciliationRow } from '../../utils/reconciliation';
import type { GLEntry, PayrollEntry } from '../../db/schema';
import ReconciliationDrilldown from './ReconciliationDrilldown';

interface ReconciliationTableProps {
  rows: ReconciliationRow[];
  glEntries: GLEntry[];
  payrollEntries: PayrollEntry[];
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const statusStyles: Record<ReconciliationRow['status'], { label: string; bg: string; text: string }> = {
  matched: { label: 'Matched', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  variance: { label: 'Variance', bg: 'bg-amber-100', text: 'text-amber-700' },
  'external-only': { label: 'External Only', bg: 'bg-red-100', text: 'text-red-700' },
  'app-only': { label: 'App Only', bg: 'bg-slate-100', text: 'text-slate-600' },
};

const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  rows,
  glEntries,
  payrollEntries,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No reconciliation data</p>
        <p className="text-xs text-slate-400 mt-1">Import GL or payroll data to start reconciling</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-8"></th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cost Centre</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Funder</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">External Total</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">App Total</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Variance</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(row => {
            const isExpanded = expandedRow === row.costCentre;
            const style = statusStyles[row.status];
            return (
              <tr key={row.costCentre} className="group">
                <td colSpan={8} className="p-0">
                  <div>
                    <button
                      onClick={() => setExpandedRow(isExpanded ? null : row.costCentre)}
                      className="w-full text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="px-5 py-4 w-8">
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-slate-400" />
                            : <ChevronRight className="w-4 h-4 text-slate-400" />
                          }
                        </div>
                        <div className="px-5 py-4 flex-1 min-w-[100px]">
                          <span className="text-sm font-mono font-medium text-slate-700">{row.costCentre}</span>
                          {row.hasUnclassifiedGL && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline ml-1.5" />
                          )}
                        </div>
                        <div className="px-5 py-4 flex-1">
                          {row.projectName ? (
                            <div>
                              <span className="text-sm text-slate-700">{row.projectCode}</span>
                              <span className="text-xs text-slate-400 ml-2">{row.projectName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-300">—</span>
                          )}
                        </div>
                        <div className="px-5 py-4 flex-shrink-0 w-28">
                          <span className="text-sm text-slate-600">{row.funderName ?? '—'}</span>
                        </div>
                        <div className="px-5 py-4 flex-shrink-0 w-32 text-right">
                          <span className="text-sm font-medium text-slate-900">
                            {row.externalTotal !== 0 ? formatCurrency(row.externalTotal) : '—'}
                          </span>
                          {row.salarySource !== 'none' && (
                            <div className="text-[10px] text-slate-400">
                              via {row.salarySource === 'payroll' ? 'payroll' : 'GL'}
                            </div>
                          )}
                        </div>
                        <div className="px-5 py-4 flex-shrink-0 w-32 text-right">
                          <span className="text-sm font-medium text-slate-900">
                            {row.appTotal !== 0 ? formatCurrency(row.appTotal) : '—'}
                          </span>
                        </div>
                        <div className="px-5 py-4 flex-shrink-0 w-32 text-right">
                          {row.status !== 'external-only' && row.status !== 'app-only' ? (
                            <span className={`text-sm font-medium ${
                              Math.abs(row.variance) < 1 ? 'text-emerald-600' : row.variance > 0 ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {formatCurrency(row.variance)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-300">—</span>
                          )}
                        </div>
                        <div className="px-5 py-4 flex-shrink-0 w-32">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <ReconciliationDrilldown
                        costCentre={row.costCentre}
                        glEntries={glEntries}
                        payrollEntries={payrollEntries}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReconciliationTable;
