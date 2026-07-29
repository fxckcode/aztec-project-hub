'use client';

import Link from 'next/link';
import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import { assessAllProjects } from '@/domains/projects/utils/risk-detection';
import { calculateProjectPriority } from '@/domains/projects/utils/prioritization';

export default function RiskBoardPage() {
  const { projects, tasks, team } = useProjectStore();

  const projectsWithPriority = projects.map(p => ({
    ...p,
    priorityScore: calculateProjectPriority(p, tasks, team).score
  }));

  const assessments = assessAllProjects(projectsWithPriority, tasks);

  const blocked = assessments.filter(a => a.health === 'bloqueado');
  const atRisk = assessments.filter(a => a.health === 'en-riesgo');
  const healthy = assessments.filter(a => a.health === 'sano');

  return (
    <div className="space-y-8">
      {/* Blocked */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-danger h-2 w-2 rounded-full" />
          <h2 className="text-danger text-sm font-semibold tracking-wider uppercase">
            Bloqueados ({blocked.length})
          </h2>
        </div>
        <div className="space-y-2">
          {blocked.map(a => (
            <Link
              key={a.projectCode}
              href={`/projects/${a.projectCode.toLowerCase()}`}
              className="card hover:border-danger/50 block p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{a.projectName}</span>
                <span className="text-text-dim text-xs">{a.projectCode}</span>
              </div>
              <div className="mt-1 space-y-1">
                {a.risks.map((risk, i) => (
                  <p key={i} className="text-text-muted text-xs">
                    • {risk}
                  </p>
                ))}
              </div>
              <p className="text-brand-text-secondary mt-2 text-xs font-medium">
                <span className="text-amber-600">Siguiente:</span> {a.nextStep}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* At Risk */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-warning h-2 w-2 rounded-full" />
          <h2 className="text-warning text-sm font-semibold tracking-wider uppercase">
            En riesgo ({atRisk.length})
          </h2>
        </div>
        <div className="space-y-2">
          {atRisk.map(a => (
            <Link
              key={a.projectCode}
              href={`/projects/${a.projectCode.toLowerCase()}`}
              className="card hover:border-warning/50 block p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{a.projectName}</span>
                <span className="text-text-dim text-xs">{a.projectCode}</span>
              </div>
              <div className="mt-1 space-y-1">
                {a.risks.map((risk, i) => (
                  <p key={i} className="text-text-muted text-xs">
                    • {risk}
                  </p>
                ))}
              </div>
              <p className="text-brand-text-secondary mt-2 text-xs font-medium">
                <span className="text-amber-600">Siguiente:</span> {a.nextStep}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Healthy */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-success h-2 w-2 rounded-full" />
          <h2 className="text-success text-sm font-semibold tracking-wider uppercase">
            Saludables ({healthy.length})
          </h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {healthy.map(a => (
            <Link
              key={a.projectCode}
              href={`/projects/${a.projectCode.toLowerCase()}`}
              className="card hover:border-success/50 block p-3 transition-colors"
            >
              <div className="text-sm font-medium">{a.projectName}</div>
              <div className="text-text-dim text-xs">
                {a.projectCode} · Score {a.priorityScore}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
