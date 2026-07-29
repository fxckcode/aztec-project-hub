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

  return {
    projects,
    tasks,
    team,
    loaded,
    getProjectByCode,
    getProjectTasks,
    createProject,
    updateProject,
    deleteProject
  };
}
