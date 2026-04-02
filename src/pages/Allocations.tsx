import { useState, useMemo, useCallback } from 'react';
import { Plus, Pencil, Trash2, TableProperties, ClipboardCheck } from 'lucide-react';
import { useAllocations, useFiscalPeriods } from '../hooks/useAllocations';
import { useEmployees, useEmployeeRates, calculateCost } from '../hooks/useEmployees';
import { useProjects } from '../hooks/useProjects';
import type { SalaryAllocation } from '../db/schema';
import AllocationFormModal, { type AllocationFormData } from '../components/allocations/AllocationFormModal';
import BulkAllocationModal from '../components/allocations/BulkAllocationModal';
import BulkActualsModal from '../components/allocations/BulkActualsModal';
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

const Allocations: React.FC = () => {
  const { currentFiscalYear, getQuartersForYear } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';
  const quarters = getQuartersForYear(fiscalYearId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({
    quarter: [],
    project: [],
    employee: [],
    type: [],
  });

  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setFilterValues(prev => ({ ...prev, [key]: values }));
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showBulkActualsModal, setShowBulkActualsModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<SalaryAllocation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { allocations, addAllocation, updateAllocation, deleteAllocation, checkDuplicate, bulkAddAllocations, bulkUpdateActuals } = useAllocations({
    fiscalYearId: fiscalYearId || undefined,
  });
  const { employees } = useEmployees();
  const { projects } = useProjects();
  const { rates } = useEmployeeRates(undefined, fiscalYearId);

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      if (filterValues.quarter.length > 0 && !filterValues.quarter.includes(a.quarterId)) return false;
      if (filterValues.project.length > 0 && !filterValues.project.includes(a.projectId)) return false;
      if (filterValues.employee.length > 0 && !filterValues.employee.includes(a.employeeId)) return false;
      if (filterValues.type.length > 0) {
        const type = a.isInKind ? 'in-kind' : 'cash';
        if (!filterValues.type.includes(type)) return false;
      }
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
  }, [allocations, filterValues, searchQuery, employees, projects]);

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

  const summary = useMemo(() => {
    let cashBudgetedHours = 0, cashActualHours = 0, cashBudgetedCost = 0, cashActualCost = 0;
    let inKindBudgetedHours = 0, inKindActualHours = 0, inKindBudgetedCost = 0, inKindActualCost = 0;

    for (const a of filteredAllocations) {
      const costs = getAllocationCost(a);
      if (a.isInKind) {
        inKindBudgetedHours += a.budgetedHours;
        if (a.actualHours !== null) inKindActualHours += a.actualHours;
        inKindBudgetedCost += costs.budgeted;
        inKindActualCost += costs.actual;
      } else {
        cashBudgetedHours += a.budgetedHours;
        if (a.actualHours !== null) cashActualHours += a.actualHours;
        cashBudgetedCost += costs.budgeted;
        cashActualCost += costs.actual;
      }
    }

    return {
      cashBudgetedHours, cashActualHours, cashBudgetedCost, cashActualCost,
      inKindBudgetedHours, inKindActualHours, inKindBudgetedCost, inKindActualCost,
    };
  }, [filteredAllocations, rates, projects]);

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name ?? 'Unknown';
  const getProjectCode = (id: string) => projects.find(p => p.id === id)?.code ?? '\u2014';
  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name ?? 'Unknown';
  const getQuarterName = (id: string) => quarters.find(q => q.id === id)?.name ?? '\u2014';

  const sortColumns: SortColumnDef<SalaryAllocation>[] = useMemo(() => [
    { key: 'employee', accessor: (a) => getEmployeeName(a.employeeId), type: 'string' },
    { key: 'project', accessor: (a) => getProjectName(a.projectId), type: 'string' },
    { key: 'quarter', accessor: (a) => getQuarterName(a.quarterId), type: 'string' },
    { key: 'budgetHrs', accessor: (a) => a.budgetedHours, type: 'number' },
    { key: 'actualHrs', accessor: (a) => a.actualHours, type: 'number' },
    { key: 'budgetCost', accessor: (a) => getAllocationCost(a).budgeted, type: 'number' },
    { key: 'actualCost', accessor: (a) => a.actualHours !== null ? getAllocationCost(a).actual : null, type: 'number' },
  ], [employees, projects, quarters, rates]);

  const { sortedData: sortedAllocations, sortConfig, requestSort } = useSort({
    data: filteredAllocations,
    columns: sortColumns,
  });

  const pagination = usePagination(sortedAllocations);

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
      <PageHeader
        title="Salary Allocations"
        subtitle={`Manage employee hour allocations across projects \u2014 ${currentFiscalYear?.name ?? 'No FY'}`}
        actions={
          <>
            <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Allocation
            </Button>
            <Button variant="secondary" onClick={() => setShowBulkAddModal(true)} icon={<TableProperties className="w-4 h-4" />}>
              Bulk Add
            </Button>
            <Button variant="secondary" onClick={() => setShowBulkActualsModal(true)} icon={<ClipboardCheck className="w-4 h-4" />}>
              Enter Actuals
            </Button>
          </>
        }
      />

      {/* Summary Cards -- Cash */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cash Budgeted Hours</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{summary.cashBudgetedHours.toLocaleString()}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cash Actual Hours</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{summary.cashActualHours.toLocaleString()}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cash Budgeted Cost</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{formatCurrency(summary.cashBudgetedCost)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cash Actual Cost</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{formatCurrency(summary.cashActualCost)}</p>
        </Card>
      </div>

      {/* Summary Cards -- In-Kind */}
      {(summary.inKindBudgetedHours > 0 || summary.inKindActualHours > 0) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">In-Kind Budgeted Hours</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{summary.inKindBudgetedHours.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">In-Kind Actual Hours</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{summary.inKindActualHours.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">In-Kind Budgeted Cost</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(summary.inKindBudgetedCost)}</p>
          </div>
          <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">In-Kind Actual Cost</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(summary.inKindActualCost)}</p>
          </div>
        </div>
      )}

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search employee or project..."
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
            key: 'employee',
            label: 'Employee',
            placeholder: 'All Employees',
            options: employees.map(emp => ({ value: emp.id, label: emp.name })),
          },
          {
            key: 'type',
            label: 'Type',
            placeholder: 'All Types',
            options: [
              { value: 'cash', label: 'Cash' },
              { value: 'in-kind', label: 'In-Kind' },
            ],
          },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        resultCount={filteredAllocations.length}
        resultLabel={`allocation${filteredAllocations.length !== 1 ? 's' : ''}`}
        totalCount={allocations.length}
      />

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <SortableHeader label="Employee" sortKey="employee" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Project" sortKey="project" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Quarter" sortKey="quarter" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Budget Hrs" sortKey="budgetHrs" currentSort={sortConfig} onSort={requestSort} align="right" />
                <SortableHeader label="Actual Hrs" sortKey="actualHrs" currentSort={sortConfig} onSort={requestSort} align="right" />
                <SortableHeader label="Budget Cost" sortKey="budgetCost" currentSort={sortConfig} onSort={requestSort} align="right" />
                <SortableHeader label="Actual Cost" sortKey="actualCost" currentSort={sortConfig} onSort={requestSort} align="right" />
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">In-Kind</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={ClipboardCheck}
                      title="No allocations found"
                      description="Add an allocation or adjust your filters"
                      actionLabel="Add Allocation"
                      onAction={() => setShowAddModal(true)}
                    />
                  </td>
                </tr>
              ) : (
                pagination.pageItems.map((a) => {
                  const costs = getAllocationCost(a);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-cyan-900">{getEmployeeName(a.employeeId)}</span>
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
                          {a.actualHours !== null ? a.actualHours : <span className="text-slate-300">{'\u2014'}</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-cyan-900">{formatCurrency(costs.budgeted)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-cyan-900">
                          {a.actualHours !== null ? formatCurrency(costs.actual) : <span className="text-slate-300">{'\u2014'}</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {a.isInKind && <Badge variant="purple">In-Kind</Badge>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Edit allocation"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          {deleteConfirmId === a.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(a.id)}
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
                              onClick={() => setDeleteConfirmId(a.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
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
        <Pagination pagination={pagination} noun="allocations" />
      </Card>

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

      <BulkAllocationModal
        isOpen={showBulkAddModal}
        onClose={() => setShowBulkAddModal(false)}
        onSubmit={bulkAddAllocations}
        employees={employees}
        projects={activeProjects}
        quarters={quarters}
        rates={rates}
        currentFiscalYearId={fiscalYearId}
        existingAllocations={allocations.map(a => ({
          employeeId: a.employeeId,
          projectId: a.projectId,
          quarterId: a.quarterId,
        }))}
      />

      <BulkActualsModal
        isOpen={showBulkActualsModal}
        onClose={() => setShowBulkActualsModal(false)}
        onSubmit={bulkUpdateActuals}
        allocations={allocations}
        employees={employees}
        projects={activeProjects}
        quarters={quarters}
        rates={rates}
      />
    </div>
  );
};

export default Allocations;
