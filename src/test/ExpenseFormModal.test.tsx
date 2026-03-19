import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import type { Project, ExpenseCategory, Quarter, Expense } from '../db/schema';

const projects: Project[] = [
  {
    id: 'proj-1', name: 'AI Scribe', code: 'AISC', funderId: 'f1',
    status: 'active', fundingType: 'cash', startDate: '2025-04-01',
    totalBudget: 50000, fiscalYearBudget: 50000, inKindBudget: 0,
    inKindFiscalYearBudget: 0, benefitsCapPercent: 100,
    benefitsCapType: 'percentage-of-benefits', isActive: true,
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
];

const categories: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Travel', sortOrder: 1 },
  { id: 'cat-2', name: 'Equipment', sortOrder: 2 },
  { id: 'cat-3', name: 'Software', sortOrder: 3 },
];

const quarters: Quarter[] = [
  { id: 'q1', name: 'Q1 2025-26', quarterNumber: 1, fiscalYearId: 'fy1', startDate: '2025-04-01', endDate: '2025-06-30' },
  { id: 'q2', name: 'Q2 2025-26', quarterNumber: 2, fiscalYearId: 'fy1', startDate: '2025-07-01', endDate: '2025-09-30' },
];

const sampleExpense: Expense = {
  id: 'exp-1', projectId: 'proj-1', categoryId: 'cat-1',
  fiscalYearId: 'fy1', quarterId: 'q1', description: 'Conference travel',
  budgetedAmount: 2000, actualAmount: 1800, paymentMethod: 'corporate-card',
  createdAt: '2025-01-01', updatedAt: '2025-01-01',
};

describe('ExpenseFormModal', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    onSubmit = vi.fn().mockResolvedValue(undefined);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ExpenseFormModal
        isOpen={false} onClose={onClose} onSubmit={onSubmit}
        mode="add" projects={projects} categories={categories}
        quarters={quarters} currentFiscalYearId="fy1"
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders add mode with heading', () => {
    render(
      <ExpenseFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" projects={projects} categories={categories}
        quarters={quarters} currentFiscalYearId="fy1"
      />
    );
    expect(screen.getByRole('heading', { name: 'Add Expense' })).toBeInTheDocument();
  });

  it('renders edit mode pre-populated', () => {
    render(
      <ExpenseFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        expense={sampleExpense} mode="edit" projects={projects}
        categories={categories} quarters={quarters} currentFiscalYearId="fy1"
      />
    );
    expect(screen.getByRole('heading', { name: 'Edit Expense' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Conference travel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1800')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <ExpenseFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" projects={[]} categories={[]} quarters={[]}
        currentFiscalYearId="fy1"
      />
    );

    const submitButtons = screen.getAllByText('Add Expense');
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(screen.getByText('Project is required')).toBeInTheDocument();
    expect(screen.getByText('Category is required')).toBeInTheDocument();
    expect(screen.getByText('Quarter is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits correct data', async () => {
    const user = userEvent.setup();
    render(
      <ExpenseFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" projects={projects} categories={categories}
        quarters={quarters} currentFiscalYearId="fy1"
      />
    );

    // Fill description
    await user.type(screen.getByPlaceholderText(/Conference travel/), 'Software license');

    // Fill budgeted amount
    await user.type(screen.getByPlaceholderText('0.00'), '500');

    const submitButtons = screen.getAllByText('Add Expense');
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const data = onSubmit.mock.calls[0][0];
    expect(data.description).toBe('Software license');
    expect(data.budgetedAmount).toBe(500);
    expect(data.projectId).toBe('proj-1');
    expect(data.categoryId).toBe('cat-1');
  });

  it('shows payment method options', () => {
    render(
      <ExpenseFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" projects={projects} categories={categories}
        quarters={quarters} currentFiscalYearId="fy1"
      />
    );
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Not specified')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ExpenseFormModal
        isOpen={true} onClose={onClose} onSubmit={onSubmit}
        mode="add" projects={projects} categories={categories}
        quarters={quarters} currentFiscalYearId="fy1"
      />
    );
    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
