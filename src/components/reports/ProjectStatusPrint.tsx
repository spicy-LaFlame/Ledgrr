import type { ProjectStatusData } from '../../hooks/useReportData';
import { formatCurrency, formatDate, formatTimestamp, formatPercent } from '../../utils/formatters';

function urgencyColor(urgency: string): { bg: string; text: string } {
  switch (urgency) {
    case 'RED': return { bg: '#fee2e2', text: '#b91c1c' };
    case 'YELLOW': return { bg: '#fef3c7', text: '#b45309' };
    default: return { bg: '#d1fae5', text: '#047857' };
  }
}

function progressColor(pct: number): string {
  if (pct > 100) return '#b91c1c';
  if (pct >= 80) return '#b45309';
  return '#047857';
}

export function generateProjectStatusHTML(data: ProjectStatusData): string {
  const urg = urgencyColor(data.urgency);
  const progColor = progressColor(data.utilizationPct);
  const progWidth = Math.min(data.utilizationPct, 100);

  const quarterRows = data.quarterlyData.map(q => `
    <td style="text-align:right;padding:3px 6px;">${formatCurrency(q.salaryBudgeted)}</td>
    <td style="text-align:right;padding:3px 6px;">${formatCurrency(q.salaryActual)}</td>
    <td style="text-align:right;padding:3px 6px;">${formatCurrency(q.expenseBudgeted)}</td>
    <td style="text-align:right;padding:3px 6px;">${formatCurrency(q.expenseActual)}</td>
  `).join('');

  const quarterHeaders = data.quarterlyData.map(q =>
    `<th colspan="4" style="text-align:center;padding:4px 6px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;">${q.quarterName}</th>`
  ).join('');

  const quarterSubHeaders = data.quarterlyData.map(() =>
    `<th style="text-align:right;padding:3px 4px;font-size:8px;color:#94a3b8;">Sal B</th>
     <th style="text-align:right;padding:3px 4px;font-size:8px;color:#94a3b8;">Sal A</th>
     <th style="text-align:right;padding:3px 4px;font-size:8px;color:#94a3b8;">Exp B</th>
     <th style="text-align:right;padding:3px 4px;font-size:8px;color:#94a3b8;">Exp A</th>`
  ).join('');

  const teamRows = data.teamMembers.map(m => `
    <tr>
      <td style="padding:3px 6px;">${m.name}</td>
      <td style="padding:3px 6px;">${m.role}</td>
      <td style="text-align:right;padding:3px 6px;">${m.budgetedHours}</td>
      <td style="text-align:right;padding:3px 6px;">${m.actualHours}</td>
      <td style="text-align:center;padding:3px 6px;">${m.isInKind ? '<span style="background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:3px;font-size:9px;">In-Kind</span>' : ''}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>Project Status — ${data.projectName}</title>
  <style>
    @page { size: letter; margin: 0.5in; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; max-width: 7.5in; }
    .header { border-bottom: 2px solid #1e293b; padding-bottom: 8px; margin-bottom: 14px; }
    .header h1 { font-size: 11px; margin: 0; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 20px; margin: 4px 0 2px; }
    .header .meta { font-size: 10px; color: #64748b; }
    .section { margin-bottom: 14px; }
    .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 8px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3px 20px; font-size: 10px; }
    .meta-label { color: #94a3b8; font-size: 9px; }
    .meta-value { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { text-align: left; padding: 4px 6px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; font-size: 9px; }
    td { padding: 3px 6px; border-bottom: 1px solid #f1f5f9; }
    .totals td { font-weight: bold; border-top: 2px solid #e2e8f0; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .progress-fill { height: 100%; border-radius: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    .footer { margin-top: 14px; font-size: 8px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 6px; }
    .spending-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .spending-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
    .spending-box .label { font-size: 9px; color: #64748b; }
    .spending-box .values { display: flex; justify-content: space-around; margin-top: 4px; }
    .spending-box .val { font-size: 11px; font-weight: 700; }
    .spending-box .sub { font-size: 8px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Innovation Budget Tracker</h1>
    <h2>${data.projectName}</h2>
    <div class="meta">Generated: ${formatTimestamp(data.generatedAt)} | FY ${data.fiscalYear}</div>
  </div>

  <!-- Project Metadata -->
  <div class="section">
    <div class="section-title">Project Details</div>
    <div class="meta-grid">
      <div><span class="meta-label">Funder</span><br/><span class="meta-value">${data.funderName}</span></div>
      <div><span class="meta-label">Code</span><br/><span class="meta-value">${data.projectCode}</span></div>
      <div><span class="meta-label">Cost Centre</span><br/><span class="meta-value">${data.costCentre}</span></div>
      <div><span class="meta-label">PI</span><br/><span class="meta-value">${data.principalInvestigator}</span></div>
      <div><span class="meta-label">Status</span><br/><span class="meta-value" style="text-transform:capitalize;">${data.status}</span></div>
      <div><span class="meta-label">Timeline</span><br/><span class="meta-value">${formatDate(data.timeline.start)} — ${data.timeline.end ? formatDate(data.timeline.end) : 'Ongoing'}</span></div>
    </div>
  </div>

  <!-- Budget Overview -->
  <div class="section">
    <div class="section-title">Budget Overview</div>
    <div class="meta-grid">
      <div><span class="meta-label">Total Budget</span><br/><span class="meta-value">${formatCurrency(data.totalBudget)}</span></div>
      <div><span class="meta-label">FY Budget</span><br/><span class="meta-value">${formatCurrency(data.fiscalYearBudget)}</span></div>
      <div><span class="meta-label">In-Kind Budget</span><br/><span class="meta-value">${formatCurrency(data.inKindBudget)}</span></div>
      <div><span class="meta-label">Benefits Cap</span><br/><span class="meta-value">${data.benefitsCapPct}% (${data.benefitsCapType === 'percentage-of-wages' ? 'of wages' : 'of benefits'})</span></div>
    </div>
  </div>

  <!-- Spending Summary -->
  <div class="section">
    <div class="section-title">Spending Summary</div>
    <div class="spending-grid">
      <div class="spending-box">
        <div class="label">Salary</div>
        <div class="values">
          <div><div class="sub">Budget</div><div class="val">${formatCurrency(data.salaryBudgeted)}</div></div>
          <div><div class="sub">Actual</div><div class="val">${formatCurrency(data.salaryActual)}</div></div>
        </div>
      </div>
      <div class="spending-box">
        <div class="label">Expenses</div>
        <div class="values">
          <div><div class="sub">Budget</div><div class="val">${formatCurrency(data.expenseBudgeted)}</div></div>
          <div><div class="sub">Actual</div><div class="val">${formatCurrency(data.expenseActual)}</div></div>
        </div>
      </div>
      <div class="spending-box">
        <div class="label">Total</div>
        <div class="values">
          <div><div class="sub">Budget</div><div class="val">${formatCurrency(data.totalBudgeted)}</div></div>
          <div><div class="sub">Actual</div><div class="val">${formatCurrency(data.totalActual)}</div></div>
        </div>
      </div>
    </div>
    <div style="margin-top:8px;">
      <div style="display:flex;justify-content:space-between;font-size:10px;">
        <span style="color:#64748b;">Budget Utilization</span>
        <span style="font-weight:700;color:${progColor};">${formatPercent(data.utilizationPct)}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progWidth}%;background:${progColor};"></div>
      </div>
    </div>
  </div>

  <!-- Quarterly Breakdown -->
  ${data.quarterlyData.length > 0 ? `
  <div class="section">
    <div class="section-title">Quarterly Breakdown</div>
    <table>
      <thead>
        <tr><th></th>${quarterHeaders}</tr>
        <tr><th></th>${quarterSubHeaders}</tr>
      </thead>
      <tbody>
        <tr><td style="font-weight:600;">Amounts</td>${quarterRows}</tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Team Members -->
  ${data.teamMembers.length > 0 ? `
  <div class="section">
    <div class="section-title">Team Allocation (${data.teamMembers.length} members)</div>
    <table>
      <thead>
        <tr>
          <th>Employee</th><th>Role</th>
          <th style="text-align:right;">Hrs (Budget)</th>
          <th style="text-align:right;">Hrs (Actual)</th>
          <th style="text-align:center;">Type</th>
        </tr>
      </thead>
      <tbody>${teamRows}</tbody>
    </table>
  </div>
  ` : ''}

  <!-- Funding Status -->
  <div class="section" style="text-align:center;">
    <span class="badge" style="background:${urg.bg};color:${urg.text};">
      Funding Status: ${data.urgency}${data.daysRemaining !== undefined ? ` — ${data.daysRemaining} days remaining` : ''}
    </span>
  </div>

  <div class="footer">
    Innovation Budget Tracker | Bruyere Health | Confidential
  </div>
</body>
</html>`;
}
