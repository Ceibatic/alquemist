# FEAT-2026-02-scheduled-activity-lifecycle

## Metadata
- **Creado:** 2026-02-23
- **Prioridad:** medium
- **Modulo relacionado:** M24-production-orders, M25-batches
- **Tipo:** enhancement
- **Prerequisito:** FEAT-2026-02-phase-role-activities

## Descripcion

Completar el ciclo de vida de actividades programadas y transiciones de fase con tres capacidades faltantes: (1) cancelacion individual de actividades, (2) correccion/rollback de transiciones de fase ejecutadas por error, y (3) historial explicito de transiciones de fase para auditoria.

Actualmente las actividades programadas son inmutables post-creacion (no hay mutation de cancel/delete), las transiciones de fase no tienen mecanismo de reversion, y los cambios de fase solo se trackean implicitamente via `batch.current_phase` (sin historial temporal).

### Contexto del codebase

- `skipScheduledActivity` existe en `cultivationSchedules.ts:647` pero es para schedules de cultivo, no para ordenes de produccion
- `scheduled_activities.status` acepta 5 valores: `pending`, `in_progress`, `completed`, `skipped`, `cancelled`
- El status `cancelled` esta definido en schema pero **ninguna mutation lo setea** para actividades individuales
- No existe tabla `phase_transition_history` — transiciones se infieren de `batch.current_phase` + timestamps de `order_phases`
- No hay patrones de rollback en el codebase — solo append-only audit trails (`inventory_transactions`, `activities`, `audit_logs`)

## User Stories

### US-LIFE.1: Cancelar actividad programada individual

**Como** administrador de produccion
**quiero** cancelar una actividad programada que ya no es necesaria
**para** mantener limpio el calendario sin perder trazabilidad

#### Criterios de Aceptacion
- [x] Nueva mutation `scheduledActivities.cancel(scheduledActivityId, reason)`:
  - Solo actividades con status `pending` pueden cancelarse
  - Setea `status: "cancelled"`, `skipped_reason: reason`, `updated_at: now`
  - Si la actividad tiene `phase_role: "entry"` o `"exit"`, validar que no sea la unica de ese role para la fase
  - Si es la unica entry/exit: rechazar con error "No se puede cancelar la unica actividad de {role} de la fase. Cree una reemplazo primero."
- [x] Actividades `cancelled` no aparecen en el calendario por defecto (filtro por status)
- [x] Vista de detalle de orden: actividades canceladas aparecen en gris con badge "Cancelada" y razon
- [x] Actividades `in_progress` o `completed` no pueden cancelarse (validacion backend)
- [x] Cancelar una actividad con `group_id` ofrece opcion: "Cancelar solo esta" o "Cancelar grupo completo"
- [x] `npx next build` pasa sin errores

#### Backend
- Mutation nueva: `scheduledActivities.cancel`
- Validacion: status === "pending", phase_role guard
- Tabla: `scheduled_activities` (patch status + skipped_reason)

#### Frontend
- Boton "Cancelar" en detalle de actividad (solo si pending)
- Dialog de confirmacion con campo de razon (requerido)
- Para actividades con group_id: selector "solo esta / grupo completo"

#### Dependencias
- Ninguna (standalone)

---

### US-LIFE.2: Revertir transicion de fase (correccion)

**Como** administrador de produccion
**quiero** revertir una fase completada a `in_progress` si la transicion fue por error
**para** corregir errores operativos sin perder el historial

#### Criterios de Aceptacion
- [x] Nueva mutation `productionOrders.revertPhaseCompletion(orderId, phaseId, reason)`:
  - Solo fases con status `completed` pueden revertirse
  - Solo la **fase mas recientemente completada** puede revertirse (no se puede saltar)
  - Marca fase revertida como `in_progress` (no borra `actual_end_date` — lo deja para auditoria)
  - Si la siguiente fase esta `awaiting_entry` o `in_progress`:
    - Marca siguiente fase como `pending`, limpia `actual_start_date`
    - Cancela sus entry/exit activities si estan `pending`
  - Actualiza `order.current_phase_id` a la fase revertida
  - Actualiza `batch.current_phase` en lotes activos
  - NO revierte movimientos de inventario — eso requiere ajuste manual via `inventory.adjustStock`
  - Audit trail diferido a US-LIFE.3 (phase_transition_log es mas apropiado que crear activity)
- [x] Boton "Revertir fase" visible en la fase mas reciente completada (ordenes active/completed)
- [x] Dialog de confirmacion con campo de razon (requerido) y warning:
  - "Esta accion revertira la fase a En Progreso. Los movimientos de inventario NO se revierten automaticamente."
- [x] Si hay actividades ejecutadas en la siguiente fase, mostrar warning adicional: "La fase siguiente tiene {N} actividades ejecutadas que quedaran huerfanas"
- [x] Toast: "Fase '{name}' revertida a En Progreso"

#### Backend
- Mutation nueva: `productionOrders.revertPhaseCompletion`
- Validacion: solo fase mas reciente, solo completed, admin role
- Tablas: `order_phases` (patch), `production_orders` (patch), `batches` (patch), `activities` (insert audit), `scheduled_activities` (cancel pending next-phase activities)

#### Frontend
- `app/(dashboard)/production/orders/[id]/page.tsx`: boton "Revertir" en phase card (admin only)
- Dialog con razon + warnings contextuales

#### Dependencias
- Requiere: FEAT-2026-02-phase-role-activities (para manejar `awaiting_entry` y phase_role en actividades afectadas)

---

### US-LIFE.3: Historial de transiciones de fase

**Como** administrador
**quiero** ver un historial explicito de cuando cada fase inicio, se completo o se revirtio
**para** tener auditoria completa del ciclo de produccion

#### Criterios de Aceptacion
- [x] Nueva tabla `phase_transition_log`:
  - `order_id: v.id("production_orders")`
  - `phase_id: v.id("order_phases")`
  - `phase_name: v.string()`
  - `transition_type: v.string()` — "started" | "completed" | "reverted" | "entry_executed" | "exit_executed"
  - `from_status: v.string()`
  - `to_status: v.string()`
  - `triggered_by: v.string()` — "manual" | "exit_activity" | "entry_activity" | "admin_override" | "activation"
  - `activity_id: v.optional(v.id("activities"))` — actividad que triggeo la transicion
  - `scheduled_activity_id: v.optional(v.id("scheduled_activities"))` — actividad programada origen
  - `performed_by: v.optional(v.id("users"))` — opcional (mutations sin auth context)
  - `reason: v.optional(v.string())`
  - `timestamp: v.number()`
  - Index: `by_order` ["order_id", "timestamp"]
  - Index: `by_phase` ["phase_id", "timestamp"]
- [x] Insertar registro en cada transicion:
  - `productionOrders.activate` → log "started" para primera fase
  - `handlePhaseExitExecution` → log "completed" + "started" para siguiente fase
  - `handlePhaseEntryExecution` → log "entry_executed"
  - `productionOrders.completePhase` → log "completed" con triggered_by "manual"/"admin_override"
  - `productionOrders.revertPhaseCompletion` → log "reverted"
- [x] Vista en detalle de orden: seccion "Historial de Fases" con timeline vertical
  - Cada entrada muestra: fecha/hora, fase, tipo de transicion, quien lo hizo, razon (si existe)
- [ ] Exportable como parte del reporte de orden (futuro)

#### Backend
- Schema: nueva tabla `phase_transition_log`
- Mutations modificadas: `activate`, `completePhase`, `revertPhaseCompletion`, `handlePhaseExitExecution`, `handlePhaseEntryExecution`
- Query nueva: `productionOrders.getPhaseTransitionLog(orderId)`

#### Frontend
- `components/production/phase-transition-timeline.tsx`: timeline vertical
- Integrado en `app/(dashboard)/production/orders/[id]/page.tsx`

#### Dependencias
- Requiere: FEAT-2026-02-phase-role-activities (para entry/exit transitions)
- Requiere: US-LIFE.2 (para revert transitions)

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `phase_transition_log` | (nueva tabla) | — | Audit trail explicito de transiciones de fase |
| `phase_transition_log` | `order_id` | `v.id("production_orders")` | Orden de produccion |
| `phase_transition_log` | `phase_id` | `v.id("order_phases")` | Fase afectada |
| `phase_transition_log` | `transition_type` | `v.string()` | started/completed/reverted/entry_executed/exit_executed |
| `phase_transition_log` | `triggered_by` | `v.string()` | manual/exit_activity/entry_activity/admin_override/activation |
| `phase_transition_log` | `performed_by` | `v.id("users")` | Usuario que ejecuto |
| `phase_transition_log` | `timestamp` | `v.number()` | Momento de la transicion |

## Consideraciones Tecnicas

- **Patron append-only:** `phase_transition_log` es insert-only, nunca se modifica ni elimina (auditoria regulatoria)
- **Revert no es undo:** La reversion de fase no deshace inventario — crea un nuevo registro de transicion "reverted". Los ajustes de inventario se hacen manualmente via `inventory.adjustStock`
- **Cancel vs Skip:** `cancelled` indica decision administrativa de no ejecutar. `skipped` indica que la actividad no aplica a este ciclo. Ambos son terminales
- **Performance:** `phase_transition_log` es append-only con index por order — queries rapidas. ~5-10 registros por fase

## Out of Scope

- **Undo de movimientos de inventario:** Revertir fase NO revierte inventory_items/transactions. Se usa ajuste manual
- **Revertir multiples fases a la vez:** Solo se revierte la mas reciente. Para revertir mas, hacerlo secuencialmente
- **Archivar actividades canceladas:** Quedan en BD con status cancelled, no se eliminan fisicamente

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits
-

### Archivos Modificados
-

### Fecha de Completado
-
