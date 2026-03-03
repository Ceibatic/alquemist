# Batches (Lotes) — Vista General

## URL

`/batches/[id]` — Pagina de detalle individual del lote

## Estructura

Pagina de detalle con 5 tabs:

| Tab | Valor | Contenido |
|-----|-------|-----------|
| Detalle | `detail` (default) | Info general, ubicacion/fechas, lotes derivados |
| Programadas | `scheduled` | Actividades programadas del lote (ActivitySchedule) |
| Actividades | `activities` | Tabla de actividades ejecutadas con paginador de fases |
| Analytics | `analytics` | Metricas de actividades, recursos, produccion y salud |
| Trazabilidad | `traceability` | Cadena completa: origen → actividades → productos generados |

## Navegacion

No hay listado independiente de lotes. Se accede desde:
- Detalle de orden de produccion (`/production/orders/[id]`) — click en lote
- Detalle de actividad — link al lote asociado
- Dashboard operativo — lotes asignados

## Header

- **Breadcrumbs**: Inicio > Produccion > [batch_code]
- **Descripcion**: Cultivar + Area actual
- **Acciones** (solo status `active`):
  - Boton "Dividir Lote" → `SplitBatchModal`
  - Boton "Fusionar Lote" → `MergeBatchModal`
  - Boton "Reportar Actividad" (amber-500) → `ActivityExecutionSheet`

## Badges horizontales

- StatusBadge (activo/cosechado/perdido/etc.)
- BatchStatsBar (fase actual, cantidad, dias en produccion)
- Badge producto actual (purple, solo si `current_product_id` existe) — via query `products.getById`

## Tab Detalle

### Card Informacion General (grid 2 cols)
- Codigo, Estado, Tipo de Lote, Tipo de Fuente
- Cultivo, Cultivar, Fase Actual, Rastreo (Individual/Lote)

### Card Ubicacion y Fechas (grid 2 cols)
- Instalacion (con icono MapPin), Area
- Fecha Creacion, Germinacion
- Orden de Produccion (link a `/production/orders/[id]`)
- Notas

### Card Lotes Derivados (condicional)
Solo visible si el lote fue dividido (tiene `childBatches`). Lista clickable de lotes hijos con codigo, cantidad y estado.

## Tab Programadas

Reutiliza `ActivitySchedule` con scope `{ type: 'batch', batchId }` en modo compacto.

## Tab Actividades

`BatchActivitiesTable` — Tabla paginada de actividades ejecutadas con filtros por fase.

## Tab Analytics

`BatchAnalyticsTab` — Metricas de actividades/recursos y produccion/salud con Recharts.

## Tab Trazabilidad

Ver [trazabilidad.md](./trazabilidad.md) para detalle completo.

## Modales

### SplitBatchModal
- **Trigger**: Boton "Dividir" en header (solo batch activo)
- **Contenido**: Cantidad a separar (input numerico), area destino (select), razon (textarea)
- **Preview**: Muestra cantidades resultantes antes de confirmar
- **Mutacion**: `batches.splitBatch`

### MergeBatchModal
- **Trigger**: Boton "Fusionar" en header (solo batch activo)
- **Contenido**: Selector de lotes compatibles (mismo cultivar + fase), preview de total fusionado
- **Filtro**: Solo muestra lotes activos de la misma empresa con mismo cultivar y fase
- **Mutacion**: `batches.mergeBatch`

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/batches/[id]/page.tsx` | Pagina principal con 5 tabs |
| `components/batches/batch-stats-bar.tsx` | Stats compactos horizontales |
| `components/batches/batch-activities-table.tsx` | Tabla de actividades ejecutadas |
| `components/batches/batch-analytics-tab.tsx` | Tab analytics con metricas |
| `components/batches/batch-traceability-view.tsx` | Vista de trazabilidad completa |
| `components/batches/split-batch-modal.tsx` | Modal de division de lote |
| `components/batches/merge-batch-modal.tsx` | Modal de fusion de lotes |
| `components/activities/activity-execution-sheet.tsx` | Sheet lateral de reporte de actividad |
| `components/activities/activity-schedule.tsx` | Listado de actividades programadas |

## Backend

| Query/Mutation | Archivo | Uso |
|----------------|---------|-----|
| `batches.getById` | `convex/batches.ts` | Query principal del detalle |
| `batches.getBatchTraceability` | `convex/batches.ts` | Trazabilidad completa del lote |
| `products.getById` | `convex/products.ts` | Producto actual del lote |
| `batches.splitBatch` | `convex/batches.ts` | Dividir lote |
| `batches.mergeBatch` | `convex/batches.ts` | Fusionar lotes |
