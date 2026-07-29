export const projectsMessages = {
  taskForm: {
    title: 'Nueva tarea',
    titleLabel: 'Título',
    detailLabel: 'Detalle',
    assigneeLabel: 'Asignado a',
    assigneePlaceholder: 'Seleccionar responsable',
    priorityLabel: 'Prioridad',
    statusLabel: 'Estado',
    dueDateLabel: 'Fecha límite',
    dependencyLabel: 'Dependencia',
    dependencyPlaceholder: 'Opcional — bloqueo o prerequisito',
    cancel: 'Cancelar',
    submit: 'Crear tarea',
    submitting: 'Creando...',
    addTask: 'Añadir tarea',
    createError: 'No se pudo crear la tarea',
    priorities: {
      critica: 'Crítica',
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    },
    statuses: {
      'por-hacer': 'Por hacer',
      'en-progreso': 'En progreso',
      'en-revision': 'En revisión',
      bloqueada: 'Bloqueada'
    }
  },
  taskList: {
    heading: 'Tareas',
    empty: 'Sin tareas aún. Añade la primera para este proyecto.',
    overdue: 'VENCIDA'
  }
} as const;
