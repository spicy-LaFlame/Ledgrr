import { useState } from 'react';
import { Plus, Search, Pencil, DollarSign } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee } from '../db/schema';
import EmployeeFormModal, { type EmployeeFormData } from '../components/employees/EmployeeFormModal';
import RateManagementModal from '../components/employees/RateManagementModal';

type StatusFilter = 'all' | 'active' | 'onLeave' | 'inactive';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  onLeave: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'On Leave' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Inactive' },
};

const Employees: React.FC = () => {
  const { allEmployees, organizations, addEmployee, updateEmployee } = useEmployees();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = allEmployees.filter(emp => {
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getOrgName = (orgId: string) =>
    organizations.find(o => o.id === orgId)?.name ?? 'Unknown';

  const statusCounts = {
    all: allEmployees.length,
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

  const filterLabels: Record<StatusFilter, string> = {
    all: 'All',
    active: 'Active',
    onLeave: 'On Leave',
    inactive: 'Inactive',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage team members and hourly rates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'active', 'onLeave', 'inactive'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === status
                  ? 'text-white bg-slate-900'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {filterLabels[status]} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Employee
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Organization
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  FTE Hours
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium text-slate-500">No employees found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const style = statusStyles[emp.status] ?? statusStyles.active;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{emp.name}</span>
                            {emp.isInnovationTeam && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                Innovation Team
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{emp.role}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{getOrgName(emp.organizationId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-slate-700">{emp.annualFTEHours.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit employee"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => openRatesModal(emp)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
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
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-slate-500">
        Showing {filteredEmployees.length} of {allEmployees.length} employees
      </div>

      {/* Add Employee Modal */}
      <EmployeeFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEmployee}
        organizations={organizations}
        mode="add"
      />

      {/* Edit Employee Modal */}
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

      {/* Rate Management Modal */}
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
