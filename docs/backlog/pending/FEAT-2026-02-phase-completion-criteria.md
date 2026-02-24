# FEAT-2026-02-phase-completion-criteria

## Metadata
- **Creado:** 2026-02-23
- **Prioridad:** low
- **Modulo relacionado:** M24-production-orders, M22-production-templates
- **Tipo:** enhancement
- **Prerequisito:** FEAT-2026-02-phase-role-activities

## Descripcion

Dos capacidades de baja prioridad que complementan el sistema de fases de produccion: (1) criterios de completitud configurables por fase (checklists que deben cumplirse antes de cerrar), y (2) reasignacion de actividades entre fases via drag & drop.

El campo `completion_criteria` ya existe en `template_phases` (schema.ts) pero nunca se usa. Este feature lo activa y le da UI.

### Contexto del codebase

- `template_phases.completion_criteria: v.optional(v.any())` — campo existente, sin uso ni estructura definida
- `scheduled_activities` no tiene FK directa a `order_phases` (se agrega en FEAT-2026-02-phase-role-activities via `order_phase_id`)
- No hay patron de checklist en el codebase actualmente

## User Stories

### US-CRIT.1: Definir criterios de completitud en template de fase

**Como** administrador
**quiero** definir una checklist de criterios que deben cumplirse para completar una fase
**para** asegurar calidad y consistencia en las transiciones de fase

#### Criterios de Aceptacion
- [ ] Definir estructura de `completion_criteria` en `template_phases`:
  ```
  completion_criteria: v.optional(v.array(v.object({
    id: v.string(),           // UUID
    label: v.string(),        // "pH del sustrato entre 5.8-6.2"
    type: v.string(),         // "manual_check" | "metric_range" | "activity_completed"
    config: v.optional(v.any()), // configuracion especifica por tipo
    is_required: v.boolean(), // si es obligatorio para completar fase
  })))
  ```
- [ ] Tipo `manual_check`: checkbox simple que el operador marca manualmente
- [ ] Tipo `metric_range`: se autocompleta si la ultima medicion del batch esta dentro de rango (ej: pH 5.8-6.2)
- [ ] Tipo `activity_completed`: se autocompleta cuando una actividad especifica se ejecuta
- [ ] UI en template editor: seccion "Criterios de completitud" en detalle de fase
  - Lista editable de criterios con label, tipo y configuracion
  - Boton "Agregar criterio" con selector de tipo
  - Drag handle para reordenar
- [ ] Criterios se propagan a `order_phases.completion_criteria` al crear orden desde template
- [ ] `npx next build` pasa sin errores

#### Backend
- Schema: definir estructura de `template_phases.completion_criteria` (ya existe como `v.any()`)
- Schema: agregar `order_phases.completion_criteria` y `order_phases.criteria_status` (estado por criterio)
- Mutation: `productionTemplates.updatePhase` acepta `completion_criteria`
- Mutation: `productionOrders.create` propaga criterios a order_phases

#### Frontend
- `components/templates/phase-criteria-editor.tsx`: editor de criterios en template
- Integrado en vista de detalle de fase del template

#### Dependencias
- Ninguna (standalone para templates)

---

### US-CRIT.2: Validar criterios antes de completar fase

**Como** sistema
**quiero** verificar que todos los criterios requeridos se cumplan antes de permitir la transicion de fase
**para** prevenir transiciones prematuras que comprometan la calidad

#### Criterios de Aceptacion
- [ ] Al ejecutar exit activity (FEAT phase-role-activities US-FEAT.3):
  - Verificar `order_phases.criteria_status` — todos los criterios `is_required` deben estar `completed`
  - Si hay criterios pendientes: rechazar con error listando cuales faltan
  - Criterios no-required pueden estar pendientes sin bloquear
- [ ] En detalle de orden, phase card muestra:
  - Checklist visual con estado de cada criterio (check verde / pendiente gris / fallido rojo)
  - Progreso: "{completados}/{total} criterios"
  - Criterios `metric_range` muestran valor actual vs rango esperado
- [ ] Mutation `productionOrders.updateCriterionStatus(orderId, phaseId, criterionId, status)`:
  - Para `manual_check`: toggle completado/pendiente
  - Para `metric_range`: se calcula automaticamente al registrar medicion
  - Para `activity_completed`: se marca automaticamente al ejecutar la actividad
- [ ] `completePhase` (admin override) puede saltarse criterios con warning
- [ ] Exit activity con criterios pendientes muestra warning en wizard: "Hay {N} criterios pendientes. Complete los criterios antes de reportar esta actividad."

#### Backend
- Mutation nueva: `productionOrders.updateCriterionStatus`
- Mutation modificada: `handlePhaseExitExecution` (validar criterios)
- Query nueva: `productionOrders.getPhaseCriteriaStatus(orderId, phaseId)`

#### Frontend
- `components/production/phase-criteria-checklist.tsx`: checklist interactiva
- Integrado en phase card del detalle de orden
- Warning en report-activity-wizard si criterios pendientes

#### Dependencias
- Requiere: US-CRIT.1
- Requiere: FEAT-2026-02-phase-role-activities (para exit activity validation)

---

### US-CRIT.3: Reasignar actividades entre fases via drag & drop

**Como** administrador de produccion
**quiero** mover actividades programadas de una fase a otra arrastrando
**para** ajustar el plan cuando las circunstancias cambian

#### Criterios de Aceptacion
- [ ] En detalle de orden, vista de timeline de fases:
  - Actividades regulares son draggable entre fases
  - Actividades con `phase_role: "entry"` o `"exit"` NO son draggable (estan ligadas a su fase)
  - Drop zone visual en cada fase que acepta actividades
- [ ] Al mover actividad:
  - Mutation `scheduledActivities.reassignPhase(activityId, newPhaseId)`:
    - Actualizar `order_phase_id` al nuevo phase
    - Actualizar `scheduled_date` si cae fuera del rango de la nueva fase
    - Solo actividades con status `pending` pueden moverse
  - Toast: "Actividad '{name}' movida a fase '{phaseName}'"
- [ ] Validacion: actividades `completed`, `in_progress` o `skipped` no pueden moverse
- [ ] Actividades con `group_id`: ofrecer "Mover solo esta" o "Mover grupo completo"
- [ ] Historial: registrar el movimiento en la actividad (`previous_phase_id` o similar)

#### Backend
- Mutation nueva: `scheduledActivities.reassignPhase`
- Validacion: status pending, no phase_role entry/exit

#### Frontend
- Libreria de drag & drop (usar `@dnd-kit/core` si ya esta en el proyecto, sino evaluar)
- `components/production/phase-activity-timeline.tsx`: drag & drop entre fases
- Integrado en detalle de orden

#### Dependencias
- Requiere: FEAT-2026-02-phase-role-activities (para `order_phase_id` y `phase_role`)

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `template_phases` | `completion_criteria` | `v.optional(v.array(v.object({...})))` | Estructura definida (ya existe como `v.any()`) |
| `order_phases` | `completion_criteria` | `v.optional(v.array(v.object({...})))` | Propagado desde template |
| `order_phases` | `criteria_status` | `v.optional(v.array(v.object({...})))` | Estado por criterio (completed/pending/failed) |

## Consideraciones Tecnicas

- **`completion_criteria` ya existe como `v.any()`** — no es breaking change definir su estructura, solo se empieza a usar
- **Drag & drop:** Evaluar si `@dnd-kit/core` ya es dependencia del proyecto antes de agregar nueva libreria
- **Criterios `metric_range`:** Requiere integracion con sistema de mediciones (env measurements en `executeActivity`). Puede simplificarse a solo `manual_check` en primera iteracion
- **Performance:** Criteria validation agrega 1 query adicional al ejecutar exit activity (solo cuando hay criterios definidos)

## Out of Scope

- **Criterios automatizados por sensores IoT:** Integracion con sensores externos para auto-completar criterios
- **Templates de criterios reutilizables:** Los criterios se definen por fase, no hay libreria compartida
- **Notificaciones por criterios vencidos:** No hay alertas push cuando criterios llevan mucho tiempo pendientes

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits
-

### Archivos Modificados
-

### Fecha de Completado
-
