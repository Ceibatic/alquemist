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
- [x] La pagina `/templates` muestra 3 tabs: "Produccion" | "Actividades" | "Calidad"
- [x] Tab "Produccion" renderiza el contenido actual de `/templates` (TemplateList) sin cambios funcionales
- [x] Tab "Actividades" renderiza el listado de activity templates con filtros por fase y busqueda
- [x] Tab "Calidad" renderiza el listado de quality check templates con filtros por tipo de cultivo y busqueda
- [x] Cada tab muestra sus propios CompactStats relevantes (contadores, metricas)
- [x] La URL refleja el tab activo via query param (`/templates?tab=activities`, `/templates?tab=quality`) para permitir deep linking
- [x] El sidebar muestra un solo item "Templates" en lugar de tres items separados
- [ ] Las rutas `/activity-templates` y `/quality-checks` redirigen a `/templates?tab=activities` y `/templates?tab=quality` respectivamente (backward compatibility)

---

### US-TPL.2: Wizard mejorado de activity templates — Tipo y campos del formulario

**Como** administrador de operaciones
**quiero** crear activity templates con un wizard paso a paso donde selecciono el tipo de actividad y los campos opcionales que apareceran en el formulario de reporte
**para** configurar exactamente que informacion se captura al reportar cada tipo de actividad

#### Criterios de Aceptacion
- [x] El wizard tiene 4 pasos con indicador de progreso: 1) Tipo y basico, 2) Campos del formulario, 3) Recursos, 4) Configuracion final
- [x] **Paso 1 — Tipo y basico**: nombre (requerido), codigo (auto-generado), tipo de actividad (requerido, dropdown de activity_types), prioridad (routine/urgent/critical), descripcion, fases aplicables (badge toggles), rango de dias en fase (opcional)
- [x] **Paso 2 — Campos del formulario**: lista de campos opcionales predefinidos con checkboxes
- [x] Los campos marcados como seleccionados se almacenan en el activity template como `form_fields` (array de strings con los IDs de campos habilitados)
- [x] Campos esenciales (fecha, responsable, lote, area, fase) siempre se incluyen y no son deseleccionables — se muestran con icono de candado
- [x] Se puede navegar entre pasos sin perder datos (estado local persistente en el wizard)
- [x] En modo edicion, el wizard carga los datos existentes del template en cada paso

---

### US-TPL.3: Wizard mejorado — Seleccion de recursos tipo carrito

**Como** administrador de operaciones
**quiero** seleccionar los recursos (productos) que una actividad requiere usando un buscador con sistema tipo carrito donde agrego productos y defino cantidades inline
**para** configurar rapidamente los insumos necesarios sin navegar entre multiples dialogos

#### Criterios de Aceptacion
- [ ] **Paso 3 — Recursos**: se muestra un buscador de productos con campo de texto que filtra en tiempo real por nombre o codigo
- [ ] Al encontrar un producto, se muestra en una lista de resultados con nombre, codigo, unidad base y boton "Agregar"
- [ ] Al hacer click en "Agregar", el producto se anade a la lista de "Recursos seleccionados" debajo del buscador
- [ ] En la lista de recursos seleccionados, cada item muestra inline: nombre del producto, input de cantidad (number), selector de base (fijo/por planta/por m2/por zona/por L solucion), selector de direccion (consumido/aplicado/producido), boton de eliminar
- [ ] Se puede editar la cantidad directamente en la lista sin abrir un dialogo separado
- [ ] Opcionalmente se puede expandir cada recurso para ver/editar campos adicionales: metodo de aplicacion, tasa de aplicacion, notas, es requerido (toggle)
- [ ] Los recursos se muestran con subtotales visuales (cantidad x base)
- [ ] Al guardar el template, todos los recursos se persisten en `activity_template_resources`
- [ ] Si el template ya tiene recursos (modo edicion), se cargan al abrir el paso

---

### US-TPL.4: Wizard mejorado — Configuracion final (calidad, fotos, recurrencia)

**Como** administrador de operaciones
**quiero** en el paso final del wizard configurar si la actividad requiere formulario de calidad, registro fotografico, y la recurrencia
**para** completar la definicion del template con todos los requisitos de documentacion y frecuencia

#### Criterios de Aceptacion
- [ ] **Paso 4 — Configuracion final** incluye:
  - **Seccion Calidad**: checkbox "Requiere formulario de calidad". Si se activa, muestra un selector dropdown/searchable con los quality_check_templates disponibles (filtrados por empresa). Muestra preview del nombre y tipo de procedimiento del template seleccionado
  - **Seccion Documentacion**: checkbox "Requiere registro fotografico" y checkbox "Requiere archivos adjuntos". Si se activan, estas flags se guardan en el template
  - **Seccion Recurrencia**: frecuencia (unica/diaria/semanal/bisemanal/mensual/a demanda/custom dias), intervalo personalizado (si custom), conteo de repeticiones (opcional)
  - **Seccion Dependencias** (colapsable): template dependencia, dias minimos despues, referencia regulatoria, requiere verificacion
- [ ] El campo `quality_check_template_id` se almacena en `activity_templates` para vincular el formulario de calidad
- [ ] Los campos `requires_photos` y `requires_attachments` se almacenan en `activity_templates`
- [ ] Al guardar, se ejecuta la mutation de creacion/actualizacion con todos los datos de los 4 pasos
- [ ] Despues de guardar exitosamente, se navega al detalle del template creado con toast de confirmacion
- [ ] El boton "Guardar" valida todos los pasos: nombre requerido, tipo requerido, al menos una fase

---

### US-TPL.5: Formulario de reporte de actividad — Componente base

**Como** operador de campo
**quiero** un formulario lateral (drawer/sheet) para reportar actividades que se adapta automaticamente segun el template de la actividad
**para** registrar rapidamente la ejecucion de actividades con la informacion correcta sin formularios genericos

#### Criterios de Aceptacion
- [ ] El componente `ActivityReportSheet` se abre como Sheet lateral (derecha) con ancho adecuado (~500px desktop, full en mobile)
- [ ] **Props requeridos**: `activityTemplateId` (o template inline), `entityType` (batch/plant/area), `entityId`, `areaId`, `facilityId`, `scheduledActivityId` (opcional, si viene de una actividad programada)
- [ ] **Seccion esencial** (siempre visible): fecha de actividad (default hoy), responsable (default usuario actual), lote (pre-llenado si viene de contexto), area (pre-llenado), fase del cultivo (pre-llenado)
- [ ] **Seccion campos opcionales**: renderiza solo los campos habilitados en `template.form_fields`
- [ ] **Seccion recursos**: si el template tiene recursos, muestra una tabla editable con los productos pre-cargados. El usuario puede ajustar cantidades reales consumidas
- [ ] El sheet tiene header fijo con titulo (nombre de actividad) y boton de cerrar
- [ ] El sheet tiene footer fijo con botones: "Cancelar" y "Completar Actividad" (amber-500)
- [ ] Validacion: campos esenciales requeridos, recursos con cantidad > 0 si estan marcados como requeridos
- [ ] Al completar, llama a `api.activities.logInventoryMovement` (o mutation equivalente) con todos los datos
- [ ] Toast de confirmacion al completar exitosamente y cierre automatico del sheet

---

### US-TPL.6: Formulario de reporte — Paso de calidad (quality form)

**Como** operador de campo
**quiero** que al completar una actividad que requiere formulario de calidad, se abra un paso separado con el formulario de calidad completo
**para** registrar la inspeccion de calidad como parte del flujo de reporte sin cambiar de contexto

#### Criterios de Aceptacion
- [ ] Si el activity template tiene `quality_check_template_id`, al hacer click en "Completar Actividad" se avanza a un segundo paso en lugar de cerrar el sheet
- [ ] El sheet muestra indicador de 2 pasos: "1. Reporte de Actividad" → "2. Formulario de Calidad"
- [ ] El paso 2 renderiza el `DynamicFormRenderer` con la estructura del quality_check_template vinculado
- [ ] El paso 2 incluye: seleccion de resultado (Aprobado/Condicional/Rechazado), checkbox de seguimiento con fecha, notas adicionales
- [ ] Se puede volver al paso 1 para editar datos del reporte basico
- [ ] Se puede omitir el paso de calidad con boton "Omitir calidad" (con confirmacion) si el usuario decide no completar el QC en ese momento
- [ ] Al completar ambos pasos, se crea el registro de actividad Y el registro de quality_check vinculados
- [ ] Si se omite calidad, solo se crea el registro de actividad con nota de que QC fue omitido
- [ ] El quality_check creado se vincula con la actividad via `entity_type`/`entity_id` y se registra el uso del template

---

### US-TPL.7: Integracion del reporte en scheduled activities y areas

**Como** operador de campo
**quiero** poder abrir el formulario de reporte de actividad directamente desde la lista de actividades programadas y desde el detalle de area
**para** completar actividades rapidamente sin navegar a multiples paginas

#### Criterios de Aceptacion
- [ ] En `/scheduled-activities`, cada actividad pendiente muestra boton "Reportar" (icono + texto) que abre el `ActivityReportSheet` pre-llenado con datos de la actividad programada
- [ ] El sheet recibe `scheduledActivityId` y pre-llena: template de actividad, lote, area, fase, fecha programada
- [ ] Al completar el reporte, la scheduled_activity se marca como `completed` automaticamente con `actual_start_time` y `actual_end_time`
- [ ] En el tab de Historial del area (`/areas/[id]` → History tab), se agrega boton "Registrar actividad" que abre el sheet con area pre-seleccionada
- [ ] En el tab de Produccion del area, cada batch card muestra opcion "Registrar actividad" en su menu contextual
- [ ] El boton "Reportar" muestra el nombre del template de actividad como tooltip
- [ ] Si la actividad no tiene template vinculado, el boton "Reportar" permite seleccionar un template antes de abrir el formulario completo

---

### US-TPL.8: Limpieza de navegacion y rutas deprecadas

**Como** usuario del sistema
**quiero** que la navegacion sea limpia sin entradas duplicadas ni paginas huerfanas
**para** tener una experiencia consistente donde cada funcionalidad tiene un unico punto de acceso

#### Criterios de Aceptacion
- [ ] El sidebar muestra un solo item "Templates" (en lugar de "Templates", "Templates Actividad", "Control de Calidad")
- [ ] Se eliminan los items del sidebar: "Templates Actividad" y "Control de Calidad"
- [ ] La ruta `/activity-templates` redirige a `/templates?tab=activities` via Next.js redirect
- [ ] La ruta `/activity-templates/[id]` redirige a `/templates/activity/[id]` (nueva ruta para detalle/edit de activity template)
- [ ] La ruta `/quality-checks` redirige a `/templates?tab=quality` via Next.js redirect
- [ ] La ruta `/quality-checks/templates/[id]` redirige a `/templates/quality/[id]` (nueva ruta para detalle de QC template)
- [ ] La ruta `/quality-checks/inspections/[id]` se mantiene accesible (o se mueve a `/inspections/[id]`)
- [ ] Breadcrumbs de paginas internas apuntan a `/templates` con el tab correcto
- [ ] No quedan links rotos en toda la aplicacion (verificar con build)

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `activity_templates` | `form_fields` | `v.optional(v.array(v.string()))` | IDs de campos opcionales habilitados en el formulario de reporte |
| `activity_templates` | `quality_check_template_id` | `v.optional(v.id("quality_check_templates"))` | Quality form vinculado para paso de calidad |
| `activity_templates` | `requires_photos` | `v.optional(v.boolean())` | Si requiere registro fotografico |
| `activity_templates` | `requires_attachments` | `v.optional(v.boolean())` | Si requiere archivos adjuntos |

---

## Implementacion (llenado por /implement-feature)

### Commits
- `d3565aa` — feat(templates): US-TPL.1 unified templates page with three tabs
- `0188a7e` — feat(templates): US-TPL.2 activity template wizard with type and form fields

### Archivos Modificados

### Fecha de Completado
