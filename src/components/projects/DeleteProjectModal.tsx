import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Project } from '../../db/schema';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permanent: boolean) => Promise<void>;
  project: Project;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'permanent'>('soft');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(deleteType === 'permanent');
      onClose();
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Delete Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{project.name}</span>?
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="deleteType"
                value="soft"
                checked={deleteType === 'soft'}
                onChange={() => setDeleteType('soft')}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Archive project</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hide the project from view. Can be restored later.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
              <input
                type="radio"
                name="deleteType"
                value="permanent"
                checked={deleteType === 'permanent'}
                onChange={() => setDeleteType('permanent')}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-red-700">Permanently delete</p>
                <p className="text-xs text-red-600 mt-0.5">
                  This will permanently remove the project and all related allocations. This action cannot be undone.
                </p>
              </div>
            </label>
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
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              deleteType === 'permanent'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isDeleting ? 'Deleting...' : deleteType === 'permanent' ? 'Delete Permanently' : 'Archive Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
