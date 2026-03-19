import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { SalaryAllocation, Employee, Project, Quarter, EmployeeRate } from '../../db/schema';
import { calculateCost } from '../../hooks/useEmployees';

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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.quarterId) newErrors.quarterId = 'Quarter is required';
    if (formData.budgetedHours <= 0) newErrors.budgetedHours = 'Budgeted hours must be greater than 0';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === 'add' ? 'Add Allocation' : 'Edit Allocation'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
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
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
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
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
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
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
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

            {/* Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budgeted Hours *</label>
                <input
                  type="number"
                  name="budgetedHours"
                  value={formData.budgetedHours || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
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
                  step="0.5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Not entered"
                />
              </div>
            </div>

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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
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
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Allocation' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocationFormModal;
