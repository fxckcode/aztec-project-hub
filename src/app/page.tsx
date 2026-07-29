import { Suspense } from 'react';
import { DashboardStats } from './dashboard-stats';
import { HighRiskProjects } from './high-risk-projects';
import { TeamOverload } from './team-overload';
import { ProjectPriorityList } from './project-priority-list';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={<div className="text-text-muted">Loading stats...</div>}
      >
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense
          fallback={<div className="text-text-muted">Loading risks...</div>}
        >
          <HighRiskProjects />
        </Suspense>
        <Suspense
          fallback={<div className="text-text-muted">Loading team data...</div>}
        >
          <TeamOverload />
        </Suspense>
      </div>

      <Suspense
        fallback={<div className="text-text-muted">Loading priorities...</div>}
      >
        <ProjectPriorityList />
      </Suspense>
    </div>
  );
}
