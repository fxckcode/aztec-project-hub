'use server';

import type { Project, Task } from './types';
import { seedProjects, seedTasks } from './data/seed';
import { createTaskSchema, type CreateTaskInput } from './create-task.schema';

// In-memory store — persists per dev session
let projectStore: Project[] = [...seedProjects];
const taskStore: Task[] = [...seedTasks];

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

export async function createTaskAction(
  projectCode: string,
  input: CreateTaskInput
): Promise<{ error?: string; task?: Task }> {
  const validated = createTaskSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? 'Invalid input' };
  }

  const project = projectStore.find(p => p.code === projectCode);
  if (!project) {
    return { error: `Project ${projectCode} not found` };
  }

  const data = validated.data;
  const projectTasks = taskStore.filter(t => t.projectCode === projectCode);
  const taskNumbers = projectTasks.map(t => {
    const match = t.code.match(/-T(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const nextNum = Math.max(0, ...taskNumbers) + 1;
  const code = `${projectCode}-T${String(nextNum).padStart(2, '0')}`;
  const dueDate = data.dueDate?.trim() ? data.dueDate : null;
  const isOverdue = dueDate
    ? new Date(dueDate) < new Date(new Date().toDateString())
    : false;

  const task: Task = {
    code,
    projectCode,
    engagementType: project.engagementType,
    clientAlias: project.clientAlias,
    projectName: project.name,
    assigneeAlias: data.assigneeAlias,
    assigneeRole: '',
    priority: data.priority,
    status: data.status,
    dueDate,
    isOverdue,
    dependency: data.dependency?.trim() ?? '',
    title: data.title.trim(),
    detail: data.detail.trim(),
    lastProgress: data.detail.trim()
  };

  taskStore.push(task);
  project.openTasks += 1;
  if (isOverdue) project.overdueTasks += 1;
  if (data.status === 'bloqueada') project.blockers += 1;

  return { task };
}
