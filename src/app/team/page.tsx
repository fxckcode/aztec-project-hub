'use client';

import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import type { Project } from '@/domains/projects/types';
interface EnrichedMember {
  alias: string;
  role: string;
  projectsInPortfolio: number;
  openTasksAssigned: number;
  blockedTasksAssigned: number;
  highOrCriticalOpen: number;
  utilizationRate: number;
  state: 'sobrecargado' | 'al-limite' | 'disponible';
  memberProjects: Project[];
  blockedCount: number;
  atRiskCount: number;
  healthyCount: number;
  engagementTypes: string[];
}

function getMemberState(rate: number): EnrichedMember['state'] {
  if (rate > 100) return 'sobrecargado';
  if (rate > 80) return 'al-limite';
  return 'disponible';
}

function stateLabel(state: EnrichedMember['state']) {
  switch (state) {
    case 'sobrecargado':
      return 'Sobrecargado';
    case 'al-limite':
      return 'Al Límite';
    case 'disponible':
      return 'Disponible';
  }
}

const stateConfig: Record<
  EnrichedMember['state'],
  { color: string; bg: string; bar: string }
> = {
  sobrecargado: {
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    bar: 'bg-red-500'
  },
  'al-limite': {
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    bar: 'bg-amber-400'
  },
  disponible: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-400'
  }
};

export default function TeamPage() {
  const { projects, team } = useProjectStore();

  const members: EnrichedMember[] = team
    .map(m => {
      const memberProjects = projects.filter(p => p.ownerAlias === m.alias);
      const rate = Math.round((m.openTasksAssigned / 6) * 100);
      return {
        ...m,
        utilizationRate: rate,
        state: getMemberState(rate),
        memberProjects,
        blockedCount: memberProjects.filter(p => p.health === 'bloqueado')
          .length,
        atRiskCount: memberProjects.filter(p => p.health === 'en-riesgo')
          .length,
        healthyCount: memberProjects.filter(p => p.health === 'sano').length,
        engagementTypes: [...new Set(memberProjects.map(p => p.engagementType))]
      };
    })
    .sort((a, b) => {
      const order = { sobrecargado: 0, 'al-limite': 1, disponible: 2 };
      return order[a.state] - order[b.state];
    });

  const overloaded = members.filter(m => m.state === 'sobrecargado').length;
  const atLimit = members.filter(m => m.state === 'al-limite').length;
  const available = members.filter(m => m.state === 'disponible').length;

  return (
    <div className="space-y-6">
      {/* Resumen del equipo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{overloaded}</div>
          <div className="mt-0.5 text-xs font-medium text-red-600">
            Sobrecargados
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{atLimit}</div>
          <div className="mt-0.5 text-xs font-medium text-amber-600">
            Al Límite
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{available}</div>
          <div className="mt-0.5 text-xs font-medium text-emerald-600">
            Disponibles
          </div>
        </div>
      </div>

      {/* Grid del equipo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map(member => {
          const cfg = stateConfig[member.state];
          return (
            <div
              key={member.alias}
              className={`rounded-xl border ${cfg.bg} p-5`}
            >
              {/* Fila superior: avatar + nombre + estado */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      member.state === 'sobrecargado'
                        ? 'bg-red-100 text-red-700'
                        : member.state === 'al-limite'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {member.alias
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {member.alias}
                    </h2>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}
                >
                  {stateLabel(member.state)}
                </span>
              </div>

              {/* Barra de carga */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700">
                    Carga de trabajo
                  </span>
                  <span className={`font-bold ${cfg.color}`}>
                    {member.utilizationRate}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${cfg.bar}`}
                    style={{
                      width: `${Math.min(member.utilizationRate, 100)}%`
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                  <span>0%</span>
                  <span>80% (límite)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Métricas clave */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-white/60 p-2.5 text-center">
                  <div className="text-base font-bold text-gray-900">
                    {member.openTasksAssigned}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500">
                    Tareas
                  </div>
                </div>
                <div className="rounded-lg bg-white/60 p-2.5 text-center">
                  <div className="text-base font-bold text-red-600">
                    {member.blockedTasksAssigned}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500">
                    Bloqueadas
                  </div>
                </div>
                <div className="rounded-lg bg-white/60 p-2.5 text-center">
                  <div className="text-base font-bold text-amber-600">
                    {member.highOrCriticalOpen}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500">
                    Críticas
                  </div>
                </div>
                <div className="rounded-lg bg-white/60 p-2.5 text-center">
                  <div className="text-base font-bold text-gray-900">
                    {member.projectsInPortfolio}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500">
                    Proyectos
                  </div>
                </div>
              </div>

              {/* Salud de proyectos a cargo */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">Proyectos:</span>
                {member.blockedCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {member.blockedCount} bloqueados
                  </span>
                )}
                {member.atRiskCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {member.atRiskCount} en riesgo
                  </span>
                )}
                {member.healthyCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {member.healthyCount} sanos
                  </span>
                )}
                <span className="ml-auto">
                  {member.engagementTypes.join(', ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
