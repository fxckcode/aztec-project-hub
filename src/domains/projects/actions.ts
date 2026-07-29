'use server';

import type { Project } from './types';
import { seedProjects } from './data/seed';

// In-memory store — persists per dev session
let projectStore: Project[] = [...seedProjects];

export async function getProjects(): Promise<Project[]> {
  return [...projectStore];
}

export async function getProjectByCode(
  code: string
): Promise<Project | undefined> {
  return projectStore.find(p => p.code === code);
}

export async function createProject(
  data: Omit<Project, 'code' | 'priorityScore' | 'nextStep'>
): Promise<Project> {
  const codes = projectStore.map(p => {
    const num = parseInt(p.code.replace('PRJ-', ''), 10);
    return isNaN(num) ? 0 : num;
  });
  const nextNum = Math.max(0, ...codes) + 1;
  const code = `PRJ-${String(nextNum).padStart(2, '0')}`;

  const project: Project = {
    ...data,
    code,
    priorityScore: undefined,
    nextStep: undefined
  };

  projectStore.push(project);
  return project;
}

export async function updateProject(
  code: string,
  data: Partial<Omit<Project, 'code'>>
): Promise<Project> {
  const index = projectStore.findIndex(p => p.code === code);
  if (index === -1) throw new Error(`Project ${code} not found`);

  projectStore[index] = { ...projectStore[index], ...data };
  return projectStore[index];
}

export async function deleteProject(code: string): Promise<void> {
  projectStore = projectStore.filter(p => p.code !== code);
}

export async function addTaskToProject(projectCode: string): Promise<void> {
  const project = projectStore.find(p => p.code === projectCode);
  if (!project) throw new Error(`Project ${projectCode} not found`);
  project.openTasks += 1;
}
