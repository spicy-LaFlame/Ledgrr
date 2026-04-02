import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MoreVertical, ArrowRight, Building2, Calendar } from 'lucide-react';
import { useProjects, type ProjectFormData } from '../hooks/useProjects';
import { useFiscalPeriods } from '../hooks/useAllocations';
import { useProjectSpending } from '../hooks/useDashboard';
import type { Project } from '../db/schema';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';
import { FilterBar, type FilterValues } from '../components/shared/FilterBar';
import { PageHeader } from '../components/shared/PageHeader';
import { Badge } from '../components/shared/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/shared/Pagination';

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'neutral' | 'danger'> = {
  active: 'success',
  pipeline: 'warning',
  completed: 'neutral',
  'on-hold': 'danger',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  pipeline: 'Pipeline',
  completed: 'Completed',
  'on-hold': 'On Hold',
};

const progressLabel: Record<string, string> = {
  active: 'Spending Efficiency',
  pipeline: 'Planning Phase',
  completed: 'Completed',
  'on-hold': 'Project Stalled',
};

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const {
    projects,
    funders,
    addProject,
    updateProject,
    softDeleteProject,
    permanentDeleteProject,
  } = useProjects();

  const { currentFiscalYear } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';
  const spending = useProjectSpending(fiscalYearId, 'full');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({ status: [] });
  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setFilterValues(prev => ({ ...prev, [key]: values }));
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const spendingMap = useMemo(() => {
    const map: Record<string, { budgeted: number; actual: number }> = {};
    for (const s of spending) {
      map[s.projectId] = { budgeted: s.budgeted, actual: s.actual };
    }
    return map;
  }, [spending]);

  const filteredProjects = useMemo(() => projects.filter(project => {
    const matchesStatus = filterValues.status.length === 0 || filterValues.status.includes(project.status);
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.costCentreNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  }), [projects, filterValues, searchQuery]);

  const pagination = usePagination(filteredProjects, { defaultPageSize: 9, pageSizeOptions: [6, 9, 12, 24] });

  const getFunderName = (funderId: string) => {
    return funders.find(f => f.id === funderId)?.name ?? 'Unknown';
  };

  const statusCounts = {
    active: projects.filter(p => p.status === 'active').length,
    pipeline: projects.filter(p => p.status === 'pipeline').length,
    completed: projects.filter(p => p.status === 'completed').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
  };

  const getSpendingPercent = (project: Project) => {
    const data = spendingMap[project.id];
    if (!data || data.budgeted === 0) return 0;
    return Math.round((data.actual / data.budgeted) * 100);
  };

  const getBudgetAllocationPercent = (project: Project) => {
    if (project.fiscalYearBudget === 0) return 0;
    const data = spendingMap[project.id];
    if (!data) return 0;
    return Math.round((data.budgeted / project.fiscalYearBudget) * 100);
  };

  const getAllocationBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-cyan-500';
    if (pct >= 50) return 'bg-amber-400';
    return 'bg-slate-300';
  };

  const getProgressBarColor = (project: Project) => {
    if (project.status === 'on-hold') return 'bg-orange-400';
    if (project.status === 'completed') return 'bg-slate-400';
    const pct = getSpendingPercent(project);
    if (pct >= 50) return 'bg-emerald-500';
    if (pct >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleAddProject = async (data: ProjectFormData) => {
    await addProject(data);
  };

  const handleEditProject = async (data: ProjectFormData) => {
    if (selectedProject) {
      await updateProject(selectedProject.id, data);
    }
  };

  const handleDeleteProject = async (permanent: boolean) => {
    if (selectedProject) {
      if (permanent) {
        await permanentDeleteProject(selectedProject.id);
      } else {
        await softDeleteProject(selectedProject.id);
      }
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
    setOpenMenu(null);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Projects"
        subtitle="Manage and track innovation projects"
      />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search projects, codes, cost centres..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            placeholder: 'All Statuses',
            options: [
              { value: 'active', label: `Active (${statusCounts.active})` },
              { value: 'pipeline', label: `Pipeline (${statusCounts.pipeline})` },
              { value: 'completed', label: `Completed (${statusCounts.completed})` },
              { value: 'on-hold', label: `On Hold (${statusCounts['on-hold']})` },
            ],
          },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        resultCount={filteredProjects.length}
        resultLabel="projects"
        totalCount={projects.length}
      />

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagination.pageItems.map((project) => {
          const pct = getSpendingPercent(project);
          const barColor = getProgressBarColor(project);
          const label = progressLabel[project.status] ?? 'Spending Efficiency';
          const allocPct = getBudgetAllocationPercent(project);
          const allocBarColor = getAllocationBarColor(allocPct);

          return (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative group"
            >
              {/* Top row: Status badge + code */}
              <div className="flex items-start justify-between mb-3">
                <Badge variant={statusBadgeVariant[project.status] ?? 'neutral'}>
                  {statusLabels[project.status] ?? project.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">{project.code}</span>
                  {/* Context menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === project.id ? null : project.id); }}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    {openMenu === project.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                        <button
                          onClick={() => openEditModal(project)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(project)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project name */}
              <h3 className="text-base font-semibold text-cyan-900 mb-1 line-clamp-2">
                {project.name}
              </h3>

              {/* Funder */}
              <div className="flex items-center gap-1.5 mb-4">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Funder: {getFunderName(project.funderId)}</span>
              </div>

              {/* Progress bars */}
              <div className="mb-4 space-y-2.5">
                {/* Funding Allocated */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Funding Allocated</span>
                    <span className="text-xs font-semibold text-slate-700">{allocPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full animate-progress-fill ${allocBarColor}`}
                      style={{ width: `${Math.min(allocPct, 100)}%` }}
                    />
                  </div>
                </div>
                {/* Spending Efficiency */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
                    <span className="text-xs font-semibold text-slate-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full animate-progress-fill ${barColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Budget + Deadline */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Budget</p>
                  <p className="font-semibold text-cyan-900">{formatCurrency(project.fiscalYearBudget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Deadline</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <p className="font-medium text-slate-700">{formatDate(project.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* View Details link */}
              <button
                onClick={() => navigate(`/app/projects/${project.id}`)}
                className="w-full text-center text-sm font-medium text-cyan-600 hover:text-cyan-700 py-2 border-t border-slate-100 flex items-center justify-center gap-1 transition-colors duration-200 cursor-pointer"
              >
                {project.status === 'completed' ? 'Archive Report' : 'View Details'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {/* Start New Project card */}
        <button
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-cyan-300 rounded-2xl p-5 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-200 flex flex-col items-center justify-center min-h-[280px] group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center mb-3 transition-colors duration-200">
            <Plus className="w-6 h-6 text-cyan-500 group-hover:text-cyan-600" />
          </div>
          <span className="text-sm font-medium text-slate-600 group-hover:text-cyan-700">Start New Project</span>
          <span className="text-xs text-slate-400 mt-1">
            {currentFiscalYear?.name ?? 'Current FY'}
          </span>
        </button>
      </div>

      {/* Pagination */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <Pagination pagination={pagination} noun="projects" />
      </div>

      {/* Add Project Modal */}
      <ProjectFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProject}
        funders={funders}
        mode="add"
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <ProjectFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          onSubmit={handleEditProject}
          project={selectedProject}
          funders={funders}
          mode="edit"
        />
      )}

      {/* Delete Project Modal */}
      {selectedProject && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
          onConfirm={handleDeleteProject}
          project={selectedProject}
        />
      )}

      {/* Click outside to close menu */}
      {openMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenu(null)}
        />
      )}
    </div>
  );
};

export default Projects;
