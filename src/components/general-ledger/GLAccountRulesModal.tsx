import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import type { GLAccountRule } from '../../db/schema';

interface GLAccountRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: GLAccountRule[];
  onAdd: (data: Omit<GLAccountRule, 'id' | 'createdAt'>) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
}

const GLAccountRulesModal: React.FC<GLAccountRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onAdd,
  onDelete,
}) => {
  const [newPattern, setNewPattern] = useState('');
  const [newCategory, setNewCategory] = useState<'salary' | 'expense'>('salary');
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = async () => {
    if (!newPattern.trim()) return;
    await onAdd({
      glCodePattern: newPattern.trim(),
      category: newCategory,
      label: newLabel.trim() || undefined,
    });
    setNewPattern('');
    setNewLabel('');
  };

  const salaryRules = rules.filter(r => r.category === 'salary');
  const expenseRules = rules.filter(r => r.category === 'expense');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GL Account Rules"
      maxWidth="lg"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Done
        </button>
      }
    >
      <div className="p-6 space-y-6">
        <p className="text-xs text-slate-500">
          Define which GL codes are salary vs expense. Use * as wildcard (e.g., 50* matches 5000, 5010).
        </p>
          {/* Add new rule */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Add Rule</p>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
              <div>
                <label className="block text-xs text-slate-500 mb-1">GL Code Pattern</label>
                <input
                  type="text"
                  value={newPattern}
                  onChange={e => setNewPattern(e.target.value)}
                  placeholder="e.g., 50*"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Type</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as 'salary' | 'expense')}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  <option value="salary">Salary</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g., Wages"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newPattern.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rule
            </button>
          </div>

          {/* Salary rules */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Salary Rules ({salaryRules.length})
            </h3>
            {salaryRules.length === 0 ? (
              <p className="text-xs text-slate-400">No salary rules defined</p>
            ) : (
              <div className="space-y-1">
                {salaryRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono font-medium text-blue-700">{rule.glCodePattern}</code>
                      {rule.label && <span className="text-xs text-blue-600">{rule.label}</span>}
                    </div>
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-blue-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense rules */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Expense Rules ({expenseRules.length})
            </h3>
            {expenseRules.length === 0 ? (
              <p className="text-xs text-slate-400">No expense rules defined</p>
            ) : (
              <div className="space-y-1">
                {expenseRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono font-medium text-amber-700">{rule.glCodePattern}</code>
                      {rule.label && <span className="text-xs text-amber-600">{rule.label}</span>}
                    </div>
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="p-1 hover:bg-amber-100 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-amber-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </Modal>
  );
};

export default GLAccountRulesModal;
