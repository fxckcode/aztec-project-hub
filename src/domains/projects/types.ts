export const PROJECT_HEALTH = {
  HEALTHY: 'sano',
  AT_RISK: 'en-riesgo',
  BLOCKED: 'bloqueado'
} as const;

export type ProjectHealth =
  (typeof PROJECT_HEALTH)[keyof typeof PROJECT_HEALTH];

export const PROJECT_STATUS = {
  ACTIVE: 'activo',
  PAUSED: 'pausado',
  COMPLETED: 'completado'
} as const;

export type ProjectStatus =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const ENGAGEMENT_TYPE = {
  PROJECT: 'proyecto',
  MAINTENANCE: 'mantenimiento',
  DIAGNOSTIC: 'diagnostico'
} as const;

export type EngagementType =
  (typeof ENGAGEMENT_TYPE)[keyof typeof ENGAGEMENT_TYPE];

export const STAGE_TYPE = {
  EXECUTION: 'ejecucion',
  DISCOVERY: 'descubrimiento'
} as const;

export type StageType = (typeof STAGE_TYPE)[keyof typeof STAGE_TYPE];

export const TASK_PRIORITY = {
  CRITICAL: 'critica',
  HIGH: 'alta',
  MEDIUM: 'media',
  LOW: 'baja'
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const TASK_STATUS = {
  IN_PROGRESS: 'en-progreso',
  TODO: 'por-hacer',
  IN_REVIEW: 'en-revision',
  BLOCKED: 'bloqueada'
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const CURRENCY = {
  USD: 'USD',
  COP: 'COP'
} as const;

export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];

export interface Project {
  code: string;
  engagementType: EngagementType;
  clientAlias: string;
  name: string;
  projectType: string;
  stage: StageType;
  status: ProjectStatus;
  health: ProjectHealth;
  ownerAlias: string;
  ownerRole: string;
  startDate: string | null;
  targetDate: string | null;
  businessValue: number;
  currency: Currency;
  openTasks: number;
  overdueTasks: number;
  blockers: number;
  summary: string;
  recentCompleted: string;
  priorityScore?: number;
  nextStep?: string;
  notes?: string;
}

export interface Task {
  code: string;
  projectCode: string;
  engagementType: EngagementType;
  clientAlias: string;
  projectName: string;
  assigneeAlias: string;
  assigneeRole: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  isOverdue: boolean;
  dependency: string;
  title: string;
  detail: string;
  lastProgress: string;
}

export interface TeamMember {
  alias: string;
  role: string;
  projectsInPortfolio: number;
  openTasksAssigned: number;
  blockedTasksAssigned: number;
  highOrCriticalOpen: number;
  diagnosticProjects: number;
  projectProjects: number;
  maintenanceProjects: number;
  utilizationRate?: number;
}

export interface DashboardStats {
  totalProjects: number;
  blockedProjects: number;
  atRiskProjects: number;
  healthyProjects: number;
  totalTasks: number;
  overdueTasks: number;
  totalValue: number;
  overloadedMembers: TeamMember[];
}
