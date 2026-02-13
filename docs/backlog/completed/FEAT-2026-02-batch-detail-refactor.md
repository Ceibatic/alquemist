# FEAT-2026-02-batch-detail-refactor

## Metadata
- **Creado:** 2026-02-13
- **Prioridad:** high
- **Modulo relacionado:** batches, activities, production
- **Tipo:** enhancement

## Descripcion

Refactorizacion completa de la pagina de detalle del lote (`/batches/[id]`) para simplificar la experiencia: reducir de 12 tabs a 3 (Detalle, Actividades, Analytics), eliminar los 6 botones/modales de accion (Mover, Dividir, Fusionar, Cosechar, Perdida, Archivar), reemplazar los stats por badges horizontales compactos con avance de fase, y convertir el timeline de actividades en una tabla con paginador de fases y filtros avanzados. Se agrega un tab de analytics basicas con metricas de actividades/recursos y produccion/salud.

Los 6 modales de accion se eliminan completamente del sistema (se usan en `batches/[id]/page.tsx` y `batch-card.tsx`). Se conserva un unico boton "Reportar Actividad" para ejecucion ad-hoc. Recharts (ya instalado) se usa para graficos de analytics.

## User Stories

### US-LOT.1: Simplificar header — un solo boton de accion

**Como** operador de campo
**quiero** un header limpio con un unico boton para reportar actividades
**para** enfocarme en la operacion principal sin distracciones de acciones poco usadas

#### Criterios de Aceptacion
- [ ] Se eliminan los 6 botones de accion: Mover, Dividir, Fusionar, Cosechar, Perdida, Archivar
- [ ] Se eliminan los 6 estados de modal (`moveModalOpen`, `splitModalOpen`, `lossModalOpen`, `harvestModalOpen`, `mergeModalOpen`, `archiveModalOpen`)
- [ ] Se eliminan los 6 renders de componentes modal del JSX
- [ ] Se agrega un unico boton "Reportar Actividad" (amber-500) visible solo cuando `batch.status === 'active'`
- [ ] El boton abre el formulario de reporte de actividad con el lote pre-seleccionado (usar `ActivityReportSheet` existente con un template picker, o placeholder hasta que exista `ActivityExecutionSheet` de FEAT-2026-02-activity-execution-refactor)
- [ ] Se limpian las mismas acciones de `components/batches/batch-card.tsx` (tambien usa los 6 modales) — eliminar dropdown de acciones o reducir a "Reportar Actividad"
- [ ] Se eliminan los 6 archivos de modales despues de confirmar cero importaciones restantes:
  - `components/batches/batch-move-modal.tsx`
  - `components/batches/batch-split-wizard.tsx`
  - `components/batches/batch-loss-modal.tsx`
  - `components/batches/batch-harvest-wizard.tsx`
  - `components/batches/batch-merge-modal.tsx`
  - `components/batches/batch-archive-modal.tsx`
- [ ] Se actualiza `components/batches/index.ts` removiendo los exports de los 6 modales
- [ ] `npx next build` pasa sin errores

#### Frontend
- Modificar: `app/(dashboard)/batches/[id]/page.tsx` — eliminar modales y botones
- Modificar: `components/batches/batch-card.tsx` — eliminar modales y acciones
- Modificar: `components/batches/index.ts` — limpiar exports
- Eliminar: 6 archivos de modales

#### Dependencias
- Ninguna

---

### US-LOT.2: Stats compactos con avance de fase

**Como** supervisor
**quiero** ver las metricas clave del lote en badges horizontales compactos incluyendo el avance de la fase actual
**para** tener un overview rapido sin que la seccion de stats ocupe demasiado espacio vertical

#### Criterios de Aceptacion
- [ ] Se reemplaza el Card grande de stats actual (4 numeros + barra supervivencia) por una fila de badges horizontales compactos
- [ ] Componente nuevo `components/batches/batch-stats-bar.tsx` extraido de la pagina
- [ ] Badges mostrados en una fila con wrap responsive:
  - **Fase**: nombre de la fase actual con color de `PHASE_COLORS` (ej: badge verde "Propagacion")
  - **Plantas**: `current_quantity / initial_quantity` (ej: "45/48") — verde si supervivencia >= 90%, amber si < 90%
  - **Perdidas**: `lost_quantity` — rojo si > 0, gris si 0
  - **Dias**: `daysInProduction` + "d" (ej: "15d")
  - **Supervivencia**: porcentaje calculado — verde >= 90%, amber >= 70%, rojo < 70%
  - **Avance Fase**: "Dia X de Y" basado en fechas de la `order_phase` actual, o solo dias en produccion si no hay production order
- [ ] Para el avance de fase, se enriquece `batches.getById` con datos de la fase actual desde `order_phases`:
  - Query por `production_order_id` + match de `phase_name` con `batch.current_phase`
  - Retorna `currentPhaseInfo: { phaseName, plannedStartDate, plannedEndDate, actualStartDate, status, phaseOrder, totalPhases }`
- [ ] Si no hay `production_order_id`, el badge de avance muestra solo "Dia X" sin "de Y"
- [ ] En mobile (< 768px), los badges hacen wrap a multiples filas manteniendo legibilidad
- [ ] `npx next build` pasa sin errores

#### Backend
- Modificar: `convex/batches.ts` — enriquecer `getById` con `currentPhaseInfo` desde `order_phases`

#### Frontend
- Crear: `components/batches/batch-stats-bar.tsx`
- Modificar: `app/(dashboard)/batches/[id]/page.tsx` — reemplazar stats Card por BatchStatsBar

#### Dependencias
- Ninguna — puede ejecutarse en paralelo con US-LOT.1

---

### US-LOT.3: Reducir tabs a 3 — Detalle, Actividades, Analytics

**Como** usuario del sistema
**quiero** una pagina simplificada con solo los tabs esenciales
**para** navegar rapidamente entre la informacion que realmente uso sin scroll horizontal excesivo en los tabs

#### Criterios de Aceptacion
- [ ] Se eliminan 9 tabs y su contenido:
  - Plan de Cultivo (`CultivationTimeline`)
  - Calidad (`BatchQualityChecksTab`)
  - Observaciones (`ActiveIssuesDashboard`)
  - Genealogia (`BatchGenealogyTab`)
  - Notas (`BatchNotesTab`)
  - Costos (`BatchCostSummary`)
  - Movimientos (inline)
  - Perdidas (inline)
  - Historial (inline)
  - Plantas (`PlantsTab`, condicional)
- [ ] Quedan exactamente 3 tabs: "Detalle", "Actividades", "Analytics"
- [ ] Tab "Detalle" conserva su contenido actual sin cambios (Info General + Ubicacion y Fechas + Child Batches)
- [ ] Tab "Actividades" renderiza placeholder temporal (se implementa en US-LOT.4)
- [ ] Tab "Analytics" renderiza placeholder temporal (se implementa en US-LOT.5)
- [ ] Se elimina la query `unresolvedObsCount` (ya no se muestra badge de observaciones)
- [ ] Se eliminan imports no usados de componentes de tabs removidos
- [ ] Se eliminan archivos de tabs que SOLO se usan en esta pagina (verificar con grep):
  - `components/batches/batch-quality-checks-tab.tsx` (placeholder, solo en page + index)
  - `components/batches/batch-genealogy-tab.tsx` (solo en page + index)
  - `components/batches/batch-notes-tab.tsx` (solo en page + index)
  - `components/batches/batch-activities-tab.tsx` (solo en page + index, reemplazado por tabla)
- [ ] NO se eliminan componentes usados en otros contextos:
  - `cultivation-timeline.tsx` — verificar si se usa fuera de esta pagina
  - `active-issues-dashboard.tsx` — tiene su propia pagina
  - `batch-cost-summary.tsx` — verificar uso
  - `plants-tab.tsx` — verificar uso
- [ ] Se actualiza `components/batches/index.ts` removiendo los exports eliminados
- [ ] `npx next build` pasa sin errores

#### Frontend
- Modificar: `app/(dashboard)/batches/[id]/page.tsx` — eliminar 9 tabs
- Modificar: `components/batches/index.ts` — limpiar exports
- Eliminar: 4 archivos de tabs (despues de confirmar cero importaciones externas)

#### Dependencias
- Ninguna — puede ejecutarse en paralelo con US-LOT.1 y US-LOT.2

---

### US-LOT.4: Tabla de actividades con paginador de fases y filtros

**Como** supervisor u operador
**quiero** ver las actividades del lote en una tabla filtrable con paginador de fases en el toolbar
**para** buscar rapidamente actividades especificas por fase, tipo, fecha o responsable en lotes con muchas actividades

#### Criterios de Aceptacion
- [ ] Componente nuevo `components/batches/batch-activities-table.tsx` reemplaza el timeline actual
- [ ] **Toolbar** con 4 controles:
  1. **Paginador de fases** (izquierda): botones `◀` `▶` para navegar entre fases de la orden de produccion. Muestra "Fase: [nombre] (Dia X de Y)" o "Todas" para ver sin filtro. Las fases vienen de `order_phases` ordenadas por `phase_order`. Si no hay `production_order_id`, extrae fases unicas de las actividades del lote
  2. **Filtro tipo de actividad**: Select con `activity_types` de la company, filtra client-side por `type_id` o `category`
  3. **Filtro rango de tiempo**: presets "Hoy", "Esta semana", "Este mes", "Todo" (default) — filtra por `timestamp`
  4. **Filtro responsable**: Select con usuarios unicos extraidos de las actividades del lote
- [ ] **Columnas de la tabla**:
  - Fecha (`timestamp`) — formato `dd MMM yyyy HH:mm`, sortable
  - Tipo — badge con color de categoria (`CATEGORY_COLORS`), nombre del activity type
  - Fase (`crop_phase`) — badge con `PHASE_COLORS`
  - Cant. Inicial (`quantity_before`) — numero o "—"
  - Cant. Final (`quantity_after`) — numero con delta visual: verde si aumento, rojo si disminuyo, gris si sin cambio
  - Responsable (`performedByName`) — texto
  - Duracion (`duration_minutes`) — "Xmin" o "—"
  - Notas (`notes`) — truncado a 50 chars con tooltip para ver completo
- [ ] Sorting por defecto: fecha descendente (mas reciente primero)
- [ ] Paginacion: 15 filas por pagina con controles prev/next
- [ ] Usa `components/ui/data-table.tsx` como base (TanStack React Table)
- [ ] Reutiliza query existente `api.activities.listByBatch` — aumentar limit a 500 o quitar limite para lotes con muchas actividades
- [ ] Filtros se aplican client-side sobre el dataset cargado
- [ ] Estado empty: "No hay actividades registradas" si no hay datos, "No hay actividades que coincidan con los filtros" si hay datos pero filtros excluyen todo
- [ ] `npx next build` pasa sin errores

#### Backend
- Modificar: `convex/activities.ts` — en `listByBatch`, cambiar limit default de 100 a 500 o hacer parametrizable

#### Frontend
- Crear: `components/batches/batch-activities-table.tsx`
- Modificar: `app/(dashboard)/batches/[id]/page.tsx` — usar nuevo componente en tab Actividades
- Reutilizar: `components/ui/data-table.tsx`, `lib/constants/phases.ts`

#### Dependencias
- Requiere: US-LOT.3 (tabs reducidos con placeholder de Actividades)

---

### US-LOT.5: Tab de Analytics basicas

**Como** supervisor o agronomo
**quiero** ver metricas agregadas del lote en un tab dedicado de analytics
**para** entender patrones de actividad, consumo de recursos, costos y salud del cultivo sin exportar datos

#### Criterios de Aceptacion
- [ ] Componente nuevo `components/batches/batch-analytics-tab.tsx` con dos secciones

**Seccion 1: Actividades y Recursos**
- [ ] **Actividades por tipo**: bar chart horizontal (Recharts `BarChart`) agrupando actividades por `category` o `type_id`. Muestra nombre + conteo. Colores de `CATEGORY_COLORS`. Si no hay actividades, muestra empty state
- [ ] **Actividades por fase**: bar chart o lista con badges de `PHASE_COLORS`, conteo de actividades por `crop_phase`
- [ ] **Top 5 recursos consumidos**: tabla mini con columnas: producto, cantidad total, unidad, costo total. Agrupa `activity_resources` por `product_id`, suma `quantity` y `cost_total`
- [ ] **Costo acumulado**: numero grande con formato de moneda colombiana ($XXX,XXX) sumando costos de recursos

**Seccion 2: Produccion y Salud**
- [ ] **Curva de supervivencia**: line chart (Recharts `LineChart`) con eje X = dias en produccion, eje Y = plantas vivas. Data points de actividades con `quantity_after` ordenadas cronologicamente. Linea verde, area bajo la curva semitransparente
- [ ] **Perdidas por causa**: donut chart (Recharts `PieChart`) o lista con barras, agrupando `batch.losses` por `reason`. Muestra: causa, cantidad, % del total de perdidas
- [ ] **Avance de fases vs planificado**: timeline horizontal mostrando cada `order_phase` como barra. Barra superior = planificado (gris), barra inferior = real (verde si a tiempo, amber si atrasado, gris si pendiente). Si no hay production order, muestra mensaje "Sin orden de produccion vinculada"

- [ ] Query backend nueva `api.activities.getBatchAnalytics(batchId)` que retorna datos pre-agregados:
  ```
  activitiesByType: [{ typeId, typeName, category, count }]
  activitiesByPhase: [{ phase, count }]
  resourceSummary: [{ productId, productName, totalQuantity, unit, totalCost }]
  totalCost: number
  survivalCurve: [{ timestamp, quantity }]
  ```
- [ ] Para perdidas y fases, reutilizar datos del `batch.getById` enrichment existente (`batch.losses`, `currentPhaseInfo`) y agregar query de `order_phases`
- [ ] Los charts usan Recharts (ya instalado: `recharts@3.5.1`)
- [ ] Layout responsivo: en desktop 2 columnas (Actividades/Recursos | Produccion/Salud), en mobile 1 columna
- [ ] `npx next build` pasa sin errores

#### Backend
- Crear query: `api.activities.getBatchAnalytics` en `convex/activities.ts`
- Usar query existente: `order_phases` via `production_order_id`

#### Frontend
- Crear: `components/batches/batch-analytics-tab.tsx`
- Modificar: `app/(dashboard)/batches/[id]/page.tsx` — usar nuevo componente en tab Analytics
- Reutilizar: Recharts (`BarChart`, `LineChart`, `PieChart`), `lib/constants/phases.ts`

#### Dependencias
- Requiere: US-LOT.3 (tabs reducidos con placeholder de Analytics)

---

## Schema Changes

Ninguno — toda la data necesaria ya existe en las tablas actuales (`activities`, `activity_resources`, `order_phases`, `batches`, `batch_losses`).

## Consideraciones Tecnicas

- **Eliminacion de modales**: Los 6 modales se usan tanto en `batches/[id]/page.tsx` como en `batch-card.tsx`. Ambos deben limpiarse. Verificar que `batch-card.tsx` no se rompe al quitar las acciones — puede necesitar simplificar el dropdown menu.
- **Performance de actividades**: La query `listByBatch` actualmente tiene limit de 100. Para lotes con muchas actividades, se necesita aumentar o implementar paginacion server-side. Para esta iteracion, se aumenta a 500 y se filtra client-side. Si resulta insuficiente, se implementa cursor-based pagination en una iteracion futura.
- **Recharts**: Ya instalado, version 3.5.1. Usar componentes responsive (`ResponsiveContainer`) para que los charts se adapten al tamaño del contenedor.
- **Avance de fase**: Requiere enriquecer `batches.getById` con datos de `order_phases`. Es una sub-query adicional que agrega ~1 round-trip pero es necesaria para el calculo correcto de "Dia X de Y".
- **Barrel exports**: `components/batches/index.ts` necesita actualizarse despues de cada eliminacion para evitar imports rotos.

## Out of Scope

- Refactorizacion del tab Detalle (se conserva tal cual)
- Creacion del `ActivityExecutionSheet` (viene de FEAT-2026-02-activity-execution-refactor)
- Paginacion server-side para actividades (se evalua si 500 es insuficiente)
- Drill-down desde charts de analytics hacia actividades individuales
- Export de datos de analytics (CSV, PDF)
- Acciones batch sobre actividades (eliminar, editar multiples)

---

## Implementacion

### Commits
- `465f9ec` — feat(batches): US-LOT.1 simplify header — remove 6 modals, single action button
- `2cfe311` — feat(batches): US-LOT.2 compact stats badges with phase progress
- `eec2d28` — feat(batches): US-LOT.3 reduce tabs to 3 — Detalle, Actividades, Analytics
- `85e95e4` — feat(batches): US-LOT.4 activity table with phase paginator and filters
- `052acf7` — feat(batches): US-LOT.5 analytics tab with Recharts visualizations

### Archivos Modificados
- `app/(dashboard)/batches/[id]/page.tsx` — refactored from 12 tabs to 3, removed 6 modals
- `components/batches/batch-stats-bar.tsx` — NEW: compact stats badges with phase progress
- `components/batches/batch-activities-table.tsx` — NEW: TanStack table with phase paginator and filters
- `components/batches/batch-analytics-tab.tsx` — NEW: Recharts analytics (6 visualizations)
- `components/batches/batch-card.tsx` — simplified actions dropdown
- `components/batches/index.ts` — cleaned exports
- `convex/batches.ts` — enriched getById with orderPhases
- `convex/activities.ts` — increased listByBatch limit, added getBatchAnalytics query

### Archivos Eliminados
- 6 modales: batch-move-modal, batch-split-wizard, batch-loss-modal, batch-harvest-wizard, batch-merge-modal, batch-archive-modal
- 4 tabs: batch-activities-tab, batch-quality-checks-tab, batch-genealogy-tab, batch-notes-tab

### Fecha de Completado
2026-02-13
