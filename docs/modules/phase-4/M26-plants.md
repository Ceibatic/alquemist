# Module 26: Plants (Plantas Individuales)

## Overview

El modulo de Plants permite el tracking individual de plantas cuando el batch tiene `enable_individual_tracking: true`. Cada planta tiene su propia identidad, historial de actividades, y metricas. Este nivel de detalle es util para plantas madre, investigacion, o cuando regulaciones requieren trazabilidad individual (ej: cannabis medicinal).

**Estado**: Pendiente de implementacion

---

## User Stories

### US-26.1: Ver lista de plantas de un batch
**Como** operador de produccion
**Quiero** ver todas las plantas individuales de un batch
**Para** monitorear estado individual

**Criterios de Aceptacion:**
- [ ] Tab "Plantas" en detalle de batch (solo si tracking habilitado)
- [ ] Grid de cards o tabla de plantas
- [ ] Cada planta muestra: codigo, estado, posicion, ultimo QC, alertas
- [ ] Filtros: estado, alertas, posicion
- [ ] Bulk actions: seleccionar multiples plantas
- [ ] Search por codigo de planta
- [ ] Cards clickeables abren drawer de detalle
- [ ] Stats: Total, Sanas, Con issues, Perdidas

**Consulta:** `plants.listByBatch({ batchId, status? })`

**Componentes:** `components/batches/plants-tab.tsx`, `components/plants/plant-grid.tsx`

---

### US-26.2: Ver detalle de planta
**Como** operador de produccion
**Quiero** ver el historial completo de una planta
**Para** entender su evolucion y tomar decisiones

**Criterios de Aceptacion:**
- [ ] Drawer o pagina `/plants/[id]`
- [ ] Header con codigo, estado, batch padre, dias de vida
- [ ] **Seccion Info Basica:**
  - Cultivar, fenotipo (si identificado)
  - Posicion actual en area
  - Fecha de germinacion/clonacion
  - Planta madre (si es clon)
- [ ] **Seccion Metricas:**
  - Altura actual
  - Numero de ramas/nodos
  - Estado general (healthy/stressed/sick)
  - Ultimo score de calidad
- [ ] **Seccion Timeline:**
  - Todas las actividades realizadas
  - Quality checks con resultados
  - Movimientos
  - Tratamientos aplicados
- [ ] **Seccion Galeria:**
  - Fotos historicas
  - Comparacion visual en el tiempo
- [ ] **Acciones:**
  - Registrar actividad
  - Tomar foto
  - Marcar como perdida
  - Agregar nota

**Consulta:** `plants.getById({ plantId })` con historial completo

**Componentes:** `components/plants/plant-detail-drawer.tsx`

---

### US-26.3: Crear plantas al habilitar tracking
**Como** sistema
**Quiero** generar registros de plantas automaticamente
**Para** iniciar tracking individual

**Criterios de Aceptacion:**
- [ ] Al crear batch con `enable_individual_tracking: true`:
  - Generar N registros de plantas
  - Codigos: `{batch_code}-P001`, `{batch_code}-P002`, ...
  - Status inicial: `active`
- [ ] Al habilitar tracking en batch existente:
  - Modal de confirmacion
  - Generar plantas con cantidad actual
  - Advertencia: no se puede deshabilitar despues

**Escribe:** `plants.createBulk({ batchId, quantity })`

---

### US-26.4: Registrar mediciones de planta
**Como** operador de produccion
**Quiero** registrar mediciones periodicas
**Para** trackear crecimiento

**Criterios de Aceptacion:**
- [ ] Boton "Registrar Medicion" en planta
- [ ] Campos:
  - Fecha de medicion (default: hoy)
  - Altura (cm)*
  - Numero de nodos
  - Diametro tallo
  - Estado visual: healthy, stressed, sick
  - Notas
  - Foto (opcional)
- [ ] Historial de mediciones con grafica de crecimiento
- [ ] Comparacion con promedio del batch

**Escribe:** `plants.recordMeasurement({ plantId, measurements })`

---

### US-26.5: Registrar actividad individual
**Como** operador de produccion
**Quiero** registrar actividades especificas para una planta
**Para** tratamientos individualizados

**Criterios de Aceptacion:**
- [ ] Boton "Registrar Actividad" en planta
- [ ] Tipos: poda, tratamiento, fertilizacion individual, inspeccion
- [ ] Campos segun tipo de actividad
- [ ] Materiales usados (con descuento de inventario)
- [ ] Linked a actividad programada del batch (si aplica)

**Escribe:** `plants.recordActivity({ plantId, activityType, data })`

---

### US-26.6: Marcar planta como perdida
**Como** operador de produccion
**Quiero** registrar la perdida de una planta especifica
**Para** mantener conteo exacto

**Criterios de Aceptacion:**
- [ ] Boton "Marcar Perdida" en planta
- [ ] Modal con:
  - Razon de perdida*
  - Descripcion
  - Fecha de deteccion
  - Foto (opcional)
- [ ] Al marcar:
  - Planta: `status: lost`
  - Batch: `current_quantity` decrementado
  - Registro en `batch_losses`
- [ ] Planta aparece en historial pero no en lista activa

**Escribe:** `plants.markAsLost({ plantId, reason, description? })`

---

### US-26.7: Mover planta individualmente
**Como** operador de produccion
**Quiero** mover una planta a otra posicion o area
**Para** reorganizar o separar plantas problematicas

**Criterios de Aceptacion:**
- [ ] Boton "Mover" en planta
- [ ] Opciones:
  - Mover dentro del area (cambiar posicion)
  - Mover a otra area (transferir)
  - Mover a otro batch (split individual)
- [ ] Si mueve a otro batch: mismo cultivar requerido
- [ ] Registro en historial de la planta

**Escribe:** `plants.move({ plantId, targetAreaId?, targetPosition?, targetBatchId? })`

---

### US-26.8: Clonar desde planta madre
**Como** operador de propagacion
**Quiero** registrar clones tomados de una planta madre
**Para** tracking de genetica y rendimiento

**Criterios de Aceptacion:**
- [ ] Boton "Tomar Clones" en plantas madre
- [ ] Modal con:
  - Cantidad de clones*
  - Fecha de corte
  - Batch destino (nuevo o existente)
  - Metodo de propagacion
  - Notas
- [ ] Al clonar:
  - Nuevas plantas con `mother_plant_id` referenciado
  - Planta madre: incrementa `clones_taken_count`
  - Batch nuevo si se especifica

**Escribe:** `plants.takeClones({ motherPlantId, quantity, targetBatchId?, newBatchData? })`

---

### US-26.9: Cosecha individual
**Como** operador de produccion
**Quiero** registrar cosecha por planta
**Para** metricas de rendimiento individual

**Criterios de Aceptacion:**
- [ ] Disponible cuando batch en fase de cosecha
- [ ] Campos por planta:
  - Peso cosechado*
  - Calidad: A, B, C
  - Notas especificas
  - Foto de la cosecha
- [ ] Bulk harvest: seleccionar multiples, mismo peso
- [ ] Al cosechar todas: batch pasa a `harvested`

**Escribe:** `plants.harvest({ plantId, weight, quality, notes? })`

---

## Schema

### Tabla: `plants`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `batch_id` | `id("batches")` | Batch padre |
| `plant_code` | `string` | Codigo unico |
| `cultivar_id` | `id("cultivars")` | Cultivar |
| `phenotype` | `string?` | Fenotipo identificado |
| `current_area_id` | `id("areas")?` | Area actual |
| `position` | `object?` | Posicion {row, column} |
| `mother_plant_id` | `id("plants")?` | Planta madre (si clon) |
| `germination_date` | `number?` | Fecha germinacion |
| `current_height_cm` | `number?` | Altura actual |
| `current_nodes` | `number?` | Nodos actuales |
| `stem_diameter_mm` | `number?` | Diametro tallo |
| `health_status` | `string` | healthy/stressed/sick |
| `last_quality_score` | `number?` | Ultimo score QC |
| `clones_taken_count` | `number` | Clones tomados (si madre) |
| `harvest_weight` | `number?` | Peso cosechado |
| `harvest_quality` | `string?` | Calidad cosecha |
| `status` | `string` | active/harvested/lost/transferred |
| `company_id` | `id("companies")` | Empresa |
| `created_at` | `number` | Timestamp |
| `updated_at` | `number` | Timestamp |

### Tabla: `plant_measurements`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `plant_id` | `id("plants")` | Planta |
| `measurement_date` | `number` | Fecha medicion |
| `height_cm` | `number?` | Altura |
| `nodes` | `number?` | Nodos |
| `stem_diameter_mm` | `number?` | Diametro |
| `health_status` | `string` | Estado |
| `notes` | `string?` | Notas |
| `photo_url` | `string?` | Foto |
| `recorded_by` | `id("users")` | Usuario |
| `created_at` | `number` | Timestamp |

### Tabla: `plant_activities`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `plant_id` | `id("plants")` | Planta |
| `batch_activity_id` | `id("scheduled_activities")?` | Actividad batch vinculada |
| `activity_type` | `string` | Tipo de actividad |
| `activity_date` | `number` | Fecha |
| `description` | `string?` | Descripcion |
| `materials_used` | `array` | Materiales |
| `notes` | `string?` | Notas |
| `photos` | `array<string>` | Fotos |
| `performed_by` | `id("users")` | Usuario |
| `created_at` | `number` | Timestamp |

---

## Estados de Planta

| Estado | Descripcion |
|--------|-------------|
| `active` | En produccion |
| `harvested` | Cosechada |
| `lost` | Perdida |
| `transferred` | Transferida a otro batch |

---

## Estados de Salud

| Estado | Descripcion | Color |
|--------|-------------|-------|
| `healthy` | Sana | Verde |
| `stressed` | Estresada | Amarillo |
| `sick` | Enferma | Rojo |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M25-Batches | Padre | Planta pertenece a batch |
| M23-Quality Checks | Entidad | QC sobre plantas |
| M08-Areas | Ubicacion | Posicion en area |
| M15-Cultivars | Referencia | Cultivar de la planta |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `listByBatch` | `batchId, status?` | Plant[] |
| `getById` | `plantId` | Plant con historial |
| `getMeasurements` | `plantId` | Measurement[] |
| `getActivities` | `plantId` | Activity[] |
| `getOffspring` | `plantId` | Plant[] (clones) |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `createBulk` | `batchId, quantity` | batch existe, tracking enabled |
| `recordMeasurement` | `plantId, measurements` | plant active |
| `recordActivity` | `plantId, data` | plant active |
| `markAsLost` | `plantId, reason` | plant active |
| `move` | `plantId, target` | plant active |
| `takeClones` | `motherId, quantity, target` | plant is mother type |
| `harvest` | `plantId, harvestData` | batch in harvest phase |

---

## Notas de Implementacion

### Codigos de Planta
```typescript
// Formato: {batch_code}-P{numero_3_digitos}
// Ejemplo: OGK-250315-042-P001
```

### Tracking Automatico
- Las mediciones actualizan campos `current_*` en la planta
- El ultimo QC actualiza `last_quality_score`
- El health_status se actualiza con cada medicion o QC

### Clonacion
- Plantas madre son batch_type=mother en el batch
- Clones heredan genetica pero no historial
- Tracking de rendimiento por genetica

### Rendimiento
- Con muchas plantas (>1000), usar paginacion
- Queries optimizados con indices en batch_id
- Lazy loading de historial
