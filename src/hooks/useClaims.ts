import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type Claim } from '../db/schema';

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
