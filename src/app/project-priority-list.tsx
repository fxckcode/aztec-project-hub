'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import {
  calculateProjectPriority,
  detectRisks,
  suggestNextStep
} from '@/domains/projects/utils/prioritization';

export function ProjectPriorityList() {
  const { projects, tasks, team, loaded } = useProjectStore();
  const [filter, setFilter] = useState<
    'all' | 'bloqueado' | 'en-riesgo' | 'sano'
  >('all');

  const ranked = useMemo(() => {
    if (!loaded) return [];
    return projects
      .map(p => {
        const priority = calculateProjectPriority(p, tasks, team);
        const projectTasks = tasks.filter(t => t.projectCode === p.code);
        return {
          ...p,
          priorityScore: priority.score,
          priorityLabel: priority.label,
          risks: detectRisks(p, projectTasks),
          nextStep: suggestNextStep(p, projectTasks)
        };
      })
      .filter(p => filter === 'all' || p.health === filter)
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [projects, tasks, team, filter, loaded]);

  const counts = {
    all: projects.length,
    bloqueado: projects.filter(p => p.health === 'bloqueado').length,
    'en-riesgo': projects.filter(p => p.health === 'en-riesgo').length,
    sano: projects.filter(p => p.health === 'sano').length
  };

  if (!loaded) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Proyectos Priorizados
        </h2>
        <div className="flex items-center gap-1">
          {(['all', 'bloqueado', 'en-riesgo', 'sano'] as const).map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                filter === key
                  ? key === 'all'
                    ? 'bg-gray-900 text-white'
                    : key === 'bloqueado'
                      ? 'bg-red-100 text-red-700'
                      : key === 'en-riesgo'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              {key === 'all'
                ? 'Todos'
                : key === 'bloqueado'
                  ? 'Bloq'
                  : key === 'en-riesgo'
                    ? 'Riesgo'
                    : 'Sano'}
              <span className="ml-1 text-[10px] opacity-60">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {ranked.slice(0, 10).map(project => (
          <Link
            key={project.code}
            href={`/projects/${project.code.toLowerCase()}`}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50/80"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                project.health === 'bloqueado'
                  ? 'bg-red-100 text-red-600'
                  : project.health === 'en-riesgo'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {project.code.replace('PRJ-', '')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900">
                {project.name}
              </div>
              <div className="text-[11px] text-gray-400">
                {project.clientAlias}
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right text-[11px]">
                <div className="text-gray-400">Valor</div>
                <div className="font-medium text-gray-700 tabular-nums">
                  {project.currency === 'COP'
                    ? `$${(project.businessValue / 1000000).toFixed(0)}M`
                    : `$${(project.businessValue / 1000).toFixed(0)}K`}
                </div>
              </div>
              <div className="w-16">
                <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      project.priorityScore >= 75
                        ? 'bg-red-400'
                        : project.priorityScore >= 55
                          ? 'bg-amber-400'
                          : project.priorityScore >= 35
                            ? 'bg-amber-300'
                            : 'bg-gray-300'
                    }`}
                    style={{
                      width: `${Math.min(project.priorityScore, 100)}%`
                    }}
                  />
                </div>
                <div
                  className={`mt-0.5 text-right text-[11px] font-bold tabular-nums ${
                    project.priorityScore >= 75
                      ? 'text-red-600'
                      : project.priorityScore >= 55
                        ? 'text-amber-600'
                        : project.priorityScore >= 35
                          ? 'text-amber-500'
                          : 'text-gray-400'
                  }`}
                >
                  {project.priorityScore}
                </div>
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                project.health === 'bloqueado'
                  ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                  : project.health === 'en-riesgo'
                    ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                    : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
              }`}
            >
              {project.health === 'bloqueado'
                ? 'Bloq'
                : project.health === 'en-riesgo'
                  ? 'Riesgo'
                  : 'Sano'}
            </span>
          </Link>
        ))}
      </div>

      {ranked.length > 10 && (
        <Link
          href="/projects"
          className="hover:text-brand-dark block border-t border-gray-100 px-4 py-2.5 text-center text-xs text-gray-400 transition-colors"
        >
          Ver los {ranked.length} proyectos →
        </Link>
      )}
    </div>
  );
}
