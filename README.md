# Aztec Project Hub — Sistema de Gestión de Proyectos

**Reto Desarrollador de Soluciones con IA | Aztec**

Dashboard operativo para la gestión de proyectos de automatización e IA. Construido con Next.js 15, TypeScript, Tailwind CSS v4 y shadcn/ui.

---

## Stack técnico

- **Next.js 15** (App Router, RSC-first, Server Actions)
- **TypeScript** strict mode
- **Tailwind CSS v4** — light mode, diseño inspirado en AztecLab
- **Plus Jakarta Sans** + **DM Mono** (tipografía exacta de AztecLab)
- **shadcn/ui** — componentes base
- **Arquitectura**: Screaming Architecture + DDD + Atomic Design

---

## Inicio rápido

```bash
pnpm install
pnpm dev
# Abrir http://localhost:3000
```

Build producción:

```bash
pnpm build
pnpm start
```

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | **Dashboard** — KPIs, proyectos que necesitan atención, carga del equipo, lista priorizada |
| `/projects` | **Proyectos** — tabla interactiva con filtros, búsqueda, ordenamiento por columnas |
| `/projects/new` | **Nuevo proyecto** — formulario completo con todos los campos |
| `/projects/[code]` | **Detalle** — información, desglose de prioridad, riesgos, tareas, notas editables |
| `/projects/[code]/edit` | **Editar proyecto** — modificar cualquier campo |
| `/risks` | **Tablero de Riesgos** — agrupado por Bloqueados / En Riesgo / Saludables |
| `/team` | **Equipo** — grid de carga laboral por persona |

---

## Modelo de datos (entidades)

### Project
```
code, name, clientAlias, engagementType (proyecto|mantenimiento|diagnostico),
stage (ejecucion|descubrimiento), health (sano|en-riesgo|bloqueado),
status, ownerAlias, ownerRole, startDate, targetDate, businessValue, currency,
openTasks, overdueTasks, blockers, summary, notes
```

### Task
```
code, projectCode, assigneeAlias, priority (critica|alta|media|baja),
status (en-progreso|por-hacer|en-revision|bloqueada), dueDate, isOverdue,
title, detail, lastProgress
```

### TeamMember
```
alias, role, projectsInPortfolio, openTasksAssigned, blockedTasksAssigned,
highOrCriticalOpen, utilizationRate
```

---

## Criterio de priorización

Cada proyecto recibe un score **0–100** con esta fórmula ponderada:

| Factor | Peso | Detalle |
|---|---|---|
| **Salud** | 25% | Bloqueado=100, En riesgo=70, Sano=30 |
| **Tareas vencidas** | 20% | % de tareas vencidas sobre el total |
| **Bloqueos** | 15% | 25 pts por bloqueo, tope 100 |
| **Valor del negocio** | 15% | USD normalizado (/1000, tope 10, ×10) |
| **Urgencia** | 10% | Días hasta fecha límite |
| **Carga del responsable** | 5% | Tareas abiertas vs capacidad (6) |
| **Multiplicador por tipo** | — | Proyecto ×1.0, Mantenimiento ×0.8, Diagnóstico ×0.6 |

**Etiquetas:** Critical (≥75), High (55–74), Medium (35–54), Low (<35)

---

## Manejo de proyectos

- **CRUD completo** vía Server Actions con store en memoria
- **Detección automática de riesgos**: cada proyecto se evalúa contra 6 reglas
  - Salud bloqueada → riesgo crítico
  - Tareas vencidas sin plan de cierre
  - Tareas bloqueadas sin acción de desbloqueo
  - Sin siguiente paso claro
  - Sin fecha límite definida
- **Siguiente paso sugerido**: el sistema propone la acción más urgente
- **Notas internas** editables inline en la vista de detalle

## Manejo de tareas

- Cada proyecto tiene 3–4 tareas asociadas con prioridad, estado y responsable
- Detección de tareas vencidas y bloqueadas
- Las tareas alimentan el score de prioridad del proyecto
- Vista de detalle de proyecto muestra el backlog completo

---

## Tests

```bash
npx playwright test --reporter=list
```

Cubren: Dashboard, tabla interactiva, formularios, detalle de proyecto, risk board, equipo, navegación.

---

## Lo que quedó por fuera (decisiones conscientes)

1. **Base de datos**: opté por store en memoria con seed data. Para producción usaría PostgreSQL + Prisma o Supabase.
2. **Autenticación**: no hay login. En producción agregaría NextAuth.js o Clerk.
3. **CRUD de tareas**: las tareas vienen del seed. En una segunda iteración agregaría crear/editar tareas.
4. **Modo oscuro**: el diseño sigue la línea visual de AztecLab (light mode con acentos verdes). Se puede agregar dark mode con un ThemeProvider.
5. **Responsive completo**: la tabla es responsive pero views muy densas pueden optimizarse para mobile.
