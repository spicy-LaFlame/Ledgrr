import { useState, useMemo, useCallback } from 'react';
import { Plus, Pencil, DollarSign, Users } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee } from '../db/schema';
import EmployeeFormModal, { type EmployeeFormData } from '../components/employees/EmployeeFormModal';
import RateManagementModal from '../components/employees/RateManagementModal';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { EmptyState } from '../components/shared/EmptyState';
import { useSort, type SortColumnDef } from '../hooks/useSort';
import { FilterBar, type FilterValues } from '../components/shared/FilterBar';
import { SortableHeader } from '../components/shared/SortableHeader';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/shared/Pagination';

const statusBadgeMap: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  onLeave: { variant: 'warning', label: 'On Leave' },
  inactive: { variant: 'neutral', label: 'Inactive' },
};

const Employees: React.FC = () => {
  const { allEmployees, organizations, addEmployee, updateEmployee } = useEmployees();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({ status: [] });
  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setFilterValues(prev => ({ ...prev, [key]: values }));
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => allEmployees.filter(emp => {
    const matchesStatus = filterValues.status.length === 0 || filterValues.status.includes(emp.status);
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [allEmployees, filterValues, searchQuery]);

  const getOrgName = (orgId: string) =>
    organizations.find(o => o.id === orgId)?.name ?? 'Unknown';

  const sortColumns: SortColumnDef<Employee>[] = useMemo(() => [
    { key: 'employee', accessor: (e) => e.name, type: 'string' },
    { key: 'organization', accessor: (e) => getOrgName(e.organizationId), type: 'string' },
    { key: 'status', accessor: (e) => e.status, type: 'string' },
    { key: 'fteHours', accessor: (e) => e.annualFTEHours, type: 'number' },
  ], [organizations]);

  const { sortedData: sortedEmployees, sortConfig, requestSort } = useSort({
    data: filteredEmployees,
    columns: sortColumns,
  });

  const pagination = usePagination(sortedEmployees);

  const statusCounts = {
    active: allEmployees.filter(e => e.status === 'active').length,
    onLeave: allEmployees.filter(e => e.status === 'onLeave').length,
    inactive: allEmployees.filter(e => e.status === 'inactive').length,
  };

  const handleAddEmployee = async (data: EmployeeFormData) => {
    await addEmployee(data);
  };

  const handleEditEmployee = async (data: EmployeeFormData) => {
    if (selectedEmployee) {
      await updateEmployee(selectedEmployee.id, data);
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowEditModal(true);
  };

  const openRatesModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowRatesModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Employee Management"
        subtitle="Manage team members and hourly rates"
        actions={
          <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Employee
          </Button>
        }
      />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or role..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            placeholder: 'All Statuses',
            options: [
              { value: 'active', label: `Active (${statusCounts.active})` },
              { value: 'onLeave', label: `On Leave (${statusCounts.onLeave})` },
              { value: 'inactive', label: `Inactive (${statusCounts.inactive})` },
            ],
          },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        resultCount={filteredEmployees.length}
        resultLabel="employees"
        totalCount={allEmployees.length}
      />

      {/* Employees Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <SortableHeader label="Employee" sortKey="employee" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Organization" sortKey="organization" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="FTE Hours" sortKey="fteHours" currentSort={sortConfig} onSort={requestSort} align="right" />
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title="No employees found"
                      description="Try adjusting your search or filter"
                    />
                  </td>
                </tr>
              ) : (
                pagination.pageItems.map((emp) => {
                  const badge = statusBadgeMap[emp.status] ?? statusBadgeMap.active;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-cyan-900">{emp.name}</span>
                            {emp.isInnovationTeam && (
                              <Badge variant="info">Innovation Team</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{emp.role}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{getOrgName(emp.organizationId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-slate-700">{emp.annualFTEHours.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Edit employee"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => openRatesModal(emp)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Manage rates"
                          >
                            <DollarSign className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} noun="employees" />
      </Card>

      <EmployeeFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEmployee}
        organizations={organizations}
        mode="add"
      />

      {selectedEmployee && (
        <EmployeeFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSubmit={handleEditEmployee}
          employee={selectedEmployee}
          organizations={organizations}
          mode="edit"
        />
      )}

      {selectedEmployee && (
        <RateManagementModal
          isOpen={showRatesModal}
          onClose={() => {
            setShowRatesModal(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};

export default Employees;
