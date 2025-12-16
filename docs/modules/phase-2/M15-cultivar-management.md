# Module 15: Cultivar Management

## Overview

El modulo de Cultivares gestiona las variedades geneticas disponibles para produccion. Cada cultivar pertenece a una empresa especifica y esta asociado a un tipo de cultivo (Cannabis, Cafe, etc.). Las caracteristicas principales incluyen tiempos de floracion y niveles de THC/CBD (para cannabis).

**Nota Importante**: A diferencia de `crop_types` que son globales, los cultivares son **propiedad de cada empresa** y se filtran por `company_id`.

**Estado**: Implementado

---

## User Stories

### US-15.1: Ver lista de cultivares
**Como** administrador de instalacion
**Quiero** ver todos los cultivares de mi empresa
**Para** conocer las variedades que puedo usar en produccion

**Criterios de Aceptacion:**
- [x] Grid de cards con todos los cultivares de la empresa
- [x] Cada card muestra: nombre, tipo variedad, tipo cultivo, tiempo floracion, THC/CBD (si cannabis), linaje genetico
- [x] Cards clickeables navegan a `/cultivars/[id]`
- [x] Menu kebab con opciones Editar/Eliminar
- [x] Stats compactos: total + conteo por tipo de cultivo (hasta 3)
- [x] Estado vacio: icono + mensaje + CTA "Crear Primer Cultivar"

**Consulta:**
- `cultivars.list({ companyId, cropTypeId? })` → lista de cultivares de la empresa
- `crops.getCropTypes({})` → para stats y filtros

**Componentes:** [cultivars/page.tsx](app/(dashboard)/cultivars/page.tsx), [cultivar-list.tsx](components/cultivars/cultivar-list.tsx), [cultivar-card.tsx](components/cultivars/cultivar-card.tsx)

---

### US-15.2: Filtrar y buscar cultivares
**Como** administrador de instalacion
**Quiero** filtrar cultivares por tipo de cultivo
**Para** encontrar variedades especificas rapidamente

**Criterios de Aceptacion:**
- [x] Dropdown de tipo de cultivo: Todos los tipos, Cannabis, Cafe, etc. (dinamico segun crop_types)
- [x] Busqueda por nombre, tipo variedad o linaje genetico
- [x] Boton "Limpiar filtros" cuando hay filtros activos
- [x] Ordenamiento alfabetico por nombre

**Consulta:** Filtra en cliente sobre resultado de `cultivars.list`

**Componentes:** [cultivar-list.tsx](components/cultivars/cultivar-list.tsx)

---

### US-15.3: Crear cultivar
**Como** administrador de instalacion
**Quiero** crear un cultivar personalizado
**Para** registrar variedades propias o de proveedores especificos

**Criterios de Aceptacion:**
- [x] Boton "Crear Cultivar" abre modal
- [x] **Seccion Informacion Basica:**
  - Nombre* (min 2 caracteres)
  - Tipo de cultivo* (select de crop_types)
  - Tipo de variedad (Indica/Sativa/Hybrid para cannabis, o texto libre)
  - Linaje genetico (texto libre)
  - Proveedor (select opcional de suppliers)
- [x] **Seccion Caracteristicas** (campos directos):
  - Tiempo de floracion (dias)
  - THC min/max (%) - solo para cannabis
  - CBD min/max (%) - solo para cannabis
- [x] Campo de notas
- [x] Toast de exito al crear

**Escribe:** `cultivars.create({ companyId, name, cropTypeId, varietyType?, geneticLineage?, supplierId?, floweringTimeDays?, thcMin?, thcMax?, cbdMin?, cbdMax?, notes? })`

**Validaciones backend:**
- companyId debe existir
- crop_type debe existir
- supplier debe existir (si se proporciona)
- nombre min 2 caracteres
- thcMin <= thcMax (si ambos se proveen)
- cbdMin <= cbdMax (si ambos se proveen)

**Componentes:** [cultivar-create-modal.tsx](components/cultivars/cultivar-create-modal.tsx), [cultivar-form.tsx](components/cultivars/cultivar-form.tsx)

---

### US-15.4: Ver detalle de cultivar
**Como** operador de produccion
**Quiero** ver todos los detalles de un cultivar
**Para** conocer sus caracteristicas antes de usarlo en produccion

**Criterios de Aceptacion:**
- [x] Pagina `/cultivars/[id]` con informacion completa
- [x] Header con nombre + boton Editar
- [x] Breadcrumb: Inicio > Cultivares > [Nombre]
- [x] **Card Informacion General:**
  - Tipo de cultivo, Tipo variedad, Linaje genetico
  - Estado (active/discontinued)
- [x] **Card Caracteristicas:**
  - Tiempo de floracion en semanas
  - THC/CBD ranges (si cannabis)
- [x] **Card Proveedor** (si esta vinculado)
- [x] Notas (si existen)
- [x] Fecha de creacion

**Consulta:** `cultivars.get({ id })`

**Componentes:** [cultivars/[id]/page.tsx](app/(dashboard)/cultivars/[id]/page.tsx)

---

### US-15.5: Editar cultivar
**Como** administrador de instalacion
**Quiero** modificar un cultivar que cree
**Para** actualizar informacion o corregir errores

**Criterios de Aceptacion:**
- [x] Pagina `/cultivars/[id]/edit` con formulario pre-poblado
- [x] Mismos campos que creacion (excepto tipo de cultivo que es read-only)
- [x] Botones: Cancelar + Guardar Cambios
- [x] Toast de exito al guardar
- [x] Redirige a detalle

**Consulta:** `cultivars.get({ id })` para pre-poblar
**Escribe:** `cultivars.update({ id, name?, varietyType?, geneticLineage?, supplierId?, floweringTimeDays?, thcMin?, thcMax?, cbdMin?, cbdMax?, status?, notes? })`

**Componentes:** [cultivars/[id]/edit/page.tsx](app/(dashboard)/cultivars/[id]/edit/page.tsx), [cultivar-form.tsx](components/cultivars/cultivar-form.tsx)

---

### US-15.6: Eliminar cultivar
**Como** administrador de instalacion
**Quiero** eliminar un cultivar que ya no uso
**Para** mantener mi catalogo organizado

**Criterios de Aceptacion:**
- [x] Confirmacion con dialogo antes de eliminar
- [x] Soft delete: cambia status a "discontinued"
- [x] Toast de confirmacion
- [x] Cultivar desaparece de lista con filtro por defecto

**Escribe:** `cultivars.remove({ id })`

---

## Schema

### Tabla: `cultivars`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | **Empresa propietaria (requerido)** |
| `name` | `string` | Nombre del cultivar |
| `crop_type_id` | `id("crop_types")` | Tipo de cultivo |
| `variety_type` | `string?` | Indica/Sativa/Hybrid u otro |
| `genetic_lineage` | `string?` | Padres geneticos |
| `supplier_id` | `id("suppliers")?` | Proveedor origen |
| `flowering_time_days` | `number?` | Dias de floracion |
| `thc_min` | `number?` | % minimo THC (cannabis) |
| `thc_max` | `number?` | % maximo THC (cannabis) |
| `cbd_min` | `number?` | % minimo CBD (cannabis) |
| `cbd_max` | `number?` | % maximo CBD (cannabis) |
| `performance_metrics` | `object` | Metricas de rendimiento (default: {}) |
| `status` | `string` | active/discontinued |
| `notes` | `string?` | Notas adicionales |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number?` | Timestamp ultima actualizacion |

### Indices
| Indice | Campos | Uso |
|--------|--------|-----|
| `by_company` | `company_id` | Filtrar cultivares por empresa |
| `by_company_crop` | `company_id`, `crop_type_id` | Filtrar por empresa + tipo cultivo |
| `by_status` | `status` | Filtrar por estado |

---

## Tipos de Variedad (Cannabis)

| Valor | Label |
|-------|-------|
| `indica` | Indica |
| `sativa` | Sativa |
| `hybrid` | Hibrido |
| `ruderalis` | Ruderalis |

---

## Estados

| Estado | Uso |
|--------|-----|
| `active` | Disponible para uso |
| `discontinued` | Descontinuado/eliminado |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M07-Reference Data | Padre | `crop_type_id` define el tipo de cultivo |
| M16-Suppliers | Lookup | `supplier_id` opcional para origen |
| M24-Batches | Referencia | Batches referencian cultivar usado |
| M22-Templates | Referencia | Templates pueden especificar cultivar |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `companyId, cropTypeId?, supplierId?, status?, varietyType?` | Cultivar[] de la empresa |
| `get` | `id` | Cultivar |
| `getByCrop` | `cropTypeId, status?` | Cultivar[] por tipo |
| `getByFacility` | `facilityId` | Cultivars usados en facility (via batches) |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `companyId, name, cropTypeId, varietyType?, floweringTimeDays?, thcMin?, thcMax?, cbdMin?, cbdMax?, ...` | company existe, crop_type existe, supplier existe |
| `update` | `id, ...campos opcionales` | cultivar existe, supplier existe |
| `remove` | `id` | cultivar existe → soft delete |
| `deleteDemoCultivars` | `companyId` | Elimina cultivares con "(Demo)" en el nombre |
| `deleteOrphanedCultivars` | - | Elimina cultivares sin company_id (limpieza) |
