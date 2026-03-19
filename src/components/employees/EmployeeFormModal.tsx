import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Employee, Organization } from '../../db/schema';

export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<unknown>;
  employee?: Employee;
  organizations: Organization[];
  mode: 'add' | 'edit';
}

const statusOptions: { value: Employee['status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'onLeave', label: 'On Leave' },
  { value: 'inactive', label: 'Inactive' },
];

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employee,
  organizations,
  mode,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    role: '',
    organizationId: '',
    departmentId: undefined,
    isInnovationTeam: false,
    annualFTEHours: 1950,
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee && mode === 'edit') {
      setFormData({
        name: employee.name,
        role: employee.role,
        organizationId: employee.organizationId,
        departmentId: employee.departmentId,
        isInnovationTeam: employee.isInnovationTeam,
        annualFTEHours: employee.annualFTEHours,
        status: employee.status,
      });
    } else {
      setFormData({
        name: '',
        role: '',
        organizationId: organizations[0]?.id ?? '',
        departmentId: undefined,
        isInnovationTeam: false,
        annualFTEHours: 1950,
        status: 'active',
      });
    }
    setErrors({});
  }, [employee, mode, organizations, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    if (!formData.organizationId) {
      newErrors.organizationId = 'Organization is required';
    }
    if (formData.annualFTEHours <= 0) {
      newErrors.annualFTEHours = 'Annual FTE hours must be greater than 0';
    }

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
      console.error('Failed to save employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
            {mode === 'add' ? 'Add Employee' : 'Edit Employee'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Last, First (e.g., Muwanga, Moses)"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role / Job Title *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  errors.role ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="e.g., Finance and Programs Assistant"
              />
              {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
            </div>

            {/* Organization + FTE Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Organization *
                </label>
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.organizationId ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {errors.organizationId && <p className="mt-1 text-xs text-red-500">{errors.organizationId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Annual FTE Hours
                </label>
                <input
                  type="number"
                  name="annualFTEHours"
                  value={formData.annualFTEHours || ''}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.annualFTEHours ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.annualFTEHours && <p className="mt-1 text-xs text-red-500">{errors.annualFTEHours}</p>}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Innovation Team Toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Innovation Team Member</p>
                <p className="text-xs text-slate-500">Include in team allocation tracking</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isInnovationTeam}
                onChange={(e) => setFormData(prev => ({ ...prev, isInnovationTeam: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
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
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Employee' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
