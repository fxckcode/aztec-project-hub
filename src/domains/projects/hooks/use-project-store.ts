'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Project, Task, TeamMember } from '@/domains/projects/types';
import {
  seedProjects,
  seedTasks,
  seedTeam
} from '@/domains/projects/data/seed';

const STORAGE_KEYS = {
  projects: 'aztec_projects',
  tasks: 'aztec_tasks',
  team: 'aztec_team'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadFromStorage(key: string, fallback: any): any {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveToStorage(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function useProjectStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedProjects = loadFromStorage(STORAGE_KEYS.projects, seedProjects);
    const storedTasks = loadFromStorage(STORAGE_KEYS.tasks, seedTasks);
    const storedTeam = loadFromStorage(STORAGE_KEYS.team, seedTeam);

    // Seed if first visit
    if (!localStorage.getItem(STORAGE_KEYS.projects)) {
      saveToStorage(STORAGE_KEYS.projects, seedProjects);
      saveToStorage(STORAGE_KEYS.tasks, seedTasks);
      saveToStorage(STORAGE_KEYS.team, seedTeam);
    }

    setProjects(storedProjects);
    setTasks(storedTasks);
    setTeam(storedTeam);
    setLoaded(true);
  }, []);

  const getProjectByCode = useCallback(
    (code: string) => projects.find(p => p.code === code),
    [projects]
  );

  const getProjectTasks = useCallback(
    (projectCode: string) => tasks.filter(t => t.projectCode === projectCode),
    [tasks]
  );

  const createProject = useCallback(
    (data: Omit<Project, 'code' | 'priorityScore' | 'nextStep'>) => {
      const codes = projects.map(p => {
        const num = parseInt(p.code.replace('PRJ-', ''), 10);
        return isNaN(num) ? 0 : num;
      });
      const nextNum = Math.max(0, ...codes) + 1;
      const code = `PRJ-${String(nextNum).padStart(2, '0')}`;
      const project: Project = { ...data, code };

      const updated = [...projects, project];
      setProjects(updated);
      saveToStorage(STORAGE_KEYS.projects, updated);
      return project;
    },
    [projects]
  );

  const updateProject = useCallback(
    (code: string, data: Partial<Omit<Project, 'code'>>) => {
      const index = projects.findIndex(p => p.code === code);
      if (index === -1) throw new Error(`Project ${code} not found`);

      const updated = [...projects];
      updated[index] = { ...updated[index], ...data };
      setProjects(updated);
      saveToStorage(STORAGE_KEYS.projects, updated);
      return updated[index];
    },
    [projects]
  );

  const deleteProject = useCallback(
    (code: string) => {
      const updated = projects.filter(p => p.code !== code);
      setProjects(updated);
      saveToStorage(STORAGE_KEYS.projects, updated);
    },
    [projects]
  );

  const createTask = useCallback(
    (
      projectCode: string,
      data: {
        title: string;
        detail: string;
        assigneeAlias: string;
        priority: Task['priority'];
        status: Task['status'];
        dueDate?: string;
        dependency?: string;
      }
    ) => {
      const project = projects.find(p => p.code === projectCode);
      if (!project) throw new Error(`Project ${projectCode} not found`);

      const projectTasks = tasks.filter(t => t.projectCode === projectCode);
      const taskNumbers = projectTasks.map(t => {
        const match = t.code.match(/-T(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const nextNum = Math.max(0, ...taskNumbers) + 1;
      const code = `${projectCode}-T${String(nextNum).padStart(2, '0')}`;

      const assignee = team.find(m => m.alias === data.assigneeAlias);
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
        assigneeRole: assignee?.role ?? '',
        priority: data.priority,
        status: data.status,
        dueDate,
        isOverdue,
        dependency: data.dependency?.trim() ?? '',
        title: data.title.trim(),
        detail: data.detail.trim(),
        lastProgress: data.detail.trim()
      };

      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      saveToStorage(STORAGE_KEYS.tasks, updatedTasks);

      const updatedProjects = projects.map(p => {
        if (p.code !== projectCode) return p;
        return {
          ...p,
          openTasks: p.openTasks + 1,
          overdueTasks: isOverdue ? p.overdueTasks + 1 : p.overdueTasks,
          blockers: data.status === 'bloqueada' ? p.blockers + 1 : p.blockers
        };
      });
      setProjects(updatedProjects);
      saveToStorage(STORAGE_KEYS.projects, updatedProjects);

      if (assignee) {
        const isHighOrCritical =
          data.priority === 'critica' || data.priority === 'alta';
        const updatedTeam = team.map(m => {
          if (m.alias !== data.assigneeAlias) return m;
          return {
            ...m,
            openTasksAssigned: m.openTasksAssigned + 1,
            blockedTasksAssigned:
              data.status === 'bloqueada'
                ? m.blockedTasksAssigned + 1
                : m.blockedTasksAssigned,
            highOrCriticalOpen: isHighOrCritical
              ? m.highOrCriticalOpen + 1
              : m.highOrCriticalOpen
          };
        });
        setTeam(updatedTeam);
        saveToStorage(STORAGE_KEYS.team, updatedTeam);
      }

      return task;
    },
    [projects, tasks, team]
  );

  return {
    projects,
    tasks,
    team,
    loaded,
    getProjectByCode,
    getProjectTasks,
    createProject,
    updateProject,
    deleteProject,
    createTask
  };
}
