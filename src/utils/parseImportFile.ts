import * as XLSX from 'xlsx';
import type { ColumnMapping, ImportType } from '../db/schema';

export interface ParsedFile {
  headers: string[];
  rows: unknown[][];
  sheetNames: string[];
  selectedSheet: string;
}

export interface ParseOptions {
  sheetIndex?: number;
  headerRow?: number; // 0-based row index for headers (default: 0)
}

/**
 * Parse an Excel or CSV file and return headers + rows.
 */
export async function parseFile(file: File, options?: ParseOptions): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheetNames = workbook.SheetNames;
  const sheetIndex = options?.sheetIndex ?? 0;
  const selectedSheet = sheetNames[sheetIndex] ?? sheetNames[0];
  const sheet = workbook.Sheets[selectedSheet];

  const headerRow = options?.headerRow ?? 0;

  // Get all data as array of arrays
  const allRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  });

  if (allRows.length === 0) {
    return { headers: [], rows: [], sheetNames, selectedSheet };
  }

  // Extract headers from the specified row
  const headers = (allRows[headerRow] as unknown[]).map(h =>
    String(h ?? '').trim()
  );

  // Data rows start after the header row
  const rows = allRows.slice(headerRow + 1).filter(row =>
    // Skip completely empty rows
    (row as unknown[]).some(cell => cell !== '' && cell !== null && cell !== undefined)
  );

  return { headers, rows, sheetNames, selectedSheet };
}

/**
 * Auto-detect column mapping by matching headers to known keywords.
 */
export function autoDetectMapping(
  headers: string[],
  importType: ImportType
): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};
  const lowerHeaders = headers.map(h => h.toLowerCase());

  const findMatch = (keywords: string[]): string | undefined => {
    for (const keyword of keywords) {
      const idx = lowerHeaders.findIndex(h => h.includes(keyword));
      if (idx >= 0) return headers[idx];
    }
    return undefined;
  };

  // Common fields
  mapping.costCentre = findMatch(['cost centre', 'cost center', 'costcentre', 'costcenter', 'cc', 'cost ctr']);
  mapping.description = findMatch(['description', 'desc', 'memo', 'narrative']);
  mapping.transactionDate = findMatch(['date', 'trans date', 'transaction date', 'posting date']);

  if (importType === 'general-ledger') {
    mapping.amount = findMatch(['amount', 'net amount', 'net', 'debit', 'total']);
    mapping.creditColumn = findMatch(['credit']);
    mapping.glCode = findMatch(['gl code', 'gl account', 'account', 'acct', 'gl #', 'account code']);
    mapping.journalEntry = findMatch(['journal', 'je', 'je #', 'journal entry', 'journal #', 'doc number']);
    mapping.vendor = findMatch(['vendor', 'payee', 'supplier']);
    mapping.period = findMatch(['period', 'fiscal period', 'posting period']);
  } else {
    // Payroll
    mapping.earnings = findMatch(['earnings', 'gross pay', 'gross', 'total earnings', 'amount']);
    mapping.employeeName = findMatch(['employee name', 'name', 'employee', 'full name']);
    mapping.employeeId = findMatch(['employee id', 'emp id', 'emp #', 'employee number', 'id']);
    mapping.payPeriodStart = findMatch(['pay period start', 'period start', 'start date', 'pp start']);
    mapping.payPeriodEnd = findMatch(['pay period end', 'period end', 'end date', 'pp end']);
    mapping.regularHours = findMatch(['regular hours', 'reg hours', 'hours', 'regular']);
    mapping.overtimeHours = findMatch(['overtime hours', 'ot hours', 'overtime', 'ot']);
    mapping.benefits = findMatch(['benefits', 'benefit', 'employer benefits', 'er benefits']);
    mapping.deductions = findMatch(['deductions', 'deduction', 'total deductions']);
    mapping.netPay = findMatch(['net pay', 'net', 'take home']);
  }

  return mapping;
}

/**
 * Apply column mapping to raw rows and return typed data.
 * Returns the mapped value for a given column header from a row.
 */
export function getMappedValue(
  row: unknown[],
  headers: string[],
  columnName: string | undefined
): string {
  if (!columnName) return '';
  const idx = headers.indexOf(columnName);
  if (idx < 0 || idx >= row.length) return '';
  const val = row[idx];
  return val === null || val === undefined ? '' : String(val).trim();
}

export function getMappedNumber(
  row: unknown[],
  headers: string[],
  columnName: string | undefined
): number | null {
  const str = getMappedValue(row, headers, columnName);
  if (str === '') return null;
  // Remove currency symbols, commas, parens for negative
  const cleaned = str.replace(/[$,]/g, '').replace(/\((.+)\)/, '-$1');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Match a GL code against a wildcard pattern.
 * Supports trailing wildcard: "50*" matches "5000", "5010", etc.
 */
export function matchesGLCodePattern(glCode: string, pattern: string): boolean {
  if (!glCode || !pattern) return false;
  const trimmedPattern = pattern.trim();
  const trimmedCode = glCode.trim();

  if (trimmedPattern.endsWith('*')) {
    const prefix = trimmedPattern.slice(0, -1);
    return trimmedCode.startsWith(prefix);
  }
  return trimmedCode === trimmedPattern;
}
