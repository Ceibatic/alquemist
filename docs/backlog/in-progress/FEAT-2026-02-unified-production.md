# FEAT-2026-02-unified-production

## Metadata
- **Creado:** 2026-02-11
- **Prioridad:** high
- **Modulo relacionado:** M22-production-templates
- **Tipo:** feature

## Descripcion

Unificar en una sola pagina `/production` los modulos de produccion actualmente dispersos: tablero de fases con lotes, analytics de produccion, y ordenes de produccion. Esto reemplaza tres paginas independientes del sidebar (`Lotes`, `Ordenes`, `Actividades`) con un unico punto de acceso "Produccion" que ofrece vision integral del estado productivo.

El tablero de fases muestra un board con las fases de produccion activas a nivel de facility, cada una con stats y cards de lotes, permitiendo drill-down al detalle de fase. El tab de analytics muestra KPIs basicos (plantas activas, mortalidad, ordenes, rendimiento). El tab de ordenes centraliza la gestion completa del ciclo de ordenes de produccion. Ademas, se simplifica el detalle de la orden (1 orden ≈ 1 lote, sin tab de Lotes) y se mueven las actividades programadas del dia al dashboard principal.

## User Stories

### US-PRD.1: Pagina unificada de produccion con tabs

**Como** administrador de operaciones
**quiero** acceder a toda la informacion de produccion desde una sola pagina con tabs
**para** tener una vision integral del estado productivo sin navegar entre multiples paginas dispersas

#### Criterios de Aceptacion
- [x] La pagina `/production` muestra 3 tabs: "Tablero" | "Analytics" | "Ordenes"
- [x] Tab "Tablero" es el tab activo por defecto al entrar a `/production`
- [x] La URL refleja el tab activo via query param (`/production?tab=analytics`, `/production?tab=orders`) para deep linking
- [x] El sidebar muestra un item "Produccion" que navega a `/production`
- [x] Se eliminan del sidebar los items: "Lotes", "Ordenes", "Actividades"
- [x] La pagina se muestra solo si hay facility seleccionada (usa FacilityProvider context)
- [x] Header de pagina muestra "Produccion" con breadcrumbs "Inicio > Produccion"

#### Frontend
- Pagina: `app/(dashboard)/production/page.tsx` (nueva)
- Componentes: reutiliza Tabs pattern de shadcn/ui
- Estados UI: loading skeleton por tab, facility required guard

#### Backend
- Sin cambios — solo reorganizacion de UI

#### Dependencias
- Ninguna

---

### US-PRD.2: Tablero de fases de produccion (phase board)

**Como** administrador de operaciones
**quiero** ver un tablero con todas las fases de produccion activas de la facility, cada una con estadisticas y listado de lotes
**para** tener una vista panoramica del estado de toda la produccion en curso

#### Criterios de Aceptacion
- [x] El tab "Tablero" muestra un CompactStats global en la parte superior con: Total lotes activos, Total plantas activas, Mortalidad promedio, Ordenes activas
- [x] Debajo de stats, muestra un grid de `PhaseCard` (reutilizando el componente existente con adaptaciones) con todas las fases que tienen lotes activos
- [x] Cada PhaseCard muestra: nombre de fase con badge de color, conteo de lotes, total de plantas, dias promedio en fase
- [x] Dentro de cada PhaseCard se listan los lotes de esa fase mostrando: codigo del lote, nombre del cultivar, cantidad actual, area donde esta
- [x] Las fases se ordenan segun progresion biologica: propagacion → germinacion → plantula → vegetativo → floracion → cosecha → post-cosecha → procesamiento
- [x] Fases sin lotes activos NO se muestran (solo fases con produccion activa)
- [x] Cada PhaseCard completa es clickable y navega al detalle de la fase: `/production/phases/[phase]`
- [x] Cada lote dentro del card es clickable y navega al detalle del lote: `/batches/[id]`
- [x] El grid es responsive: 1 columna en mobile, 2 en tablet, 3 en desktop
- [x] Loading state: 3 skeleton cards mientras carga

#### Backend
- Query nueva: `api.batches.listGroupedByPhase` — similar a `listByAreaGroupedByPhase` pero agrupando TODOS los lotes activos de la facility (sin filtro de area)
  - Args: `{ companyId, facilityId }`
  - Retorna: `{ phase, batchCount, totalPlants, avgDays, batches: [{ _id, batch_code, current_quantity, current_phase, cultivarName, daysInProduction, areaName }] }[]`
  - Nota: incluye `areaName` en cada batch (diferencia vs query de area que no lo necesita)
  - Ordenado por PHASE_ORDER

#### Frontend
- Componente: `components/production/production-phase-board.tsx` (nuevo)
- Reutiliza: `PhaseCard` de `components/areas/phase-card.tsx` con adaptacion para mostrar areaName
- Reutiliza: `CompactStats` pattern existente

#### Dependencias
- Requiere: US-PRD.1 (pagina contenedora)

---

### US-PRD.3: Detalle global de fase de produccion

**Como** administrador de operaciones
**quiero** ver el detalle de una fase de produccion con todos los lotes en esa fase a nivel de facility, con filtros por area y categoria de actividad
**para** analizar el estado de produccion de una fase especifica sin estar limitado a una sola area

#### Criterios de Aceptacion
- [x] La pagina `/production/phases/[phase]` muestra el detalle de una fase con todos los lotes de la facility en esa fase
- [x] Header: nombre de la fase con badge de color + breadcrumbs "Inicio > Produccion > [Fase]"
- [x] CompactStats: conteo de lotes, total plantas, dias promedio (mismas metricas que la PhaseCard)
- [x] **Filtro de areas**: multi-select de areas que tienen lotes en esta fase (ademas del filtro de lotes existente en el phase detail de areas)
- [x] **Filtro de lotes**: checkboxes con codigos de lote para filtrar actividades (igual que en area phase detail)
- [x] **Filtro de categoria**: dropdown de categorias de actividad (igual que en area phase detail)
- [x] Tabla de actividades con columnas: Fecha, Tipo, Lote, Area, Responsable, Duracion, Notas
- [x] Nota: incluye columna "Area" (diferencia vs area phase detail que no la necesita)
- [x] Click en fila de actividad navega a `/production/activities/[actId]` (o reutiliza la ruta existente de areas)
- [x] Click en codigo de lote navega a `/batches/[id]`
- [x] Si no hay lotes en la fase, mostrar empty state "Sin lotes en esta fase"
- [x] Si no hay actividades con los filtros aplicados, mostrar "Sin actividades"

#### Backend
- Query nueva: `api.batches.listByPhase` — obtener todos los lotes activos en una fase para una facility
  - Args: `{ companyId, facilityId, phase }`
  - Retorna: lotes enriquecidos con cultivarName, areaName, daysInProduction
- Query nueva o adaptada: `api.activities.listByPhase` — obtener actividades de lotes en una fase global (sin filtro de area)
  - Args: `{ companyId, facilityId, phase, areaIds?, batchIds?, category?, limit? }`
  - Retorna: actividades enriquecidas igual que `listByAreaAndPhase` pero con areaName adicional

#### Frontend
- Pagina: `app/(dashboard)/production/phases/[phase]/page.tsx` (nueva)
- Reutiliza: `PhaseDetailFilters` adaptado para incluir filtro de area
- Reutiliza: `DataTable` pattern existente
- Reutiliza: `CompactStats`, phase colors/labels de `lib/constants/phases.ts`

#### Dependencias
- Requiere: US-PRD.2 (navegacion desde phase board)

---

### US-PRD.4: Dashboard de analytics de produccion (KPIs basicos)

**Como** administrador de operaciones
**quiero** ver un dashboard con KPIs basicos de produccion en un tab dedicado
**para** monitorear el rendimiento general de la produccion sin necesidad de consultar multiples paginas

#### Criterios de Aceptacion
- [x] El tab "Analytics" muestra 4 KPI cards principales en fila:
  - **Plantas activas**: total de plantas en lotes activos de la facility, con icono Sprout
  - **Mortalidad global**: porcentaje promedio de mortalidad de lotes activos, con icono TrendingDown, color rojo si > 15%, amber si 5-15%, verde si < 5%
  - **Ordenes activas**: conteo de ordenes en estado "active", con icono ClipboardList
  - **Rendimiento acumulado**: suma de `actual_yield` de ordenes completadas en los ultimos 12 meses, con icono BarChart y unidad (kg/plantas segun config)
- [x] Debajo de KPIs, seccion "Distribucion por fase" con un chart de barras horizontal o donut chart mostrando cantidad de lotes por fase (con colores de fase)
- [x] Seccion "Mortalidad por periodo": chart de linea mostrando evolucion de mortalidad promedio en los ultimos 30/60/90 dias (selector de periodo)
- [x] Seccion "Lotes recientes": tabla con los ultimos 10 lotes creados mostrando: codigo, cultivar, fase actual, plantas, dias, area
- [x] Todos los KPIs se calculan para la facility seleccionada
- [x] Loading state: skeleton cards y charts mientras carga

#### Backend
- Query: reutilizar `api.batches.getStats` (ya retorna totalBatches, activeBatches, totalPlantsActive, averageMortalityRate, batchesByPhase)
- Query: reutilizar `api.productionOrders.getStats` (ya retorna activeOrders, completedOrders, totalPlantsActual)
- Query nueva: `api.batches.getMortalityTrend` — mortalidad promedio agrupada por semana/mes para los ultimos N dias
  - Args: `{ companyId, facilityId, days: 30|60|90 }`
  - Retorna: `{ date: string, mortalityRate: number }[]`
- Query nueva: `api.batches.listRecent` — ultimos N lotes creados
  - Args: `{ companyId, facilityId, limit: 10 }`
  - Retorna: lotes basicos con cultivarName, areaName

#### Frontend
- Componente: `components/production/production-analytics.tsx` (nuevo)
- Charts: usar Recharts (ya disponible en el proyecto) para barras y lineas
- Reutiliza: `CompactStats` o similar pattern de KPI cards

#### Dependencias
- Requiere: US-PRD.1 (pagina contenedora)

---

### US-PRD.5: Tab de ordenes de produccion

**Como** administrador de operaciones
**quiero** gestionar las ordenes de produccion (crear, consultar, filtrar por estado) desde el tab "Ordenes" de la pagina de produccion
**para** centralizar la gestion del ciclo de produccion sin una pagina separada

#### Criterios de Aceptacion
- [ ] El tab "Ordenes" renderiza el contenido actual de `/production-orders` sin cambios funcionales
- [ ] CompactStats en la parte superior: Total ordenes, Activas, En planificacion, Completadas (reutiliza stats actuales)
- [ ] Listado de ordenes con los mismos filtros: estado (planning/active/completed/cancelled), busqueda por numero/cultivar/template
- [ ] Boton "Crear orden" abre `ProductionOrderCreateModal` existente
- [ ] Cards de ordenes con el mismo formato existente (`ProductionOrderCard`)
- [ ] Click en card navega al detalle de la orden: `/production/orders/[id]` (nueva ruta bajo /production)
- [ ] El detalle de la orden se mueve a `/production/orders/[id]` manteniendo toda la funcionalidad existente (tabs Detalle, Fases, Actividades)

#### Frontend
- Componente: reutilizar `ProductionOrderList` en el tab
- Pagina nueva: `app/(dashboard)/production/orders/[id]/page.tsx` — detalle de orden (copiar logica de `/production-orders/[id]`)
- Redirect: `/production-orders` → `/production?tab=orders`
- Redirect: `/production-orders/[id]` → `/production/orders/[id]`

#### Backend
- Sin cambios — reutiliza todas las queries y mutations existentes de `productionOrders.ts`

#### Dependencias
- Requiere: US-PRD.1 (pagina contenedora)
- Requiere: US-PRD.6 (simplificacion del detalle)

---

### US-PRD.6: Simplificar detalle de orden (1 orden ≈ 1 lote)

**Como** administrador de operaciones
**quiero** que el detalle de la orden muestre el lote asociado directamente en el tab Detalle sin un tab separado de "Lotes"
**para** simplificar la navegacion reflejando que cada orden corresponde tipicamente a un solo lote

#### Criterios de Aceptacion
- [x] El detalle de la orden tiene 3 tabs en lugar de 4: "Detalle" | "Fases" | "Actividades" (se elimina tab "Lotes")
- [x] En el tab "Detalle", se agrega una seccion "Lote de produccion" que muestra:
  - Si hay un lote vinculado: card con codigo del lote, fase actual, plantas actuales, mortalidad, dias en produccion, area, y link "Ver detalle del lote" que navega a `/batches/[id]`
  - Si hay multiples lotes (ordenes legacy): mostrar lista de cards de lotes con la misma info
  - Si no hay lotes (orden en planificacion): mostrar "Sin lote asignado — se creara al activar la orden"
- [x] La funcionalidad del tab "Fases" se mantiene identica (completar fases)
- [x] La funcionalidad del tab "Actividades" se mantiene identica (programadas + historial)
- [x] El boton "Activar Orden" sigue creando el lote automaticamente y la seccion de lote se actualiza en tiempo real
- [x] No se modifica el backend — la query `getById` ya incluye batches

#### Frontend
- Modificar: pagina de detalle de orden — eliminar TabsTrigger de "Lotes", agregar seccion en tab Detalle
- Componente: `components/production-orders/order-batch-summary.tsx` (nuevo, seccion inline)

#### Backend
- Sin cambios

#### Dependencias
- Requiere: US-PRD.5 (nueva ubicacion del detalle)

---

### US-PRD.7: Mover actividades programadas al dashboard principal

**Como** operador de campo
**quiero** ver mis actividades programadas del dia (pendientes, atrasadas, proximas) directamente en el dashboard principal al iniciar sesion
**para** saber inmediatamente que tengo que hacer hoy sin navegar a una pagina separada

#### Criterios de Aceptacion
- [ ] El dashboard principal (`/dashboard`) incluye una nueva seccion "Actividades de hoy" en la vista operativa
- [ ] La seccion muestra 3 sub-secciones colapsables:
  - **Atrasadas** (rojo): actividades pendientes con fecha anterior a hoy, con badge de conteo
  - **Hoy**: actividades programadas para hoy, agrupadas por lote
  - **Proximos 3 dias**: actividades de los proximos 3 dias (colapsado por defecto)
- [ ] Cada actividad muestra: icono de estado, nombre, badge de lote, fecha, fase, duracion estimada
- [ ] Cada actividad pendiente tiene boton "Reportar" que abre el `ActivityReportSheet` del FEAT-2026-02-unified-templates-activity-report (si ya esta implementado) o navega al detalle del lote
- [ ] El boton "Saltar" con dialogo de razon se mantiene para actividades pendientes
- [ ] Si no hay actividades para hoy, mostrar empty state "Sin actividades programadas para hoy"
- [ ] La seccion solo se muestra si hay facility seleccionada
- [ ] En la vista administrativa, la seccion de actividades se muestra como card mas compacto con solo los conteos (pendientes hoy, atrasadas, completadas hoy)
- [ ] La pagina `/scheduled-activities` redirige a `/dashboard` con scroll a la seccion de actividades

#### Frontend
- Componente: `components/dashboard/today-activities-widget.tsx` (nuevo)
- Modificar: `app/(dashboard)/dashboard/page.tsx` — integrar widget en dashboard operativo y administrativo
- Reutiliza: queries existentes `api.cultivationSchedules.getScheduledForDate` y `getOverdue`
- Redirect: `/scheduled-activities` → `/dashboard`

#### Backend
- Sin cambios — reutiliza queries existentes de `cultivationSchedules.ts`

#### Dependencias
- Requiere: US-PRD.1 (para que el sidebar no tenga "Actividades" como item independiente)
- Relacionado: FEAT-2026-02-unified-templates-activity-report (boton "Reportar" usa ActivityReportSheet)

---

### US-PRD.8: Limpieza de navegacion y rutas

**Como** usuario del sistema
**quiero** que la navegacion refleje la nueva estructura unificada sin entradas duplicadas ni rutas huerfanas
**para** tener una experiencia coherente con un unico punto de acceso para produccion

#### Criterios de Aceptacion
- [ ] El sidebar muestra "Produccion" en lugar de "Lotes", "Ordenes", "Actividades" (3 items → 1 item)
- [ ] Se eliminan del sidebar: "Lotes" (`/batches`), "Ordenes" (`/production-orders`), "Actividades" (`/scheduled-activities`)
- [ ] Redirects configurados:
  - `/batches` → `/production` (tab Tablero, donde los lotes se ven por fase)
  - `/production-orders` → `/production?tab=orders`
  - `/production-orders/[id]` → `/production/orders/[id]`
  - `/scheduled-activities` → `/dashboard`
- [ ] La ruta `/batches/[id]` (detalle del lote) se mantiene funcional — NO se redirige ni elimina
- [ ] Breadcrumbs de paginas internas apuntan correctamente:
  - Detalle de fase: "Inicio > Produccion > [Fase]"
  - Detalle de orden: "Inicio > Produccion > Ordenes > [Numero]"
  - Detalle de lote: "Inicio > Produccion > [Codigo]" (actualizar breadcrumbs del batch detail)
- [ ] No quedan links rotos en toda la aplicacion (verificar con build)
- [ ] El sidebar queda con los siguientes items:
  1. Dashboard
  2. Areas
  3. Produccion (NUEVO — reemplaza Lotes + Ordenes + Actividades)
  4. Cultivares
  5. Proveedores
  6. Productos
  7. Inventario
  8. Templates (del FEAT anterior)
  9. Usuarios
  10. Instalaciones
  11. Configuracion

#### Frontend
- Modificar: `components/layout/sidebar.tsx` — restructurar items
- Crear: redirects en `app/(dashboard)/batches/page.tsx`, `app/(dashboard)/production-orders/page.tsx`, `app/(dashboard)/scheduled-activities/page.tsx`
- Verificar: todos los `router.push()`, `Link href`, y breadcrumbs que apunten a rutas viejas

#### Dependencias
- Requiere: US-PRD.1-7 (todas las funcionalidades migradas antes de limpiar)

---

## Schema Changes

No se requieren cambios de schema. Toda la feature es reorganizacion de UI y nuevas queries.

## Nuevas Queries Backend

| Query | Archivo | Descripcion |
|-------|---------|-------------|
| `batches.listGroupedByPhase` | `convex/batches.ts` | Agrupa lotes activos por fase a nivel facility (sin filtro de area) |
| `batches.listByPhase` | `convex/batches.ts` | Lista lotes activos en una fase especifica para una facility |
| `activities.listByPhase` | `convex/activities.ts` | Lista actividades de lotes en una fase con filtros de area, batch, categoria |
| `batches.getMortalityTrend` | `convex/batches.ts` | Mortalidad promedio agrupada por semana para los ultimos N dias |
| `batches.listRecent` | `convex/batches.ts` | Ultimos N lotes creados en la facility |

## Consideraciones Tecnicas

- **Arquitectura:** La pagina `/production` es un contenedor de tabs que renderiza componentes independientes por tab. Cada tab carga sus propias queries al activarse (lazy loading de datos).
- **Reutilizacion:** Se reutilizan PhaseCard, PhaseDetailFilters, ProductionOrderList, ProductionOrderCard, BatchCard, CompactStats, DataTable. Se adaptan minimamente para el nuevo contexto (ej: PhaseCard agrega areaName).
- **Integraciones:** El tablero de fases complementa (no reemplaza) la vista de produccion en el area detail. El area detail sigue mostrando fases filtradas por area; el tablero muestra fases globales de facility.
- **Riesgos:**
  - La query `listGroupedByPhase` a nivel facility puede retornar muchos lotes si hay produccion masiva. Considerar paginacion o limite de lotes por fase (ej: mostrar top 20 con "ver todos").
  - El detalle de lote (`/batches/[id]`) tiene breadcrumbs que apuntan a `/batches`. Actualizar para apuntar a `/production`.
  - Las actividades del dashboard dependen de `cultivationSchedules` queries que ya existen pero pueden necesitar optimizacion si hay muchas actividades.
- **Performance:** Las queries de analytics (mortalidad temporal, lotes recientes) deben usar indices existentes (`by_facility`, `by_status`) y limitar resultados. Los charts se renderizan client-side con Recharts.
- **Charts:** El proyecto ya usa Recharts (verificar), o se puede usar `shadcn/ui` charts que wrappea Recharts.

## Out of Scope

- **Modificar el area detail**: La vista de produccion por area (tab Produccion en `/areas/[id]`) no se modifica ni se elimina
- **Detalle del lote**: La pagina `/batches/[id]` con sus 11 tabs no se modifica funcionalmente, solo se actualizan breadcrumbs
- **Backend de ordenes**: No se cambia la logica de creacion/activacion de ordenes ni la relacion orden-lotes en backend
- **Notificaciones de actividades**: No se implementan push notifications o emails para actividades pendientes
- **Filtro avanzado en tablero**: No se agrega filtro por cultivar, tipo de lote, o prioridad en el phase board
- **Export/reports**: No se agrega exportacion a PDF/Excel del dashboard
- **Pack completo de analytics**: Eficiencia por fase (real vs planificado), costos, capacidad de areas quedan para iteracion futura
- **Drag-and-drop en tablero**: No se permite mover lotes entre fases con drag-and-drop (se sigue usando el flujo de cambio de fase del lote)

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits

### Archivos Modificados

### Fecha de Completado
