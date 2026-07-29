'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Save, X } from 'lucide-react';
import { useProjectStore } from '@/domains/projects/hooks/use-project-store';
import {
  calculateProjectPriority,
  detectRisks,
  suggestNextStep
} from '@/domains/projects/utils/prioritization';
import type { Project } from '@/domains/projects/types';
import { TaskForm } from '@/domains/projects/components/task-form';
import type { CreateTaskInput } from '@/domains/projects/create-task.schema';
import { projectsMessages } from '@/domains/projects/messages';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { tasks, team, getProjectByCode, updateProject, createTask, loaded } =
    useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [editingNextStep, setEditingNextStep] = useState(false);
  const [nextStepDraft, setNextStepDraft] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    params.then(p => {
      const code = `PRJ-${p.code.replace('prj-', '').toUpperCase()}`;
      const proj = getProjectByCode(code);
      if (proj) {
        setProject(proj);
        setNotesDraft(proj.notes ?? '');
        setNextStepDraft(proj.nextStep ?? '');
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [params, getProjectByCode, loaded]);

  const saveNotes = async () => {
    if (!project) return;
    updateProject(project.code, { notes: notesDraft });
    setProject({ ...project, notes: notesDraft });
    setEditingNotes(false);
  };

  const saveNextStep = async () => {
    if (!project) return;
    updateProject(project.code, { nextStep: nextStepDraft });
    setProject({ ...project, nextStep: nextStepDraft });
    setEditingNextStep(false);
  };

  const handleCreateTask = async (data: CreateTaskInput) => {
    if (!project) return;
    createTask(project.code, data);
  };

  if (loading || !loaded) {
    return (
      <div className="text-brand-text-secondary flex items-center justify-center py-20">
        Cargando...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-brand-text-secondary">No encontrado</p>
        <Link
          href="/projects"
          className="text-accent mt-2 text-sm hover:underline"
        >
          ← Volver
        </Link>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectCode === project.code);
  const priority = calculateProjectPriority(project, tasks, team);
  const risks = detectRisks(project, projectTasks);
  const nextStepFromEngine = suggestNextStep(project, projectTasks);
  const displayNextStep = project.nextStep || nextStepFromEngine;
  const owner = team.find(m => m.alias === project.ownerAlias);

  const healthColors: Record<string, string> = {
    bloqueado: 'badge-bloqueado',
    'en-riesgo': 'badge-en-riesgo',
    sano: 'badge-sano'
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-brand-text-secondary hover:text-brand-dark inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <Link
          href={`/projects/${project.code.toLowerCase()}/edit`}
          className="border-brand-border text-brand-text-secondary hover:bg-brand-surface-hover hover:text-brand-dark inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-brand-text-muted text-xs font-medium">
                {project.code}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${healthColors[project.health]}`}
              >
                {project.health}
              </span>
              <span className="border-brand-border text-brand-text-muted inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                {project.engagementType}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold">{project.name}</h1>
            <p className="text-brand-text-secondary mt-1 text-sm">
              {project.clientAlias}
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold tracking-tight tabular-nums"
              style={{
                color:
                  priority.score >= 75
                    ? '#dc2626'
                    : priority.score >= 55
                      ? '#f59e0b'
                      : priority.score >= 35
                        ? '#d97706'
                        : '#a1a1aa'
              }}
            >
              {priority.score}
            </div>
            <div className="text-brand-text-muted text-xs">Prioridad</div>
          </div>
        </div>

        <p className="text-brand-text-secondary mt-4 text-sm leading-relaxed">
          {project.summary}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {priority.factors.map(factor => (
            <div
              key={factor.name}
              className="border-brand-border rounded-lg border bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-brand-text-muted text-xs">
                  {factor.name}
                </span>
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{
                    color:
                      factor.score >= 70
                        ? '#dc2626'
                        : factor.score >= 40
                          ? '#f59e0b'
                          : '#a1a1aa'
                  }}
                >
                  {Math.round(factor.score)}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${Math.min(factor.score, 100)}%` }}
                />
              </div>
              <p className="text-brand-text-muted mt-1 text-xs">
                {factor.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-brand-text-secondary mb-3 text-sm font-semibold tracking-wider uppercase">
            Riesgos
          </h2>
          {risks.length > 0 ? (
            <ul className="space-y-2">
              {risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="bg-status-danger mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span className="text-brand-text-secondary">{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-brand-text-muted text-sm">
              Sin riesgos detectados
            </p>
          )}
        </div>

        <div className="card p-4">
          <h2 className="text-brand-text-secondary mb-3 text-sm font-semibold tracking-wider uppercase">
            Siguiente Paso
          </h2>
          {editingNextStep ? (
            <div className="flex gap-2">
              <input
                className="border-brand-border text-brand-text focus:border-brand-accent flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                value={nextStepDraft}
                onChange={e => setNextStepDraft(e.target.value)}
                autoFocus
              />
              <button
                onClick={saveNextStep}
                className="bg-brand-dark hover:bg-brand-dark-hover rounded-lg p-2 text-white"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setEditingNextStep(false);
                  setNextStepDraft(project.nextStep ?? '');
                }}
                className="border-brand-border text-brand-text-muted hover:bg-brand-surface-hover rounded-lg border p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3"
              onClick={() => setEditingNextStep(true)}
            >
              <p className="text-sm font-medium text-amber-700">
                {displayNextStep}
              </p>
              <Pencil className="h-3.5 w-3.5 shrink-0 text-amber-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
          {owner && (
            <div className="mt-4">
              <h3 className="text-brand-text-secondary mb-2 text-xs font-semibold tracking-wider uppercase">
                Responsable
              </h3>
              <div className="flex items-center gap-2">
                <div className="text-brand-dark flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-xs font-medium">
                  {owner.alias
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-sm font-medium">{owner.alias}</div>
                  <div className="text-brand-text-muted text-xs">
                    {owner.role}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-brand-text-secondary text-sm font-semibold tracking-wider uppercase">
            Notas
          </h2>
          {editingNotes ? (
            <div className="flex gap-2">
              <button
                onClick={saveNotes}
                className="bg-brand-dark hover:bg-brand-dark-hover rounded-lg px-3 py-1 text-xs font-medium text-white"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNotesDraft(project.notes ?? '');
                }}
                className="border-brand-border text-brand-text-muted hover:bg-brand-surface-hover rounded-lg border px-3 py-1 text-xs"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-brand-text-muted hover:text-brand-dark text-xs"
            >
              {project.notes ? 'Editar' : 'Agregar notas'}
            </button>
          )}
        </div>
        {editingNotes ? (
          <textarea
            className="border-brand-border text-brand-text focus:border-brand-accent mt-3 min-h-[120px] w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm outline-none"
            value={notesDraft}
            onChange={e => setNotesDraft(e.target.value)}
            autoFocus
          />
        ) : (
          <p className="text-brand-text-secondary mt-3 text-sm leading-relaxed">
            {project.notes ||
              'Sin notas aún. Click para agregar notas operativas.'}
          </p>
        )}
      </div>

      <div className="card">
        <div className="border-brand-border flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-brand-text-secondary text-sm font-semibold tracking-wider uppercase">
            {projectsMessages.taskList.heading} ({projectTasks.length})
          </h2>
          {!isAddingTask && (
            <button
              type="button"
              onClick={() => setIsAddingTask(true)}
              className="bg-brand-dark hover:bg-brand-dark-hover inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {projectsMessages.taskForm.addTask}
            </button>
          )}
        </div>

        {isAddingTask && (
          <div className="border-brand-border border-b bg-gray-50/50 px-4 py-4">
            <h3 className="text-brand-text mb-3 text-sm font-semibold">
              {projectsMessages.taskForm.title}
            </h3>
            <TaskForm
              defaultAssigneeAlias={project.ownerAlias}
              onCreate={handleCreateTask}
              onCancel={() => setIsAddingTask(false)}
              onSuccess={() => setIsAddingTask(false)}
            />
          </div>
        )}

        <div className="divide-brand-border divide-y">
          {projectTasks.length === 0 && !isAddingTask ? (
            <div className="px-4 py-8 text-center">
              <p className="text-brand-text-muted text-sm">
                {projectsMessages.taskList.empty}
              </p>
              <button
                type="button"
                onClick={() => setIsAddingTask(true)}
                className="text-brand-dark mt-3 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                {projectsMessages.taskForm.addTask}
              </button>
            </div>
          ) : (
            projectTasks.map(task => (
              <div
                key={task.code}
                className="hover:bg-brand-surface-hover px-4 py-3 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-text-muted text-xs font-medium">
                        {task.code}
                      </span>
                      <span
                        className={`text-xs font-medium ${task.status === 'en-progreso' ? 'status-in-progress' : task.status === 'por-hacer' ? 'status-todo' : task.status === 'en-revision' ? 'status-review' : 'status-blocked'}`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`text-xs font-medium ${task.priority === 'critica' ? 'priority-critical' : task.priority === 'alta' ? 'priority-high' : task.priority === 'media' ? 'priority-medium' : 'priority-low'}`}
                      >
                        {task.priority}
                      </span>
                      {task.isOverdue && (
                        <span className="text-status-danger text-xs font-medium">
                          {projectsMessages.taskList.overdue}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{task.title}</p>
                    <p className="text-brand-text-muted mt-0.5 line-clamp-2 text-xs">
                      {task.detail}
                    </p>
                  </div>
                  <div className="text-brand-text-muted ml-3 shrink-0 text-right text-xs">
                    <div>{task.assigneeAlias.split(' ')[0]}</div>
                    {task.dueDate && <div>{task.dueDate}</div>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
