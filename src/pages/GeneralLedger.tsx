import { useState, useMemo } from 'react';
import { Plus, Settings2, Download } from 'lucide-react';
import { useFiscalPeriods } from '../hooks/useAllocations';
import { useExternalImports, useGLEntries, usePayrollEntries, useGLAccountRules } from '../hooks/useGeneralLedger';
import { useReconciliation } from '../hooks/useReconciliation';
import { useProjects } from '../hooks/useProjects';
import { computeSummary, type ReconciliationRow } from '../utils/reconciliation';
import ImportWizard, { type ImportResult } from '../components/general-ledger/ImportWizard';
import ImportHistoryTable from '../components/general-ledger/ImportHistoryTable';
import ReconciliationTable from '../components/general-ledger/ReconciliationTable';
import GLAccountRulesModal from '../components/general-ledger/GLAccountRulesModal';
import { v4 as uuidv4 } from 'uuid';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

type StatusFilter = 'all' | ReconciliationRow['status'];

const GeneralLedger: React.FC = () => {
  const { currentFiscalYear, fiscalYears } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';

  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { imports, addImport, deleteImport } = useExternalImports({ fiscalYearId: fiscalYearId || undefined });
  const { entries: glEntries, addEntries: addGLEntries } = useGLEntries(fiscalYearId || undefined);
  const { entries: payrollEntries, addEntries: addPayrollEntries } = usePayrollEntries(fiscalYearId || undefined);
  const { rules, addRule, deleteRule } = useGLAccountRules();
  const { rows, summary } = useReconciliation(fiscalYearId);
  const { projects } = useProjects();

  const projectCostCentres = useMemo(
    () => projects.filter(p => p.costCentreNumber).map(p => p.costCentreNumber!),
    [projects]
  );

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows;
    return rows.filter(r => r.status === statusFilter);
  }, [rows, statusFilter]);

  const filteredSummary = useMemo(() => computeSummary(filteredRows), [filteredRows]);

  const handleImport = async (result: ImportResult) => {
    const importId = uuidv4();
    const now = new Date().toISOString();

    // Save the import record
    await addImport({
      type: result.type,
      fileName: result.fileName,
      fiscalYearId: result.fiscalYearId,
      importDate: now,
      rowCount: result.glEntries?.length ?? result.payrollEntries?.length ?? 0,
      columnMapping: result.columnMapping,
    });

    // Save the entries with the import ID
    if (result.type === 'general-ledger' && result.glEntries) {
      const entries = result.glEntries.map(e => ({ ...e, importId }));
      await addGLEntries(entries);
    } else if (result.type === 'payroll' && result.payrollEntries) {
      const entries = result.payrollEntries.map(e => ({ ...e, importId }));
      await addPayrollEntries(entries);
    }
  };

  const handleExportReconciliation = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const wsData = [
      ['Reconciliation Report', '', '', '', '', '', '', ''],
      [`Fiscal Year: ${currentFiscalYear?.name ?? ''}`, '', '', '', '', '', `Generated: ${new Date().toLocaleDateString('en-CA')}`, ''],
      [],
      ['Cost Centre', 'Project Code', 'Project Name', 'Funder', 'External Total', 'App Total', 'Variance', 'Status'],
      ...filteredRows.map(r => [
        r.costCentre,
        r.projectCode ?? '',
        r.projectName ?? '',
        r.funderName ?? '',
        r.externalTotal,
        r.appTotal,
        r.variance,
        r.status,
      ]),
      [],
      ['', '', '', 'Totals', filteredSummary.externalTotal, filteredSummary.appTotal, filteredSummary.netVariance, ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Format currency columns
    const fmt = '$#,##0';
    for (let row = 4; row < 4 + filteredRows.length; row++) {
      for (const col of [4, 5, 6]) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell) cell.z = fmt;
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Reconciliation');
    XLSX.writeFile(wb, `Reconciliation_${currentFiscalYear?.name ?? 'FY'}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">General Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Import GL & payroll data, reconcile against app-tracked actuals — {currentFiscalYear?.name ?? 'No FY'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRulesModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            GL Rules
          </button>
          <button
            onClick={() => setShowImportWizard(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Import Data
          </button>
        </div>
      </div>

      {/* Import History */}
      <div className="bg-white rounded-2xl border border-slate-200 mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Import History</h2>
        </div>
        <ImportHistoryTable imports={imports} onDelete={deleteImport} />
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">External Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.externalTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">App Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.appTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Net Variance</p>
          <p className={`text-2xl font-bold mt-1 ${
            Math.abs(summary.netVariance) < 1 ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {formatCurrency(summary.netVariance)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Matched</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {summary.matchedCount}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {summary.totalRows}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Statuses</option>
          <option value="matched">Matched</option>
          <option value="variance">Variance</option>
          <option value="external-only">External Only</option>
          <option value="app-only">App Only</option>
        </select>
        {rows.length > 0 && (
          <button
            onClick={handleExportReconciliation}
            className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        )}
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <ReconciliationTable
          rows={filteredRows}
          glEntries={glEntries}
          payrollEntries={payrollEntries}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-slate-500">
        {filteredRows.length} cost centre{filteredRows.length !== 1 ? 's' : ''}
        {statusFilter !== 'all' && ` (filtered from ${rows.length})`}
      </div>

      {/* Modals */}
      <ImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onImport={handleImport}
        fiscalYears={fiscalYears}
        glAccountRules={rules}
        projectCostCentres={projectCostCentres}
      />

      <GLAccountRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        rules={rules}
        onAdd={addRule}
        onDelete={deleteRule}
      />
    </div>
  );
};

export default GeneralLedger;
