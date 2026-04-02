import { useState, useMemo, useCallback } from 'react';
import { Plus, Pencil, Trash2, TableProperties, Receipt } from 'lucide-react';
import { useExpenses, useExpenseCategories, useFiscalPeriods } from '../hooks/useAllocations';
import { useProjects } from '../hooks/useProjects';
import type { Expense, PaymentMethod } from '../db/schema';
import ExpenseFormModal, { type ExpenseFormData } from '../components/expenses/ExpenseFormModal';
import BulkExpenseModal from '../components/expenses/BulkExpenseModal';
import { formatCurrency } from '../utils/formatters';
import { useSort, type SortColumnDef } from '../hooks/useSort';
import { FilterBar, type FilterValues } from '../components/shared/FilterBar';
import { SortableHeader } from '../components/shared/SortableHeader';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { EmptyState } from '../components/shared/EmptyState';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/shared/Pagination';

const paymentMethodBadges: Record<PaymentMethod, { label: string; variant: 'info' | 'success' | 'warning' | 'purple' }> = {
  'corporate-card': { label: 'Corporate Card', variant: 'info' },
  'direct-billing': { label: 'Direct Billing', variant: 'success' },
  'invoice': { label: 'Invoice', variant: 'warning' },
  'employee': { label: 'Employee', variant: 'purple' },
};

const Expenses: React.FC = () => {
  const { currentFiscalYear, getQuartersForYear } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';
  const quarters = getQuartersForYear(fiscalYearId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({
    quarter: [],
    project: [],
    category: [],
  });

  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setFilterValues(prev => ({ ...prev, [key]: values }));
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { expenses, addExpense, updateExpense, deleteExpense, bulkAddExpenses } = useExpenses({
    fiscalYearId: fiscalYearId || undefined,
  });
  const categories = useExpenseCategories();
  const { projects } = useProjects();

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (filterValues.quarter.length > 0 && !filterValues.quarter.includes(e.quarterId)) return false;
      if (filterValues.project.length > 0 && !filterValues.project.includes(e.projectId)) return false;
      if (filterValues.category.length > 0 && !filterValues.category.includes(e.categoryId)) return false;
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
  }, [expenses, filterValues, searchQuery, projects]);

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

  const getProjectCode = (id: string) => projects.find(p => p.id === id)?.code ?? '\u2014';
  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name ?? 'Unknown';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? 'Unknown';
  const getQuarterName = (id: string) => quarters.find(q => q.id === id)?.name ?? '\u2014';

  const sortColumns: SortColumnDef<Expense>[] = useMemo(() => [
    { key: 'project', accessor: (e) => getProjectName(e.projectId), type: 'string' },
    { key: 'category', accessor: (e) => getCategoryName(e.categoryId), type: 'string' },
    { key: 'quarter', accessor: (e) => getQuarterName(e.quarterId), type: 'string' },
    { key: 'description', accessor: (e) => e.description, type: 'string' },
    { key: 'budgeted', accessor: (e) => e.budgetedAmount, type: 'number' },
    { key: 'actual', accessor: (e) => e.actualAmount, type: 'number' },
    { key: 'variance', accessor: (e) => e.actualAmount !== null ? e.budgetedAmount - e.actualAmount : null, type: 'number' },
  ], [projects, categories, quarters]);

  const { sortedData: sortedExpenses, sortConfig, requestSort } = useSort({
    data: filteredExpenses,
    columns: sortColumns,
  });

  const pagination = usePagination(sortedExpenses);

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
      <PageHeader
        title="Expenses"
        subtitle={`Track non-salary project expenses \u2014 ${currentFiscalYear?.name ?? 'No FY'}`}
        actions={
          <>
            <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Expense
            </Button>
            <Button variant="secondary" onClick={() => setShowBulkAddModal(true)} icon={<TableProperties className="w-4 h-4" />}>
              Bulk Add
            </Button>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Budgeted</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{formatCurrency(summary.totalBudgeted)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Actual</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{formatCurrency(summary.totalActual)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Variance</p>
          <p className={`text-2xl font-bold mt-1 ${summary.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.variance)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Expense Items</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{summary.itemCount}</p>
        </Card>
      </div>

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search description or project..."
        filters={[
          {
            key: 'quarter',
            label: 'Quarter',
            placeholder: 'All Quarters',
            options: quarters.map(q => ({ value: q.id, label: q.name })),
          },
          {
            key: 'project',
            label: 'Project',
            placeholder: 'All Projects',
            options: activeProjects.map(p => ({ value: p.id, label: `${p.code} \u2014 ${p.name}` })),
          },
          {
            key: 'category',
            label: 'Category',
            placeholder: 'All Categories',
            options: categories.map(cat => ({ value: cat.id, label: cat.name })),
          },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        resultCount={filteredExpenses.length}
        resultLabel={`expense${filteredExpenses.length !== 1 ? 's' : ''}`}
        totalCount={expenses.length}
      />

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <SortableHeader label="Project" sortKey="project" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Category" sortKey="category" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Quarter" sortKey="quarter" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Description" sortKey="description" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Budgeted" sortKey="budgeted" currentSort={sortConfig} onSort={requestSort} align="right" />
                <SortableHeader label="Actual" sortKey="actual" currentSort={sortConfig} onSort={requestSort} align="right" />
                <SortableHeader label="Variance" sortKey="variance" currentSort={sortConfig} onSort={requestSort} align="right" />
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={Receipt}
                      title="No expenses found"
                      description="Add an expense or adjust your filters"
                      actionLabel="Add Expense"
                      onAction={() => setShowAddModal(true)}
                    />
                  </td>
                </tr>
              ) : (
                pagination.pageItems.map((e) => {
                  const variance = e.actualAmount !== null ? e.budgetedAmount - e.actualAmount : null;
                  const pmBadge = e.paymentMethod ? paymentMethodBadges[e.paymentMethod] : null;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors duration-150">
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
                        <span className="text-sm font-medium text-cyan-900">{formatCurrency(e.budgetedAmount)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-cyan-900">
                          {e.actualAmount !== null ? formatCurrency(e.actualAmount) : <span className="text-slate-300">{'\u2014'}</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {variance !== null ? (
                          <span className={`text-sm font-medium ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(variance)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">{'\u2014'}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {pmBadge ? (
                          <Badge variant={pmBadge.variant}>{pmBadge.label}</Badge>
                        ) : (
                          <span className="text-xs text-slate-300">{'\u2014'}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(e)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Edit expense"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          {deleteConfirmId === e.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(e.id)}
                                className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(e.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
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
        <Pagination pagination={pagination} noun="expenses" />
      </Card>

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

      <BulkExpenseModal
        isOpen={showBulkAddModal}
        onClose={() => setShowBulkAddModal(false)}
        onSubmit={bulkAddExpenses}
        projects={activeProjects}
        categories={categories}
        quarters={quarters}
        currentFiscalYearId={fiscalYearId}
      />
    </div>
  );
};

export default Expenses;
