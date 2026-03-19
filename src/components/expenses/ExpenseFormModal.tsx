import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Expense, ExpenseCategory, Project, Quarter, PaymentMethod } from '../../db/schema';
import { useProjectBudgetSummary } from '../../hooks/useProjectBudgetSummary';

export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<unknown>;
  expense?: Expense;
  mode: 'add' | 'edit';
  projects: Project[];
  categories: ExpenseCategory[];
  quarters: Quarter[];
  currentFiscalYearId: string;
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'corporate-card', label: 'Corporate Card' },
  { value: 'direct-billing', label: 'Direct Billing' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'employee', label: 'Employee' },
];

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expense,
  mode,
  projects,
  categories,
  quarters,
  currentFiscalYearId,
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    projectId: '',
    categoryId: '',
    fiscalYearId: currentFiscalYearId,
    quarterId: '',
    description: '',
    budgetedAmount: 0,
    actualAmount: null,
    paymentMethod: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Budget summary for selected project
  const budgetSummary = useProjectBudgetSummary(
    formData.projectId || undefined,
    formData.fiscalYearId,
    undefined,
    expense?.id,
  );

  useEffect(() => {
    if (expense && mode === 'edit') {
      setFormData({
        projectId: expense.projectId,
        categoryId: expense.categoryId,
        fiscalYearId: expense.fiscalYearId,
        quarterId: expense.quarterId,
        description: expense.description,
        budgetedAmount: expense.budgetedAmount,
        actualAmount: expense.actualAmount,
        paymentMethod: expense.paymentMethod,
      });
    } else {
      setFormData({
        projectId: projects[0]?.id ?? '',
        categoryId: categories[0]?.id ?? '',
        fiscalYearId: currentFiscalYearId,
        quarterId: quarters[0]?.id ?? '',
        description: '',
        budgetedAmount: 0,
        actualAmount: null,
        paymentMethod: undefined,
      });
    }
    setErrors({});
  }, [expense, mode, projects, categories, quarters, currentFiscalYearId, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.quarterId) newErrors.quarterId = 'Quarter is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.budgetedAmount <= 0) newErrors.budgetedAmount = 'Budgeted amount must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save expense:', error);
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === 'add' ? 'Add Expense' : 'Edit Expense'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
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

            {/* Category + Quarter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.categoryId ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
              </div>
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
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none ${
                  errors.description ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="e.g., Conference travel, Software license..."
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budgeted Amount ($) *</label>
                <input
                  type="number"
                  name="budgetedAmount"
                  value={formData.budgetedAmount || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.budgetedAmount ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.budgetedAmount && <p className="mt-1 text-xs text-red-500">{errors.budgetedAmount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Actual Amount ($)</label>
                <input
                  type="number"
                  name="actualAmount"
                  value={formData.actualAmount ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      actualAmount: val === '' ? null : parseFloat(val),
                    }));
                  }}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Not entered"
                />
              </div>
            </div>

            {/* Budget Remainder */}
            {budgetSummary && formData.projectId && (() => {
              const formatCurrency = (amount: number): string =>
                new Intl.NumberFormat('en-CA', {
                  style: 'currency', currency: 'CAD',
                  minimumFractionDigits: 0, maximumFractionDigits: 0,
                }).format(amount);

              const fyBudget = budgetSummary.fyBudget;
              const alreadyAllocated = budgetSummary.totalAllocated;
              const thisEntryAmount = formData.budgetedAmount || 0;
              const remainingAfter = fyBudget - alreadyAllocated - thisEntryAmount;
              const pctUsedAfter = fyBudget > 0 ? ((alreadyAllocated + thisEntryAmount) / fyBudget) * 100 : 0;

              if (fyBudget === 0) {
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500 text-center">No FY budget set for this project</p>
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
                  <p className="text-xs font-semibold uppercase tracking-wide">FY Budget Remaining</p>
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
                  <div className="w-full bg-white/60 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        remainingAfter <= 0 ? 'bg-red-500' : remainingAfter < fyBudget * 0.2 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pctUsedAfter, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {pctUsedAfter.toFixed(0)}% of FY budget allocated
                  </p>
                </div>
              );
            })()}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    paymentMethod: val === '' ? undefined : val as PaymentMethod,
                  }));
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Not specified</option>
                {paymentMethodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
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
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Expense' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
