import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { Project, Funder, BenefitsCapType } from '../../db/schema';
import type { ProjectFormData } from '../../hooks/useProjects';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  project?: Project;
  funders: Funder[];
  mode: 'add' | 'edit';
}

const statusOptions: { value: Project['status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

const fundingTypeOptions: { value: Project['fundingType']; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'in-kind', label: 'In-Kind' },
  { value: 'mixed', label: 'Mixed' },
];

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  funders,
  mode,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    code: '',
    funderId: '',
    status: 'pipeline',
    fundingType: 'cash',
    startDate: '',
    endDate: undefined,
    totalBudget: 0,
    fiscalYearBudget: 0,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 20,
    benefitsCapType: 'percentage-of-benefits' as BenefitsCapType,
    costCentreNumber: undefined,
    fundingAgreementUrl: undefined,
    principalInvestigator: undefined,
    description: undefined,
    notes: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        name: project.name,
        code: project.code,
        funderId: project.funderId,
        status: project.status,
        fundingType: project.fundingType,
        startDate: project.startDate,
        endDate: project.endDate,
        totalBudget: project.totalBudget,
        fiscalYearBudget: project.fiscalYearBudget,
        inKindBudget: project.inKindBudget,
        inKindFiscalYearBudget: project.inKindFiscalYearBudget,
        benefitsCapPercent: project.benefitsCapPercent,
        benefitsCapType: project.benefitsCapType ?? 'percentage-of-benefits',
        costCentreNumber: project.costCentreNumber,
        fundingAgreementUrl: project.fundingAgreementUrl,
        principalInvestigator: project.principalInvestigator,
        description: project.description,
        notes: project.notes,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        funderId: funders[0]?.id ?? '',
        status: 'pipeline',
        fundingType: 'cash',
        startDate: new Date().toISOString().split('T')[0],
        endDate: undefined,
        totalBudget: 0,
        fiscalYearBudget: 0,
        inKindBudget: 0,
        inKindFiscalYearBudget: 0,
        benefitsCapPercent: 20,
        benefitsCapType: 'percentage-of-benefits' as BenefitsCapType,
        costCentreNumber: undefined,
        fundingAgreementUrl: undefined,
        principalInvestigator: undefined,
        description: undefined,
        notes: undefined,
      });
    }
    setErrors({});
  }, [project, mode, funders, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Project code is required';
    }
    if (!formData.funderId) {
      newErrors.funderId = 'Funder is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.totalBudget < 0) {
      newErrors.totalBudget = 'Total budget cannot be negative';
    }
    if (formData.fiscalYearBudget < 0) {
      newErrors.fiscalYearBudget = 'Fiscal year budget cannot be negative';
    }
    if (formData.inKindBudget < 0) {
      newErrors.inKindBudget = 'In-kind budget cannot be negative';
    }
    if (formData.inKindFiscalYearBudget < 0) {
      newErrors.inKindFiscalYearBudget = 'In-kind FY budget cannot be negative';
    }
    if (formData.benefitsCapPercent < 0 || formData.benefitsCapPercent > 100) {
      newErrors.benefitsCapPercent = 'Benefits cap must be between 0 and 100';
    }
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
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
      console.error('Failed to save project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value || undefined,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === 'add' ? 'Add New Project' : 'Edit Project'}
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
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      errors.name ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="e.g., AI Scribe Evaluation"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      errors.code ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="e.g., AISC"
                  />
                  {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost Centre Number
                  </label>
                  <input
                    type="text"
                    name="costCentreNumber"
                    value={formData.costCentreNumber ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g., 20-939802500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Funder *
                  </label>
                  <select
                    name="funderId"
                    value={formData.funderId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      errors.funderId ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select a funder</option>
                    {funders.map(funder => (
                      <option key={funder.id} value={funder.id}>
                        {funder.name}
                      </option>
                    ))}
                  </select>
                  {errors.funderId && <p className="mt-1 text-xs text-red-500">{errors.funderId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Principal Investigator
                  </label>
                  <input
                    type="text"
                    name="principalInvestigator"
                    value={formData.principalInvestigator ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g., Dr. Sarah Chen"
                  />
                </div>
              </div>
            </div>

            {/* Status & Type */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4">Status & Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status *
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Funding Type *
                  </label>
                  <select
                    name="fundingType"
                    value={formData.fundingType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {fundingTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4">Project Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      errors.startDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate ?? ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      errors.endDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4">Budget Information</h3>

              {/* Cash Budget */}
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Cash Budget</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total Cash Budget ($)
                    </label>
                    <input
                      type="number"
                      name="totalBudget"
                      value={formData.totalBudget || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        errors.totalBudget ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.totalBudget && <p className="mt-1 text-xs text-red-500">{errors.totalBudget}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      FY Cash Budget ($)
                    </label>
                    <input
                      type="number"
                      name="fiscalYearBudget"
                      value={formData.fiscalYearBudget || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        errors.fiscalYearBudget ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.fiscalYearBudget && <p className="mt-1 text-xs text-red-500">{errors.fiscalYearBudget}</p>}
                  </div>
                </div>
              </div>

              {/* In-Kind Budget */}
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">In-Kind Budget</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total In-Kind Budget ($)
                    </label>
                    <input
                      type="number"
                      name="inKindBudget"
                      value={formData.inKindBudget || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        errors.inKindBudget ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.inKindBudget && <p className="mt-1 text-xs text-red-500">{errors.inKindBudget}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      FY In-Kind Budget ($)
                    </label>
                    <input
                      type="number"
                      name="inKindFiscalYearBudget"
                      value={formData.inKindFiscalYearBudget || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        errors.inKindFiscalYearBudget ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.inKindFiscalYearBudget && <p className="mt-1 text-xs text-red-500">{errors.inKindFiscalYearBudget}</p>}
                  </div>
                </div>
              </div>

              {/* Benefits Cap */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Benefits</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Benefits Cap Type
                    </label>
                    <select
                      name="benefitsCapType"
                      value={formData.benefitsCapType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="percentage-of-benefits">% of Benefits</option>
                      <option value="percentage-of-wages">% of Wages</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      {formData.benefitsCapType === 'percentage-of-wages'
                        ? 'Funder pays benefits up to this % of base wages'
                        : 'Funder pays this % of the total benefits cost'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Benefits Cap (%)
                    </label>
                    <input
                      type="number"
                      name="benefitsCapPercent"
                      value={formData.benefitsCapPercent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        errors.benefitsCapPercent ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.benefitsCapPercent && <p className="mt-1 text-xs text-red-500">{errors.benefitsCapPercent}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Agreement */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4">Documentation</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Funding Agreement URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="fundingAgreementUrl"
                    value={formData.fundingAgreementUrl ?? ''}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="https://..."
                  />
                  {formData.fundingAgreementUrl && (
                    <a
                      href={formData.fundingAgreementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description & Notes */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4">Additional Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description ?? ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                    placeholder="Brief description of the project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes ?? ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                    placeholder="Any internal notes or reminders..."
                  />
                </div>
              </div>
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
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
