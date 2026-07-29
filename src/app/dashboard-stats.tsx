'use client';

import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import { calculateProjectPriority } from '@/domains/projects/utils/prioritization';

export function DashboardStats() {
  const { projects, tasks, team, loaded } = useProjectStore();

  if (!loaded) return <div className="text-sm text-gray-400">Cargando...</div>;

  const enriched = projects.map(p => ({
    ...p,
    priorityScore: calculateProjectPriority(p, tasks, team).score
  }));

  const totalValueUsd = enriched.reduce((sum, p) => {
    if (p.currency === 'COP') return sum + p.businessValue / 4500;
    return sum + p.businessValue;
  }, 0);

  const blockedCount = enriched.filter(p => p.health === 'bloqueado').length;
  const atRiskCount = enriched.filter(p => p.health === 'en-riesgo').length;
  const healthyCount = enriched.filter(p => p.health === 'sano').length;
  const overdueCount = tasks.filter(t => t.isOverdue).length;

  const cards = [
    {
      label: 'Total de proyectos',
      value: projects.length,
      color: 'text-brand-dark'
    },
    { label: 'Bloqueados', value: blockedCount, color: 'text-status-danger' },
    { label: 'En Riesgo', value: atRiskCount, color: 'text-status-warning' },
    { label: 'Saludables', value: healthyCount, color: 'text-status-success' },
    {
      label: 'Tareas Vencidas',
      value: overdueCount,
      color: overdueCount > 0 ? 'text-status-danger' : 'text-brand-text'
    },
    {
      label: 'Valor de la cartera',
      value: `$${(totalValueUsd / 1000).toFixed(0)}K`,
      color: 'text-brand-dark'
    }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map(card => (
        <div key={card.label} className="card p-4">
          <div className="stat-label">{card.label}</div>
          <div className={`stat-value mt-1 ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
