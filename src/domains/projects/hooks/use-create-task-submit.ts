'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskInput } from '../create-task.schema';
import { TASK_PRIORITY, TASK_STATUS } from '../types';
import { projectsMessages } from '../messages';

interface UseCreateTaskSubmitOptions {
  onCreate: (data: CreateTaskInput) => Promise<void> | void;
  onSuccess?: () => void;
  defaultAssigneeAlias?: string;
}

export function useCreateTaskSubmit({
  onCreate,
  onSuccess,
  defaultAssigneeAlias = ''
}: UseCreateTaskSubmitOptions) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      detail: '',
      assigneeAlias: defaultAssigneeAlias,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      dueDate: '',
      dependency: ''
    }
  });

  const onSubmit = handleSubmit(async data => {
    try {
      await onCreate(data);
      reset();
      onSuccess?.();
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : projectsMessages.taskForm.createError
      });
    }
  });

  return {
    register,
    onSubmit,
    errors,
    isSubmitting,
    reset
  };
}
