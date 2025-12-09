# Module 15: Cultivar Management

## Overview

El modulo de Cultivares gestiona las variedades geneticas disponibles para produccion. Existen dos tipos: cultivares del sistema (compartidos globalmente, read-only) y cultivares custom (creados por la empresa). Cada cultivar esta asociado a un tipo de cultivo (Cannabis, Cafe, etc.) y puede tener caracteristicas especificas como tiempos de floracion, niveles de THC/CBD, y dificultad de cultivo.

**Estado**: Implementado

---

## User Stories

### US-15.1: Ver lista de cultivares
**Como** administrador de instalacion
**Quiero** ver todos los cultivares disponibles
**Para** conocer las variedades que puedo usar en produccion

**Criterios de Aceptacion:**
- [ ] Grid de cards con todos los cultivares (sistema + custom)
- [ ] Cada card muestra: nombre, badge origen (Sistema/Custom), tipo variedad, tipo cultivo, tiempo floracion, dificultad, THC/CBD (si cannabis), linaje genetico
- [ ] Cards clickeables navegan a `/cultivars/[id]`
- [ ] Menu kebab solo en cultivares custom con opciones Editar/Eliminar
- [ ] Stats compactos: total + conteo por tipo de cultivo (hasta 3)
- [ ] Estado vacio: icono + mensaje + CTA "Crear Primer Cultivar"

**Consulta:**
- `cultivars.list({ cropTypeId? })` → lista de cultivares
- `crops.getCropTypes({})` → para stats y filtros

**Componentes:** [cultivars/page.tsx](app/(dashboard)/cultivars/page.tsx), [cultivar-list.tsx](components/cultivars/cultivar-list.tsx), [cultivar-card.tsx](components/cultivars/cultivar-card.tsx)

---

### US-15.2: Filtrar y buscar cultivares
**Como** administrador de instalacion
**Quiero** filtrar cultivares por tipo de cultivo, dificultad u origen
**Para** encontrar variedades especificas rapidamente

**Criterios de Aceptacion:**
- [ ] Dropdown de tipo de cultivo: Todos los tipos, Cannabis, Cafe, etc. (dinamico segun crop_types)
- [ ] Popover de filtros avanzados:
  - Dificultad de cultivo: checkboxes Facil (verde), Medio (amarillo), Dificil (rojo)
  - Origen: botones Todos / Sistema / Custom
- [ ] Badge contador de filtros activos
- [ ] Busqueda por nombre, tipo variedad o linaje genetico
- [ ] Boton "Limpiar filtros" cuando hay filtros activos
- [ ] Ordenamiento alfabetico por nombre

**Consulta:** Filtra en cliente sobre resultado de `cultivars.list`

**Componentes:** [cultivar-list.tsx](components/cultivars/cultivar-list.tsx)

---

### US-15.3: Crear cultivar custom
**Como** administrador de instalacion
**Quiero** crear un cultivar personalizado
**Para** registrar variedades propias o de proveedores especificos

**Criterios de Aceptacion:**
- [ ] Boton "Crear Cultivar" abre modal
- [ ] **Seccion Informacion Basica:**
  - Nombre* (min 2 caracteres)
  - Tipo de cultivo* (select de crop_types)
  - Tipo de variedad (Indica/Sativa/Hybrid para cannabis, o texto libre)
  - Linaje genetico (texto libre)
  - Proveedor (select opcional de suppliers)
- [ ] **Seccion Caracteristicas** (objeto flexible):
  - Tiempo de floracion (dias)
  - Dificultad de cultivo (easy/medium/difficult)
  - THC min/max (%) - solo para cannabis
  - CBD min/max (%) - solo para cannabis
- [ ] **Seccion Condiciones Optimas** (opcional):
  - Temperatura, humedad, pH
- [ ] Campo de notas
- [ ] Toast de exito al crear

**Escribe:** `cultivars.create({ name, cropTypeId, varietyType?, geneticLineage?, supplierId?, characteristics?, optimalConditions?, notes? })`

**Validaciones backend:**
- crop_type debe existir
- supplier debe existir (si se proporciona)
- nombre min 2 caracteres

**Componentes:** [cultivar-create-modal.tsx](components/cultivars/cultivar-create-modal.tsx), [cultivar-form.tsx](components/cultivars/cultivar-form.tsx)

---

### US-15.4: Ver detalle de cultivar
**Como** operador de produccion
**Quiero** ver todos los detalles de un cultivar
**Para** conocer sus caracteristicas antes de usarlo en produccion

**Criterios de Aceptacion:**
- [ ] Pagina `/cultivars/[id]` con informacion completa
- [ ] Header con nombre + badge origen + boton Editar (solo custom)
- [ ] Breadcrumb: Inicio > Cultivares > [Nombre]
- [ ] **Card Informacion General:**
  - Tipo de cultivo, Tipo variedad, Linaje genetico
  - Estado (active/discontinued)
- [ ] **Card Caracteristicas:**
  - Tiempo de floracion en semanas
  - Dificultad con badge de color
  - THC/CBD ranges (si cannabis)
- [ ] **Card Condiciones Optimas** (si existen)
- [ ] **Card Proveedor** (si esta vinculado)
- [ ] Notas (si existen)
- [ ] Fecha de creacion

**Consulta:** `cultivars.get({ id })`

**Componentes:** [cultivars/[id]/page.tsx](app/(dashboard)/cultivars/[id]/page.tsx)

---

### US-15.5: Editar cultivar custom
**Como** administrador de instalacion
**Quiero** modificar un cultivar que cree
**Para** actualizar informacion o corregir errores

**Criterios de Aceptacion:**
- [ ] Solo disponible para cultivares custom (no sistema)
- [ ] Pagina `/cultivars/[id]/edit` con formulario pre-poblado
- [ ] Mismos campos que creacion (excepto tipo de cultivo que es read-only)
- [ ] Botones: Cancelar + Guardar Cambios
- [ ] Toast de exito al guardar
- [ ] Redirige a detalle

**Consulta:** `cultivars.get({ id })` para pre-poblar
**Escribe:** `cultivars.update({ id, name?, varietyType?, geneticLineage?, supplierId?, characteristics?, optimalConditions?, status?, notes? })`

**Componentes:** [cultivars/[id]/edit/page.tsx](app/(dashboard)/cultivars/[id]/edit/page.tsx), [cultivar-form.tsx](components/cultivars/cultivar-form.tsx)

---

### US-15.6: Eliminar cultivar custom
**Como** administrador de instalacion
**Quiero** eliminar un cultivar que ya no uso
**Para** mantener mi catalogo organizado

**Criterios de Aceptacion:**
- [ ] Solo disponible para cultivares custom
- [ ] Confirmacion con dialogo antes de eliminar
- [ ] Soft delete: cambia status a "discontinued"
- [ ] Toast de confirmacion
- [ ] Cultivar desaparece de lista con filtro por defecto

**Escribe:** `cultivars.remove({ id })`

---

### US-15.7: Vincular cultivares del sistema
**Como** administrador de instalacion
**Quiero** vincular cultivares del catalogo del sistema a mi instalacion
**Para** tenerlos disponibles en mis ordenes de produccion

**Criterios de Aceptacion:**
- [ ] Modal de seleccion de cultivares del sistema
- [ ] Filtro por tipo de cultivo
- [ ] Checkboxes para seleccion multiple
- [ ] Boton "Vincular Seleccionados"
- [ ] Toast de confirmacion

**Consulta:** `cultivars.getSystemCultivars({ cropTypeId })`
**Escribe:** `cultivars.linkSystemCultivars({ facilityId, cultivarIds })`

**Nota:** La relacion cultivar-facility se establece automaticamente cuando se crean batches con ese cultivar.

**Componentes:** [link-cultivars-modal.tsx](components/cultivars/link-cultivars-modal.tsx)

---

## Schema

### Tabla: `cultivars`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `name` | `string` | Nombre del cultivar |
| `crop_type_id` | `id("crop_types")` | Tipo de cultivo |
| `variety_type` | `string?` | Indica/Sativa/Hybrid u otro |
| `genetic_lineage` | `string?` | Padres geneticos |
| `supplier_id` | `id("suppliers")?` | Proveedor origen |
| `origin_metadata` | `object?` | Marca cultivares del sistema |
| `characteristics` | `object?` | Caracteristicas de cultivo |
| `optimal_conditions` | `object?` | Condiciones ideales |
| `performance_metrics` | `object` | Metricas de rendimiento (default: {}) |
| `status` | `string` | active/discontinued |
| `notes` | `string?` | Notas adicionales |
| `created_at` | `number` | Timestamp creacion |

### Objeto `characteristics`
```typescript
{
  flowering_time_days?: number,   // Dias de floracion
  growth_difficulty?: 'easy' | 'medium' | 'difficult',
  thc_min?: number,               // % minimo THC
  thc_max?: number,               // % maximo THC
  cbd_min?: number,               // % minimo CBD
  cbd_max?: number,               // % maximo CBD
  yield_indoor?: string,          // Rendimiento interior
  yield_outdoor?: string,         // Rendimiento exterior
  height_indoor?: string,         // Altura interior
  height_outdoor?: string         // Altura exterior
}
```

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
| `list` | `cropTypeId?, supplierId?, status?, varietyType?` | Cultivar[] |
| `get` | `id` | Cultivar |
| `getByCrop` | `cropTypeId, status?` | Cultivar[] por tipo |
| `getByFacility` | `facilityId` | Cultivars usados en facility (via batches) |
| `getSystemCultivars` | `cropTypeId` | Cultivars del sistema activos |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `name, cropTypeId, varietyType?, ...` | crop_type existe, supplier existe |
| `createCustom` | `name, cropTypeId, ...` | nombre min 2 chars |
| `update` | `id, ...campos opcionales` | cultivar existe, supplier existe |
| `remove` | `id` | cultivar existe → soft delete |
| `linkSystemCultivars` | `facilityId, cultivarIds[]` | facility existe, cultivars existen |
