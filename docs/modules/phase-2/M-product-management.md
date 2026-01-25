# Module: Product Management (Catálogo Maestro)

## Overview

El módulo de Productos permite gestionar el catálogo maestro de productos e insumos de la empresa. Cada producto tiene información básica (SKU, nombre, categoría), información de precios, proveedor preferido, y propiedades regulatorias. Los productos son la base para crear items de inventario.

**Estado**: Implementado

**Relación con Inventario**:
- Un **Producto** define QUÉ es un artículo (nombre, categoría, precio base)
- Un **Item de Inventario** define CUÁNTO hay y DÓNDE está (cantidad, lote, ubicación, precio de compra específico)

---

## User Stories

### US-PRD.1: Ver lista de productos
**Como** administrador de inventario
**Quiero** ver todos los productos del catálogo
**Para** gestionar el catálogo maestro de la empresa

**Criterios de Aceptación:**
- [x] Tabla con todos los productos de la empresa
- [x] Cada entrada muestra: SKU, nombre, categoría (con icono), precio base, fabricante, proveedor, estado
- [x] Filas clickeables navegan a `/products/[id]`
- [x] Menu kebab con opciones: Ver detalles, Editar, Eliminar
- [x] Stats: total productos, activos, descontinuados
- [x] Estado vacío: mensaje + CTA "Crear Primer Producto"

**Consulta:** `products.list({ category?, status?, search? })`

**Componentes:** [products/page.tsx](app/(dashboard)/products/page.tsx), [product-list.tsx](components/products/product-list.tsx)

---

### US-PRD.2: Filtrar productos
**Como** administrador de inventario
**Quiero** filtrar productos por categoría o estado
**Para** encontrar productos específicos

**Criterios de Aceptación:**
- [x] Dropdown de categoría: Todas, Semillas, Nutrientes, Pesticidas, Equipos, Sustratos, Contenedores, Herramientas, Otros
- [x] Filtro de estado: Todos / Activos / Descontinuados
- [x] Búsqueda por nombre o SKU
- [x] Botón limpiar filtros

**Consulta:** Filtros aplicados en `products.list`

**Componentes:** [product-list.tsx](components/products/product-list.tsx)

---

### US-PRD.3: Crear nuevo producto
**Como** administrador de inventario
**Quiero** crear un nuevo producto en el catálogo
**Para** poder usarlo en inventario

**Criterios de Aceptación:**
- [x] Modal de creación con formulario multi-sección
- [x] Secciones: Información Básica, Proveedor/Fabricante, Precios, Propiedades Físicas, Información Regulatoria
- [x] Generación automática de SKU basado en categoría
- [x] Validación: SKU único, nombre requerido, categoría requerida
- [x] Selector de proveedor preferido (opcional)
- [x] Toast de confirmación al crear
- [x] Redirección a detalle del producto creado

**Mutación:** `products.create({ sku, name, category, ... })`

**Componentes:** [product-create-modal.tsx](components/products/product-create-modal.tsx), [product-form.tsx](components/products/product-form.tsx)

---

### US-PRD.4: Ver detalle de producto
**Como** administrador de inventario
**Quiero** ver toda la información de un producto
**Para** conocer sus características y configuración

**Criterios de Aceptación:**
- [x] Página de detalle en `/products/[id]`
- [x] Cards con información organizada:
  - Información del Producto (SKU, categoría, estado, descripción)
  - Información de Precios (precio base, moneda, unidad)
  - Propiedades Físicas (peso)
  - Proveedor y Fabricante
  - Información Regulatoria (registro, certificación orgánica)
  - Inventario Asociado (conteo de items)
- [x] Botones: Volver, Editar
- [x] Breadcrumbs de navegación

**Consulta:** `products.getById({ productId })`

**Componentes:** [products/[id]/page.tsx](app/(dashboard)/products/[id]/page.tsx), [product-detail-content.tsx](app/(dashboard)/products/[id]/product-detail-content.tsx)

---

### US-PRD.5: Editar producto
**Como** administrador de inventario
**Quiero** modificar la información de un producto
**Para** mantener el catálogo actualizado

**Criterios de Aceptación:**
- [x] Página de edición en `/products/[id]/edit`
- [x] Formulario pre-poblado con datos actuales
- [x] SKU NO editable (es identificador único)
- [x] Validaciones iguales a creación
- [x] Toast de confirmación al guardar
- [x] Redirección a detalle tras guardar

**Mutación:** `products.update({ productId, name?, category?, ... })`

**Componentes:** [products/[id]/edit/page.tsx](app/(dashboard)/products/[id]/edit/page.tsx), [product-edit-content.tsx](app/(dashboard)/products/[id]/edit/product-edit-content.tsx)

---

### US-PRD.6: Eliminar producto
**Como** administrador de inventario
**Quiero** eliminar un producto del catálogo
**Para** mantener el catálogo limpio

**Criterios de Aceptación:**
- [x] Confirmación antes de eliminar
- [x] Si tiene inventario asociado: soft delete (marca como "descontinuado")
- [x] Si no tiene inventario: hard delete
- [x] Toast de confirmación
- [x] Mensaje informativo sobre comportamiento

**Mutación:** `products.remove({ productId })`

**Componentes:** [product-list.tsx](components/products/product-list.tsx) (AlertDialog)

---

## Modelo de Datos

### Tabla: `products`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `sku` | string | Código único (auto-generado o manual) |
| `name` | string | Nombre del producto |
| `description` | string? | Descripción |
| `category` | string | seed/nutrient/pesticide/equipment/substrate/container/tool/other |
| `subcategory` | string? | Subcategoría opcional |
| `preferred_supplier_id` | id? | Referencia a proveedor preferido |
| `manufacturer` | string? | Nombre del fabricante |
| `brand_id` | string? | Marca |
| `default_price` | number? | Precio base de catálogo |
| `price_currency` | string | Moneda (default: COP) |
| `price_unit` | string? | Unidad de precio |
| `weight_value` | number? | Peso |
| `weight_unit` | string? | Unidad de peso |
| `regulatory_registered` | boolean | Tiene registro regulatorio |
| `regulatory_registration_number` | string? | Número de registro |
| `organic_certified` | boolean | Certificación orgánica |
| `organic_cert_number` | string? | Número de certificación |
| `status` | string | active/discontinued |
| `created_at` | number | Timestamp de creación |
| `updated_at` | number | Timestamp de actualización |

---

## Categorías de Producto

### Categorías de Insumos

| Categoría | Label | Icono |
|-----------|-------|-------|
| seed | Semillas | Sprout |
| nutrient | Nutrientes | FlaskConical |
| pesticide | Pesticidas | Shield |
| equipment | Equipos | Cog |
| substrate | Sustratos | Layers |
| container | Contenedores | Container |
| tool | Herramientas | Wrench |
| other | Otros | FileText |

### Categorías de Ciclo de Vida de Plantas (Phase F)

| Categoría | Label | Icono | Descripción |
|-----------|-------|-------|-------------|
| clone | Esquejes | Plant | Material vegetal propagativo |
| seedling | Plántulas | Seedling | Plantas jóvenes en desarrollo |
| mother_plant | Plantas Madre | Tree | Plantas fuente para propagación |
| plant_material | Material Vegetal | Leaf | Producto cosechado |

**Flujo del Ciclo de Vida:**
```
clone → seedling → [vegetative] → [flowering] → plant_material (cosecha)
```

Estas categorías permiten tracking de inventario sincronizado con las fases de producción de batches.

---

## Prefijos de SKU Automático

| Categoría | Prefijo |
|-----------|---------|
| seed | SEM |
| nutrient | NUT |
| pesticide | PES |
| equipment | EQP |
| substrate | SUS |
| container | CON |
| tool | HER |
| other | OTR |
| clone | CLO |
| seedling | PLT |
| mother_plant | MAD |
| plant_material | MAT |

---

## Archivos del Módulo

### Backend (Convex)
- `convex/products.ts` - Queries y mutations

### Frontend (Next.js)
- `app/(dashboard)/products/page.tsx` - Página de listado
- `app/(dashboard)/products/products-content.tsx` - Contenido del listado
- `app/(dashboard)/products/[id]/page.tsx` - Página de detalle
- `app/(dashboard)/products/[id]/product-detail-content.tsx` - Contenido del detalle
- `app/(dashboard)/products/[id]/edit/page.tsx` - Página de edición
- `app/(dashboard)/products/[id]/edit/product-edit-content.tsx` - Contenido de edición

### Componentes
- `components/products/product-list.tsx` - Lista con filtros
- `components/products/product-table.tsx` - Tabla de productos
- `components/products/product-form.tsx` - Formulario de crear/editar (incluye campos de historial de precio)
- `components/products/product-create-modal.tsx` - Modal de creación
- `components/products/product-price-history.tsx` - Historial de cambios de precio

### Validaciones
- `lib/validations/product.ts` - Schemas Zod

---

## Historial de Precios (Phase B)

### US-PRD.7: Ver historial de cambios de precio
**Como** administrador de inventario
**Quiero** ver el historial de cambios de precio de un producto
**Para** tener trazabilidad de las modificaciones de precio

**Criterios de Aceptación:**
- [x] Card de historial de precios en página de detalle
- [x] Tabla con: fecha, tipo de cambio, precio anterior, precio nuevo, % cambio, categoría, usuario, notas
- [x] Indicadores visuales de aumento/disminución de precio
- [x] Fechas relativas con tooltip de fecha completa
- [x] Badge de tipo de cambio con colores diferenciados

**Consulta:** `products.getPriceHistory({ productId, limit? })`

**Componentes:** [product-price-history.tsx](components/products/product-price-history.tsx)

---

### US-PRD.8: Registrar razón de cambio de precio
**Como** administrador de inventario
**Quiero** registrar la razón cuando cambio el precio de un producto
**Para** mantener un registro auditable de por qué se modificaron los precios

**Criterios de Aceptación:**
- [x] Al editar un producto y cambiar el precio, aparecen campos adicionales
- [x] Alerta informativa mostrando precio anterior vs nuevo
- [x] Selector de categoría del cambio (ajuste de mercado, inflación, promoción, etc.)
- [x] Campo de razón del cambio (texto corto)
- [x] Campo de notas adicionales (texto largo)
- [x] El registro incluye el ID del usuario que hizo el cambio

**Mutación:** `products.update({ ..., userId, priceChangeCategory, priceChangeReason, priceChangeNotes })`

**Componentes:** [product-form.tsx](components/products/product-form.tsx), [product-edit-content.tsx](app/(dashboard)/products/[id]/edit/product-edit-content.tsx)

---

### Tabla: `product_price_history`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `product_id` | id | Referencia al producto |
| `old_price` | number? | Precio anterior (null si es precio inicial) |
| `new_price` | number | Nuevo precio establecido |
| `price_currency` | string | Moneda (default: COP) |
| `change_type` | string | initial/update/correction/promotion/cost_increase |
| `change_reason` | string? | Razón del cambio (texto corto) |
| `change_category` | string? | Categoría del cambio |
| `changed_by` | id | Usuario que realizó el cambio |
| `changed_at` | number | Timestamp del cambio |
| `notes` | string? | Notas adicionales |
| `effective_date` | number? | Fecha efectiva del cambio (opcional) |

**Índices:**
- `by_product` - product_id
- `by_changed_at` - changed_at
- `by_change_type` - change_type

---

### Categorías de Cambio de Precio

| Categoría | Label |
|-----------|-------|
| market_adjustment | Ajuste de mercado |
| supplier_change | Cambio de proveedor |
| inflation | Inflación |
| promotion | Promoción |
| error_correction | Corrección de error |
| cost_increase | Aumento de costos |
| cost_decrease | Reducción de costos |
| new_contract | Nuevo contrato |
| other | Otro |

---

## Relación con otros módulos

| Módulo | Relación |
|--------|----------|
| M16: Suppliers | Producto tiene `preferred_supplier_id` |
| M19: Inventory | Item de inventario tiene `product_id` |
| M25: Batches | Plantas transforman inventario según ciclo de vida |
| Activities | Consumo y transformaciones via `materials_consumed`/`materials_produced` |
| Users | Historial de precios registra `changed_by` |

---

## Integración con Ciclo de Vida de Plantas (Phase F)

### Sincronización Batch ↔ Inventario

Cuando un batch transiciona de fase, el inventario se actualiza automáticamente:

```
┌─────────────────────────────────────────────────────────────┐
│ BATCH: phase_transition (clone → seedling)                  │
├─────────────────────────────────────────────────────────────┤
│ 1. Actividad registra transición                            │
│ 2. Inventario "clone" se marca como "transformed"           │
│ 3. Nuevo inventario "seedling" se crea                      │
│ 4. materials_consumed registra source                       │
│ 5. materials_produced registra target                       │
└─────────────────────────────────────────────────────────────┘
```

### Mutations Relacionadas

| Mutation | Descripción |
|----------|-------------|
| `activities.logPhaseTransitionWithInventory` | Transiciona batch + transforma inventario |
| `activities.logHarvest` | Cosecha batch + crea inventario plant_material |

Ver [M19-inventory-management.md](M19-inventory-management.md) para documentación completa.
