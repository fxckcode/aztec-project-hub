'use client';

import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import {
  ProjectForm,
  type ProjectFormData
} from '@/domains/projects/components/project-form';
import { useEffect, useState } from 'react';
import type { Project } from '@/domains/projects/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
  const router = useRouter();
  const { projects, updateProject, loaded } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');

  useEffect(() => {
    params.then(p => {
      const projectCode = `PRJ-${p.code.replace('prj-', '').toUpperCase()}`;
      setCode(projectCode);
      const found = projects.find(pr => pr.code === projectCode);
      setProject(found ?? null);
      setLoading(false);
    });
  }, [params, projects]);

  const handleSubmit = async (data: ProjectFormData) => {
    if (!code) return;
    updateProject(code, {
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
      blockers: data.blockers,
      summary: data.summary
    });
    router.push(`/projects/${code.toLowerCase()}`);
  };

  if (loading || !loaded) {
    return (
      <div className="text-brand-text-secondary flex items-center justify-center py-20">
        Cargando...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-brand-text-secondary">Proyecto no encontrado</p>
        <button
          onClick={() => router.push('/projects')}
          className="mt-2 text-sm text-amber-600 hover:underline"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Editando: {project.name}</h1>
        <p className="text-brand-text-secondary mt-1 text-sm">{project.code}</p>
      </div>
      <div className="card p-6">
        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/projects/${code.toLowerCase()}`)}
        />
      </div>
    </div>
  );
}
