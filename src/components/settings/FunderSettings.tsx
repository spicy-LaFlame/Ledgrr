import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { db, type Funder } from '../../db/schema';

interface FunderFormData {
  name: string;
  code: string;
  benefitCoverageRate: number;
  notes: string;
}

const emptyForm: FunderFormData = { name: '', code: '', benefitCoverageRate: 0, notes: '' };

export const FunderSettings: React.FC = () => {
  const funders = useLiveQuery(() => db.funders.toArray()) ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FunderFormData>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = [...funders].sort((a, b) => a.name.localeCompare(b.name));

  const openAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (f: Funder) => {
    setFormData({
      name: f.name,
      code: f.code,
      benefitCoverageRate: f.benefitCoverageRate * 100,
      notes: f.notes ?? '',
    });
    setEditingId(f.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) return;
    const now = new Date().toISOString();

    if (editingId) {
      await db.funders.update(editingId, {
        name: formData.name,
        code: formData.code,
        benefitCoverageRate: formData.benefitCoverageRate / 100,
        notes: formData.notes || undefined,
        updatedAt: now,
      });
    } else {
      const funder: Funder = {
        id: `funder-${formData.code.toLowerCase()}`,
        name: formData.name,
        code: formData.code,
        benefitCoverageRate: formData.benefitCoverageRate / 100,
        notes: formData.notes || undefined,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      await db.funders.add(funder);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleDelete = async (id: string) => {
    const projectCount = await db.projects.where('funderId').equals(id).count();
    if (projectCount > 0) {
      alert(`Cannot delete: ${projectCount} project(s) use this funder.`);
      setConfirmDelete(null);
      return;
    }
    await db.funders.delete(id);
    setConfirmDelete(null);
  };

  const toggleActive = async (f: Funder) => {
    await db.funders.update(f.id, { isActive: !f.isActive, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Funders</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage funding organizations and their benefits coverage.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {showForm && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Funder name"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., CABHI"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Benefits Coverage (%)</label>
              <input
                type="number"
                value={formData.benefitCoverageRate}
                onChange={e => setFormData(prev => ({ ...prev, benefitCoverageRate: parseFloat(e.target.value) || 0 }))}
                min="0"
                max="100"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {editingId ? 'Update' : 'Add Funder'}
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {sorted.map(f => (
          <div key={f.id} className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{f.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{f.code}</span>
                  {!f.isActive && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benefits coverage: {(f.benefitCoverageRate * 100).toFixed(0)}%
                  {f.notes ? ` · ${f.notes}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleActive(f)}
                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                  f.isActive
                    ? 'text-amber-700 hover:bg-amber-50'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {f.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => openEdit(f)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {confirmDelete === f.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(f.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No funders configured</div>
        )}
      </div>
    </div>
  );
};
