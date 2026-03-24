import { useState, useMemo } from 'react';
import { Plus, Users, Trash2 } from 'lucide-react';
import type { Employee, Project, Quarter, EmployeeRate } from '../../db/schema';
import { calculateCost } from '../../hooks/useEmployees';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../shared/Modal';

interface BulkAllocationRow {
  employeeId: string;
  employeeName: string;
  budgetedHours: number;
  fundedCost: number;
  notes: string;
}

interface BulkAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: {
    employeeId: string;
    projectId: string;
    fiscalYearId: string;
    quarterId: string;
    budgetedHours: number;
    actualHours: null;
    isInKind: boolean;
    notes: string;
  }[]) => Promise<unknown>;
  employees: Employee[];
  projects: Project[];
  quarters: Quarter[];
  rates: EmployeeRate[];
  currentFiscalYearId: string;
  existingAllocations: { employeeId: string; projectId: string; quarterId: string }[];
}

const BulkAllocationModal: React.FC<BulkAllocationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  projects,
  quarters,
  rates,
  currentFiscalYearId,
  existingAllocations,
}) => {
  const [projectId, setProjectId] = useState('');
  const [quarterId, setQuarterId] = useState('');
  const [isInKind, setIsInKind] = useState(false);
  const [step, setStep] = useState<'pick' | 'entry'>('pick');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState<BulkAllocationRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [globalError, setGlobalError] = useState('');

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');
  const project = projects.find(p => p.id === projectId);

  const alreadyAllocatedSet = useMemo(() => {
    return new Set(
      existingAllocations
        .filter(a => a.projectId === projectId && a.quarterId === quarterId)
        .map(a => a.employeeId)
    );
  }, [existingAllocations, projectId, quarterId]);

  const employeesByOrg = useMemo(() => {
    const groups: Record<string, Employee[]> = {};
    for (const emp of employees) {
      const key = emp.organizationId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(emp);
    }
    return groups;
  }, [employees]);

  const innovationTeamIds = useMemo(
    () => new Set(employees.filter(e => e.isInnovationTeam).map(e => e.id)),
    [employees]
  );

  const getCostForEmployee = (employeeId: string, hours: number) => {
    if (!project || hours <= 0) return 0;
    const rate = rates.find(r => r.employeeId === employeeId && r.quarterId === quarterId)
      ?? rates.find(r => r.employeeId === employeeId);
    if (!rate) return 0;
    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';
    return calculateCost(hours, rate, cap, capType).fundedCost;
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInnovation = () => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      for (const id of innovationTeamIds) {
        if (!alreadyAllocatedSet.has(id)) next.add(id);
      }
      return next;
    });
  };

  const proceedToEntry = () => {
    if (!projectId || !quarterId) {
      setGlobalError('Select a project and quarter first.');
      return;
    }
    if (selectedEmployeeIds.size === 0) {
      setGlobalError('Select at least one employee.');
      return;
    }
    setGlobalError('');
    const newRows: BulkAllocationRow[] = Array.from(selectedEmployeeIds).map(id => {
      const emp = employees.find(e => e.id === id)!;
      return { employeeId: id, employeeName: emp.name, budgetedHours: 0, fundedCost: 0, notes: '' };
    });
    setRows(newRows);
    setStep('entry');
  };

  const updateRow = (index: number, field: 'budgetedHours' | 'notes', value: number | string) => {
    setRows(prev => {
      const next = [...prev];
      const row = { ...next[index] };
      if (field === 'budgetedHours') {
        row.budgetedHours = value as number;
        row.fundedCost = getCostForEmployee(row.employeeId, value as number);
      } else {
        row.notes = value as string;
      }
      next[index] = row;
      return next;
    });
    if (errors[index]) {
      setErrors(prev => { const n = { ...prev }; delete n[index]; return n; });
    }
  };

  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const backToPicker = () => {
    setStep('pick');
    setSelectedEmployeeIds(new Set(rows.map(r => r.employeeId)));
  };

  const totalCost = rows.reduce((sum, r) => sum + r.fundedCost, 0);

  const handleSubmit = async () => {
    const newErrors: Record<number, string> = {};
    rows.forEach((row, i) => {
      if (row.budgetedHours <= 0) newErrors[i] = 'Hours must be > 0';
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        rows.map(row => ({
          employeeId: row.employeeId,
          projectId,
          fiscalYearId: currentFiscalYearId,
          quarterId,
          budgetedHours: row.budgetedHours,
          actualHours: null,
          isInKind,
          notes: row.notes,
        }))
      );
      onClose();
      resetState();
    } catch {
      setGlobalError('Failed to save allocations.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setProjectId('');
    setQuarterId('');
    setIsInKind(false);
    setStep('pick');
    setSelectedEmployeeIds(new Set());
    setRows([]);
    setErrors({});
    setGlobalError('');
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const footerContent = step === 'entry' ? (
    <>
      <p className="text-sm text-slate-600">
        {rows.length} row{rows.length !== 1 ? 's' : ''} — Total funded cost: <span className="font-semibold">{formatCurrency(totalCost)}</span>
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || rows.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : `Save All (${rows.length})`}
        </button>
      </div>
    </>
  ) : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Add Allocations"
      maxWidth="2xl"
      footer={footerContent}
    >
          {/* Shared context */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project *</label>
                <select
                  value={projectId}
                  onChange={e => { setProjectId(e.target.value); setStep('pick'); }}
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
                  onChange={e => { setQuarterId(e.target.value); setStep('pick'); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  <option value="">Select quarter</option>
                  {quarters.map(q => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInKind}
                    onChange={e => setIsInKind(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">In-Kind</span>
                </label>
              </div>
            </div>
          </div>

          {globalError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {globalError}
            </div>
          )}

          {/* Step: Employee Picker */}
          {step === 'pick' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Select employees to allocate</p>
                <button
                  type="button"
                  onClick={selectAllInnovation}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Select All Innovation Team
                </button>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {Object.entries(employeesByOrg).map(([orgId, emps]) => (
                  <div key={orgId}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {orgId}
                    </p>
                    <div className="space-y-1">
                      {emps.map(emp => {
                        const isAllocated = alreadyAllocatedSet.has(emp.id);
                        return (
                          <label
                            key={emp.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isAllocated
                                ? 'bg-slate-50 opacity-50 cursor-not-allowed'
                                : 'hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedEmployeeIds.has(emp.id)}
                              onChange={() => !isAllocated && toggleEmployee(emp.id)}
                              disabled={isAllocated}
                              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-500/30 focus:border-cyan-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm text-slate-900">{emp.name}</span>
                              <span className="text-xs text-slate-400 ml-2">{emp.role}</span>
                            </div>
                            {isAllocated && (
                              <span className="text-xs text-slate-400">(already allocated)</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-slate-500">
                  {selectedEmployeeIds.size} employee{selectedEmployeeIds.size !== 1 ? 's' : ''} selected
                </p>
                <button
                  type="button"
                  onClick={proceedToEntry}
                  disabled={selectedEmployeeIds.size === 0 || !projectId || !quarterId}
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step: Entry Table */}
          {step === 'entry' && (
            <div className="p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-32">Budgeted Hrs</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-36">Funded Cost</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase w-40">Notes</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, i) => (
                      <tr key={row.employeeId} className={errors[i] ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2">
                          <span className="text-sm text-slate-900">{row.employeeName}</span>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.budgetedHours || ''}
                            onChange={e => updateRow(i, 'budgetedHours', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            className={`w-full px-2 py-1.5 border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                              errors[i] ? 'border-red-400' : 'border-slate-300'
                            }`}
                            placeholder="0"
                            autoFocus={i === 0}
                          />
                          {errors[i] && <p className="text-xs text-red-500 mt-0.5">{errors[i]}</p>}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm text-slate-700">{formatCurrency(row.fundedCost)}</span>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={e => updateRow(i, 'notes', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                            placeholder="Optional"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={backToPicker}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add More Employees
              </button>
            </div>
          )}
    </Modal>
  );
};

export default BulkAllocationModal;
