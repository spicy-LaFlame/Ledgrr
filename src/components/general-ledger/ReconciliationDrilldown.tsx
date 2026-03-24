import type { GLEntry, PayrollEntry } from '../../db/schema';
import { formatCurrency } from '../../utils/formatters';

interface ReconciliationDrilldownProps {
  costCentre: string;
  glEntries: GLEntry[];
  payrollEntries: PayrollEntry[];
}

const formatDate = (date?: string): string => {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  salary: { bg: 'bg-blue-100', text: 'text-blue-700' },
  expense: { bg: 'bg-amber-100', text: 'text-amber-700' },
  unclassified: { bg: 'bg-red-100', text: 'text-red-700' },
};

const ReconciliationDrilldown: React.FC<ReconciliationDrilldownProps> = ({
  costCentre,
  glEntries,
  payrollEntries,
}) => {
  const filteredGL = glEntries.filter(e => e.costCentre === costCentre);
  const filteredPayroll = payrollEntries.filter(e => e.costCentre === costCentre);

  return (
    <div className="bg-slate-50 px-5 py-4 space-y-4">
      {/* Payroll entries */}
      {filteredPayroll.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Payroll Entries ({filteredPayroll.length})
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Employee</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Period</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">Reg Hrs</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">OT Hrs</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">Earnings</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">Benefits</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayroll.map(entry => (
                  <tr key={entry.id}>
                    <td className="px-3 py-1.5 text-slate-700">{entry.employeeName ?? '—'}</td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {entry.payPeriodStart ? `${formatDate(entry.payPeriodStart)} – ${formatDate(entry.payPeriodEnd)}` : '—'}
                    </td>
                    <td className="px-3 py-1.5 text-right text-slate-700">{entry.regularHours ?? '—'}</td>
                    <td className="px-3 py-1.5 text-right text-slate-700">{entry.overtimeHours ?? '—'}</td>
                    <td className="px-3 py-1.5 text-right text-slate-700">{formatCurrency(entry.earnings)}</td>
                    <td className="px-3 py-1.5 text-right text-slate-700">{entry.benefits != null ? formatCurrency(entry.benefits) : '—'}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-slate-900">
                      {formatCurrency(entry.earnings + (entry.benefits ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={4} className="px-3 py-2 text-right text-xs font-medium text-slate-500">Payroll Total</td>
                  <td className="px-3 py-2 text-right text-xs font-medium text-slate-700">
                    {formatCurrency(filteredPayroll.reduce((s, e) => s + e.earnings, 0))}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium text-slate-700">
                    {formatCurrency(filteredPayroll.reduce((s, e) => s + (e.benefits ?? 0), 0))}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-slate-900">
                    {formatCurrency(filteredPayroll.reduce((s, e) => s + e.earnings + (e.benefits ?? 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* GL entries */}
      {filteredGL.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            GL Entries ({filteredGL.length})
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">GL Code</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Description</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Vendor</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">JE #</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Type</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGL.map(entry => {
                  const catStyle = categoryColors[entry.category];
                  return (
                    <tr key={entry.id}>
                      <td className="px-3 py-1.5 text-slate-600">{formatDate(entry.transactionDate)}</td>
                      <td className="px-3 py-1.5 font-mono text-slate-700">{entry.glCode ?? '—'}</td>
                      <td className="px-3 py-1.5 text-slate-700 max-w-[200px] truncate">{entry.description ?? '—'}</td>
                      <td className="px-3 py-1.5 text-slate-600">{entry.vendor ?? '—'}</td>
                      <td className="px-3 py-1.5 text-slate-600">{entry.journalEntry ?? '—'}</td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${catStyle.bg} ${catStyle.text}`}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatCurrency(entry.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={6} className="px-3 py-2 text-right text-xs font-medium text-slate-500">GL Total</td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-slate-900">
                    {formatCurrency(filteredGL.reduce((s, e) => s + e.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {filteredGL.length === 0 && filteredPayroll.length === 0 && (
        <p className="text-sm text-slate-400">No external data for this cost centre.</p>
      )}
    </div>
  );
};

export default ReconciliationDrilldown;
