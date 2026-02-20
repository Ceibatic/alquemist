# Subpaginas de Templates

## `/templates/new` — Wizard de Creacion de Template de Produccion

Wizard de 2 pasos para crear un template de produccion:

### Paso 1 — Datos basicos
- Nombre (requerido)
- Tipo de cultivo (requerido, dropdown) — al seleccionar, pre-carga fases desde `crop_types.default_phases`
- Cultivar (opcional, filtrado por tipo de cultivo)
- Categoria: Semilla a Cosecha / Propagacion / Personalizado
- Metodo de produccion: Indoor / Outdoor / Invernadero
- Fuente del material: Semilla / Clon / Cultivo de Tejido
- Descripcion

### Paso 2 — Fases
- Lista de fases con drag & drop (@dnd-kit/sortable) para reordenar
- Botones de flecha como alternativa al drag
- Dialog para crear/editar fase: nombre, duracion (dias), tipo de area, descripcion
- Timeline bar visual con duracion proporcional
- Total de dias y count de fases

### Al guardar
1. Crea template via `productionTemplates.create`
2. Crea cada fase secuencialmente via `templatePhases.create`
3. Redirige a `/templates/[id]` (detalle)

### Indicador de progreso
Dots conectados con linea, paso activo en amber-500, paso completado con checkmark en amber-100.

**Breadcrumbs**: Inicio > Templates > Nuevo Template

**Componentes**:
- `components/templates/template-create-wizard.tsx` — wizard principal
- `components/templates/wizard-step-basic.tsx` — paso 1
- `components/templates/wizard-step-phases.tsx` — paso 2
- `components/templates/phase-create-dialog.tsx` — dialog crear/editar fase

**Ruta**: `app/(dashboard)/templates/new/page.tsx`

---

## `/templates/[id]` — Detalle de Template de Produccion

Muestra informacion y fases de un template de produccion:
- **Header**: nombre, breadcrumbs, acciones (duplicar, editar)
- **Info card**: grid responsivo con tipo de cultivo, cultivar, categoria, metodo, duracion total, tamano batch, rendimiento estimado, dificultad, veces usado
- **Timeline bar**: visualizacion proporcional de fases con colores
- **Fases**: lista ordenada de cards clickables → navegan a `/templates/[id]/phases/[phaseId]`:
  - Badge numero + nombre
  - Duracion en dias + tipo de area
  - Count badges de actividades agrupados por tipo (con color por tipo)
- **Breadcrumbs**: Inicio > Templates > [nombre]

**Query**: `api.productionTemplates.getById` — retorna template con fases y actividades

**Ruta**: `app/(dashboard)/templates/[id]/page.tsx`

---

## `/templates/[id]/phases/[phaseId]` — Detalle de Fase con Cronograma

Muestra info de la fase y un cronograma dia a dia:

### Info card
Grid con nombre de fase, duracion, tipo de area, descripcion.

### Cronograma
Lista de Dia 1, Dia 2, ..., Dia N (segun `estimated_duration_days`):
- Cada dia muestra actividades que inician o estan en curso ese dia
- **Actividades de un dia**: aparecen en su dia de inicio (`timing_configuration.days_from_phase_start`)
- **Actividades multi-dia**: si `duration_type === "days"` y `duration_value > 1`, aparecen tambien en los dias siguientes con badge "Dia X/N"
- Cada actividad muestra nombre, badge tipo (con color), duracion, count de recursos, icono recurrente
- **Boton "+" por dia**: abre dialog para agregar actividad en ese dia

### Add Activity Dialog
1. Seleccionar tipo de actividad (dropdown desde `activity_types`)
2. Seleccionar activity template (filtrado por tipo + fase)
3. Preview: nombre editable, duracion readonly, descripcion truncada
4. Dia de inicio editable
5. Guardar via `templateActivities.createFromActivityTemplate` con `startDay`

**Breadcrumbs**: Inicio > Templates > [nombre template] > [nombre fase]

**Query**: `api.templatePhases.getById` — retorna fase con actividades enriquecidas (duration_type, duration_value, resource_count)

**Componentes**:
- `components/templates/phase-detail-view.tsx` — vista principal
- `components/templates/add-activity-dialog.tsx` — dialog agregar actividad

**Ruta**: `app/(dashboard)/templates/[id]/phases/[phaseId]/page.tsx`

---

## `/templates/[id]/edit` — Edicion de Template de Produccion

Editor del template de produccion:
- Informacion basica (nombre, tipo cultivo, categoria, descripcion)
- Editor de fases: agregar, reordenar, eliminar fases
- Asignar actividades a cada fase
- Guardar cambios o cancelar
- **Breadcrumbs**: Inicio > Templates > [nombre] > Editar

**Ruta**: `app/(dashboard)/templates/[id]/edit/page.tsx`

## `/activity-templates/[id]` — Wizard de Activity Template

Reutiliza el wizard de 4 pasos (ver [wizard-actividades.md](./wizard-actividades.md)):
- Si `[id]` = "new": modo creacion
- Si `[id]` = ID existente: modo edicion, carga datos
- **Breadcrumbs**: Inicio > Templates > Actividades > [nombre/Nuevo]

**Ruta**: `app/(dashboard)/activity-templates/[id]/page.tsx`

## `/quality-checks/templates/[id]` — Detalle de QC Template

Muestra informacion completa de un template de control de calidad:
- **Header**: nombre, tipo cultivo, tipo procedimiento, nivel inspeccion
- **Badges**: regulatorio, AI, compliance standard
- **Preview del formulario**: vista previa de las secciones y campos definidos
- **Etapas aplicables**: lista de fases del cultivo donde se usa
- **Stats**: usos totales, tiempo promedio de completado
- **Breadcrumbs**: Inicio > Templates > Calidad > [nombre]

**Ruta**: `app/(dashboard)/quality-checks/templates/[id]/page.tsx`

## `/quality-checks/inspections/[id]` — Detalle de Inspeccion Ejecutada

Muestra una inspeccion completada:
- **Header**: template usado, entidad inspeccionada (batch/planta), fecha, inspector
- **Resultados**: respuestas del formulario completado
- **Resultado general**: pass/fail/conditional, score, notas
- **Analisis AI** (si aplica): resultados del analisis automatico
- **Breadcrumbs**: Inicio > Templates > Calidad > Inspecciones > [id]

**Ruta**: `app/(dashboard)/quality-checks/inspections/[id]/page.tsx`

## Nota sobre ActivityExecutionSheet

El formulario de reporte de actividad (`ActivityExecutionSheet`) NO es una subpagina de Templates. Es un sheet (panel lateral) que pertenece al modulo de Actividades y se usa desde areas, batches y ordenes de produccion. Se documentara en el modulo de Actividades.
