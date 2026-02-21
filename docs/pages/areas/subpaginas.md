# Subpaginas de Areas

## `/areas/[id]` — Detalle de Area

Pagina de detalle con header (nombre + boton Editar amber-500) y 5 tabs horizontales con scroll en mobile:

| Tab | Icono | Contenido |
|-----|-------|-----------|
| Produccion (default) | Layers | Phase cards agrupadas por fase activa |
| Inventario | Box | Items de inventario en el area |
| Historial | Activity | Tabla de actividades con filtros |
| Cronograma | CalendarCheck | Timeline de actividades programadas |
| Detalle | Info | Info general, capacidad, cultivos, specs, estructuras |

Ver documentacion individual de cada tab: [tab-produccion.md](./tab-produccion.md), [tab-inventario.md](./tab-inventario.md), [tab-historial.md](./tab-historial.md), [tab-cronograma.md](./tab-cronograma.md), [tab-detalle.md](./tab-detalle.md).

**Breadcrumbs**: Inicio > Areas > [nombre area]

**Query**: `api.areas.getById`, `api.crops.getCropTypes`

**Ruta**: `app/(dashboard)/areas/[id]/page.tsx`

---

## `/areas/[id]/edit` — Edicion de Area

Formulario de edicion con `AreaForm` en modo `edit`, pre-populado con datos actuales del area. Misma estructura de campos que la creacion (ver [modal-crear-area.md](./modal-crear-area.md)) pero sin la seccion de estructuras inline.

- Valida nombre unico por instalacion si se modifica
- Al guardar, redirige a `/areas/[id]`
- Toast de confirmacion

**Breadcrumbs**: Inicio > Areas > [nombre area] > Editar

**Query**: `api.areas.getById`, `api.crops.getCropTypes`

**Mutation**: `api.areas.update`

**Ruta**: `app/(dashboard)/areas/[id]/edit/page.tsx`

---

## `/areas/[id]/phases/[phase]` — Detalle de Fase

Muestra stats y tabla de actividades para una fase especifica del area.

### Stats (CompactStats)

| Stat | Icono | Color |
|------|-------|-------|
| Lotes | Layers | blue |
| Plantas | Sprout | green |
| Dias promedio | Clock | gray |

### Filtros (`PhaseDetailFilters`)

- Checkboxes por lote (seleccionar cuales incluir)
- Dropdown de categoria de actividad

### Tabla de Actividades

DataTable con columnas sortables:

| Columna | Descripcion |
|---------|-------------|
| Fecha | Timestamp con formato dd/mm/yy hh:mm |
| Tipo | Nombre del tipo de actividad |
| Lote | Codigo de lote (monospace) |
| Responsable | Nombre de quien ejecuto |
| Duracion | En minutos o horas |
| Notas | Truncadas a 60 caracteres |

Click en fila → `/areas/[id]/activities/[actId]`

**Breadcrumbs**: Inicio > Areas > [nombre area] > [nombre fase]

**Query**: `api.areas.getById`, `api.batches.listByAreaGroupedByPhase`, `api.activities.listByAreaAndPhase`

**Componentes**:
- `components/areas/phase-detail-filters.tsx` — filtros de lote y categoria

**Ruta**: `app/(dashboard)/areas/[id]/phases/[phase]/page.tsx`

---

## `/areas/[id]/activities/[actId]` — Detalle de Actividad

Pagina de detalle de una actividad ejecutada con 4 tabs:

| Tab | Icono | Contenido |
|-----|-------|-----------|
| Esencial (default) | Info | Datos basicos de la actividad |
| Recursos | Package | Inputs/outputs de recursos usados |
| Fotos | Camera | Galeria de fotos adjuntas |
| Documentos | FileText | Documentos adjuntos |

**Breadcrumbs**: Inicio > Areas > [nombre area] > [titulo actividad]

**Query**: `api.activities.getById`, `api.areas.getById`

**Componentes**:
- `components/activities/activity-detail-essential.tsx` — tab esencial
- `components/activities/activity-detail-resources.tsx` — tab recursos
- `components/attachments/activity-photo-gallery.tsx` — tab fotos
- `components/activities/activity-detail-documents.tsx` — tab documentos

**Ruta**: `app/(dashboard)/areas/[id]/activities/[actId]/page.tsx`

## Nota sobre ActivityExecutionSheet y ScheduleActivityDialog

El sheet de registro de actividad (`ActivityExecutionSheet`) y el dialog de programar actividad (`ScheduleActivityDialog`) NO son subpaginas. Son componentes modales que se abren desde el tab de Historial del detalle de area. Pertenecen al modulo de Actividades.
