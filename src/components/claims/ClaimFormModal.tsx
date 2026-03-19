import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Claim, ClaimStatus, Project, Quarter } from '../../db/schema';

export type ClaimFormData = Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>;

interface ClaimFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClaimFormData) => Promise<unknown>;
  claim?: Claim;
  mode: 'add' | 'edit';
  projects: Project[];
  quarters: Quarter[];
  currentFiscalYearId: string;
}

const statusOptions: { value: ClaimStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'partial', label: 'Partially Received' },
  { value: 'received', label: 'Received' },
];

const ClaimFormModal: React.FC<ClaimFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  claim,
  mode,
  projects,
  quarters,
  currentFiscalYearId,
}) => {
  const [formData, setFormData] = useState<ClaimFormData>({
    projectId: '',
    fiscalYearId: currentFiscalYearId,
    quarterId: '',
    claimAmount: 0,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'draft',
    referenceNumber: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (claim && mode === 'edit') {
      setFormData({
        projectId: claim.projectId,
        fiscalYearId: claim.fiscalYearId,
        quarterId: claim.quarterId,
        claimAmount: claim.claimAmount,
        submittedDate: claim.submittedDate,
        receivedDate: claim.receivedDate,
        receivedAmount: claim.receivedAmount,
        status: claim.status,
        referenceNumber: claim.referenceNumber ?? '',
        notes: claim.notes ?? '',
      });
    } else {
      setFormData({
        projectId: projects[0]?.id ?? '',
        fiscalYearId: currentFiscalYearId,
        quarterId: quarters[0]?.id ?? '',
        claimAmount: 0,
        submittedDate: null,
        receivedDate: null,
        receivedAmount: null,
        status: 'draft',
        referenceNumber: '',
        notes: '',
      });
    }
    setErrors({});
  }, [claim, mode, projects, quarters, currentFiscalYearId, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.quarterId) newErrors.quarterId = 'Quarter is required';
    if (formData.claimAmount <= 0) newErrors.claimAmount = 'Claim amount must be greater than 0';
    if (formData.status === 'submitted' && !formData.submittedDate) {
      newErrors.submittedDate = 'Submitted date is required when status is Submitted';
    }
    if ((formData.status === 'received' || formData.status === 'partial') && !formData.receivedDate) {
      newErrors.receivedDate = 'Received date is required when funding has been received';
    }
    if ((formData.status === 'received' || formData.status === 'partial') && (formData.receivedAmount === null || formData.receivedAmount <= 0)) {
      newErrors.receivedAmount = 'Received amount is required when funding has been received';
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
      console.error('Failed to save claim:', error);
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
            {mode === 'add' ? 'Add Claim' : 'Edit Claim'}
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

            {/* Quarter + Status */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Claim Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Claim Amount ($) *</label>
              <input
                type="number"
                name="claimAmount"
                value={formData.claimAmount || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  errors.claimAmount ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="0.00"
              />
              {errors.claimAmount && <p className="mt-1 text-xs text-red-500">{errors.claimAmount}</p>}
            </div>

            {/* Submitted Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date Submitted to Funder
              </label>
              <input
                type="date"
                name="submittedDate"
                value={formData.submittedDate ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    submittedDate: val === '' ? null : val,
                    // Auto-set status to submitted if still draft
                    status: val && prev.status === 'draft' ? 'submitted' : prev.status,
                  }));
                  if (errors.submittedDate) setErrors(prev => ({ ...prev, submittedDate: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  errors.submittedDate ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.submittedDate && <p className="mt-1 text-xs text-red-500">{errors.submittedDate}</p>}
            </div>

            {/* Received Date + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Received</label>
                <input
                  type="date"
                  name="receivedDate"
                  value={formData.receivedDate ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      receivedDate: val === '' ? null : val,
                      // Auto-set status to received if date is entered
                      status: val && (prev.status === 'draft' || prev.status === 'submitted') ? 'received' : prev.status,
                    }));
                    if (errors.receivedDate) setErrors(prev => ({ ...prev, receivedDate: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.receivedDate ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.receivedDate && <p className="mt-1 text-xs text-red-500">{errors.receivedDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Received ($)</label>
                <input
                  type="number"
                  name="receivedAmount"
                  value={formData.receivedAmount ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      receivedAmount: val === '' ? null : parseFloat(val),
                    }));
                    if (errors.receivedAmount) setErrors(prev => ({ ...prev, receivedAmount: '' }));
                  }}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.receivedAmount ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Not received"
                />
                {errors.receivedAmount && <p className="mt-1 text-xs text-red-500">{errors.receivedAmount}</p>}
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference / Invoice Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., INV-2025-001"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes ?? ''}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                placeholder="Any additional details..."
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
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Claim' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimFormModal;
