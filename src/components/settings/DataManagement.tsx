import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, RotateCcw, AlertTriangle, HardDrive } from 'lucide-react';
import { db } from '../../db/schema';
import { resetDatabase } from '../../db/seed';

interface TableCount {
  name: string;
  count: number;
}

export const DataManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tableCounts = useLiveQuery(async (): Promise<TableCount[]> => {
    const tables: { name: string; table: { count: () => Promise<number> } }[] = [
      { name: 'Projects', table: db.projects },
      { name: 'Employees', table: db.employees },
      { name: 'Employee Rates', table: db.employeeRates },
      { name: 'Salary Allocations', table: db.salaryAllocations },
      { name: 'Expenses', table: db.expenses },
      { name: 'Claims', table: db.claims },
      { name: 'Funders', table: db.funders },
      { name: 'Fiscal Years', table: db.fiscalYears },
      { name: 'Quarters', table: db.quarters },
      { name: 'GL Entries', table: db.glEntries },
      { name: 'Payroll Entries', table: db.payrollEntries },
    ];

    const counts: TableCount[] = [];
    for (const t of tables) {
      counts.push({ name: t.name, count: await t.table.count() });
    }
    return counts;
  }) ?? [];

  const totalRecords = tableCounts.reduce((sum, t) => sum + t.count, 0);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const data: Record<string, unknown[]> = {
        funders: await db.funders.toArray(),
        organizations: await db.organizations.toArray(),
        fiscalYears: await db.fiscalYears.toArray(),
        quarters: await db.quarters.toArray(),
        expenseCategories: await db.expenseCategories.toArray(),
        employees: await db.employees.toArray(),
        employeeRates: await db.employeeRates.toArray(),
        projects: await db.projects.toArray(),
        salaryAllocations: await db.salaryAllocations.toArray(),
        expenses: await db.expenses.toArray(),
        claims: await db.claims.toArray(),
        spendingAlerts: await db.spendingAlerts.toArray(),
        externalImports: await db.externalImports.toArray(),
        glEntries: await db.glEntries.toArray(),
        payrollEntries: await db.payrollEntries.toArray(),
        glAccountRules: await db.glAccountRules.toArray(),
      };

      const json = JSON.stringify({
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        data,
      }, null, 2);

      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `innovation-budget-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup exported successfully.' });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ type: 'error', text: 'Export failed. See console for details.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data || !backup.exportDate) {
        throw new Error('Invalid backup file format.');
      }

      const data = backup.data;

      // Restore in order (lookup tables first, then transactional data)
      await db.transaction('rw', [
        db.organizations, db.funders, db.fiscalYears, db.quarters, db.expenseCategories,
        db.employees, db.employeeRates, db.projects, db.salaryAllocations, db.expenses,
        db.claims, db.spendingAlerts, db.externalImports, db.glEntries, db.payrollEntries,
        db.glAccountRules,
      ], async () => {
        // Clear all tables
        await db.organizations.clear();
        await db.funders.clear();
        await db.fiscalYears.clear();
        await db.quarters.clear();
        await db.expenseCategories.clear();
        await db.employees.clear();
        await db.employeeRates.clear();
        await db.projects.clear();
        await db.salaryAllocations.clear();
        await db.expenses.clear();
        await db.claims.clear();
        await db.spendingAlerts.clear();
        await db.externalImports.clear();
        await db.glEntries.clear();
        await db.payrollEntries.clear();
        await db.glAccountRules.clear();

        // Re-populate
        if (data.organizations?.length) await db.organizations.bulkAdd(data.organizations);
        if (data.funders?.length) await db.funders.bulkAdd(data.funders);
        if (data.fiscalYears?.length) await db.fiscalYears.bulkAdd(data.fiscalYears);
        if (data.quarters?.length) await db.quarters.bulkAdd(data.quarters);
        if (data.expenseCategories?.length) await db.expenseCategories.bulkAdd(data.expenseCategories);
        if (data.employees?.length) await db.employees.bulkAdd(data.employees);
        if (data.employeeRates?.length) await db.employeeRates.bulkAdd(data.employeeRates);
        if (data.projects?.length) await db.projects.bulkAdd(data.projects);
        if (data.salaryAllocations?.length) await db.salaryAllocations.bulkAdd(data.salaryAllocations);
        if (data.expenses?.length) await db.expenses.bulkAdd(data.expenses);
        if (data.claims?.length) await db.claims.bulkAdd(data.claims);
        if (data.spendingAlerts?.length) await db.spendingAlerts.bulkAdd(data.spendingAlerts);
        if (data.externalImports?.length) await db.externalImports.bulkAdd(data.externalImports);
        if (data.glEntries?.length) await db.glEntries.bulkAdd(data.glEntries);
        if (data.payrollEntries?.length) await db.payrollEntries.bulkAdd(data.payrollEntries);
        if (data.glAccountRules?.length) await db.glAccountRules.bulkAdd(data.glAccountRules);
      });

      setMessage({ type: 'success', text: `Backup restored from ${new Date(backup.exportDate).toLocaleDateString()}.` });
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({ type: 'error', text: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setMessage(null);
    try {
      await resetDatabase();
      setMessage({ type: 'success', text: 'Database reset to sample data.' });
    } catch (error) {
      console.error('Reset failed:', error);
      setMessage({ type: 'error', text: 'Reset failed. See console for details.' });
    } finally {
      setIsResetting(false);
      setConfirmReset(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status message */}
      {message && (
        <div className={`p-3 rounded-xl border text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Database stats */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Database</h3>
            <span className="text-xs text-slate-500">({totalRecords.toLocaleString()} total records)</span>
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
            {tableCounts.map(t => (
              <div key={t.name} className="flex items-center justify-between py-0.5">
                <span className="text-xs text-slate-500">{t.name}</span>
                <span className="text-xs font-mono text-slate-700">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Backup & Restore</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            All data is stored locally in your browser. Export regularly to avoid data loss.
          </p>
        </div>
        <div className="p-5 space-y-3">
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
          >
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {isExporting ? 'Exporting...' : 'Export Backup'}
              </p>
              <p className="text-xs text-slate-500">Download all data as a JSON file</p>
            </div>
          </button>

          {/* Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
          >
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {isImporting ? 'Restoring...' : 'Restore from Backup'}
              </p>
              <p className="text-xs text-slate-500">Replace all data from a previously exported JSON file</p>
            </div>
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200">
        <div className="px-5 py-4 border-b border-red-100">
          <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
        </div>
        <div className="p-5">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center gap-3 px-4 py-3 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">Reset to Sample Data</p>
                <p className="text-xs text-red-500">Delete all data and restore seed/sample data</p>
              </div>
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    This will permanently delete all your data.
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Consider exporting a backup first. This action cannot be undone.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleReset}
                      disabled={isResetting}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
