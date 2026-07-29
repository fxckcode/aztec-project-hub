import type { Project, Task } from '../types';
import { detectRisks, suggestNextStep } from './prioritization';

export interface RiskAssessment {
  projectCode: string;
  projectName: string;
  health: Project['health'];
  risks: string[];
  nextStep: string;
  priorityScore: number;
}

export function assessAllProjects(
  projects: Project[],
  tasks: Task[]
): RiskAssessment[] {
  return projects
    .map(project => {
      return {
        projectCode: project.code,
        projectName: project.name,
        health: project.health,
        risks: detectRisks(project, tasks),
        nextStep: suggestNextStep(project, tasks),
        priorityScore: project.priorityScore ?? 0
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
