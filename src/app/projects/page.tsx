'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Plus, ArrowUpDown, Search } from 'lucide-react';
import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import { calculateProjectPriority } from '@/domains/projects/utils/prioritization';

type SortKey = 'priority' | 'name' | 'value' | 'tasks' | 'health' | 'code';
type SortDir = 'asc' | 'desc';
type FilterKey = 'all' | 'bloqueado' | 'en-riesgo' | 'sano';

export default function ProjectsPage() {
  const { projects, tasks, team } = useProjectStore();
  const [sortKey, setSortKey] = useState<SortKey>('code');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterHealth, setFilterHealth] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const enriched = useMemo(() => {
    return projects.map(p => ({
      ...p,
      priorityScore: calculateProjectPriority(p, tasks, team).score
    }));
  }, [projects, tasks, team]);

  const filtered = useMemo(() => {
    let result = [...enriched];

    // Filter by health
    if (filterHealth !== 'all') {
      result = result.filter(p => p.health === filterHealth);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.clientAlias.toLowerCase().includes(q) ||
          p.ownerAlias.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'priority':
          cmp = a.priorityScore - b.priorityScore;
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'value':
          cmp = a.businessValue - b.businessValue;
          break;
        case 'tasks':
          cmp = a.openTasks - b.openTasks;
          break;
        case 'health': {
          const order = { bloqueado: 0, 'en-riesgo': 1, sano: 2 };
          cmp = order[a.health] - order[b.health];
          break;
        }
        case 'code': {
          cmp = a.code.localeCompare(b.code);
          break;
        }
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [enriched, filterHealth, searchQuery, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const healthCounts = {
    all: enriched.length,
    bloqueado: enriched.filter(p => p.health === 'bloqueado').length,
    'en-riesgo': enriched.filter(p => p.health === 'en-riesgo').length,
    sano: enriched.filter(p => p.health === 'sano').length
  };

  const SortHeader = ({
    label,
    sortKey: sk
  }: {
    label: string;
    sortKey: SortKey;
  }) => (
    <button
      onClick={() => toggleSort(sk)}
      className="group inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-gray-500 uppercase transition-colors hover:text-gray-900"
    >
      {label}
      <ArrowUpDown
        className={`h-3 w-3 transition-opacity ${
          sortKey === sk
            ? 'text-brand-dark opacity-100'
            : 'opacity-30 group-hover:opacity-60'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(['all', 'bloqueado', 'en-riesgo', 'sano'] as const).map(key => (
            <button
              key={key}
              onClick={() => setFilterHealth(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                filterHealth === key
                  ? key === 'all'
                    ? 'bg-gray-900 text-white'
                    : key === 'bloqueado'
                      ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                      : key === 'en-riesgo'
                        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                        : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {key === 'all'
                ? 'Todos'
                : key === 'bloqueado'
                  ? `Bloqueados`
                  : key === 'en-riesgo'
                    ? `En Riesgo`
                    : `Sanos`}
              <span
                className={`ml-0.5 text-[10px] ${
                  filterHealth === key
                    ? key === 'all'
                      ? 'text-white/70'
                      : 'opacity-70'
                    : 'text-gray-400'
                }`}
              >
                {healthCounts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="focus:border-brand-dark focus:ring-brand-dark/20 w-48 rounded-lg border border-gray-200 bg-white py-1.5 pr-3 pl-8 text-sm outline-none placeholder:text-gray-400 focus:ring-1"
            />
          </div>

          <Link
            href="/projects/new"
            className="bg-brand-dark hover:bg-brand-dark-hover inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo
          </Link>
        </div>
      </div>

      {/* Resumen */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700">
          {filtered.length} proyectos
        </span>
        {filterHealth !== 'all' && (
          <button
            onClick={() => setFilterHealth('all')}
            className="text-gray-400 underline hover:text-gray-700"
          >
            Limpiar filtro
          </button>
        )}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-gray-400 underline hover:text-gray-700"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-left">
                <SortHeader label="Código" sortKey="code" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Proyecto" sortKey="name" />
              </th>
              <th className="hidden px-4 py-3 text-left md:table-cell">
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Cliente
                </span>
              </th>
              <th className="hidden px-4 py-3 text-left md:table-cell">
                <SortHeader label="Salud" sortKey="health" />
              </th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">
                <SortHeader label="Valor" sortKey="value" />
              </th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">
                <SortHeader label="Tareas" sortKey="tasks" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Prioridad" sortKey="priority" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(project => (
              <tr
                key={project.code}
                onClick={() =>
                  (window.location.href = `/projects/${project.code.toLowerCase()}`)
                }
                className="cursor-pointer transition-colors hover:bg-gray-50/80"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-medium text-gray-400">
                    {project.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        project.health === 'bloqueado'
                          ? 'bg-red-100 text-red-600'
                          : project.health === 'en-riesgo'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {project.code.replace('PRJ-', '')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-xs text-gray-400 md:hidden">
                        {project.clientAlias}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                  {project.clientAlias}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      project.health === 'bloqueado'
                        ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                        : project.health === 'en-riesgo'
                          ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                          : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                    }`}
                  >
                    {project.health === 'bloqueado'
                      ? 'Bloqueado'
                      : project.health === 'en-riesgo'
                        ? 'En Riesgo'
                        : 'Sano'}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-right text-sm tabular-nums sm:table-cell">
                  <span className="font-medium text-gray-900">
                    {project.currency === 'COP'
                      ? `$${(project.businessValue / 1000000).toFixed(0)}M`
                      : `$${(project.businessValue / 1000).toFixed(0)}K`}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-right sm:table-cell">
                  <span className="text-sm text-gray-700 tabular-nums">
                    {project.openTasks}
                  </span>
                  {project.overdueTasks > 0 && (
                    <span className="ml-1 text-xs font-medium text-red-500">
                      ({project.overdueTasks})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100 md:w-16">
                      <div
                        className={`h-full rounded-full transition-all ${
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
                    <span
                      className={`w-7 text-right text-sm font-bold tabular-nums ${
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
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No se encontraron proyectos</p>
            {(filterHealth !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterHealth('all');
                  setSearchQuery('');
                }}
                className="text-brand-dark mt-2 text-sm hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
