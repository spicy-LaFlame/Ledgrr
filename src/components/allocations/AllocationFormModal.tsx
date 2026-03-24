import { useState, useEffect, useMemo } from 'react';
import type { SalaryAllocation, Employee, Project, Quarter, EmployeeRate } from '../../db/schema';
import { calculateCost, calculateHoursFromFundedCost } from '../../hooks/useEmployees';
import { useProjectBudgetSummary } from '../../hooks/useProjectBudgetSummary';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../shared/Modal';

export type AllocationFormData = Omit<SalaryAllocation, 'id' | 'createdAt' | 'updatedAt'>;

interface AllocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AllocationFormData) => Promise<unknown>;
  allocation?: SalaryAllocation;
  mode: 'add' | 'edit';
  employees: Employee[];
  projects: Project[];
  quarters: Quarter[];
  rates: EmployeeRate[];
  currentFiscalYearId: string;
  checkDuplicate: (empId: string, projId: string, fyId: string, qId: string, excludeId?: string) => Promise<boolean>;
}

const AllocationFormModal: React.FC<AllocationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  allocation,
  mode,
  employees,
  projects,
  quarters,
  rates,
  currentFiscalYearId,
  checkDuplicate,
}) => {
  const [formData, setFormData] = useState<AllocationFormData>({
    employeeId: '',
    projectId: '',
    fiscalYearId: currentFiscalYearId,
    quarterId: '',
    budgetedHours: 0,
    actualHours: null,
    isInKind: false,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inputMode, setInputMode] = useState<'hours' | 'dollars'>('hours');
  const [dollarBudgeted, setDollarBudgeted] = useState<number>(0);
  const [dollarActual, setDollarActual] = useState<number | null>(null);

  useEffect(() => {
    if (allocation && mode === 'edit') {
      setFormData({
        employeeId: allocation.employeeId,
        projectId: allocation.projectId,
        fiscalYearId: allocation.fiscalYearId,
        quarterId: allocation.quarterId,
        budgetedHours: allocation.budgetedHours,
        actualHours: allocation.actualHours,
        isInKind: allocation.isInKind,
        notes: allocation.notes ?? '',
      });
    } else {
      setFormData({
        employeeId: employees[0]?.id ?? '',
        projectId: projects[0]?.id ?? '',
        fiscalYearId: currentFiscalYearId,
        quarterId: quarters[0]?.id ?? '',
        budgetedHours: 0,
        actualHours: null,
        isInKind: false,
        notes: '',
      });
    }
    setErrors({});
  }, [allocation, mode, employees, projects, quarters, currentFiscalYearId, isOpen]);

  // Cost preview
  const costPreview = useMemo(() => {
    if (!formData.employeeId || !formData.projectId || !formData.quarterId) return null;

    const rate = rates.find(r =>
      r.employeeId === formData.employeeId && r.quarterId === formData.quarterId
    ) ?? rates.find(r => r.employeeId === formData.employeeId);

    const project = projects.find(p => p.id === formData.projectId);

    if (!rate || !project) return null;

    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';
    const hours = formData.budgetedHours || 0;
    const budgetedCost = calculateCost(hours, rate, cap, capType);

    let actualCost = null;
    if (formData.actualHours !== null && formData.actualHours !== undefined) {
      actualCost = calculateCost(formData.actualHours, rate, cap, capType);
    }

    return { budgetedCost, actualCost, rate };
  }, [formData.employeeId, formData.projectId, formData.quarterId, formData.budgetedHours, formData.actualHours, rates, projects]);

  // Budget summary for selected project
  const budgetSummary = useProjectBudgetSummary(
    formData.projectId || undefined,
    formData.fiscalYearId,
    allocation?.id,
  );

  // Rate context for dollar-to-hours conversion
  const rateContext = useMemo(() => {
    if (!formData.employeeId || !formData.projectId || !formData.quarterId) return null;
    const rate = rates.find(r =>
      r.employeeId === formData.employeeId && r.quarterId === formData.quarterId
    ) ?? rates.find(r => r.employeeId === formData.employeeId);
    const project = projects.find(p => p.id === formData.projectId);
    if (!rate || !project) return null;
    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';
    return { rate, cap, capType };
  }, [formData.employeeId, formData.projectId, formData.quarterId, rates, projects]);

  const handleModeSwitch = (newMode: 'hours' | 'dollars') => {
    if (newMode === inputMode) return;
    if (newMode === 'dollars' && rateContext) {
      // Convert current hours to dollars
      const budgetedCost = formData.budgetedHours > 0
        ? calculateCost(formData.budgetedHours, rateContext.rate, rateContext.cap, rateContext.capType).fundedCost
        : 0;
      const actualCost = formData.actualHours !== null && formData.actualHours > 0
        ? calculateCost(formData.actualHours, rateContext.rate, rateContext.cap, rateContext.capType).fundedCost
        : null;
      setDollarBudgeted(Math.round(budgetedCost * 100) / 100);
      setDollarActual(actualCost !== null ? Math.round(actualCost * 100) / 100 : null);
    }
    setInputMode(newMode);
  };

  const handleDollarBudgetedChange = (value: number) => {
    setDollarBudgeted(value);
    if (rateContext && value > 0) {
      const hours = calculateHoursFromFundedCost(value, rateContext.rate, rateContext.cap, rateContext.capType);
      setFormData(prev => ({ ...prev, budgetedHours: hours }));
    } else {
      setFormData(prev => ({ ...prev, budgetedHours: 0 }));
    }
  };

  const handleDollarActualChange = (value: number | null) => {
    setDollarActual(value);
    if (rateContext && value !== null && value > 0) {
      const hours = calculateHoursFromFundedCost(value, rateContext.rate, rateContext.cap, rateContext.capType);
      setFormData(prev => ({ ...prev, actualHours: hours }));
    } else {
      setFormData(prev => ({ ...prev, actualHours: value === null ? null : 0 }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.quarterId) newErrors.quarterId = 'Quarter is required';
    if (inputMode === 'dollars') {
      if (dollarBudgeted <= 0) newErrors.budgetedHours = 'Budgeted amount must be greater than $0';
      if (!rateContext) newErrors.budgetedHours = 'Select employee, project, and quarter first';
    } else {
      if (formData.budgetedHours <= 0) newErrors.budgetedHours = 'Budgeted hours must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check for duplicate
    const isDuplicate = await checkDuplicate(
      formData.employeeId,
      formData.projectId,
      formData.fiscalYearId,
      formData.quarterId,
      allocation?.id
    );
    if (isDuplicate) {
      setErrors({ duplicate: 'An allocation already exists for this employee, project, and quarter.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save allocation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.duplicate) {
      setErrors(prev => ({ ...prev, duplicate: '' }));
    }
  };

  const footerButtons = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="allocation-form"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Allocation' : 'Save Changes'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Salary Allocation' : 'Edit Salary Allocation'}
      maxWidth="2xl"
      footer={footerButtons}
    >
      <form id="allocation-form" onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
            {errors.duplicate && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {errors.duplicate}
              </div>
            )}

            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} — {emp.role}</option>
                ))}
              </select>
              {errors.employeeId && <p className="mt-1 text-xs text-red-500">{errors.employeeId}</p>}
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project *</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                  errors.projectId ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select project</option>
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.code} — {proj.name}</option>
                ))}
              </select>
              {errors.projectId && <p className="mt-1 text-xs text-red-500">{errors.projectId}</p>}
            </div>

            {/* Quarter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quarter *</label>
              <select
                name="quarterId"
                value={formData.quarterId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                  errors.quarterId ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select quarter</option>
                {quarters.map(q => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
              {errors.quarterId && <p className="mt-1 text-xs text-red-500">{errors.quarterId}</p>}
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => handleModeSwitch('hours')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  inputMode === 'hours' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Hours
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('dollars')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  inputMode === 'dollars' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Dollars
              </button>
            </div>

            {/* Hours / Dollars Input */}
            {inputMode === 'hours' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budgeted Hours *</label>
                  <input
                    type="number"
                    name="budgetedHours"
                    value={formData.budgetedHours || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                      errors.budgetedHours ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.budgetedHours && <p className="mt-1 text-xs text-red-500">{errors.budgetedHours}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Actual Hours</label>
                  <input
                    type="number"
                    name="actualHours"
                    value={formData.actualHours ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        actualHours: val === '' ? null : parseFloat(val),
                      }));
                    }}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    placeholder="Not entered"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Budgeted Funded Cost ($) *</label>
                    <input
                      type="number"
                      value={dollarBudgeted || ''}
                      onChange={(e) => handleDollarBudgetedChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                        errors.budgetedHours ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.budgetedHours && <p className="mt-1 text-xs text-red-500">{errors.budgetedHours}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Actual Funded Cost ($)</label>
                    <input
                      type="number"
                      value={dollarActual ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleDollarActualChange(val === '' ? null : parseFloat(val));
                      }}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                      placeholder="Not entered"
                    />
                  </div>
                </div>
                {rateContext && dollarBudgeted > 0 && (
                  <p className="text-xs text-slate-500">
                    = {formData.budgetedHours.toFixed(2)} hours at ${(rateContext.rate.baseHourlyRate + rateContext.rate.benefitsRate * rateContext.cap).toFixed(2)}/hr effective rate
                  </p>
                )}
                {!rateContext && (
                  <p className="text-xs text-amber-600">
                    Select employee, project, and quarter to calculate hours
                  </p>
                )}
              </div>
            )}

            {/* In-Kind Toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">In-Kind Contribution</p>
                <p className="text-xs text-slate-500">Mark as in-kind rather than cash</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isInKind}
                onChange={(e) => setFormData(prev => ({ ...prev, isInKind: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 resize-none"
                placeholder="Optional notes..."
              />
            </div>

            {/* Cost Preview */}
            {costPreview && formData.budgetedHours > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Cost Preview</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-blue-600">Funded Cost</p>
                    <p className="text-sm font-bold text-blue-900">
                      {formatCurrency(costPreview.budgetedCost.fundedCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Hospital Covers</p>
                    <p className="text-sm font-bold text-blue-900">
                      {formatCurrency(costPreview.budgetedCost.hospitalCovers)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Total Cost</p>
                    <p className="text-sm font-bold text-blue-900">
                      {formatCurrency(costPreview.budgetedCost.totalCost)}
                    </p>
                  </div>
                </div>
                {costPreview.rate && (
                  <p className="text-xs text-blue-500 text-center">
                    Rate: ${costPreview.rate.baseHourlyRate.toFixed(2)} + ${costPreview.rate.benefitsRate.toFixed(2)}/hr
                  </p>
                )}
                {costPreview.actualCost && (
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs text-blue-600 text-center mb-1">Actual Cost</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <p className="text-sm font-bold text-blue-900">{formatCurrency(costPreview.actualCost.fundedCost)}</p>
                      <p className="text-sm font-bold text-blue-900">{formatCurrency(costPreview.actualCost.hospitalCovers)}</p>
                      <p className="text-sm font-bold text-blue-900">{formatCurrency(costPreview.actualCost.totalCost)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Budget Remainder */}
            {budgetSummary && formData.projectId && (() => {
              const isInKind = formData.isInKind;
              const fyBudget = isInKind ? budgetSummary.inKindFyBudget : budgetSummary.fyBudget;
              const alreadyAllocated = isInKind ? budgetSummary.inKindAllocated : budgetSummary.totalAllocated;
              const thisEntryCost = costPreview ? costPreview.budgetedCost.fundedCost : 0;
              const remainingAfter = fyBudget - alreadyAllocated - thisEntryCost;
              const pctUsedAfter = fyBudget > 0 ? ((alreadyAllocated + thisEntryCost) / fyBudget) * 100 : 0;

              if (fyBudget === 0) {
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500 text-center">
                      No {isInKind ? 'in-kind ' : ''}FY budget set for this project
                    </p>
                  </div>
                );
              }

              const colorClass = remainingAfter <= 0
                ? 'text-red-700'
                : remainingAfter < fyBudget * 0.2
                  ? 'text-amber-700'
                  : 'text-emerald-700';
              const bgClass = remainingAfter <= 0
                ? 'bg-red-50 border-red-200'
                : remainingAfter < fyBudget * 0.2
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200';

              return (
                <div className={`p-4 border rounded-xl space-y-2 ${bgClass}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'inherit' }}>
                    {isInKind ? 'In-Kind ' : ''}FY Budget Remaining
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-slate-500">FY Budget</p>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(fyBudget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Already Allocated</p>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(alreadyAllocated)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Remaining After This</p>
                      <p className={`text-sm font-bold ${colorClass}`}>
                        {remainingAfter < 0
                          ? `Over by ${formatCurrency(Math.abs(remainingAfter))}`
                          : formatCurrency(remainingAfter)
                        }
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-white/60 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        remainingAfter <= 0 ? 'bg-red-500' : remainingAfter < fyBudget * 0.2 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pctUsedAfter, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {pctUsedAfter.toFixed(0)}% of {isInKind ? 'in-kind ' : ''}FY budget allocated
                  </p>
                </div>
              );
            })()}
          </div>
      </form>
    </Modal>
  );
};

export default AllocationFormModal;
