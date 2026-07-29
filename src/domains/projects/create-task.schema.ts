import { z } from 'zod';
import { projectsValidationMessages } from './validation-messages';
import { TASK_PRIORITY, TASK_STATUS } from './types';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, { error: projectsValidationMessages.titleRequired })
    .max(200, { error: projectsValidationMessages.titleTooLong }),
  detail: z
    .string()
    .min(1, { error: projectsValidationMessages.detailRequired }),
  assigneeAlias: z
    .string()
    .min(1, { error: projectsValidationMessages.assigneeRequired }),
  priority: z.enum(
    [
      TASK_PRIORITY.CRITICAL,
      TASK_PRIORITY.HIGH,
      TASK_PRIORITY.MEDIUM,
      TASK_PRIORITY.LOW
    ],
    { error: projectsValidationMessages.priorityRequired }
  ),
  status: z.enum(
    [
      TASK_STATUS.TODO,
      TASK_STATUS.IN_PROGRESS,
      TASK_STATUS.IN_REVIEW,
      TASK_STATUS.BLOCKED
    ],
    { error: projectsValidationMessages.statusRequired }
  ),
  dueDate: z.string().optional(),
  dependency: z.string().optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
