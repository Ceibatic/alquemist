# Module 19: Inventory Management

## Overview

El modulo de Inventario permite gestionar el stock de productos, insumos y materiales en cada instalacion. Incluye seguimiento de cantidades, alertas de stock bajo, ajustes de inventario, y control de lotes con fechas de vencimiento. El inventario esta vinculado a areas especificas de almacenamiento y proveedores.

**Estado**: Implementado

---

## User Stories

### US-19.1: Ver lista de inventario
**Como** administrador de inventario
**Quiero** ver todos los items de inventario de mi instalacion
**Para** conocer el stock disponible

**Criterios de Aceptacion:**
- [ ] Tabla con todos los items de inventario de la instalacion actual
- [ ] Columnas: Producto, SKU, Categoria, Cantidad, Unidad, Proveedor, Estado Stock, Vencimiento
- [ ] Badge de estado de stock: Adecuado (verde), Bajo (amarillo), Critico (rojo), Agotado (gris), Exceso (azul)
- [ ] Filas clickeables navegan a `/inventory/[id]`
- [ ] Menu kebab con opciones: Ver, Editar, Ajustar Stock, Eliminar
- [ ] Stats compactos: Total items, Stock bajo, Critico, Sin stock
- [ ] Estado vacio: icono Package + mensaje + CTA "Agregar Primer Item"

**Consulta:** `inventory.getByFacility({ facilityId, category?, status? })`

**Componentes:** [inventory/page.tsx](app/(dashboard)/inventory/page.tsx), [inventory-content.tsx](app/(dashboard)/inventory/inventory-content.tsx), [inventory-list.tsx](components/inventory/inventory-list.tsx), [inventory-table.tsx](components/inventory/inventory-table.tsx)

---

### US-19.2: Filtrar y buscar inventario
**Como** administrador de inventario
**Quiero** filtrar items por categoria, estado de stock o busqueda
**Para** encontrar productos especificos

**Criterios de Aceptacion:**
- [ ] Dropdown de categoria: Todas, Semillas, Nutrientes, Pesticidas, Equipos, Sustratos, Contenedores, Herramientas, Otros
- [ ] Iconos distintivos por cada categoria en dropdown
- [ ] Popover de filtros con checkboxes de estado stock:
  - Normal (verde), Bajo (amarillo), Critico (rojo), Sin Stock (gris)
  - Por defecto todos seleccionados
- [ ] Badge contador de filtros activos
- [ ] Busqueda por nombre de producto o SKU
- [ ] Boton X para limpiar busqueda
- [ ] Boton "Limpiar" en popover de filtros
- [ ] Estado vacio de busqueda: mensaje + link limpiar

**Consulta:** Filtros aplicados en cliente sobre `inventory.getByFacility`

**Componentes:** [inventory-list.tsx](components/inventory/inventory-list.tsx)

---

### US-19.3: Alerta de stock bajo
**Como** administrador de inventario
**Quiero** ver alertas cuando hay items con stock bajo o critico
**Para** tomar acciones de reabastecimiento

**Criterios de Aceptacion:**
- [ ] Banner de alerta debajo de stats si hay stock bajo
- [ ] Color amarillo si hay bajo, rojo si hay critico
- [ ] Muestra contador: "X items con stock bajo (Y criticos)"
- [ ] Boton "Ver items" que aplica filtro de stock bajo/critico
- [ ] Desaparece si no hay items en esa condicion

**Consulta:** Derivado de `inventory.getByFacility`

**Componentes:** [low-stock-alert.tsx](components/inventory/low-stock-alert.tsx)

---

### US-19.4: Crear item de inventario
**Como** administrador de inventario
**Quiero** agregar un nuevo item al inventario
**Para** registrar insumos recibidos

**Criterios de Aceptacion:**
- [ ] Boton "Agregar Item" abre modal
- [ ] **Seccion Producto:**
  - Producto* (select de products existentes o crear nuevo)
  - SKU (auto-generado si nuevo)
  - Categoria
- [ ] **Seccion Ubicacion y Origen:**
  - Area de almacenamiento* (select de areas)
  - Proveedor (select de suppliers)
  - Lote de proveedor (texto libre)
- [ ] **Seccion Cantidades:**
  - Cantidad disponible*
  - Unidad* (select: unidades, kg, g, L, mL, etc.)
  - Punto de reorden
  - Cantidad maxima
- [ ] **Seccion Fechas:**
  - Fecha de recepcion
  - Fecha de manufactura
  - Fecha de vencimiento
- [ ] **Seccion Costos:**
  - Precio de compra total
  - Costo por unidad (calculado o manual)
- [ ] Toast de exito al crear

**Escribe:** `inventory.create({ product_id, area_id, supplier_id?, quantity_available, quantity_unit, ... })`

**Validaciones backend:**
- product_id existe
- area_id existe
- supplier_id existe (si se proporciona)

**Componentes:** [inventory-create-modal.tsx](components/inventory/inventory-create-modal.tsx)

---

### US-19.5: Ver detalle de item
**Como** administrador de inventario
**Quiero** ver informacion completa de un item de inventario
**Para** conocer todos sus datos y estado

**Criterios de Aceptacion:**
- [ ] Pagina `/inventory/[id]` con informacion completa
- [ ] Header con nombre de producto + badge de estado stock + boton Editar
- [ ] Breadcrumb: Inicio > Inventario > [Producto]
- [ ] **Card Stock:**
  - Cantidad disponible (grande, destacado)
  - Cantidad reservada, comprometida
  - Punto de reorden con indicador
  - Barra visual de nivel de stock
- [ ] **Card Producto:**
  - Nombre, SKU, Categoria
  - Numero de batch/lote
  - Lote de proveedor
- [ ] **Card Ubicacion:**
  - Area de almacenamiento (link)
  - Condiciones de almacenamiento (si aplica)
- [ ] **Card Proveedor** (si existe):
  - Nombre (link a detalle)
  - Costo por unidad
- [ ] **Card Fechas:**
  - Recepcion, Manufactura, Vencimiento
  - Alerta si vencimiento < 30 dias
- [ ] Boton "Ajustar Stock" en header
- [ ] Historial de movimientos (futura integracion)

**Consulta:** `inventory.getById({ inventoryId })`

**Componentes:** [inventory/[id]/page.tsx](app/(dashboard)/inventory/[id]/page.tsx)

---

### US-19.6: Editar item de inventario
**Como** administrador de inventario
**Quiero** actualizar informacion de un item
**Para** corregir datos o actualizar configuracion

**Criterios de Aceptacion:**
- [ ] Pagina `/inventory/[id]/edit` con formulario pre-poblado
- [ ] Campos editables:
  - Proveedor
  - Punto de reorden
  - Cantidad de reorden
  - Costo por unidad
  - Ubicacion de almacenamiento
  - Fecha de vencimiento
  - Notas
- [ ] Cantidad NO editable directamente (usar Ajustar Stock)
- [ ] Botones: Cancelar + Guardar Cambios
- [ ] Toast de exito al guardar
- [ ] Redirige a detalle

**Consulta:** `inventory.getById({ inventoryId })` para pre-poblar
**Escribe:** `inventory.update({ inventoryId, supplier_id?, reorder_point?, ... })`

**Componentes:** [inventory/[id]/edit/page.tsx](app/(dashboard)/inventory/[id]/edit/page.tsx)

---

### US-19.7: Ajustar stock
**Como** administrador de inventario
**Quiero** ajustar la cantidad de stock de un item
**Para** registrar entradas, salidas o correcciones

**Criterios de Aceptacion:**
- [ ] Modal de ajuste accesible desde detalle, tabla o menu
- [ ] **Tipo de ajuste** (radio buttons):
  - Adicion: nuevo stock recibido
  - Consumo: uso en produccion
  - Desperdicio: perdida/dano
  - Transferencia: movimiento a otra area
  - Correccion: ajuste de conteo
- [ ] Cantidad a ajustar*
- [ ] Stock actual mostrado (read-only)
- [ ] Nuevo stock calculado en tiempo real
- [ ] Razon del ajuste* (texto)
- [ ] Notas adicionales (opcional)
- [ ] Validacion: no permite stock negativo (excepto correccion)
- [ ] Toast de exito con nuevo stock

**Escribe:** `inventory.adjustStock({ inventoryId, adjustmentType, quantity, reason, notes? })`

**Validaciones backend:**
- Stock suficiente para consumo/desperdicio/transferencia
- adjustmentType valido

**Componentes:** [inventory-movement-modal.tsx](components/inventory/inventory-movement-modal.tsx) (Phase E - centralizado via actividades)

---

### US-19.8: Ver items con stock bajo
**Como** administrador de inventario
**Quiero** ver rapidamente todos los items que necesitan reabastecimiento
**Para** crear ordenes de compra

**Criterios de Aceptacion:**
- [ ] Boton en alerta de stock bajo aplica filtro automaticamente
- [ ] Muestra solo items con stockStatus: low, critical, out_of_stock
- [ ] Ordenados por urgencia: out_of_stock > critical > low
- [ ] Tabla muestra cantidad faltante para llegar a punto de reorden
- [ ] Opcion de exportar lista (futuro)

**Consulta:** `inventory.getLowStock({ facilityId })`

---

### US-19.9: Eliminar item de inventario
**Como** administrador de inventario
**Quiero** eliminar un item del inventario
**Para** limpiar items obsoletos

**Criterios de Aceptacion:**
- [ ] Confirmacion antes de eliminar
- [ ] Si item tiene stock > 0: soft delete (marca como discontinued)
- [ ] Si item tiene stock = 0 y sin historial: hard delete
- [ ] Toast de confirmacion
- [ ] Item no aparece en lista activa

**Escribe:** `inventory.remove({ inventoryId })`

---

## Schema

### Tabla: `inventory_items`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `product_id` | `id("products")` | Producto asociado |
| `area_id` | `id("areas")?` | Area de almacenamiento |
| `supplier_id` | `id("suppliers")?` | Proveedor origen |
| `quantity_available` | `number` | Stock disponible |
| `quantity_reserved` | `number` | Reservado para ordenes |
| `quantity_committed` | `number` | Comprometido en produccion |
| `quantity_unit` | `string` | Unidad de medida |
| `batch_number` | `string?` | Numero de lote interno |
| `supplier_lot_number` | `string?` | Lote del proveedor |
| `serial_numbers` | `array` | Numeros de serie |
| `received_date` | `number?` | Fecha recepcion |
| `manufacturing_date` | `number?` | Fecha manufactura |
| `expiration_date` | `number?` | Fecha vencimiento |
| `last_tested_date` | `number?` | Ultima prueba |
| `purchase_price` | `number?` | Precio total compra |
| `current_value` | `number?` | Valor actual |
| `cost_per_unit` | `number?` | Costo unitario |
| `quality_grade` | `string?` | Grado de calidad |
| `quality_notes` | `string?` | Notas de calidad |
| `certificates` | `array` | Certificados |
| `source_type` | `string?` | purchased/produced |
| `source_recipe_id` | `id?` | Receta origen |
| `source_batch_id` | `id?` | Lote origen |
| `production_date` | `number?` | Fecha produccion |
| `storage_conditions` | `string?` | Condiciones almacenamiento |
| `minimum_stock_level` | `number?` | Nivel minimo |
| `maximum_stock_level` | `number?` | Nivel maximo |
| `reorder_point` | `number?` | Punto de reorden |
| `lead_time_days` | `number?` | Dias de entrega |
| `lot_status` | `string` | available/reserved/discontinued |
| `last_movement_date` | `number` | Ultimo movimiento |
| `notes` | `string?` | Notas |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number` | Timestamp actualizacion |

---

## Categorias de Producto

| Valor | Label | Icono |
|-------|-------|-------|
| `seed` | Semillas | Sprout |
| `nutrient` | Nutrientes | FlaskConical |
| `pesticide` | Pesticidas | Shield |
| `equipment` | Equipos | Cog |
| `substrate` | Sustratos | Layers |
| `container` | Contenedores | Container |
| `tool` | Herramientas | Wrench |
| `other` | Otros | FileText |

---

## Estados de Stock

| Estado | Color | Condicion |
|--------|-------|-----------|
| `adequate` | Verde | stock > reorder_point |
| `low` | Amarillo | stock <= reorder_point && stock > reorder_point * 0.5 |
| `critical` | Rojo | stock <= reorder_point * 0.5 && stock > 0 |
| `out_of_stock` | Gris | stock = 0 |
| `overstocked` | Azul | stock > maximum_stock_level |

---

## Tipos de Ajuste

| Valor | Label | Efecto |
|-------|-------|--------|
| `addition` | Adicion | + cantidad |
| `consumption` | Consumo | - cantidad |
| `waste` | Desperdicio | - cantidad |
| `transfer` | Transferencia | - cantidad |
| `correction` | Correccion | = cantidad |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M08-Areas | Ubicacion | `area_id` indica donde esta almacenado |
| M16-Suppliers | Origen | `supplier_id` indica proveedor |
| M18-Facility | Padre | Items filtrados por facility (via areas) |
| Products | Referencia | `product_id` indica el producto |
| M25-Activities | Consulta | Movimientos registrados como actividades |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `companyId, area_id?, product_id?, lot_status?, limit?, offset?` | `{ items, total }` |
| `getByFacility` | `facilityId, category?, status?` | Item[] con stockStatus calculado |
| `getById` | `inventoryId` | Item con producto, area, proveedor |
| `getByCategory` | `facilityId, category` | Item[] |
| `getLowStock` | `facilityId` | Items ordenados por urgencia |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `product_id, area_id, quantity_available, quantity_unit, ...` | product, area, supplier existen |
| `update` | `inventoryId, supplier_id?, reorder_point?, ...` | item existe |
| `adjustStock` | `inventoryId, adjustmentType, quantity, reason, notes?, userId, referenceType?, referenceId?, destinationAreaId?` | stock suficiente, tipo valido, userId requerido |
| `remove` | `inventoryId` | soft/hard delete segun stock |

---

## Historial de Transacciones (Phase D)

### US-19.10: Ver historial de movimientos de inventario
**Como** administrador de inventario
**Quiero** ver el historial de todos los movimientos de un item de inventario
**Para** tener trazabilidad completa de las operaciones de stock

**Criterios de Aceptacion:**
- [x] Card de historial de movimientos en pagina de detalle
- [x] Tabla con: fecha, tipo, cambio de cantidad, antes, despues, razon, usuario
- [x] Indicadores visuales de entrada (+verde) vs salida (-rojo)
- [x] Badge de tipo de movimiento con colores diferenciados
- [x] Fechas relativas con tooltip de fecha completa
- [x] Notas y referencias visibles

**Consulta:** `inventory.getTransactionHistory({ inventoryId, limit? })`

**Componentes:** [inventory-transaction-history.tsx](components/inventory/inventory-transaction-history.tsx)

---

### US-19.11: Registro automatico de transacciones
**Como** sistema
**Quiero** registrar automaticamente cada movimiento de inventario
**Para** mantener un historial completo y auditable

**Criterios de Aceptacion:**
- [x] Cada llamada a `adjustStock` crea un registro en `inventory_transactions`
- [x] Se registra: cantidad antes, cantidad despues, cambio, tipo, razon
- [x] Se registra el usuario que realizo el ajuste
- [x] Se pueden agregar referencias opcionales (actividad, orden de produccion)
- [x] Para transferencias se registra area origen y destino

**Mutacion:** `inventory.adjustStock` (actualizado)

---

### Tabla: `inventory_transactions`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `inventory_item_id` | `id("inventory_items")` | Item de inventario |
| `product_id` | `id("products")` | Producto (denormalizado) |
| `transaction_type` | `string` | addition/consumption/waste/transfer/correction/receipt |
| `quantity_change` | `number` | Cambio (+/-) |
| `quantity_before` | `number` | Cantidad antes |
| `quantity_after` | `number` | Cantidad despues |
| `quantity_unit` | `string` | Unidad de medida |
| `reason` | `string` | Razon del ajuste |
| `reference_type` | `string?` | activity/production_order/transfer |
| `reference_id` | `string?` | ID de entidad relacionada |
| `source_area_id` | `id("areas")?` | Area origen (transferencias) |
| `destination_area_id` | `id("areas")?` | Area destino (transferencias) |
| `performed_by` | `id("users")` | Usuario que realizo el ajuste |
| `performed_at` | `number` | Timestamp del ajuste |
| `notes` | `string?` | Notas adicionales |
| `created_at` | `number` | Timestamp de creacion |

**Indices:**
- `by_inventory_item` - inventory_item_id
- `by_product` - product_id
- `by_transaction_type` - transaction_type
- `by_performed_at` - performed_at
- `by_performed_by` - performed_by

---

### Tipos de Transaccion

| Tipo | Label | Icono | Color |
|------|-------|-------|-------|
| `addition` | Entrada | ArrowUpCircle | Verde |
| `consumption` | Consumo | ArrowDownCircle | Azul |
| `waste` | Desperdicio | Trash2 | Rojo |
| `transfer` | Transferencia | ArrowRightLeft | Morado |
| `correction` | Correccion | RefreshCw | Ambar |
| `receipt` | Recepcion | Package | Verde |

---

### API de Transacciones

| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getTransactionHistory` | `inventoryId, limit?` | Transacciones con info de usuario y areas |
| `getProductTransactionHistory` | `productId, limit?` | Transacciones de todos los items del producto |
| `getTransactionTypeLabels` | - | Lista de tipos con labels en español |

---

## Mejoras en Inventario (Phase C)

### US-19.12: Selector de productos con autocomplete
**Como** administrador de inventario
**Quiero** un selector de productos inteligente con busqueda
**Para** encontrar facilmente el producto que quiero agregar al inventario

**Criterios de Aceptacion:**
- [x] Combobox con busqueda por nombre o SKU
- [x] Muestra icono de categoria del producto
- [x] Muestra precio base del producto
- [x] Filtro en tiempo real mientras se escribe
- [x] Scroll para listas largas de productos

**Componentes:** [product-combobox.tsx](components/inventory/product-combobox.tsx)

---

### US-19.13: Crear producto inline
**Como** administrador de inventario
**Quiero** poder crear un producto nuevo sin salir del formulario de inventario
**Para** agilizar el proceso cuando el producto no existe en el catalogo

**Criterios de Aceptacion:**
- [x] Opcion "Crear nuevo producto" en el selector de productos
- [x] Modal de creacion de producto dentro del formulario de inventario
- [x] Al crear el producto, se selecciona automaticamente
- [x] Toast de confirmacion al crear

**Componentes:** [inventory-form.tsx](components/inventory/inventory-form.tsx)

---

### US-19.14: Comparacion de precios
**Como** administrador de inventario
**Quiero** ver la diferencia entre el precio base del producto y el precio de compra del lote
**Para** identificar variaciones en los costos de adquisicion

**Criterios de Aceptacion:**
- [x] Alerta informativa mostrando precio base del catalogo
- [x] Calculo automatico de costo por unidad (precio / cantidad)
- [x] Alerta de comparacion cuando el precio de compra difiere del precio base
- [x] Badge con porcentaje de diferencia (+ o -)
- [x] Colores diferenciados: verde si es menor, ambar si es mayor

**Componentes:** [inventory-form.tsx](components/inventory/inventory-form.tsx)

---

### US-19.15: Selector de proveedores mejorado
**Como** administrador de inventario
**Quiero** ver los proveedores de mi empresa en el formulario
**Para** asociar correctamente el proveedor de cada lote

**Criterios de Aceptacion:**
- [x] Lista de proveedores activos de la empresa
- [x] Icono de edificio junto a cada proveedor
- [x] Opcion "Sin proveedor" disponible

**Componentes:** [inventory-form.tsx](components/inventory/inventory-form.tsx)

---

### Archivos Creados/Modificados (Phase C)

| Archivo | Cambio |
|---------|--------|
| `components/inventory/product-combobox.tsx` | Nuevo - Selector con autocomplete |
| `components/inventory/inventory-form.tsx` | Modificado - Integracion de mejoras |

---

## Phase E: Sistema Centralizado de Movimientos via Actividades

### Filosofía del Sistema

**Principio Central:** Todo movimiento de inventario se registra a través de una actividad, garantizando trazabilidad completa para auditoría financiera y operativa.

```
ANTES:
inventory.create() ──────────────────────→ inventory_item
inventory.adjustStock() ─→ inventory_item + inventory_transaction

DESPUÉS:
activities.logInventoryMovement() ─→ activity + inventory_item
activities.log() con consume_inventory ─→ activity + actualiza inventory
```

### Beneficios

1. **Trazabilidad Unificada** - Cada movimiento tiene contexto (quién, cuándo, por qué)
2. **Auditoría Financiera** - Cambios vinculados a actividades auditables
3. **Consistencia** - Un solo flujo para todas las operaciones
4. **Historial Completo** - Historia de un producto/lote desde actividades

---

### US-19.16: Registrar entrada de inventario via actividad
**Como** administrador de inventario
**Quiero** registrar una entrada de inventario que quede como actividad
**Para** tener trazabilidad completa de las recepciones

**Criterios de Aceptación:**
- [x] Modal de "Registrar Entrada" accesible desde lista de inventario
- [x] Campos: Producto, Proveedor, Cantidad, Unidad, Lote, Área, Fechas, Precio
- [x] Crea actividad tipo `inventory_receipt`
- [x] Crea inventory_item vinculado a la actividad
- [x] Toast de confirmación
- [x] Redirige a detalle del nuevo item

**Mutación:** `activities.logInventoryMovement({ movement_type: "receipt", ... })`

**Componentes:** [inventory-receipt-modal.tsx](components/inventory/inventory-receipt-modal.tsx)

---

### US-19.17: Registrar movimientos de inventario via actividad
**Como** administrador de inventario
**Quiero** registrar consumos, correcciones y otros movimientos como actividades
**Para** mantener historial auditable de todas las operaciones

**Criterios de Aceptación:**
- [x] Modal de "Registrar Movimiento" reemplaza el antiguo "Ajustar Stock"
- [x] Tipos de movimiento: Consumo, Corrección, Desperdicio, Transferencia, Devolución
- [x] Muestra stock actual y calcula nuevo stock
- [x] Requiere razón/notas para todos los movimientos
- [x] Crea actividad con `quantity_before` y `quantity_after`
- [x] Actualiza inventory_item

**Mutación:** `activities.logInventoryMovement({ movement_type: "consumption"|"correction"|..., ... })`

**Componentes:** [inventory-movement-modal.tsx](components/inventory/inventory-movement-modal.tsx)

---

### US-19.18: Seleccionar lote específico al consumir
**Como** operador de producción
**Quiero** poder seleccionar un lote específico o usar FIFO automático
**Para** controlar de qué lote se consume el material

**Criterios de Aceptación:**
- [x] Componente LotSelector en formularios de consumo
- [x] Opción "FIFO Automático" por defecto (recomendada)
- [x] Lista de lotes disponibles con:
  - Número de lote
  - Cantidad disponible
  - Fecha de recepción
  - Fecha de vencimiento (con alertas)
  - Área de almacenamiento
- [x] Búsqueda por número de lote
- [x] Indicador de stock insuficiente si cantidad < requerida
- [x] Badge de lotes próximos a vencer

**Componentes:** [lot-selector.tsx](components/inventory/lot-selector.tsx)

---

### US-19.19: Historial de actividades por item de inventario
**Como** administrador de inventario
**Quiero** ver todas las actividades relacionadas con un item de inventario
**Para** tener trazabilidad completa de movimientos

**Criterios de Aceptación:**
- [x] Card de historial en página de detalle de inventario
- [x] Muestra actividades donde el item aparece en `materials_consumed`
- [x] Incluye actividad de creación (`created_by_activity_id`)
- [x] Columnas: Fecha, Tipo, Cantidad (+/-), Antes, Después, Usuario
- [x] Indicadores visuales de entrada vs salida
- [x] Notas y referencias visibles

**Consulta:** `activities.getInventoryMovements({ inventoryItemId, limit? })`

**Componentes:** [inventory-activity-history.tsx](components/inventory/inventory-activity-history.tsx)

---

### Mutation: logInventoryMovement

```typescript
activities.logInventoryMovement({
  // Tipo de movimiento
  movement_type: "receipt" | "consumption" | "correction" | "waste" | "transfer" | "return" | "transformation",

  // Identificación
  product_id: Id<"products">,
  inventory_item_id?: Id<"inventory_items">,  // Para movimientos en item existente

  // Cantidades
  quantity: number,
  quantity_unit: string,

  // Ubicación
  area_id: Id<"areas">,
  facility_id: Id<"facilities">,
  destination_area_id?: Id<"areas">,  // Para transferencias

  // Origen
  supplier_id?: Id<"suppliers">,
  batch_number?: string,

  // Fechas (para receipts)
  received_date?: number,
  manufacturing_date?: number,
  expiration_date?: number,

  // Costos
  purchase_price?: number,
  cost_per_unit?: number,

  // Contexto
  reason: string,
  notes?: string,
  performed_by: Id<"users">,

  // Para transformaciones (Phase F)
  transformation_type?: "phase_transition" | "harvest" | "propagation",
  target_product_id?: Id<"products">,
  target_quantity?: number,
  target_quantity_unit?: string,
  loss_quantity?: number,
  loss_reason?: string,
  source_batch_id?: Id<"batches">,
})
```

**Retorna:** `{ activityId, inventoryItemId, success }`

---

### Tabla Actualizada: `inventory_items` (Phase E)

| Campo Nuevo | Tipo | Descripción |
|-------------|------|-------------|
| `created_by_activity_id` | `id("activities")?` | Actividad que creó el item |
| `transformation_status` | `string?` | active/transformed/consumed/harvested/expired/waste |
| `transformed_to_item_id` | `id("inventory_items")?` | Item destino de transformación |
| `transformed_by_activity_id` | `id("activities")?` | Actividad de transformación |

---

### Archivos Creados/Modificados (Phase E)

| Archivo | Cambio |
|---------|--------|
| `components/inventory/inventory-receipt-modal.tsx` | Nuevo - Modal de entrada |
| `components/inventory/inventory-movement-modal.tsx` | Nuevo - Modal de movimientos |
| `components/inventory/lot-selector.tsx` | Nuevo - Selector de lotes |
| `components/inventory/inventory-activity-history.tsx` | Nuevo - Historial de actividades |
| `convex/activities.ts` | Modificado - logInventoryMovement mutation |
| `convex/schema.ts` | Modificado - campos de transformación |
| `convex/inventory.ts` | Modificado - getByFacility con productId filter |

---

## Phase F: Integración Plantas ↔ Inventario

### Arquitectura de Sincronización

```
┌─────────────────────────────────────────────────────────────────┐
│                 CICLO DE VIDA DE PLANTA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. ADQUISICIÓN DE ESQUEJES                                    │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ Activity: inventory_receipt                            │    │
│   │ → Crea inventory_item (product.category = "clone")     │    │
│   │ → Crea batch (growth_stage = "clone")                  │    │
│   │ → Link: inventory_item ↔ batch                         │    │
│   └───────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              ▼                                  │
│   2. TRANSICIÓN: Clone → Seedling                               │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ Activity: phase_transition                             │    │
│   │ materials_consumed: [{ clone_item, qty_before/after }] │    │
│   │ materials_produced: [{ seedling_product, qty }]        │    │
│   │ → Marca clone como "transformed"                       │    │
│   │ → Crea seedling inventory_item                         │    │
│   │ → Actualiza batch.current_phase                        │    │
│   └───────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              ▼                                  │
│   3. COSECHA                                                    │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ Activity: harvest                                      │    │
│   │ materials_consumed: [{ plant_item, 90 plantas }]       │    │
│   │ materials_produced: [{ plant_material, 450 kg }]       │    │
│   │ → Marca plant como "harvested"                         │    │
│   │ → Crea plant_material inventory_item                   │    │
│   │ → Batch.status = "harvested"                           │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### US-19.20: Transición de fase con inventario sincronizado
**Como** operador de producción
**Quiero** que al transicionar la fase de un batch se actualice el inventario automáticamente
**Para** mantener sincronizado el tracking de plantas con el inventario

**Criterios de Aceptación:**
- [x] Mutation que acepta batch, nueva fase, y pérdidas
- [x] Marca inventory_item fuente como "transformed"
- [x] Crea nuevo inventory_item con categoría de la nueva fase
- [x] Registra `materials_consumed` con quantity_before/after
- [x] Registra `materials_produced` con nuevo item
- [x] Actualiza `batch.current_phase`
- [x] Registra mortalidad/pérdidas

**Mutación:** `activities.logPhaseTransitionWithInventory`

---

### Mutation: logPhaseTransitionWithInventory

```typescript
activities.logPhaseTransitionWithInventory({
  // Identificación del batch
  batchId: Id<"batches">,

  // Transición
  fromPhase: string,  // clone/seedling/vegetative/flowering
  toPhase: string,

  // Inventario fuente (opcional - se busca automáticamente si no se provee)
  sourceInventoryItemId?: Id<"inventory_items">,

  // Producto destino (debe ser de categoría correspondiente a toPhase)
  targetProductId: Id<"products">,

  // Cantidades
  quantity: number,                    // Cantidad que transiciona
  quantityUnit: string,                // Unidad (plantas, unidades)
  lossQuantity?: number,               // Pérdidas en la transición
  lossReason?: string,                 // Razón de las pérdidas

  // Ubicación
  areaId: Id<"areas">,
  facilityId: Id<"facilities">,

  // Contexto
  notes?: string,
  performedBy: Id<"users">,
  timestamp?: number,
})
```

**Retorna:**
```typescript
{
  activityId: Id<"activities">,
  newInventoryItemId?: Id<"inventory_items">,
  success: boolean,
}
```

---

### US-19.21: Cosecha con inventario sincronizado
**Como** operador de producción
**Quiero** registrar una cosecha que transforme el inventario de plantas a material vegetal
**Para** tener trazabilidad desde planta hasta producto final

**Criterios de Aceptación:**
- [x] Mutation que acepta batch, rendimiento, y datos de cosecha
- [x] Marca inventory_item de plantas como "harvested"
- [x] Crea nuevo inventory_item de tipo "plant_material"
- [x] Conversión de unidades (plantas → kg/lbs)
- [x] Registra `materials_consumed` (plantas)
- [x] Registra `materials_produced` (material vegetal)
- [x] Actualiza batch y plantas a estado "harvested"

**Mutación:** `activities.logHarvest`

---

### Mutation: logHarvest

```typescript
activities.logHarvest({
  // Identificación del batch
  batchId: Id<"batches">,

  // Inventario fuente (plantas)
  sourceInventoryItemId?: Id<"inventory_items">,

  // Producto de salida (debe ser categoría "plant_material")
  harvestProductId: Id<"products">,

  // Rendimiento
  yieldQuantity: number,               // Cantidad cosechada
  yieldUnit: string,                   // Unidad (kg, g, lbs)

  // Plantas procesadas
  plantsHarvested: number,             // Número de plantas
  plantsUnit: string,                  // "plantas" o "unidades"

  // Calidad
  qualityGrade?: string,               // A/B/C

  // Ubicación destino
  destinationAreaId: Id<"areas">,
  facilityId: Id<"facilities">,

  // Contexto
  harvestDate?: number,
  notes?: string,
  performedBy: Id<"users">,
})
```

**Retorna:**
```typescript
{
  activityId: Id<"activities">,
  harvestInventoryItemId: Id<"inventory_items">,
  success: boolean,
}
```

---

### Tracking de Cantidades en Consumo FIFO (Phase F)

El sistema FIFO ahora registra `quantity_before` y `quantity_after` para cada lote consumido:

```typescript
// materials_consumed en activity
{
  inventory_item_id: "item_123",
  product_id: "prod_456",
  product_name: "Fertilizante NPK",
  quantity: 5,
  quantity_unit: "kg",
  quantity_before: 50,           // Stock antes del consumo
  quantity_after: 45,            // Stock después del consumo
  batch_number: "LOT-2024-001",
  lot_selection_mode: "fifo",    // fifo/manual/specific
}
```

Cuando el consumo abarca múltiples lotes:

```typescript
materials_consumed: [
  {
    inventory_item_id: "item_A",
    quantity: 3,
    quantity_before: 3,
    quantity_after: 0,
    batch_number: "LOT-001",
  },
  {
    inventory_item_id: "item_B",
    quantity: 2,
    quantity_before: 10,
    quantity_after: 8,
    batch_number: "LOT-002",
  }
]
```

---

### Tabla: `activities` - Campos de Inventario (Phase F)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `quantity_before` | `number?` | Stock total antes del movimiento |
| `quantity_after` | `number?` | Stock total después del movimiento |
| `materials_consumed` | `array` | Materiales consumidos con tracking |
| `materials_produced` | `array?` | Materiales producidos (transformaciones) |

### Estructura de materials_produced

```typescript
materials_produced: [
  {
    product_id: Id<"products">,
    inventory_item_id?: Id<"inventory_items">,  // Item creado
    quantity: number,
    quantity_unit: string,
  }
]
```

---

### Estados de Transformación (transformation_status)

| Estado | Descripción | Uso |
|--------|-------------|-----|
| `active` | Item en uso normal | Default |
| `transformed` | Convertido a otra categoría | Transiciones de fase |
| `consumed` | Consumido completamente | Consumo en producción |
| `harvested` | Cosechado | Cosecha de plantas |
| `expired` | Vencido | Items expirados |
| `waste` | Desperdicio | Pérdidas registradas |

---

### Categorías de Producto para Plantas

| Categoría | Label | SKU Prefix | Descripción |
|-----------|-------|------------|-------------|
| `clone` | Esquejes | CLO | Material vegetativo |
| `seedling` | Plántulas | PLT | Plantas jóvenes |
| `mother_plant` | Plantas Madre | MAD | Fuentes de propagación |
| `plant_material` | Material Vegetal | MAT | Producto cosechado |

**Archivo de validación:** [lib/validations/product.ts](lib/validations/product.ts)

---

### Diagrama de Trazabilidad Completa

```
Actividad de Compra (Receipt)
    │
    ├── inventory_item (esquejes, id: inv_001)
    │       quantity_available: 100
    │       transformation_status: "active"
    │       created_by_activity_id: act_001
    │
    └── batch (batch_001)
            current_phase: "clone"

            │
            ▼

Actividad de Transición (Phase Transition)
    │
    ├── materials_consumed:
    │       inventory_item_id: inv_001
    │       quantity: 100
    │       quantity_before: 100
    │       quantity_after: 0
    │
    ├── materials_produced:
    │       product_id: seedling_product
    │       inventory_item_id: inv_002
    │       quantity: 95
    │
    ├── inventory_item (esquejes, id: inv_001)
    │       transformation_status: "transformed"
    │       transformed_to_item_id: inv_002
    │       transformed_by_activity_id: act_002
    │
    └── inventory_item (plántulas, id: inv_002)
            quantity_available: 95
            transformation_status: "active"
            created_by_activity_id: act_002

            │
            ▼

Actividad de Cosecha (Harvest)
    │
    ├── materials_consumed:
    │       inventory_item_id: inv_002
    │       quantity: 95 plantas
    │       quantity_before: 95
    │       quantity_after: 0
    │
    ├── materials_produced:
    │       product_id: plant_material
    │       inventory_item_id: inv_003
    │       quantity: 450 kg
    │
    ├── inventory_item (plántulas, id: inv_002)
    │       transformation_status: "harvested"
    │       transformed_to_item_id: inv_003
    │
    └── inventory_item (material vegetal, id: inv_003)
            quantity_available: 450
            quantity_unit: "kg"
            transformation_status: "active"
```

---

### Archivos Creados/Modificados (Phase F)

| Archivo | Cambio |
|---------|--------|
| `convex/schema.ts` | +transformation_status, +transformed_to_item_id, +materials_produced |
| `convex/activities.ts` | +logPhaseTransitionWithInventory, +logHarvest, FIFO con qty tracking |
| `lib/validations/product.ts` | +categorías clone, seedling, mother_plant, plant_material |
| `convex/inventory.ts` | getByFacility con productId filter para LotSelector |
| `components/inventory/lot-selector.tsx` | Filtro por producto |

---

## Phase G: Generación Automática de Lotes Internos

### Contexto

El sistema maneja dos tipos de números de lote:

1. **`batch_number`** (Lote Interno): Generado automáticamente por el sistema con prefijos basados en la categoría del producto
2. **`supplier_lot_number`** (Lote de Proveedor): Proporcionado por el proveedor al recibir mercancía

### Formato de Lote Interno

```
PREFIX-YYMMDD-XXXX
```

Donde:
- `PREFIX`: Código de 3 letras basado en la categoría del producto
- `YYMMDD`: Fecha en formato año-mes-día
- `XXXX`: Número secuencial de 4 dígitos

**Ejemplos:**
- `CLO-251216-0001` → Primer lote de esquejes del 16/dic/2025
- `NUT-251216-0002` → Segundo lote de nutrientes del 16/dic/2025
- `MAT-251216-0001` → Primer lote de material vegetal del 16/dic/2025

### Prefijos por Categoría

| Categoría | Prefijo | Descripción |
|-----------|---------|-------------|
| seed | SEM | Semillas |
| nutrient | NUT | Nutrientes |
| pesticide | PES | Pesticidas |
| equipment | EQP | Equipos |
| substrate | SUS | Sustratos |
| container | CON | Contenedores |
| tool | HER | Herramientas |
| other | OTR | Otros |
| clone | CLO | Esquejes |
| seedling | PLT | Plántulas |
| mother_plant | MAD | Plantas Madre |
| plant_material | MAT | Material Vegetal |

### Generación Automática

El lote interno se genera automáticamente en las siguientes situaciones:

#### 1. Recepción de Inventario (`logInventoryMovement` con `movement_type: "receipt"`)

```typescript
// Si no se proporciona batch_number, se genera automáticamente
activities.logInventoryMovement({
  movement_type: "receipt",
  product_id: "producto_xyz",   // Categoría: nutrient
  batch_number: undefined,      // ← Se generará "NUT-251216-0001"
  supplier_lot_number: "LOT-PROVEEDOR-123", // Lote del proveedor (opcional)
  supplier_id: "proveedor_abc",
  // ...otros campos
});
```

#### 2. Transformaciones (Transiciones de Fase, Cosechas)

Los productos generados internamente (transformaciones, cosechas) **siempre** obtienen un nuevo lote interno basado en la categoría del producto destino:

```typescript
// Transición de fase: clone → seedling
activities.logPhaseTransitionWithInventory({
  batchId: "batch_xyz",
  targetProductId: "producto_plantula", // Categoría: seedling
  // ...
});
// Resultado: Nuevo lote "PLT-251216-0001"

// Cosecha: plantas → material vegetal
activities.logHarvest({
  batchId: "batch_xyz",
  targetProductId: "producto_material", // Categoría: plant_material
  // ...
});
// Resultado: Nuevo lote "MAT-251216-0001"
```

### Manejo de Proveedor en Productos Internos

**Regla importante:** Los productos generados internamente (transformaciones, cosechas, producción) **NO** tienen proveedor externo:

| Campo | Recepción Externa | Producción Interna |
|-------|------------------|-------------------|
| `supplier_id` | ID del proveedor | `undefined` |
| `supplier_lot_number` | Lote del proveedor | `undefined` |
| `batch_number` | Auto o manual | Siempre auto-generado |
| `source_type` | `"purchase"` | `"production"` |

**Ejemplo de Trazabilidad:**

```
COMPRA (externa)                    TRANSFORMACIÓN (interna)
─────────────────                   ────────────────────────
batch_number: NUT-251216-0001       batch_number: PLT-251216-0001
supplier_id: proveedor_123    →     supplier_id: undefined
supplier_lot_number: LOT-ABC        supplier_lot_number: undefined
source_type: "purchase"             source_type: "production"
                                    source_batch_id: batch_xyz
                                    notes: "...lote origen: NUT-251216-0001"
```

### Helper Function

La generación de lotes se realiza mediante el helper `generateInternalLotNumber`:

```typescript
// convex/helpers.ts
export async function generateInternalLotNumber(
  ctx: QueryCtx | MutationCtx,
  category: string,
  date?: Date
): Promise<string>

// Uso:
const lotNumber = await generateInternalLotNumber(ctx, "clone");
// Retorna: "CLO-251216-0001" (si es el primero del día)
```

### Archivos Modificados (Phase G)

| Archivo | Cambio |
|---------|--------|
| `convex/helpers.ts` | +LOT_PREFIXES, +generateInternalLotNumber |
| `convex/activities.ts` | Auto-genera batch_number en receipt, transformation, phase_transition, harvest |

---

## Resumen de Mutations de Inventario

| Mutation | Módulo | Propósito |
|----------|--------|-----------|
| `inventory.create` | inventory.ts | Crear item directamente (legacy) |
| `inventory.update` | inventory.ts | Actualizar metadata de item |
| `inventory.adjustStock` | inventory.ts | Ajustar stock (internal, legacy) |
| `inventory.remove` | inventory.ts | Eliminar item |
| `activities.logInventoryMovement` | activities.ts | **PREFERIDO** - Crear/mover inventario via actividad |
| `activities.logPhaseTransitionWithInventory` | activities.ts | Transición de fase con inventario |
| `activities.logHarvest` | activities.ts | Cosecha con transformación de inventario |
| `activities.log` | activities.ts | Actividad general con `consume_inventory: true` |

---

## Queries de Inventario

| Query | Módulo | Propósito |
|-------|--------|-----------|
| `inventory.list` | inventory.ts | Listar items con filtros |
| `inventory.getByFacility` | inventory.ts | Items por instalación (con productId filter) |
| `inventory.getById` | inventory.ts | Detalle de item con relaciones |
| `inventory.getLowStock` | inventory.ts | Items con stock bajo |
| `activities.getInventoryMovements` | activities.ts | Historial de movimientos de un item |
| `activities.getByEntity` | activities.ts | Actividades de un batch/planta |

---

## Integraciones Actualizadas

| Módulo | Relación | Descripción |
|--------|----------|-------------|
| M08-Areas | Ubicación | `area_id` indica donde está almacenado |
| M16-Suppliers | Origen | `supplier_id` indica proveedor |
| M18-Facility | Padre | Items filtrados por facility (via areas) |
| Products | Referencia | `product_id` indica el producto |
| M25-Batches | **NUEVO** | Sincronización de fases con inventario |
| M26-Plants | **NUEVO** | Tracking individual vinculado a inventario |
| Activities | Centro | **TODO movimiento pasa por activities** |
