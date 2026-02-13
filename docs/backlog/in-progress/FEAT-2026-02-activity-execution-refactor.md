# FEAT-2026-02-activity-execution-refactor

## Metadata
- **Creado:** 2026-02-13
- **Prioridad:** high
- **Modulo relacionado:** activities, scheduled-activities, activity-templates
- **Tipo:** technical
- **Requiere:** FEAT-2026-02-unified-templates-activity-report (completado)

## Descripcion

Refactorizacion del sistema de actividades para establecer un flujo estandar **Template → Programar → Ejecutar** con tres mejoras principales: (1) soporte para actividades ad-hoc sin template, (2) programacion manual de actividades con soporte multi-batch desde ordenes de produccion, areas, fases y lotes, y (3) modernizacion del formulario de ejecucion (ActivityReportSheet de 881 lineas) a componentes modulares con React Hook Form + Zod.

El sistema actual tiene el report sheet acoplado obligatoriamente a un template (`activityTemplateId` requerido), no permite programar actividades individualmente (solo via `generateFromSchedule` en batch), no soporta multi-batch, y tiene dead code en el checklist de templates que nunca se renderiza en ejecucion. Esta refactorizacion unifica las tres mutations de ejecucion existentes (`completeScheduledActivity`, `completeScheduledWithTemplate`, `executeScheduledAsNew`) en una sola `executeActivity`, y crea entry points de programacion y ejecucion en las paginas de produccion, areas y actividades programadas.

### Flujo estandar nuevo

```
Template (opcional) ──→ Programar (opcional) ──→ Ejecutar
                                                    ↑
                                          3 entry points:
                                          1. Desde scheduled activity
                                          2. Desde template directo
                                          3. Ad-hoc (solo tipo)
```

### Diseno multi-batch

- **Programacion**: 1 row por batch en `scheduled_activities`, vinculadas por `group_id` (UUID compartido). Cada batch puede ser skipped/completado independientemente.
- **Ejecucion**: 1 parent activity (`entity_type: "multi_batch"`) + N child activities (1 por batch con `parent_activity_id`). `parent_activity_id` ya existe en schema.

## User Stories

### US-ACT3.1: Eliminar dead code del checklist de templates

**Como** desarrollador
**quiero** eliminar las mutations y componentes del checklist de activity templates que nunca se renderizan en ejecucion
**para** reducir el codigo muerto y evitar confusion sobre funcionalidad que parece existir pero no funciona

#### Criterios de Aceptacion
- [ ] Se eliminan 5 mutations de `convex/activityTemplates.ts`: `getChecklist`, `addChecklistItem`, `updateChecklistItem`, `removeChecklistItem`, `reorderChecklist`
- [ ] Se elimina el archivo `components/activity-templates/checklist-editor.tsx`
- [ ] Se elimina la seccion de checklist en `components/activity-templates/wizard-step-fields.tsx` (la referencia al toggle "checklist" en form_fields)
- [ ] Se elimina el conteo de checklist en `components/activity-templates/activity-template-card.tsx`
- [ ] La tabla `activity_template_checklist` en schema.ts se marca con comentario `// DEPRECATED — dead code, no se renderiza en ejecucion` pero NO se elimina (requiere migracion de datos)
- [ ] El wizard de templates funciona correctamente sin la seccion de checklist
- [ ] `npx next build` pasa sin errores

#### Backend
- Archivo: `convex/activityTemplates.ts` — eliminar 5 exports de checklist
- Schema: `convex/schema.ts` — agregar comentario DEPRECATED a `activity_template_checklist`

#### Frontend
- Eliminar: `components/activity-templates/checklist-editor.tsx`
- Modificar: `components/activity-templates/wizard-step-fields.tsx`
- Modificar: `components/activity-templates/activity-template-card.tsx`

#### Dependencias
- Ninguna — puede ejecutarse en paralelo con US-ACT3.2

---

### US-ACT3.2: Eliminar mutations backend sin consumidores

**Como** desarrollador
**quiero** eliminar las mutations de ejecucion de actividades que no tienen consumidores frontend
**para** reducir la superficie del backend y evitar confusion entre multiples caminos de ejecucion

#### Criterios de Aceptacion
- [ ] Se elimina `completeScheduledWithTemplate` de `convex/activities.ts` (~242 lineas, confirmado sin importaciones frontend)
- [ ] Se elimina `executeScheduledAsNew` de `convex/activities.ts` (~133 lineas, confirmado sin importaciones frontend)
- [ ] Ningun componente frontend importa estas mutations (verificado con grep)
- [ ] `npx next build` pasa sin errores

#### Backend
- Archivo: `convex/activities.ts` — eliminar 2 mutations (~375 lineas)

#### Dependencias
- Ninguna — puede ejecutarse en paralelo con US-ACT3.1

---

### US-ACT3.3: Adiciones al schema para multi-batch y fuente de programacion

**Como** desarrollador
**quiero** agregar campos `group_id` y `source` a `scheduled_activities` y un index `by_parent_activity` a `activities`
**para** soportar agrupacion multi-batch en programacion y rastreo de actividades hijo

#### Criterios de Aceptacion
- [ ] Campo `group_id: v.optional(v.string())` agregado a `scheduled_activities` — UUID compartido para agrupar actividades multi-batch
- [ ] Campo `source: v.optional(v.string())` agregado a `scheduled_activities` — valores: `"template"` | `"manual"` | `"adhoc"`
- [ ] Index `.index("by_group", ["group_id"])` agregado a `scheduled_activities`
- [ ] Index `.index("by_parent_activity", ["parent_activity_id"])` agregado a `activities`
- [ ] Todos los campos son `v.optional()` — backward compatible, no afecta datos existentes
- [ ] `npx convex codegen` genera tipos correctamente
- [ ] `npx next build` pasa sin errores

#### Backend
- Archivo: `convex/schema.ts` — 2 campos nuevos + 2 indexes nuevos

#### Dependencias
- Ninguna — puede ejecutarse en paralelo con US-ACT3.1 y US-ACT3.2

---

### US-ACT3.4: Mutation para programacion manual de actividades

**Como** operador o supervisor
**quiero** programar actividades manualmente para uno o multiples lotes
**para** planificar trabajo futuro sin depender exclusivamente de la generacion automatica desde cultivation schedules

#### Criterios de Aceptacion
- [ ] Nuevo archivo `convex/scheduledActivities.ts` con mutation `createManual`:
  - Args: `companyId`, `typeId`, `templateId?`, `batchIds: Id<"batches">[]` (1 o mas), `scheduledDate`, `estimatedDurationMinutes?`, `assignedTo?`, `instructions?`, `priority?`
  - Si `batchIds.length === 1`: crea 1 `scheduled_activity` con `source: "manual"`, sin `group_id`
  - Si `batchIds.length > 1`: genera UUID `group_id`, crea N rows (1 por batch) todas compartiendo `group_id` y `source: "manual"`
  - Si `templateId` proporcionado: copia nombre, duracion estimada e instrucciones del template
  - Valida que los batch IDs existen y pertenecen a la misma company
- [ ] Query `listByEntity(entityType, entityId, status?)` para buscar actividades programadas por entidad
- [ ] Query `getGroup(groupId)` para cargar todas las actividades de un grupo multi-batch
- [ ] `npx next build` pasa sin errores

#### Backend
- Archivo nuevo: `convex/scheduledActivities.ts`
- Mutation: `createManual` + queries `listByEntity`, `getGroup`

#### Dependencias
- Requiere: US-ACT3.3 (campos `group_id` y `source` en schema)

---

### US-ACT3.5: Mutation unificada de ejecucion de actividades

**Como** sistema
**quiero** una sola mutation `executeActivity` que maneje los tres flujos de ejecucion (template, scheduled, ad-hoc) y soporte multi-batch
**para** reemplazar las multiples mutations actuales con un unico punto de entrada consistente

#### Criterios de Aceptacion
- [ ] Nueva mutation `activities.executeActivity` en `convex/activities.ts` con args:
  - Contexto origen (al menos uno): `scheduledActivityId?`, `groupId?`
  - Para ad-hoc: `typeId?`, `batchIds?`, `entityType?`, `entityId?`
  - Datos de ejecucion: `performedBy`, `companyId?`, `facilityId?`, `cropPhase?`, `zoneId?`, `observations?`, `notes?`, `durationMinutes?`, `priority?`
  - Environmental: `envTemp?`, `envHumidity?`, `envPh?`, `envEc?`
  - Recursos: `resources?: [{ product_id, direction, quantity, quantity_unit, unit_id?, inventory_item_id?, application_rate?, application_method?, notes? }]`
  - Inventory: `consumeInventory?`
  - Multi-batch: `resourceDistribution?: "identical" | "split_proportional"`
- [ ] **Single batch**: crea 1 activity via logica existente de `logV2` (reutilizar, no duplicar)
- [ ] **Multi-batch**: crea 1 parent activity (`entity_type: "multi_batch"`) + N child activities (1 por batch con `parent_activity_id` apuntando al parent)
- [ ] Si `scheduledActivityId` proporcionado: marca esa scheduled_activity como `completed` con `completed_by`, `actual_end_time`
- [ ] Si `groupId` proporcionado: marca TODAS las scheduled_activities del grupo como `completed`
- [ ] Consumo de inventario delega a logica FIFO existente
- [ ] Distribucion `identical`: mismos recursos por cada child activity
- [ ] Distribucion `split_proportional`: cantidad total dividida entre N batches
- [ ] Retorna `{ activityId, childActivityIds? }` (activityId = parent si multi-batch, unico si single)
- [ ] `npx next build` pasa sin errores

#### Backend
- Archivo: `convex/activities.ts` — nueva mutation `executeActivity`
- Reutilizar: logica interna de `logV2` para crear activities + resources + FIFO

#### Dependencias
- Requiere: US-ACT3.3 (index `by_parent_activity`)

---

### US-ACT3.6: Zod schema y hook de ejecucion de actividad

**Como** desarrollador frontend
**quiero** un Zod schema y hook de React Hook Form para el formulario de ejecucion de actividades
**para** manejar validacion, pre-fill desde templates/scheduled, y submit de forma estandar

#### Criterios de Aceptacion
- [ ] Archivo `lib/schemas/activity-execution.ts` con Zod schema que valida:
  - `activityDate` (string, requerido), `responsibleId` (string, requerido), `typeId` (string, requerido para ad-hoc)
  - `batchIds` (array of strings, opcional), `areaId?`, `phase?`
  - `observations?`, `durationMinutes?` (number >= 0)
  - `envTemp?`, `envHumidity?` (0-100), `envPh?` (0-14), `envEc?` (>= 0)
  - `estimatedCost?`, `actualCost?` (>= 0)
  - `resources` (array of objects con productId, direction, quantity >= 0, quantityUnit)
  - `resourceDistribution` (enum: identical | split_proportional, default: identical)
- [ ] Hook `hooks/use-activity-execution.ts` que:
  - Inicializa `useForm` con `zodResolver(activityExecutionSchema)`
  - Acepta `templateId?` para pre-fill desde template (carga resources, form_fields, type)
  - Acepta `scheduledActivityId?` para pre-fill desde scheduled (carga batch, area, phase, template)
  - Modo ad-hoc: campos vacios, tipo seleccionable
  - Expone `visibleFields: string[]` derivados de `template.form_fields` o todos si ad-hoc
  - Maneja submit llamando a `api.activities.executeActivity`
- [ ] Pre-fill de `responsibleId` con usuario actual por defecto
- [ ] Pre-fill de `activityDate` con fecha de hoy por defecto
- [ ] `npx next build` pasa sin errores

#### Frontend
- Archivo nuevo: `lib/schemas/activity-execution.ts`
- Archivo nuevo: `hooks/use-activity-execution.ts`

#### Dependencias
- Requiere: US-ACT3.5 (mutation `executeActivity`)

---

### US-ACT3.7: Componente ActivityExecutionSheet modular

**Como** operador de campo
**quiero** un formulario de ejecucion de actividades modular que se adapte al modo (template, scheduled, ad-hoc, multi-batch)
**para** registrar actividades de forma rapida y consistente independientemente del punto de entrada

#### Criterios de Aceptacion
- [ ] Componente principal `components/activities/activity-execution-sheet.tsx` como Sheet lateral:
  - Props: `open`, `onOpenChange`, `templateId?`, `scheduledActivityId?`, `groupId?`, `entityType?`, `entityId?`, `areaId?`, `batchIds?`, `phase?`, `onCompleted?`
  - Resolucion de modo: templateId → template mode; scheduledActivityId → scheduled mode; groupId → multi-batch mode; ninguno → ad-hoc mode
- [ ] Sub-componente `execution-step-activity.tsx` — Paso 1: datos de actividad
  - Modo ad-hoc: muestra selector de tipo de actividad (`activity-type-picker.tsx`), todos los campos opcionales visibles
  - Modo template/scheduled: tipo de actividad read-only, solo campos habilitados en `template.form_fields`
  - Campos esenciales siempre visibles: fecha, responsable, batch(es), area, fase
  - Seccion recursos pre-cargados desde template con cantidades editables (`resource-editor-inline.tsx`)
  - Multi-batch: muestra badge con N lotes seleccionados + selector de distribucion de recursos (identical/split)
- [ ] Sub-componente `execution-step-quality.tsx` — Paso 2: formulario QC (extraido del report sheet actual)
  - Solo se muestra si el template tiene `quality_check_template_id`
  - Renderiza `DynamicFormRenderer` con el QC template
  - Incluye: resultado general (pass/conditional/fail), follow-up, notas
  - Boton "Omitir calidad" disponible
- [ ] Sub-componente `resource-editor-inline.tsx` — editor de cantidades de recursos inline
  - Muestra: nombre producto, direccion, basis, campo de cantidad editable
  - Pre-cargado desde `activity_template_resources` cuando hay template
- [ ] Sub-componente `activity-type-picker.tsx` — selector de tipo para ad-hoc
  - Dropdown con activity_types de la company
  - Al seleccionar tipo, carga templates disponibles para sugerir (opcional)
- [ ] Sheet tiene header fijo (titulo + badge de modo), footer fijo (Cancelar + Completar Actividad amber-500)
- [ ] Indicador de pasos si hay QC (1. Actividad → 2. Calidad)
- [ ] Usa el hook `use-activity-execution` para form state, pre-fill y submit
- [ ] Toast de confirmacion al completar, cierre automatico
- [ ] `npx next build` pasa sin errores

#### Frontend
- Archivo nuevo: `components/activities/activity-execution-sheet.tsx`
- Archivo nuevo: `components/activities/execution-step-activity.tsx`
- Archivo nuevo: `components/activities/execution-step-quality.tsx`
- Archivo nuevo: `components/activities/resource-editor-inline.tsx`
- Archivo nuevo: `components/activities/activity-type-picker.tsx`

#### Dependencias
- Requiere: US-ACT3.6 (Zod schema + hook)

---

### US-ACT3.8: Dialog de programar actividad

**Como** supervisor u operador
**quiero** un dialogo para programar actividades manualmente desde distintos contextos (orden de produccion, area, fase, lote)
**para** planificar trabajo futuro con seleccion de multiples lotes sin depender de la generacion automatica

#### Criterios de Aceptacion
- [ ] Componente `components/activities/schedule-activity-dialog.tsx` como Dialog:
  - Props: `open`, `onOpenChange`, `fromOrderId?`, `fromAreaId?`, `fromPhase?`, `fromBatchId?`, `onScheduled?`
- [ ] Zod schema en `lib/schemas/schedule-activity.ts`:
  - `typeId` (requerido), `templateId?`, `scheduledDate` (requerido), `batchIds` (min 1, requerido)
  - `estimatedDurationMinutes?`, `assignedTo?`, `instructions?`, `priority` (routine/urgent/critical, default routine)
- [ ] Form con React Hook Form + zodResolver:
  1. Tipo de actividad (dropdown de `activity_types` de la company)
  2. Template (opcional — filtra por tipo seleccionado, al elegir pre-llena duracion e instrucciones)
  3. Fecha (date picker, requerida)
  4. Seleccion de lotes via `BatchMultiSelect` (filtrado segun contexto de props)
  5. Asignado a (selector de usuarios, opcional)
  6. Prioridad (routine/urgent/critical)
  7. Instrucciones (textarea, opcional)
- [ ] Al submit llama `api.scheduledActivities.createManual`
- [ ] Toast de confirmacion mostrando cuantas actividades se programaron
- [ ] `npx next build` pasa sin errores

#### Frontend
- Archivo nuevo: `components/activities/schedule-activity-dialog.tsx`
- Archivo nuevo: `lib/schemas/schedule-activity.ts`

#### Backend
- Usa: `api.scheduledActivities.createManual` (de US-ACT3.4)

#### Dependencias
- Requiere: US-ACT3.4 (mutation `createManual`)
- Requiere: US-ACT3.9 (componente `BatchMultiSelect`)

---

### US-ACT3.9: Componente BatchMultiSelect

**Como** usuario del sistema
**quiero** un componente reutilizable para seleccionar uno o multiples lotes filtrados por contexto
**para** usarlo en programacion y ejecucion de actividades multi-batch

#### Criterios de Aceptacion
- [ ] Componente `components/activities/batch-multi-select.tsx`:
  - Props: `companyId`, `value: string[]`, `onChange: (batchIds: string[]) => void`, `orderId?`, `areaId?`, `phase?`, `facilityId?`, `maxSelection?`, `singleMode?`
- [ ] Lista de lotes como checkboxes mostrando: `batch_code`, nombre del cultivar, area/zona, fase actual, cantidad actual
- [ ] Filtrado automatico segun props:
  - Si `orderId`: muestra solo lotes de esa orden de produccion
  - Si `areaId`: muestra solo lotes en esa area
  - Si `phase`: muestra solo lotes en esa fase (cross-area)
  - Si `facilityId`: muestra solo lotes de esa facilidad
  - Combinaciones son aditivas (AND)
- [ ] Solo muestra lotes con `status: "active"` (excluye archived, harvested, lost)
- [ ] Boton "Seleccionar todos" / "Deseleccionar todos" en la lista filtrada
- [ ] Modo single (`singleMode=true`): renderiza radio buttons en lugar de checkboxes
- [ ] Muestra contador: "N lotes seleccionados de M disponibles"
- [ ] `npx next build` pasa sin errores

#### Frontend
- Archivo nuevo: `components/activities/batch-multi-select.tsx`

#### Backend
- Usa: query existente `api.batches.list` o similar con filtros

#### Dependencias
- Ninguna — puede ejecutarse en paralelo con Fase 1

---

### US-ACT3.10: Integrar entry points en paginas existentes

**Como** usuario del sistema
**quiero** acceder a la programacion y ejecucion de actividades directamente desde las paginas de produccion, areas y actividades programadas
**para** no tener que navegar a una pagina separada cada vez que quiero programar o ejecutar una actividad

#### Criterios de Aceptacion
- [ ] **Orden de produccion** (`app/(dashboard)/production/orders/[id]/page.tsx`):
  - Boton "Programar Actividad" en header o seccion de lotes → abre `ScheduleActivityDialog` con `fromOrderId`
  - Boton "Reportar Actividad" en cada fila de batch → abre `ActivityExecutionSheet` con `batchIds=[batchId]`
- [ ] **Area — History tab** (`components/areas/area-history-tab.tsx`):
  - Boton existente "Registrar actividad" migrado para abrir `ActivityExecutionSheet` (ad-hoc o con template) en lugar del viejo report sheet
  - Boton adicional "Programar" → abre `ScheduleActivityDialog` con `fromAreaId`
- [ ] **Scheduled Activities** (`app/(dashboard)/scheduled-activities/page.tsx`):
  - Eliminar el template picker dialog actual (ya no necesario — el execution sheet resuelve el modo)
  - Boton "Reportar" en cada actividad pendiente → abre `ActivityExecutionSheet` con `scheduledActivityId`
  - Si la actividad tiene `group_id`, mostrar badge "Grupo (N lotes)" y al reportar abrir con `groupId` para ejecutar todas
  - Boton "Programar Actividad" en header → abre `ScheduleActivityDialog` sin contexto
  - Boton "Reportar Ad-hoc" en header → abre `ActivityExecutionSheet` sin template ni scheduled (modo ad-hoc)
- [ ] **Today Activities Widget** (`components/dashboard/today-activities-widget.tsx`):
  - Migrar "Reportar" para usar nuevo `ActivityExecutionSheet`
- [ ] `npx next build` pasa sin errores

#### Frontend
- Modificar: `app/(dashboard)/production/orders/[id]/page.tsx`
- Modificar: `components/areas/area-history-tab.tsx`
- Modificar: `app/(dashboard)/scheduled-activities/page.tsx`
- Modificar: `components/dashboard/today-activities-widget.tsx`

#### Dependencias
- Requiere: US-ACT3.7 (ActivityExecutionSheet)
- Requiere: US-ACT3.8 (ScheduleActivityDialog)

---

### US-ACT3.11: Reemplazar ActivityReportSheet y eliminar componente viejo

**Como** desarrollador
**quiero** eliminar el viejo `ActivityReportSheet` despues de migrar todos sus consumidores al nuevo `ActivityExecutionSheet`
**para** completar la transicion y eliminar el componente monolitico de 881 lineas

#### Criterios de Aceptacion
- [ ] Los 3 consumidores del viejo `ActivityReportSheet` usan el nuevo `ActivityExecutionSheet`:
  - `app/(dashboard)/scheduled-activities/page.tsx`
  - `components/areas/area-history-tab.tsx`
  - `components/dashboard/today-activities-widget.tsx`
- [ ] Se elimina `components/activities/activity-report-sheet.tsx`
- [ ] Grep confirma cero importaciones de `ActivityReportSheet` o `activity-report-sheet`
- [ ] Todos los flujos existentes funcionan igual que antes (regresion):
  - Reportar desde scheduled activity con template → QC si aplica
  - Reportar desde area history tab
  - Reportar desde today widget
- [ ] `npx next build` pasa sin errores

#### Frontend
- Eliminar: `components/activities/activity-report-sheet.tsx`
- Verificar: todos los consumidores migrados en US-ACT3.10

#### Dependencias
- Requiere: US-ACT3.10 (todos los entry points migrados)

---

### US-ACT3.12: Deprecar mutation vieja completeScheduledActivity

**Como** desarrollador
**quiero** marcar `completeScheduledActivity` como deprecated y verificar que no queden consumidores activos
**para** mantener limpieza del backend mientras se permite una transicion gradual

#### Criterios de Aceptacion
- [ ] Se agrega comentario `/** @deprecated Use executeActivity instead */` a `completeScheduledActivity` en `convex/activities.ts`
- [ ] Ningun componente frontend activo llama directamente a `completeScheduledActivity` (toda ejecucion pasa por `executeActivity`)
- [ ] Se identifican y documentan queries en `convex/activities.ts` que ya no tienen consumidores frontend (candidatas para eliminacion futura)
- [ ] `npx next build` pasa sin errores

#### Backend
- Archivo: `convex/activities.ts` — agregar `@deprecated`

#### Dependencias
- Requiere: US-ACT3.11 (todos los consumidores migrados)

---

### US-ACT3.13: Validacion end-to-end de todos los flujos

**Como** QA/desarrollador
**quiero** validar los 6 flujos principales del sistema refactorizado
**para** confirmar que la refactorizacion no introdujo regresiones y los nuevos flujos funcionan correctamente

#### Criterios de Aceptacion
- [ ] **Flujo 1 — Template-driven**: Crear template → generar schedule → ejecutar scheduled activity → actividad creada con recursos, scheduled marcada como completed
- [ ] **Flujo 2 — Manual schedule**: Abrir dialog desde orden de produccion → seleccionar 1 batch → programar → ejecutar → verificar actividad creada
- [ ] **Flujo 3 — Ad-hoc**: Abrir execution sheet sin contexto → seleccionar tipo → llenar campos → submit → actividad creada sin scheduled_activity asociada
- [ ] **Flujo 4 — Multi-batch**: Programar desde orden con 3 batches → ejecutar grupo → verificar 1 parent activity + 3 child activities en DB con `parent_activity_id`
- [ ] **Flujo 5 — QC**: Ejecutar actividad con template que tiene `quality_check_template_id` → completar paso 1 → completar paso 2 QC → verificar `quality_checks` record creado
- [ ] **Flujo 6 — Skip**: Saltar scheduled activity con razon → verificar status "skipped" y `skipped_reason`
- [ ] Consumo de inventario FIFO funciona correctamente en single-batch y multi-batch
- [ ] `npx next build` pasa sin errores

#### Dependencias
- Requiere: todas las US anteriores completadas

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `scheduled_activities` | `group_id` | `v.optional(v.string())` | UUID compartido para agrupar actividades multi-batch |
| `scheduled_activities` | `source` | `v.optional(v.string())` | Origen: "template" / "manual" / "adhoc" |
| `scheduled_activities` | index `by_group` | `["group_id"]` | Para queries de grupo multi-batch |
| `activities` | index `by_parent_activity` | `["parent_activity_id"]` | Para queries de child activities |
| `activity_template_checklist` | — | DEPRECATED | Marcar como deprecated, no eliminar tabla |

## Consideraciones Tecnicas

- **Arquitectura**: La mutation `executeActivity` debe reutilizar la logica interna de `logV2` (no duplicarla). Extraer la logica core de creacion de actividad + recursos + FIFO como helper interno.
- **Backward compatibility**: Todos los campos nuevos son `v.optional()`. Las mutations existentes (`logV2`, `completeScheduledActivity`) siguen funcionando sin cambios. `completeScheduledActivity` se depreca pero no se elimina.
- **Multi-batch en inventario**: En modo `split_proportional`, la cantidad total de cada recurso se divide entre N batches. En modo `identical`, se aplica la misma cantidad a cada batch (consumo total = cantidad × N batches).
- **Performance**: `generateFromSchedule` no se modifica. Las queries existentes (`by_entity`, `by_scheduled_date`) siguen funcionando porque cada scheduled_activity multi-batch es un row independiente.
- **Riesgo principal**: El `ActivityReportSheet` actual (881 lineas) tiene logica compleja de FIFO, QC, y pre-fill. La migracion debe preservar exactamente el mismo comportamiento. Recomendacion: extraer la logica del sheet actual como referencia antes de reescribir.

## Out of Scope

- Refactorizacion del Activity Template Wizard (ya esta bien estructurado)
- Eliminacion de la tabla `activity_template_checklist` del schema (requiere migracion de datos)
- Recurrencia en la programacion manual (feature futura — hoy solo se programa una fecha)
- Upload de fotos/archivos en el formulario de ejecucion (existe como flag pero no hay UI de upload)
- Vistas mobile-optimized del execution sheet
- Modificaciones a `generateFromSchedule` (la generacion automatica sigue igual)
- Eliminacion de campos legacy en `scheduled_activities` (`assigned_team`, `required_materials`, `required_equipment`)

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits

### Archivos Modificados

### Fecha de Completado
