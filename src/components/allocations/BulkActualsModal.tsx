import { useState, useMemo, useEffect } from 'react';
import type { SalaryAllocation, Employee, Project, Quarter, EmployeeRate } from '../../db/schema';
import { calculateCost } from '../../hooks/useEmployees';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../shared/Modal';

interface ActualRow {
  id: string;
  employeeName: string;
  budgetedHours: number;
  budgetedCost: number;
  actualHours: number | null;
  actualCost: number;
  originalActualHours: number | null;
  changed: boolean;
}

interface BulkActualsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: { id: string; actualHours: number | null }[]) => Promise<unknown>;
  allocations: SalaryAllocation[];
  employees: Employee[];
  projects: Project[];
  quarters: Quarter[];
  rates: EmployeeRate[];
}

const BulkActualsModal: React.FC<BulkActualsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  allocations,
  employees,
  projects,
  quarters,
  rates,
}) => {
  const [projectId, setProjectId] = useState('');
  const [quarterId, setQuarterId] = useState('');
  const [rows, setRows] = useState<ActualRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  const filteredAllocations = useMemo(() => {
    if (!projectId || !quarterId) return [];
    return allocations.filter(a => a.projectId === projectId && a.quarterId === quarterId);
  }, [allocations, projectId, quarterId]);

  const getCost = (employeeId: string, hours: number) => {
    const project = projects.find(p => p.id === projectId);
    const rate = rates.find(r => r.employeeId === employeeId && r.quarterId === quarterId)
      ?? rates.find(r => r.employeeId === employeeId);
    if (!rate || !project || hours <= 0) return 0;
    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';
    return calculateCost(hours, rate, cap, capType).fundedCost;
  };

  useEffect(() => {
    const newRows: ActualRow[] = filteredAllocations.map(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      return {
        id: a.id,
        employeeName: emp?.name ?? 'Unknown',
        budgetedHours: a.budgetedHours,
        budgetedCost: getCost(a.employeeId, a.budgetedHours),
        actualHours: a.actualHours,
        actualCost: a.actualHours !== null ? getCost(a.employeeId, a.actualHours) : 0,
        originalActualHours: a.actualHours,
        changed: false,
      };
    });
    setRows(newRows);
  }, [filteredAllocations, employees, projectId, quarterId]);

  const updateActualHours = (index: number, value: number | null) => {
    setRows(prev => {
      const next = [...prev];
      const row = { ...next[index] };
      row.actualHours = value;
      row.actualCost = value !== null ? getCost(
        filteredAllocations[index].employeeId, value
      ) : 0;
      row.changed = value !== row.originalActualHours;
      next[index] = row;
      return next;
    });
  };

  const changedRows = rows.filter(r => r.changed);
  const enteredCount = rows.filter(r => r.actualHours !== null).length;

  const handleSubmit = async () => {
    if (changedRows.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit(changedRows.map(r => ({ id: r.id, actualHours: r.actualHours })));
      onClose();
    } catch {
      // Error handled silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerContent = (
    <>
      <p className="text-sm text-slate-600">
        {enteredCount} of {rows.length} actuals entered
        {changedRows.length > 0 && (
          <span className="text-blue-600 ml-2">({changedRows.length} changed)</span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || changedRows.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enter Actual Hours"
      maxWidth="2xl"
      footer={footerContent}
    >
          {/* Filters */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project *</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  <option value="">Select project</option>
                  {activeProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quarter *</label>
                <select
                  value={quarterId}
                  onChange={e => setQuarterId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  <option value="">Select quarter</option>
                  {quarters.map(q => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {projectId && quarterId && (
            <div className="p-6">
              {rows.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No allocations found for this project and quarter.</p>
                  <p className="text-xs text-slate-400 mt-1">Create allocations first using Bulk Add.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-24">Budget Hrs</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-32">Budget Cost</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-28">Actual Hrs</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-32">Actual Cost</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-28">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row, i) => {
                        const variance = row.actualHours !== null
                          ? row.budgetedCost - row.actualCost
                          : null;
                        return (
                          <tr key={row.id} className={row.changed ? 'bg-blue-50' : ''}>
                            <td className="px-3 py-2">
                              <span className="text-sm text-slate-900">{row.employeeName}</span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="text-sm text-slate-600">{row.budgetedHours}</span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="text-sm text-slate-600">{formatCurrency(row.budgetedCost)}</span>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={row.actualHours ?? ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  updateActualHours(i, val === '' ? null : parseFloat(val));
                                }}
                                min="0"
                                step="0.01"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                                placeholder="—"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="text-sm text-slate-700">
                                {row.actualHours !== null ? formatCurrency(row.actualCost) : '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              {variance !== null ? (
                                <span className={`text-sm font-medium ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {formatCurrency(variance)}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
    </Modal>
  );
};

export default BulkActualsModal;
