import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useAllocations, useFiscalPeriods } from '../hooks/useAllocations';
import { useEmployees, useEmployeeRates, calculateCost } from '../hooks/useEmployees';
import { useProjects } from '../hooks/useProjects';
import type { SalaryAllocation } from '../db/schema';
import AllocationFormModal, { type AllocationFormData } from '../components/allocations/AllocationFormModal';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Allocations: React.FC = () => {
  const { currentFiscalYear, getQuartersForYear } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';
  const quarters = getQuartersForYear(fiscalYearId);

  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<SalaryAllocation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { allocations, addAllocation, updateAllocation, deleteAllocation, checkDuplicate } = useAllocations({
    fiscalYearId: fiscalYearId || undefined,
  });
  const { employees } = useEmployees();
  const { projects } = useProjects();
  const { rates } = useEmployeeRates(undefined, fiscalYearId);

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      if (quarterFilter !== 'all' && a.quarterId !== quarterFilter) return false;
      if (projectFilter !== 'all' && a.projectId !== projectFilter) return false;
      if (employeeFilter !== 'all' && a.employeeId !== employeeFilter) return false;
      if (searchQuery) {
        const emp = employees.find(e => e.id === a.employeeId);
        const proj = projects.find(p => p.id === a.projectId);
        const query = searchQuery.toLowerCase();
        return (
          emp?.name.toLowerCase().includes(query) ||
          proj?.name.toLowerCase().includes(query) ||
          proj?.code.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allocations, quarterFilter, projectFilter, employeeFilter, searchQuery, employees, projects]);

  // Cost calculations per allocation
  const getAllocationCost = (a: SalaryAllocation) => {
    const rate = rates.find(r =>
      r.employeeId === a.employeeId && r.quarterId === a.quarterId
    ) ?? rates.find(r => r.employeeId === a.employeeId);
    const project = projects.find(p => p.id === a.projectId);
    if (!rate || !project) return { budgeted: 0, actual: 0 };

    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';
    const budgeted = calculateCost(a.budgetedHours, rate, cap, capType).fundedCost;
    const actual = a.actualHours !== null ? calculateCost(a.actualHours, rate, cap, capType).fundedCost : 0;
    return { budgeted, actual };
  };

  // Summary metrics
  const summary = useMemo(() => {
    let totalBudgetedHours = 0;
    let totalActualHours = 0;
    let totalBudgetedCost = 0;
    let totalActualCost = 0;

    for (const a of filteredAllocations) {
      totalBudgetedHours += a.budgetedHours;
      if (a.actualHours !== null) totalActualHours += a.actualHours;
      const costs = getAllocationCost(a);
      totalBudgetedCost += costs.budgeted;
      totalActualCost += costs.actual;
    }

    return { totalBudgetedHours, totalActualHours, totalBudgetedCost, totalActualCost };
  }, [filteredAllocations, rates, projects]);

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name ?? 'Unknown';
  const getProjectCode = (id: string) => projects.find(p => p.id === id)?.code ?? '—';
  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name ?? 'Unknown';
  const getQuarterName = (id: string) => quarters.find(q => q.id === id)?.name ?? '—';

  const handleAdd = async (data: AllocationFormData) => {
    await addAllocation(data);
  };

  const handleEdit = async (data: AllocationFormData) => {
    if (selectedAllocation) {
      await updateAllocation(selectedAllocation.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAllocation(id);
    setDeleteConfirmId(null);
  };

  const openEditModal = (allocation: SalaryAllocation) => {
    setSelectedAllocation(allocation);
    setShowEditModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salary Allocations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage employee hour allocations across projects — {currentFiscalYear?.name ?? 'No FY'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Allocation
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Budgeted Hours</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalBudgetedHours.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actual Hours</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalActualHours.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Budgeted Cost</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalBudgetedCost)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actual Cost</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalActualCost)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee or project..."
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
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Employees</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarter</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Hrs</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual Hrs</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Cost</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual Cost</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">In-Kind</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium text-slate-500">No allocations found</p>
                      <p className="text-xs text-slate-400 mt-1">Add an allocation or adjust your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((a) => {
                  const costs = getAllocationCost(a);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-900">{getEmployeeName(a.employeeId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{getProjectCode(a.projectId)}</span>
                          <div className="text-xs text-slate-400">{getProjectName(a.projectId)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{getQuarterName(a.quarterId)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-slate-700">{a.budgetedHours}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-slate-700">
                          {a.actualHours !== null ? a.actualHours : <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(costs.budgeted)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-slate-900">
                          {a.actualHours !== null ? formatCurrency(costs.actual) : <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {a.isInKind && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            In-Kind
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit allocation"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          {deleteConfirmId === a.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(a.id)}
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
                              onClick={() => setDeleteConfirmId(a.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete allocation"
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
        {filteredAllocations.length} allocation{filteredAllocations.length !== 1 ? 's' : ''}
      </div>

      {/* Add Modal */}
      <AllocationFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        mode="add"
        employees={employees}
        projects={activeProjects}
        quarters={quarters}
        rates={rates}
        currentFiscalYearId={fiscalYearId}
        checkDuplicate={checkDuplicate}
      />

      {/* Edit Modal */}
      {selectedAllocation && (
        <AllocationFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAllocation(null);
          }}
          onSubmit={handleEdit}
          allocation={selectedAllocation}
          mode="edit"
          employees={employees}
          projects={activeProjects}
          quarters={quarters}
          rates={rates}
          currentFiscalYearId={fiscalYearId}
          checkDuplicate={checkDuplicate}
        />
      )}
    </div>
  );
};

export default Allocations;
