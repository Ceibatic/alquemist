# Inventory System — Developer Guide

Guia tecnica para trabajar con el sistema de inventario de Alquemist programaticamente.

---

## 1. Resumen del Sistema

### Tablas Principales

```
products (catalogo)
    │
    ├── inventory_items (lotes fisicos en areas)
    │       │
    │       └── inventory_transactions (audit trail)
    │
    └── transformation_produces_id → products (cadena de transformacion)

activities (operaciones centralizadas)
    ├── materials_consumed[]
    └── materials_produced[]
```

### Dos Rutas de Mutacion

| Ruta | Funcion | Estado | Cuando Usar |
|------|---------|--------|-------------|
| **Preferida** | `activities.logInventoryMovement()` | Activa | Todas las operaciones nuevas |
| Legacy | `inventory.adjustStock()` | Deprecated | No usar en codigo nuevo |

La ruta preferida crea una actividad (auditable) + actualiza inventario + crea transaction en una sola operacion atomica. La ruta legacy solo actualiza inventario + crea transaction.

---

## 2. Operaciones Basicas

### 2.1 Recibir Inventario (receipt)

Crea un nuevo `inventory_item` y registra una actividad `inventory_receipt`.

```typescript
import { api } from "@/convex/_generated/api";

await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "receipt",
  product_id: productId,           // Id<"products">
  quantity: 50,
  quantity_unit: "kg",
  area_id: storageAreaId,          // Id<"areas"> — donde se almacena
  facility_id: facilityId,         // Id<"facilities">
  supplier_id: supplierId,         // opcional
  batch_number: undefined,         // si no se provee, se auto-genera (ej: NUT-260210-0001)
  supplier_lot_number: "LOT-ABC",  // lote del proveedor, opcional
  received_date: Date.now(),
  manufacturing_date: undefined,
  expiration_date: undefined,      // si no se provee y product tiene shelf_life_days, se calcula
  purchase_price: 500,             // precio total
  cost_per_unit: 10,               // costo unitario
  reason: "Compra a proveedor",
  notes: "Pedido #1234",
  performed_by: userId,            // Id<"users">
});
// Retorna: { activityId, inventoryItemId, success }
```

**Internamente:**
1. Consulta el producto para obtener `category`, `shelf_life_days`, `lot_tracking`
2. Auto-genera `batch_number` si no se provee (usando `generateInternalLotNumber`)
3. Auto-calcula `expiration_date` si el producto tiene `shelf_life_days`
4. Crea actividad tipo `inventory_receipt`
5. Crea `inventory_item` con `lot_status: "available"`, `transformation_status: "active"`
6. Crea `inventory_transaction` tipo `receipt`

---

### 2.2 Consumir Inventario (consumption)

Reduce stock de un lote existente. Soporta FIFO automatico o seleccion manual de lote.

```typescript
// Consumo FIFO (automatico — selecciona el lote mas antiguo)
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "consumption",
  product_id: productId,
  inventory_item_id: undefined,    // FIFO busca el lote mas antiguo
  quantity: 5,
  quantity_unit: "kg",
  area_id: areaId,
  facility_id: facilityId,
  lot_selection_mode: "fifo",
  reason: "Consumo en produccion",
  performed_by: userId,
});

// Consumo de lote especifico
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "consumption",
  product_id: productId,
  inventory_item_id: specificItemId, // Lote especifico
  quantity: 5,
  quantity_unit: "kg",
  area_id: areaId,
  facility_id: facilityId,
  lot_selection_mode: "specific",
  reason: "Consumo manual — lote seleccionado",
  performed_by: userId,
});
```

**FIFO:** Ordena lotes por `received_date` ascendente y consume del mas antiguo. Si un lote no tiene suficiente, continua con el siguiente.

---

### 2.3 Aplicacion a Cultivo (application)

Igual que consumo pero **requiere** contexto de cultivo (`batch_id` o `zone_id`). Registra `crop_phase` para calculo de COGS.

```typescript
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "application",
  product_id: fertilizerId,
  inventory_item_id: fertilizerItemId,
  quantity: 2,
  quantity_unit: "L",
  area_id: areaId,
  facility_id: facilityId,
  // Contexto de cultivo (requerido para application)
  cultivation_batch_id: batchId,        // Id<"batches">
  cultivation_zone_id: zoneId,          // Id<"areas"> — zona de cultivo
  crop_phase: "flowering",              // propagation|vegetative|flowering|harvest|post_harvest|processing
  reason: "Aplicacion de fertilizante semana 6",
  performed_by: userId,
});
```

**Validacion:** Si `movement_type === "application"` y no se provee `cultivation_batch_id` ni `cultivation_zone_id`, la mutation lanza error.

---

### 2.4 Transferir entre Areas (transfer)

Mueve stock de un area a otra.

```typescript
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "transfer",
  product_id: productId,
  inventory_item_id: itemId,
  quantity: 20,
  quantity_unit: "kg",
  area_id: sourceAreaId,                 // Area origen
  facility_id: facilityId,
  destination_area_id: destinationAreaId, // Area destino
  reason: "Mover a sala de secado",
  performed_by: userId,
});
```

---

### 2.5 Correccion de Stock (correction)

Ajusta la cantidad a un valor absoluto (no delta).

```typescript
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "correction",
  product_id: productId,
  inventory_item_id: itemId,
  quantity: 0,            // No se usa directamente
  new_quantity: 45,       // Nueva cantidad absoluta
  quantity_unit: "kg",
  area_id: areaId,
  facility_id: facilityId,
  reason: "Conteo fisico — ajuste de inventario",
  performed_by: userId,
});
```

---

### 2.6 Registrar Desperdicio (waste)

```typescript
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "waste",
  product_id: productId,
  inventory_item_id: itemId,
  quantity: 3,
  quantity_unit: "kg",
  area_id: areaId,
  facility_id: facilityId,
  reason: "Material danado — humedad excesiva",
  performed_by: userId,
});
```

---

### 2.7 Devolucion a Proveedor (return)

```typescript
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "return",
  product_id: productId,
  inventory_item_id: itemId,
  quantity: 10,
  quantity_unit: "kg",
  area_id: areaId,
  facility_id: facilityId,
  reason: "Producto defectuoso — devolucion a proveedor",
  performed_by: userId,
});
```

---

## 3. Operaciones de Transformacion

### 3.1 Transicion de Fase

Convierte un lote de una fase a otra (ej: esquejes → plantulas). Marca el item fuente como `"transformed"` y crea un nuevo item de la nueva categoria.

```typescript
await convex.mutation(api.activities.logPhaseTransitionWithInventory, {
  batchId: batchId,                    // Id<"batches">
  fromPhase: "clone",                  // Fase actual
  toPhase: "seedling",                 // Nueva fase
  sourceInventoryItemId: cloneItemId,  // Opcional — se busca automaticamente
  targetProductId: seedlingProductId,  // Producto de la nueva categoria
  quantity: 95,                        // Cantidad que transiciona
  quantityUnit: "plantas",
  lossQuantity: 5,                     // Perdidas en la transicion
  lossReason: "Mortalidad natural",
  areaId: areaId,
  facilityId: facilityId,
  performedBy: userId,
});
// Retorna: { activityId, newInventoryItemId, success }
```

**Internamente:**
1. Marca `sourceInventoryItem.transformation_status = "transformed"`
2. Crea nuevo `inventory_item` con categoria de `targetProductId`
3. Vincula via `transformed_to_item_id` y `transformed_by_activity_id`
4. Registra `materials_consumed` y `materials_produced` en la actividad
5. Actualiza `batch.current_phase`
6. Auto-genera lote interno para el nuevo item

---

### 3.2 Cosecha

Transforma plantas en material vegetal cosechado. Convierte unidades (plantas → kg).

```typescript
await convex.mutation(api.activities.logHarvest, {
  batchId: batchId,
  sourceInventoryItemId: plantItemId,   // Opcional
  harvestProductId: plantMaterialId,    // Producto tipo plant_material
  yieldQuantity: 450,                   // Cantidad cosechada
  yieldUnit: "g",                       // Unidad de cosecha
  plantsHarvested: 95,                  // Numero de plantas
  plantsUnit: "plantas",
  qualityGrade: "A",                    // Opcional: A/B/C
  destinationAreaId: dryingRoomId,      // Donde se almacena la cosecha
  facilityId: facilityId,
  harvestDate: Date.now(),
  notes: "Cosecha semana 9",
  performedBy: userId,
});
// Retorna: { activityId, harvestInventoryItemId, success }
```

---

### 3.3 Cadena de Transformacion Automatica

Los productos pueden definir `transformation_produces_id` para indicar que producto resulta de su transformacion. La mutation `logInventoryMovement` con `movement_type: "transformation"` usa este campo como fallback si no se especifica `target_product_id`.

```typescript
// Configuracion en producto: clone → seedling → plant_vegetative → ...
// Si llamas transformacion sin target, usa transformation_produces_id del producto fuente
await convex.mutation(api.activities.logInventoryMovement, {
  movement_type: "transformation",
  product_id: cloneProductId,
  inventory_item_id: cloneItemId,
  quantity: 100,
  quantity_unit: "plantas",
  area_id: areaId,
  facility_id: facilityId,
  // target_product_id: undefined → usa clone.transformation_produces_id
  reason: "Transicion de fase automatica",
  performed_by: userId,
});
```

Para consultar la cadena completa:

```typescript
const chain = await convex.query(api.products.getTransformationChain, {
  productId: seedProductId,
});
// Retorna: [{ _id, name, sku, category, default_yield_pct }, ...]
```

---

## 4. Queries de Consulta

### 4.1 Listar Inventario por Facility

```typescript
const items = await convex.query(api.inventory.getByFacility, {
  facilityId: facilityId,
  category: "nutrient",      // Opcional — filtra por categoria de producto
  status: "available",       // Opcional — filtra por lot_status
  productId: productId,      // Opcional — filtra por producto especifico
});
// Retorna: items[] con productName, productSku, productCategory, supplierName, areaName, stockStatus
```

### 4.2 Historial de Transacciones de un Item

```typescript
const history = await convex.query(api.inventory.getTransactionHistory, {
  inventoryId: itemId,
  limit: 50,                 // Opcional, default 50
});
// Retorna: transactions[] con performedByName, sourceAreaName, destinationAreaName, batchName, zoneName
```

### 4.3 Historial de Transacciones de un Producto (todos los lotes)

```typescript
const history = await convex.query(api.inventory.getProductTransactionHistory, {
  productId: productId,
  limit: 100,                // Opcional, default 100
});
// Retorna: transactions[] con performedByName, areaName, batchNumber
```

### 4.4 COGS por Batch

```typescript
const costs = await convex.query(api.inventory.getCostByBatch, {
  batchId: batchId,
});
// Retorna:
// {
//   phases: [{ phase, transactions[], total }],  // Agrupado por crop_phase
//   grandTotal: number,                           // Costo total
//   totalYield: number,                           // Rendimiento cosechado
//   yieldUnit: string,                            // Unidad de rendimiento
//   cogsPerUnit: number | null,                   // COGS por unidad (si hay cosecha)
//   transactionCount: number,
// }
```

### 4.5 Trazabilidad Completa de un Lote

```typescript
const trace = await convex.query(api.inventory.getFullTrace, {
  inventoryItemId: itemId,
});
// Retorna:
// {
//   steps: [{
//     direction: "backward" | "current" | "forward",
//     item_id, product_name, product_sku, product_category,
//     quantity, quantity_unit, batch_number,
//     transformation_status, activity_type, timestamp,
//   }],
//   originReceipt: { date, reason, performed_by } | null,
//   totalSteps: number,
// }
```

### 4.6 Estadisticas de Inventario por Producto

```typescript
const stats = await convex.query(api.inventory.countByProduct, {
  productId: productId,
});
// Retorna: { totalItems, activeItems, totalQuantity }
```

---

## 5. Categorias y Lotes

### 5.1 Categorias de Producto

| Grupo | Categoria | Prefijo Lote | Descripcion |
|-------|-----------|:------------:|-------------|
| **Insumos** | `seed` | SEM | Semillas |
| | `nutrient` | NUT | Nutrientes |
| | `pesticide` | PES | Pesticidas |
| | `substrate` | SUS | Sustratos |
| | `biocontrol` | BIO | Agentes de biocontrol |
| **Material Vegetal** | `clone` | CLO | Esquejes |
| | `seedling` | PLT | Plantulas |
| | `mother_plant` | MAD | Plantas madre |
| | `plant_material` | MAT | Material vegetal cosechado |
| | `plant_vegetative` | VEG | Plantas en fase vegetativa |
| | `plant_flowering` | FLO | Plantas en floracion |
| | `harvest_wet` | CHU | Cosecha humeda |
| | `harvest_dry` | CSE | Cosecha seca |
| | `processed_plant` | PRO | Producto procesado |
| **Preparados** | `stock_solution` | SOL | Soluciones madre |
| | `substrate_mix` | MIX | Mezclas de sustrato |
| **Infraestructura** | `equipment` | EQP | Equipos |
| | `container` | CON | Contenedores |
| | `tool` | HER | Herramientas |
| | `other` | OTR | Otros |

### 5.2 Formato de Lote Interno

```
PREFIX-YYMMDD-XXXX
```

- `PREFIX`: Codigo de 3 letras segun categoria (tabla arriba)
- `YYMMDD`: Fecha (ano-mes-dia)
- `XXXX`: Secuencial de 4 digitos, reseteado diariamente por prefijo

**Ejemplos:**
- `CLO-260210-0001` → Primer lote de esquejes del 10/feb/2026
- `NUT-260210-0003` → Tercer lote de nutrientes del 10/feb/2026

### 5.3 Generacion Automatica

El lote se auto-genera en:

1. **Recepciones** (`logInventoryMovement` tipo `receipt`) — si `batch_number` no se provee
2. **Transformaciones** — siempre se genera lote nuevo para el item producido
3. **Transiciones de fase** (`logPhaseTransitionWithInventory`) — lote nuevo para item destino
4. **Cosechas** (`logHarvest`) — lote nuevo para material cosechado

Helper disponible para uso directo:

```typescript
import { generateInternalLotNumber } from "@/convex/helpers";

const lot = await generateInternalLotNumber(ctx, "clone");
// "CLO-260210-0001"
```

### 5.4 Campos de Producto que Afectan Inventario

| Campo | Tipo | Efecto en Inventario |
|-------|------|---------------------|
| `procurement_type` | `"purchased" \| "produced" \| "both"` | Informativo; indica si el producto se compra, se produce o ambos |
| `lot_tracking` | `"required" \| "optional" \| "none"` | Si `required`, se auto-genera lote al crear item sin batch_number |
| `shelf_life_days` | `number?` | Si existe y no hay `expiration_date`, se calcula: `received_date + shelf_life_days` |
| `transformation_produces_id` | `Id<"products">?` | Producto destino en cadena de transformacion |
| `default_yield_pct` | `number? (0-100)` | Rendimiento esperado; genera alerta si yield real difiere >10% |

---

## 6. Patrones y Convenciones

### 6.1 FIFO vs Seleccion Especifica

- **FIFO** (`lot_selection_mode: "fifo"`): Sistema selecciona el lote con `received_date` mas antigua. Si el lote no tiene cantidad suficiente, consume de multiples lotes.
- **Especifico** (`lot_selection_mode: "specific"`): Requiere `inventory_item_id` explicito.

**Recomendacion:** Usar FIFO por defecto excepto cuando regulaciones o calidad requieran seleccion manual.

### 6.2 Cuando Usar Cada Mutation

| Operacion | Mutation | Notas |
|-----------|----------|-------|
| Recibir stock nuevo | `activities.logInventoryMovement` (receipt) | Siempre |
| Consumir en produccion | `activities.logInventoryMovement` (consumption) | Siempre |
| Aplicar a cultivo | `activities.logInventoryMovement` (application) | Requiere batch_id o zone_id |
| Transferir entre areas | `activities.logInventoryMovement` (transfer) | Siempre |
| Corregir conteo | `activities.logInventoryMovement` (correction) | Usa `new_quantity` |
| Registrar desperdicio | `activities.logInventoryMovement` (waste) | Siempre |
| Devolver a proveedor | `activities.logInventoryMovement` (return) | Siempre |
| Transicion de fase | `activities.logPhaseTransitionWithInventory` | Para batches de cultivo |
| Cosecha | `activities.logHarvest` | Para batches de cultivo |
| Actividad con consumo | `activities.log` con `consume_inventory: true` | Para actividades que consumen materiales |
| Actualizar metadata | `inventory.update` | Solo metadata, no cantidad |
| Eliminar item | `inventory.remove` | Soft/hard delete segun stock |

> **Nunca usar `inventory.adjustStock`** en codigo nuevo. Esta deprecated.

### 6.3 Contexto de Cultivo

Para habilitar COGS por batch, siempre pasar contexto de cultivo cuando el consumo esta asociado a produccion:

```typescript
{
  // ...otros campos
  cultivation_batch_id: batchId,    // Batch de produccion
  cultivation_zone_id: zoneId,      // Zona donde se aplica
  crop_phase: "flowering",          // Fase actual del cultivo
}
```

Estos campos se propagan a `inventory_transactions` como `batch_id`, `zone_id`, `crop_phase`.

### 6.4 Calculo de Costos

- `cost_per_unit`: Se toma del `inventory_item.cost_per_unit` al momento del consumo
- `cost_total`: Se calcula como `quantity * cost_per_unit`
- Ambos se registran en cada `inventory_transaction`
- La query `getCostByBatch` agrupa estos costos por `crop_phase`

---

## 7. Referencia Rapida de APIs

### Queries (inventory.ts)

| Query | Args | Retorna |
|-------|------|---------|
| `inventory.list` | `companyId, area_id?, product_id?, lot_status?, limit?, offset?` | `{ items[], total }` |
| `inventory.getByFacility` | `facilityId, category?, status?, productId?` | Items con stockStatus |
| `inventory.getById` | `inventoryId` | Item con producto, area, proveedor |
| `inventory.getByCategory` | `facilityId, category` | Items filtrados |
| `inventory.getLowStock` | `facilityId` | Items ordenados por urgencia |
| `inventory.getTransactionHistory` | `inventoryId, limit?` | Transactions con enrich |
| `inventory.getProductTransactionHistory` | `productId, limit?` | Transactions de todos los lotes |
| `inventory.getTransactionTypeLabels` | — | Labels en espanol |
| `inventory.countByProduct` | `productId` | `{ totalItems, activeItems, totalQuantity }` |
| `inventory.getCostByBatch` | `batchId` | COGS desglosado por fase |
| `inventory.getFullTrace` | `inventoryItemId` | Cadena de trazabilidad completa |

### Queries (products.ts)

| Query | Args | Retorna |
|-------|------|---------|
| `products.getTransformationChain` | `productId` | Array de productos en cadena |

### Queries (activities.ts)

| Query | Args | Retorna |
|-------|------|---------|
| `activities.getInventoryMovements` | `inventoryItemId, limit?` | Actividades de un item |
| `activities.getByEntity` | `entityType, entityId` | Actividades de un batch/planta |

### Mutations

| Mutation | Modulo | Proposito |
|----------|--------|-----------|
| `activities.logInventoryMovement` | activities.ts | **PREFERIDA** — Todas las operaciones de inventario |
| `activities.logPhaseTransitionWithInventory` | activities.ts | Transicion de fase con inventario |
| `activities.logHarvest` | activities.ts | Cosecha con transformacion |
| `activities.log` | activities.ts | Actividad general con consumo |
| `inventory.create` | inventory.ts | Crear item (legacy) |
| `inventory.update` | inventory.ts | Actualizar metadata |
| `inventory.adjustStock` | inventory.ts | **DEPRECATED** — No usar |
| `inventory.remove` | inventory.ts | Eliminar item |

### Archivos Clave

| Archivo | Contenido |
|---------|-----------|
| `convex/inventory.ts` | Queries y mutations directas de inventario |
| `convex/activities.ts` | `logInventoryMovement`, `logPhaseTransitionWithInventory`, `logHarvest` |
| `convex/helpers.ts` | `generateInternalLotNumber`, `LOT_PREFIXES` |
| `convex/products.ts` | `getTransformationChain`, campos de procurement |
| `convex/schema.ts` | `inventory_items` (linea 742), `inventory_transactions` (linea 820) |
| `lib/validations/inventory.ts` | Schemas Zod para validacion frontend |
| `lib/validations/product.ts` | Schemas Zod incluyendo categorias expandidas |
| `components/inventory/` | Componentes UI reutilizables |
