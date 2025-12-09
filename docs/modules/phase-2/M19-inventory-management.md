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

**Componentes:** [adjust-stock-modal.tsx](components/inventory/adjust-stock-modal.tsx)

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
| `adjustStock` | `inventoryId, adjustmentType, quantity, reason, notes?` | stock suficiente, tipo valido |
| `remove` | `inventoryId` | soft/hard delete segun stock |
