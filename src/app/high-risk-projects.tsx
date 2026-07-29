'use client';

import Link from 'next/link';
import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import { assessAllProjects } from '@/domains/projects/utils/risk-detection';
import { calculateProjectPriority } from '@/domains/projects/utils/prioritization';

export function HighRiskProjects() {
  const { projects, tasks, team, loaded } = useProjectStore();

  if (!loaded) return null;

  const projectsWithPriority = projects.map(p => ({
    ...p,
    priorityScore: calculateProjectPriority(p, tasks, team).score
  }));

  const assessments = assessAllProjects(projectsWithPriority, tasks);
  const critical = assessments
    .filter(a => a.health === 'bloqueado' || a.priorityScore >= 55)
    .slice(0, 4);

  return (
    <div className="card p-4">
      <h2 className="text-brand-text-secondary mb-3 text-sm font-semibold tracking-wider uppercase">
        Necesita Atención
      </h2>
      <div className="space-y-2">
        {critical.map(a => (
          <Link
            key={a.projectCode}
            href={`/projects/${a.projectCode.toLowerCase()}`}
            className="border-brand-border bg-brand-surface-hover hover:border-brand-accent block rounded-lg border p-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{a.projectName}</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  a.health === 'bloqueado'
                    ? 'badge-bloqueado'
                    : a.health === 'en-riesgo'
                      ? 'badge-en-riesgo'
                      : 'badge-sano'
                }`}
              >
                {a.health}
              </span>
            </div>
            {a.risks.length > 0 && (
              <p className="text-brand-text-secondary mt-1 line-clamp-1 text-xs">
                {a.risks[0]}
              </p>
            )}
            <p className="text-amber-600 mt-1 text-xs">
              Siguiente: {a.nextStep}
            </p>
          </Link>
        ))}
      </div>
      {assessments.length > 4 && (
        <Link
          href="/projects"
          className="text-brand-text-secondary hover:text-brand-dark mt-3 block text-center text-xs"
        >
          Ver todos los {assessments.length} proyectos →
        </Link>
      )}
    </div>
  );
}
