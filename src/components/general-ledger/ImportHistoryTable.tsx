import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ExternalImport } from '../../db/schema';

interface ImportHistoryTableProps {
  imports: ExternalImport[];
  onDelete: (importId: string) => Promise<void>;
}

const ImportHistoryTable: React.FC<ImportHistoryTableProps> = ({ imports, onDelete }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (imports.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4">No imports yet. Click "Import Data" to get started.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">File</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Rows</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {imports.map(imp => (
            <tr key={imp.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  imp.type === 'general-ledger'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-teal-100 text-teal-700'
                }`}>
                  {imp.type === 'general-ledger' ? 'GL' : 'Payroll'}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{imp.fileName}</td>
              <td className="px-4 py-3 text-slate-600">
                {new Date(imp.importDate).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-right text-slate-700">{imp.rowCount.toLocaleString()}</td>
              <td className="px-4 py-3 text-right">
                {deleteConfirmId === imp.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={async () => {
                        await onDelete(imp.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(imp.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete import and all its entries"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportHistoryTable;
