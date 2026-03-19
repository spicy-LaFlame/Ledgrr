import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type Project, type Funder } from '../db/schema';

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;

export interface ProjectWithFunder extends Project {
  funder?: Funder;
}

export function useProjects() {
  const projects = useLiveQuery(() => db.projects.filter(p => p.isActive).toArray()) ?? [];
  const allProjects = useLiveQuery(() => db.projects.toArray()) ?? [];
  const funders = useLiveQuery(() => db.funders.filter(f => f.isActive).toArray()) ?? [];

  const activeProjects = projects.filter(p => p.status === 'active');
  const pipelineProjects = projects.filter(p => p.status === 'pipeline');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const onHoldProjects = projects.filter(p => p.status === 'on-hold');

  const getProjectWithFunder = (projectId: string): ProjectWithFunder | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    const funder = funders.find(f => f.id === project.funderId);
    return { ...project, funder };
  };

  const getAllProjectsWithFunders = (): ProjectWithFunder[] => {
    return projects.map(project => {
      const funder = funders.find(f => f.id === project.funderId);
      return { ...project, funder };
    });
  };

  const addProject = async (projectData: ProjectFormData): Promise<Project> => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.add(newProject);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<ProjectFormData>): Promise<void> => {
    await db.projects.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const softDeleteProject = async (id: string): Promise<void> => {
    await db.projects.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  };

  const permanentDeleteProject = async (id: string): Promise<void> => {
    // Also delete related allocations and expenses
    await db.transaction('rw', [db.projects, db.salaryAllocations, db.expenses], async () => {
      await db.salaryAllocations.where('projectId').equals(id).delete();
      await db.expenses.where('projectId').equals(id).delete();
      await db.projects.delete(id);
    });
  };

  const restoreProject = async (id: string): Promise<void> => {
    await db.projects.update(id, {
      isActive: true,
      updatedAt: new Date().toISOString()
    });
  };

  return {
    projects,
    allProjects,
    activeProjects,
    pipelineProjects,
    completedProjects,
    onHoldProjects,
    funders,
    getProjectWithFunder,
    getAllProjectsWithFunders,
    addProject,
    updateProject,
    softDeleteProject,
    permanentDeleteProject,
    restoreProject,
  };
}

export function useProject(projectId: string | undefined) {
  const project = useLiveQuery(
    () => projectId ? db.projects.get(projectId) : undefined,
    [projectId]
  );

  const funder = useLiveQuery(
    () => project?.funderId ? db.funders.get(project.funderId) : undefined,
    [project?.funderId]
  );

  return { project, funder };
}
