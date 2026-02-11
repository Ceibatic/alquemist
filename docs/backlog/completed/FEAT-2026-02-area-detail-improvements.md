# FEAT-2026-02-area-detail-improvements

## Metadata
- **Creado:** 2026-02-11
- **Prioridad:** high
- **Modulo relacionado:** M08-area-management
- **Tipo:** enhancement

## Descripcion

Reestructurar la pagina de detalle de area para priorizar produccion y trazabilidad. Los 5 tabs actuales (Detalle, Estructuras, Lotes, Actividades, Inventario) se reorganizan en 4 tabs (Produccion, Inventario, Historial, Detalle) con Estructuras integrado dentro de Detalle. El tab Produccion agrupa lotes por fase de cultivo en cards horizontales con drill-down a paginas de detalle de fase y detalle de actividad.

## User Stories

### US-001.1: Centralizar constantes de fases de cultivo

**Como** desarrollador
**quiero** tener constantes centralizadas de fases de cultivo
**para** eliminar la duplicacion de phaseLabels en multiples archivos

#### Criterios de Aceptacion
- [x] Crear `lib/constants/phases.ts` con PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, getPhaseLabel()
- [x] Incluir todas las fases: propagation, germination, seedling, vegetative, flowering, harvest, post_harvest, processing
- [x] Reemplazar phaseLabels local en `batches/[id]/page.tsx`
- [x] Reemplazar phaseLabels local en `components/batches/batch-card.tsx`
- [x] Build pasa sin errores

#### Frontend
- Archivo nuevo: `lib/constants/phases.ts`
- Modificar: `app/(dashboard)/batches/[id]/page.tsx`, `components/batches/batch-card.tsx`

---

### US-001.2: Query de lotes agrupados por fase para un area

**Como** gerente de area
**quiero** ver los lotes de mi area agrupados por fase
**para** entender el estado de produccion de un vistazo

#### Criterios de Aceptacion
- [x] Nuevo query `batches.listByAreaGroupedByPhase` en convex/batches.ts
- [x] Filtra solo lotes con status 'active'
- [x] Agrupa por current_phase, lotes sin fase van a grupo "unknown"
- [x] Retorna por grupo: phase, batchCount, totalPlants, avgDays, batches[]
- [x] Batches enriquecidos con cultivarName
- [x] Grupos ordenados segun progresion de fases

#### Backend
- Query: `api.batches.listByAreaGroupedByPhase({ areaId })`
- Usa index `by_area` en batches

---

### US-001.3: Tab Produccion con cards de fase

**Como** gerente de area
**quiero** ver tarjetas por fase mostrando lotes y estadisticas
**para** monitorear la produccion de un vistazo

#### Criterios de Aceptacion
- [x] Componente `area-production-tab.tsx` consume query de US-001.2
- [x] Cards horizontales por fase con: nombre (coloreado), # lotes, # plantas, avg dias
- [x] Cada card lista los lotes con batch_code, cultivar, cantidad
- [x] Click en card navega a `/areas/[id]/phases/[phase]`
- [x] Solo muestra fases con lotes activos
- [x] Empty state si no hay lotes activos
- [x] Loading state con skeletons

#### Frontend
- Nuevos: `components/areas/area-production-tab.tsx`, `components/areas/phase-card.tsx`

---

### US-001.4: Reestructurar tabs de la pagina de area

**Como** usuario
**quiero** 4 tabs organizados (Produccion, Inventario, Historial, Detalle)
**para** acceder rapidamente a la informacion mas relevante

#### Criterios de Aceptacion
- [x] Tab por defecto cambia de "detail" a "produccion"
- [x] Orden: Produccion (default), Inventario, Historial, Detalle
- [x] Estructuras se integra como seccion dentro del tab Detalle
- [x] Tab Lotes eliminado (reemplazado por Produccion)
- [x] Tab Actividades eliminado (reemplazado por Historial)
- [x] Inventario funciona igual

#### Frontend
- Modificar: `app/(dashboard)/areas/[id]/page.tsx`

---

### US-001.5: Tab Historial con listado de actividades y filtros

**Como** gerente de area
**quiero** ver un historial completo de actividades con filtros
**para** consultar que se ha hecho y cuando

#### Criterios de Aceptacion
- [x] Nuevo query `activities.listByArea` solo v2 (batch_id, type_id)
- [x] Componente `area-history-tab.tsx` con DataTable
- [x] Filtros: categoria de actividad
- [x] Columnas: Fecha, Tipo, Lote, Fase, Responsable, Estado
- [x] Click en fila navega a `/areas/[areaId]/activities/[actId]`
- [x] Loading state y empty state
- [x] Paginacion via DataTable

**Nota:** Filtros de rango de fechas y usuario no implementados en esta iteracion — se filtra por categoria y busqueda de texto. Los filtros adicionales se pueden agregar en una iteracion futura.

#### Backend
- Query: `api.activities.listByArea({ areaId, category?, limit? })`

#### Frontend
- Nuevo: `components/areas/area-history-tab.tsx`

---

### US-001.6: Pagina de detalle de fase

**Como** gerente de produccion
**quiero** ver todas las actividades de una fase especifica
**para** monitorear el progreso de cada lote en esa fase

#### Criterios de Aceptacion
- [x] Nueva pagina en `/areas/[id]/phases/[phase]/page.tsx`
- [x] Breadcrumbs: Inicio > Areas > [Area] > [Fase]
- [x] Header con nombre fase, # lotes activos, # plantas total
- [x] Filtro de lotes con checkboxes multi-select
- [x] Filtro de tipo de actividad (categoria)
- [x] Tabla de actividades con DataTable
- [x] Click en fila navega a `/areas/[id]/activities/[actId]`
- [x] Empty state y loading state

**Nota:** Filtros de fecha y usuario no implementados en esta iteracion — se filtra por lote y categoria. Los filtros adicionales se pueden agregar en una iteracion futura.

#### Backend
- Query: `api.activities.listByAreaAndPhase({ areaId, phase, batchIds?, category?, limit? })`

#### Frontend
- Nuevos: `app/(dashboard)/areas/[id]/phases/[phase]/page.tsx`, `components/areas/phase-detail-filters.tsx`

---

### US-001.7: Query de detalle de actividad con relaciones

**Como** desarrollador
**quiero** un query que retorne una actividad completa con relaciones
**para** alimentar la pagina de detalle de actividad

#### Criterios de Aceptacion
- [x] Nuevo query `activities.getById` en convex/activities.ts
- [x] Retorna actividad enriquecida con: performedByName, batchCode, batchCultivar, areaName, facilityName, activityTypeName, activityTypeCategory
- [x] Retorna null si no existe
- [x] TypeScript strict compatible

#### Backend
- Query: `api.activities.getById({ activityId })`

---

### US-001.8: Pagina de detalle de actividad

**Como** supervisor
**quiero** ver el detalle completo de una actividad
**para** verificar ejecucion y recursos utilizados

#### Criterios de Aceptacion
- [x] Nueva pagina en `/areas/[id]/activities/[actId]/page.tsx`
- [x] Breadcrumbs: Inicio > Areas > [Area] > Actividad
- [x] 4 tabs: Esencial, Recursos, Fotos, Documentos
- [x] Tab Esencial: titulo, tipo, categoria, status, lote, fase, fechas, duracion, responsable, observaciones
- [x] Tab Recursos: tabla de activity_resources (producto, direccion, cantidad, unidad, costo)
- [x] Tab Fotos: reutiliza ActivityPhotoGallery
- [x] Tab Documentos: lista de attachments no-foto con links
- [x] Loading y not-found states

#### Frontend
- Nuevos: `app/(dashboard)/areas/[id]/activities/[actId]/page.tsx`, `components/activities/activity-detail-essential.tsx`, `components/activities/activity-detail-resources.tsx`, `components/activities/activity-detail-documents.tsx`

---

## Schema Changes
**Ninguno.** Todos los campos e indices necesarios ya existen.

## Consideraciones Tecnicas

- **Performance**: listByArea requiere N+1 queries (batches + activities por batch). Mitigado con Promise.all y limite de 200.
- **Solo v2**: Queries nuevos usan exclusivamente campos v2 (batch_id, type_id, crop_phase). Sin backward compatibility con v1.
- **Phase agrupacion**: current_phase del lote. Sin fase → grupo "unknown".

## Out of Scope

- CRUD de actividades (solo lectura/visualizacion)
- Upload de fotos/documentos desde detalle de actividad
- Transiciones automaticas de fase
- Filtros de fecha y usuario en historial/fase (implementar en iteracion futura)
- Pagina de detalle de lote (ya existe en /batches/[id])

---

## Implementacion

### Commits
- Pendiente de commit por el usuario

### Archivos Nuevos
- `lib/constants/phases.ts` — Constantes centralizadas de fases
- `components/areas/area-production-tab.tsx` — Tab Produccion
- `components/areas/phase-card.tsx` — Card individual de fase
- `components/areas/area-history-tab.tsx` — Tab Historial
- `components/areas/phase-detail-filters.tsx` — Filtros para detalle de fase
- `app/(dashboard)/areas/[id]/phases/[phase]/page.tsx` — Pagina detalle de fase
- `app/(dashboard)/areas/[id]/activities/[actId]/page.tsx` — Pagina detalle de actividad
- `components/activities/activity-detail-essential.tsx` — Tab datos esenciales
- `components/activities/activity-detail-resources.tsx` — Tab recursos consumidos
- `components/activities/activity-detail-documents.tsx` — Tab documentos adjuntos

### Archivos Modificados
- `convex/batches.ts` — +query `listByAreaGroupedByPhase`
- `convex/activities.ts` — +queries `getById`, `listByArea`, `listByAreaAndPhase`
- `app/(dashboard)/areas/[id]/page.tsx` — Reestructura 5→4 tabs, Estructuras en Detalle
- `app/(dashboard)/batches/[id]/page.tsx` — Import centralizado PHASE_LABELS
- `components/batches/batch-card.tsx` — Import centralizado PHASE_LABELS

### Archivos Eliminados
- `components/areas/area-batches-tab.tsx` — Reemplazado por area-production-tab
- `components/areas/area-activities-tab.tsx` — Reemplazado por area-history-tab

### Fecha de Completado
2026-02-11
