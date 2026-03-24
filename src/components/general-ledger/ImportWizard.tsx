import { useState, useRef, useCallback } from 'react';
import { Upload, ChevronRight, ChevronLeft, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../shared/Modal';
import type {
  ImportType,
  ColumnMapping,
  GLAccountRule,
  GLLineCategory,
} from '../../db/schema';
import {
  parseFile,
  autoDetectMapping,
  getMappedValue,
  getMappedNumber,
  matchesGLCodePattern,
  type ParsedFile,
} from '../../utils/parseImportFile';

export interface ImportResult {
  type: ImportType;
  fileName: string;
  fiscalYearId: string;
  columnMapping: ColumnMapping;
  glEntries?: Array<{
    importId: string;
    fiscalYearId: string;
    costCentre: string;
    glCode?: string;
    amount: number;
    description?: string;
    transactionDate?: string;
    journalEntry?: string;
    vendor?: string;
    period?: string;
    category: GLLineCategory;
    rawRowData?: string;
  }>;
  payrollEntries?: Array<{
    importId: string;
    fiscalYearId: string;
    costCentre: string;
    employeeName?: string;
    employeeId?: string;
    payPeriodStart?: string;
    payPeriodEnd?: string;
    regularHours?: number;
    overtimeHours?: number;
    earnings: number;
    benefits?: number;
    deductions?: number;
    netPay?: number;
    rawRowData?: string;
  }>;
}

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (result: ImportResult) => Promise<void>;
  fiscalYears: Array<{ id: string; name: string; isCurrent: boolean }>;
  glAccountRules: GLAccountRule[];
  projectCostCentres: string[];
}

type Step = 1 | 2 | 3;

const ImportWizard: React.FC<ImportWizardProps> = ({
  isOpen,
  onClose,
  onImport,
  fiscalYears,
  glAccountRules,
  projectCostCentres,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [importType, setImportType] = useState<ImportType>('general-ledger');
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [fileName, setFileName] = useState('');
  const [headerRow, setHeaderRow] = useState(0);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [fiscalYearId, setFiscalYearId] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const currentFY = fiscalYears.find(fy => fy.isCurrent);

  const resetState = useCallback(() => {
    setStep(1);
    setImportType('general-ledger');
    setParsedFile(null);
    setFileName('');
    setHeaderRow(0);
    setSelectedSheet(0);
    setMapping({});
    setFiscalYearId(currentFY?.id ?? '');
    setIsImporting(false);
    setError('');
  }, [currentFY]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    try {
      const parsed = await parseFile(file, { sheetIndex: selectedSheet, headerRow });
      setParsedFile(parsed);
      setFileName(file.name);

      // Auto-detect mapping
      const detected = autoDetectMapping(parsed.headers, importType);
      setMapping(detected);

      if (!fiscalYearId && currentFY) {
        setFiscalYearId(currentFY.id);
      }
    } catch (err) {
      setError('Failed to parse file. Ensure it is a valid Excel or CSV file.');
      console.error(err);
    }
  };

  const handleReparse = async () => {
    if (!fileRef.current?.files?.[0]) return;
    try {
      const parsed = await parseFile(fileRef.current.files[0], {
        sheetIndex: selectedSheet,
        headerRow,
      });
      setParsedFile(parsed);
      const detected = autoDetectMapping(parsed.headers, importType);
      setMapping(detected);
    } catch (err) {
      setError('Failed to re-parse file.');
      console.error(err);
    }
  };

  const classifyGLCode = (glCode: string | undefined): GLLineCategory => {
    if (!glCode) return 'unclassified';
    for (const rule of glAccountRules) {
      if (matchesGLCodePattern(glCode, rule.glCodePattern)) {
        return rule.category;
      }
    }
    return 'unclassified';
  };

  const buildImportResult = (): ImportResult | null => {
    if (!parsedFile || !fiscalYearId) return null;

    const { headers, rows } = parsedFile;
    const importId = ''; // Will be set by the parent

    if (importType === 'general-ledger') {
      if (!mapping.costCentre || !mapping.amount) return null;

      const glEntries = [];
      for (const row of rows) {
        const r = row as unknown[];
        const costCentre = getMappedValue(r, headers, mapping.costCentre);
        const amount = getMappedNumber(r, headers, mapping.amount);
        const credit = getMappedNumber(r, headers, mapping.creditColumn);

        if (!costCentre || amount === null) continue;

        const netAmount = credit !== null ? amount - credit : amount;
        const glCode = getMappedValue(r, headers, mapping.glCode) || undefined;

        glEntries.push({
          importId,
          fiscalYearId,
          costCentre,
          glCode,
          amount: netAmount,
          description: getMappedValue(r, headers, mapping.description) || undefined,
          transactionDate: getMappedValue(r, headers, mapping.transactionDate) || undefined,
          journalEntry: getMappedValue(r, headers, mapping.journalEntry) || undefined,
          vendor: getMappedValue(r, headers, mapping.vendor) || undefined,
          period: getMappedValue(r, headers, mapping.period) || undefined,
          category: classifyGLCode(glCode),
          rawRowData: JSON.stringify(r),
        });
      }

      return {
        type: 'general-ledger',
        fileName,
        fiscalYearId,
        columnMapping: mapping as ColumnMapping,
        glEntries,
      };
    } else {
      // Payroll
      if (!mapping.costCentre || (!mapping.earnings && !mapping.amount)) return null;

      const earningsCol = mapping.earnings || mapping.amount;
      const payrollEntries = [];
      for (const row of rows) {
        const r = row as unknown[];
        const costCentre = getMappedValue(r, headers, mapping.costCentre);
        const earnings = getMappedNumber(r, headers, earningsCol);

        if (!costCentre || earnings === null) continue;

        payrollEntries.push({
          importId,
          fiscalYearId,
          costCentre,
          employeeName: getMappedValue(r, headers, mapping.employeeName) || undefined,
          employeeId: getMappedValue(r, headers, mapping.employeeId) || undefined,
          payPeriodStart: getMappedValue(r, headers, mapping.payPeriodStart) || undefined,
          payPeriodEnd: getMappedValue(r, headers, mapping.payPeriodEnd) || undefined,
          regularHours: getMappedNumber(r, headers, mapping.regularHours) ?? undefined,
          overtimeHours: getMappedNumber(r, headers, mapping.overtimeHours) ?? undefined,
          earnings,
          benefits: getMappedNumber(r, headers, mapping.benefits) ?? undefined,
          deductions: getMappedNumber(r, headers, mapping.deductions) ?? undefined,
          netPay: getMappedNumber(r, headers, mapping.netPay) ?? undefined,
          rawRowData: JSON.stringify(r),
        });
      }

      return {
        type: 'payroll',
        fileName,
        fiscalYearId,
        columnMapping: mapping as ColumnMapping,
        payrollEntries,
      };
    }
  };

  const handleImport = async () => {
    const result = buildImportResult();
    if (!result) return;

    setIsImporting(true);
    try {
      await onImport(result);
      handleClose();
    } catch (err) {
      setError('Import failed. Please try again.');
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  // Compute stats for step 3
  const importResult = step === 3 ? buildImportResult() : null;
  const entryCount = importResult?.glEntries?.length ?? importResult?.payrollEntries?.length ?? 0;
  const uniqueCostCentres = new Set(
    (importResult?.glEntries ?? importResult?.payrollEntries ?? []).map(e => e.costCentre)
  );
  const matchedCostCentres = [...uniqueCostCentres].filter(cc => projectCostCentres.includes(cc));
  const glCategoryCounts = importResult?.glEntries?.reduce(
    (acc, e) => {
      acc[e.category]++;
      return acc;
    },
    { salary: 0, expense: 0, unclassified: 0 } as Record<GLLineCategory, number>
  );

  const isStep2Valid = importType === 'general-ledger'
    ? !!(mapping.costCentre && mapping.amount)
    : !!(mapping.costCentre && (mapping.earnings || mapping.amount));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Data"
      maxWidth="2xl"
      footer={
        <div className="flex justify-between w-full">
          <button
            onClick={step === 1 ? handleClose : () => setStep((step - 1) as Step)}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {step === 1 ? 'Cancel' : (
              <span className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </span>
            )}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as Step)}
              disabled={step === 1 ? !parsedFile : !isStep2Valid}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={isImporting || !fiscalYearId || entryCount === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isImporting ? 'Importing...' : `Import ${entryCount} Entries`}
            </button>
          )}
        </div>
      }
    >
      <div className="p-6">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                s === step ? 'bg-cyan-600 text-white' : s < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {s}
              </div>
              <span className="text-xs text-slate-500">
                {s === 1 ? 'File' : s === 2 ? 'Mapping' : 'Review'}
              </span>
              {s < 3 && <ChevronRight className="w-3 h-3 text-slate-300" />}
            </div>
          ))}
        </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Import type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Import Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['general-ledger', 'payroll'] as ImportType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setImportType(type)}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        importType === type
                          ? 'border-cyan-600 bg-cyan-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {type === 'general-ledger' ? 'General Ledger' : 'Payroll (UKG)'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {type === 'general-ledger'
                          ? 'GL export with account codes, amounts, and cost centres'
                          : 'UKG payroll export with employee-level pay details'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* File picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">File</label>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  {parsedFile ? (
                    <div>
                      <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">{fileName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {parsedFile.headers.length} columns, {parsedFile.rows.length} rows
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Click to select an Excel or CSV file</p>
                      <p className="text-xs text-slate-400 mt-1">.xlsx, .xls, .csv</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Sheet & header row */}
              {parsedFile && (
                <div className="grid grid-cols-2 gap-4">
                  {parsedFile.sheetNames.length > 1 && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Sheet</label>
                      <select
                        value={selectedSheet}
                        onChange={e => {
                          setSelectedSheet(Number(e.target.value));
                          // Re-parse will happen via effect
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        {parsedFile.sheetNames.map((name, idx) => (
                          <option key={idx} value={idx}>{name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Header Row</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={headerRow + 1}
                        onChange={e => setHeaderRow(Math.max(0, Number(e.target.value) - 1))}
                        min={1}
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={handleReparse}
                        className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        Re-detect
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {parsedFile && parsedFile.rows.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Preview (first 5 rows)</p>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          {parsedFile.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">
                              {h || `Col ${i + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedFile.rows.slice(0, 5).map((row, ri) => (
                          <tr key={ri} className="border-t border-slate-100">
                            {(row as unknown[]).slice(0, parsedFile.headers.length).map((cell, ci) => (
                              <td key={ci} className="px-3 py-1.5 text-slate-700 whitespace-nowrap max-w-[150px] truncate">
                                {String(cell ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 2 && parsedFile && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Map your file columns to the required fields.
                {importType === 'general-ledger' ? ' Cost Centre and Amount are required.' : ' Cost Centre and Earnings are required.'}
              </p>

              {importType === 'general-ledger' ? (
                <div className="space-y-3">
                  <MappingField label="Cost Centre *" field="costCentre" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Amount / Debit *" field="amount" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Credit (optional)" field="creditColumn" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="GL Account Code" field="glCode" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Description" field="description" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Transaction Date" field="transactionDate" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Journal Entry #" field="journalEntry" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Vendor" field="vendor" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Period" field="period" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                </div>
              ) : (
                <div className="space-y-3">
                  <MappingField label="Cost Centre *" field="costCentre" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Earnings / Gross Pay *" field="earnings" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Employee Name" field="employeeName" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Employee ID" field="employeeId" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Pay Period Start" field="payPeriodStart" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Pay Period End" field="payPeriodEnd" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Regular Hours" field="regularHours" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Overtime Hours" field="overtimeHours" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Benefits" field="benefits" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Deductions" field="deductions" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                  <MappingField label="Net Pay" field="netPay" headers={parsedFile.headers} mapping={mapping} setMapping={setMapping} />
                </div>
              )}

              {/* Mapped preview */}
              {parsedFile.rows.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Mapped Preview (3 rows)</p>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Cost Centre</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">
                            {importType === 'general-ledger' ? 'Amount' : 'Earnings'}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            {importType === 'general-ledger' ? 'GL Code' : 'Employee'}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedFile.rows.slice(0, 3).map((row, ri) => {
                          const r = row as unknown[];
                          const amountCol = importType === 'general-ledger' ? mapping.amount : (mapping.earnings || mapping.amount);
                          return (
                            <tr key={ri} className="border-t border-slate-100">
                              <td className="px-3 py-1.5 text-slate-700">
                                {getMappedValue(r, parsedFile.headers, mapping.costCentre) || '—'}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-700">
                                {getMappedNumber(r, parsedFile.headers, amountCol)?.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }) ?? '—'}
                              </td>
                              <td className="px-3 py-1.5 text-slate-700">
                                {importType === 'general-ledger'
                                  ? getMappedValue(r, parsedFile.headers, mapping.glCode) || '—'
                                  : getMappedValue(r, parsedFile.headers, mapping.employeeName) || '—'}
                              </td>
                              <td className="px-3 py-1.5 text-slate-700 max-w-[200px] truncate">
                                {getMappedValue(r, parsedFile.headers, mapping.description) || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Fiscal year */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fiscal Year *</label>
                <select
                  value={fiscalYearId}
                  onChange={e => setFiscalYearId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  <option value="">Select fiscal year</option>
                  {fiscalYears.map(fy => (
                    <option key={fy.id} value={fy.id}>
                      {fy.name}{fy.isCurrent ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary stats */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Import Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Type:</span>{' '}
                    <span className="font-medium text-slate-900">
                      {importType === 'general-ledger' ? 'General Ledger' : 'Payroll (UKG)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">File:</span>{' '}
                    <span className="font-medium text-slate-900">{fileName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Entries to import:</span>{' '}
                    <span className="font-medium text-slate-900">{entryCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Unique cost centres:</span>{' '}
                    <span className="font-medium text-slate-900">{uniqueCostCentres.size}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Match existing projects:</span>{' '}
                    <span className="font-medium text-emerald-600">
                      {matchedCostCentres.length} of {uniqueCostCentres.size}
                    </span>
                  </div>
                  {uniqueCostCentres.size - matchedCostCentres.length > 0 && (
                    <div>
                      <span className="text-slate-500">Unmatched:</span>{' '}
                      <span className="font-medium text-amber-600">
                        {uniqueCostCentres.size - matchedCostCentres.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* GL category breakdown */}
                {glCategoryCounts && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <p className="text-xs font-medium text-slate-500">GL Line Classification</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600">{glCategoryCounts.salary} salary</span>
                      <span className="text-amber-600">{glCategoryCounts.expense} expense</span>
                      {glCategoryCounts.unclassified > 0 && (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {glCategoryCounts.unclassified} unclassified
                        </span>
                      )}
                    </div>
                    {glCategoryCounts.unclassified > 0 && (
                      <p className="text-xs text-red-500">
                        Set up GL Account Rules to classify these lines before importing.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </Modal>
  );
};

// =============================================================================
// MAPPING FIELD COMPONENT
// =============================================================================

function MappingField({
  label,
  field,
  headers,
  mapping,
  setMapping,
}: {
  label: string;
  field: keyof ColumnMapping;
  headers: string[];
  mapping: Partial<ColumnMapping>;
  setMapping: (m: Partial<ColumnMapping>) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-700 w-40 shrink-0">{label}</span>
      <select
        value={(mapping[field] as string) ?? ''}
        onChange={e => setMapping({ ...mapping, [field]: e.target.value || undefined })}
        className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 ${
          mapping[field] ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'
        }`}
      >
        <option value="">— Not mapped —</option>
        {headers.map((h, i) => (
          <option key={i} value={h}>{h}</option>
        ))}
      </select>
    </div>
  );
}

export default ImportWizard;
