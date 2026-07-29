import type { Project, Task, TeamMember, ProjectHealth } from '../types';

export interface PriorityFactor {
  name: string;
  weight: number;
  score: number;
  detail: string;
}

export interface PriorityBreakdown {
  score: number;
  label: string;
  factors: PriorityFactor[];
}

const healthScores: Record<ProjectHealth, number> = {
  bloqueado: 100,
  'en-riesgo': 70,
  sano: 30
};

const engagementMultipliers: Record<string, number> = {
  proyecto: 1.0,
  mantenimiento: 0.8,
  diagnostico: 0.6
};

function normalizeBusinessValue(
  value: number,
  currency: 'USD' | 'COP'
): number {
  const inUsd = currency === 'COP' ? value / 4500 : value;
  return Math.min(inUsd / 1000, 10) * 10;
}

function calculateUrgency(targetDate: string | null): number {
  if (!targetDate) return 20;
  const now = new Date();
  const target = new Date(targetDate);
  const daysLeft = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft <= 0) return 100;
  if (daysLeft <= 7) return 80;
  if (daysLeft <= 30) return 60;
  if (daysLeft <= 90) return 40;
  return 20;
}

function getPriorityLabel(score: number): string {
  if (score >= 75) return 'Crítica';
  if (score >= 55) return 'Alta';
  if (score >= 35) return 'Media';
  return 'Baja';
}

export function calculateProjectPriority(
  project: Project,
  tasks: Task[],
  team: TeamMember[]
): PriorityBreakdown {
  const ownerLoad = team.find(m => m.alias === project.ownerAlias);
  const healthScore = healthScores[project.health] ?? 30;

  const overdueRatio =
    project.openTasks > 0 ? project.overdueTasks / project.openTasks : 0;
  const overdueScore = overdueRatio * 100;

  const blockerScore = Math.min(project.blockers * 25, 100);
  const valueScore = normalizeBusinessValue(
    project.businessValue,
    project.currency
  );
  const urgencyScore = calculateUrgency(project.targetDate);

  const loadScore = ownerLoad
    ? Math.min((ownerLoad.openTasksAssigned / 6) * 100, 100)
    : 20;

  const multiplier = engagementMultipliers[project.engagementType] ?? 0.8;

  const rawScore =
    healthScore * 0.25 +
    overdueScore * 0.2 +
    blockerScore * 0.15 +
    valueScore * 0.15 +
    urgencyScore * 0.1 +
    loadScore * 0.05;

  const finalScore = Math.round(rawScore * multiplier);

  return {
    score: finalScore,
    label: getPriorityLabel(finalScore),
    factors: [
      {
        name: 'Salud',
        weight: 0.25,
        score: healthScore,
        detail: `Salud del proyecto: ${project.health}`
      },
      {
        name: 'Ratio de retrasos',
        weight: 0.2,
        score: overdueScore,
        detail: `${project.overdueTasks}/${project.openTasks} tareas vencidas`
      },
      {
        name: 'Bloqueos',
        weight: 0.15,
        score: blockerScore,
        detail: `${project.blockers} bloqueos activos`
      },
      {
        name: 'Valor del negocio',
        weight: 0.15,
        score: valueScore,
        detail: `$${project.businessValue.toLocaleString()} ${project.currency}`
      },
      {
        name: 'Urgencia',
        weight: 0.1,
        score: urgencyScore,
        detail: project.targetDate ?? 'Sin fecha objetivo'
      },
      {
        name: 'Carga del equipo',
        weight: 0.05,
        score: loadScore,
        detail: ownerLoad
          ? `${ownerLoad.openTasksAssigned} tareas asignadas`
          : 'Desconocido'
      }
    ]
  };
}

export function detectRisks(project: Project, tasks: Task[]): string[] {
  const risks: string[] = [];
  const projectTasks = tasks.filter(t => t.projectCode === project.code);
  const blockedTasks = projectTasks.filter(t => t.status === 'bloqueada');
  const hasProgress = projectTasks.some(
    t =>
      t.lastProgress && t.lastProgress.length > 10 && t.status !== 'bloqueada'
  );

  if (project.health === 'bloqueado') {
    risks.push('Bloqueado por dependencias externas o accesos pendientes');
  }
  if (project.health === 'en-riesgo') {
    risks.push('En riesgo: tareas vencidas sin una ruta de resolución clara');
  }
  if (project.overdueTasks > 0) {
    risks.push(
      `${project.overdueTasks} tarea(s) vencida(s) que requieren atención inmediata`
    );
  }
  if (blockedTasks.length > 0) {
    risks.push(
      `${blockedTasks.length} tarea(s) bloqueada(s) - requiere acción de desbloqueo`
    );
  }
  if (!hasProgress && projectTasks.length > 0) {
    risks.push(
      'No hay tareas con un siguiente paso claro - se requiere planificación'
    );
  }
  if (!project.targetDate) {
    risks.push(
      'No hay fecha objetivo definida - el alcance o la línea de tiempo no están claros'
    );
  }

  return risks;
}

export function suggestNextStep(project: Project, tasks: Task[]): string {
  const projectTasks = tasks.filter(t => t.projectCode === project.code);
  const blockedTasks = projectTasks.filter(t => t.status === 'bloqueada');
  const overdueTasks = projectTasks.filter(t => t.isOverdue);

  if (blockedTasks.length > 0) {
    return `Desbloquear: resolver dependencias de ${blockedTasks[0].title}`;
  }
  if (overdueTasks.length > 0) {
    return `Resolver vencida: ${overdueTasks[0].title}`;
  }
  if (project.health === 'en-riesgo') {
    return 'Programar alineación con stakeholders para aclarar los próximos pasos';
  }
  if (project.stage === 'descubrimiento') {
    return 'Completar la fase de descubrimiento - documentar hallazgos y proponer el alcance';
  }
  return 'Revisar el avance y planear los entregables de la siguiente iteración';
}
