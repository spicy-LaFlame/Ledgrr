import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllocationFormModal from '../components/allocations/AllocationFormModal';
import type { Employee, Project, Quarter, EmployeeRate, SalaryAllocation } from '../db/schema';

const employees: Employee[] = [
  {
    id: 'emp-1', name: 'Muwanga, Moses', role: 'Finance Assistant',
    organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950,
    status: 'active', createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
  {
    id: 'emp-2', name: 'Doe, John', role: 'Developer',
    organizationId: 'org-1', isInnovationTeam: true, annualFTEHours: 1950,
    status: 'active', createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
];

const projects: Project[] = [
  {
    id: 'proj-1', name: '8-80 Initiative', code: '8-80', funderId: 'f1',
    status: 'active', fundingType: 'cash', startDate: '2025-04-01',
    totalBudget: 420773, fiscalYearBudget: 420773, inKindBudget: 0,
    inKindFiscalYearBudget: 0, benefitsCapPercent: 20,
    benefitsCapType: 'percentage-of-wages', isActive: true,
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
  {
    id: 'proj-2', name: 'AI Scribe', code: 'AISC', funderId: 'f2',
    status: 'active', fundingType: 'cash', startDate: '2025-04-01',
    totalBudget: 50000, fiscalYearBudget: 50000, inKindBudget: 0,
    inKindFiscalYearBudget: 0, benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits', isActive: true,
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
];

const quarters: Quarter[] = [
  { id: 'q1', name: 'Q1 2025-26', quarterNumber: 1, fiscalYearId: 'fy1', startDate: '2025-04-01', endDate: '2025-06-30' },
  { id: 'q2', name: 'Q2 2025-26', quarterNumber: 2, fiscalYearId: 'fy1', startDate: '2025-07-01', endDate: '2025-09-30' },
];

const rates: EmployeeRate[] = [
  {
    id: 'r1', employeeId: 'emp-1', fiscalYearId: 'fy1', quarterId: 'q1',
    baseHourlyRate: 27.00, benefitsRate: 4.81,
    effectiveDate: '2025-04-01', createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
];

const sampleAllocation: SalaryAllocation = {
  id: 'alloc-1', employeeId: 'emp-1', projectId: 'proj-1',
  fiscalYearId: 'fy1', quarterId: 'q1', budgetedHours: 100,
  actualHours: 80, isInKind: false, createdAt: '2025-01-01', updatedAt: '2025-01-01',
};

describe('AllocationFormModal', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onSubmit: ReturnType<typeof vi.fn>;
  let checkDuplicate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    onSubmit = vi.fn().mockResolvedValue(undefined);
    checkDuplicate = vi.fn().mockResolvedValue(false);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AllocationFormModal
        isOpen={false} onClose={onClose} onSubmit={onSubmit}
        mode="add" employees={employees} projects={projects}
        quarters={quarters} rates={rates} currentFiscalYearId="fy1"
        checkDuplicate={checkDuplicate}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders add mode with heading', () => {
    render(
      <AllocationFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" employees={employees} projects={projects}
        quarters={quarters} rates={rates} currentFiscalYearId="fy1"
        checkDuplicate={checkDuplicate}
      />
    );
    expect(screen.getByRole('heading', { name: 'Add Allocation' })).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders edit mode pre-populated', () => {
    render(
      <AllocationFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        allocation={sampleAllocation} mode="edit" employees={employees}
        projects={projects} quarters={quarters} rates={rates}
        currentFiscalYearId="fy1" checkDuplicate={checkDuplicate}
      />
    );
    expect(screen.getByRole('heading', { name: 'Edit Allocation' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <AllocationFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" employees={[]} projects={[]} quarters={[]}
        rates={rates} currentFiscalYearId="fy1" checkDuplicate={checkDuplicate}
      />
    );

    const submitButtons = screen.getAllByText('Add Allocation');
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(screen.getByText('Employee is required')).toBeInTheDocument();
    expect(screen.getByText('Project is required')).toBeInTheDocument();
    expect(screen.getByText('Quarter is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows cost preview when employee and project selected', async () => {
    const user = userEvent.setup();
    render(
      <AllocationFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" employees={employees} projects={projects}
        quarters={quarters} rates={rates} currentFiscalYearId="fy1"
        checkDuplicate={checkDuplicate}
      />
    );

    // Type budgeted hours
    const hoursInput = screen.getByPlaceholderText('0');
    await user.type(hoursInput, '100');

    // Cost preview should appear
    expect(screen.getByText('Cost Preview')).toBeInTheDocument();
  });

  it('shows duplicate error when checkDuplicate returns true', async () => {
    checkDuplicate.mockResolvedValue(true);
    const user = userEvent.setup();
    render(
      <AllocationFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" employees={employees} projects={projects}
        quarters={quarters} rates={rates} currentFiscalYearId="fy1"
        checkDuplicate={checkDuplicate}
      />
    );

    // Fill required hours
    const hoursInput = screen.getByPlaceholderText('0');
    await user.type(hoursInput, '100');

    // Submit
    const submitButtons = screen.getAllByText('Add Allocation');
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/allocation already exists/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AllocationFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" employees={employees} projects={projects}
        quarters={quarters} rates={rates} currentFiscalYearId="fy1"
        checkDuplicate={checkDuplicate}
      />
    );
    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
