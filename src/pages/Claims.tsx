import { useState, useMemo, useCallback } from 'react';
import { Plus, Pencil, Trash2, HandCoins } from 'lucide-react';
import { useClaims } from '../hooks/useClaims';
import { useFiscalPeriods } from '../hooks/useAllocations';
import { useProjects } from '../hooks/useProjects';
import type { Claim, ClaimStatus } from '../db/schema';
import ClaimFormModal, { type ClaimFormData } from '../components/claims/ClaimFormModal';
import { formatCurrency } from '../utils/formatters';
import { useSort, type SortColumnDef } from '../hooks/useSort';
import { FilterBar, type FilterValues } from '../components/shared/FilterBar';
import { SortableHeader } from '../components/shared/SortableHeader';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { EmptyState } from '../components/shared/EmptyState';

const formatDate = (date: string | null): string => {
  if (!date) return '\u2014';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusBadgeMap: Record<ClaimStatus, { label: string; variant: 'neutral' | 'info' | 'warning' | 'success' }> = {
  draft: { label: 'Draft', variant: 'neutral' },
  submitted: { label: 'Submitted', variant: 'info' },
  partial: { label: 'Partial', variant: 'warning' },
  received: { label: 'Received', variant: 'success' },
};

const Claims: React.FC = () => {
  const { currentFiscalYear, getQuartersForYear } = useFiscalPeriods();
  const fiscalYearId = currentFiscalYear?.id ?? '';
  const quarters = getQuartersForYear(fiscalYearId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({
    quarter: [],
    project: [],
    status: [],
  });

  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setFilterValues(prev => ({ ...prev, [key]: values }));
  }, []);
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
      if (filterValues.quarter.length > 0 && !filterValues.quarter.includes(c.quarterId)) return false;
      if (filterValues.project.length > 0 && !filterValues.project.includes(c.projectId)) return false;
      if (filterValues.status.length > 0 && !filterValues.status.includes(c.status)) return false;
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
  }, [claims, filterValues, searchQuery, projects]);

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

  const getProjectCode = (id: string) => projects.find(p => p.id === id)?.code ?? '\u2014';
  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name ?? 'Unknown';
  const getQuarterName = (id: string) => quarters.find(q => q.id === id)?.name ?? '\u2014';

  const sortColumns: SortColumnDef<Claim>[] = useMemo(() => [
    { key: 'project', accessor: (c) => getProjectName(c.projectId), type: 'string' },
    { key: 'quarter', accessor: (c) => getQuarterName(c.quarterId), type: 'string' },
    { key: 'claimed', accessor: (c) => c.claimAmount, type: 'number' },
    { key: 'submitted', accessor: (c) => c.submittedDate, type: 'date' },
    { key: 'received', accessor: (c) => c.receivedDate, type: 'date' },
    { key: 'amtReceived', accessor: (c) => c.receivedAmount, type: 'number' },
    { key: 'status', accessor: (c) => c.status, type: 'string' },
  ], [projects, quarters]);

  const { sortedData: sortedClaims, sortConfig, requestSort } = useSort({
    data: filteredClaims,
    columns: sortColumns,
  });

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
      <PageHeader
        title="Claims"
        subtitle={`Track claims submitted to funders and payments received \u2014 ${currentFiscalYear?.name ?? 'No FY'}`}
        actions={
          <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Claim
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Claimed</p>
          <p className="text-2xl font-bold text-cyan-900 mt-1">{formatCurrency(summary.totalClaimed)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Received</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.totalReceived)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Outstanding</p>
          <p className={`text-2xl font-bold mt-1 ${summary.outstanding > 0 ? 'text-amber-600' : 'text-cyan-900'}`}>
            {formatCurrency(summary.outstanding)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Claims</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{summary.pendingCount}</p>
        </Card>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search project or reference..."
        filters={[
          {
            key: 'quarter',
            label: 'Quarter',
            placeholder: 'All Quarters',
            options: quarters.map(q => ({ value: q.id, label: q.name })),
          },
          {
            key: 'project',
            label: 'Project',
            placeholder: 'All Projects',
            options: activeProjects.map(p => ({ value: p.id, label: `${p.code} \u2014 ${p.name}` })),
          },
          {
            key: 'status',
            label: 'Status',
            placeholder: 'All Statuses',
            options: [
              { value: 'draft', label: 'Draft' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'partial', label: 'Partial' },
              { value: 'received', label: 'Received' },
            ],
          },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        resultCount={filteredClaims.length}
        resultLabel={`claim${filteredClaims.length !== 1 ? 's' : ''}`}
        totalCount={claims.length}
      />

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <SortableHeader label="Project" sortKey="project" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Quarter" sortKey="quarter" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Claimed" sortKey="claimed" currentSort={sortConfig} onSort={requestSort} align="right" />
                <SortableHeader label="Submitted" sortKey="submitted" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Received" sortKey="received" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Amt Received" sortKey="amtReceived" currentSort={sortConfig} onSort={requestSort} align="right" />
                <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={requestSort} />
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedClaims.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={HandCoins}
                      title="No claims found"
                      description="Add a claim or adjust your filters"
                      actionLabel="Add Claim"
                      onAction={() => setShowAddModal(true)}
                    />
                  </td>
                </tr>
              ) : (
                sortedClaims.map((c) => {
                  const badge = statusBadgeMap[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors duration-150">
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
                        <span className="text-sm font-medium text-cyan-900">{formatCurrency(c.claimAmount)}</span>
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
                          <span className="text-sm text-slate-300">{'\u2014'}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600 max-w-[120px] truncate block">
                          {c.referenceNumber || <span className="text-slate-300">{'\u2014'}</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Edit claim"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          {deleteConfirmId === c.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(c.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
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
      </Card>

      <ClaimFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        mode="add"
        projects={activeProjects}
        quarters={quarters}
        currentFiscalYearId={fiscalYearId}
      />

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
