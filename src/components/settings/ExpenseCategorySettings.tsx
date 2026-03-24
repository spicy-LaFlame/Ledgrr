import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { db, type ExpenseCategory } from '../../db/schema';

export const ExpenseCategorySettings: React.FC = () => {
  const categories = useLiveQuery(() => db.expenseCategories.orderBy('sortOrder').toArray()) ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => {
    setFormName('');
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: ExpenseCategory) => {
    setFormName(cat.name);
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;

    if (editingId) {
      await db.expenseCategories.update(editingId, { name: formName.trim() });
    } else {
      const maxSort = categories.length > 0
        ? Math.max(...categories.map(c => c.sortOrder))
        : 0;
      const cat: ExpenseCategory = {
        id: `cat-${formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: formName.trim(),
        sortOrder: maxSort + 1,
      };
      await db.expenseCategories.add(cat);
    }

    setShowForm(false);
    setEditingId(null);
    setFormName('');
  };

  const handleDelete = async (id: string) => {
    const expenseCount = await db.expenses.where('categoryId').equals(id).count();
    if (expenseCount > 0) {
      alert(`Cannot delete: ${expenseCount} expense(s) use this category.`);
      setConfirmDelete(null);
      return;
    }
    await db.expenseCategories.delete(id);
    setConfirmDelete(null);
  };

  const moveUp = async (cat: ExpenseCategory, index: number) => {
    if (index === 0) return;
    const prev = categories[index - 1];
    await db.transaction('rw', db.expenseCategories, async () => {
      await db.expenseCategories.update(cat.id, { sortOrder: prev.sortOrder });
      await db.expenseCategories.update(prev.id, { sortOrder: cat.sortOrder });
    });
  };

  const moveDown = async (cat: ExpenseCategory, index: number) => {
    if (index === categories.length - 1) return;
    const next = categories[index + 1];
    await db.transaction('rw', db.expenseCategories, async () => {
      await db.expenseCategories.update(cat.id, { sortOrder: next.sortOrder });
      await db.expenseCategories.update(next.id, { sortOrder: cat.sortOrder });
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Expense Categories</h3>
          <p className="text-xs text-slate-500 mt-0.5">Categories for non-salary expenses.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {showForm && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Category Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g., Consulting Fees"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {categories.map((cat, index) => (
          <div key={cat.id} className="px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button
                  onClick={() => moveUp(cat, index)}
                  disabled={index === 0}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(cat, index)}
                  disabled={index === categories.length - 1}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
                >
                  ▼
                </button>
              </div>
              <GripVertical className="w-4 h-4 text-slate-300" />
              <span className="text-sm text-slate-900">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {confirmDelete === cat.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(cat.id)}
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
                  onClick={() => setConfirmDelete(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No categories configured</div>
        )}
      </div>
    </div>
  );
};
