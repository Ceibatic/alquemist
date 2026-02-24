# FEAT-2026-02-phase-role-activities

## Metadata
- **Creado:** 2026-02-23
- **Prioridad:** high
- **Modulo relacionado:** M24-production-orders, M22-production-templates, M25-batches
- **Tipo:** feature

## Descripcion

Reemplazar el boton manual "Completar Fase" con un sistema de transiciones de fase activadas por actividades. Cada fase de produccion tiene actividades de **entrada** (entry) y **salida** (exit) que controlan su ciclo de vida:

- **Entry activity:** Bloquea el inicio de la fase — la fase queda `pending` hasta que se ejecute la actividad de entrada (ej: transplante al area, configuracion inicial).
- **Exit activity:** Al ser ejecutada, automaticamente completa la fase actual y avanza a la siguiente.

Las transformaciones de inventario (plantas que cambian de fase/producto) se manejan a traves del mismo sistema de recursos de la actividad: un recurso con `direction: "produced"` crea un nuevo `inventory_item`, unificando el flujo con el sistema de recursos existente.

### Arquitectura

El sistema se basa en tres campos nuevos:

1. `phase_role` en `template_activities` y `scheduled_activities` — marca si una actividad es "entry", "exit", o regular (null)
2. `order_phase_id` en `scheduled_activities` — link directo actividad ↔ fase (actualmente solo implicito por fecha)
3. Extension de `executeActivity` para manejar `direction: "produced"` en recursos (crea inventory_items)

### Integracion con `logPhaseTransitionWithInventory()`

La funcion `logPhaseTransitionWithInventory()` (activities.ts:1918) ya implementa la logica de transformacion de inventario: crea `inventory_items` con `direction: "produced"`, marca source como `transformed`, actualiza batch quantities, y trackea plantas individuales. Actualmente es una mutation standalone que nunca se llama automaticamente.

**Estrategia de integracion:**

1. **Extraer** la logica de transformacion de `logPhaseTransitionWithInventory()` a un helper interno reutilizable: `handleInventoryTransformation(ctx, params)`
2. **`executeActivity`** llama al helper cuando procesa recursos con `direction: "produced"` (US-FEAT.5)
3. **`logPhaseTransitionWithInventory`** se convierte en wrapper del mismo helper (backward compat, sin breaking changes)
4. **No hay duplicacion** — una sola implementacion de la logica de transformacion

```
logPhaseTransitionWithInventory()  →  handleInventoryTransformation()  ←  executeActivity()
      (wrapper, backward compat)         (helper compartido)               (nuevo path)
```

### Destino de `completePhase`

La mutation `productionOrders.completePhase` se **mantiene como fallback de admin**:

- Ordenes **con** phase_role activities → UI no muestra boton "Completar Fase", transicion es automatica via exit activity
- Ordenes **sin** phase_role (legacy) → boton sigue disponible
- Guard: si la fase tiene exit activity pendiente, `completePhase` logea warning en consola pero permite continuar (admin override)

### Validacion de secuencia

La maquina de estados previene ejecucion fuera de orden:

| Estado de fase | Entry activity | Regular activities | Exit activity |
|----------------|---------------|-------------------|---------------|
| `awaiting_entry` | Ejecutable | Bloqueadas (fase no iniciada) | Bloqueada (fase no iniciada) |
| `in_progress` | No-op (ya ejecutada) | Ejecutables | Ejecutable |
| `completed` | No-op | Quedan como `pending`/`skipped` | No-op (idempotente) |

- **Exit antes de entry:** Imposible — la fase esta `awaiting_entry`, exit requiere `in_progress`
- **Exit antes de regulares:** Permitido — el operador decide cuando cerrar la fase. Actividades regulares pendientes quedan `pending` (no se pierden, auditables)
- **Eliminacion de entry/exit:** No existe mutation de delete en `scheduledActivities.ts`. Las actividades son inmutables post-creacion (correcto para auditoria regulatoria). Si en el futuro se agrega cancel, debe validar que no sea la unica entry/exit de la fase

### Compatibilidad

- Ordenes existentes sin phase_role siguen funcionando (`completePhase` manual sigue disponible como fallback)
- Templates existentes sin entry/exit definidos: el sistema auto-crea actividades genericas de tipo `phase_transition`
- El boton "Completar Fase" se oculta cuando la orden tiene phase_role activities; visible para ordenes legacy

## User Stories

### US-FEAT.1: Schema y propagacion de phase_role

**Como** desarrollador del sistema
**quiero** campos `phase_role` y `order_phase_id` en el modelo de datos
**para** que las actividades programadas tengan relacion directa con fases y roles de transicion

#### Criterios de Aceptacion
- [ ] Campo `phase_role: v.optional(v.literal("entry"), v.literal("exit"))` agregado a `template_activities`
- [ ] Campos `phase_role` y `order_phase_id: v.optional(v.id("order_phases"))` agregados a `scheduled_activities`
- [ ] Index `by_phase_role` en `scheduled_activities`: `["order_phase_id", "phase_role"]`
- [ ] Al crear orden desde template (`productionOrders.create`), cada `scheduled_activity` recibe:
  - `order_phase_id`: el `_id` de la `order_phase` correspondiente
  - `phase_role`: propagado desde `template_activities.phase_role`
- [ ] Al activar orden (`productionOrders.activate`), `order_phase_id` y `phase_role` se preservan en el re-link
- [ ] Actividades creadas manualmente via `scheduledActivities.createForOrder` aceptan `phaseId` y `phaseRole` opcionales
- [ ] `npx convex codegen` ejecutado despues de cambios de schema
- [ ] `npx next build` pasa sin errores

#### Backend
- Schema changes: `template_activities.phase_role`, `scheduled_activities.phase_role`, `scheduled_activities.order_phase_id`
- Mutations modificadas: `productionOrders.create`, `productionOrders.activate`, `scheduledActivities.createForOrder`

#### Dependencias
- Ninguna (primera US)

---

### US-FEAT.2: Auto-crear actividades entry/exit cuando template no las define

**Como** sistema
**quiero** garantizar que cada fase tenga al menos una actividad de entrada y una de salida
**para** que el flujo de transicion funcione incluso con templates simples

#### Criterios de Aceptacion
- [ ] Al crear orden desde template: despues de generar scheduled_activities, verificar por cada fase:
  - Si no existe actividad con `phase_role: "entry"` → crear una generica:
    - `activity_type`: codigo del type `phase_transition` (query por `code: "phase_transition"`)
    - `phase_role: "entry"`
    - `scheduled_date`: `phase.planned_start_date`
    - `activity_name`: "Inicio: {phase_name}" (ej: "Inicio: Vegetativo")
    - `source: "auto"`
  - Si no existe actividad con `phase_role: "exit"` → crear una generica:
    - `activity_type`: codigo del type `phase_transition`
    - `phase_role: "exit"`
    - `scheduled_date`: `phase.planned_end_date - 1 DAY`
    - `activity_name`: "Cierre: {phase_name}" (ej: "Cierre: Vegetativo")
    - `source: "auto"`
- [ ] Actividades auto-creadas incluyen `company_id`, `order_phase_id`, `production_order_id`
- [ ] Al crear orden SIN template (fases manuales): tambien auto-crear entry/exit por cada fase
- [ ] Las actividades auto-creadas no tienen recursos (solo las definidas en template los tienen)
- [ ] Si el activity type `phase_transition` no existe para la company, se busca o crea usando defaults de `lib/constants/activity-types.ts`

#### Backend
- Mutation modificada: `productionOrders.create` (despues del loop de scheduled_activities)
- Helper nuevo: `ensurePhaseRoleActivities(ctx, orderId, phases, companyId)`
- Query usada: `activityTypes` por `code: "phase_transition"` y `company_id`

#### Dependencias
- Requiere: US-FEAT.1

---

### US-FEAT.3: Exit activity ejecutada → completar fase y avanzar

**Como** operador de produccion
**quiero** que al reportar la actividad de salida de una fase, el sistema automaticamente complete la fase y active la siguiente
**para** que las transiciones de fase sean consistentes y trazables

#### Criterios de Aceptacion
- [x] En `executeActivity`: despues de crear el activity record, verificar si `scheduledActivity.phase_role === "exit"`
- [x] Si es exit:
  - Obtener `order_phase_id` de la scheduled_activity
  - Verificar que la fase esta `in_progress`
  - Marcar fase como `completed` con `actual_end_date`
  - Buscar siguiente fase por `phase_order`
  - Si existe siguiente fase:
    - Marcar como `awaiting_entry` (si tiene entry activity) o `in_progress` (si no)
    - Actualizar `order.current_phase_id`
    - Setear `area_id` heredando de fase completada (fallback: `order.target_area_id`)
  - Si NO existe siguiente fase:
    - Marcar orden como `completed`, `completion_percentage: 100`, `actual_completion_date`
  - Actualizar `batch.current_phase` en todos los lotes activos de la orden
  - Calcular y actualizar `order.completion_percentage`
- [x] Retornar `phaseCompleted: true` y `nextPhaseName` en el resultado de `executeActivity`
- [x] Si la fase ya esta completada (idempotencia), no hacer nada adicional
- [x] Multi-batch: si la exit activity aplica a multiples lotes del mismo order, la fase se completa una sola vez
- [ ] Validacion: exit activity solo ejecutable si fase esta `in_progress` (no `awaiting_entry` ni `completed`) — deferred to US-FEAT.4
- [ ] Validacion: actividades regulares solo ejecutables si su fase esta `in_progress` (no `awaiting_entry`) — deferred to US-FEAT.4
- [ ] Toast en frontend: "Actividad completada. Fase '{name}' finalizada, avanzando a '{nextName}'" — deferred to US-FEAT.7

#### Backend
- Mutation modificada: `activities.executeActivity` (agregar logica post-creation)
- Helper nuevo: `handlePhaseExitExecution(ctx, { scheduledActivity, batchIds, performedBy })`
- Reutiliza logica de `productionOrders.completePhase` (area_id inheritance, batch.current_phase update)
- `completePhase` mantiene guard: si fase tiene exit activity pendiente, logea warning pero permite (admin override)

#### Frontend
- `hooks/use-activity-execution.ts`: manejar `phaseCompleted` en response, mostrar toast especial
- `components/production/report-activity-wizard.tsx`: mostrar mensaje de transicion de fase al completar

#### Dependencias
- Requiere: US-FEAT.1

---

### US-FEAT.4: Entry activity bloquea inicio de fase

**Como** operador de produccion
**quiero** que la fase no se considere "iniciada" hasta que ejecute la actividad de entrada
**para** tener un punto de control claro al iniciar cada fase

#### Criterios de Aceptacion
- [x] Nuevo status intermedio para fases: `awaiting_entry` (entre `pending` y `in_progress`)
- [x] Al activar orden: primera fase se marca como `awaiting_entry` si tiene entry activity (backward compat: `in_progress` si no tiene)
- [x] Al completar exit activity y avanzar (US-FEAT.3): siguiente fase se marca `awaiting_entry` si tiene entry activity
- [x] En `executeActivity`: si `scheduledActivity.phase_role === "entry"`:
  - Verificar que la fase esta `awaiting_entry`
  - Cambiar fase a `in_progress` con `actual_start_date`
  - Retornar `phaseStarted: true` en response
- [x] Frontend: fases `awaiting_entry` muestran badge "Esperando Inicio" (amber)
- [ ] Phase card en order detail: si `awaiting_entry`, mostrar link directo a la entry activity — deferred to US-FEAT.7
- [x] La actividad de entrada debe poder ejecutarse desde el detalle de la actividad (Reportar button) o desde el calendario
- [x] Si no hay entry activity para una fase (backward compat), activate sets `in_progress` directly
- [x] Phase gate validation: non-entry activities blocked when phase is `awaiting_entry`
- [x] `completePhase` allows `awaiting_entry` phases (admin override)

#### Backend
- Schema: agregar `"awaiting_entry"` como valor valido de `order_phases.status`
- Mutations modificadas: `productionOrders.activate`, `handlePhaseExitExecution` (de US-FEAT.3)
- Mutation modificada: `activities.executeActivity` (detectar entry role)

#### Frontend
- `app/(dashboard)/production/orders/[id]/page.tsx`: badge y UX para `awaiting_entry`
- Constantes: `PHASE_STATUS_COLORS`, `PHASE_STATUS_LABELS` agregar `awaiting_entry`

#### Dependencias
- Requiere: US-FEAT.3

---

### US-FEAT.5: Recursos "produced" crean inventory_items

**Como** sistema
**quiero** que recursos con `direction: "produced"` en la ejecucion de actividades creen nuevos `inventory_items`
**para** que las transformaciones de plantas (y otros productos) se registren en inventario automaticamente

#### Criterios de Aceptacion
- [ ] Extraer logica de transformacion de `logPhaseTransitionWithInventory()` (activities.ts:2031-2167) a helper interno `handleInventoryTransformation(ctx, params)`
- [ ] `logPhaseTransitionWithInventory()` se refactoriza para llamar al helper (backward compat, misma firma)
- [ ] En `executeActivity`, al procesar recursos con `direction: "produced"`, llamar `handleInventoryTransformation`:
  - Crear nuevo `inventory_items` record:
    - `product_id`: del recurso producido
    - `quantity_available`: cantidad producida
    - `quantity_original`: cantidad producida
    - `source_type: "production"`
    - `source_batch_id`: el batch de la actividad
    - `facility_id`, `area_id`: del batch actual
    - `company_id`: del batch
    - `transformation_status: "active"`
    - `received_date`: now
    - `status: "available"`
  - Crear `activity_resources` record con `direction: "produced"` y `inventory_item_id` del item creado
- [ ] Si recurso consumido tiene `inventory_item_id` (item especifico):
  - Marcar source item como `transformation_status: "transformed"`
  - Setear `transformed_to_item_id` al nuevo item
- [ ] Actualizar `batch.current_quantity` con la cantidad producida (si el producto es de tipo planta)
- [ ] Actualizar `batch.lost_quantity` con la diferencia (consumed - produced)
- [ ] Actualizar `plants.plant_stage` si `batch.enable_individual_tracking === true` (logica ya en helper)
- [ ] Template resources con `direction: "produced"` aparecen en el wizard de reporte en seccion separada "Productos resultantes"
- [ ] La cantidad producida es editable (el operador puede ajustar segun merma real)
- [ ] Crear `inventory_transaction` de tipo `transformation` para audit trail

#### Backend
- Refactor: extraer `handleInventoryTransformation()` de `logPhaseTransitionWithInventory()`
- Mutation modificada: `activities.executeActivity` (extension del loop de recursos, llama al helper)
- Mutation refactorizada: `activities.logPhaseTransitionWithInventory` (wrapper del helper)
- Tablas afectadas: `inventory_items` (insert), `activity_resources` (insert), `inventory_transactions` (insert), `batches` (patch quantity), `plants` (patch plant_stage)

#### Frontend
- `components/production/report-step-resources.tsx`: seccion visual separada para recursos "produced"
- `components/activities/resource-editor-inline.tsx`: soporte para direction "produced"

#### Dependencias
- Requiere: US-FEAT.1 (para que exit activities tengan recursos de produccion)
- Relacionado: M19-Inventory (inventory_items, inventory_transactions)

---

### US-FEAT.6: Template editor — marcar actividades como entry/exit

**Como** administrador
**quiero** marcar actividades del template como "entrada" o "salida" de fase
**para** definir el flujo de transiciones en mis templates de produccion

#### Criterios de Aceptacion
- [x] En la vista de detalle de fase del template (`/templates/[id]/phases/[phaseId]`):
  - Cada activity card muestra un badge de phase_role si es entry o exit
  - Badge entry: "Entrada" (green), badge exit: "Salida" (amber)
- [x] Al crear una template activity:
  - Selector de `phase_role`: "Regular" (default), "Entrada a fase", "Salida de fase"
  - Maximo 1 entry y 1 exit por fase (validacion backend: error si ya existe)
- [x] Mutation `templateActivities.update` acepta `phaseRole` opcional (incluyendo "none" para remover)
- [x] Mutation `templateActivities.create` acepta `phaseRole` opcional
- [x] Mutation `templateActivities.createFromActivityTemplate` acepta `phaseRole` opcional
- [ ] Si se marca una actividad como exit, y tiene `triggers_transformation: true`, sugerir agregar recursos con `direction: "produced"` — deferred
- [ ] Al eliminar la unica exit activity de una fase, mostrar warning — deferred

#### Backend
- Mutations modificadas: `templateActivities.create`, `templateActivities.update`
- Validacion: max 1 entry, max 1 exit por fase

#### Frontend
- `components/templates/phase-detail-view.tsx`: badges de phase_role
- `components/templates/activity-form.tsx` (o similar): selector de phase_role
- Dialog de edicion/creacion de template activity

#### Dependencias
- Requiere: US-FEAT.1 (schema)
- Relacionado: M22-production-templates

---

### US-FEAT.7: Frontend — UX de transiciones en produccion

**Como** operador de produccion
**quiero** ver claramente cuales actividades son de entrada/salida en el calendario y detalle de orden
**para** entender el flujo y saber que ejecutar para avanzar de fase

#### Criterios de Aceptacion
- [x] Calendario de produccion (`/production` tab actividades):
  - Activities con phase_role muestran badge compacto: "E" (green) o "S" (amber)
- [x] Detalle de orden (`/production/orders/[id]`):
  - Ocultar boton "Completar Fase" si la orden tiene phase_role activities; mantener visible para ordenes legacy sin phase_role
  - Phase cards muestran amber border/bg para `awaiting_entry` status
  - `getById` query now includes `phase_role` and `order_phase_id` in activity data
- [x] Detalle de actividad (`/production/activities/[id]`):
  - Si activity tiene `phase_role`, mostrar badge "Entrada"/"Salida" en info grid
  - Context banner: exit warns about auto-completion, entry informs about phase start
- [x] Report Activity Wizard:
  - Context banner for entry/exit at top of wizard
  - Toast especial al completar entry: "Fase iniciada"
  - Toast especial al completar exit: "Fase completada"

#### Frontend
- `components/production/calendar-activity-pill.tsx`: badge de phase_role
- `app/(dashboard)/production/orders/[id]/page.tsx`: eliminar boton "Completar", agregar indicadores
- `components/production/activity-detail-page.tsx`: badge y warning
- `components/production/report-activity-wizard.tsx`: paso de confirmacion
- Constantes: `PHASE_STATUS_COLORS` y `PHASE_STATUS_LABELS` para `awaiting_entry`

#### Dependencias
- Requiere: US-FEAT.3, US-FEAT.4

---

### US-FEAT.8: Documentacion

**Como** desarrollador
**quiero** documentacion actualizada del sistema de transicion de fases
**para** mantener consistencia entre docs y codigo

#### Criterios de Aceptacion
- [x] `docs/modules/phase-4/M24-production-orders.md`: actualizar "Limitaciones Conocidas" marcando las resueltas, agregar seccion "Sistema de Phase Roles"
- [ ] `docs/pages/production/subpaginas.md`: actualizar detalle de orden — deferred (minor doc update)
- [ ] `docs/pages/production/tab-actividades.md`: documentar badges de phase_role en calendario — deferred (minor doc update)
- [x] `docs/dev/logs/YYYY-MM-DD.md`: entry por cada commit
- [x] Daily log actualizado

#### Dependencias
- Requiere: US-FEAT.7

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `template_activities` | `phase_role` | `v.optional(v.string())` | "entry" \| "exit" \| undefined (regular) |
| `scheduled_activities` | `phase_role` | `v.optional(v.string())` | Propagado desde template o "auto" creado |
| `scheduled_activities` | `order_phase_id` | `v.optional(v.id("order_phases"))` | Link directo a la fase (antes solo implicito por fecha) |
| `order_phases` | `status` | Agregar valor | Nuevo status: `"awaiting_entry"` entre pending e in_progress |

Indexes nuevos:
- `scheduled_activities.by_phase_role`: `["order_phase_id", "phase_role"]`

## Consideraciones Tecnicas

### Arquitectura

El sistema se basa en tres principios:

1. **Actividades como fuente de verdad:** Las transiciones de fase son side-effects de ejecutar actividades, no operaciones manuales separadas.

2. **Recursos unificados:** La transformacion de plantas (ej: planta vegetativa → planta en floracion) se modela como recursos con `direction: "produced"` en la misma pipeline que fertilizantes y suministros. No hay logica especial — `executeActivity` procesa consumed, applied, y produced uniformemente.

3. **Template-driven con fallback:** Templates pueden definir entry/exit explicitos. Si no lo hacen, el sistema auto-crea actividades genericas de tipo `phase_transition`. Ordenes existentes sin phase_role funcionan sin cambios.

### Flujo de ejecucion post-feature

```
Crear orden → scheduled_activities con phase_role + order_phase_id
  → Activar → primera fase "awaiting_entry"
    → Ejecutar entry activity → fase "in_progress"
      → Ejecutar actividades regulares
        → Ejecutar exit activity:
          → direction:"consumed" reduce inventory (plantas actuales)
          → direction:"produced" crea inventory (plantas en nueva fase)
          → batch.current_phase actualizado
          → fase actual "completed"
          → siguiente fase "awaiting_entry"
            → [ciclo se repite]
```

### Riesgos

| Riesgo | Impacto | Mitigacion |
|--------|---------|-----------|
| Breaking ordenes existentes | ALTO | `phase_role` es `v.optional()`, logica solo se activa si campo existe. `completePhase` se mantiene como fallback |
| executeActivity se vuelve complejo | MEDIO | Extraer a helpers: `handlePhaseExitExecution`, `handlePhaseEntryExecution`, `handleInventoryTransformation` |
| Entry activity bloquea progreso | MEDIO | Backward compat: si fase no tiene entry, `awaiting_entry` se trata como `in_progress` |
| Duplicacion de logica con `logPhaseTransitionWithInventory` | MEDIO | Extraer helper compartido, refactorizar mutation existente como wrapper |
| Performance en create con muchas fases | BAJO | Auto-create agrega max 2 activities por fase, operacion infrecuente |

### Performance

- `ensurePhaseRoleActivities` agrega maximo 2N inserts (N = numero de fases) durante `create` — operacion infrecuente
- Index `by_phase_role` permite lookup O(1) para encontrar exit activity de una fase
- `executeActivity` agrega 1-2 queries adicionales solo cuando `phase_role` existe en la scheduled_activity

## Out of Scope

Planificado en features separadas:

- **Cancelacion de scheduled_activities:** → `FEAT-2026-02-scheduled-activity-lifecycle` US-LIFE.1
- **Rollback de transicion de fase:** → `FEAT-2026-02-scheduled-activity-lifecycle` US-LIFE.2
- **Historial de transiciones de fase:** → `FEAT-2026-02-scheduled-activity-lifecycle` US-LIFE.3
- **Distribucion multi-lote de actividades:** → `FEAT-2026-02-multi-batch-distribution` US-DIST.1
- **Re-asignacion de area por fase via UI:** → `FEAT-2026-02-multi-batch-distribution` US-DIST.2

Baja prioridad (planificado):

- **Validacion de checklist/criterios de completitud:** → `FEAT-2026-02-phase-completion-criteria` US-CRIT.1, US-CRIT.2
- **Drag & drop de actividades entre fases:** → `FEAT-2026-02-phase-completion-criteria` US-CRIT.3

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits
-

### Archivos Modificados
-

### Fecha de Completado
-
