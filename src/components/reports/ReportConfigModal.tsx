import { useState, useEffect } from 'react';
import type { FiscalYear, Quarter, Project } from '../../db/schema';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

export type ReportType = 'project-summary' | 'team-allocation' | 'project-status' | 'quarterly-claims';

export interface ReportParams {
  reportType: ReportType;
  fiscalYearId: string;
  quarterId?: string;
  projectId?: string;
  statusFilter?: string;
}

interface ReportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  onGenerate: (params: ReportParams) => void;
  isGenerating: boolean;
  fiscalYears: FiscalYear[];
  quarters: Quarter[];
  projects: Project[];
  currentFiscalYearId: string;
}

const reportTitles: Record<ReportType, string> = {
  'project-summary': 'Project Summary Report',
  'team-allocation': 'Team Allocation Report',
  'project-status': 'One-Page Project Status',
  'quarterly-claims': 'Quarterly Claims Backup',
};

const ReportConfigModal: React.FC<ReportConfigModalProps> = ({
  isOpen,
  onClose,
  reportType,
  onGenerate,
  isGenerating,
  fiscalYears,
  quarters,
  projects,
  currentFiscalYearId,
}) => {
  const [fiscalYearId, setFiscalYearId] = useState(currentFiscalYearId);
  const [quarterId, setQuarterId] = useState('full');
  const [projectId, setProjectId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      setFiscalYearId(currentFiscalYearId);
      setQuarterId('full');
      setProjectId(projects[0]?.id ?? '');
      setStatusFilter('all');
    }
  }, [isOpen, currentFiscalYearId, projects]);

  const fyQuarters = quarters
    .filter(q => q.fiscalYearId === fiscalYearId)
    .sort((a, b) => a.quarterNumber - b.quarterNumber);

  const activeProjects = projects.filter(p => p.isActive && p.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      reportType,
      fiscalYearId,
      quarterId: reportType === 'team-allocation' ? quarterId : undefined,
      projectId: (reportType === 'project-status' || reportType === 'quarterly-claims') ? projectId : undefined,
      statusFilter: reportType === 'project-summary' ? statusFilter : undefined,
    });
  };

  const needsProject = reportType === 'project-status' || reportType === 'quarterly-claims';
  const needsQuarter = reportType === 'team-allocation';

  const footerContent = (
    <>
      <Button variant="secondary" type="button" onClick={onClose}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="report-config-form"
        loading={isGenerating}
        disabled={isGenerating || (needsProject && !projectId)}
      >
        {isGenerating ? 'Generating...' : 'Generate Report'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reportTitles[reportType]}
      maxWidth="md"
      footer={footerContent}
    >
      <form id="report-config-form" onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {/* Fiscal Year */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fiscal Year</label>
            <select
              value={fiscalYearId}
              onChange={(e) => setFiscalYearId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            >
              {fiscalYears.map(fy => (
                <option key={fy.id} value={fy.id}>
                  FY {fy.name}{fy.isCurrent ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quarter (Team Allocation only) */}
          {needsQuarter && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuarterId('full')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                    quarterId === 'full'
                      ? 'text-white bg-cyan-600'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Full Year
                </button>
                {fyQuarters.map(q => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuarterId(q.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                      quarterId === q.id
                        ? 'text-white bg-cyan-600'
                        : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    Q{q.quarterNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project (Project Status & Quarterly Claims) */}
          {needsProject && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              >
                {activeProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter (Project Summary only) */}
          {reportType === 'project-summary' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              >
                <option value="all">All Active & Pipeline</option>
                <option value="active">Active Only</option>
                <option value="pipeline">Pipeline Only</option>
              </select>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ReportConfigModal;
