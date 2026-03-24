import { useState } from 'react';
import { Table2, FileText, Users, ClipboardList } from 'lucide-react';
import { useFiscalPeriods } from '../hooks/useAllocations';
import { useProjects } from '../hooks/useProjects';
import ReportCard from '../components/reports/ReportCard';
import ReportConfigModal, { type ReportType, type ReportParams } from '../components/reports/ReportConfigModal';
import {
  getProjectSummaryData,
  getTeamAllocationData,
  getProjectStatusData,
  getQuarterlyClaimsData,
} from '../hooks/useReportData';
import {
  generateProjectSummaryExcel,
  generateTeamAllocationExcel,
  generateQuarterlyClaimsExcel,
} from '../utils/exportExcel';
import { generateProjectStatusHTML } from '../components/reports/ProjectStatusPrint';
import { useAI } from '../hooks/useAI';
import { sanitizeProjectSummaryRows } from '../ai/sanitizer';
import type { SafeProjectData } from '../ai/types';
import NarrativeGenerator from '../components/ai/NarrativeGenerator';
import { PageHeader } from '../components/shared/PageHeader';

const Reports: React.FC = () => {
  const { fiscalYears, quarters, currentFiscalYear } = useFiscalPeriods();
  const { projects } = useProjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType>('project-summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { isConfigured } = useAI();
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [narrativeData, setNarrativeData] = useState<SafeProjectData[]>([]);
  const [narrativeTitle, setNarrativeTitle] = useState('');

  const openConfig = (type: ReportType) => {
    setSelectedReport(type);
    setModalOpen(true);
    setSuccessMessage('');
  };

  const handleGenerate = async (params: ReportParams) => {
    setIsGenerating(true);
    setSuccessMessage('');

    try {
      switch (params.reportType) {
        case 'project-summary': {
          const data = await getProjectSummaryData(params.fiscalYearId, params.statusFilter);
          generateProjectSummaryExcel(data);
          setSuccessMessage('Project Summary downloaded!');
          break;
        }
        case 'team-allocation': {
          const data = await getTeamAllocationData(params.fiscalYearId, params.quarterId ?? 'full');
          generateTeamAllocationExcel(data);
          setSuccessMessage('Team Allocation report downloaded!');
          break;
        }
        case 'project-status': {
          if (!params.projectId) break;
          const data = await getProjectStatusData(params.projectId, params.fiscalYearId);
          if (!data) {
            setSuccessMessage('Project not found.');
            break;
          }
          const html = generateProjectStatusHTML(data);
          const printWindow = window.open('', '_blank', 'width=850,height=1100');
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = () => printWindow.print();
            setSuccessMessage('Print preview opened!');
          } else {
            setSuccessMessage('Pop-up blocked. Please allow pop-ups for this site.');
          }
          break;
        }
        case 'quarterly-claims': {
          if (!params.projectId) break;
          const data = await getQuarterlyClaimsData(params.projectId, params.fiscalYearId);
          if (!data) {
            setSuccessMessage('Project not found.');
            break;
          }
          generateQuarterlyClaimsExcel(data);
          setSuccessMessage('Claims Backup downloaded!');
          break;
        }
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      setSuccessMessage('Error generating report. Check console for details.');
    } finally {
      setIsGenerating(false);
      setModalOpen(false);
    }
  };

  const handleNarrative = async (type: 'project-summary' | 'project-status') => {
    if (!currentFiscalYear) return;
    try {
      if (type === 'project-summary') {
        const data = await getProjectSummaryData(currentFiscalYear.id, 'active');
        const safe = sanitizeProjectSummaryRows(data.rows);
        setNarrativeData(safe);
        setNarrativeTitle(`Narrative for all active projects \u2014 FY ${currentFiscalYear.name}`);
        setNarrativeOpen(true);
      }
    } catch (err) {
      console.error('Failed to prepare narrative data:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Reports"
        subtitle={`Generate and export budget reports${currentFiscalYear ? ` \u2014 FY ${currentFiscalYear.name}` : ''}`}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <ReportCard
          icon={<Table2 className="w-5 h-5 text-cyan-600" />}
          title="Project Summary"
          description="Overview of all projects with budget vs actual spending, salary/expense breakdown, and utilization."
          format="Excel"
          onGenerate={() => openConfig('project-summary')}
          onNarrative={isConfigured ? () => handleNarrative('project-summary') : undefined}
        />
        <ReportCard
          icon={<Users className="w-5 h-5 text-cyan-600" />}
          title="Team Allocation"
          description="Per-employee breakdown: cash vs in-kind hours and costs per project, with allocation percentage."
          format="Excel"
          onGenerate={() => openConfig('team-allocation')}
        />
        <ReportCard
          icon={<FileText className="w-5 h-5 text-cyan-600" />}
          title="Project Status"
          description="One-page printable summary of a project's health \u2014 budget, spending, team, and funding status."
          format="PDF"
          onGenerate={() => openConfig('project-status')}
        />
        <ReportCard
          icon={<ClipboardList className="w-5 h-5 text-cyan-600" />}
          title="Quarterly Claims"
          description="Funder-facing backup showing actual salary and expense spend per quarter with line-item detail."
          format="Excel"
          onGenerate={() => openConfig('quarterly-claims')}
        />
      </div>

      <NarrativeGenerator
        isOpen={narrativeOpen}
        onClose={() => setNarrativeOpen(false)}
        data={narrativeData}
        title={narrativeTitle}
      />

      <ReportConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        reportType={selectedReport}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        fiscalYears={fiscalYears}
        quarters={quarters}
        projects={projects}
        currentFiscalYearId={currentFiscalYear?.id ?? ''}
      />
    </div>
  );
};

export default Reports;
