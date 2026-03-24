import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ExpenseCategory, Project, Quarter, PaymentMethod } from '../../db/schema';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../shared/Modal';

interface ExpenseRow {
  categoryId: string;
  description: string;
  budgetedAmount: number;
  actualAmount: number | null;
  paymentMethod?: PaymentMethod;
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'corporate-card', label: 'Corporate Card' },
  { value: 'direct-billing', label: 'Direct Billing' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'employee', label: 'Employee' },
];

interface BulkExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: {
    projectId: string;
    categoryId: string;
    fiscalYearId: string;
    quarterId: string;
    description: string;
    budgetedAmount: number;
    actualAmount: number | null;
    paymentMethod?: PaymentMethod;
  }[]) => Promise<unknown>;
  projects: Project[];
  categories: ExpenseCategory[];
  quarters: Quarter[];
  currentFiscalYearId: string;
}

const emptyRow = (): ExpenseRow => ({
  categoryId: '',
  description: '',
  budgetedAmount: 0,
  actualAmount: null,
  paymentMethod: undefined,
});

const BulkExpenseModal: React.FC<BulkExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  categories,
  quarters,
  currentFiscalYearId,
}) => {
  const [projectId, setProjectId] = useState('');
  const [quarterId, setQuarterId] = useState('');
  const [rows, setRows] = useState<ExpenseRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  const updateRow = (index: number, field: keyof ExpenseRow, value: string | number | null | undefined) => {
    setRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    // Clear row-specific error
    const errorKey = `${index}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => { const n = { ...prev }; delete n[errorKey]; return n; });
    }
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const totalBudgeted = rows.reduce((sum, r) => sum + r.budgetedAmount, 0);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!projectId) newErrors.projectId = 'Required';
    if (!quarterId) newErrors.quarterId = 'Required';

    rows.forEach((row, i) => {
      if (!row.categoryId) newErrors[`${i}-categoryId`] = 'Required';
      if (!row.description.trim()) newErrors[`${i}-description`] = 'Required';
      if (row.budgetedAmount <= 0) newErrors[`${i}-budgetedAmount`] = '> $0';
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        rows.map(row => ({
          projectId,
          categoryId: row.categoryId,
          fiscalYearId: currentFiscalYearId,
          quarterId,
          description: row.description,
          budgetedAmount: row.budgetedAmount,
          actualAmount: row.actualAmount,
          paymentMethod: row.paymentMethod,
        }))
      );
      onClose();
      resetState();
    } catch {
      setErrors({ global: 'Failed to save expenses.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setProjectId('');
    setQuarterId('');
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const footerContent = (
    <>
      <p className="text-sm text-slate-600">
        {rows.length} row{rows.length !== 1 ? 's' : ''} — Total budgeted: <span className="font-semibold">{formatCurrency(totalBudgeted)}</span>
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
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : `Save All (${rows.length})`}
        </button>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Add Expenses"
      maxWidth="2xl"
      footer={footerContent}
    >
          {/* Shared context */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project *</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                    errors.projectId ? 'border-red-500' : 'border-slate-300'
                  }`}
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
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                    errors.quarterId ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select quarter</option>
                  {quarters.map(q => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {errors.global && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.global}
            </div>
          )}

          {/* Entry Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-500 uppercase w-36">Category</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-28">Budgeted $</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-slate-500 uppercase w-28">Actual $</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-500 uppercase w-36">Payment</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td className="px-2 py-2">
                        <select
                          value={row.categoryId}
                          onChange={e => updateRow(i, 'categoryId', e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                            errors[`${i}-categoryId`] ? 'border-red-400' : 'border-slate-300'
                          }`}
                        >
                          <option value="">Select</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={row.description}
                          onChange={e => updateRow(i, 'description', e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                            errors[`${i}-description`] ? 'border-red-400' : 'border-slate-300'
                          }`}
                          placeholder="Description..."
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={row.budgetedAmount || ''}
                          onChange={e => updateRow(i, 'budgetedAmount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className={`w-full px-2 py-1.5 border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
                            errors[`${i}-budgetedAmount`] ? 'border-red-400' : 'border-slate-300'
                          }`}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={row.actualAmount ?? ''}
                          onChange={e => {
                            const val = e.target.value;
                            updateRow(i, 'actualAmount', val === '' ? null : parseFloat(val));
                          }}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={row.paymentMethod ?? ''}
                          onChange={e => updateRow(i, 'paymentMethod', e.target.value === '' ? undefined : e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                        >
                          <option value="">—</option>
                          {paymentMethodOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          disabled={rows.length <= 1}
                          className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
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
              onClick={addRow}
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>
    </Modal>
  );
};

export default BulkExpenseModal;
