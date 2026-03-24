import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectDetail from '../pages/ProjectDetail';
import type { Project, Funder } from '../db/schema';

// Mock the hooks
vi.mock('../hooks/useProjects', () => ({
  useProject: vi.fn(),
  useProjects: vi.fn(),
}));

vi.mock('../hooks/useAllocations', () => ({
  useAllocations: vi.fn(),
  useExpenses: vi.fn(),
  useExpenseCategories: vi.fn(),
  useFiscalPeriods: vi.fn(),
}));

vi.mock('../hooks/useEmployees', () => ({
  useEmployees: vi.fn(),
  useEmployeeRates: vi.fn(),
  calculateCost: vi.fn(() => ({ fundedCost: 0, hospitalCovers: 0, totalCost: 0 })),
}));

import { useProject, useProjects } from '../hooks/useProjects';
import { useAllocations, useExpenses, useExpenseCategories, useFiscalPeriods } from '../hooks/useAllocations';
import { useEmployees, useEmployeeRates } from '../hooks/useEmployees';

const mockUseProject = vi.mocked(useProject);
const mockUseProjects = vi.mocked(useProjects);
const mockUseAllocations = vi.mocked(useAllocations);
const mockUseExpenses = vi.mocked(useExpenses);
const mockUseExpenseCategories = vi.mocked(useExpenseCategories);
const mockUseFiscalPeriods = vi.mocked(useFiscalPeriods);
const mockUseEmployees = vi.mocked(useEmployees);
const mockUseEmployeeRates = vi.mocked(useEmployeeRates);

const sampleProject: Project = {
  id: 'proj-1',
  name: 'AI Scribe Evaluation',
  code: 'AISC',
  funderId: 'funder-1',
  status: 'active',
  fundingType: 'cash',
  startDate: '2025-04-01',
  endDate: '2026-03-31',
  totalBudget: 50000,
  fiscalYearBudget: 50000,
  inKindBudget: 10000,
  inKindFiscalYearBudget: 10000,
  benefitsCapPercent: 100,
  benefitsCapType: 'percentage-of-benefits',
  costCentreNumber: '20-939802500',
  principalInvestigator: 'Dr. Smith',
  isActive: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const sampleFunder: Funder = {
  id: 'funder-1',
  name: 'CABHI',
  code: 'CABHI',
  benefitCoverageRate: 1.0,
  isActive: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

function renderWithRouter(projectId = 'proj-1') {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects" element={<div>Projects List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProjectDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjects.mockReturnValue({
      projects: [],
      activeProjects: [],
      funders: [sampleFunder],
      addProject: vi.fn(),
      updateProject: vi.fn(),
      softDeleteProject: vi.fn(),
      permanentDeleteProject: vi.fn(),
    } as unknown as ReturnType<typeof useProjects>);
    mockUseAllocations.mockReturnValue({
      allocations: [],
    } as unknown as ReturnType<typeof useAllocations>);
    mockUseExpenses.mockReturnValue({
      expenses: [],
    } as unknown as ReturnType<typeof useExpenses>);
    mockUseExpenseCategories.mockReturnValue([] as ReturnType<typeof useExpenseCategories>);
    mockUseFiscalPeriods.mockReturnValue({
      fiscalYears: [],
      quarters: [],
      currentFiscalYear: { id: 'fy-2025-26', name: '2025-26', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: true },
      getQuartersForYear: vi.fn(() => []),
      getCurrentQuarter: vi.fn(() => undefined),
    } as unknown as ReturnType<typeof useFiscalPeriods>);
    mockUseEmployees.mockReturnValue({
      employees: [],
      allEmployees: [],
      innovationTeam: [],
      organizations: [],
      getEmployeeWithOrg: vi.fn(),
      addEmployee: vi.fn(),
      updateEmployee: vi.fn(),
    } as unknown as ReturnType<typeof useEmployees>);
    mockUseEmployeeRates.mockReturnValue({
      rates: [],
      addRate: vi.fn(),
      updateRate: vi.fn(),
      getRateForQuarter: vi.fn(),
    } as unknown as ReturnType<typeof useEmployeeRates>);
  });

  it('shows loading state when project is undefined', () => {
    mockUseProject.mockReturnValue({
      project: undefined,
      funder: undefined,
    } as ReturnType<typeof useProject>);

    renderWithRouter();
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('shows not found when project is null', () => {
    mockUseProject.mockReturnValue({
      project: null,
      funder: null,
    } as unknown as ReturnType<typeof useProject>);

    renderWithRouter();
    expect(screen.getByText('Project Not Found')).toBeInTheDocument();
    expect(screen.getByText('Back to Projects')).toBeInTheDocument();
  });

  it('renders project metadata when loaded', () => {
    mockUseProject.mockReturnValue({
      project: sampleProject,
      funder: sampleFunder,
    } as ReturnType<typeof useProject>);

    renderWithRouter();

    // Project name
    expect(screen.getByText('AI Scribe Evaluation')).toBeInTheDocument();

    // Metadata
    expect(screen.getByText('AISC')).toBeInTheDocument();
    expect(screen.getByText('20-939802500')).toBeInTheDocument();
    expect(screen.getByText('CABHI')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Budget values — $50,000 appears twice (total + FY), $10,000 appears twice (in-kind total + FY)
    expect(screen.getAllByText('$50,000')).toHaveLength(2);
    expect(screen.getAllByText('$10,000')).toHaveLength(2);

    // Edit button
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
  });

  it('shows allocation count', () => {
    mockUseProject.mockReturnValue({
      project: sampleProject,
      funder: sampleFunder,
    } as ReturnType<typeof useProject>);
    mockUseAllocations.mockReturnValue({
      allocations: [
        { id: 'a1', employeeId: 'e1', quarterId: 'q1', budgetedHours: 100, actualHours: null, isInKind: false },
        { id: 'a2', employeeId: 'e2', quarterId: 'q1', budgetedHours: 50, actualHours: null, isInKind: false },
        { id: 'a3', employeeId: 'e1', quarterId: 'q2', budgetedHours: 75, actualHours: null, isInKind: false },
      ],
    } as unknown as ReturnType<typeof useAllocations>);

    renderWithRouter();
    expect(screen.getByText(/3 records across all quarters/)).toBeInTheDocument();
  });

  it('shows singular allocation text for 1 record', () => {
    mockUseProject.mockReturnValue({
      project: sampleProject,
      funder: sampleFunder,
    } as ReturnType<typeof useProject>);
    mockUseAllocations.mockReturnValue({
      allocations: [
        { id: 'a1', employeeId: 'e1', quarterId: 'q1', budgetedHours: 100, actualHours: null, isInKind: false },
      ],
    } as unknown as ReturnType<typeof useAllocations>);

    renderWithRouter();
    expect(screen.getByText(/1 record across all quarters/)).toBeInTheDocument();
  });
});
