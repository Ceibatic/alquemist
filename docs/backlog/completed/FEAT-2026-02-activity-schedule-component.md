# FEAT-2026-02-activity-schedule-component

## Metadata
- **Creado:** 2026-02-13
- **Prioridad:** high
- **Modulo relacionado:** M23-scheduled-activities
- **Tipo:** feature

## Descripcion

Crear un componente reutilizable `<ActivitySchedule>` que muestre un cronograma de actividades programadas con vista timeline agrupada por fecha, permita ejecutar actividades in-situ (reportar, saltar, reprogramar), y se adapte a multiples niveles de seguimiento: global (empresa), area, lote, orden de produccion, y fase dentro de area.

Actualmente la unica vista de actividades programadas es la pagina `/scheduled-activities` (~400 lineas, no reutilizable). No hay visibilidad de actividades programadas en el detalle de area, lote, ni fase. Este componente unifica la visualizacion y ejecucion de actividades en un solo componente parametrizable por scope, eliminando duplicacion y proporcionando visibilidad del cronograma en cada nivel de la operacion.

Las actividades programadas son agnosticas al area — estan asociadas a lotes. Cuando se consulta por area, se buscan los lotes activos en esa area y luego sus actividades programadas. Si un lote se mueve de area, sus actividades aparecen en la nueva ubicacion.

## User Stories

### US-SCH.1: Query unificada con indexes optimizados

**Como** desarrollador del sistema
**quiero** una query unificada `listForSchedule` que acepte diferentes scopes y use indexes eficientes
**para** que el componente de cronograma obtenga datos de forma optima sin full-table scans

#### Criterios de Aceptacion
- [x] Se agregan 3 indexes nuevos a `scheduled_activities`: `by_company_date` (`["company_id", "scheduled_date"]`), `by_company_status` (`["company_id", "status", "scheduled_date"]`), `by_order_date` (`["production_order_id", "scheduled_date"]`)
- [x] Query `listForSchedule` acepta `scope` como union discriminada: `global`, `area`, `batch`, `order`, `phase`
- [x] Scope `global`: usa index `by_company_date` con range en `scheduled_date`
- [x] Scope `batch`: usa index existente `by_entity` (`entity_type="batch"`, `entity_id=batchId`), filtro date in-memory
- [x] Scope `order`: usa index `by_order_date` con range en `scheduled_date`
- [x] Scope `area`: 2-step — query batches activos por `by_area` index, luego activities por `by_entity` para cada batch (`Promise.all`)
- [x] Scope `phase`: igual que area pero filtra batches por `current_phase` antes de buscar activities
- [x] Post-filtros in-memory: `status`, `typeId` (volumen ya reducido por index)
- [x] Enrichment: batch_code, activity_type (name/icon/color), template name, assigned_to name, area name (para scope global/order)
- [x] Parametro `limit` (default 50) para scope global y order; batch/area/phase retornan todo y filtran
- [x] Parametros opcionales: `dateStart`, `dateEnd`, `status`, `typeId`

#### Backend
- Query: `api.scheduledActivities.listForSchedule`
- Schema changes: 3 indexes nuevos (sin campos nuevos)
- Validaciones: `companyId` requerido, scope type requerido

#### Dependencias
- Ninguna (base para todos los demas US)

---

### US-SCH.2: Componente base con timeline por fecha

**Como** operador de campo
**quiero** ver las actividades programadas agrupadas por fecha en una vista timeline con indicadores visuales de estado
**para** entender rapidamente que actividades estan vencidas, cuales son de hoy, y cuales vienen proximas

#### Criterios de Aceptacion
- [x] Componente `<ActivitySchedule>` acepta props: `scope` (requerido), `compact` (boolean, default false), `defaultDateRange` (today/week/month/all), `showFilters` (default !compact), `maxItems` (default 50)
- [x] Actividades agrupadas en secciones por fecha: "Vencidas" (con borde/fondo rojo suave), "Hoy" (con indicador visual amber), fechas futuras (neutras)
- [x] Cada actividad muestra en una fila: icono del tipo de actividad (con color), nombre de la actividad, badge del lote (batch_code), fecha/hora programada, nombre del asignado, indicador de estado
- [x] Estados visuales: vencida (icono rojo AlertTriangle), pendiente hoy (icono amber Clock), proxima (icono gris Clock), completada (icono verde CheckCircle con timestamp), saltada (icono muted SkipForward)
- [x] Header muestra contadores como chips/badges: N vencidas (rojo), N hoy (amber), N proximas (gris), N completadas (verde)
- [x] Actividades completadas se muestran atenuadas (opacity reducida)
- [x] Si no hay actividades, muestra empty state con icono y mensaje "No hay actividades programadas"
- [x] Loading state con skeleton mientras carga la query

#### Frontend
- Componente: `components/activities/activity-schedule.tsx`
- Sub-componentes: `schedule-header.tsx`, `schedule-date-group.tsx`, `schedule-activity-row.tsx`
- Estados UI: loading (skeleton), empty, populated

#### Dependencias
- Requiere: US-SCH.1 (query backend)

---

### US-SCH.3: Ejecucion in-situ (reportar, saltar, reprogramar)

**Como** operador de campo
**quiero** reportar, saltar o reprogramar actividades directamente desde el cronograma sin navegar a otra pagina
**para** gestionar las actividades de forma rapida y sin perder el contexto de donde estoy

#### Criterios de Aceptacion
- [x] Cada actividad pendiente/vencida muestra boton "Reportar" que abre `ActivityExecutionSheet` existente
- [x] El sheet recibe contexto completo: `templateId`, `scheduledActivityId`, `groupId`, `entityType`, `entityId`, `phase`, `batchIds`
- [x] Si la actividad tiene `group_id` (multi-batch), se pasa el `groupId` para ejecutar todo el grupo
- [x] Cada actividad pendiente/vencida muestra menu contextual (icono "...") con opciones: "Saltar" y "Reprogramar"
- [x] "Saltar" abre dialogo con textarea de motivo (requerido) y llama a `api.cultivationSchedules.skipScheduledActivity`
- [x] "Reprogramar" abre popover con date picker y llama a `api.cultivationSchedules.rescheduleActivity`
- [x] Actividades completadas y saltadas no muestran botones de accion
- [x] Al completar cualquier accion, toast de confirmacion y la lista se actualiza reactivamente (Convex subscription)
- [x] Se reutilizan los componentes existentes sin modificarlos: `ActivityExecutionSheet`, `skipScheduledActivity`, `rescheduleActivity`

#### Frontend
- Reutiliza: `components/activities/activity-execution-sheet.tsx`
- Reutiliza: `convex/cultivationSchedules.ts` (skipScheduledActivity, rescheduleActivity)

#### Dependencias
- Requiere: US-SCH.2 (componente base)

---

### US-SCH.4: Modo compact y filtros

**Como** usuario del sistema
**quiero** que el cronograma se adapte al espacio donde esta embebido — compacto en tabs, con filtros completos en vista de pagina
**para** tener la informacion relevante sin sobrecargar la UI en contextos reducidos

#### Criterios de Aceptacion
- [x] Prop `compact=true` activa modo reducido: header inline con stats + boton programar en una sola linea, sin toolbar de filtros visible, filas mas compactas (una linea por actividad), max-height con scroll
- [x] Prop `compact=false` (default) muestra vista completa: header con stats en chips, toolbar de filtros, filas con dos lineas (titulo + metadata)
- [x] Filtros disponibles en vista completa: rango de fechas (presets: hoy, esta semana, este mes + range picker custom), estado (dropdown: todos/pendientes/completadas/saltadas), tipo de actividad (dropdown del catalogo `activity_types`), asignado a (dropdown de usuarios)
- [x] En modo compact, un boton "Filtrar" abre popover con los filtros
- [x] Adaptacion por scope: en scope `batch` se oculta la columna "Lote" (redundante), en scope `area` muestra solo batch_code corto, en scope `global` muestra area + batch para contexto completo
- [x] Boton "+ Programar" visible en ambos modos — abre `ScheduleActivityDialog` existente pre-llenado con contexto del scope
- [x] Los filtros activos se reflejan como parametros de la query `listForSchedule`

#### Frontend
- Componente: integrado en `activity-schedule.tsx`
- Reutiliza: `components/dashboard/schedule-activity-dialog.tsx`

#### Dependencias
- Requiere: US-SCH.2 y US-SCH.3

---

### US-SCH.5: Integracion en pagina global de actividades programadas

**Como** administrador de operaciones
**quiero** que la pagina `/scheduled-activities` use el nuevo componente de cronograma
**para** tener la misma funcionalidad mejorada y mantener un unico source-of-truth del componente

#### Criterios de Aceptacion
- [x] La pagina `/scheduled-activities` reemplaza su implementacion actual (~400 lineas) por `<ActivitySchedule scope={{ type: 'global' }} />`
- [x] Toda la funcionalidad existente se mantiene: vista de hoy, vencidas, proximas, estadisticas, reportar, saltar
- [x] El boton de programar actividad ad-hoc sigue funcionando
- [x] Las queries antiguas (`getScheduledForDate`, `getOverdue`) se pueden deprecar gradualmente pero no se eliminan aun (otros widgets las usan)
- [x] No hay regresion visual ni funcional respecto a la pagina actual
- [x] El widget `TodayActivitiesWidget` del dashboard sigue funcionando independientemente

#### Frontend
- Pagina: `app/(dashboard)/scheduled-activities/page.tsx`

#### Dependencias
- Requiere: US-SCH.4

---

### US-SCH.6: Integracion en area, lote y orden de produccion

**Como** operador de campo
**quiero** ver el cronograma de actividades programadas directamente en el detalle de area, lote y orden de produccion
**para** tener visibilidad de las proximas actividades sin navegar a la pagina global

#### Criterios de Aceptacion
- [x] En `/areas/[id]`: nuevo tab "Cronograma" muestra `<ActivitySchedule scope={{ type: 'area', areaId }} compact />`
- [x] En el tab de area, el cronograma muestra actividades de todos los lotes activos en esa area
- [x] En `/batches/[id]`: nueva seccion arriba del tab "Actividades" existente (o tab separado "Programadas") con `<ActivitySchedule scope={{ type: 'batch', batchId }} compact />`
- [x] En `/production/orders/[id]`: reemplaza la seccion actual de scheduled activities con `<ActivitySchedule scope={{ type: 'order', orderId }} compact />`
- [ ] En `/areas/[id]/phases/[phase]` (si existe): seccion inline con `<ActivitySchedule scope={{ type: 'phase', areaId, phase }} compact />` — N/A: page does not exist yet
- [x] El boton "+ Programar" en cada contexto pre-llena los datos relevantes (area, batch, etc.)
- [x] Si no hay actividades para el scope, muestra empty state compacto adecuado al contexto

#### Frontend
- Paginas: `app/(dashboard)/areas/[id]/page.tsx`, `app/(dashboard)/batches/[id]/page.tsx`, `app/(dashboard)/production/orders/[id]/page.tsx`

#### Dependencias
- Requiere: US-SCH.5

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `scheduled_activities` | — | index `by_company_date` | `["company_id", "scheduled_date"]` — queries globales por empresa con rango de fecha |
| `scheduled_activities` | — | index `by_company_status` | `["company_id", "status", "scheduled_date"]` — queries de overdue y filtro por estado |
| `scheduled_activities` | — | index `by_order_date` | `["production_order_id", "scheduled_date"]` — queries por orden de produccion |

No se agregan campos nuevos. Solo indexes sobre campos existentes.

## Consideraciones Tecnicas

- **Arquitectura:** Un componente React parametrizable por `scope` que consume una unica query Convex `listForSchedule`. El scope determina que index usa la query. Sin denormalizacion de area_id — las actividades siguen al lote.
- **Integraciones:** Reutiliza `ActivityExecutionSheet` (reporte), `ScheduleActivityDialog` (programar), `skipScheduledActivity` y `rescheduleActivity` (acciones). No se modifican estos componentes.
- **Performance:** Scope area/phase usa patron 2-step (batches → activities) con `Promise.all`. Para areas con 5-20 lotes activos, el overhead es aceptable (server-side, sin network hops). Si en futuro escala, se puede agregar denormalizacion de `area_id` como optimizacion.
- **Riesgos:** El scope `area` con muchos lotes activos (50+) podria ser lento. Mitigacion: limit + lazy loading. El widget `TodayActivitiesWidget` del dashboard usa queries antiguas — no tocarlo en esta feature.

## Out of Scope

- Vista calendario (Gantt/calendar grid) — iteracion futura si se requiere
- Drag-and-drop para reprogramar arrastrando actividades entre fechas
- Notificaciones push de actividades vencidas
- Creacion de nuevos tipos de actividad desde el cronograma
- Modificacion de los componentes `ActivityExecutionSheet`, `ScheduleActivityDialog`, o las mutations de skip/reschedule
- Migrar el widget `TodayActivitiesWidget` del dashboard a usar el nuevo componente

---

## Implementacion

### Commits
- `6eac17d` — feat(activities): US-SCH.1 unified listForSchedule query with optimized indexes
- `fde4c0c` — feat(activities): US-SCH.2 base ActivitySchedule component with date timeline
- `ef6962c` — feat(activities): US-SCH.3 in-situ execution actions (report, skip, reschedule)
- `62b428f` — feat(activities): US-SCH.4 compact mode, filters, and schedule button
- `b71f6d1` — feat(activities): US-SCH.5 replace global scheduled activities page
- `f99c842` — feat(activities): US-SCH.6 integrate in area, batch, and order pages

### Archivos Modificados
- `convex/schema.ts` — 3 new indexes on scheduled_activities
- `convex/scheduledActivities.ts` — listForSchedule query with scope-based routing and enrichment
- `components/activities/activity-schedule.tsx` — new reusable component (~580 lines)
- `app/(dashboard)/scheduled-activities/page.tsx` — replaced with ActivitySchedule (530→65 lines)
- `app/(dashboard)/areas/[id]/page.tsx` — new "Cronograma" tab
- `app/(dashboard)/batches/[id]/page.tsx` — new "Programadas" tab
- `app/(dashboard)/production/orders/[id]/page.tsx` — replaced scheduled section

### Fecha de Completado
2026-02-13
