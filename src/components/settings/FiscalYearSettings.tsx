import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Pencil, Trash2, Check, Star } from 'lucide-react';
import { db, type FiscalYear, type Quarter } from '../../db/schema';

interface FYFormData {
  name: string;
  startDate: string;
  endDate: string;
}

const emptyForm: FYFormData = { name: '', startDate: '', endDate: '' };

export const FiscalYearSettings: React.FC = () => {
  const fiscalYears = useLiveQuery(() => db.fiscalYears.toArray()) ?? [];
  const quarters = useLiveQuery(() => db.quarters.toArray()) ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FYFormData>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = [...fiscalYears].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const openAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (fy: FiscalYear) => {
    setFormData({ name: fy.name, startDate: fy.startDate, endDate: fy.endDate });
    setEditingId(fy.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return;

    if (editingId) {
      await db.fiscalYears.update(editingId, {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    } else {
      const fyId = `fy-${formData.name}`;
      const fy: FiscalYear = {
        id: fyId,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: false,
      };
      await db.fiscalYears.add(fy);

      // Auto-generate quarters
      const start = new Date(formData.startDate);
      const quarterDefs: Quarter[] = [];
      for (let q = 1; q <= 4; q++) {
        const qStart = new Date(start);
        qStart.setMonth(start.getMonth() + (q - 1) * 3);
        const qEnd = new Date(qStart);
        qEnd.setMonth(qStart.getMonth() + 3);
        qEnd.setDate(qEnd.getDate() - 1);
        quarterDefs.push({
          id: `q${q}-${formData.name}`,
          name: `Q${q} ${formData.name}`,
          quarterNumber: q as 1 | 2 | 3 | 4,
          fiscalYearId: fyId,
          startDate: qStart.toISOString().split('T')[0],
          endDate: qEnd.toISOString().split('T')[0],
        });
      }
      await db.quarters.bulkAdd(quarterDefs);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSetCurrent = async (fyId: string) => {
    await db.transaction('rw', db.fiscalYears, async () => {
      await db.fiscalYears.toCollection().modify({ isCurrent: false });
      await db.fiscalYears.update(fyId, { isCurrent: true });
    });
  };

  const handleDelete = async (fyId: string) => {
    const fyQuarters = quarters.filter(q => q.fiscalYearId === fyId);
    const qIds = fyQuarters.map(q => q.id);

    // Check for dependent data
    const allocCount = await db.salaryAllocations.where('fiscalYearId').equals(fyId).count();
    const expenseCount = await db.expenses.where('fiscalYearId').equals(fyId).count();

    if (allocCount > 0 || expenseCount > 0) {
      alert(`Cannot delete: this fiscal year has ${allocCount} allocations and ${expenseCount} expenses.`);
      setConfirmDelete(null);
      return;
    }

    await db.transaction('rw', [db.fiscalYears, db.quarters], async () => {
      await db.quarters.bulkDelete(qIds);
      await db.fiscalYears.delete(fyId);
    });
    setConfirmDelete(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => {
      // Auto-fill dates from name pattern like "2025-26"
      const match = name.match(/^(\d{4})-(\d{2})$/);
      if (match && !editingId) {
        const startYear = parseInt(match[1]);
        return {
          name,
          startDate: `${startYear}-04-01`,
          endDate: `${startYear + 1}-03-31`,
        };
      }
      return { ...prev, name };
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Fiscal Years</h3>
          <p className="text-xs text-slate-500 mt-0.5">April 1 to March 31. Quarters are auto-generated.</p>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="2026-27"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
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
              {editingId ? 'Update' : 'Add Fiscal Year'}
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {sorted.map(fy => {
          const fyQuarters = quarters
            .filter(q => q.fiscalYearId === fy.id)
            .sort((a, b) => a.quarterNumber - b.quarterNumber);

          return (
            <div key={fy.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">FY {fy.name}</span>
                    {fy.isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                        <Star className="w-3 h-3" />
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fy.startDate} to {fy.endDate} · {fyQuarters.length} quarters
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!fy.isCurrent && (
                  <button
                    onClick={() => handleSetCurrent(fy.id)}
                    title="Set as current fiscal year"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => openEdit(fy)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {confirmDelete === fy.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(fy.id)}
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
                    onClick={() => setConfirmDelete(fy.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No fiscal years configured</div>
        )}
      </div>
    </div>
  );
};
