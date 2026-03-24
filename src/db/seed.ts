import { db, type Funder, type Project, type Organization, type Employee, type EmployeeRate, type FiscalYear, type Quarter, type ExpenseCategory, type SalaryAllocation, type Expense, type Claim } from './schema';

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
    benefitCoverageRate: 1.0,
    notes: 'Centre for Aging + Brain Health Innovation',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-envisage',
    name: 'envisAGE',
    code: 'ENVIS',
    benefitCoverageRate: 0,
    notes: 'No benefits covered',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-canhealth',
    name: 'CAN Health',
    code: 'CANH',
    benefitCoverageRate: 1.0,
    notes: 'CAN Health Network',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-cheori',
    name: 'CHEO RI',
    code: 'CHEO',
    benefitCoverageRate: 0.2,
    notes: 'CHEO Research Institute - Partial benefits',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-feddev',
    name: 'FedDev Ontario',
    code: 'FEDO',
    benefitCoverageRate: 1.0,
    notes: 'Federal Economic Development Agency for Southern Ontario',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-chime',
    name: 'CHIME Medical',
    code: 'CHIME',
    benefitCoverageRate: 1.0,
    notes: 'CHIME Medical',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-moltc',
    name: 'MOLTC',
    code: 'MOLTC',
    benefitCoverageRate: 1.0,
    notes: 'Ministry of Long-Term Care',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'funder-obio',
    name: 'OBIO',
    code: 'OBIO',
    benefitCoverageRate: 1.0,
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

// =============================================================================
// EMPLOYEES (Innovation Team + BH/BHRI staff from Master Tracker)
// =============================================================================

const employees: Employee[] = [
  // Innovation Team (BH-Innovation)
  { id: 'emp-1', name: 'Daly, Blake', role: 'Director', organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-2', name: 'Mohammadi, Maryam', role: 'Project Manager', organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-3', name: 'Muwanga, Moses', role: 'Finance and Programs Assistant', organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-4', name: 'Robinson, Emma', role: 'Long-Term Care Coordinator', organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-5', name: 'Rozon, Cassandra', role: 'Program Navigator', organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-6', name: 'Shafiee, Erfan', role: 'Coordinator - Innovation', organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-lehman', name: 'Lehman, Eleanor', role: 'Research Assistant', organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },

  // BH Staff
  { id: 'emp-bennett', name: 'Bennett, Jennifer', role: 'Director', organizationId: 'org-2', departmentId: 'Nursing & Professional Practice', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-charron', name: 'Charron, Gaetan', role: 'Manager - Networks', organizationId: 'org-2', departmentId: 'Information Systems', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-coutu', name: 'Coutu, Claudia', role: 'Manager', organizationId: 'org-2', departmentId: 'Residence Experience and Quality', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-descoteaux', name: 'Descoteaux, Lindsay', role: 'Assistant - Administrative', organizationId: 'org-2', departmentId: 'Clinical Programs', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-doering', name: 'Doering, Paula', role: 'Senior Vice President', organizationId: 'org-2', departmentId: 'Clinical Programs', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-donais', name: 'Donais, Mark', role: 'Manager', organizationId: 'org-2', departmentId: 'Procurement and Logistics', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-donskov', name: 'Donskov, Melissa', role: 'Vice President', organizationId: 'org-2', departmentId: 'Residential and Community Care and Programs', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-durocher', name: 'Durocher, Robert', role: 'Manager - Technical Support', organizationId: 'org-2', departmentId: 'Information Systems', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-england', name: 'England, Tyler', role: 'CTO', organizationId: 'org-2', departmentId: 'Information Systems', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-fiallos', name: 'Fiallos, Javier', role: 'Analyst', organizationId: 'org-2', departmentId: 'Decision Support', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-goulet', name: 'Goulet, Marc', role: 'Consultant', organizationId: 'org-2', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-greene', name: 'Greene, Kathy', role: 'Director', organizationId: 'org-2', departmentId: 'Decision Support', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-jaitly', name: 'Jaitly, Shweta', role: 'Manager', organizationId: 'org-2', departmentId: 'Nursing & Professional Practice', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-james', name: 'James, Lynsey', role: 'Director', organizationId: 'org-2', departmentId: 'Clinical Programs', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-kobari', name: 'Kobari, Reza', role: 'Manager - Applications', organizationId: 'org-2', departmentId: 'Information Systems', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-laplante', name: 'LaPlante, Stephanie', role: 'Director Clinical Programs', organizationId: 'org-2', departmentId: 'Chief of Health Prof', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-lemaire', name: 'Lemaire, Madeleine', role: 'External Communications Coordinator', organizationId: 'org-2', departmentId: 'Communications', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-mccann', name: 'McCann, Meagan', role: 'Assistant - Administrative', organizationId: 'org-2', departmentId: 'Strategy, Comms, Engagement, Development & Integration', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-michel', name: 'Michel, Sonia', role: 'Manager', organizationId: 'org-2', departmentId: 'Clinical Programs', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-montoya', name: 'Montoya, Gillian', role: 'Coordinator', organizationId: 'org-2', departmentId: 'At Home Program', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-poushinsky', name: 'Poushinsky, Natasha Weldon', role: 'Director', organizationId: 'org-2', departmentId: 'Strategy and Planning', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-power', name: 'Power, Stefanie', role: 'Senior Advisor', organizationId: 'org-2', departmentId: 'Communications', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-rodrigue', name: 'Rodrigue, Alain', role: 'Manager - Corporate Reporting', organizationId: 'org-2', departmentId: 'Finance', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-ryall', name: 'Ryall, Carole', role: 'Officer', organizationId: 'org-2', departmentId: 'Privacy and Access to Information', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-schram', name: 'Schram, Alexandra', role: 'Analyst', organizationId: 'org-2', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-smiderle', name: 'Smiderle, Wes', role: 'External Communications Coordinator', organizationId: 'org-2', departmentId: 'Communications', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-sorfleet', name: 'Sorfleet, Chris', role: 'Director', organizationId: 'org-2', departmentId: 'Quality, Patient Safety and Risk Management', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-tadic', name: 'Tadic, Vela', role: 'Director', organizationId: 'org-2', departmentId: 'Family Health Services', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-taillon', name: 'Taillon, Peggy', role: 'Vice President - Strategy, Comms, Engagement, Development & Integration', organizationId: 'org-2', departmentId: 'Strategy, Comms, Engagement, Development & Integration', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },

  // BHRI Staff
  { id: 'emp-cornett', name: 'Cornett, Janet Alex', role: 'Manager - Research Services', organizationId: 'org-3', departmentId: 'RI General Administration', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-mcintosh', name: 'McIntosh, Megan', role: 'Finance Coordinator', organizationId: 'org-3', departmentId: 'RI General Administration', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-niezgoda', name: 'Niezgoda, Helen', role: 'Manager', organizationId: 'org-3', departmentId: 'Research Services', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
  { id: 'emp-wilson', name: 'Wilson, Kumanan Rasihan', role: 'CEO', organizationId: 'org-3', departmentId: 'RI General Administration', isInnovationTeam: false, annualFTEHours: 1950, status: 'active', createdAt: now, updatedAt: now },
];

// =============================================================================
// EMPLOYEE RATES (Q1-Q4 2025-26 for all employees)
// =============================================================================

const employeeRates: EmployeeRate[] = [];
const rateData: { employeeId: string; baseHourlyRate: number; benefitsRate: number }[] = [
  // Innovation Team
  { employeeId: 'emp-1', baseHourlyRate: 75.51, benefitsRate: 19.23 },
  { employeeId: 'emp-2', baseHourlyRate: 45.41, benefitsRate: 7.38 },
  { employeeId: 'emp-3', baseHourlyRate: 27.00, benefitsRate: 4.81 },
  { employeeId: 'emp-4', baseHourlyRate: 41.38, benefitsRate: 7.01 },
  { employeeId: 'emp-5', baseHourlyRate: 40.17, benefitsRate: 7.35 },
  { employeeId: 'emp-6', baseHourlyRate: 37.50, benefitsRate: 3.64 },
  { employeeId: 'emp-lehman', baseHourlyRate: 28.00, benefitsRate: 5.10 },
  // BH Staff
  { employeeId: 'emp-bennett', baseHourlyRate: 87.61, benefitsRate: 26.80 },
  { employeeId: 'emp-charron', baseHourlyRate: 75.51, benefitsRate: 20.16 },
  { employeeId: 'emp-coutu', baseHourlyRate: 53.02, benefitsRate: 15.48 },
  { employeeId: 'emp-descoteaux', baseHourlyRate: 37.03, benefitsRate: 11.72 },
  { employeeId: 'emp-doering', baseHourlyRate: 148.57, benefitsRate: 33.19 },
  { employeeId: 'emp-donais', baseHourlyRate: 68.90, benefitsRate: 17.82 },
  { employeeId: 'emp-donskov', baseHourlyRate: 125.81, benefitsRate: 29.38 },
  { employeeId: 'emp-durocher', baseHourlyRate: 75.51, benefitsRate: 18.91 },
  { employeeId: 'emp-england', baseHourlyRate: 93.66, benefitsRate: 20.90 },
  { employeeId: 'emp-fiallos', baseHourlyRate: 55.13, benefitsRate: 15.92 },
  { employeeId: 'emp-goulet', baseHourlyRate: 75.00, benefitsRate: 15.00 },
  { employeeId: 'emp-greene', baseHourlyRate: 93.66, benefitsRate: 18.78 },
  { employeeId: 'emp-jaitly', baseHourlyRate: 0, benefitsRate: 0 },
  { employeeId: 'emp-james', baseHourlyRate: 93.66, benefitsRate: 21.23 },
  { employeeId: 'emp-kobari', baseHourlyRate: 75.51, benefitsRate: 19.32 },
  { employeeId: 'emp-laplante', baseHourlyRate: 88.72, benefitsRate: 21.53 },
  { employeeId: 'emp-lemaire', baseHourlyRate: 52.53, benefitsRate: 15.90 },
  { employeeId: 'emp-mccann', baseHourlyRate: 40.33, benefitsRate: 13.75 },
  { employeeId: 'emp-michel', baseHourlyRate: 75.51, benefitsRate: 18.96 },
  { employeeId: 'emp-montoya', baseHourlyRate: 49.93, benefitsRate: 23.79 },
  { employeeId: 'emp-poushinsky', baseHourlyRate: 81.56, benefitsRate: 22.88 },
  { employeeId: 'emp-power', baseHourlyRate: 81.38, benefitsRate: 39.10 },
  { employeeId: 'emp-rodrigue', baseHourlyRate: 75.51, benefitsRate: 21.55 },
  { employeeId: 'emp-ryall', baseHourlyRate: 0, benefitsRate: 0 },
  { employeeId: 'emp-schram', baseHourlyRate: 54.71, benefitsRate: 13.24 },
  { employeeId: 'emp-smiderle', baseHourlyRate: 48.79, benefitsRate: 23.55 },
  { employeeId: 'emp-sorfleet', baseHourlyRate: 81.55, benefitsRate: 26.62 },
  { employeeId: 'emp-tadic', baseHourlyRate: 0, benefitsRate: 0 },
  { employeeId: 'emp-taillon', baseHourlyRate: 128.89, benefitsRate: 36.46 },
  // BHRI Staff
  { employeeId: 'emp-cornett', baseHourlyRate: 62.44, benefitsRate: 19.66 },
  { employeeId: 'emp-mcintosh', baseHourlyRate: 39.78, benefitsRate: 10.08 },
  { employeeId: 'emp-niezgoda', baseHourlyRate: 65.51, benefitsRate: 17.51 },
  { employeeId: 'emp-wilson', baseHourlyRate: 146.93, benefitsRate: 30.78 },
];

// Create rates for each quarter of FY 2025-26
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
      source: 'Master Tracker 2025-26',
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

// =============================================================================
// SALARY ALLOCATIONS (Cash + In-Kind from Master Tracker)
// =============================================================================

const salaryAllocations: SalaryAllocation[] = [
  // === CASH ALLOCATIONS ===
  // Bennett → 8-80
  { id: 'sa-cash-1', employeeId: 'emp-bennett', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 48, actualHours: 48, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-2', employeeId: 'emp-bennett', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  // Charron → 8-80
  { id: 'sa-cash-3', employeeId: 'emp-charron', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 55, actualHours: 55, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-4', employeeId: 'emp-charron', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 22.5, actualHours: 22.5, isInKind: false, createdAt: now, updatedAt: now },
  // Cornett → Beachhead, Gotcare, Tochtech
  { id: 'sa-cash-5', employeeId: 'emp-cornett', projectId: 'proj-beachhead', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 64, actualHours: 64, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-6', employeeId: 'emp-cornett', projectId: 'proj-gotcare', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 33, actualHours: 33, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-7', employeeId: 'emp-cornett', projectId: 'proj-tochtech', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 21, actualHours: 21, isInKind: false, createdAt: now, updatedAt: now },
  // Coutu → 8-80
  { id: 'sa-cash-8', employeeId: 'emp-coutu', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 55, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-9', employeeId: 'emp-coutu', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  // Daly → 8-80, Beachhead, Careteam, Gotcare, LTC, Tochtech, OnSPARK
  { id: 'sa-cash-10', employeeId: 'emp-1', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 475, actualHours: 486.49, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-11', employeeId: 'emp-1', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 295, actualHours: 295, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-12', employeeId: 'emp-1', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 89.99, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-13', employeeId: 'emp-1', projectId: 'proj-beachhead', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 120, actualHours: 121.22, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-14', employeeId: 'emp-1', projectId: 'proj-careteam', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 50, actualHours: 50, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-15', employeeId: 'emp-1', projectId: 'proj-gotcare', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 40, actualHours: 40, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-16', employeeId: 'emp-1', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 250, actualHours: 250, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-17', employeeId: 'emp-1', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 105.58, actualHours: 105.58, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-18', employeeId: 'emp-1', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 157.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-19', employeeId: 'emp-1', projectId: 'proj-tochtech', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 40, actualHours: 40, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-20', employeeId: 'emp-1', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 130.3, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-21', employeeId: 'emp-1', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 240.01, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Donais → 8-80
  { id: 'sa-cash-22', employeeId: 'emp-donais', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-23', employeeId: 'emp-donais', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 27.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Durocher → 8-80
  { id: 'sa-cash-24', employeeId: 'emp-durocher', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 22.5, actualHours: 22.5, isInKind: false, createdAt: now, updatedAt: now },
  // England → 8-80
  { id: 'sa-cash-25', employeeId: 'emp-england', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 45, actualHours: 45, isInKind: false, createdAt: now, updatedAt: now },
  // Jaitly → 8-80
  { id: 'sa-cash-26', employeeId: 'emp-jaitly', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  // James → 8-80
  { id: 'sa-cash-27', employeeId: 'emp-james', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 22.5, actualHours: 22.5, isInKind: false, createdAt: now, updatedAt: now },
  // Kobari → 8-80 (actuals only, no budget)
  { id: 'sa-cash-28', employeeId: 'emp-kobari', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 0, actualHours: 55, isInKind: false, createdAt: now, updatedAt: now },
  // LaPlante → 8-80
  { id: 'sa-cash-29', employeeId: 'emp-laplante', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  // Lehman → Gotcare, 8-80, Lingotec, Niuz
  { id: 'sa-cash-30', employeeId: 'emp-lehman', projectId: 'proj-gotcare', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 54.89, actualHours: 54.89, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-31', employeeId: 'emp-lehman', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 54.29, actualHours: 54.29, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-32', employeeId: 'emp-lehman', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 127.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-95', employeeId: 'emp-lehman', projectId: 'proj-lingotec', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 105, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-101', employeeId: 'emp-lehman', projectId: 'proj-niuz', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 120, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Lemaire → LTC, 8-80
  { id: 'sa-cash-33', employeeId: 'emp-lemaire', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-34', employeeId: 'emp-lemaire', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 37.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-35', employeeId: 'emp-lemaire', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 95, actualHours: 95, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-36', employeeId: 'emp-lemaire', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 75, actualHours: 75, isInKind: false, createdAt: now, updatedAt: now },
  // Mohammadi → Beachhead, Careteam, Gotcare, Tochtech, HEALTHi, AI Scribe, 8-80, OnSPARK, Steadiwear, Lingotec, Niuz
  { id: 'sa-cash-37', employeeId: 'emp-2', projectId: 'proj-beachhead', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 180, actualHours: 178.97, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-38', employeeId: 'emp-2', projectId: 'proj-careteam', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 50, actualHours: 50, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-39', employeeId: 'emp-2', projectId: 'proj-gotcare', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 155, actualHours: 157.55, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-40', employeeId: 'emp-2', projectId: 'proj-gotcare', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 100.05, actualHours: 85.55, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-41', employeeId: 'emp-2', projectId: 'proj-tochtech', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 125, actualHours: 125.05, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-42', employeeId: 'emp-2', projectId: 'proj-tochtech', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 90, actualHours: 90, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-43', employeeId: 'emp-2', projectId: 'proj-healthi', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 48.42, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-44', employeeId: 'emp-2', projectId: 'proj-aiscribe', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 38.29, actualHours: 56.29, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-45', employeeId: 'emp-2', projectId: 'proj-aiscribe', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 45, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-46', employeeId: 'emp-2', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 465, actualHours: 466.67, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-47', employeeId: 'emp-2', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 201.76, actualHours: 201.76, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-48', employeeId: 'emp-2', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 134.08, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-49', employeeId: 'emp-2', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 85.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-50', employeeId: 'emp-2', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 162.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-51', employeeId: 'emp-2', projectId: 'proj-steadiwear', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 15, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-94', employeeId: 'emp-2', projectId: 'proj-lingotec', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 15, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-100', employeeId: 'emp-2', projectId: 'proj-niuz', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 67.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Montoya → Careteam
  { id: 'sa-cash-52', employeeId: 'emp-montoya', projectId: 'proj-careteam', fiscalYearId: 'fy-2025-26', quarterId: 'q1-2025-26', budgetedHours: 215, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-53', employeeId: 'emp-montoya', projectId: 'proj-careteam', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 0, actualHours: 215, isInKind: false, createdAt: now, updatedAt: now },
  // Muwanga → AI Scribe, 8-80, OnSPARK
  { id: 'sa-cash-54', employeeId: 'emp-3', projectId: 'proj-aiscribe', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 22.15, actualHours: 22.15, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-55', employeeId: 'emp-3', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 975, actualHours: 987.88, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-56', employeeId: 'emp-3', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 200, actualHours: 200, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-57', employeeId: 'emp-3', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 173.77, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-58', employeeId: 'emp-3', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 240.64, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-59', employeeId: 'emp-3', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 313.73, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Niezgoda → 8-80, AI Scribe, Steadiwear, HEALTHi, Lingotec, Niuz
  { id: 'sa-cash-60', employeeId: 'emp-niezgoda', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 45, actualHours: 45, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-61', employeeId: 'emp-niezgoda', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 75, actualHours: 75, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-62', employeeId: 'emp-niezgoda', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 60, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-63', employeeId: 'emp-niezgoda', projectId: 'proj-aiscribe', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-64', employeeId: 'emp-niezgoda', projectId: 'proj-aiscribe', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 37.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-65', employeeId: 'emp-niezgoda', projectId: 'proj-steadiwear', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-66', employeeId: 'emp-niezgoda', projectId: 'proj-steadiwear', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 37.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-67', employeeId: 'emp-niezgoda', projectId: 'proj-healthi', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 20, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-99', employeeId: 'emp-niezgoda', projectId: 'proj-lingotec', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 30, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-102', employeeId: 'emp-niezgoda', projectId: 'proj-niuz', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 22.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Poushinsky → 8-80
  { id: 'sa-cash-68', employeeId: 'emp-poushinsky', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 62, actualHours: 62, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-69', employeeId: 'emp-poushinsky', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 75, actualHours: 75, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-70', employeeId: 'emp-poushinsky', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 60, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Power → 8-80 (cash, Q4 only)
  { id: 'sa-cash-71', employeeId: 'emp-power', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 60, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Robinson → LTC, OnSPARK
  { id: 'sa-cash-72', employeeId: 'emp-4', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 975, actualHours: 942.6, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-73', employeeId: 'emp-4', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 328, actualHours: 328, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-74', employeeId: 'emp-4', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 322.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-75', employeeId: 'emp-4', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 200.43, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-76', employeeId: 'emp-4', projectId: 'proj-onspark', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 165, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Rozon → Careteam, 8-80
  { id: 'sa-cash-77', employeeId: 'emp-5', projectId: 'proj-careteam', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 75, actualHours: 75, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-78', employeeId: 'emp-5', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 274.12, actualHours: 274.12, isInKind: false, createdAt: now, updatedAt: now },
  // Ryall → 8-80
  { id: 'sa-cash-79', employeeId: 'emp-ryall', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  // Shafiee → AI Scribe, Beachhead, Careteam, Gotcare, Tochtech, HEALTHi, 8-80, Lingotec
  { id: 'sa-cash-80', employeeId: 'emp-6', projectId: 'proj-aiscribe', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 87.25, actualHours: 87.25, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-81', employeeId: 'emp-6', projectId: 'proj-aiscribe', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 60, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-82', employeeId: 'emp-6', projectId: 'proj-beachhead', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 170, actualHours: 168.04, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-83', employeeId: 'emp-6', projectId: 'proj-careteam', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 62.5, actualHours: 63, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-84', employeeId: 'emp-6', projectId: 'proj-gotcare', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 75, actualHours: 75, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-85', employeeId: 'emp-6', projectId: 'proj-gotcare', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 146, actualHours: 146, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-86', employeeId: 'emp-6', projectId: 'proj-tochtech', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 50, actualHours: 50, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-87', employeeId: 'emp-6', projectId: 'proj-tochtech', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 63.38, actualHours: 63.38, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-88', employeeId: 'emp-6', projectId: 'proj-healthi', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 15, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-90', employeeId: 'emp-6', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 617.5, actualHours: 631.84, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-91', employeeId: 'emp-6', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 218.64, actualHours: 218.64, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-92', employeeId: 'emp-6', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 157.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  { id: 'sa-cash-96', employeeId: 'emp-6', projectId: 'proj-lingotec', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 75, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Sorfleet → 8-80
  { id: 'sa-cash-89', employeeId: 'emp-sorfleet', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 51, actualHours: 51, isInKind: false, createdAt: now, updatedAt: now },
  // Tadic → 8-80
  { id: 'sa-cash-93', employeeId: 'emp-tadic', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: 37.5, isInKind: false, createdAt: now, updatedAt: now },
  // Charron → Lingotec
  { id: 'sa-cash-97', employeeId: 'emp-charron', projectId: 'proj-lingotec', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 48, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },
  // Goulet → Lingotec
  { id: 'sa-cash-98', employeeId: 'emp-goulet', projectId: 'proj-lingotec', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 22.5, actualHours: null, isInKind: false, createdAt: now, updatedAt: now },

  // === IN-KIND ALLOCATIONS ===
  // Poushinsky → Asepha (in-kind)
  { id: 'sa-ik-1', employeeId: 'emp-poushinsky', projectId: 'proj-asepha', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-2', employeeId: 'emp-poushinsky', projectId: 'proj-asepha', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 45, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Power → 8-80 (in-kind)
  { id: 'sa-ik-3', employeeId: 'emp-power', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 95, actualHours: 95, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-4', employeeId: 'emp-power', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 45, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Descoteaux → 8-80, LTC (in-kind)
  { id: 'sa-ik-5', employeeId: 'emp-descoteaux', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 62, actualHours: 62, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-6', employeeId: 'emp-descoteaux', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 37.5, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-7', employeeId: 'emp-descoteaux', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 37.5, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-21', employeeId: 'emp-descoteaux', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 103, actualHours: 103, isInKind: true, createdAt: now, updatedAt: now },
  // Kobari → 8-80 (in-kind)
  { id: 'sa-ik-8', employeeId: 'emp-kobari', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 55, actualHours: 55, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-9', employeeId: 'emp-kobari', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 35, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-10', employeeId: 'emp-kobari', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 35, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // England → 8-80 (in-kind)
  { id: 'sa-ik-11', employeeId: 'emp-england', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 45, actualHours: 45, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-12', employeeId: 'emp-england', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 45, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-13', employeeId: 'emp-england', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 45, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Bennett → 8-80 (in-kind)
  { id: 'sa-ik-14', employeeId: 'emp-bennett', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 48, actualHours: 48, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-15', employeeId: 'emp-bennett', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 30, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-16', employeeId: 'emp-bennett', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 35, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Sorfleet → 8-80 (in-kind)
  { id: 'sa-ik-17', employeeId: 'emp-sorfleet', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 51, actualHours: 51, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-18', employeeId: 'emp-sorfleet', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 30, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-19', employeeId: 'emp-sorfleet', projectId: 'proj-880', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 30, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Montoya → Careteam (in-kind)
  { id: 'sa-ik-20', employeeId: 'emp-montoya', projectId: 'proj-careteam', fiscalYearId: 'fy-2025-26', quarterId: 'q1-2025-26', budgetedHours: 215, actualHours: 215, isInKind: true, createdAt: now, updatedAt: now },
  // Donskov → LTC (in-kind)
  { id: 'sa-ik-22', employeeId: 'emp-donskov', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 161, actualHours: 161, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-23', employeeId: 'emp-donskov', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 80.5, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-24', employeeId: 'emp-donskov', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 80.5, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Poushinsky → LTC (in-kind)
  { id: 'sa-ik-25', employeeId: 'emp-poushinsky', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 297, actualHours: 297, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-26', employeeId: 'emp-poushinsky', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 100, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-27', employeeId: 'emp-poushinsky', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 100, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Power → LTC (in-kind)
  { id: 'sa-ik-28', employeeId: 'emp-power', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 285, actualHours: 285, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-29', employeeId: 'emp-power', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 142.5, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-30', employeeId: 'emp-power', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 142.5, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Taillon → LTC (in-kind)
  { id: 'sa-ik-31', employeeId: 'emp-taillon', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 180, actualHours: 180, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-32', employeeId: 'emp-taillon', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 90, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-33', employeeId: 'emp-taillon', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 90, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  // Wilson → LTC (in-kind)
  { id: 'sa-ik-34', employeeId: 'emp-wilson', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', budgetedHours: 120, actualHours: 120, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-35', employeeId: 'emp-wilson', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', budgetedHours: 50, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
  { id: 'sa-ik-36', employeeId: 'emp-wilson', projectId: 'proj-ltcin', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', budgetedHours: 50, actualHours: null, isInKind: true, createdAt: now, updatedAt: now },
];

// =============================================================================
// EXPENSES (Cash from Master Tracker)
// =============================================================================

const expenses: Expense[] = [
  { id: 'exp-1', projectId: 'proj-aiscribe', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', description: 'Regulatory and Compliance', budgetedAmount: 14000, actualAmount: 14343.72, createdAt: now, updatedAt: now },
  { id: 'exp-2', projectId: 'proj-beachhead', categoryId: 'cat-services', fiscalYearId: 'fy-2025-26', quarterId: 'q1-2025-26', description: 'Daniel Kobewka', budgetedAmount: 14431.4, actualAmount: 14431.4, createdAt: now, updatedAt: now },
  { id: 'exp-3', projectId: 'proj-880', categoryId: 'cat-services', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', description: 'Daniel Kobewka', budgetedAmount: 15591, actualAmount: 15591, createdAt: now, updatedAt: now },
  { id: 'exp-4', projectId: 'proj-ltcin', categoryId: 'cat-equipment', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', description: 'Laptop', budgetedAmount: 2000, actualAmount: null, createdAt: now, updatedAt: now },
  { id: 'exp-5', projectId: 'proj-ltcin', categoryId: 'cat-travel', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', description: 'CAN Health + OLTC Conferences', budgetedAmount: 2042.75, actualAmount: 2042.75, createdAt: now, updatedAt: now },
  { id: 'exp-6', projectId: 'proj-880', categoryId: 'cat-services', fiscalYearId: 'fy-2025-26', quarterId: 'q1-2025-26', description: 'Matt Bromwich', budgetedAmount: 13500, actualAmount: 13500, createdAt: now, updatedAt: now },
  { id: 'exp-7', projectId: 'proj-880', categoryId: 'cat-services', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', description: 'Matt Bromwich', budgetedAmount: 13500, actualAmount: 13500, createdAt: now, updatedAt: now },
  { id: 'exp-8', projectId: 'proj-880', categoryId: 'cat-services', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', description: 'Matt Bromwich', budgetedAmount: 13500, actualAmount: 13500, createdAt: now, updatedAt: now },
  { id: 'exp-9', projectId: 'proj-880', categoryId: 'cat-services', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', description: 'Matt Bromwich', budgetedAmount: 13500, actualAmount: 13500, createdAt: now, updatedAt: now },
  { id: 'exp-10', projectId: 'proj-880', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', description: 'Innovation Operating Costs', budgetedAmount: 3540.97, actualAmount: 3540.97, createdAt: now, updatedAt: now },
  { id: 'exp-11', projectId: 'proj-880', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', description: 'Innovation Operating Costs', budgetedAmount: 44.63, actualAmount: 44.63, createdAt: now, updatedAt: now },
  { id: 'exp-12', projectId: 'proj-880', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', description: 'Innovation Operating Costs', budgetedAmount: 997.47, actualAmount: 997.47, createdAt: now, updatedAt: now },
  { id: 'exp-13', projectId: 'proj-beachhead', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q1-2025-26', description: 'Program Delivery Costs - Overhead', budgetedAmount: 1794.07, actualAmount: null, createdAt: now, updatedAt: now },
  { id: 'exp-14', projectId: 'proj-beachhead', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', description: 'Program Delivery Costs - Overhead', budgetedAmount: 0, actualAmount: 1794.07, createdAt: now, updatedAt: now },
  { id: 'exp-15', projectId: 'proj-gotcare', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', description: 'Program Delivery Costs - Overhead', budgetedAmount: 2217.87, actualAmount: 2217.87, createdAt: now, updatedAt: now },
  { id: 'exp-16', projectId: 'proj-gotcare', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', description: 'Program Delivery Costs - Overhead', budgetedAmount: 3331.77, actualAmount: 2796.63, createdAt: now, updatedAt: now },
  { id: 'exp-17', projectId: 'proj-tochtech', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q2-2025-26', description: 'Program Delivery Costs - Overhead', budgetedAmount: 1756.97, actualAmount: 1756.97, createdAt: now, updatedAt: now },
  { id: 'exp-18', projectId: 'proj-tochtech', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q3-2025-26', description: 'Program Delivery Costs - Overhead', budgetedAmount: 2362.03, actualAmount: 1579.25, createdAt: now, updatedAt: now },
  { id: 'exp-19', projectId: 'proj-ltcin', categoryId: 'cat-travel', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', description: 'LTC Conference - TWC', budgetedAmount: 1500, actualAmount: null, createdAt: now, updatedAt: now },
  { id: 'exp-20', projectId: 'proj-lingotec', categoryId: 'cat-other', fiscalYearId: 'fy-2025-26', quarterId: 'q4-2025-26', description: 'Third-Party PIA - Calian', budgetedAmount: 12262, actualAmount: null, createdAt: now, updatedAt: now },
];

// Claims for FY 2025-26
const claims: Claim[] = [
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
    db.expenses,
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
    await db.expenses.bulkAdd(expenses);
    await db.claims.bulkAdd(claims);
  });

  console.log('Database seeded successfully!');
  console.log(`  ${employees.length} employees, ${employeeRates.length} rates`);
  console.log(`  ${salaryAllocations.length} salary allocations (${salaryAllocations.filter(a => !a.isInKind).length} cash, ${salaryAllocations.filter(a => a.isInKind).length} in-kind)`);
  console.log(`  ${expenses.length} expenses`);
}

// =============================================================================
// RESET FUNCTION (for development)
// =============================================================================

export async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
  await seedDatabase();
}
