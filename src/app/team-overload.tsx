'use client';

import { useProjectStore } from '@/domains/projects/hooks/use-project-store';

export function TeamOverload() {
  const { team, loaded } = useProjectStore();

  if (!loaded) return null;

  const enriched = team
    .map(m => ({
      ...m,
      utilizationRate: Math.round((m.openTasksAssigned / 6) * 100)
    }))
    .sort((a, b) => b.openTasksAssigned - a.openTasksAssigned);

  return (
    <div className="card p-4">
      <h2 className="text-brand-text-secondary mb-3 text-sm font-semibold tracking-wider uppercase">
        Carga del Equipo
      </h2>
      <div className="space-y-2">
        {enriched.map(member => {
          const isOverloaded = member.utilizationRate > 80;
          return (
            <div
              key={member.alias}
              className="border-brand-border flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="text-brand-dark flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-xs font-medium">
                  {member.alias
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-sm font-medium">{member.alias}</div>
                  <div className="text-brand-text-muted text-xs">
                    {member.role}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-medium ${isOverloaded ? 'text-status-danger' : 'text-brand-text'}`}
                >
                  {member.openTasksAssigned} tareas
                </div>
                <div className="text-brand-text-muted text-xs">
                  {member.blockedTasksAssigned} bloqueadas ·{' '}
                  {member.projectsInPortfolio} proyectos
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
