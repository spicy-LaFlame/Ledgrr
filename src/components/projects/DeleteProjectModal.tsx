import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Project } from '../../db/schema';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

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

  const footerContent = (
    <>
      <Button variant="secondary" type="button" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant={deleteType === 'permanent' ? 'danger' : 'primary'}
        type="button"
        onClick={handleDelete}
        loading={isDeleting}
      >
        {isDeleting ? 'Deleting...' : deleteType === 'permanent' ? 'Delete Permanently' : 'Archive Project'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project"
      maxWidth="md"
      footer={footerContent}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-cyan-900">{project.name}</span>?
          </p>
        </div>

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
              <p className="text-sm font-medium text-cyan-900">Archive project</p>
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
    </Modal>
  );
};

export default DeleteProjectModal;
