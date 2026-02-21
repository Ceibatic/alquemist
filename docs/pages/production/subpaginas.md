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
- **Reportar**: navega a `/production/activities/[id]/report` (wizard de ejecucion)
- **Saltar**: dialog con textarea razon → `cultivationSchedules.skipScheduledActivity`
- **Reprogramar**: dialog con date picker → `cultivationSchedules.rescheduleActivity`
- **Editar**: navega a `/production/activities/[id]/edit`

**Query principal**: `scheduledActivities.getById` (nuevo)

**Componentes**:
- `app/(dashboard)/production/activities/[id]/page.tsx`
- `components/production/activity-detail-page.tsx`

---

## `/production/activities/[id]/report` — Wizard Reporte de Actividad

Wizard de pagina completa con pasos dinamicos (1 a 3) para reportar/ejecutar una actividad programada. Reemplaza el Sheet lateral en el detalle de actividad.

### Pasos dinamicos

| Condicion | Pasos visibles |
|-----------|---------------|
| Sin recursos, sin QC | [Ejecucion] — 1 paso |
| Con recursos, sin QC | [Ejecucion, Recursos] — 2 pasos |
| Sin recursos, con QC | [Ejecucion, Calidad] — 2 pasos |
| Con recursos y QC | [Ejecucion, Recursos, Calidad] — 3 pasos |

### Indicador de progreso
Circular badges con iconos (ClipboardCheck, Package, ShieldCheck), amber-500 activo, amber-100 completado con check. Solo visible si hay mas de 1 paso.

### Paso 1 — Ejecucion

**Card contexto (read-only):**
- Tipo actividad, fecha programada, duracion estimada, lote, area, fase, template, fuente, instrucciones

**Card datos de ejecucion (editable):**
- Fecha (date, requerido, pre-llenado hoy)
- Responsable (select usuarios, requerido, pre-llenado usuario actual)
- Duracion (minutos, si visible en template)
- Observaciones (textarea, si visible)
- Datos ambientales: Temp, Humedad, pH, EC (si visible)
- Costos: Estimado, Real (si visible)

### Paso 2 — Recursos (condicional)

Solo se muestra si hay recursos materializados en `scheduled_activity_resources`.

- Lista de recursos con cantidades editables (reutiliza `ResourceEditorInline`)
- Si multi-lote: selector de distribucion (identico / dividir proporcional)

### Paso 3 — Calidad (condicional)

Solo se muestra si el template tiene `quality_check_template_id`.

- Formulario QC dinamico via `DynamicFormRenderer`
- Resultado general: Aprobado / Condicional / Rechazado
- Notas de calidad
- Requiere seguimiento (checkbox + fecha)
- Boton "Omitir Calidad" para saltar

### Flujo de submit

La actividad se crea ANTES del paso de calidad (QC necesita la entidad para linkear):
- Sin QC: "Completar Actividad" → crear actividad → navegar a detalle
- Con QC: "Siguiente: Calidad" → crear actividad → paso QC → "Completar con Calidad" → crear quality check

**Hook principal**: `useActivityExecution` (reutilizado del `ActivityExecutionSheet`)

**Componentes**:
- `app/(dashboard)/production/activities/[id]/report/page.tsx`
- `components/production/report-activity-wizard.tsx`
- `components/production/report-step-execution.tsx`
- `components/production/report-step-resources.tsx`
- `components/production/report-step-quality.tsx`

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

---

## `/production/orders/[id]` — Detalle de Orden de Produccion

Detalle completo de una orden con layout estilo template: info card + timeline + phase cards clickables.

### Header
- Breadcrumbs: Inicio > Produccion > Ordenes > [order_number]
- Acciones: boton "Activar" (green, solo planning) + dropdown menu (Cancelar)

### Card Estado + Progreso
- StatusBadge con colores por status (planning=amber, active=blue, completed=green, cancelled=red)
- Progress bar con porcentaje de completitud

### Card Informacion (grid 4 cols, InfoRow)
- Tipo Cultivo, Cultivar, Template (link), Instalacion
- Tipo Orden, Fuente, Prioridad
- Fecha Inicio, Fecha Est. Fin, Fecha Entrega
- Plantas Planificadas, Plantas Actuales, Lotes
- Notas

### Seccion Lotes
Reutiliza `OrderBatchSummary` existente.

### Seccion Fases
- Header "Fases ({count})" con timeline bar visual
- Phase cards clickables con: badge numerico (amber) o check (completada), nombre, fechas concretas ("01 Mar — 15 Mar"), area, activity type badges, status badge, boton "Completar" inline si `in_progress`
- Click en fase → `/production/orders/[id]/phases/[phaseId]`

**Query principal**: `productionOrders.getById`

**Componentes**:
- `app/(dashboard)/production/orders/[id]/page.tsx`

---

## `/production/orders/[id]/phases/[phaseId]` — Detalle de Fase de Orden

Detalle de una fase con schedule de actividades organizadas por dia. Sigue el patron de `templates/phase-detail-view.tsx`.

### Header
- Breadcrumbs: Inicio > Produccion > [order_number] > [phase_name]

### Card Info (grid 4 cols)
- Fase, Duracion (dias calculados), Fechas (start — end), Estado (badge), Area

### Schedule por Dia
Cada dia del rango `planned_start_date → planned_end_date` muestra:
- Label del dia ("Lun 01 Mar") con highlight amber si es hoy
- Grid de activity cards con borde izquierdo coloreado por categoria (CATEGORY_COLORS)
- Cada card: nombre, badge de tipo, duracion estimada, badge de status
- Boton "+" para agregar actividad → abre `AddOrderActivityDialog`

### Dialog Agregar Actividad
- Select tipo de actividad (`activityTypes.list`)
- Select activity template filtrado por tipo (`activityTemplates.list`, opcional)
- Preview: nombre editable, duracion, descripcion
- Fecha programada (date input, restringido al rango de la fase)
- Guardar → `scheduledActivities.createForOrder`

**Query principal**: `orderPhases.getById`

**Componentes**:
- `app/(dashboard)/production/orders/[id]/phases/[phaseId]/page.tsx`
- `components/production-orders/order-phase-detail-view.tsx`
- `components/production-orders/add-order-activity-dialog.tsx`

---

## `/production/orders/new` — Wizard Creacion de Orden

Wizard de 2 pasos para crear una orden de produccion, con o sin template.

### Indicador de progreso
Pills con iconos (FileText, Layers), amber-500 activo, amber-100 completado con check.

### Paso 1 — Datos Basicos

4 Cards:

**Card Template (opcional)**:
- Select de production templates. Al seleccionar, pre-llena crop type + cultivar + batch size.

**Card Informacion del Cultivo**:
- Crop Type (requerido), Cultivar, Order Type, Source Type

**Card Cantidades**:
- Requested Quantity, Batch Size, Fecha inicio planificada (date input)

**Card Configuracion**:
- Prioridad, Notas

### Paso 2 — Fases

**Con template seleccionado:**
- Preview read-only de fases del template con fechas auto-calculadas desde fecha de inicio
- El usuario puede ver y confirmar las fases

**Sin template:**
- Lista editable de fases con drag-and-drop (`@dnd-kit/sortable`)
- Boton "Agregar fase" abre dialog con nombre + duracion en dias
- Fechas se calculan automaticamente desde la fecha de inicio

### Al guardar
- Con template: llama `productionOrders.create` con `templateId` (backend crea fases + activities)
- Sin template: llama `productionOrders.create` sin template, luego loop `orderPhases.create` por cada fase

**Breadcrumbs**: Inicio > Produccion > Nueva Orden

**Componentes**:
- `app/(dashboard)/production/orders/new/page.tsx`
- `components/production-orders/order-create-wizard.tsx`
- `components/production-orders/order-wizard-step-basic.tsx`
- `components/production-orders/order-wizard-step-phases.tsx`
