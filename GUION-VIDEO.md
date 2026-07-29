# Guion para video — 5 minutos

## Estructura: 3:30 explicación + 1:30 demo

---

### [0:00–0:30] Introducción — El problema

_"Este reto plantea un escenario real: una operación como la de Aztec, donde conviven proyectos de automatización, mantenimiento recurrente y diagnósticos, cada uno con distinta salud, prioridad y nivel de urgencia. El problema central es: ¿cómo priorizar cuando hay 22 proyectos activos, 34 tareas vencidas y un equipo con capacidad desigual?"_

> Pantalla: mostrar el dataset (Excel con pestañas Projects, Tasks, Team)

---

### [0:30–1:10] Modelo de datos y entidades

_"Lo primero fue entender las entidades. El dataset trae tres mundos: Projects, Tasks y Team. Normalicé cada una en tipos de TypeScript estrictos."_

**Proyecto:** código, nombre, cliente, tipo de compromiso (proyecto / mantenimiento / diagnóstico), etapa (ejecución / descubrimiento), salud (sano / en riesgo / bloqueado), valor del negocio, responsable, tareas abiertas y vencidas, bloqueos.

**Tarea:** código, proyecto al que pertenece, prioridad (crítica / alta / media / baja), estado (en progreso / por hacer / en revisión / bloqueada), fecha de vencimiento, si está vencida o no.

**Equipo:** cada miembro con su rol, proyectos a cargo, tareas abiertas, bloqueadas y críticas.

_"La clave fue mantener los datos en español tal cual vienen del dataset, y los identificadores del código en inglés — eso lo pedía la arquitectura del template."_

> Pantalla: mostrar los tipos en types.ts

---

### [1:10–2:00] Motor de priorización — el corazón del sistema

_"El sistema needed un criterio claro y reproducible. No podía ser un 'esto es más urgente porque sí'. Por eso construí un motor de priorización con 6 factores ponderados."_

**Factor 1 — Salud (25%):** un proyecto bloqueado recibe 100 puntos, uno en riesgo 70, uno sano 30.

**Factor 2 — Tareas vencidas (20%):** si el 50% de las tareas están vencidas, aporta 50 puntos. Esto detecta proyectos que se están cayendo silenciosamente.

**Factor 3 — Bloqueos (15%):** cada bloqueo suma 25 puntos, hasta un máximo de 100.

**Factor 4 — Valor del negocio (15%):** los proyectos más grandes económicamente tienen más peso. Normalizo a USD, divido por 1000, tope 10. Un proyecto de $35K USD puntúa más alto que uno de $1K.

**Factor 5 — Urgencia (10%):** si la fecha límite ya pasó, 100 puntos. Si falta una semana, 80. Si falta un mes, 60. Así sucesivamente.

**Factor 6 — Carga del responsable (5%):** si Camila Torres ya tiene 28 tareas abiertas, su capacidad está al límite y eso suma puntos.

**Multiplicador por tipo de compromiso:** los proyectos de alto valor estratégico (proyecto ×1.0) pesan más que mantenimiento (×0.8) o diagnósticos (×0.6).

_"El resultado es un score 0–100 que se traduce en etiquetas: Critical, High, Medium, Low. Y lo más importante: cada score se puede desglosar en la UI para ver exactamente qué lo compone."_

> Pantalla: mostrar el código de prioritization.ts y el breakdown en la UI

---

### [2:00–2:40] Arquitectura técnica

_"Elegí Next.js 15 por los Server Components y Server Actions. El template base usa Screaming Architecture: el dominio principal es `projects` y dentro tiene su propio modelo, utils, componentes y acciones."_

**Server Actions** para el CRUD: `createProject`, `updateProject`, `getProjects` — todo del lado del servidor, los componentes cliente solo llaman a estas funciones.

**Store en memoria:** el seed data (22 proyectos, 85+ tareas, 6 miembros del equipo) se carga al iniciar. Los proyectos creados o editados persisten mientras el servidor esté corriendo. Para producción iría con PostgreSQL.

**Interactividad del lado cliente** para la tabla de proyectos: ordenamiento por cualquier columna, filtros por salud (Todos / Bloqueados / En Riesgo / Sanos), búsqueda por nombre o cliente. Todo con `useMemo` para eficiencia.

**Detección de riesgos en tiempo real:** el Risk Board agrupa proyectos por salud y muestra los riesgos específicos de cada uno + el siguiente paso sugerido.

> Pantalla: mostrar estructura de archivos y flujo de Server Actions

---

### [2:40–3:10] Manejo de proyectos

_"Cada proyecto tiene un ciclo de vida: se crea, se edita, se le asignan tareas y notas. El detalle del proyecto es la vista principal."_

**Crear:** formulario completo con todos los campos requeridos — nombre, cliente, tipo de compromiso, etapa, salud, responsable (con select desde el equipo), valor, fechas, bloqueos, resumen, notas internas.

**Editar:** desde la vista de detalle, un botón lleva al mismo formulario precargado.

**Notas inline:** se editan directamente desde el detalle, sin navegar a otra página.

**Siguiente paso:** el sistema lo calcula automáticamente según el estado del proyecto (desbloquear tareas → resolver vencidas → alinear stakeholders → planificar), pero también se puede editar manualmente.

**Riesgos:** cada proyecto se evalúa contra 6 reglas y muestra los riesgos detectados en la vista de detalle.

> Pantalla: mostrar flujo crear → editar → notas inline

---

### [3:10–3:30] Decisiones conscientes (lo que dejé fuera)

_"El reto dice que vale más entender las decisiones que tener todo hecho. Estas son las mías:"_

1. **Sin base de datos:** store en memoria. PostgreSQL + Prisma sería el salto natural.
2. **Sin autenticación:** en producción iría con NextAuth.js o Clerk.
3. **CRUD de tareas incompleto:** las tareas vienen del seed. La siguiente iteración sería crear/editar tareas individuales.
4. **Sin tests unitarios del motor:** el motor de priorización merece tests unitarios con Jest. Por tiempo prioricé tests E2E con Playwright.
5. **Responsive:** funciona pero views densas pueden mejorar en mobile.

_"Ahora les voy a mostrar el sistema funcionando."_

---

### [3:30–5:00] Demo de la plataforma (lo haces vos)

Mostrar:

1. **Dashboard** — stats, proyectos que necesitan atención, equipo sobrecargado
2. **Proyectos** — tabla interactiva: click en headers para ordenar, filtros por salud, búsqueda
3. **Crear proyecto** — llenar formulario, mostrar cómo el select de responsable trae al equipo
4. **Detalle** — breakdown de prioridad, riesgos detectados, tareas, editar notas inline
5. **Risk Board** — proyectos bloqueados, en riesgo y saludables
6. **Equipo** — grid con carga laboral, quién está sobrecargado
7. **Código** — mostrar estructura `src/domains/projects/`, el motor de priorización `prioritization.ts`

---

## Tips para la grabación

- **Pantalla completa**, navegador en 1280px+ — la UI está diseñada para desktop
- **Compartí pantalla + cámara** si te sentís cómodo, sino solo pantalla está bien
- **No leas el guion textual** — son puntos para que no te olvides
- **Si te trabás**, respirá hondo. Prefieren claridad a perfección
- **El video pesa más que el código** — no importa si no mostrás todo, importa que expliques el por qué
- **Subí a YouTube como "no listado"** o Loom — que no pida permiso para abrir
- **Repo público** verificá que se pueda clonar sin credenciales
