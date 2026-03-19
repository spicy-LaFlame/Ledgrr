import { db } from '../db/schema';
import { calculateCost } from '../hooks/useEmployees';
import { buildSafeDashboardContext } from './sanitizer';
import { findRelevantChunks, isAgreementQuery } from './documents';
import type { SafeProjectData, SafeDashboardContext } from './types';

/**
 * Build safe aggregated context for AI queries.
 * No employee PII is included — only project-level totals.
 */
export async function buildQueryContext(fiscalYearId: string): Promise<{
  context: SafeDashboardContext;
  contextString: string;
}> {
  const [projects, funders, allocations, expenses, rates, fiscalYears] = await Promise.all([
    db.projects.filter(p => p.isActive && (p.status === 'active' || p.status === 'pipeline')).toArray(),
    db.funders.toArray(),
    db.salaryAllocations.where('fiscalYearId').equals(fiscalYearId).toArray(),
    db.expenses.where('fiscalYearId').equals(fiscalYearId).toArray(),
    db.employeeRates.where('fiscalYearId').equals(fiscalYearId).toArray(),
    db.fiscalYears.toArray(),
  ]);

  const funderMap = new Map(funders.map(f => [f.id, f]));
  const currentFY = fiscalYears.find(fy => fy.id === fiscalYearId);
  const rateMap = new Map(rates.map(r => [`${r.employeeId}|${r.quarterId}`, r]));

  let totalBudget = 0;
  let totalSpent = 0;

  const projectData: SafeProjectData[] = projects.map(project => {
    const funder = funderMap.get(project.funderId);
    const projAllocations = allocations.filter(a => a.projectId === project.id);
    const projExpenses = expenses.filter(e => e.projectId === project.id);

    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';

    let salaryBudgeted = 0;
    let salaryActual = 0;
    let teamEmployees = new Set<string>();

    for (const alloc of projAllocations) {
      teamEmployees.add(alloc.employeeId);
      const rate = rateMap.get(`${alloc.employeeId}|${alloc.quarterId}`);
      if (!rate) continue;

      const budgetCost = calculateCost(alloc.budgetedHours, rate, cap, capType);
      salaryBudgeted += budgetCost.fundedCost;

      if (alloc.actualHours !== null) {
        const actualCost = calculateCost(alloc.actualHours, rate, cap, capType);
        salaryActual += actualCost.fundedCost;
      }
    }

    let expenseBudgeted = 0;
    let expenseActual = 0;
    for (const exp of projExpenses) {
      expenseBudgeted += exp.budgetedAmount;
      if (exp.actualAmount !== null) expenseActual += exp.actualAmount;
    }

    const totalBudgeted = salaryBudgeted + expenseBudgeted;
    const totalActual = salaryActual + expenseActual;
    const variance = totalBudgeted - totalActual;
    const utilizationPct = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

    totalBudget += project.fiscalYearBudget;
    totalSpent += totalActual;

    // Calculate days remaining
    let daysRemaining: number | undefined;
    let urgency: string | undefined;
    const endDateStr = project.endDate ?? funder?.expiryDate;
    if (endDateStr) {
      const days = Math.ceil((new Date(endDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      daysRemaining = days;
      urgency = days < 90 ? 'RED' : days < 180 ? 'YELLOW' : 'GREEN';
    }

    return {
      projectName: project.name,
      projectCode: project.code,
      funderName: funder?.name ?? 'Unknown',
      status: project.status,
      totalBudget: project.totalBudget,
      fiscalYearBudget: project.fiscalYearBudget,
      salaryBudgeted,
      salaryActual,
      expenseBudgeted,
      expenseActual,
      totalBudgeted,
      totalActual,
      variance,
      utilizationPct,
      inKindBudget: project.inKindBudget,
      inKindActual: 0, // Would need in-kind allocation filter
      benefitsCapPct: project.benefitsCapPercent,
      endDate: project.endDate ?? '',
      daysRemaining,
      urgency,
      teamSize: teamEmployees.size,
    };
  });

  const spendingPace = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const fundingExpiry = projectData
    .filter(p => p.daysRemaining !== undefined)
    .map(p => ({
      projectName: p.projectName,
      funderName: p.funderName,
      daysRemaining: p.daysRemaining!,
      urgency: p.urgency!,
      budgetUtilization: p.utilizationPct,
    }));

  const context = buildSafeDashboardContext(
    currentFY?.name ?? '',
    projectData,
    fundingExpiry,
    {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      spendingPace,
      activeProjects: projects.length,
    }
  );

  return {
    context,
    contextString: JSON.stringify(context, null, 2),
  };
}

/**
 * Get relevant document context for a question.
 * Returns document text if the question references agreements/contracts.
 */
export async function getDocumentContext(
  question: string,
  projectNames: string[]
): Promise<string> {
  if (!isAgreementQuery(question) && projectNames.length === 0) {
    return '';
  }

  const allDocs = await db.projectDocuments.toArray();
  if (allDocs.length === 0) return '';

  // Find project IDs matching mentioned names
  const projects = await db.projects.toArray();
  const questionLower = question.toLowerCase();

  const matchedProjectIds = new Set<string>();
  for (const proj of projects) {
    if (
      questionLower.includes(proj.name.toLowerCase()) ||
      questionLower.includes(proj.code.toLowerCase())
    ) {
      matchedProjectIds.add(proj.id);
    }
  }

  // If no specific project matched but it's an agreement query, include all docs
  let relevantDocs = allDocs;
  if (matchedProjectIds.size > 0) {
    relevantDocs = allDocs.filter(d => matchedProjectIds.has(d.projectId));
  }

  if (relevantDocs.length === 0) return '';

  const parts: string[] = [];
  for (const doc of relevantDocs) {
    const project = projects.find(p => p.id === doc.projectId);
    const label = `[Document: ${doc.fileName} — Project: ${project?.name ?? 'Unknown'}]`;

    if (doc.chunks.length <= 3) {
      // Short doc: include all text
      parts.push(`${label}\n${doc.extractedText}`);
    } else {
      // Long doc: find relevant chunks
      const relevant = findRelevantChunks(doc.chunks, question, 5);
      const excerpts = relevant.map(c => c.text).join('\n...\n');
      parts.push(`${label} (relevant excerpts)\n${excerpts}`);
    }
  }

  return '\n\n--- AGREEMENT DOCUMENTS ---\n\n' + parts.join('\n\n---\n\n');
}
