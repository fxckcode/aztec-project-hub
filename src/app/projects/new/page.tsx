'use client';

import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import {
  ProjectForm,
  type ProjectFormData
} from '@/domains/projects/components/project-form';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();

  const handleSubmit = async (data: ProjectFormData) => {
    createProject({
      name: data.name,
      clientAlias: data.clientAlias,
      engagementType: data.engagementType,
      projectType: data.projectType,
      stage: data.stage,
      status: data.status,
      health: data.health,
      ownerAlias: data.ownerAlias,
      ownerRole: data.ownerRole,
      startDate: data.startDate || null,
      targetDate: data.targetDate || null,
      businessValue: data.businessValue,
      currency: data.currency,
      openTasks: 0,
      overdueTasks: 0,
      blockers: data.blockers,
      summary: data.summary,
      recentCompleted: 'Sin ejemplos completados aún',
      notes: data.notes
    });
    router.push('/projects');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Nuevo Proyecto</h1>
        <p className="text-brand-text-secondary mt-1 text-sm">
          Agregar proyecto al portafolio
        </p>
      </div>
      <div className="card p-6">
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/projects')}
        />
      </div>
    </div>
  );
}
