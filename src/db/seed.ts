import { db, type Funder, type Project, type Organization, type Employee, type EmployeeRate, type FiscalYear, type Quarter, type ExpenseCategory, type SalaryAllocation, type Claim } from './schema';

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
  {
    id: 'funder-chime',
    name: 'CHIME Medical',
    code: 'CHIME',
    benefitCoverageRate: 1.0, // 100%
    notes: 'CHIME Medical',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-moltc',
    name: 'MOLTC',
    code: 'MOLTC',
    benefitCoverageRate: 1.0, // 100%
    notes: 'Ministry of Long-Term Care',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-obio',
    name: 'OBIO',
    code: 'OBIO',
    benefitCoverageRate: 1.0, // 100%
    notes: 'Ontario Bioscience Innovation Organization',
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

// Projects
const projects: Project[] = [
  {
    id: 'proj-880',
    name: '8-80 Initiative',
    code: '8-80',
    funderId: 'funder-cheori',
    status: 'active',
    fundingType: 'cash',
    startDate: '',
    endDate: '2026-03-31',
    totalBudget: 420773,
    fiscalYearBudget: 420773,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 20,
    benefitsCapType: 'percentage-of-wages',
    costCentreNumber: '20-939602301',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-able',
    name: 'Able Innovations',
    code: 'ABLE',
    funderId: 'funder-envisage',
    status: 'active',
    fundingType: 'cash',
    startDate: '2025-09-30',
    endDate: '2026-12-31',
    totalBudget: 41079,
    fiscalYearBudget: 41079,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 0,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802504',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-aiscribe',
    name: 'AI Scribe (Evaluation)',
    code: 'AISC',
    funderId: 'funder-cabhi',
    status: 'active',
    fundingType: 'cash',
    startDate: '2025-07-01',
    endDate: '2026-09-30',
    totalBudget: 50000,
    fiscalYearBudget: 50000,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802500',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-asepha',
    name: 'Asepha',
    code: 'ASEP',
    funderId: 'funder-envisage',
    status: 'active',
    fundingType: 'cash',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    totalBudget: 0,
    fiscalYearBudget: 0,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 0,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-beachhead',
    name: 'Beachhead',
    code: 'BEACH',
    funderId: 'funder-envisage',
    status: 'completed',
    fundingType: 'cash',
    startDate: '2023-10-24',
    endDate: '2025-05-13',
    totalBudget: 34202.85,
    fiscalYearBudget: 34202.85,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802301',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-careteam',
    name: 'Careteam',
    code: 'CARE',
    funderId: 'funder-canhealth',
    status: 'active',
    fundingType: 'cash',
    startDate: '2024-04-01',
    endDate: '2025-07-01',
    totalBudget: 29500,
    fiscalYearBudget: 29500,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802400',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-gotcare',
    name: 'Gotcare',
    code: 'GOTC',
    funderId: 'funder-envisage',
    status: 'active',
    fundingType: 'cash',
    startDate: '2024-05-01',
    endDate: '2025-12-31',
    totalBudget: 31836.78,
    fiscalYearBudget: 31836.78,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 0,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802404',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-healthi',
    name: 'HEALTHi Grant',
    code: 'HLTH',
    funderId: 'funder-chime',
    status: 'active',
    fundingType: 'cash',
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    totalBudget: 15000,
    fiscalYearBudget: 15000,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802501',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-ltcin',
    name: 'LTC Innovation Network',
    code: 'LTCIN',
    funderId: 'funder-canhealth',
    status: 'active',
    fundingType: 'cash',
    startDate: '',
    endDate: '2026-03-31',
    totalBudget: 150000,
    fiscalYearBudget: 150000,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939302315',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-onspark',
    name: 'OnSPARK',
    code: 'ONSP',
    funderId: 'funder-moltc',
    status: 'active',
    fundingType: 'cash',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    totalBudget: 95570,
    fiscalYearBudget: 95570,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-steadiwear',
    name: 'Steadiwear',
    code: 'STDY',
    funderId: 'funder-obio',
    status: 'active',
    fundingType: 'cash',
    startDate: '2025-12-09',
    endDate: '2026-10-31',
    totalBudget: 50000,
    fiscalYearBudget: 50000,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802503',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-lingotec',
    name: 'Lingotec',
    code: 'LING',
    funderId: 'funder-canhealth',
    status: 'active',
    fundingType: 'cash',
    startDate: '2026-01-06',
    endDate: '2026-03-31',
    totalBudget: 29115,
    fiscalYearBudget: 29115,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-tochtech',
    name: 'Tochtech',
    code: 'TOCH',
    funderId: 'funder-envisage',
    status: 'active',
    fundingType: 'cash',
    startDate: '',
    endDate: '2025-12-31',
    totalBudget: 21929.38,
    fiscalYearBudget: 21929.38,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 0,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: '20-939802402',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'proj-niuz',
    name: 'Niuz',
    code: 'NIUZ',
    funderId: 'funder-canhealth',
    status: 'active',
    fundingType: 'cash',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    totalBudget: 10000,
    fiscalYearBudget: 10000,
    inKindBudget: 0,
    inKindFiscalYearBudget: 0,
    benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits',
    costCentreNumber: undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

// No sample allocations — real allocations will be entered manually
const salaryAllocations: SalaryAllocation[] = [];

// Claims for FY 2025-26
const claims: Claim[] = [
  // Row 1: Beachhead Q1 — Funds Received, $40,958.88 claimed, $50,000 received
  {
    id: 'claim-01',
    projectId: 'proj-beachhead',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q1-2025-26',
    claimAmount: 40958.88,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: 50000,
    status: 'received',
    createdAt: now,
    updatedAt: now,
  },
  // Row 2: 8-80 Initiative Q2 — Funds Received, $187,117.73
  {
    id: 'claim-02',
    projectId: 'proj-880',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q2-2025-26',
    claimAmount: 187117.73,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: 187117.73,
    status: 'received',
    createdAt: now,
    updatedAt: now,
  },
  // Row 3: Careteam Q1 — Funds Received, $29,425.79, received 10/27/2025
  {
    id: 'claim-03',
    projectId: 'proj-careteam',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q1-2025-26',
    claimAmount: 29425.79,
    submittedDate: null,
    receivedDate: '2025-10-27',
    receivedAmount: 29425.79,
    status: 'received',
    createdAt: now,
    updatedAt: now,
  },
  // Row 4: LTC Innovation Network Q2 — Funds Received, $69,301.82, received 11/27/2025
  {
    id: 'claim-04',
    projectId: 'proj-ltcin',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q2-2025-26',
    claimAmount: 69301.82,
    submittedDate: null,
    receivedDate: '2025-11-27',
    receivedAmount: 69301.82,
    status: 'received',
    createdAt: now,
    updatedAt: now,
  },
  // Row 5: TochTech Q2 — Claim Sent, $13,470.11
  {
    id: 'claim-05',
    projectId: 'proj-tochtech',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q2-2025-26',
    claimAmount: 13470.11,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  },
  // Row 6: GotCare Q2 — Claim Sent, $17,003.68
  {
    id: 'claim-06',
    projectId: 'proj-gotcare',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q2-2025-26',
    claimAmount: 17003.68,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  },
  // Row 7: 8-80 Initiative Q3 — Claim Sent, $109,956.40 (in-kind $21,999.02)
  {
    id: 'claim-07',
    projectId: 'proj-880',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q3-2025-26',
    claimAmount: 109956.40,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'submitted',
    notes: 'In-kind costs: $21,999.02',
    createdAt: now,
    updatedAt: now,
  },
  // Row 8: LTC Innovation Network Q3 — Claim Sent, $30,755.84 (in-kind $66,490.49)
  {
    id: 'claim-08',
    projectId: 'proj-ltcin',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q3-2025-26',
    claimAmount: 30755.84,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'submitted',
    notes: 'In-kind costs: $66,490.49',
    createdAt: now,
    updatedAt: now,
  },
  // Row 9: GotCare Q3 — Claim Sent, $14,825.13
  {
    id: 'claim-09',
    projectId: 'proj-gotcare',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q3-2025-26',
    claimAmount: 14825.13,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  },
  // Row 10: TochTech Q3 — Claim Sent, $8,371.74
  {
    id: 'claim-10',
    projectId: 'proj-tochtech',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q3-2025-26',
    claimAmount: 8371.74,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  },
  // Row 11: 8-80 Initiative Q4 — Claim Sent, $45,240.24
  {
    id: 'claim-11',
    projectId: 'proj-880',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q4-2025-26',
    claimAmount: 45240.24,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  },
  // Row 12: 8-80 Initiative Q4 — Draft
  {
    id: 'claim-12',
    projectId: 'proj-880',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q4-2025-26',
    claimAmount: 0,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  },
  // Row 13: LTC Innovation Network Q4 — Draft
  {
    id: 'claim-13',
    projectId: 'proj-ltcin',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q4-2025-26',
    claimAmount: 0,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  },
  // Row 14: HEALTHi Grant Q4 — Draft
  {
    id: 'claim-14',
    projectId: 'proj-healthi',
    fiscalYearId: 'fy-2025-26',
    quarterId: 'q4-2025-26',
    claimAmount: 0,
    submittedDate: null,
    receivedDate: null,
    receivedAmount: null,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  },
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
    db.claims,
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
    await db.claims.bulkAdd(claims);
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
