import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type Claim, type ClaimStatus } from '../db/schema';

interface ClaimFilters {
  projectId?: string;
  fiscalYearId?: string;
  quarterId?: string;
  status?: string;
}

export function useClaims(options?: ClaimFilters) {
  const { projectId, fiscalYearId, quarterId, status } = options ?? {};

  const claims = useLiveQuery(async () => {
    let results = await db.claims.toArray();

    if (projectId) {
      results = results.filter(c => c.projectId === projectId);
    }
    if (fiscalYearId) {
      results = results.filter(c => c.fiscalYearId === fiscalYearId);
    }
    if (quarterId) {
      results = results.filter(c => c.quarterId === quarterId);
    }
    if (status) {
      results = results.filter(c => c.status === status);
    }

    return results;
  }, [projectId, fiscalYearId, quarterId, status]) ?? [];

  const addClaim = async (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newClaim: Claim = {
      ...claim,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.claims.add(newClaim);
    return newClaim;
  };

  const updateClaim = async (id: string, updates: Partial<Claim>) => {
    await db.claims.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteClaim = async (id: string) => {
    await db.claims.delete(id);
  };

  return {
    claims,
    addClaim,
    updateClaim,
    deleteClaim,
  };
}

export interface ClaimsSummary {
  totalClaimed: number;
  totalReceived: number;
  outstanding: number;
  pending: number;
  byProject: Record<string, { claimed: number; received: number }>;
}

export function useClaimsSummary(fiscalYearId: string): ClaimsSummary {
  const summary = useLiveQuery(async () => {
    const claims = await db.claims
      .filter(c => c.fiscalYearId === fiscalYearId)
      .toArray();

    let totalClaimed = 0;
    let totalReceived = 0;
    let pending = 0;
    const byProject: Record<string, { claimed: number; received: number }> = {};

    for (const claim of claims) {
      if (!byProject[claim.projectId]) {
        byProject[claim.projectId] = { claimed: 0, received: 0 };
      }

      if (claim.status === 'draft') {
        pending += claim.claimAmount;
      } else {
        // submitted, partial, received
        totalClaimed += claim.claimAmount;
        totalReceived += claim.receivedAmount ?? 0;
        byProject[claim.projectId].claimed += claim.claimAmount;
        byProject[claim.projectId].received += claim.receivedAmount ?? 0;
      }
    }

    const outstanding = totalClaimed - totalReceived;

    return { totalClaimed, totalReceived, outstanding, pending, byProject };
  }, [fiscalYearId]);

  return summary ?? { totalClaimed: 0, totalReceived: 0, outstanding: 0, pending: 0, byProject: {} };
}
