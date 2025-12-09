# Module 08: Area Management

## Overview

El modulo de Areas permite organizar el espacio fisico de una instalacion en zonas de cultivo especializadas. Cada area tiene un tipo especifico (propagacion, vegetativo, floracion, etc.), capacidad configurada, y especificaciones ambientales opcionales. Las areas son fundamentales para la trazabilidad ya que los lotes de produccion se asignan a areas especificas.

**Estado**: Implementado

---

## User Stories

### US-08.1: Ver lista de areas
**Como** operador de produccion
**Quiero** ver todas las areas de mi instalacion
**Para** conocer la organizacion espacial y disponibilidad

**Criterios de Aceptacion:**
- [ ] Muestra grid de cards con todas las areas de la instalacion actual
- [ ] Cada card muestra: codigo (indice), nombre, tipo con icono, area m², barra de ocupacion, estado badge
- [ ] Cards son clickeables y navegan a `/areas/[id]`
- [ ] Menu kebab en card con opcion "Editar" que navega a `/areas/[id]/edit`
- [ ] Si area tiene control climatico, muestra specs resumidos (temp, humedad, luz)
- [ ] Muestra timestamp de ultima actualizacion
- [ ] Stats compactos arriba: total, activas, en mantenimiento, inactivas
- [ ] Estado vacio: icono PackageOpen + mensaje + CTA "Crear Primera Area"

**Consulta:**
- `areas.list({ facilityId, areaType?, status? })` → lista de areas
- `areas.getStats({ facilityId })` → conteos por estado
- `crops.getCropTypes({ includeInactive: false })` → para modal de creacion

**Componentes:** [areas/page.tsx](app/(dashboard)/areas/page.tsx), [area-list.tsx](components/areas/area-list.tsx), [area-card.tsx](components/areas/area-card.tsx)

---

### US-08.2: Filtrar y buscar areas
**Como** operador de produccion
**Quiero** filtrar areas por tipo, estado o buscar por nombre
**Para** encontrar rapidamente las areas que necesito

**Criterios de Aceptacion:**
- [ ] Dropdown de tipo: Todas, Propagacion, Vegetativo, Floracion, Secado, Curado, Almacenamiento, Procesamiento, Cuarentena
- [ ] Icono por cada tipo en el dropdown
- [ ] En mobile muestra "Tipo", en desktop muestra label completo
- [ ] Popover de filtros avanzados (icono SlidersHorizontal):
  - Checkboxes de estado: Activa, Mantenimiento, Inactiva (por defecto todos checked)
  - Toggle de control climatico: Todos / Si / No
- [ ] Badge contador en icono de filtros cuando hay filtros activos
- [ ] Boton "Limpiar" dentro del popover cuando hay filtros
- [ ] Input de busqueda por nombre (filtra en cliente)
- [ ] Boton X para limpiar busqueda
- [ ] Estado vacio de busqueda: mensaje + link "Limpiar filtros"

**Consulta:** Filtra en cliente sobre resultado de `areas.list`

**Componentes:** [area-list.tsx](components/areas/area-list.tsx)

---

### US-08.3: Crear nueva area
**Como** administrador de instalacion
**Quiero** crear una nueva area de cultivo
**Para** expandir la capacidad productiva

**Criterios de Aceptacion:**
- [ ] Boton "Crear Area" abre modal (amber-500)
- [ ] Modal con header: icono verde + "Nueva Area" + descripcion
- [ ] **Seccion Informacion Basica:**
  - Nombre* (unico por instalacion)
  - Tipo de area* (select con 8 opciones)
  - Cultivos compatibles* (multi-select de crop_types)
  - Estado (select: Activa, Mantenimiento, Inactiva)
- [ ] **Seccion Dimensiones:**
  - Largo, Ancho, Alto (metros, opcionales)
  - Area total m²
  - Area util m²
- [ ] **Seccion Capacidad** (dos modos):
  - Manual: input numerico de capacidad maxima
  - Por contenedores: tipo (Maceta, Bandeja, etc.) + cantidad + plantas/contenedor
  - Calcula max_capacity automaticamente en modo contenedores
- [ ] **Seccion Caracteristicas Tecnicas:**
  - Toggle: Control climatico, Control iluminacion, Sistema de riego
- [ ] **Seccion Especificaciones Ambientales** (si control climatico activo):
  - Temperatura min/max (°C)
  - Humedad min/max (%)
  - Horas de luz
  - pH min/max
- [ ] Campo de notas/descripcion
- [ ] Botones: Cancelar (outline) + Crear Area (amber-500)
- [ ] Toast de exito al crear

**Escribe:** `areas.create({ facilityId, name, areaType, compatibleCropTypeIds, ... })`

**Validaciones backend:**
- Verifica que facility existe
- Verifica que todos los crop_types existen

**Componentes:** [area-create-modal.tsx](components/areas/area-create-modal.tsx), [area-form.tsx](components/areas/area-form.tsx)

---

### US-08.4: Ver detalle de area - Tab Detalle
**Como** operador de produccion
**Quiero** ver la informacion completa de un area
**Para** conocer sus especificaciones y configuracion

**Criterios de Aceptacion:**
- [ ] Header con nombre del area + boton "Editar" (amber-500)
- [ ] Breadcrumb: Inicio > Areas > [Nombre]
- [ ] Sistema de 4 tabs: Detalle, Lotes, Actividades, Inventario
- [ ] Tabs con iconos (Info, Layers, Activity, Box)
- [ ] Tabs scrolleables horizontalmente en mobile
- [ ] **Card Informacion General:**
  - Tipo de area, Area total m², Area util, Dimensiones (si existen)
  - Badge de estado en header
  - Barra de ocupacion con capacidad (si configurada)
  - Detalle de contenedores si usa ese modo
  - Descripcion/notas (si existe)
- [ ] **Card Cultivos Compatibles:** badges verdes con nombres
- [ ] **Card Especificaciones Ambientales** (si control climatico):
  - Cards con iconos: Temperatura, Humedad, Iluminacion, pH
- [ ] **Card Caracteristicas Tecnicas:** indicadores verde/gris para cada toggle
- [ ] **Card Fechas:** Creada, Ultima actualizacion

**Consulta:**
- `areas.getById({ areaId })` → area con occupancyPercentage calculado
- `crops.getCropTypes({ includeInactive: false })` → para resolver nombres

**Componentes:** [areas/[id]/page.tsx](app/(dashboard)/areas/[id]/page.tsx)

---

### US-08.5: Ver detalle de area - Tab Lotes
**Como** operador de produccion
**Quiero** ver todos los lotes asignados a esta area
**Para** conocer la produccion activa en el espacio

**Criterios de Aceptacion:**
- [ ] Contador de lotes en header ("X lotes en esta area")
- [ ] Tabla con columnas: ID (QR code), Fecha, Tipo, Cantidad, Unidad, Estado
- [ ] Tipos de lote: Propagacion, Crecimiento, Cosecha
- [ ] Estados mapeados a badges: active→verde, completed/harvested/archived→gris, destroyed→amarillo
- [ ] Filas clickeables con hover
- [ ] Estado vacio: icono Package + "No hay lotes en esta area" + mensaje explicativo
- [ ] Limite inicial de 50 registros

**Consulta:** `batches.list({ companyId, area_id: areaId, limit: 50 })`

**Componentes:** [area-batches-tab.tsx](components/areas/area-batches-tab.tsx)

---

### US-08.6: Ver detalle de area - Tab Actividades
**Como** operador de produccion
**Quiero** ver el historial de actividades realizadas en esta area
**Para** auditar operaciones y trazabilidad

**Criterios de Aceptacion:**
- [ ] Contador de actividades en header ("X actividades registradas")
- [ ] Tabla con columnas: ID (indice), Fecha, Tipo Actividad, Origen, Destino, Cantidad
- [ ] Tipos de actividad traducidos: Riego, Fertilizacion, Poda, Cosecha, Trasplante, Inspeccion, Tratamiento, Movimiento, Siembra, Secado, Curado, Empaque
- [ ] Columnas Origen/Destino muestran "-" si no aplica
- [ ] Cantidad muestra quantity_after o "-"
- [ ] Estado vacio: icono Activity + "No hay actividades registradas"
- [ ] Limite inicial de 50 registros

**Consulta:** `activities.list({ companyId, entity_type: 'area', entity_id: areaId, limit: 50 })`

**Componentes:** [area-activities-tab.tsx](components/areas/area-activities-tab.tsx)

---

### US-08.7: Ver detalle de area - Tab Inventario
**Como** operador de produccion
**Quiero** ver el inventario almacenado en esta area
**Para** conocer los insumos disponibles en el espacio

**Criterios de Aceptacion:**
- [ ] Contador de items en header ("X items en inventario")
- [ ] Grid de cards (3 columnas desktop, 2 tablet, 1 mobile)
- [ ] Cada card muestra:
  - Batch number o ID generado
  - Lote de proveedor (si existe)
  - Badge de estado de stock (Adecuado, Bajo, Critico, Agotado, Exceso)
  - Cantidad disponible + unidad
  - Alerta amarilla si stock <= reorder_point
  - Cantidades reservada/comprometida (si > 0)
  - Fecha de vencimiento con alerta roja si < 30 dias
  - Costo unitario (si existe)
- [ ] Estado vacio: icono Package + "No hay inventario en esta area"
- [ ] Limite inicial de 50 registros

**Consulta:** `inventory.list({ companyId, area_id: areaId, limit: 50 })`

**Componentes:** [area-inventory-tab.tsx](components/areas/area-inventory-tab.tsx)

---

### US-08.8: Editar area existente
**Como** administrador de instalacion
**Quiero** modificar los datos de un area
**Para** actualizar informacion o corregir errores

**Criterios de Aceptacion:**
- [ ] Pagina `/areas/[id]/edit` con formulario pre-poblado
- [ ] Mismos campos y secciones que creacion
- [ ] Header con nombre del area
- [ ] Breadcrumb: Inicio > Areas > [Nombre] > Editar
- [ ] Botones: Cancelar (vuelve a detalle) + Guardar Cambios (amber-500)
- [ ] Toast de exito al guardar
- [ ] Redirige a detalle al guardar/cancelar

**Consulta:** `areas.getById({ areaId })` para pre-poblar
**Escribe:** `areas.update({ id, name?, areaType?, ... })`

**Componentes:** [areas/[id]/edit/page.tsx](app/(dashboard)/areas/[id]/edit/page.tsx), [area-form.tsx](components/areas/area-form.tsx)

---

### US-08.9: Cambiar estado de area
**Como** administrador de instalacion
**Quiero** cambiar el estado de un area
**Para** reflejar disponibilidad real del espacio

**Criterios de Aceptacion:**
- [ ] Select de estado en formulario de edicion
- [ ] Estados validos: active, maintenance, inactive
- [ ] Mensaje de error si estado invalido
- [ ] Badge actualizado inmediatamente en lista y detalle

**Escribe:** `areas.updateStatus({ areaId, status })` o via `areas.update`

---

### US-08.10: Eliminar area (soft delete)
**Como** administrador de instalacion
**Quiero** eliminar un area que ya no uso
**Para** mantener organizacion sin perder trazabilidad

**Criterios de Aceptacion:**
- [ ] Validacion: no permite eliminar si tiene lotes activos
- [ ] Mensaje de error descriptivo si tiene lotes
- [ ] Soft delete: cambia status a "inactive"
- [ ] Area no aparece en lista con filtros por defecto (todos los estados)

**Escribe:** `areas.remove({ id })`

**Validaciones backend:**
- Busca lotes con status != 'completed' en el area
- Si existen, retorna error "No se puede eliminar el area porque tiene lotes activos"

---

## Schema

### Tabla: `areas`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `facility_id` | `id("facilities")` | Instalacion padre |
| `name` | `string` | Nombre unico por instalacion |
| `area_type` | `string` | Tipo (ver tabla abajo) |
| `compatible_crop_type_ids` | `array<id>` | Cultivos permitidos |
| `current_crop_type_id` | `id?` | Cultivo actual (opcional) |
| `length_meters` | `number?` | Largo en metros |
| `width_meters` | `number?` | Ancho en metros |
| `height_meters` | `number?` | Alto en metros |
| `total_area_m2` | `number?` | Area total |
| `usable_area_m2` | `number?` | Area util |
| `capacity_configurations` | `object?` | Config de capacidad |
| `current_occupancy` | `number` | Ocupacion actual (default: 0) |
| `reserved_capacity` | `number` | Reservas futuras (default: 0) |
| `climate_controlled` | `boolean` | Tiene control climatico |
| `lighting_controlled` | `boolean` | Tiene control de luz |
| `irrigation_system` | `boolean` | Tiene sistema de riego |
| `environmental_specs` | `object?` | Specs ambientales |
| `equipment_list` | `array` | Equipos instalados |
| `status` | `string` | active/maintenance/inactive |
| `notes` | `string?` | Descripcion |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number` | Timestamp actualizacion |

### Objeto `capacity_configurations`
```typescript
{
  max_capacity: number,           // Capacidad total (calculada o manual)
  container_type?: string,        // pot/tray/bag/bed/rack/other
  container_count?: number,       // Cantidad de contenedores
  plants_per_container?: number   // Plantas por contenedor
}
```

### Objeto `environmental_specs`
```typescript
{
  temperature_min?: number,  // °C
  temperature_max?: number,  // °C
  humidity_min?: number,     // %
  humidity_max?: number,     // %
  light_hours?: number,      // horas/dia
  ph_min?: number,
  ph_max?: number
}
```

---

## Tipos de Area

| Valor | Label | Icono |
|-------|-------|-------|
| `propagation` | Propagacion | Sprout |
| `vegetative` | Vegetativo | Leaf |
| `flowering` | Floracion | Flower2 |
| `drying` | Secado | Sun |
| `curing` | Curado | Package |
| `storage` | Almacenamiento | Warehouse |
| `processing` | Procesamiento | Cog |
| `quarantine` | Cuarentena | ShieldAlert |

---

## Estados

| Estado | Color | Uso |
|--------|-------|-----|
| `active` | Verde | Operativa |
| `maintenance` | Amarillo | No disponible temporalmente |
| `inactive` | Rojo | Deshabilitada/eliminada |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M04-Facility | Padre | `facility_id` referencia la instalacion |
| M07-Reference Data | Lookup | `crop_types` para cultivos compatibles |
| M19-Inventory | Hijo | `inventory_items.area_id` ubica items en area |
| M24-Batches | Hijo | `batches.area_id` asigna lotes al area |
| M25-Activities | Consulta | Actividades con `entity_type='area'` |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `facilityId, areaType?, status?` | Area[] filtradas |
| `getById` | `areaId` | Area + occupancyPercentage |
| `getStats` | `facilityId` | `{ total, active, maintenance, inactive, byType, totalAreaM2 }` |
| `get` | `id` | Area raw |
| `getByFacility` | `facilityId, status?` | Area[] por facility |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `facilityId, name, areaType, compatibleCropTypeIds, ...` | Facility existe, crop_types existen |
| `update` | `id, ...campos opcionales` | Area existe |
| `updateStatus` | `areaId, status` | Area existe, status valido |
| `remove` | `id` | Area existe, sin lotes activos |
