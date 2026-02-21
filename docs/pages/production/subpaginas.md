# Subpaginas de Produccion

## `/production/activities/[id]` — Detalle de Actividad Programada

Muestra toda la informacion de una actividad programada:

### Header
- Breadcrumbs: Inicio > Produccion > Actividades > [tipo actividad]
- Acciones: boton "Reportar" (primary) + menu "..." (Editar, Saltar, Reprogramar)

### Card Info Basica (grid 2 cols)
- Estado (badge con color)
- Fecha programada
- Duracion estimada
- Prioridad
- Asignado a
- Lote (link a `/batches/[id]`)
- Area
- Fase
- Template usado (link a `/activity-templates/[id]`)
- Fuente: template / manual / adhoc

### Card Instrucciones
Solo visible si hay instrucciones. Muestra texto completo.

### Card Recursos
Solo visible si hay recursos materializados. Tabla con:
- Producto | Cantidad | Base de calculo | Direccion | Requerido

Query: `scheduledActivities.getResourcesForActivity`

### Card Ejecucion
Solo visible si status es `completed` o `in_progress`. Muestra datos de la actividad ejecutada:
- Realizado por
- Fecha real
- Duracion real
- Observaciones
- Notas

### Acciones inline
- **Reportar**: abre `ActivityExecutionSheet` existente
- **Saltar**: dialog con textarea razon → `cultivationSchedules.skipScheduledActivity`
- **Reprogramar**: dialog con date picker → `cultivationSchedules.rescheduleActivity`
- **Editar**: navega a `/production/activities/[id]/edit`

**Query principal**: `scheduledActivities.getById` (nuevo)

**Componentes**:
- `app/(dashboard)/production/activities/[id]/page.tsx`
- `components/production/activity-detail-page.tsx`

---

## `/production/activities/new` — Wizard Nueva Actividad

Wizard de 4 pasos para programar una actividad no planeada.

### Indicador de progreso
Dots conectados con linea, paso activo en amber-500, paso completado con checkmark en amber-100.

### Paso 1 — Seleccionar Area
- Query: `api.areas.getByFacility`
- Radio cards: nombre area, tipo (badge), capacidad/ocupacion
- Requerido: debe seleccionar una area

### Paso 2 — Seleccionar Lotes
- Lotes filtrados por el area seleccionada
- Listado con checkbox: codigo lote, cultivar, fase actual, # plantas, estado
- Requerido: al menos un lote

### Paso 3 — Seleccionar Template de Actividad
- Selector de tipo de actividad (dropdown desde `activityTypes.list`)
- Cards de templates filtradas por tipo (desde `activityTemplates.list`)
- Card muestra: nombre, frecuencia, duracion, indicador QC
- Seleccionar template pre-llena paso 4 con todos sus valores
- Puede avanzar sin template (adhoc)

### Paso 4 — Revisar y Configurar
Todos los campos son editables, pre-cargados desde el template si se selecciono uno:
- Fecha (date picker, requerido)
- Asignado a (select usuarios)
- Prioridad (routine/urgent/critical)
- Duracion estimada (minutos)
- Instrucciones (textarea)
- **Recursos (editables)**: tabla con producto, cantidad, base, direccion, requerido
  - Agregar nuevos recursos (buscador de productos)
  - Eliminar recursos pre-cargados
  - Modificar cantidades y configuracion
- QC template (selector, pre-seleccionado desde template)

### Al guardar
Llama a `scheduledActivities.createManual` y redirige a `/production`

**Breadcrumbs**: Inicio > Produccion > Nueva Actividad

**Componentes**:
- `app/(dashboard)/production/activities/new/page.tsx`
- `components/production/schedule-activity-wizard.tsx`
- `components/production/wizard-step-select-area.tsx`
- `components/production/wizard-step-select-batches.tsx`
- `components/production/wizard-step-select-template.tsx`
- `components/production/wizard-step-review.tsx`

---

## `/production/activities/[id]/edit` — Wizard Edicion de Actividad

Wizard de 2 pasos para editar una actividad programada (solo pending o in_progress).

### Paso 1 — Detalles
Pre-llenado con datos actuales:
- Fecha
- Asignado a
- Prioridad
- Instrucciones
- Duracion estimada

### Paso 2 — Recursos
Solo visible si hay recursos. Lista de recursos materializados con quantity_override editable.

### Al guardar
Llama a `scheduledActivities.update` (nuevo mutation) y redirige al detalle.

**Breadcrumbs**: Inicio > Produccion > [tipo actividad] > Editar

**Componentes**:
- `app/(dashboard)/production/activities/[id]/edit/page.tsx`
- `components/production/edit-activity-wizard.tsx`
