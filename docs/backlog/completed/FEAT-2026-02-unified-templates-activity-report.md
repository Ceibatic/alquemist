# FEAT-2026-02-unified-templates-activity-report

## Metadata
- **Creado:** 2026-02-11
- **Prioridad:** high
- **Modulo relacionado:** M22-production-templates, M23-ai-quality-checks
- **Tipo:** feature

## Descripcion

Unificar en una sola pagina `/templates` los tres modulos de configuracion de plantillas: Templates de Produccion (como estan), Templates de Actividades (con wizard mejorado), y Formularios de Calidad (quality check templates). Esto simplifica la navegacion eliminando dos entradas del sidebar (`Templates Actividad`, `Control de Calidad`) y centraliza toda la configuracion de plantillas en un solo lugar.

Adicionalmente, se crea un componente reutilizable de **Formulario de Reporte de Actividad** (Sheet/Drawer lateral) que funciona con cualquier activity template y se puede invocar desde scheduled activities, detalle de area, detalle de lote, o cualquier contexto donde se reporte una actividad. Este formulario renderiza campos esenciales + campos opcionales configurados en el template + recursos pre-cargados, y opcionalmente abre un paso separado para el formulario de calidad vinculado.

## User Stories

### US-TPL.1: Pagina unificada de templates con tabs

**Como** administrador de operaciones
**quiero** ver todos los tipos de templates (produccion, actividades, calidad) en una sola pagina con tabs
**para** gestionar toda la configuracion de plantillas desde un solo punto de acceso sin navegar entre multiples paginas

#### Criterios de Aceptacion
- [ ] La pagina `/templates` muestra 3 tabs: "Produccion" | "Actividades" | "Calidad"
- [ ] Tab "Produccion" renderiza el contenido actual de `/templates` (TemplateList) sin cambios funcionales
- [ ] Tab "Actividades" renderiza el listado de activity templates con filtros por fase y busqueda
- [ ] Tab "Calidad" renderiza el listado de quality check templates con filtros por tipo de cultivo y busqueda
- [ ] Cada tab muestra sus propios CompactStats relevantes (contadores, metricas)
- [ ] La URL refleja el tab activo via query param (`/templates?tab=activities`, `/templates?tab=quality`) para permitir deep linking
- [ ] El sidebar muestra un solo item "Templates" en lugar de tres items separados
- [ ] Las rutas `/activity-templates` y `/quality-checks` redirigen a `/templates?tab=activities` y `/templates?tab=quality` respectivamente (backward compatibility)

#### Frontend
- Componente: `app/(dashboard)/templates/page.tsx` (modificar pagina existente)
- Componentes reutilizados: `ActivityTemplateList`, `QCTemplateList` (adaptar de paginas actuales)
- Estados UI: loading skeleton por tab, empty state por tab

#### Backend
- Sin cambios en queries/mutations — solo se reorganiza la UI

#### Dependencias
- Relacionado: M22-production-templates, M23-ai-quality-checks

---

### US-TPL.2: Wizard mejorado de activity templates — Tipo y campos del formulario

**Como** administrador de operaciones
**quiero** crear activity templates con un wizard paso a paso donde selecciono el tipo de actividad y los campos opcionales que apareceran en el formulario de reporte
**para** configurar exactamente que informacion se captura al reportar cada tipo de actividad

#### Criterios de Aceptacion
- [x] El wizard tiene 4 pasos con indicador de progreso: 1) Tipo y basico, 2) Campos del formulario, 3) Recursos, 4) Configuracion final
- [x] **Paso 1 — Tipo y basico**: nombre (requerido), codigo (auto-generado), tipo de actividad (requerido, dropdown de activity_types), prioridad (routine/urgent/critical), descripcion, fases aplicables (badge toggles), rango de dias en fase (opcional)
- [x] **Paso 2 — Campos del formulario**: lista de campos opcionales predefinidos con checkboxes. Campos disponibles:
  - Observaciones / Notas (textarea)
  - Datos ambientales: Temperatura, Humedad, pH, EC/Conductividad
  - Duracion real (minutos)
  - Costo estimado / Costo real
  - Checklist de verificacion (habilita el ChecklistEditor existente)
  - Responsable adicional (para actividades con multiples operarios)
- [x] Los campos marcados como seleccionados se almacenan en el activity template como `form_fields` (array de strings con los IDs de campos habilitados)
- [x] Campos esenciales (fecha, responsable, lote, area, fase) siempre se incluyen y no son deseleccionables — se muestran con icono de candado
- [x] Se puede navegar entre pasos sin perder datos (estado local persistente en el wizard)
- [x] En modo edicion, el wizard carga los datos existentes del template en cada paso

#### Backend
- Schema change: `activity_templates.form_fields` — nuevo campo `v.optional(v.array(v.string()))` para almacenar IDs de campos opcionales habilitados
- Mutation: `api.activityTemplates.create` y `api.activityTemplates.update` — agregar campo `formFields`

#### Frontend
- Componente: `components/activity-templates/activity-template-wizard.tsx` (nuevo)
- Componente: `components/activity-templates/wizard-step-basic.tsx` (nuevo)
- Componente: `components/activity-templates/wizard-step-fields.tsx` (nuevo)
- Estados UI: paso activo con indicador visual, validacion por paso antes de avanzar

#### Dependencias
- Requiere: US-TPL.1 (debe existir el tab de Actividades)

---

### US-TPL.3: Wizard mejorado — Seleccion de recursos tipo carrito

**Como** administrador de operaciones
**quiero** seleccionar los recursos (productos) que una actividad requiere usando un buscador con sistema tipo carrito donde agrego productos y defino cantidades inline
**para** configurar rapidamente los insumos necesarios sin navegar entre multiples dialogos

#### Criterios de Aceptacion
- [x] **Paso 3 — Recursos**: se muestra un buscador de productos con campo de texto que filtra en tiempo real por nombre o codigo
- [x] Al encontrar un producto, se muestra en una lista de resultados con nombre, codigo, unidad base y boton "Agregar"
- [x] Al hacer click en "Agregar", el producto se anade a la lista de "Recursos seleccionados" debajo del buscador
- [x] En la lista de recursos seleccionados, cada item muestra inline: nombre del producto, input de cantidad (number), selector de base (fijo/por planta/por m²/por zona/por L solucion), selector de direccion (consumido/aplicado/producido), boton de eliminar
- [x] Se puede editar la cantidad directamente en la lista sin abrir un dialogo separado
- [x] Opcionalmente se puede expandir cada recurso para ver/editar campos adicionales: metodo de aplicacion, tasa de aplicacion, notas, es requerido (toggle)
- [ ] Los recursos se muestran con subtotales visuales (cantidad × base)
- [x] Al guardar el template, todos los recursos se persisten en `activity_template_resources`
- [x] Si el template ya tiene recursos (modo edicion), se cargan al abrir el paso

#### Backend
- Sin cambios en schema — usa la tabla existente `activity_template_resources`
- Reutiliza mutations: `api.activityTemplates.addResource`, `removeResource`, `updateResource`
- Query adicional: busqueda de productos con filtro de texto (reutilizar `api.products.list` o `api.products.search`)

#### Frontend
- Componente: `components/activity-templates/wizard-step-resources.tsx` (nuevo)
- Componente: `components/activity-templates/resource-cart-item.tsx` (nuevo)
- Estados UI: busqueda con debounce, lista vacia, producto ya agregado (deshabilitado en resultados)

#### Dependencias
- Requiere: US-TPL.2 (paso previo del wizard)

---

### US-TPL.4: Wizard mejorado — Configuracion final (calidad, fotos, recurrencia)

**Como** administrador de operaciones
**quiero** en el paso final del wizard configurar si la actividad requiere formulario de calidad, registro fotografico, y la recurrencia
**para** completar la definicion del template con todos los requisitos de documentacion y frecuencia

#### Criterios de Aceptacion
- [x] **Paso 4 — Configuracion final** incluye:
  - **Seccion Calidad**: checkbox "Requiere formulario de calidad". Si se activa, muestra un selector dropdown/searchable con los quality_check_templates disponibles (filtrados por empresa). Muestra preview del nombre y tipo de procedimiento del template seleccionado
  - **Seccion Documentacion**: checkbox "Requiere registro fotografico" y checkbox "Requiere archivos adjuntos". Si se activan, estas flags se guardan en el template
  - **Seccion Recurrencia**: frecuencia (unica/diaria/semanal/bisemanal/mensual/a demanda/custom dias), intervalo personalizado (si custom), conteo de repeticiones (opcional)
  - **Seccion Dependencias** (colapsable): template dependencia, dias minimos despues, referencia regulatoria, requiere verificacion
- [x] El campo `quality_check_template_id` se almacena en `activity_templates` para vincular el formulario de calidad
- [x] Los campos `requires_photos` y `requires_attachments` se almacenan en `activity_templates`
- [x] Al guardar, se ejecuta la mutation de creacion/actualizacion con todos los datos de los 4 pasos
- [x] Despues de guardar exitosamente, se navega al detalle del template creado con toast de confirmacion
- [x] El boton "Guardar" valida todos los pasos: nombre requerido, tipo requerido, al menos una fase

#### Backend
- Schema changes en `activity_templates`:
  - `quality_check_template_id`: `v.optional(v.id("quality_check_templates"))` (nuevo campo)
  - `requires_photos`: `v.optional(v.boolean())` (nuevo campo)
  - `requires_attachments`: `v.optional(v.boolean())` (nuevo campo)
  - `form_fields`: `v.optional(v.array(v.string()))` (del US-TPL.2)
- Mutation: actualizar `api.activityTemplates.create` y `update` para aceptar los nuevos campos

#### Frontend
- Componente: `components/activity-templates/wizard-step-config.tsx` (nuevo)
- Query: `api.qualityCheckTemplates.list` para el selector de QC templates
- Estados UI: preview del QC template seleccionado, validacion cruzada entre pasos

#### Dependencias
- Requiere: US-TPL.3 (paso previo del wizard)
- Relacionado: M23-ai-quality-checks (quality check templates)

---

### US-TPL.5: Formulario de reporte de actividad — Componente base

**Como** operador de campo
**quiero** un formulario lateral (drawer/sheet) para reportar actividades que se adapta automaticamente segun el template de la actividad
**para** registrar rapidamente la ejecucion de actividades con la informacion correcta sin formularios genericos

#### Criterios de Aceptacion
- [x] El componente `ActivityReportSheet` se abre como Sheet lateral (derecha) con ancho adecuado (~500px desktop, full en mobile)
- [x] **Props requeridos**: `activityTemplateId` (o template inline), `entityType` (batch/plant/area), `entityId`, `areaId`, `facilityId`, `scheduledActivityId` (opcional, si viene de una actividad programada)
- [x] **Seccion esencial** (siempre visible): fecha de actividad (default hoy), responsable (default usuario actual), lote (pre-llenado si viene de contexto), area (pre-llenado), fase del cultivo (pre-llenado)
- [x] **Seccion campos opcionales**: renderiza solo los campos habilitados en `template.form_fields`:
  - `observations`: textarea de observaciones/notas
  - `environmental_temp`: input numerico para temperatura (°C)
  - `environmental_humidity`: input numerico para humedad (%)
  - `environmental_ph`: input numerico para pH
  - `environmental_ec`: input numerico para EC (mS/cm)
  - `duration_minutes`: input numerico para duracion real
  - `estimated_cost` / `actual_cost`: inputs numericos para costos
  - `additional_responsible`: selector de usuario adicional
  - `checklist`: renderiza los checklist items del template como checkboxes
- [x] **Seccion recursos**: si el template tiene recursos, muestra una tabla editable con los productos pre-cargados. El usuario puede ajustar cantidades reales consumidas
- [x] El sheet tiene header fijo con titulo (nombre de actividad) y boton de cerrar
- [x] El sheet tiene footer fijo con botones: "Cancelar" y "Completar Actividad" (amber-500)
- [ ] Validacion: campos esenciales requeridos, recursos con cantidad > 0 si estan marcados como requeridos
- [x] Al completar, llama a `api.activities.logV2` con todos los datos y consume_inventory
- [x] Toast de confirmacion al completar exitosamente y cierre automatico del sheet

#### Backend
- Query: `api.activityTemplates.getById` (con recursos y checklist)
- Mutation: reutilizar `api.activities.logInventoryMovement` o crear wrapper `api.activities.reportFromTemplate` que:
  - Crea el registro en `activities`
  - Crea registros en `activity_resources` por cada recurso con movimiento de inventario
  - Si viene de `scheduledActivityId`, marca la scheduled_activity como completada
  - Almacena `form_data` con los campos opcionales llenados

#### Frontend
- Componente: `components/activities/activity-report-sheet.tsx` (nuevo)
- Componente: `components/activities/report-essential-fields.tsx` (nuevo)
- Componente: `components/activities/report-optional-fields.tsx` (nuevo)
- Componente: `components/activities/report-resources-table.tsx` (nuevo)
- Estados UI: loading template, formulario interactivo, submitting, success

#### Dependencias
- Requiere: US-TPL.2 (templates con `form_fields`)
- Requiere: US-TPL.3 (templates con recursos)

---

### US-TPL.6: Formulario de reporte — Paso de calidad (quality form)

**Como** operador de campo
**quiero** que al completar una actividad que requiere formulario de calidad, se abra un paso separado con el formulario de calidad completo
**para** registrar la inspeccion de calidad como parte del flujo de reporte sin cambiar de contexto

#### Criterios de Aceptacion
- [x] Si el activity template tiene `quality_check_template_id`, al hacer click en "Completar Actividad" se avanza a un segundo paso en lugar de cerrar el sheet
- [x] El sheet muestra indicador de 2 pasos: "1. Reporte de Actividad" → "2. Formulario de Calidad"
- [x] El paso 2 renderiza el `DynamicFormRenderer` con la estructura del quality_check_template vinculado
- [x] El paso 2 incluye: seleccion de resultado (Aprobado/Condicional/Rechazado), checkbox de seguimiento con fecha, notas adicionales
- [x] El timer de duracion del QC se inicia al entrar al paso 2
- [x] Se puede volver al paso 1 para editar datos del reporte basico
- [x] Se puede omitir el paso de calidad con boton "Omitir calidad" (con confirmacion) si el usuario decide no completar el QC en ese momento
- [x] Al completar ambos pasos, se crea el registro de actividad Y el registro de quality_check vinculados
- [x] Si se omite calidad, solo se crea el registro de actividad con nota de que QC fue omitido
- [x] El quality_check creado se vincula con la actividad via `entity_type`/`entity_id` y se registra el uso del template

#### Backend
- Mutation: extender `api.activities.reportFromTemplate` (o crear `api.activities.reportWithQualityCheck`) para:
  - Crear actividad + recursos
  - Crear quality_check con form_data, resultado, fotos
  - Vincular quality_check con la actividad
  - Registrar uso del QC template (`recordUsage`)
- Query: `api.qualityCheckTemplates.getById` para obtener template_structure

#### Frontend
- Componente: `components/activities/activity-report-sheet.tsx` (extender del US-TPL.5)
- Componente: `components/activities/report-quality-step.tsx` (nuevo)
- Reutiliza: `DynamicFormRenderer` de `components/quality-checks/`
- Estados UI: transicion entre pasos, skip confirmation dialog, progreso del QC

#### Dependencias
- Requiere: US-TPL.5 (formulario base)
- Requiere: US-TPL.4 (templates con QC vinculado)
- Relacionado: M23-ai-quality-checks

---

### US-TPL.7: Integracion del reporte en scheduled activities y areas

**Como** operador de campo
**quiero** poder abrir el formulario de reporte de actividad directamente desde la lista de actividades programadas y desde el detalle de area
**para** completar actividades rapidamente sin navegar a multiples paginas

#### Criterios de Aceptacion
- [x] En `/scheduled-activities`, cada actividad pendiente muestra boton "Reportar" (icono + texto) que abre el `ActivityReportSheet` pre-llenado con datos de la actividad programada
- [x] El sheet recibe `scheduledActivityId` y pre-llena: template de actividad, lote, area, fase, fecha programada
- [x] Al completar el reporte, la scheduled_activity se marca como `completed` automaticamente con `actual_start_time` y `actual_end_time`
- [x] En el tab de Historial del area (`/areas/[id]` → History tab), se agrega boton "Registrar actividad" que abre el sheet con area pre-seleccionada
- [x] En el tab de Produccion del area, cada batch card muestra opcion "Registrar actividad" en su menu contextual
- [x] El boton "Reportar" muestra el nombre del template de actividad como tooltip
- [x] Si la actividad no tiene template vinculado, el boton "Reportar" permite seleccionar un template antes de abrir el formulario completo

#### Frontend
- Modificar: `app/(dashboard)/scheduled-activities/page.tsx` — agregar boton "Reportar" por actividad
- Modificar: `components/areas/area-history-tab.tsx` — agregar boton "Registrar actividad"
- Modificar: `components/areas/area-production-tab.tsx` — agregar opcion en menu contextual de batch
- Estados UI: sheet abierto/cerrado, pre-llenado correcto, loading states

#### Backend
- Mutation: `api.cultivationSchedules.complete` o `api.activities.completeScheduledActivity` — actualizar scheduled_activity al completar reporte

#### Dependencias
- Requiere: US-TPL.5 (ActivityReportSheet funcional)
- Requiere: US-TPL.6 (paso de calidad si aplica)

---

### US-TPL.8: Limpieza de navegacion y rutas deprecadas

**Como** usuario del sistema
**quiero** que la navegacion sea limpia sin entradas duplicadas ni paginas huerfanas
**para** tener una experiencia consistente donde cada funcionalidad tiene un unico punto de acceso

#### Criterios de Aceptacion
- [x] El sidebar muestra un solo item "Templates" (en lugar de "Templates", "Templates Actividad", "Control de Calidad")
- [x] Se eliminan los items del sidebar: "Templates Actividad" y "Control de Calidad"
- [x] La ruta `/activity-templates` redirige a `/templates?tab=activities` via Next.js redirect
- [x] La ruta `/activity-templates/[id]` se mantiene funcional con breadcrumbs apuntando a `/templates?tab=activities`
- [x] La ruta `/quality-checks` redirige a `/templates?tab=quality` via Next.js redirect
- [x] La ruta `/quality-checks/templates/[id]` se mantiene funcional con breadcrumbs apuntando a `/templates?tab=quality`
- [x] La ruta `/quality-checks/inspections/[id]` se mantiene accesible con breadcrumbs actualizados
- [x] Breadcrumbs de paginas internas apuntan a `/templates` con el tab correcto
- [x] No quedan links rotos en toda la aplicacion (verificar con build)

#### Frontend
- Modificar: `components/layout/sidebar.tsx` — reducir a un solo item "Templates"
- Crear: `app/(dashboard)/activity-templates/page.tsx` — redirect a `/templates?tab=activities`
- Crear: `app/(dashboard)/quality-checks/page.tsx` — redirect a `/templates?tab=quality`
- Crear: `app/(dashboard)/templates/activity/[id]/page.tsx` — detalle/wizard de activity template
- Crear: `app/(dashboard)/templates/quality/[id]/page.tsx` — detalle de QC template
- Verificar: todos los `router.push()` y `Link href` que apunten a rutas viejas

#### Dependencias
- Requiere: US-TPL.1 (pagina unificada funcional)
- Requiere: US-TPL.2-4 (wizard en nueva ubicacion)

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `activity_templates` | `form_fields` | `v.optional(v.array(v.string()))` | IDs de campos opcionales habilitados en el formulario de reporte |
| `activity_templates` | `quality_check_template_id` | `v.optional(v.id("quality_check_templates"))` | Quality form vinculado para paso de calidad |
| `activity_templates` | `requires_photos` | `v.optional(v.boolean())` | Si requiere registro fotografico |
| `activity_templates` | `requires_attachments` | `v.optional(v.boolean())` | Si requiere archivos adjuntos |

> **Nota:** Todos los campos son `v.optional()` para compatibilidad con templates existentes.

## Consideraciones Tecnicas

- **Arquitectura:** El `ActivityReportSheet` es un componente standalone que recibe props de contexto y se puede montar en cualquier pagina. No depende de estado global mas alla de la sesion del usuario.
- **Reutilizacion:** Se reutiliza completamente el `DynamicFormRenderer` existente para el paso de calidad. Se reutilizan las mutations de `activityTemplates.ts` para el wizard. Se reutiliza `logInventoryMovement` para el reporte.
- **Integraciones:** El formulario de reporte se integra con el sistema de inventario existente via `activity_resources` + `inventory_transactions`. Se integra con el sistema de QC existente via `quality_checks`.
- **Riesgos:**
  - La mutation `logInventoryMovement` es compleja (~1300 lineas) y puede necesitar un wrapper mas simple para el caso de "reporte desde template"
  - El wizard de 4 pasos requiere gestion de estado local cuidadosa para no perder datos entre pasos
  - Las redirecciones de rutas viejas deben probarse para no romper bookmarks o links compartidos
- **Performance:** El Sheet lateral carga el template con sus recursos y checklist en una sola query (`getById`). El DynamicFormRenderer del QC se carga lazily solo si se avanza al paso 2.
- **Componentes existentes reutilizados:**
  - `ActivityTemplateList` (tab Actividades)
  - `QC template list` components (tab Calidad)
  - `ResourceEditor` patterns → adaptados para el carrito
  - `ChecklistEditor` → embebido en campos opcionales
  - `DynamicFormRenderer` → paso de calidad
  - `QCExecutionForm` patterns → adaptados para paso de calidad inline

## Out of Scope

- **Modificar el flujo de QC standalone**: La pagina de ejecucion de inspecciones de calidad independientes (fuera del contexto de una actividad) no cambia
- **Migrar datos existentes**: Los activity templates y quality check templates existentes funcionan sin modificacion — los nuevos campos son opcionales
- **Editor de activity types**: La gestion de tipos de actividad permanece en `/settings/activity-types`
- **Reportes/analytics de actividades**: No se agregan dashboards o graficos nuevos
- **Notificaciones**: No se implementan notificaciones push o email para actividades pendientes
- **Modo offline**: El formulario de reporte requiere conexion (Convex real-time)
- **Drag-and-drop en wizard**: El reordenamiento de pasos del wizard o de recursos no se implementa con drag-and-drop
- **Historial de inspecciones QC**: La vista de historial de inspecciones completadas se mueve al tab "Calidad" pero no se modifica su funcionalidad

---

## Implementacion

### Commits
- `d3565aa` — feat(templates): US-TPL.1 unified templates page with three tabs
- `cb68111` — feat(templates): US-TPL.2 activity template wizard with type/basic and form fields steps
- `2549f7c` — feat(templates): US-TPL.3 wizard step 3 resource cart with product search
- `fc9ddbd` — feat(templates): US-TPL.4 wizard step 4 final configuration
- `74af6e3` — feat(activities): US-TPL.5 activity report sheet base component
- `92f2072` — feat(activities): US-TPL.6 quality check step in activity report sheet
- `7a1947d` — feat(activities): US-TPL.7 integrate report sheet in scheduled activities and areas
- `a842cf7` — feat(templates): US-TPL.8 navigation cleanup and deprecated route redirects

### Archivos Modificados
- `app/(dashboard)/templates/page.tsx` — unified templates page with 3 tabs
- `app/(dashboard)/activity-templates/[id]/page.tsx` — wizard editor for activity templates
- `app/(dashboard)/activity-templates/page.tsx` — redirect to /templates?tab=activities
- `app/(dashboard)/quality-checks/page.tsx` — redirect to /templates?tab=quality
- `app/(dashboard)/quality-checks/templates/[id]/page.tsx` — breadcrumbs updated
- `app/(dashboard)/quality-checks/inspections/[id]/page.tsx` — breadcrumbs updated
- `app/(dashboard)/scheduled-activities/page.tsx` — "Reportar" button + template selector
- `components/activity-templates/activity-template-wizard.tsx` — 4-step wizard container
- `components/activity-templates/wizard-step-basic.tsx` — step 1: type and basic info
- `components/activity-templates/wizard-step-fields.tsx` — step 2: form field selection
- `components/activity-templates/wizard-step-resources.tsx` — step 3: resource cart
- `components/activity-templates/wizard-step-config.tsx` — step 4: config, QC, recurrence
- `components/activities/activity-report-sheet.tsx` — report sheet with QC 2-step flow
- `components/areas/area-history-tab.tsx` — "Registrar actividad" button
- `components/areas/area-production-tab.tsx` — batch-level report integration
- `components/areas/phase-card.tsx` — report button on batch rows
- `components/home/operative-dashboard.tsx` — updated QC quick action link
- `convex/schema.ts` — form_fields, quality_check_template_id, requires_photos, requires_attachments
- `convex/activityTemplates.ts` — create/update/duplicate mutations for new fields
- `convex/cultivationSchedules.ts` — markScheduledActivityCompleted mutation

### Fecha de Completado
2026-02-11
