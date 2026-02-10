# FEAT-2026-02-resource-system

## Metadata
- **Creado:** 2026-02-10
- **Prioridad:** high
- **Modulo relacionado:** M19-inventory-management
- **Tipo:** enhancement

## Descripcion

Evolucion del sistema de inventario existente hacia un modelo de recursos mas completo. Se enriquecen las tablas `products` e `inventory_transactions` con campos que habilitan: clasificacion granular de materiales vegetales por fase, cadenas de transformacion de producto definidas en el catalogo, enforcement de lote por categoria, calculo de COGS por batch de produccion, y trazabilidad completa de lote desde origen hasta producto final.

Este plan resulta de analizar el diagnostico en `docs/data-model-references/resource-system-plan.md` y filtrar la sobre-ingenieria. El diagnostico original proponia 4 tablas nuevas, 37 funciones y 45-62 dias. Tras verificar que `inventory_transactions`, `units_of_measure`, transformaciones via activities, y FIFO ya existen, el alcance se reduce a **0 tablas nuevas, 11 campos opcionales, 6 User Stories y ~10-12 dias**.

## User Stories

### US-RES.1: Expandir categorias de producto

**Como** administrador de inventario
**quiero** categorias de producto mas granulares
**para** clasificar correctamente materiales vegetales por fase (vegetativa, floracion, cosecha humeda, seca, etc.)

#### Criterios de Aceptacion
- [x] ENUM de `products.category` expandido con valores: `plant_vegetative`, `plant_flowering`, `harvest_wet`, `harvest_dry`, `processed_plant`, `stock_solution`, `biocontrol`, `substrate_mix`
- [x] Productos existentes no se ven afectados (valores actuales siguen siendo validos)
- [x] UI de product-form.tsx muestra las nuevas categorias agrupadas por tipo
- [x] La generacion de SKU (`products.generateSku`) soporta prefijos para las nuevas categorias

#### Backend
- Schema: expandir valores aceptados en `products.category` (string, validacion en mutations)
- Mutation: `products.create` y `products.update` aceptan nuevos valores
- No se necesita migracion de datos

#### Frontend
- Componente: `lib/validations/product.ts` — agregar nuevos valores al schema Zod
- Componente: `components/products/product-form.tsx` — agrupar categorias en secciones
- Componente: `components/inventory/category-tabs.tsx` — agregar tabs para nuevas categorias

#### Dependencias
- Ninguna

---

### US-RES.2: Campos de procurement y tracking en products

**Como** gerente de produccion
**quiero** definir si un producto se compra, se produce internamente, o ambos, y si requiere lote
**para** que el sistema valide automaticamente la informacion requerida al crear inventory items

#### Criterios de Aceptacion
- [x] Nuevo campo `procurement_type` en products: `purchased` | `produced` | `both` (default: `purchased`)
- [x] Nuevo campo `lot_tracking` en products: `required` | `optional` | `none` (default: `optional`)
- [x] Nuevo campo `shelf_life_days` en products: numero opcional
- [x] Al crear inventory_item, si `lot_tracking === "required"` y no se provee `batch_number`, se auto-genera con formato `{CAT_PREFIX}-{YYMMDD}-{SEQ}`
- [x] Al crear inventory_item, si `shelf_life_days` existe y no hay `expiration_date`, se calcula: `received_date + shelf_life_days`
- [x] Product form muestra estos campos en seccion "Configuracion de Inventario"
- [x] Campos son `v.optional()` para backward compatibility

#### Backend
- Schema: `products` — agregar `procurement_type`, `lot_tracking`, `shelf_life_days` (todos `v.optional()`)
- Mutation: `products.create` / `products.update` — aceptar nuevos campos
- Mutation: `activities.logInventoryMovement` (receipt) — aplicar auto-generacion de batch y calculo de expiracion
- Helper: funcion `generateBatchNumber(category, date)` en `convex/inventory.ts`

#### Frontend
- Componente: `lib/validations/product.ts` — agregar campos al schema Zod
- Componente: `components/products/product-form.tsx` — seccion "Configuracion de Inventario"

#### Dependencias
- US-RES.1 (para que las categorias expandidas tengan prefijos de batch correctos)

---

### US-RES.3: Cadena de transformacion en products

**Como** gerente de produccion
**quiero** definir que producto resulta de transformar otro (semilla -> plantula -> vegetativa -> floracion -> cosecha)
**para** que el sistema sugiera automaticamente el producto destino en transformaciones

#### Criterios de Aceptacion
- [x] Nuevo campo `transformation_produces_id` en products: referencia opcional a otro product
- [x] Nuevo campo `default_yield_pct` en products: numero opcional 0-100
- [x] Nueva query `products.getTransformationChain(productId)` que recorre la cadena recursivamente y retorna array ordenado
- [x] En `activities.logInventoryMovement` (transformation), si no se especifica `targetProductId`, se usa `transformation_produces_id` del producto fuente
- [x] Si el yield real difiere >10% del `default_yield_pct`, se incluye alerta en el response
- [x] Product form muestra selector de "Produce" (dropdown de products de la misma empresa) y campo de yield esperado
- [x] Product detail muestra la cadena completa de transformacion visual

#### Backend
- Schema: `products` — agregar `transformation_produces_id: v.optional(v.id("products"))`, `default_yield_pct: v.optional(v.number())`
- Query: `products.getTransformationChain` — recorrido recursivo con limite de 15 pasos
- Mutation: `activities.logInventoryMovement` — usar `transformation_produces_id` como fallback
- Index: `products` — agregar index `by_transformation_produces` si se necesita reverse lookup

#### Frontend
- Componente: `components/products/product-form.tsx` — selector de producto destino + yield
- Componente: `components/products/transformation-chain.tsx` (NUEVO) — visualizacion de cadena
- Pagina: `app/(dashboard)/products/[id]/page.tsx` — mostrar cadena en detail

#### Dependencias
- US-RES.1 (categorias expandidas para que la cadena tenga sentido)

---

### US-RES.4: Enriquecer inventory_transactions con contexto de cultivo

**Como** gerente de produccion
**quiero** que cada transaccion de inventario registre a que batch, zona y fase de cultivo se vincula
**para** calcular el costo real (COGS) de cada lote de produccion

#### Criterios de Aceptacion
- [x] Nuevos campos opcionales en `inventory_transactions`: `batch_id`, `zone_id`, `crop_phase`, `activity_id`, `cost_per_unit`, `cost_total`
- [x] `crop_phase` acepta: `propagation`, `vegetative`, `flowering`, `harvest`, `post_harvest`, `processing`
- [x] `activities.logInventoryMovement` (tipo `consumption` y nuevo tipo `application`) escribe estos campos al crear transaction
- [x] Nuevo tipo de transaccion `application` — igual que consumption pero REQUIERE `zone_id` o `batch_id`
- [x] El modal de movimiento de inventario permite seleccionar batch y zona cuando el tipo es `application`
- [x] `cost_total` se calcula como `quantity * cost_per_unit` del inventory_item
- [x] Transactions existentes no se afectan (campos son opcionales)

#### Backend
- Schema: `inventory_transactions` — agregar `batch_id`, `zone_id`, `crop_phase`, `activity_id`, `cost_per_unit`, `cost_total` (todos `v.optional()`)
- Index: agregar `by_batch_id` en inventory_transactions
- Mutation: `activities.logInventoryMovement` — pasar contexto de cultivo a transaction
- Validacion: tipo `application` requiere `zone_id` o `batch_id`

#### Frontend
- Componente: `components/inventory/inventory-movement-modal.tsx` — agregar selector de batch/zona para tipo `application`
- Componente: `components/inventory/inventory-transaction-history.tsx` — mostrar contexto de cultivo en historial

#### Dependencias
- Ninguna (puede implementarse en paralelo con US-RES.1-3)

---

### US-RES.5: Query de COGS por batch

**Como** gerente de operaciones
**quiero** ver el costo acumulado de insumos por lote de produccion, desglosado por fase
**para** conocer el costo real de produccion y optimizar recursos

#### Criterios de Aceptacion
- [x] Nueva query `inventory.getCostByBatch(batchId)` que retorna: costos agrupados por `crop_phase`, costo total, costo por unidad de output
- [x] Incluye: nombre del insumo, cantidad consumida, costo unitario, costo total, fecha
- [x] Si el batch tiene harvest registrado, calcula `COGS_per_gram = total_cost / yield_quantity`
- [x] Resultado accesible desde la pagina de detalle del batch
- [x] Muestra tabla resumen con total por fase y gran total

#### Backend
- Query: `inventory.getCostByBatch` — filtra `inventory_transactions` por `batch_id`, agrupa por `crop_phase`
- Query: enriquece con datos de product (nombre) y batch (yield, status)

#### Frontend
- Componente: `components/batches/batch-cost-summary.tsx` (NUEVO)
- Pagina: `app/(dashboard)/batches/[id]/page.tsx` — agregar tab o seccion de costos

#### Dependencias
- US-RES.4 (las transactions deben tener batch_id y cost_total)

---

### US-RES.6: Trazabilidad completa de lote

**Como** responsable de calidad
**quiero** recorrer la cadena completa de un inventory item desde su origen hasta el producto final
**para** responder auditorias y rastrear problemas de calidad hasta la fuente

#### Criterios de Aceptacion
- [x] Nueva query `inventory.getFullTrace(inventoryItemId)` que recorre:
  - `source_batch_id` -> batch de origen
  - `created_by_activity_id` -> actividad que lo creo
  - `transformed_to_item_id` -> cadena forward
  - Recursivamente hacia atras hasta el `receipt` original
- [x] Retorna array ordenado cronologicamente con: item, producto, transaccion, activity, fecha
- [x] Disponible desde pagina de detalle de inventory item
- [x] Visualizacion como timeline vertical con cada paso de la cadena

#### Backend
- Query: `inventory.getFullTrace` — recorrido recursivo bidireccional con limite de 20 pasos
- Usa: `transformed_to_item_id` (forward), `source_batch_id` + `created_by_activity_id` (backward)

#### Frontend
- Componente: `components/inventory/item-traceability.tsx` (NUEVO) — timeline visual
- Pagina: `app/(dashboard)/inventory/[id]/page.tsx` — agregar seccion de trazabilidad

#### Dependencias
- Ninguna (usa datos existentes + enrichment de US-RES.4)

---

## Schema Changes

| Tabla | Campo | Tipo | US |
|-------|-------|------|-----|
| `products` | `procurement_type` | `v.optional(v.string())` — "purchased"/"produced"/"both" | RES.2 |
| `products` | `lot_tracking` | `v.optional(v.string())` — "required"/"optional"/"none" | RES.2 |
| `products` | `shelf_life_days` | `v.optional(v.number())` | RES.2 |
| `products` | `transformation_produces_id` | `v.optional(v.id("products"))` | RES.3 |
| `products` | `default_yield_pct` | `v.optional(v.number())` | RES.3 |
| `inventory_transactions` | `batch_id` | `v.optional(v.id("batches"))` | RES.4 |
| `inventory_transactions` | `zone_id` | `v.optional(v.id("areas"))` | RES.4 |
| `inventory_transactions` | `crop_phase` | `v.optional(v.string())` | RES.4 |
| `inventory_transactions` | `activity_id` | `v.optional(v.id("activities"))` | RES.4 |
| `inventory_transactions` | `cost_per_unit` | `v.optional(v.number())` | RES.4 |
| `inventory_transactions` | `cost_total` | `v.optional(v.number())` | RES.4 |

**Total: 11 campos opcionales en 2 tablas. 0 tablas nuevas.**

## Consideraciones Tecnicas

- **Backward compatible:** Todos los campos son `v.optional()`, datos existentes no se rompen
- **Builds on existing patterns:** Extiende `activities.logInventoryMovement` en vez de crear sistema paralelo
- **Codegen:** Despues de schema changes, correr `npx convex codegen`
- **Riesgo principal:** `activities.ts` tiene 1800+ lineas. Cambios deben ser quirurgicos
- **Performance:** `getCostByBatch` query puede ser costosa si un batch tiene muchas transactions. Considerar cache o denormalizacion si se vuelve lento

## Out of Scope

- **`resource_categories` table** — ENUM expandido es suficiente. Tabla jerarquica solo si hay demanda real
- **`recipe_executions` table** — Activities ya trackean ejecuciones de receta
- **Reservation system** — quantity_reserved/committed existen pero no hay caso de uso activo
- **PHI/REI alerts** — Regulatorio importante pero no day-1
- **Stock valuation (WACC/FIFO)** — Reportes financieros avanzados en fase posterior
- **Reconciliacion de inventario fisico** — Workflow de conteo fisico requiere UI compleja
- **Migracion ENUM -> FK para categorias** — Solo si el ENUM se vuelve insuficiente
- **Migracion unit strings -> FK** — Gradual, no big-bang
- **Unit conversion API** — Helper function cuando se necesite

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits
- `e1e6fc4` — US-RES.1: Expand product categories
- `b814e8c` — US-RES.2: Procurement type, lot tracking, shelf life
- `840667b` — US-RES.3: Transformation chain
- `09e059d` — US-RES.4: Cultivation context in transactions
- `3eda13a` — US-RES.5: COGS query by batch
- (pending) — US-RES.6: Full lot traceability

### Archivos Modificados
- `convex/schema.ts`, `convex/products.ts`, `convex/activities.ts`, `convex/inventory.ts`, `convex/helpers.ts`
- `lib/validations/inventory.ts`, `lib/validations/product.ts`
- `components/products/product-form.tsx`, `components/products/transformation-chain.tsx`
- `components/inventory/category-tabs.tsx`, `components/inventory/inventory-movement-modal.tsx`, `components/inventory/inventory-transaction-history.tsx`, `components/inventory/item-traceability.tsx`
- `components/batches/batch-cost-summary.tsx`, `components/batches/index.ts`
- `app/(dashboard)/products/[id]/product-detail-content.tsx`, `app/(dashboard)/products/[id]/edit/product-edit-content.tsx`
- `app/(dashboard)/batches/[id]/page.tsx`, `app/(dashboard)/inventory/[id]/inventory-detail-content.tsx`

### Fecha de Completado
2026-02-10
