import { useState } from 'react';
import { X, Pencil, Plus, Check } from 'lucide-react';
import { useEmployeeRates, getTotalRate } from '../../hooks/useEmployees';
import { useFiscalPeriods } from '../../hooks/useAllocations';
import type { Employee, Quarter } from '../../db/schema';

interface RateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

interface EditFormData {
  baseHourlyRate: number;
  benefitsRate: number;
  source: string;
}

const formatRate = (rate: number): string => {
  return `$${rate.toFixed(2)}/hr`;
};

const formatQuarterDates = (quarter: Quarter): string => {
  const start = new Date(quarter.startDate);
  const end = new Date(quarter.endDate);
  const fmt = (d: Date) => d.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
  return `${fmt(start)} — ${fmt(end)}`;
};

const RateManagementModal: React.FC<RateManagementModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const { fiscalYears, getQuartersForYear } = useFiscalPeriods();
  const currentFY = fiscalYears.find(fy => fy.isCurrent);
  const { rates, addRate, updateRate, getRateForQuarter } = useEmployeeRates(
    employee.id,
    currentFY?.id
  );
  const quarters = currentFY ? getQuartersForYear(currentFY.id) : [];

  const [editingQuarterId, setEditingQuarterId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    baseHourlyRate: 0,
    benefitsRate: 0,
    source: '',
  });

  const startEdit = (quarterId: string) => {
    const existing = getRateForQuarter(employee.id, quarterId);
    if (existing) {
      setEditFormData({
        baseHourlyRate: existing.baseHourlyRate,
        benefitsRate: existing.benefitsRate,
        source: existing.source ?? '',
      });
    } else {
      setEditFormData({ baseHourlyRate: 0, benefitsRate: 0, source: '' });
    }
    setEditingQuarterId(quarterId);
  };

  const cancelEdit = () => {
    setEditingQuarterId(null);
  };

  const handleSave = async (quarter: Quarter) => {
    const existing = getRateForQuarter(employee.id, quarter.id);
    if (existing) {
      await updateRate(existing.id, {
        baseHourlyRate: editFormData.baseHourlyRate,
        benefitsRate: editFormData.benefitsRate,
        source: editFormData.source || undefined,
      });
    } else {
      await addRate({
        employeeId: employee.id,
        fiscalYearId: currentFY!.id,
        quarterId: quarter.id,
        baseHourlyRate: editFormData.baseHourlyRate,
        benefitsRate: editFormData.benefitsRate,
        effectiveDate: quarter.startDate,
        source: editFormData.source || undefined,
      });
    }
    setEditingQuarterId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Rate Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {employee.name} — {employee.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentFY ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No fiscal year configured.
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                FY {currentFY.name} Quarterly Rates
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Quarter</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Base Rate</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Benefits</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Total</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Source</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quarters.map(quarter => {
                      const rate = getRateForQuarter(employee.id, quarter.id);
                      const isEditing = editingQuarterId === quarter.id;

                      if (isEditing) {
                        return (
                          <tr key={quarter.id} className="bg-blue-50/50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-slate-900">Q{quarter.quarterNumber}</div>
                              <div className="text-xs text-slate-400">{formatQuarterDates(quarter)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editFormData.baseHourlyRate || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, baseHourlyRate: parseFloat(e.target.value) || 0 }))}
                                className="w-24 px-2 py-1 border border-slate-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editFormData.benefitsRate || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, benefitsRate: parseFloat(e.target.value) || 0 }))}
                                className="w-24 px-2 py-1 border border-slate-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-slate-700">
                                {formatRate(editFormData.baseHourlyRate + editFormData.benefitsRate)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editFormData.source}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, source: e.target.value }))}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., UKG Export"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSave(quarter)}
                                  className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"
                                  title="Save"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      if (rate) {
                        return (
                          <tr key={quarter.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-slate-900">Q{quarter.quarterNumber}</div>
                              <div className="text-xs text-slate-400">{formatQuarterDates(quarter)}</div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-700">
                              {formatRate(rate.baseHourlyRate)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-700">
                              {formatRate(rate.benefitsRate)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                              {formatRate(getTotalRate(rate))}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                              {rate.source || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => startEdit(quarter.id)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit rate"
                                >
                                  <Pencil className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // Empty row — no rate for this quarter
                      return (
                        <tr key={quarter.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-900">Q{quarter.quarterNumber}</div>
                            <div className="text-xs text-slate-400">{formatQuarterDates(quarter)}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-slate-300">—</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-300">—</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-300">—</td>
                          <td className="px-4 py-3 text-sm text-slate-300">No rate set</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => startEdit(quarter.id)}
                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                title="Add rate"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer count */}
              <p className="mt-3 text-xs text-slate-400">
                {rates.length} of {quarters.length} quarters have rates configured
              </p>
            </>
          )}
        </div>

        {/* Close button */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateManagementModal;
