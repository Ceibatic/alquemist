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

**Consulta:** `products.list({ companyId, category?, status?, search? })`

**Componentes:** [products/page.tsx](app/(dashboard)/products/page.tsx), [product-list.tsx](components/products/product-list.tsx)

---

### US-PRD.2: Filtrar productos
**Como** administrador de inventario
**Quiero** filtrar productos por categoría o estado
**Para** encontrar productos específicos

**Criterios de Aceptación:**
- [x] Dropdown de categoría: Todas las categorías de insumos + categorías de ciclo de vida (12 total)
- [x] Categorías de insumos: Semillas, Nutrientes, Pesticidas, Equipos, Sustratos, Contenedores, Herramientas, Otros
- [x] Categorías de ciclo de vida: Esquejes, Plántulas, Plantas Madre, Material Vegetal
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
- [x] Generación automática de SKU basado en categoría (12 categorías incluyendo Phase F)
- [x] Validación: SKU único (con feedback en tiempo real), nombre requerido, categoría requerida
- [x] Selector de proveedor preferido (opcional)
- [x] Selector de unidad de inventario por defecto (kg, g, L, mL, unidades, etc.)
- [x] Selector de categoría incluye categorías de ciclo de vida: clone, seedling, mother_plant, plant_material
- [x] Toast de confirmación al crear
- [x] Redirección a detalle del producto creado

**Mutación:** `products.create({ companyId, sku, name, category, ... })` (requiere auth)

**Componentes:** [product-create-modal.tsx](components/products/product-create-modal.tsx), [product-form.tsx](components/products/product-form.tsx)

---

### US-PRD.4: Ver detalle de producto
**Como** administrador de inventario
**Quiero** ver toda la información de un producto
**Para** conocer sus características y configuración

**Criterios de Aceptación:**
- [x] Página de detalle en `/products/[id]`
- [x] Cards con información organizada:
  - Información del Producto (SKU, categoría, estado, descripción, unidad de inventario)
  - Información de Precios (precio base, moneda, unidad)
  - Propiedades Físicas (peso, dimensiones)
  - Proveedor y Fabricante
  - Información Regulatoria (registro, certificación orgánica)
  - Inventario Asociado (conteo dinámico de items en inventario)
  - Historial de Precios (últimos cambios)
- [x] Botones: Volver, Editar, Agregar Inventario
- [x] Breadcrumbs de navegación
- [x] Error boundary para productos eliminados

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

**Mutación:** `products.update({ productId, name?, category?, ... })` (requiere auth)

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
- [x] Validación de ownership (multi-tenant): solo productos de la empresa del usuario
- [x] Toast de confirmación
- [x] Mensaje informativo sobre comportamiento del delete

**Mutación:** `products.remove({ productId })` (requiere auth)

**Componentes:** [product-list.tsx](components/products/product-list.tsx) (AlertDialog)

---

### US-PRD.9: Validación de SKU único en tiempo real
**Como** administrador de inventario
**Quiero** recibir feedback inmediato si el SKU que estoy ingresando ya existe
**Para** evitar errores y duplicados antes de enviar el formulario

**Criterios de Aceptación:**
- [ ] Query debounced `products.checkSkuExists({ sku, companyId })` en backend
- [ ] Validación en tiempo real mientras el usuario escribe el SKU
- [ ] Mensaje de error claro si el SKU ya existe
- [ ] Indicador visual (check verde) si el SKU está disponible
- [ ] Solo valida si SKU tiene formato correcto (min 2 caracteres)
- [ ] No bloquea el botón de generar SKU automático

**Consulta:** `products.checkSkuExists({ sku, companyId })`

**Componentes:** [product-form.tsx](components/products/product-form.tsx)

---

## Requerimientos de Seguridad y Validación

### Validaciones Backend (Convex)

**Todas las mutations deben incluir:**
- ✅ **Auth guard**: `getAuthUserId(ctx)` al inicio de cada mutation
- ✅ **Ownership validation**: Verificar que `product.company_id` coincide con la empresa del usuario autenticado
- ✅ **Input sanitization**: `.trim()` en todos los strings (name, sku, description, manufacturer, etc.)
- ✅ **Enum validation**: Usar `v.union(v.literal(...))` para campos con valores fijos:
  - `category`: enum de 12 valores (seed, nutrient, pesticide, equipment, substrate, container, tool, clone, seedling, mother_plant, plant_material, other)
  - `status`: enum de 2 valores (active, discontinued)
  - `price_currency`: enum (COP, USD, EUR)
- ✅ **SKU uniqueness**: Verificar en `create` que no exista otro producto con el mismo SKU en la empresa
- ✅ **Supplier validation**: Si `preferred_supplier_id` está presente, verificar que existe y pertenece a la empresa

### Validaciones Frontend (Zod)

**Schema `productFormSchema` debe incluir:**
- ✅ **SKU**: min 2, max 50, regex `/^[A-Z0-9-]+$/`, `.trim()`
- ✅ **name**: min 2, max 200, `.trim()`, requerido
- ✅ **category**: enum de 12 valores (incluyendo categorías Phase F)
- ✅ **default_price**: number opcional, min 0
- ✅ **weight_value**: number opcional, positive
- ✅ **description**: max 1000, opcional

### Performance

**Índices requeridos en `convex/schema.ts`:**
- ✅ `by_company` - Para multi-tenancy (query principal)
- ✅ `by_sku` - Para búsqueda rápida por SKU
- ✅ `by_category` - Para filtrado por categoría
- ✅ `by_status` - Para filtrado por estado
- ✅ `by_regulatory_registered` - Para compliance reports
- [ ] **NUEVO**: `by_company_status` - Índice compuesto para query más común: "productos activos de mi empresa"

```typescript
.index("by_company_status", ["company_id", "status"])
```

### Manejo de Errores

**Toasts y feedback:**
- ✅ Error de red: Mostrar mensaje con opción de reintentar
- ✅ SKU duplicado: Mensaje específico "El SKU {sku} ya existe en el catálogo"
- ✅ Producto no encontrado: Redirect a `/products` con toast informativo
- ✅ Sin permisos: "No tienes permisos para realizar esta acción"
- ✅ Proveedor inválido: "El proveedor seleccionado no existe o fue eliminado"

---

## Modelo de Datos

### Tabla: `products`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `company_id` | id | Referencia a la empresa (multi-tenant) |
| `sku` | string | Código único (auto-generado o manual) |
| `gtin` | string? | Global Trade Item Number |
| `name` | string | Nombre del producto |
| `description` | string? | Descripción |
| `category` | string | seed/nutrient/pesticide/equipment/substrate/container/tool/clone/seedling/mother_plant/plant_material/other |
| `subcategory` | string? | Subcategoría opcional |
| `default_unit` | string? | Unidad por defecto de inventario (kg/g/L/mL/unidades/etc) |
| `applicable_crop_type_ids` | array(id) | Tipos de cultivo aplicables |
| `preferred_supplier_id` | id? | Referencia a proveedor preferido |
| `regional_suppliers` | array(id) | Proveedores regionales |
| `manufacturer` | string? | Nombre del fabricante |
| `brand_id` | string? | Marca |
| `default_price` | number? | Precio base de catálogo |
| `price_currency` | string | Moneda (default: COP) |
| `price_unit` | string? | Unidad de precio |
| `weight_value` | number? | Peso |
| `weight_unit` | string? | Unidad de peso |
| `dimensions_length` | number? | Largo |
| `dimensions_width` | number? | Ancho |
| `dimensions_height` | number? | Alto |
| `dimensions_unit` | string? | Unidad de dimensiones (cm/m/in) |
| `product_metadata` | object? | Metadata flexible |
| `regulatory_registered` | boolean | Tiene registro regulatorio |
| `regulatory_registration_number` | string? | Número de registro |
| `organic_certified` | boolean | Certificación orgánica |
| `organic_cert_number` | string? | Número de certificación |
| `status` | string | active/discontinued |
| `created_at` | number | Timestamp de creación |
| `updated_at` | number | Timestamp de actualización |

**Índices:**
- `by_company` - company_id (multi-tenancy)
- `by_sku` - sku (búsqueda rápida)
- `by_category` - category (filtrado)
- `by_regulatory_registered` - regulatory_registered (compliance)
- `by_status` - status (filtrado)
- `by_company_status` - [company_id, status] (índice compuesto para query más común)

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

> **Nota:** Los prefijos se generan con `products.generateSku({ companyId, category })`, scoped por empresa.

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
- `components/products/product-list.tsx` - Lista con filtros y stats
- `components/products/product-table.tsx` - Tabla de productos (debe incluir columna default_unit)
- `components/products/product-form.tsx` - Formulario de crear/editar (incluye validación SKU en tiempo real, campos de historial de precio, soporte categorías Phase F)
- `components/products/product-create-modal.tsx` - Modal de creación
- `components/products/product-price-history.tsx` - Historial de cambios de precio
- `components/inventory/product-combobox.tsx` - Selector searchable de productos (usado en inventario)

### Queries Backend
- `products.list` - Listado con filtros (category, status, search, pagination)
- `products.getById` - Detalle de producto con proveedor denormalizado
- `products.getByCategory` - Productos por categoría (helper)
- `products.generateSku` - Generación automática de SKU con prefijos
- `products.getPriceHistory` - Historial de cambios con usuario
- `products.checkSkuExists` - Validación de unicidad de SKU (NUEVO - pendiente)

### Mutations Backend
- `products.create` - Creación con validaciones completas (auth, ownership, SKU único, trim, enum)
- `products.update` - Actualización con tracking de precio
- `products.remove` - Eliminación inteligente (soft/hard según inventario)
- `products.recordPriceChange` - Registro manual de cambio de precio (helper)

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

---

## Implementación de Categorías Phase F

### Requerimiento

**CRÍTICO para integración con M25 (Batches) y M26 (Plants)**: El módulo de productos DEBE soportar las 4 categorías de ciclo de vida de plantas:

1. **clone** (Esquejes) - Material vegetal propagativo inicial
2. **seedling** (Plántulas) - Plantas jóvenes en desarrollo temprano
3. **mother_plant** (Plantas Madre) - Plantas fuente para propagación continua
4. **plant_material** (Material Vegetal) - Producto cosechado (flores secas, extractos)

### Archivos que requieren actualización

**Backend:**
- `convex/products.ts` - Validación enum debe incluir las 4 nuevas categorías
- `convex/schema.ts` - Ya incluye las categorías en el schema (sin cambios)

**Frontend:**
- `lib/validations/product.ts:38-45` - Enum de categorías en Zod schema
- `components/products/product-form.tsx:50-59` - Array de categorías en select
- `components/products/product-table.tsx` - Mapeo de iconos (Plant, Seedling, Tree, Leaf)
- `components/products/product-list.tsx:53-63` - categoryOptions para filtros
- `components/inventory/product-combobox.tsx:49-69` - categoryIcons para selector

### Iconos sugeridos (lucide-react)

```typescript
import { Plant, Seedling, Tree, Leaf } from "lucide-react"

const categoryIcons = {
  // ... existentes
  clone: Plant,
  seedling: Seedling,
  mother_plant: Tree,
  plant_material: Leaf,
}
```

### Labels en español

```typescript
const productCategoryLabels = {
  // ... existentes
  clone: "Esquejes",
  seedling: "Plántulas",
  mother_plant: "Plantas Madre",
  plant_material: "Material Vegetal",
}
```

### Prefijos de SKU (ya implementados)

Los prefijos están correctamente configurados en `products.generateSku`:
- CLO - Clone (Esqueje)
- PLT - Plant/Seedling (Plántula)
- MAD - Madre (Planta Madre)
- MAT - Material (Material Vegetal)

---

## Estado de Implementación

| User Story | Estado | Completitud |
|------------|--------|-------------|
| US-PRD.1: Ver lista | ✅ Completo | 100% |
| US-PRD.2: Filtrar | ⚠️ Parcial | 90% - Falta categorías Phase F |
| US-PRD.3: Crear | ⚠️ Parcial | 90% - Falta SKU validation en tiempo real, categorías Phase F |
| US-PRD.4: Ver detalle | ⚠️ Parcial | 95% - Falta inventory count dinámico |
| US-PRD.5: Editar | ✅ Completo | 100% |
| US-PRD.6: Eliminar | ⚠️ Parcial | 95% - Falta ownership validation en backend |
| US-PRD.7: Historial precio | ✅ Completo | 100% |
| US-PRD.8: Razón cambio precio | ✅ Completo | 100% |
| US-PRD.9: Validación SKU | ❌ Pendiente | 0% - No implementado |

**Seguridad:**
- Auth guards: ✅ Implementado
- Ownership validation: ⚠️ Falta en `remove` mutation
- Input sanitization: ⚠️ Falta `.trim()` en mutations
- Enum validation: ⚠️ Usa `v.string()` en lugar de `v.union(v.literal(...))`

**Performance:**
- Índices básicos: ✅ Completo
- Índice compuesto: ❌ Falta `by_company_status`

**General:** 95% implementado, falta completar requerimientos de seguridad y categorías Phase F.

---

**Última actualización**: 2026-01-28
**Versión**: 2.0 (Actualizado post-auditoría)
