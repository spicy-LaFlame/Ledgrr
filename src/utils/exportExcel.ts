import * as XLSX from 'xlsx';
import type {
  ProjectSummaryReport,
  TeamAllocationReport,
  QuarterlyClaimsReport,
} from '../hooks/useReportData';
import { formatTimestamp } from './formatters';

function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}

function setCurrencyFormat(ws: XLSX.WorkSheet, row: number, cols: number[], fmt: string = '$#,##0') {
  for (const col of cols) {
    const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
    if (cell) cell.z = fmt;
  }
}

// =============================================================================
// REPORT 1: PROJECT SUMMARY
// =============================================================================

export function generateProjectSummaryExcel(data: ProjectSummaryReport): void {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Project', 'Code', 'Funder', 'Status', 'Cost Centre',
    'FY Budget', 'Salary (Budget)', 'Salary (Actual)',
    'Expenses (Budget)', 'Expenses (Actual)',
    'Total Budgeted', 'Total Actual', 'Variance', 'Utilization %',
  ];

  const aoa: (string | number | null)[][] = [
    ['Innovation Budget Tracker — Project Summary Report'],
    [`FY ${data.fiscalYear} | Generated: ${formatTimestamp(data.generatedAt)}`],
    [],
    headers,
  ];

  for (const row of data.rows) {
    aoa.push([
      row.projectName, row.projectCode, row.funderName, row.status, row.costCentre,
      row.fiscalYearBudget, row.salaryBudgeted, row.salaryActual,
      row.expenseBudgeted, row.expenseActual,
      row.totalBudgeted, row.totalActual, row.variance,
      Math.round(row.utilizationPct * 10) / 10,
    ]);
  }

  // Totals
  aoa.push([]);
  aoa.push([
    'TOTALS', '', '', '', '',
    data.totals.fiscalYearBudget, data.totals.salaryBudgeted, data.totals.salaryActual,
    data.totals.expenseBudgeted, data.totals.expenseActual,
    data.totals.totalBudgeted, data.totals.totalActual, data.totals.variance, null,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws['!cols'] = [
    { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 15 }, { wch: 15 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
  ];

  // Apply currency format to data rows
  const currencyCols = [5, 6, 7, 8, 9, 10, 11, 12];
  for (let r = 4; r < aoa.length; r++) {
    setCurrencyFormat(ws, r, currencyCols);
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Project Summary');
  downloadWorkbook(wb, `Project_Summary_FY${data.fiscalYear}.xlsx`);
}

// =============================================================================
// REPORT 2: TEAM ALLOCATION
// =============================================================================

export function generateTeamAllocationExcel(data: TeamAllocationReport): void {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Employee', 'Role', 'Organization', 'Project',
    'Cash Hrs (Budget)', 'Cash Hrs (Actual)', 'Cash $ (Budget)', 'Cash $ (Actual)',
    'In-Kind Hrs (Budget)', 'In-Kind Hrs (Actual)', 'In-Kind $ (Budget)', 'In-Kind $ (Actual)',
    'Allocation %',
  ];

  const aoa: (string | number | null)[][] = [
    ['Innovation Budget Tracker — Team Allocation Report'],
    [`${data.quarter} | Generated: ${formatTimestamp(data.generatedAt)}`],
    [],
    headers,
  ];

  for (const emp of data.rows) {
    // First project row includes employee info
    if (emp.projects.length === 0) {
      aoa.push([
        emp.employeeName, emp.role, emp.organization, '(no allocations)',
        0, 0, 0, 0, 0, 0, 0, 0,
        Math.round(emp.allocationPct * 10) / 10,
      ]);
    } else {
      for (let i = 0; i < emp.projects.length; i++) {
        const proj = emp.projects[i];
        aoa.push([
          i === 0 ? emp.employeeName : '',
          i === 0 ? emp.role : '',
          i === 0 ? emp.organization : '',
          `${proj.projectCode} — ${proj.projectName}`,
          proj.cashBudgetedHours, proj.cashActualHours, proj.cashBudgetedCost, proj.cashActualCost,
          proj.inKindBudgetedHours, proj.inKindActualHours, proj.inKindBudgetedCost, proj.inKindActualCost,
          i === 0 ? Math.round(emp.allocationPct * 10) / 10 : null,
        ]);
      }

      // Employee subtotal row
      aoa.push([
        '', '', '', 'SUBTOTAL',
        emp.totalCashBudgetedHours, emp.totalCashActualHours,
        emp.totalCashBudgetedCost, emp.totalCashActualCost,
        emp.totalInKindBudgetedHours, emp.totalInKindActualHours,
        emp.totalInKindBudgetedCost, emp.totalInKindActualCost,
        null,
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws['!cols'] = [
    { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 28 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    { wch: 12 },
  ];

  // Apply currency format
  const currencyCols = [6, 7, 10, 11];
  for (let r = 4; r < aoa.length; r++) {
    setCurrencyFormat(ws, r, currencyCols);
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Team Allocation');

  const qtrLabel = data.quarter.replace(/\s+/g, '_');
  downloadWorkbook(wb, `Team_Allocation_${qtrLabel}.xlsx`);
}

// =============================================================================
// REPORT 3: QUARTERLY CLAIMS BACKUP
// =============================================================================

export function generateQuarterlyClaimsExcel(data: QuarterlyClaimsReport): void {
  const wb = XLSX.utils.book_new();

  const aoa: (string | number | null)[][] = [
    ['Innovation Budget Tracker — Quarterly Claims Backup'],
    [`Project: ${data.projectName} (${data.projectCode})`],
    [`Funder: ${data.funderName} | Cost Centre: ${data.costCentre} | Benefits Cap: ${data.benefitsCapPct}%`],
    [`FY ${data.fiscalYear} | Generated: ${formatTimestamp(data.generatedAt)}`],
    [],
  ];

  for (const q of data.quarters) {
    // Quarter header
    aoa.push([`=== ${q.quarterName} ===`]);
    aoa.push([]);

    // Salary section
    if (q.salaryItems.length > 0) {
      aoa.push([
        'SALARY COSTS', '', '', '', '', '', '', '',
      ]);
      aoa.push([
        'Employee', 'Role', 'Hours', 'Base Rate', 'Benefits Rate',
        'Base Cost', 'Benefits Cost', 'Funded Cost', 'Hospital Covers', 'In-Kind',
      ]);

      for (const item of q.salaryItems) {
        aoa.push([
          item.employeeName, item.role, item.hours,
          item.baseRate, item.benefitsRate,
          item.baseCost, item.benefitsCost, item.fundedCost, item.hospitalCovers,
          item.isInKind ? 'Yes' : 'No',
        ]);
      }

      aoa.push([
        '', '', '', '', 'Salary Subtotal:', '', '', q.salarySub, '', '',
      ]);
    }

    aoa.push([]);

    // Expense section
    if (q.expenseItems.length > 0) {
      aoa.push(['NON-SALARY EXPENSES']);
      aoa.push(['Category', 'Description', 'Amount', 'Payment Method']);

      for (const item of q.expenseItems) {
        aoa.push([item.category, item.description, item.amount, item.paymentMethod]);
      }

      aoa.push(['', 'Expense Subtotal:', q.expenseSub, '']);
    }

    aoa.push([]);
    aoa.push(['', '', '', '', `${q.quarterName} TOTAL:`, '', '', q.quarterTotal]);
    aoa.push([]);
    aoa.push([]);
  }

  // Grand total
  aoa.push(['']);
  aoa.push(['', '', '', '', 'GRAND TOTAL:', '', '', data.grandTotal]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws['!cols'] = [
    { wch: 22 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 10 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Claims Backup');
  downloadWorkbook(wb, `Claims_${data.projectCode}_FY${data.fiscalYear}.xlsx`);
}
