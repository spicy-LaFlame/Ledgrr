import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeFormModal from '../components/employees/EmployeeFormModal';
import type { Employee, Organization } from '../db/schema';

const organizations: Organization[] = [
  { id: 'org-1', name: 'BH-Innovation', code: 'BH-Innovation' },
  { id: 'org-2', name: 'BH', code: 'BH' },
  { id: 'org-3', name: 'BHRI', code: 'BHRI' },
];

const sampleEmployee: Employee = {
  id: 'emp-1',
  name: 'Muwanga, Moses',
  role: 'Finance and Programs Assistant',
  organizationId: 'org-1',
  isInnovationTeam: true,
  annualFTEHours: 1950,
  status: 'active',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

describe('EmployeeFormModal', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    onSubmit = vi.fn().mockResolvedValue(undefined);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EmployeeFormModal
        isOpen={false}
        onClose={onClose}
        onSubmit={onSubmit}
        organizations={organizations}
        mode="add"
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders add mode with correct defaults', () => {
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        organizations={organizations}
        mode="add"
      />
    );

    expect(screen.getByRole('heading', { name: 'Add Employee' })).toBeInTheDocument();
    // Default FTE hours is 1950
    expect(screen.getByDisplayValue('1950')).toBeInTheDocument();
    // Innovation team checkbox should be unchecked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders edit mode pre-populated with employee data', () => {
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        employee={sampleEmployee}
        organizations={organizations}
        mode="edit"
      />
    );

    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Muwanga, Moses')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Finance and Programs Assistant')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1950')).toBeInTheDocument();

    // Innovation team should be checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        organizations={organizations}
        mode="add"
      />
    );

    // Submit without filling required fields
    // The "Add Employee" button at bottom is the submit button
    const submitButtons = screen.getAllByText('Add Employee');
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(screen.getByText('Employee name is required')).toBeInTheDocument();
    expect(screen.getByText('Role is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('toggles innovation team checkbox', async () => {
    const user = userEvent.setup();
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        organizations={organizations}
        mode="add"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('calls onSubmit with correct shaped data', async () => {
    const user = userEvent.setup();
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        organizations={organizations}
        mode="add"
      />
    );

    await user.type(screen.getByPlaceholderText(/Last, First/), 'Doe, John');
    await user.type(screen.getByPlaceholderText(/Finance and Programs/), 'Developer');

    // Innovation team toggle
    await user.click(screen.getByRole('checkbox'));

    // Submit
    const submitButtons = screen.getAllByText('Add Employee');
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const data = onSubmit.mock.calls[0][0];
    expect(data.name).toBe('Doe, John');
    expect(data.role).toBe('Developer');
    expect(data.isInnovationTeam).toBe(true);
    expect(data.annualFTEHours).toBe(1950);
    expect(data.status).toBe('active');
    expect(data.organizationId).toBe('org-1'); // first org as default
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        organizations={organizations}
        mode="add"
      />
    );

    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
