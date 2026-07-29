'use client';

import { useState } from 'react';
import type { Project } from '@/domains/projects/types';
import { seedTeam } from '@/domains/projects/data/seed';

export interface ProjectFormData {
  name: string;
  clientAlias: string;
  engagementType: 'proyecto' | 'mantenimiento' | 'diagnostico';
  projectType: string;
  stage: 'ejecucion' | 'descubrimiento';
  status: 'activo' | 'pausado' | 'completado';
  health: 'sano' | 'en-riesgo' | 'bloqueado';
  ownerAlias: string;
  ownerRole: string;
  startDate: string;
  targetDate: string;
  businessValue: number;
  currency: 'USD' | 'COP';
  summary: string;
  blockers: number;
  notes: string;
}

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
}

const defaultForm: ProjectFormData = {
  name: '',
  clientAlias: '',
  engagementType: 'proyecto',
  projectType: 'Automatizacion',
  stage: 'ejecucion',
  status: 'activo',
  health: 'sano',
  ownerAlias: '',
  ownerRole: 'Delivery',
  startDate: '',
  targetDate: '',
  businessValue: 0,
  currency: 'USD',
  summary: '',
  blockers: 0,
  notes: ''
};

function projectToFormData(p: Project): ProjectFormData {
  return {
    name: p.name,
    clientAlias: p.clientAlias,
    engagementType: p.engagementType,
    projectType: p.projectType,
    stage: p.stage,
    status: p.status,
    health: p.health,
    ownerAlias: p.ownerAlias,
    ownerRole: p.ownerRole,
    startDate: p.startDate ?? '',
    targetDate: p.targetDate ?? '',
    businessValue: p.businessValue,
    currency: p.currency,
    summary: p.summary,
    blockers: p.blockers,
    notes: ''
  };
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormData>(
    project ? projectToFormData(project) : defaultForm
  );
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K]
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-text placeholder-text-dim outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30';
  const labelClass = 'block text-xs font-medium text-brand-text-secondary mb-1';
  const selectClass = inputClass;
  const sectionClass = 'space-y-4';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className={sectionClass}>
        <h3 className="text-brand-text-secondary text-sm font-semibold tracking-wider uppercase">
          Información básica
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre del proyecto *</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={e => update('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Cliente *</label>
            <input
              className={inputClass}
              value={form.clientAlias}
              onChange={e => update('clientAlias', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Tipo de compromiso</label>
            <select
              className={selectClass}
              value={form.engagementType}
              onChange={e =>
                update(
                  'engagementType',
                  e.target.value as ProjectFormData['engagementType']
                )
              }
            >
              <option value="proyecto">Proyecto</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="diagnostico">Diagnóstico</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipo de proyecto</label>
            <select
              className={selectClass}
              value={form.projectType}
              onChange={e => update('projectType', e.target.value)}
            >
              <option value="Automatizacion">Automatización</option>
              <option value="Consultoria">Consultoría</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status & Health */}
      <div className={sectionClass}>
        <h3 className="text-brand-text-secondary text-sm font-semibold tracking-wider uppercase">
          Estado y salud
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Etapa</label>
            <select
              className={selectClass}
              value={form.stage}
              onChange={e =>
                update('stage', e.target.value as ProjectFormData['stage'])
              }
            >
              <option value="ejecucion">Ejecución</option>
              <option value="descubrimiento">Descubrimiento</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Salud</label>
            <select
              className={selectClass}
              value={form.health}
              onChange={e =>
                update('health', e.target.value as ProjectFormData['health'])
              }
            >
              <option value="sano">Sano</option>
              <option value="en-riesgo">En riesgo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Bloqueos</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.blockers}
              onChange={e => update('blockers', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className={labelClass}>Responsable</label>
            <select
              className={selectClass}
              value={form.ownerAlias}
              onChange={e => {
                const member = seedTeam.find(m => m.alias === e.target.value);
                update('ownerAlias', e.target.value);
                if (member) update('ownerRole', member.role);
              }}
            >
              <option value="">Seleccionar responsable</option>
              {seedTeam.map(m => (
                <option key={m.alias} value={m.alias}>
                  {m.alias} — {m.role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rol del responsable</label>
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none"
              value={form.ownerRole}
              readOnly
            />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select
              className={selectClass}
              value={form.status}
              onChange={e =>
                update('status', e.target.value as ProjectFormData['status'])
              }
            >
              <option value="activo">Activo</option>
              <option value="pausado">Pausado</option>
              <option value="completado">Completado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dates & Value */}
      <div className={sectionClass}>
        <h3 className="text-brand-text-secondary text-sm font-semibold tracking-wider uppercase">
          Fechas y valor
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Fecha de inicio</label>
            <input
              className={inputClass}
              type="date"
              value={form.startDate}
              onChange={e => update('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Fecha objetivo</label>
            <input
              className={inputClass}
              type="date"
              value={form.targetDate}
              onChange={e => update('targetDate', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Valor del negocio</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.businessValue || ''}
              onChange={e =>
                update('businessValue', parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <label className={labelClass}>Moneda</label>
            <select
              className={selectClass}
              value={form.currency}
              onChange={e =>
                update('currency', e.target.value as 'USD' | 'COP')
              }
            >
              <option value="USD">USD</option>
              <option value="COP">COP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary & Notes */}
      <div className={sectionClass}>
        <h3 className="text-brand-text-secondary text-sm font-semibold tracking-wider uppercase">
          Resumen y notas
        </h3>
        <div>
          <label className={labelClass}>Resumen</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={form.summary}
            onChange={e => update('summary', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Notas internas</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Notas operativas, detalles de bloqueos, próximos pasos..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="border-brand-border flex items-center justify-end gap-3 border-t pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-brand-border text-brand-text-secondary hover:bg-brand-surface-hover rounded-lg border px-4 py-2 text-sm transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-dark hover:bg-brand-dark-hover rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {submitting
            ? 'Guardando...'
            : project
              ? 'Actualizar proyecto'
              : 'Crear proyecto'}
        </button>
      </div>
    </form>
  );
}
