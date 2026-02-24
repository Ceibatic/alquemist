# FEAT-2026-02-multi-batch-distribution

## Metadata
- **Creado:** 2026-02-23
- **Prioridad:** medium
- **Modulo relacionado:** M24-production-orders, M25-batches
- **Tipo:** feature
- **Prerequisito:** FEAT-2026-02-phase-role-activities

## Descripcion

Actualmente al activar una orden de produccion, todas las actividades programadas se asignan al primer lote creado (comentario explicito en `productionOrders.ts:738`). Esto impide operar ordenes con multiples lotes donde cada lote requiere actividades independientes o distribuidas.

Ademas, cada fase hereda el `area_id` de la fase anterior automaticamente. No hay mecanismo para que el operador reasigne el area de una fase (ej: mover lotes de vegetativo en Area A a floracion en Area B).

### Contexto del codebase

- `scheduled_activities` ya tiene `group_id: v.optional(v.string())` para agrupar actividades multi-batch
- `executeActivity` ya soporta multi-batch via `batchIds` array con distribucion `"identical"` o `"split_proportional"`
- `batches` tiene `parent_batch_id`, `merged_into_batch_id` para genealogia
- `batch_movements` tabla existe para trackear movimientos fisicos de lotes
- La activacion crea N lotes segun `production_templates.batch_configuration` pero asigna todo al primero

## User Stories

### US-DIST.1: Distribuir actividades programadas entre lotes al activar

**Como** administrador de produccion
**quiero** que al activar una orden con multiples lotes, las actividades se distribuyan correctamente
**para** que cada lote tenga su propio set de actividades programadas

#### Criterios de Aceptacion
- [ ] Al activar orden con N lotes, cada `scheduled_activity` se duplica para cada lote:
  - Actividad original se asigna a lote 1 (backward compat)
  - Se crean N-1 copias con `entity_id` apuntando a lotes 2..N
  - Copias comparten `group_id` (UUID generado) para agruparlas
  - Copias heredan: `type_id`, `phase_role`, `order_phase_id`, `scheduled_date`, `company_id`, `production_order_id`
  - Recursos (`scheduled_activity_resources`) se duplican para cada copia
- [ ] Actividades con `phase_role: "exit"` se duplican pero solo UNA triggerea la transicion (la primera ejecutada)
- [ ] Actividades con `phase_role: "entry"` se duplican — todas deben ejecutarse para que la fase inicie (configurable: "todas" vs "al menos una")
- [ ] Template puede definir `distribution_strategy` por actividad:
  - `"per_batch"` (default): una copia por lote
  - `"shared"`: una sola actividad compartida entre todos los lotes (ej: limpieza de area)
- [ ] Orden con 1 solo lote: comportamiento identico al actual (sin cambios)
- [ ] `npx next build` pasa sin errores

#### Backend
- Mutation modificada: `productionOrders.activate` (loop de distribucion)
- Schema: `template_activities.distribution_strategy: v.optional(v.string())` — "per_batch" | "shared"
- Schema: `scheduled_activities.distribution_strategy` propagado desde template

#### Frontend
- Detalle de orden: actividades agrupadas por `group_id` muestran indicador "(Lote 1 de 3)"
- Filtro por lote en lista de actividades

#### Dependencias
- Requiere: FEAT-2026-02-phase-role-activities (para propagar `phase_role` en copias)

---

### US-DIST.2: Reasignar area de una fase

**Como** operador de produccion
**quiero** cambiar el area asignada a una fase de la orden
**para** mover lotes a un area diferente cuando cambian de fase (ej: vegetativo → floracion en otra sala)

#### Criterios de Aceptacion
- [ ] Nueva mutation `productionOrders.updatePhaseArea(orderId, phaseId, newAreaId)`:
  - Solo fases con status `pending` o `awaiting_entry` pueden cambiar area
  - Fases `in_progress`: mostrar warning "La fase ya inicio. Cambiar area actualizara los lotes activos"
  - Fases `completed`: no se pueden cambiar
  - Valida que `newAreaId` pertenece a la misma facility
  - Valida que el area tiene capacidad suficiente (`max_capacity >= batch.current_quantity`)
  - Actualiza `order_phases.area_id`
  - Si la fase esta `in_progress` o `awaiting_entry`:
    - Actualiza `batch.area_id` para lotes activos de la orden
    - Actualiza `batch.zone_id` si el area tiene una zona por defecto
    - Crea registro en `batch_movements` para auditoria
    - Actualiza occupancy del area origen (-) y destino (+)
- [ ] En detalle de orden, cada phase card muestra area asignada con boton "Cambiar area" (icono edit)
- [ ] Dialog de cambio de area: selector de areas activas de la facility + resumen de capacidad
- [ ] Si el area no tiene capacidad suficiente, mostrar error "El area '{name}' solo tiene {available} posiciones disponibles de {needed} necesarias"
- [ ] Toast: "Area de fase '{phaseName}' actualizada a '{areaName}'"

#### Backend
- Mutation nueva: `productionOrders.updatePhaseArea`
- Validacion: status, facility match, capacidad
- Tablas: `order_phases` (patch), `batches` (patch area_id, zone_id), `batch_movements` (insert), `areas` (patch occupancy)

#### Frontend
- `app/(dashboard)/production/orders/[id]/page.tsx`: boton "Cambiar area" en phase card
- Dialog con area selector + validacion de capacidad en tiempo real

#### Dependencias
- Requiere: FEAT-2026-02-phase-role-activities (para `awaiting_entry` status)
- Relacionado: M10-Areas (areas, occupancy)

---

### US-DIST.3: Vista de lotes por fase en detalle de orden

**Como** operador de produccion
**quiero** ver que lotes estan en cada fase y su estado de actividades
**para** tener visibilidad del progreso por lote

#### Criterios de Aceptacion
- [ ] En detalle de orden, cada phase card muestra lista de lotes asignados:
  - Nombre del lote, cantidad actual, area actual
  - Progreso de actividades: "{completadas}/{total} actividades"
  - Status de entry/exit activity del lote
- [ ] Click en lote navega a detalle del lote
- [ ] Si hay multiples lotes, mostrar resumen: "3 lotes — 2 completados, 1 en progreso"
- [ ] Lotes con actividades atrasadas muestran indicador visual (badge rojo)

#### Frontend
- `components/production/phase-batch-list.tsx`: lista de lotes por fase
- Query: `productionOrders.getBatchesByPhase(orderId, phaseId)` o filtro client-side

#### Dependencias
- Requiere: US-DIST.1 (para que lotes tengan actividades distribuidas)

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `template_activities` | `distribution_strategy` | `v.optional(v.string())` | "per_batch" (default) \| "shared" |
| `scheduled_activities` | `distribution_strategy` | `v.optional(v.string())` | Propagado desde template |

## Consideraciones Tecnicas

### Arquitectura

- **Distribucion en activate, no en create:** Las actividades se crean 1:1 con template durante `create`. La duplicacion a N lotes ocurre en `activate` cuando los lotes se crean. Esto evita crear copias para ordenes que nunca se activan
- **group_id ya existe:** El campo `group_id` en `scheduled_activities` fue disenado para este caso. Las copias comparten group_id para correlacion
- **Exit activity race condition:** Si multiples lotes tienen exit activities y dos operadores las ejecutan simultaneamente, solo la primera debe triggear `completePhase`. Usar check de idempotencia: `if (phase.status === "completed") return` (ya esta en US-FEAT.3)
- **batch_movements auditoria:** La tabla ya existe y trackea movimientos fisicos. Usarla para registrar cambios de area por fase

### Riesgos

| Riesgo | Impacto | Mitigacion |
|--------|---------|-----------|
| N lotes × M actividades = N×M scheduled_activities | MEDIO | distribution_strategy "shared" para actividades comunes. Ordenes tipicas: 1-5 lotes |
| Race condition en exit activities multi-batch | MEDIO | Idempotencia en handlePhaseExitExecution (ya planificado) |
| Cambio de area sin capacidad | BAJO | Validacion de capacidad pre-movimiento |

### Performance

- Distribucion agrega N×M inserts durante `activate` — operacion infrecuente (1 vez por orden)
- Index `by_entity` permite queries eficientes por lote
- `group_id` index permite agrupar actividades correlacionadas

## Out of Scope

- **Split/merge de lotes:** Dividir un lote en dos o fusionar lotes es feature independiente (usa `parent_batch_id`/`merged_into_batch_id`)
- **Distribucion proporcional de recursos:** Recursos se duplican identicos por lote. Distribucion proporcional por cantidad de plantas es feature futura
- **Reasignacion automatica de area por reglas:** Las reglas de "floracion siempre va a Area B" no se incluyen. Es asignacion manual por fase

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits
-

### Archivos Modificados
-

### Fecha de Completado
-
