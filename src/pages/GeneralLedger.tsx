import { useState, useMemo, useCallback } from 'react';
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

import { formatCurrency } from '../utils/formatters';
import { FilterBar, type FilterValues } from '../components/shared/FilterBar';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';

type StatusFilterType = ReconciliationRow['status'];

const GeneralLedger: React.FC = () => {
  const { currentFiscalYear, fiscalYears } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';

  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({ status: [] });
  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setFilterValues(prev => ({ ...prev, [key]: values }));
  }, []);

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
    if (filterValues.status.length === 0) return rows;
    return rows.filter(r => (filterValues.status as StatusFilterType[]).includes(r.status));
  }, [rows, filterValues.status]);

  const filteredSummary = useMemo(() => computeSummary(filteredRows), [filteredRows]);

  const handleImport = async (result: ImportResult) => {
    const importId = uuidv4();
    const now = new Date().toISOString();

    await addImport({
      type: result.type,
      fileName: result.fileName,
      fiscalYearId: result.fiscalYearId,
      importDate: now,
      rowCount: result.glEntries?.length ?? result.payrollEntries?.length ?? 0,
      columnMapping: result.columnMapping,
    });

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

    const fmt = '$#,##0.00';
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
      <PageHeader
        title="General Ledger"
        subtitle={`Import GL & payroll data, reconcile against app-tracked actuals \u2014 ${currentFiscalYear?.name ?? 'No FY'}`}
        actions={
          <>
            {rows.length > 0 && (
              <Button variant="secondary" onClick={handleExportReconciliation} icon={<Download className="w-4 h-4" />}>
                Export
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowRulesModal(true)} icon={<Settings2 className="w-4 h-4" />}>
              GL Rules
            </Button>
            <Button onClick={() => setShowImportWizard(true)} icon={<Plus className="w-4 h-4" />}>
              Import Data
            </Button>
          </>
        }
      />

      {/* Import History */}
      <Card className="mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-cyan-900">Import History</h2>
        </div>
        <ImportHistoryTable imports={imports} onDelete={deleteImport} />
      </Card>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">External Total</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{formatCurrency(summary.externalTotal)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">App Total</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{formatCurrency(summary.appTotal)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Net Variance</p>
          <p className={`text-2xl font-bold mt-1 ${
            Math.abs(summary.netVariance) < 1 ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {formatCurrency(summary.netVariance)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Matched</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {summary.matchedCount}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {summary.totalRows}</span>
          </p>
        </Card>
      </div>

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search cost centres..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            placeholder: 'All Statuses',
            options: [
              { value: 'matched', label: 'Matched' },
              { value: 'variance', label: 'Variance' },
              { value: 'external-only', label: 'External Only' },
              { value: 'app-only', label: 'App Only' },
            ],
          },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        resultCount={filteredRows.length}
        resultLabel={`cost centre${filteredRows.length !== 1 ? 's' : ''}`}
        totalCount={rows.length}
      />

      {/* Reconciliation Table */}
      <Card className="overflow-hidden">
        <ReconciliationTable
          rows={filteredRows}
          glEntries={glEntries}
          payrollEntries={payrollEntries}
        />
      </Card>

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
