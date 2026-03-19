import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import type { Project, Funder } from '../db/schema';

const funders: Funder[] = [
  {
    id: 'funder-1',
    name: 'CABHI',
    code: 'CABHI',
    benefitCoverageRate: 1.0,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'funder-2',
    name: 'envisAGE',
    code: 'ENVI',
    benefitCoverageRate: 0,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
];

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
  inKindBudget: 0,
  inKindFiscalYearBudget: 0,
  benefitsCapPercent: 100,
  benefitsCapType: 'percentage-of-benefits',
  costCentreNumber: '20-939802500',
  principalInvestigator: 'Dr. Smith',
  isActive: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

describe('ProjectFormModal', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    onSubmit = vi.fn().mockResolvedValue(undefined);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ProjectFormModal
        isOpen={false}
        onClose={onClose}
        onSubmit={onSubmit}
        funders={funders}
        mode="add"
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders add mode with correct title', () => {
    render(
      <ProjectFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        funders={funders}
        mode="add"
      />
    );
    expect(screen.getByText('Add New Project')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('renders edit mode pre-populated with project data', () => {
    render(
      <ProjectFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        project={sampleProject}
        funders={funders}
        mode="edit"
      />
    );
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('AI Scribe Evaluation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('AISC')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20-939802500')).toBeInTheDocument();
  });

  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    render(
      <ProjectFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        funders={funders}
        mode="add"
      />
    );

    // Clear the default start date and funder
    const nameInput = screen.getByPlaceholderText('e.g., AI Scribe Evaluation');
    await user.clear(nameInput);

    // Submit
    await user.click(screen.getByText('Create Project'));

    expect(screen.getByText('Project name is required')).toBeInTheDocument();
    expect(screen.getByText('Project code is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data on valid submit', async () => {
    const user = userEvent.setup();
    render(
      <ProjectFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        funders={funders}
        mode="add"
      />
    );

    await user.type(screen.getByPlaceholderText('e.g., AI Scribe Evaluation'), 'Test Project');
    await user.type(screen.getByPlaceholderText('e.g., AISC'), 'TST');

    await user.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submittedData = onSubmit.mock.calls[0][0];
    expect(submittedData.name).toBe('Test Project');
    expect(submittedData.code).toBe('TST');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProjectFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        funders={funders}
        mode="add"
      />
    );

    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
