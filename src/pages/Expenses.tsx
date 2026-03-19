import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useExpenses, useExpenseCategories, useFiscalPeriods } from '../hooks/useAllocations';
import { useProjects } from '../hooks/useProjects';
import type { Expense, PaymentMethod } from '../db/schema';
import ExpenseFormModal, { type ExpenseFormData } from '../components/expenses/ExpenseFormModal';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const paymentMethodLabels: Record<PaymentMethod, { label: string; bg: string; text: string }> = {
  'corporate-card': { label: 'Corporate Card', bg: 'bg-blue-100', text: 'text-blue-700' },
  'direct-billing': { label: 'Direct Billing', bg: 'bg-green-100', text: 'text-green-700' },
  'invoice': { label: 'Invoice', bg: 'bg-amber-100', text: 'text-amber-700' },
  'employee': { label: 'Employee', bg: 'bg-purple-100', text: 'text-purple-700' },
};

const Expenses: React.FC = () => {
  const { currentFiscalYear, getQuartersForYear } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';
  const quarters = getQuartersForYear(fiscalYearId);

  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses({
    fiscalYearId: fiscalYearId || undefined,
  });
  const categories = useExpenseCategories();
  const { projects } = useProjects();

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (quarterFilter !== 'all' && e.quarterId !== quarterFilter) return false;
      if (projectFilter !== 'all' && e.projectId !== projectFilter) return false;
      if (categoryFilter !== 'all' && e.categoryId !== categoryFilter) return false;
      if (searchQuery) {
        const proj = projects.find(p => p.id === e.projectId);
        const query = searchQuery.toLowerCase();
        return (
          e.description.toLowerCase().includes(query) ||
          proj?.name.toLowerCase().includes(query) ||
          proj?.code.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [expenses, quarterFilter, projectFilter, categoryFilter, searchQuery, projects]);

  // Summary metrics
  const summary = useMemo(() => {
    let totalBudgeted = 0;
    let totalActual = 0;
    let itemCount = filteredExpenses.length;

    for (const e of filteredExpenses) {
      totalBudgeted += e.budgetedAmount;
      if (e.actualAmount !== null) totalActual += e.actualAmount;
    }

    return {
      totalBudgeted,
      totalActual,
      variance: totalBudgeted - totalActual,
      itemCount,
    };
  }, [filteredExpenses]);

  const getProjectCode = (id: string) => projects.find(p => p.id === id)?.code ?? '—';
  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name ?? 'Unknown';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? 'Unknown';
  const getQuarterName = (id: string) => quarters.find(q => q.id === id)?.name ?? '—';

  const handleAdd = async (data: ExpenseFormData) => {
    await addExpense(data);
  };

  const handleEdit = async (data: ExpenseFormData) => {
    if (selectedExpense) {
      await updateExpense(selectedExpense.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    setDeleteConfirmId(null);
  };

  const openEditModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track non-salary project expenses — {currentFiscalYear?.name ?? 'No FY'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Budgeted</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalBudgeted)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Actual</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalActual)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Variance</p>
          <p className={`text-2xl font-bold mt-1 ${summary.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.variance)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Expense Items</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.itemCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search description or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <select
          value={quarterFilter}
          onChange={(e) => setQuarterFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Quarters</option>
          {quarters.map(q => (
            <option key={q.id} value={q.id}>{q.name}</option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Projects</option>
          {activeProjects.map(p => (
            <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarter</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Budgeted</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Variance</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium text-slate-500">No expenses found</p>
                      <p className="text-xs text-slate-400 mt-1">Add an expense or adjust your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => {
                  const variance = e.actualAmount !== null ? e.budgetedAmount - e.actualAmount : null;
                  const pmStyle = e.paymentMethod ? paymentMethodLabels[e.paymentMethod] : null;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{getProjectCode(e.projectId)}</span>
                          <div className="text-xs text-slate-400">{getProjectName(e.projectId)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{getCategoryName(e.categoryId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{getQuarterName(e.quarterId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700 max-w-[200px] truncate block">{e.description}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(e.budgetedAmount)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-slate-900">
                          {e.actualAmount !== null ? formatCurrency(e.actualAmount) : <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {variance !== null ? (
                          <span className={`text-sm font-medium ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(variance)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {pmStyle ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${pmStyle.bg} ${pmStyle.text}`}>
                            {pmStyle.label}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(e)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit expense"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          {deleteConfirmId === e.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(e.id)}
                                className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(e.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-slate-500">
        {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
      </div>

      {/* Add Modal */}
      <ExpenseFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        mode="add"
        projects={activeProjects}
        categories={categories}
        quarters={quarters}
        currentFiscalYearId={fiscalYearId}
      />

      {/* Edit Modal */}
      {selectedExpense && (
        <ExpenseFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpense(null);
          }}
          onSubmit={handleEdit}
          expense={selectedExpense}
          mode="edit"
          projects={activeProjects}
          categories={categories}
          quarters={quarters}
          currentFiscalYearId={fiscalYearId}
        />
      )}
    </div>
  );
};

export default Expenses;
