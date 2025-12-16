# Module 25: Batches (Lotes)

## Overview

El modulo de Batches (Lotes) permite gestionar grupos de plantas a traves de su ciclo de vida. Un batch es la unidad principal de trazabilidad y representa un conjunto de plantas del mismo cultivar, edad y tratamiento. Los batches se crean automaticamente desde ordenes de produccion o manualmente para operaciones especiales.

**Estado**: ✅ Implementado (Backend + Frontend)

---

## Implementacion Actual

### Backend (Convex)

**Archivo**: `convex/batches.ts`

#### Queries Implementadas
| Funcion | Descripcion |
|---------|-------------|
| `list` | Lista batches con filtros multiples |
| `getById` | Detalle completo con plants, movements, losses, harvests |
| `getStats` | Estadisticas por company/facility |

#### Mutations Implementadas
| Funcion | Descripcion |
|---------|-------------|
| `create` | Crea batch con plantas individuales (opcional) |
| `move` | Mueve batch a otra area + activity log |
| `recordLoss` | Registra perdidas + activity log |
| `split` | Divide batch en multiples + activity log |
| `merge` | Combina batches + activity log |
| `harvest` | Registra cosecha + activity log |
| `updatePhase` | Cambia fase + activity log |
| `archive` | Archiva batch completado |

### Activity Logging

**IMPORTANTE**: Todas las operaciones de batch crean registros automaticos en la tabla `activities`:

| Operacion | Activity Type |
|-----------|---------------|
| `move` | `movement` |
| `recordLoss` | `loss_record` |
| `split` | `batch_split` |
| `merge` | `batch_merge` |
| `harvest` | `harvest` |
| `updatePhase` | `phase_transition` |

**Datos registrados en cada activity**:
```typescript
{
  entity_type: "batch",
  entity_id: batchId,
  activity_type: "movement" | "loss_record" | etc,
  performed_by: userId,
  timestamp: now,
  quantity_before: number,
  quantity_after: number,
  area_from?: areaId,     // para movimientos
  area_to?: areaId,       // para movimientos
  activity_metadata: {},  // datos especificos
  notes: string,
}
```

### Creacion desde Orden de Produccion

Cuando se activa una orden (`productionOrders.activate`):

1. Se calculan batches: `Math.ceil(requested_quantity / batch_size)`
2. Se crea cada batch con:
   - `batch_code`: CULTIVAR-YYMMDD-XXX
   - `production_order_id`: referencia a la orden
   - `status`: "active"
   - `current_phase`: primera fase del template
3. Se actualizan `scheduled_activities.entity_type` de "production_order" a "batch"

### Frontend

**Archivos**:
- `app/(dashboard)/batches/page.tsx` - Lista de batches
- `app/(dashboard)/batches/[id]/page.tsx` - Detalle de batch
- `components/batches/batch-create-modal.tsx` - Modal de creacion

---

## User Stories

### US-25.1: Ver lista de batches
**Como** operador de produccion
**Quiero** ver todos los batches activos
**Para** monitorear el estado de la produccion

**Criterios de Aceptacion:**
- [ ] Grid de cards o tabla de batches
- [ ] Filtros: estado, tipo, area, cultivar, orden de produccion
- [ ] Cada batch muestra: codigo, cultivar, cantidad plantas, fase actual, dias de vida, area
- [ ] Badge de estado con color
- [ ] Progress bar de fase actual
- [ ] Search por codigo o cultivar
- [ ] Cards clickeables navegan a `/batches/[id]`
- [ ] Stats: Batches activos, Plantas totales, Por fase, Mortalidad promedio
- [ ] Ordenar por: fecha creacion, dias de vida, cantidad plantas

**Consulta:** `batches.list({ companyId, facilityId?, status?, areaId?, cultivarId? })`

**Componentes:** `app/(dashboard)/batches/page.tsx`, `components/batches/batch-list.tsx`

---

### US-25.2: Ver detalle de batch
**Como** operador de produccion
**Quiero** ver el detalle completo de un batch
**Para** tomar decisiones de manejo

**Criterios de Aceptacion:**
- [ ] Pagina `/batches/[id]` con informacion completa
- [ ] Header con codigo, fase actual, dias de vida, estado
- [ ] Botones: Registrar actividad, Mover, Dividir, Combinar (segun estado)
- [ ] Breadcrumb: Inicio > Batches > [Codigo]
- [ ] **Tab Resumen:**
  - Info basica: cultivar, tipo, fecha creacion, fuente
  - Ubicacion actual: area, posicion
  - Plantas: inicial, actual, perdidas, tasa mortalidad
  - Fase actual con progreso
  - Proximas actividades programadas
- [ ] **Tab Plantas:**
  - Lista de plantas individuales (si tracking habilitado)
  - Estado de cada planta
  - Quick actions por planta
- [ ] **Tab Actividades:**
  - Historial de actividades realizadas
  - Actividades programadas
  - Timeline visual
- [ ] **Tab Quality Checks:**
  - Inspecciones realizadas
  - Resultados y tendencias
  - Alertas si hay issues
- [ ] **Tab Genealogia:**
  - Batch padre (si es division)
  - Batches hijos (si tuvo divisiones)
  - Plantas madre (si es clon)
- [ ] **Tab Notas:**
  - Notas y observaciones
  - Fotos adjuntas
  - Incidencias registradas

**Consulta:** `batches.getById({ batchId })` con actividades y plantas

**Componentes:** `app/(dashboard)/batches/[id]/page.tsx`

---

### US-25.3: Crear batch manualmente
**Como** administrador de produccion
**Quiero** crear un batch fuera de una orden de produccion
**Para** registrar plantas de fuentes especiales

**Criterios de Aceptacion:**
- [ ] Boton "Nuevo Batch" abre modal
- [ ] Campos:
  - Codigo (auto-generado o custom)*
  - Tipo: produccion, madre, investigacion, rescate*
  - Cultivar*
  - Cantidad de plantas*
  - Fuente: semilla, clon, compra, rescate*
  - Proveedor (si compra)
  - Fecha de germinacion/clonacion
  - Area inicial*
  - Orden de produccion (opcional, para vincular)
  - Notas
- [ ] Batch se crea con `status: active`
- [ ] Si tracking individual: crear registros de plantas
- [ ] Toast de exito

**Escribe:** `batches.create({ companyId, facilityId, cultivarId, quantity, batchType, source, ... })`

---

### US-25.4: Mover batch a otra area
**Como** operador de produccion
**Quiero** mover un batch a otra area
**Para** seguir el flujo de produccion

**Criterios de Aceptacion:**
- [ ] Boton "Mover" abre modal
- [ ] Seleccionar area destino (filtrada por tipo compatible)
- [ ] Mostrar capacidad disponible del area
- [ ] Seleccionar posiciones especificas (si area tiene grid)
- [ ] Fecha del movimiento (default: ahora)
- [ ] Razon del movimiento (select + opcional notas)
- [ ] Al mover:
  - `current_area_id` se actualiza
  - Registro en historial de movimientos
  - Capacidad de areas se actualiza
- [ ] Toast de confirmacion

**Escribe:** `batches.move({ batchId, targetAreaId, positions?, reason, notes? })`

---

### US-25.5: Dividir batch
**Como** administrador de produccion
**Quiero** dividir un batch en dos o mas lotes
**Para** manejar diferencias o enviar a diferentes areas

**Criterios de Aceptacion:**
- [ ] Boton "Dividir" abre wizard
- [ ] **Paso 1 - Configuracion:**
  - Cantidad de lotes nuevos (2-10)
  - Nombres/codigos de nuevos lotes
- [ ] **Paso 2 - Distribucion:**
  - Por cada lote nuevo: cantidad de plantas
  - Total debe sumar plantas del batch original
  - Area destino de cada lote
- [ ] **Paso 3 - Confirmacion:**
  - Resumen de division
  - Razon de division
- [ ] Al dividir:
  - Batch original: `status: split`, guarda referencia a hijos
  - Batches nuevos: heredan cultivar, fase, historial
  - Actividades pendientes se distribuyen
- [ ] Toast de confirmacion

**Escribe:** `batches.split({ batchId, splits: [{ quantity, areaId, code }], reason })`

---

### US-25.6: Combinar batches
**Como** administrador de produccion
**Quiero** combinar dos batches compatibles
**Para** simplificar manejo de lotes pequenos

**Criterios de Aceptacion:**
- [ ] Boton "Combinar" en batch detail
- [ ] Seleccionar batch a absorber (mismo cultivar, fase compatible)
- [ ] Mostrar totales resultantes
- [ ] Confirmacion con razon
- [ ] Al combinar:
  - Batch principal: actualiza cantidad, guarda referencia
  - Batch absorbido: `status: merged`
  - Plantas se transfieren al principal
- [ ] Toast de confirmacion

**Escribe:** `batches.merge({ primaryBatchId, secondaryBatchId, reason })`

---

### US-25.7: Registrar mortalidad
**Como** operador de produccion
**Quiero** registrar plantas perdidas
**Para** mantener conteo exacto y analizar causas

**Criterios de Aceptacion:**
- [ ] Boton "Registrar Perdida" abre modal
- [ ] Campos:
  - Cantidad de plantas perdidas*
  - Razon: enfermedad, plaga, ambiental, genetica, accidente, descarte*
  - Fecha de deteccion
  - Descripcion detallada
  - Fotos (opcional)
  - Crear incidencia (toggle)
- [ ] Al registrar:
  - `current_quantity` se reduce
  - Registro en `batch_losses`
  - Mortalidad se recalcula
- [ ] Si hay tracking individual: seleccionar plantas especificas
- [ ] Toast de confirmacion

**Escribe:** `batches.recordLoss({ batchId, quantity, reason, description, photos?, createIncident? })`

---

### US-25.8: Registrar cosecha
**Como** operador de produccion
**Quiero** registrar la cosecha de un batch
**Para** finalizar el ciclo y registrar rendimiento

**Criterios de Aceptacion:**
- [ ] Boton "Cosechar" disponible en fase final
- [ ] Wizard de cosecha:
  - **Datos de cosecha:**
    - Fecha de cosecha*
    - Cantidad cosechada (peso)*
    - Unidad de medida*
    - Calidad general: A, B, C
    - Grado de humedad
  - **Desglose por planta** (si tracking individual):
    - Peso por planta
    - Calidad individual
  - **Destino:**
    - Area de secado/curado
    - Lote de producto (crear o agregar a existente)
  - **Fotos y notas**
- [ ] Al cosechar:
  - Batch: `status: harvested`
  - Orden de produccion: se actualiza rendimiento
  - Inventario: se crea lote de producto

**Escribe:** `batches.harvest({ batchId, harvestData })`

---

### US-25.9: Archivar batch
**Como** administrador de produccion
**Quiero** archivar batches finalizados o fallidos
**Para** mantener historial sin saturar lista activa

**Criterios de Aceptacion:**
- [ ] Boton "Archivar" en batches completed/harvested/lost
- [ ] Confirmacion con notas opcionales
- [ ] Batch no aparece en lista por defecto
- [ ] Filtro para ver archivados
- [ ] No se puede desarchivar (es historial)

**Escribe:** `batches.archive({ batchId, notes? })`

---

## Schema

### Tabla: `batches`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa |
| `facility_id` | `id("facilities")` | Instalacion |
| `order_id` | `id("production_orders")?` | Orden de produccion |
| `batch_code` | `string` | Codigo unico |
| `cultivar_id` | `id("cultivars")` | Cultivar |
| `batch_type` | `string` | production/mother/research/rescue |
| `source_type` | `string` | seed/clone/purchase/rescue |
| `supplier_id` | `id("suppliers")?` | Proveedor (si compra) |
| `current_area_id` | `id("areas")?` | Area actual |
| `current_phase` | `string?` | Fase actual |
| `initial_quantity` | `number` | Cantidad inicial |
| `current_quantity` | `number` | Cantidad actual |
| `lost_quantity` | `number` | Cantidad perdida |
| `mortality_rate` | `number` | Tasa mortalidad % |
| `germination_date` | `number?` | Fecha germinacion |
| `creation_date` | `number` | Fecha creacion batch |
| `harvest_date` | `number?` | Fecha cosecha |
| `days_in_production` | `number` | Dias desde inicio |
| `enable_individual_tracking` | `boolean` | Tracking por planta |
| `parent_batch_id` | `id("batches")?` | Batch padre (si split) |
| `merged_into_batch_id` | `id("batches")?` | Batch destino (si merge) |
| `status` | `string` | active/harvested/archived/split/merged/lost |
| `notes` | `string?` | Notas |
| `created_by` | `id("users")` | Creador |
| `created_at` | `number` | Timestamp |
| `updated_at` | `number` | Timestamp |

### Tabla: `batch_movements`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `batch_id` | `id("batches")` | Batch |
| `from_area_id` | `id("areas")?` | Area origen |
| `to_area_id` | `id("areas")` | Area destino |
| `movement_date` | `number` | Fecha movimiento |
| `reason` | `string` | Razon |
| `notes` | `string?` | Notas |
| `performed_by` | `id("users")` | Usuario |
| `created_at` | `number` | Timestamp |

### Tabla: `batch_losses`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `batch_id` | `id("batches")` | Batch |
| `quantity` | `number` | Cantidad perdida |
| `reason` | `string` | disease/pest/environmental/genetic/accident/discard |
| `description` | `string?` | Descripcion |
| `detection_date` | `number` | Fecha deteccion |
| `photos` | `array<string>` | URLs fotos |
| `incident_id` | `id("incidents")?` | Incidencia creada |
| `recorded_by` | `id("users")` | Usuario |
| `created_at` | `number` | Timestamp |

### Tabla: `batch_harvests`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `batch_id` | `id("batches")` | Batch |
| `harvest_date` | `number` | Fecha cosecha |
| `total_weight` | `number` | Peso total |
| `weight_unit` | `string` | Unidad (kg, lb, g) |
| `quality_grade` | `string` | A/B/C |
| `humidity_percentage` | `number?` | % humedad |
| `destination_area_id` | `id("areas")?` | Area destino |
| `product_lot_id` | `id("product_lots")?` | Lote producto |
| `notes` | `string?` | Notas |
| `photos` | `array<string>` | URLs fotos |
| `harvested_by` | `id("users")` | Usuario |
| `created_at` | `number` | Timestamp |

---

## Estados de Batch

| Estado | Descripcion | Acciones |
|--------|-------------|----------|
| `active` | En produccion | Mover, Dividir, Combinar, Registrar actividad |
| `harvested` | Cosechado | Archivar, Ver historial |
| `split` | Dividido en otros | Ver historial, Ver hijos |
| `merged` | Combinado en otro | Ver historial, Ver destino |
| `lost` | Perdido totalmente | Ver historial |
| `archived` | Archivado | Solo lectura |

---

## Tipos de Batch

| Tipo | Descripcion |
|------|-------------|
| `production` | Batch de produccion normal |
| `mother` | Plantas madre para clonacion |
| `research` | Investigacion/pruebas |
| `rescue` | Rescate de otro batch |

---

## Fuentes de Material

| Fuente | Descripcion |
|--------|-------------|
| `seed` | Desde semilla |
| `clone` | Desde clon |
| `purchase` | Compra de plantulas |
| `rescue` | Division/rescate |

---

## Razones de Perdida

| Razon | Label |
|-------|-------|
| `disease` | Enfermedad |
| `pest` | Plaga |
| `environmental` | Ambiental |
| `genetic` | Genetica |
| `accident` | Accidente |
| `discard` | Descarte |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M24-Orders | Padre | Batch pertenece a orden |
| M26-Plants | Hijo | Batch contiene plantas |
| M08-Areas | Ubicacion | Batch esta en area |
| M15-Cultivars | Referencia | Cultivar del batch |
| M23-Quality Checks | Entidad | QC sobre batches |
| M19-Inventory | Consumo/Producto | Materiales usados, producto generado |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `companyId, facilityId?, status?, areaId?` | Batch[] |
| `getById` | `batchId` | Batch con plantas, actividades |
| `getMovements` | `batchId` | Movement[] |
| `getLosses` | `batchId` | Loss[] |
| `getGenealogy` | `batchId` | Parent, children batches |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `companyId, cultivarId, quantity, ...` | cultivar existe, area disponible |
| `move` | `batchId, targetAreaId, ...` | batch activo, area compatible |
| `split` | `batchId, splits[]` | batch activo, cantidades validas |
| `merge` | `primaryId, secondaryId` | mismo cultivar, fase compatible |
| `recordLoss` | `batchId, quantity, reason` | cantidad <= current |
| `harvest` | `batchId, harvestData` | batch activo, fase final |
| `archive` | `batchId` | status permitido |

---

## Notas de Implementacion

### Codigos de Batch
```typescript
// Formato: {cultivar_code}-{YYMMDD}-{secuencial}
// Ejemplo: OGK-250315-042
```

### Calculo de Mortalidad
```typescript
mortality_rate = (lost_quantity / initial_quantity) * 100
```

### Calculo de Dias en Produccion
```typescript
days_in_production = Math.floor((Date.now() - creation_date) / (1000 * 60 * 60 * 24))
```
