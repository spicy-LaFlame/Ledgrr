import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useClaims } from '../hooks/useClaims';
import { useFiscalPeriods } from '../hooks/useAllocations';
import { useProjects } from '../hooks/useProjects';
import type { Claim, ClaimStatus } from '../db/schema';
import ClaimFormModal, { type ClaimFormData } from '../components/claims/ClaimFormModal';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string | null): string => {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusStyles: Record<ClaimStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600' },
  submitted: { label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-700' },
  partial: { label: 'Partial', bg: 'bg-amber-100', text: 'text-amber-700' },
  received: { label: 'Received', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

const Claims: React.FC = () => {
  const { currentFiscalYear, getQuartersForYear } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';
  const quarters = getQuartersForYear(fiscalYearId);

  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { claims, addClaim, updateClaim, deleteClaim } = useClaims({
    fiscalYearId: fiscalYearId || undefined,
  });
  const { projects } = useProjects();

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (quarterFilter !== 'all' && c.quarterId !== quarterFilter) return false;
      if (projectFilter !== 'all' && c.projectId !== projectFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery) {
        const proj = projects.find(p => p.id === c.projectId);
        const query = searchQuery.toLowerCase();
        return (
          proj?.name.toLowerCase().includes(query) ||
          proj?.code.toLowerCase().includes(query) ||
          c.referenceNumber?.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [claims, quarterFilter, projectFilter, statusFilter, searchQuery, projects]);

  const summary = useMemo(() => {
    let totalClaimed = 0;
    let totalReceived = 0;
    let pendingCount = 0;

    for (const c of filteredClaims) {
      totalClaimed += c.claimAmount;
      if (c.receivedAmount !== null) totalReceived += c.receivedAmount;
      if (c.status === 'submitted') pendingCount++;
    }

    return {
      totalClaimed,
      totalReceived,
      outstanding: totalClaimed - totalReceived,
      pendingCount,
      totalCount: filteredClaims.length,
    };
  }, [filteredClaims]);

  const getProjectCode = (id: string) => projects.find(p => p.id === id)?.code ?? '—';
  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name ?? 'Unknown';
  const getQuarterName = (id: string) => quarters.find(q => q.id === id)?.name ?? '—';

  const handleAdd = async (data: ClaimFormData) => {
    await addClaim(data);
  };

  const handleEdit = async (data: ClaimFormData) => {
    if (selectedClaim) {
      await updateClaim(selectedClaim.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteClaim(id);
    setDeleteConfirmId(null);
  };

  const openEditModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowEditModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track claims submitted to funders and payments received — {currentFiscalYear?.name ?? 'No FY'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Claim
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Claimed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalClaimed)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Received</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.totalReceived)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Outstanding</p>
          <p className={`text-2xl font-bold mt-1 ${summary.outstanding > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {formatCurrency(summary.outstanding)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Claims</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{summary.pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search project or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <select
          value={quarterFilter}
          onChange={(e) => setQuarterFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Quarters</option>
          {quarters.map(q => (
            <option key={q.id} value={q.id}>{q.name}</option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Projects</option>
          {activeProjects.map(p => (
            <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="partial">Partial</option>
          <option value="received">Received</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarter</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Claimed</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Received</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amt Received</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium text-slate-500">No claims found</p>
                      <p className="text-xs text-slate-400 mt-1">Add a claim or adjust your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((c) => {
                  const style = statusStyles[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{getProjectCode(c.projectId)}</span>
                          <div className="text-xs text-slate-400">{getProjectName(c.projectId)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{getQuarterName(c.quarterId)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(c.claimAmount)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{formatDate(c.submittedDate)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{formatDate(c.receivedDate)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {c.receivedAmount !== null ? (
                          <span className={`text-sm font-medium ${c.receivedAmount < c.claimAmount ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {formatCurrency(c.receivedAmount)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600 max-w-[120px] truncate block">
                          {c.referenceNumber || <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit claim"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          {deleteConfirmId === c.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(c.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete claim"
                            >
                              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                            </button>
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
        {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''}
      </div>

      {/* Add Modal */}
      <ClaimFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        mode="add"
        projects={activeProjects}
        quarters={quarters}
        currentFiscalYearId={fiscalYearId}
      />

      {/* Edit Modal */}
      {selectedClaim && (
        <ClaimFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClaim(null);
          }}
          onSubmit={handleEdit}
          claim={selectedClaim}
          mode="edit"
          projects={activeProjects}
          quarters={quarters}
          currentFiscalYearId={fiscalYearId}
        />
      )}
    </div>
  );
};

export default Claims;
