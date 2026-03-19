import { v4 as uuidv4 } from 'uuid';
import { db, type Funder, type Project, type Organization, type Employee, type EmployeeRate, type FiscalYear, type Quarter, type ExpenseCategory, type SalaryAllocation } from './schema';

// =============================================================================
// SEED DATA
// =============================================================================

const now = new Date().toISOString();

// Organizations
const organizations: Organization[] = [
  { id: 'org-1', name: 'BH-Innovation', code: 'BH-Innovation', description: 'Innovation Team' },
  { id: 'org-2', name: 'Bruyère Hospital', code: 'BH', description: 'Main hospital operations' },
  { id: 'org-3', name: 'Bruyère Research Institute', code: 'BHRI', description: 'Research Institute' },
];

// Funders
const funders: Funder[] = [
  {
    id: 'funder-cabhi',
    name: 'CABHI',
    code: 'CABHI',
    benefitCoverageRate: 1.0, // 100%
    notes: 'Centre for Aging + Brain Health Innovation',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-envisage',
    name: 'envisAGE',
    code: 'ENVIS',
    benefitCoverageRate: 0, // 0%
    notes: 'No benefits covered',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-canhealth',
    name: 'CAN Health',
    code: 'CANH',
    benefitCoverageRate: 1.0, // 100%
    notes: 'CAN Health Network',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-cheori',
    name: 'CHEO RI',
    code: 'CHEO',
    benefitCoverageRate: 0.2, // 20%
    notes: 'CHEO Research Institute - Partial benefits',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-feddev',
    name: 'FedDev Ontario',
    code: 'FEDO',
    benefitCoverageRate: 1.0, // 100%
    notes: 'Federal Economic Development Agency for Southern Ontario',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

// Fiscal Years
const fiscalYears: FiscalYear[] = [
  {
    id: 'fy-2024-25',
    name: '2024-25',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    isCurrent: false,
  },
  {
    id: 'fy-2025-26',
    name: '2025-26',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    isCurrent: true,
  },
  {
    id: 'fy-2026-27',
    name: '2026-27',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    isCurrent: false,
  },
];

// Quarters for 2025-26 fiscal year
const quarters: Quarter[] = [
  { id: 'q1-2025-26', name: 'Q1 2025-26', quarterNumber: 1, fiscalYearId: 'fy-2025-26', startDate: '2025-04-01', endDate: '2025-06-30' },
  { id: 'q2-2025-26', name: 'Q2 2025-26', quarterNumber: 2, fiscalYearId: 'fy-2025-26', startDate: '2025-07-01', endDate: '2025-09-30' },
  { id: 'q3-2025-26', name: 'Q3 2025-26', quarterNumber: 3, fiscalYearId: 'fy-2025-26', startDate: '2025-10-01', endDate: '2025-12-31' },
  { id: 'q4-2025-26', name: 'Q4 2025-26', quarterNumber: 4, fiscalYearId: 'fy-2025-26', startDate: '2026-01-01', endDate: '2026-03-31' },
  // Quarters for 2024-25
  { id: 'q1-2024-25', name: 'Q1 2024-25', quarterNumber: 1, fiscalYearId: 'fy-2024-25', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'q2-2024-25', name: 'Q2 2024-25', quarterNumber: 2, fiscalYearId: 'fy-2024-25', startDate: '2024-07-01', endDate: '2024-09-30' },
  { id: 'q3-2024-25', name: 'Q3 2024-25', quarterNumber: 3, fiscalYearId: 'fy-2024-25', startDate: '2024-10-01', endDate: '2024-12-31' },
  { id: 'q4-2024-25', name: 'Q4 2024-25', quarterNumber: 4, fiscalYearId: 'fy-2024-25', startDate: '2025-01-01', endDate: '2025-03-31' },
];

// Expense Categories
const expenseCategories: ExpenseCategory[] = [
  { id: 'cat-salary', name: 'Salaries & Wages', sortOrder: 1 },
  { id: 'cat-benefits', name: 'Benefits', sortOrder: 2 },
  { id: 'cat-travel', name: 'Travel & Accommodation', sortOrder: 3 },
  { id: 'cat-supplies', name: 'Supplies & Materials', sortOrder: 4 },
  { id: 'cat-equipment', name: 'Equipment', sortOrder: 5 },
  { id: 'cat-services', name: 'Professional Services', sortOrder: 6 },
  { id: 'cat-software', name: 'Software & Subscriptions', sortOrder: 7 },
  { id: 'cat-other', name: 'Other', sortOrder: 8 },
];

// Sample Innovation Team Employees
const employees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Daly, Blake',
    role: 'Director',
    organizationId: 'org-1',
    isInnovationTeam: true,
    annualFTEHours: 1950,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'emp-2',
    name: 'Mohammadi, Maryam',
    role: 'Project Manager',
    organizationId: 'org-1',
    isInnovationTeam: true,
    annualFTEHours: 1950,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'emp-3',
    name: 'Muwanga, Moses',
    role: 'Finance and Programs Assistant',
    organizationId: 'org-1',
    isInnovationTeam: true,
    annualFTEHours: 1950,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'emp-4',
    name: 'Robinson, Emma',
    role: 'Long-Term Care Coordinator',
    organizationId: 'org-1',
    isInnovationTeam: true,
    annualFTEHours: 1950,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'emp-5',
    name: 'Rozon, Cassandra',
    role: 'Program Navigator',
    organizationId: 'org-1',
    isInnovationTeam: true,
    annualFTEHours: 1950,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'emp-6',
    name: 'Shafiee, Erfan',
    role: 'Coordinator - Innovation',
    organizationId: 'org-1',
    isInnovationTeam: true,
    annualFTEHours: 1950,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
];

// Employee Rates for Q1-Q4 2025-26
const employeeRates: EmployeeRate[] = [];
const rateData = [
  { employeeId: 'emp-1', baseHourlyRate: 75.51, benefitsRate: 19.23 },
  { employeeId: 'emp-2', baseHourlyRate: 45.41, benefitsRate: 7.38 },
  { employeeId: 'emp-3', baseHourlyRate: 27.00, benefitsRate: 4.81 },
  { employeeId: 'emp-4', baseHourlyRate: 41.38, benefitsRate: 7.01 },
  { employeeId: 'emp-5', baseHourlyRate: 40.17, benefitsRate: 7.35 },
  { employeeId: 'emp-6', baseHourlyRate: 37.50, benefitsRate: 3.64 },
];

// Create rates for each quarter
for (const rate of rateData) {
  for (const quarter of quarters.filter(q => q.fiscalYearId === 'fy-2025-26')) {
    employeeRates.push({
      id: `rate-${rate.employeeId}-${quarter.id}`,
      employeeId: rate.employeeId,
      fiscalYearId: 'fy-2025-26',
      quarterId: quarter.id,
      baseHourlyRate: rate.baseHourlyRate,
      benefitsRate: rate.benefitsRate,
      effectiveDate: quarter.startDate,
      source: 'Initial Setup',
      createdAt: now,
      updatedAt: now,
    });
  }
}

// Sample Projects
const projects: Project[] = [
  {
    id: 'proj-1',
    name: '8-80 Initiative',
    code: '8-80',
    funderId: 'funder-cheori',
    status: 'active',
    fundingType: 'cash',
    startDate: '2024-04-01',
    endDate: '2026-03-31',
    totalBudget: 420773,
    fiscalYearBudget: 210386, // Split across 2 years
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 20,
    benefitsCapType: 'percentage-of-wages',
    costCentreNumber: '20-939602301',
    principalInvestigator: 'Dr. Sarah Chen',
    description: 'Intergenerational health initiative connecting youth and seniors',
    notes: 'Multi-year project, funding expires March 2026',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-2',
    name: 'AI Scribe (Evaluation)',
    code: 'AISC',
    funderId: 'funder-cabhi',
    status: 'active',
    fundingType: 'cash',
    startDate: '2024-10-01',
    endDate: '2026-09-30',
    totalBudget: 50000,
    fiscalYearBudget: 25000,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100, // CABHI covers 100%
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802500',
    principalInvestigator: 'Blake Daly',
    description: 'AI-powered clinical documentation evaluation',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-3',
    name: 'Virtual Care Expansion',
    code: 'VCE',
    funderId: 'funder-canhealth',
    status: 'active',
    fundingType: 'mixed',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    totalBudget: 150000,
    fiscalYearBudget: 75000,
    inKindBudget: 50000, // Mixed project has in-kind component
    inKindFiscalYearBudget: 25000,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802501',
    principalInvestigator: 'Maryam Mohammadi',
    description: 'Expanding virtual care capabilities across Bruyère',
    notes: 'Includes both cash and in-kind components',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-4',
    name: 'Remote Patient Monitoring',
    code: 'RPM',
    funderId: 'funder-feddev',
    status: 'pipeline',
    fundingType: 'cash',
    startDate: '2025-04-01',
    totalBudget: 200000,
    fiscalYearBudget: 200000,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    principalInvestigator: 'TBD',
    description: 'Remote monitoring for chronic disease patients',
    notes: 'Awaiting final approval from FedDev',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-5',
    name: 'Seniors Tech Training',
    code: 'STT',
    funderId: 'funder-envisage',
    status: 'active',
    fundingType: 'in-kind',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    totalBudget: 0, // No cash budget
    fiscalYearBudget: 0,
    inKindBudget: 75000, // Entirely in-kind
    inKindFiscalYearBudget: 37500,
    benefitsCapPercent: 0, // envisAGE doesn't cover benefits
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802502',
    principalInvestigator: 'Emma Robinson',
    description: 'Digital literacy program for seniors',
    notes: 'In-kind contribution only, no cash disbursement',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

// Sample Allocations for Q3 2025-26
const salaryAllocations: SalaryAllocation[] = [
  // Blake Daly allocations
  { id: uuidv4(), employeeId: 'emp-1', projectId: 'proj-1', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 100, actualHours: 85, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-1', projectId: 'proj-2', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 150, actualHours: 140, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-1', projectId: 'proj-3', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 200, actualHours: 180, isInKind: false, createdAt: now, updatedAt: now },

  // Maryam Mohammadi allocations
  { id: uuidv4(), employeeId: 'emp-2', projectId: 'proj-1', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 200, actualHours: 190, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-2', projectId: 'proj-3', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 250, actualHours: 220, isInKind: false, createdAt: now, updatedAt: now },

  // Moses Muwanga allocations
  { id: uuidv4(), employeeId: 'emp-3', projectId: 'proj-1', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 150, actualHours: 145, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-3', projectId: 'proj-2', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 100, actualHours: 95, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-3', projectId: 'proj-5', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 200, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },

  // Emma Robinson allocations
  { id: uuidv4(), employeeId: 'emp-4', projectId: 'proj-1', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 300, actualHours: 280, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-4', projectId: 'proj-5', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 150, actualHours: 140, isInKind: true, createdAt: now, updatedAt: now },

  // Cassandra Rozon allocations
  { id: uuidv4(), employeeId: 'emp-5', projectId: 'proj-2', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 250, actualHours: 230, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-5', projectId: 'proj-3', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 200, actualHours: 180, isInKind: false, createdAt: now, updatedAt: now },

  // Erfan Shafiee allocations
  { id: uuidv4(), employeeId: 'emp-6', projectId: 'proj-3', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 300, actualHours: 290, isInKind: false, createdAt: now, updatedAt: now },
  { id: uuidv4(), employeeId: 'emp-6', projectId: 'proj-4', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 150, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
];

// =============================================================================
// SEED FUNCTION
// =============================================================================

export async function seedDatabase(): Promise<void> {
  // Check if database is already seeded
  const existingFunders = await db.funders.count();
  if (existingFunders > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  await db.transaction('rw', [
    db.organizations,
    db.funders,
    db.fiscalYears,
    db.quarters,
    db.expenseCategories,
    db.employees,
    db.employeeRates,
    db.projects,
    db.salaryAllocations,
  ], async () => {
    await db.organizations.bulkAdd(organizations);
    await db.funders.bulkAdd(funders);
    await db.fiscalYears.bulkAdd(fiscalYears);
    await db.quarters.bulkAdd(quarters);
    await db.expenseCategories.bulkAdd(expenseCategories);
    await db.employees.bulkAdd(employees);
    await db.employeeRates.bulkAdd(employeeRates);
    await db.projects.bulkAdd(projects);
    await db.salaryAllocations.bulkAdd(salaryAllocations);
  });

  console.log('Database seeded successfully!');
}

// =============================================================================
// RESET FUNCTION (for development)
// =============================================================================

export async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
  await seedDatabase();
}
