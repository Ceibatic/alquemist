# FEAT-2026-02-activity-system-p2

## Metadata
- **Creado:** 2026-02-10
- **Prioridad:** high
- **Modulo relacionado:** activities, templates, scheduling
- **Tipo:** enhancement
- **Parte de:** Activity System Overhaul (P2 de 3)
- **Requiere:** FEAT-2026-02-activity-system-p1 (completado)

## Descripcion

Evolucion del sistema de templates de actividad y programacion de cultivo. Reemplaza el modelo actual de `template_activities` (actividades dentro de fases de templates de produccion) con un sistema de templates independientes (`activity_templates`) que definen recursos escalables, checklists verificables, frecuencia de ejecucion y dependencias. Introduce `cultivation_schedules` como plan maestro por batch que genera automaticamente `scheduled_activities` desde templates aplicables.

El flujo de 3 capas es: **template** (define QUE hacer) → **scheduled_activity** (define CUANDO hacerlo) → **activity** (registra QUE SE HIZO). El template pre-llena el formulario pero el operador siempre puede ajustar valores reales. Los modelos de referencia estan en `docs/data-model-references/activity-templates.jsx`.

Complementa (no reemplaza) `production_orders` — el schedule es el plan de actividades, la orden es el aspecto administrativo/logistico.

## User Stories

### US-TMPL.1: Schema activity_templates + activity_template_resources + CRUD backend

**Como** agronomo/administrador
**quiero** crear templates reutilizables de actividades con recursos pre-definidos y cantidades escalables
**para** estandarizar las operaciones de cultivo y pre-llenar formularios al ejecutar actividades

#### Criterios de Aceptacion
- [x] Tabla `activity_templates` en schema.ts con campos:
  - Clasificacion: `company_id`, `type_id` (FK activity_types de P1), `name`, `code` (unico por empresa), `description`
  - Aplicabilidad: `crop_type_ids` (array FK crop_types), `applicable_phases` (array de strings crop_phase), `phase_day_start` (opcional int), `phase_day_end` (opcional int)
  - Tiempo: `estimated_duration_minutes` (opcional), `labor_hours_per_1000_plants` (opcional)
  - Recurrencia: `frequency_type` (once/daily/weekly/biweekly/monthly/on_demand/custom_days), `frequency_interval_days` (opcional), `repeat_count` (opcional)
  - Metadata: `default_metadata` (opcional any — datos pre-llenados para activity.activity_metadata), `default_priority` (routine/urgent/critical)
  - Condiciones: `requires_conditions` (opcional any — condiciones ambientales requeridas), `depends_on_template_id` (opcional FK self), `min_days_after_dependency` (opcional)
  - Normativo: `regulatory_reference` (opcional string — SOP, norma), `requires_verification` (boolean)
  - Estado: `sort_order`, `is_active` (boolean), `version` (number, default 1), `created_at`, `updated_at`
- [x] Indexes: by_company, by_type_id, by_active
- [x] Tabla `activity_template_resources` en schema.ts con campos:
  - `template_id` (FK activity_templates), `product_id` (FK products)
  - Cantidad: `quantity` (number), `unit_id` (opcional FK units_of_measure), `quantity_basis` (fixed/per_plant/per_m2/per_zone/per_L_solution)
  - Aplicacion: `direction` (consumed/applied/produced), `application_rate` (opcional string), `application_method` (opcional string)
  - Sustitutos: `is_required` (boolean), `alternative_product_ids` (opcional array FK products)
  - Orden: `sequence` (number), `notes` (opcional string), `created_at`
- [x] Index: by_template
- [x] CRUD backend en `convex/activityTemplates.ts`:
  - Queries: `list(companyId, typeId?, cropTypeId?, phase?, isActive?)`, `getById(templateId)`, `getByCode(companyId, code)`
  - Mutations: `create(...)`, `update(templateId, fields)`, `archive(templateId)` (set is_active=false), `duplicate(templateId)` (copia con version+1 y nombre "(Copia)")
  - `addResource(templateId, resource)`, `updateResource(resourceId, fields)`, `removeResource(resourceId)`, `reorderResources(templateId, resourceIds[])`
- [x] Al crear template, valida que type_id exista en activity_types
- [x] Al crear template, valida que code sea unico por empresa
- [x] quantity_basis escala automaticamente en la UI (ej: per_plant con 42 plantas = qty * 42)
- [x] `npx next build` pasa

#### Backend
- Tablas nuevas: `activity_templates`, `activity_template_resources`
- Archivo nuevo: `convex/activityTemplates.ts`

#### Dependencias
- Requiere: P1 US-ACT.1 (tabla activity_types)

---

### US-TMPL.2: Schema activity_template_checklist + CRUD backend

**Como** agronomo
**quiero** definir checklists de verificacion en cada template
**para** estandarizar los pasos de ejecucion y asegurar cumplimiento de SOPs

#### Criterios de Aceptacion
- [x] Tabla `activity_template_checklist` en schema.ts con campos:
  - `template_id` (FK activity_templates), `step_number` (int, orden)
  - `title` (string — ej: "Verificar pH de la mezcla"), `description` (opcional string — instruccion detallada)
  - `is_required` (boolean — si es obligatorio para completar la actividad)
  - `requires_photo` (boolean — debe adjuntar foto de este paso)
  - `requires_value` (boolean — debe ingresar un valor)
  - `value_type` (opcional: text/number/boolean/select)
  - `value_options` (opcional array string — para select: ["Aprobado","Rechazado","Pendiente"])
  - `value_min`, `value_max` (opcionales number — rango valido para number)
  - `created_at`
- [x] Index: by_template
- [x] CRUD en `convex/activityTemplates.ts`:
  - `addChecklistItem(templateId, item)`, `updateChecklistItem(itemId, fields)`, `removeChecklistItem(itemId)`, `reorderChecklist(templateId, itemIds[])`
  - Query: `getChecklist(templateId)` — retorna items ordenados por step_number
- [x] Al agregar item, auto-asigna step_number al final (max + 1)
- [x] `npx next build` pasa

#### Backend
- Tabla nueva: `activity_template_checklist`
- Archivo: `convex/activityTemplates.ts` (agregar mutations/queries)

#### Dependencias
- Requiere: US-TMPL.1

---

### US-TMPL.3: UI gestion de activity templates

**Como** agronomo
**quiero** una interfaz para crear y editar templates de actividades con recursos y checklists
**para** disenar las operaciones estandar de cultivo de forma visual

#### Criterios de Aceptacion
- [x] Pagina listado: `app/(dashboard)/activity-templates/page.tsx`
  - Filtros: por categoria (tabs o dropdown), por crop_type, por fase, activo/archivado
  - Cards de template mostrando: nombre, code, tipo (con icono/color de activity_type), fases aplicables (badges), frecuencia, cantidad de recursos, cantidad de checklist items
  - Boton "Crear template" abre pagina de creacion
- [x] Pagina crear/editar: `app/(dashboard)/activity-templates/[id]/page.tsx`
  - Seccion principal: nombre, code (auto-generado editable), descripcion, tipo (selector de activity_types), prioridad default
  - Seccion aplicabilidad: crop_types (multi-select), fases (multi-select checkbox), rango de dias (phase_day_start — phase_day_end)
  - Seccion tiempo: duracion estimada (minutos), labor por 1000 plantas (horas)
  - Seccion recurrencia: frequency_type (selector), intervalo custom (si aplica), repeat_count
  - Seccion condiciones: depends_on_template (selector), min_days_after, referencia regulatoria
  - Seccion recursos: tabla editable con columnas [producto, cantidad, unidad, base de calculo, direccion, metodo, requerido, alternativas]. Boton agregar recurso. Drag-and-drop reorder.
  - Seccion checklist: lista editable con [orden, titulo, descripcion, requerido, requiere foto, requiere valor, tipo valor]. Boton agregar paso. Drag-and-drop reorder.
  - Preview: card lateral mostrando como se vera el template al ejecutarlo (recursos calculados para N plantas/m2)
  - Guardar: valida campos requeridos, muestra toast "Template guardado"
- [x] Duplicar template: boton en listado que crea copia con "(Copia)" en nombre
- [x] Archivar/restaurar toggle
- [x] Loading/empty states en todas las vistas
- [x] `npx next build` pasa

#### Frontend
- Paginas: `app/(dashboard)/activity-templates/page.tsx`, `app/(dashboard)/activity-templates/[id]/page.tsx`
- Componentes: `components/activity-templates/template-card.tsx`, `components/activity-templates/template-form.tsx`, `components/activity-templates/resource-editor.tsx`, `components/activity-templates/checklist-editor.tsx`

#### Dependencias
- Requiere: US-TMPL.1, US-TMPL.2

---

### US-TMPL.4: Schema cultivation_schedules + core backend

**Como** agronomo
**quiero** crear un plan maestro de cultivo para un batch que defina las fases y sus duraciones
**para** generar automaticamente el calendario de actividades programadas

#### Criterios de Aceptacion
- [x] Tabla `cultivation_schedules` en schema.ts con campos:
  - `company_id` (FK companies), `batch_id` (FK batches), `crop_type_id` (FK crop_types)
  - `production_order_id` (opcional FK production_orders — complementa, no reemplaza)
  - `name` (string — ej: "Plan Gelato Indoor Ciclo Feb-2026")
  - `zone_id` (opcional FK areas)
  - Fechas: `planned_start_date` (number), `planned_end_date` (number, calculado)
  - Fases planificadas: `planned_phases` (array de objetos: {phase: string, duration_days: number, start_day: number, end_day: number})
  - Progreso: `total_activities` (number), `completed_activities` (number, default 0), `skipped_activities` (number, default 0)
  - Estado: `current_phase` (opcional string), `current_phase_day` (opcional number), `status` (draft/active/completed/cancelled)
  - `created_at`, `updated_at`
- [x] Indexes: by_company, by_batch_id, by_status
- [x] Backend `convex/cultivationSchedules.ts`:
  - Mutation `create(companyId, batchId, cropTypeId, name, plannedPhases[], plannedStartDate, zoneId?)` — crea schedule en status "draft"
  - Mutation `activate(scheduleId)` — cambia status a "active" (requiere que total_activities > 0)
  - Mutation `updateProgress(scheduleId)` — recalcula completed/skipped desde scheduled_activities vinculadas
  - Query `getByBatch(batchId)` — retorna el schedule activo del batch (o draft si no hay activo)
  - Query `list(companyId, status?)` — lista schedules con progreso
- [x] Al crear, calcula planned_end_date = planned_start_date + sum(phase.duration_days)
- [x] `npx next build` pasa

#### Backend
- Tabla nueva: `cultivation_schedules`
- Archivo nuevo: `convex/cultivationSchedules.ts`

#### Dependencias
- Requiere: US-TMPL.1 (activity_templates existentes)

---

### US-TMPL.5: Evolucionar scheduled_activities + auto-generacion desde templates

**Como** agronomo
**quiero** que al activar un plan de cultivo, se generen automaticamente las actividades programadas desde los templates aplicables
**para** tener un calendario completo de operaciones sin crearlas manualmente una por una

#### Criterios de Aceptacion
- [x] Campos nuevos agregados a `scheduled_activities` (todos v.optional):
  - `schedule_id` (FK cultivation_schedules)
  - `type_id` (FK activity_types — de P1)
  - `template_id` (FK activity_templates — reemplaza activity_template_id legacy)
  - `phase_day` (number — dia de la fase en que se ejecuta)
  - `due_date` (number — fecha limite si hay flexibilidad)
  - `recurrence_index` (number — posicion en serie: 1 de 14)
  - `recurrence_total` (number — total de repeticiones)
  - `company_id` (FK companies)
  - `crop_phase` (string)
  - `checklist_responses` (opcional any — respuestas del checklist al completar)
- [x] Nuevo index: by_schedule (schedule_id)
- [x] Mutation `generateFromSchedule(scheduleId)` en `convex/cultivationSchedules.ts`:
  1. Lee el schedule con sus planned_phases
  2. Busca activity_templates aplicables: WHERE company_id matches AND crop_type_ids includes schedule.crop_type_id AND applicable_phases intersects with scheduled phases AND is_active = true
  3. Para cada template × cada fase aplicable:
     - Calcula fechas segun frequency_type + phase_day_start/end + planned_start_date
     - Para frequency "daily" en rango dia 1-14: genera 14 scheduled_activities
     - Para frequency "once" en dia 21: genera 1 scheduled_activity
     - Para frequency "weekly": genera ceil(duration_days/7) activities
     - Respeta depends_on_template_id: si tiene dependencia, programa despues de la ultima instancia del template dependencia + min_days_after
  4. Inserta scheduled_activities con: schedule_id, template_id, type_id, entity_type="batch", entity_id=batchId, scheduled_date, crop_phase, phase_day, status="pending", recurrence_index/total
  5. Actualiza schedule.total_activities con el conteo
  6. Retorna: { generated: N, byPhase: {propagation: X, vegetative: Y, ...} }
- [x] Si se re-ejecuta, elimina scheduled_activities pendientes del schedule y regenera (no toca completed/skipped)
- [x] Mutation `skipScheduledActivity(scheduledId, reason)` — status → "skipped" con skipped_reason
- [x] Mutation `rescheduleActivity(scheduledId, newDate)` — actualiza scheduled_date
- [x] `npx next build` pasa

#### Backend
- Schema: Modificar `scheduled_activities` + mutations nuevas
- Archivo: `convex/cultivationSchedules.ts`

#### Dependencias
- Requiere: US-TMPL.4 (cultivation_schedules), US-TMPL.1 (activity_templates)

---

### US-TMPL.6: Ejecutar scheduled_activity con template pre-llenado

**Como** operador de cultivo
**quiero** que al ejecutar una actividad programada, el formulario se pre-llene con los datos del template
**para** solo ajustar los valores reales y completar rapidamente

#### Criterios de Aceptacion
- [x] Refactorizar `completeScheduledActivity()` en activities.ts para:
  - Cargar el template vinculado (si existe) con sus recursos y checklist
  - Pre-llenar la actividad con: type_id, category, default_metadata del template, title auto-generado
  - Aceptar `resources` override (el operador puede cambiar cantidades/productos)
  - Aceptar `checklist_responses` (array de {step_id, completed, value?, photo_url?})
  - Calcular recursos escalados si quantity_basis != "fixed": multiplicar por plant_count o area_m2 del batch/zone
  - Crear activity_resources rows (del P1) con los recursos reales usados
  - Si template.requires_verification: set status = "requires_review" en vez de "completed"
  - Guardar checklist_responses en scheduled_activity
- [x] Mutation alternativa: `executeScheduledAsNew(scheduledId, activityData)` — para cuando el operador cambia significativamente el plan (crea activity nueva, vincula a scheduled)
- [x] Si el operador no completa todos los items requeridos del checklist, la mutation rechaza con "Faltan items requeridos del checklist: [lista]"
- [x] Labor cost entry se sigue creando automaticamente (de P1)
- [x] `npx next build` pasa

#### Backend
- Mutation modificada: `activities.completeScheduledActivity`
- Mutation nueva: `activities.executeScheduledAsNew`
- Archivo: `convex/activities.ts`

#### Dependencias
- Requiere: US-TMPL.5 (scheduled_activities evolucionadas), P1 US-ACT.6 (logV2 y activity_resources)

---

### US-TMPL.7: UI plan de cultivo — timeline/calendario por batch

**Como** agronomo
**quiero** ver el plan de cultivo de un batch como un timeline visual con actividades programadas
**para** tener visibilidad del progreso, actividades pendientes, overdue y completadas

#### Criterios de Aceptacion
- [x] Componente `CultivationTimeline` embebido en la pagina de detalle del batch (nueva tab "Plan de Cultivo")
  - Header: nombre del plan, barra de progreso (completed/total), fase actual + dia actual
  - Vista por fases: cada fase como seccion con fecha inicio-fin, duracion, y lista de actividades
  - Cada actividad muestra: fecha programada, tipo (icono + nombre), status (badge: pending/completed/skipped/overdue), asignado a (avatar), recursos resumidos
  - Actividades overdue (scheduled_date < hoy && status=pending) destacadas en rojo
  - Click en actividad abre modal de ejecucion (pre-llenado con template, recursos calculados, checklist)
  - Boton "Generar plan" visible si el batch no tiene schedule: abre dialog para configurar fases y duraciones → genera schedule + scheduled_activities
- [x] Vista alternativa: calendario mensual con dots por dia mostrando actividades programadas
- [x] Filtros: por fase, por status, por tipo de actividad
- [x] Stats en header: total actividades, completadas, pendientes hoy, overdue
- [x] Empty state: "Este batch no tiene plan de cultivo. Crea uno para programar actividades automaticamente."
- [x] `npx next build` pasa

#### Frontend
- Componente: `components/cultivation/cultivation-timeline.tsx`
- Componente: `components/cultivation/scheduled-activity-card.tsx`
- Componente: `components/cultivation/schedule-creation-dialog.tsx`
- Componente: `components/cultivation/activity-execution-modal.tsx`
- Integrar en: `app/(dashboard)/batches/[id]/page.tsx` (nueva tab)

#### Dependencias
- Requiere: US-TMPL.5 (generacion), US-TMPL.6 (ejecucion)

---

### US-TMPL.8: Dashboard "Actividades de Hoy" cross-batch

**Como** operador/agronomo
**quiero** ver todas las actividades programadas para hoy (y overdue) de todos mis batches
**para** saber que debo hacer al llegar al trabajo sin navegar batch por batch

#### Criterios de Aceptacion
- [x] Pagina: `app/(dashboard)/scheduled-activities/page.tsx`
  - Seccion "Hoy" con actividades cuya scheduled_date es hoy, agrupadas por batch
  - Seccion "Atrasadas" (overdue) con actividades cuya scheduled_date < hoy y status=pending, ordenadas por antiguedad
  - Seccion "Proximos 7 dias" colapsable
  - Cada actividad muestra: batch nombre, zona, tipo (icono + nombre), hora sugerida, recursos resumidos, asignado a
  - Boton "Ejecutar" en cada actividad abre modal de ejecucion (misma US-TMPL.6)
  - Boton "Saltar" en cada actividad abre dialog para ingresar razon y marcar skipped
  - Counter en header: "X pendientes hoy · Y atrasadas · Z completadas hoy"
- [x] Query `getScheduledForDate(companyId, date, status?)` en cultivationSchedules.ts
  - Retorna scheduled_activities con joins a: template (nombre, recursos), batch (nombre, zona), activity_type (icono, color)
  - Ordena por scheduled_date ASC, priority DESC
- [x] Widget resumen en dashboard principal: card "Actividades pendientes" con count y link a esta pagina
- [x] `npx next build` pasa

#### Frontend
- Pagina: `app/(dashboard)/scheduled-activities/page.tsx`
- Componentes: `components/cultivation/today-activities-list.tsx`
- Widget: `components/dashboard/pending-activities-widget.tsx`

#### Backend
- Query: `api.cultivationSchedules.getScheduledForDate`

#### Dependencias
- Requiere: US-TMPL.7 (timeline y ejecucion ya funcionando)

---

## Schema Changes

### Nueva tabla: `activity_templates`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `v.id("companies")` | Empresa |
| `type_id` | `v.id("activity_types")` | Tipo de actividad (de P1) |
| `name` | `v.string()` | Nombre del template |
| `code` | `v.optional(v.string())` | Codigo unico por empresa |
| `description` | `v.optional(v.string())` | Instrucciones para el operador |
| `crop_type_ids` | `v.optional(v.array(v.id("crop_types")))` | Cultivos aplicables |
| `applicable_phases` | `v.array(v.string())` | Fases donde aplica |
| `phase_day_start` | `v.optional(v.number())` | Desde que dia de la fase |
| `phase_day_end` | `v.optional(v.number())` | Hasta que dia |
| `estimated_duration_minutes` | `v.optional(v.number())` | Duracion estimada |
| `labor_hours_per_1000_plants` | `v.optional(v.number())` | Benchmark de labor |
| `frequency_type` | `v.string()` | once/daily/weekly/biweekly/monthly/on_demand/custom_days |
| `frequency_interval_days` | `v.optional(v.number())` | Intervalo custom |
| `repeat_count` | `v.optional(v.number())` | Repeticiones (null = hasta fin de fase) |
| `default_metadata` | `v.optional(v.any())` | Datos pre-llenados |
| `default_priority` | `v.optional(v.string())` | routine/urgent/critical |
| `requires_conditions` | `v.optional(v.any())` | Condiciones ambientales |
| `depends_on_template_id` | `v.optional(v.id("activity_templates"))` | Dependencia |
| `min_days_after_dependency` | `v.optional(v.number())` | Dias minimos despues |
| `regulatory_reference` | `v.optional(v.string())` | SOP/norma |
| `requires_verification` | `v.boolean()` | Requiere verificacion |
| `sort_order` | `v.number()` | Orden display |
| `is_active` | `v.boolean()` | Activo/archivado |
| `version` | `v.number()` | Versionamiento |
| `created_at` | `v.number()` | Timestamp |
| `updated_at` | `v.number()` | Timestamp |

### Nueva tabla: `activity_template_resources`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `template_id` | `v.id("activity_templates")` | Template padre |
| `product_id` | `v.id("products")` | Producto/recurso |
| `quantity` | `v.number()` | Cantidad base |
| `unit_id` | `v.optional(v.id("units_of_measure"))` | Unidad |
| `quantity_basis` | `v.string()` | fixed/per_plant/per_m2/per_zone/per_L_solution |
| `direction` | `v.string()` | consumed/applied/produced |
| `application_rate` | `v.optional(v.string())` | "2mL/L", "5g/m2" |
| `application_method` | `v.optional(v.string())` | foliar/drench/broadcast |
| `is_required` | `v.boolean()` | Requerido u opcional |
| `alternative_product_ids` | `v.optional(v.array(v.id("products")))` | Sustitutos |
| `sequence` | `v.number()` | Orden de aplicacion |
| `notes` | `v.optional(v.string())` | Instrucciones especificas |
| `created_at` | `v.number()` | Timestamp |

### Nueva tabla: `activity_template_checklist`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `template_id` | `v.id("activity_templates")` | Template padre |
| `step_number` | `v.number()` | Orden del paso |
| `title` | `v.string()` | Titulo del paso |
| `description` | `v.optional(v.string())` | Instruccion detallada |
| `is_required` | `v.boolean()` | Obligatorio para completar |
| `requires_photo` | `v.boolean()` | Requiere foto |
| `requires_value` | `v.boolean()` | Requiere ingresar valor |
| `value_type` | `v.optional(v.string())` | text/number/boolean/select |
| `value_options` | `v.optional(v.array(v.string()))` | Opciones para select |
| `value_min` | `v.optional(v.number())` | Minimo para number |
| `value_max` | `v.optional(v.number())` | Maximo para number |
| `created_at` | `v.number()` | Timestamp |

### Nueva tabla: `cultivation_schedules`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `v.id("companies")` | Empresa |
| `batch_id` | `v.id("batches")` | Lote de cultivo |
| `crop_type_id` | `v.id("crop_types")` | Tipo de cultivo |
| `production_order_id` | `v.optional(v.id("production_orders"))` | Orden asociada |
| `name` | `v.string()` | Nombre del plan |
| `zone_id` | `v.optional(v.id("areas"))` | Zona |
| `planned_start_date` | `v.number()` | Fecha inicio |
| `planned_end_date` | `v.number()` | Fecha fin calculada |
| `planned_phases` | `v.array(v.any())` | Array de {phase, duration_days, start_day, end_day} |
| `total_activities` | `v.number()` | Total programadas |
| `completed_activities` | `v.number()` | Completadas |
| `skipped_activities` | `v.number()` | Saltadas |
| `current_phase` | `v.optional(v.string())` | Fase actual |
| `current_phase_day` | `v.optional(v.number())` | Dia de la fase |
| `status` | `v.string()` | draft/active/completed/cancelled |
| `created_at` | `v.number()` | Timestamp |
| `updated_at` | `v.number()` | Timestamp |

### Campos nuevos en `scheduled_activities`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `schedule_id` | `v.optional(v.id("cultivation_schedules"))` | Plan maestro |
| `type_id` | `v.optional(v.id("activity_types"))` | Tipo (de P1) |
| `template_id` | `v.optional(v.id("activity_templates"))` | Template origen |
| `phase_day` | `v.optional(v.number())` | Dia de la fase |
| `due_date` | `v.optional(v.number())` | Fecha limite |
| `recurrence_index` | `v.optional(v.number())` | Posicion en serie |
| `recurrence_total` | `v.optional(v.number())` | Total de serie |
| `company_id` | `v.optional(v.id("companies"))` | Empresa |
| `crop_phase` | `v.optional(v.string())` | Fase del cultivo |
| `checklist_responses` | `v.optional(v.any())` | Respuestas del checklist |

## Consideraciones Tecnicas

- **Arquitectura:** cultivation_schedules COMPLEMENTA production_orders. Un batch puede tener ambos: la orden maneja el aspecto administrativo, el schedule maneja el plan operativo de actividades.
- **Versionamiento:** Al editar un template que ya tiene scheduled_activities, las existentes mantienen la version original. Nuevas generaciones usan la version actualizada.
- **Escalado de cantidades:** quantity_basis determina como se multiplica: per_plant × batch.current_quantity, per_m2 × zone.area_m2, per_L_solution × volumen de solucion (input del operador).
- **Dependencias entre templates:** Se resuelven en tiempo de generacion. Si template B depende de template A con min_days=7, B se programa 7 dias despues de la ultima instancia de A en la misma fase.
- **Performance:** La generacion puede crear ~200 scheduled_activities para un ciclo completo. Convex puede manejar esto en una mutation, pero si excede limites, paginar la generacion.
- **Relacion con template_activities existente:** Coexisten durante la transicion. Eventualmente template_activities se depreca, pero no en esta fase.

## Out of Scope

- Validacion runtime de metadata_schema (se define pero no valida en P2)
- Formularios 100% dinamicos basados en metadata_schema (se pre-llenan datos pero el form es predefinido)
- Notificaciones push/email de actividades pendientes
- Vista Gantt interactiva (timeline simple es suficiente)
- Integracion con sensores IoT para auto-completar lecturas
- Migracion de template_activities existentes a activity_templates (se hace post-P2)
- Auto-generacion de schedule al crear batch (manual via boton)

---

## Implementacion

### Commits
- `cf5e523` — feat(templates): US-TMPL.1 + US-TMPL.2 schema + CRUD backend for activity templates
- `0fe0fbb` — feat(templates): US-TMPL.3 UI for activity template management
- `a870d8b` — feat(schedules): US-TMPL.4 cultivation_schedules table + core backend
- `bf833c3` — feat(schedules): US-TMPL.5 auto-generation of scheduled activities from templates
- `8d4ec4a` — feat(activities): US-TMPL.6 template-aware scheduled activity execution
- `10aea3a` — feat(cultivation): US-TMPL.7 cultivation timeline UI per batch
- `4c07f79` — feat(activities): US-TMPL.8 cross-batch scheduled activities page

### Archivos Modificados
- `convex/schema.ts` — 4 new tables (activity_templates, activity_template_resources, activity_template_checklist, cultivation_schedules) + scheduled_activities P2 fields
- `convex/activityTemplates.ts` — NEW ~550 lines, full CRUD for templates, resources, checklist
- `convex/cultivationSchedules.ts` — NEW ~700 lines, schedules CRUD + auto-generation + skip/reschedule
- `convex/activities.ts` — Extended with completeScheduledWithTemplate + executeScheduledAsNew (~380 lines)
- `app/(dashboard)/activity-templates/page.tsx` — NEW listing page
- `app/(dashboard)/activity-templates/[id]/page.tsx` — NEW create/edit page
- `components/activity-templates/activity-template-card.tsx` — NEW
- `components/activity-templates/activity-template-list.tsx` — NEW
- `components/activity-templates/resource-editor.tsx` — NEW
- `components/activity-templates/checklist-editor.tsx` — NEW
- `components/cultivation/cultivation-timeline.tsx` — NEW
- `components/cultivation/scheduled-activity-card.tsx` — NEW
- `components/cultivation/schedule-creation-dialog.tsx` — NEW
- `app/(dashboard)/batches/[id]/page.tsx` — Added "Plan de Cultivo" tab
- `app/(dashboard)/scheduled-activities/page.tsx` — NEW cross-batch activities page
- `components/layout/sidebar.tsx` — Added nav links for activity-templates and scheduled-activities

### Fecha de Completado
2026-02-10
