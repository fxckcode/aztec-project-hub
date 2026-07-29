'use client';

import { seedTeam } from '@/domains/projects/data/seed';
import { useCreateTaskSubmit } from '@/domains/projects/hooks/use-create-task-submit';
import { projectsMessages } from '@/domains/projects/messages';
import type { CreateTaskInput } from '@/domains/projects/create-task.schema';
import { TASK_PRIORITY, TASK_STATUS } from '@/domains/projects/types';

interface TaskFormProps {
  onCreate: (data: CreateTaskInput) => Promise<void> | void;
  onCancel?: () => void;
  onSuccess?: () => void;
  defaultAssigneeAlias?: string;
}

export function TaskForm({
  onCreate,
  onCancel,
  onSuccess,
  defaultAssigneeAlias
}: TaskFormProps) {
  const { register, onSubmit, errors, isSubmitting } = useCreateTaskSubmit({
    onCreate,
    onSuccess,
    defaultAssigneeAlias
  });

  const messages = projectsMessages.taskForm;
  const inputClass =
    'task-form__input w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-text placeholder-text-dim outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30';
  const labelClass =
    'task-form__label block text-xs font-medium text-brand-text-secondary mb-1';
  const errorClass = 'task-form__error mt-1 block text-xs text-status-danger';

  return (
    <form onSubmit={onSubmit} className="task-form space-y-4">
      <div className="task-form__field">
        <label htmlFor="task-title" className={labelClass}>
          {messages.titleLabel} *
        </label>
        <input
          id="task-title"
          className={inputClass}
          {...register('title')}
          autoFocus
        />
        {errors.title && (
          <span className={errorClass}>{errors.title.message}</span>
        )}
      </div>

      <div className="task-form__field">
        <label htmlFor="task-detail" className={labelClass}>
          {messages.detailLabel} *
        </label>
        <textarea
          id="task-detail"
          className={`${inputClass} min-h-[80px] resize-y`}
          {...register('detail')}
        />
        {errors.detail && (
          <span className={errorClass}>{errors.detail.message}</span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="task-form__field">
          <label htmlFor="task-assignee" className={labelClass}>
            {messages.assigneeLabel} *
          </label>
          <select
            id="task-assignee"
            className={inputClass}
            {...register('assigneeAlias')}
          >
            <option value="">{messages.assigneePlaceholder}</option>
            {seedTeam.map(member => (
              <option key={member.alias} value={member.alias}>
                {member.alias} — {member.role}
              </option>
            ))}
          </select>
          {errors.assigneeAlias && (
            <span className={errorClass}>{errors.assigneeAlias.message}</span>
          )}
        </div>

        <div className="task-form__field">
          <label htmlFor="task-due-date" className={labelClass}>
            {messages.dueDateLabel}
          </label>
          <input
            id="task-due-date"
            type="date"
            className={inputClass}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <span className={errorClass}>{errors.dueDate.message}</span>
          )}
        </div>

        <div className="task-form__field">
          <label htmlFor="task-priority" className={labelClass}>
            {messages.priorityLabel}
          </label>
          <select
            id="task-priority"
            className={inputClass}
            {...register('priority')}
          >
            <option value={TASK_PRIORITY.CRITICAL}>
              {messages.priorities.critica}
            </option>
            <option value={TASK_PRIORITY.HIGH}>
              {messages.priorities.alta}
            </option>
            <option value={TASK_PRIORITY.MEDIUM}>
              {messages.priorities.media}
            </option>
            <option value={TASK_PRIORITY.LOW}>
              {messages.priorities.baja}
            </option>
          </select>
          {errors.priority && (
            <span className={errorClass}>{errors.priority.message}</span>
          )}
        </div>

        <div className="task-form__field">
          <label htmlFor="task-status" className={labelClass}>
            {messages.statusLabel}
          </label>
          <select
            id="task-status"
            className={inputClass}
            {...register('status')}
          >
            <option value={TASK_STATUS.TODO}>
              {messages.statuses['por-hacer']}
            </option>
            <option value={TASK_STATUS.IN_PROGRESS}>
              {messages.statuses['en-progreso']}
            </option>
            <option value={TASK_STATUS.IN_REVIEW}>
              {messages.statuses['en-revision']}
            </option>
            <option value={TASK_STATUS.BLOCKED}>
              {messages.statuses.bloqueada}
            </option>
          </select>
          {errors.status && (
            <span className={errorClass}>{errors.status.message}</span>
          )}
        </div>
      </div>

      <div className="task-form__field">
        <label htmlFor="task-dependency" className={labelClass}>
          {messages.dependencyLabel}
        </label>
        <input
          id="task-dependency"
          className={inputClass}
          placeholder={messages.dependencyPlaceholder}
          {...register('dependency')}
        />
      </div>

      {errors.root && (
        <p className="task-form__root-error text-status-danger text-sm">
          {errors.root.message}
        </p>
      )}

      <div className="task-form__actions border-brand-border flex items-center justify-end gap-3 border-t pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-brand-border text-brand-text-secondary hover:bg-brand-surface-hover rounded-lg border px-4 py-2 text-sm transition-colors"
          >
            {messages.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-dark hover:bg-brand-dark-hover rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isSubmitting ? messages.submitting : messages.submit}
        </button>
      </div>
    </form>
  );
}
