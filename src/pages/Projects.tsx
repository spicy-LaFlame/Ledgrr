import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ExternalLink, MoreHorizontal } from 'lucide-react';
import { useProjects, type ProjectFormData } from '../hooks/useProjects';
import type { Project } from '../db/schema';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';

type StatusFilter = 'all' | 'active' | 'pipeline' | 'completed' | 'on-hold';

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  pipeline: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-slate-100', text: 'text-slate-600' },
  'on-hold': { bg: 'bg-orange-100', text: 'text-orange-700' },
};

const fundingTypeStyles: Record<string, { bg: string; text: string }> = {
  cash: { bg: 'bg-blue-100', text: 'text-blue-700' },
  'in-kind': { bg: 'bg-purple-100', text: 'text-purple-700' },
  mixed: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.costCentreNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  const getFunderName = (funderId: string) => {
    return funders.find(f => f.id === funderId)?.name ?? 'Unknown';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusCounts = {
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    pipeline: projects.filter(p => p.status === 'pipeline').length,
    completed: projects.filter(p => p.status === 'completed').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
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
    setExpandedRow(null);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
    setExpandedRow(null);
  };

  const toggleRowMenu = (projectId: string) => {
    setExpandedRow(expandedRow === projectId ? null : projectId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track innovation projects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, codes, cost centres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'active', 'pipeline', 'completed', 'on-hold'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === status
                  ? 'text-white bg-slate-900'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              {' '}({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Project
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Funder
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Cash Budget
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  In-Kind
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Benefits Cap
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Timeline
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium text-slate-500">No projects found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const style = statusStyles[project.status];
                  const fundingStyle = fundingTypeStyles[project.fundingType];
                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{project.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{project.code}</span>
                            {project.costCentreNumber && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span className="text-xs text-slate-400">{project.costCentreNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{getFunderName(project.funderId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} w-fit`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${fundingStyle.bg} ${fundingStyle.text} w-fit`}>
                            {project.fundingType.charAt(0).toUpperCase() + project.fundingType.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{formatCurrency(project.totalBudget)}</div>
                          <div className="text-xs text-slate-500">FY: {formatCurrency(project.fiscalYearBudget)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{formatCurrency(project.inKindBudget)}</div>
                          <div className="text-xs text-slate-500">FY: {formatCurrency(project.inKindFiscalYearBudget)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm text-slate-700">{project.benefitsCapPercent}%</span>
                          <div className="text-xs text-slate-400">
                            {project.benefitsCapType === 'percentage-of-wages' ? 'of wages' : 'of benefits'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-500">
                          <div>{formatDate(project.startDate)}</div>
                          {project.endDate && (
                            <div className="text-slate-400">to {formatDate(project.endDate)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1 relative">
                          {project.fundingAgreementUrl && (
                            <a
                              href={project.fundingAgreementUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View funding agreement"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit project"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleRowMenu(project.id); }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </button>

                          {/* Dropdown menu */}
                          {expandedRow === project.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                              <button
                                onClick={() => openEditModal(project)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(project)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-slate-500">
        Showing {filteredProjects.length} of {projects.length} projects
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
      {expandedRow && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setExpandedRow(null)}
        />
      )}
    </div>
  );
};

export default Projects;
