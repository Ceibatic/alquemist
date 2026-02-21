# Listado de Areas

Pagina principal `/areas`. Muestra todas las areas de la instalacion activa con filtros, stats y grid de cards.

## Stats (CompactStats)

| Stat | Icono | Color | Calculo |
|------|-------|-------|---------|
| Total | LayoutGrid | blue | Total de areas en la instalacion |
| Activas | CheckCircle | green | Areas con status `active` |
| Mantenimiento | Wrench | yellow | Areas con status `maintenance` |
| Inactivas | XCircle | red | Areas con status `inactive` |

Query: `api.areas.getStats` con `facilityId`

## Filtros

La barra de filtros combina un popover de filtros avanzados, un dropdown de tipo y un campo de busqueda en una sola linea.

### Popover de Filtros

| Filtro | Tipo | Opciones |
|--------|------|----------|
| Estado | 3 Checkboxes | Activa (verde), Mantenimiento (amarillo), Inactiva (rojo) |
| Control Climatico | 3 Botones | Todos / Si / No |

El icono del popover muestra un badge con el conteo de filtros activos.

### Tipo de Area (Dropdown)

| Valor | Label | Icono |
|-------|-------|-------|
| `null` | Todas las areas | LayoutGrid |
| `propagation` | Propagacion | Sprout |
| `vegetative` | Vegetativo | Leaf |
| `flowering` | Floracion | Flower2 |
| `drying` | Secado | Sun |
| `curing` | Curado | Package |
| `storage` | Almacenamiento | Warehouse |
| `processing` | Procesamiento | Cog |
| `quarantine` | Cuarentena | ShieldAlert |

### Busqueda

Input de texto que filtra por nombre de area (client-side).

## Grid de Cards

Grid responsivo: `md:grid-cols-2 lg:grid-cols-3`. Cada card (`AreaCard`) muestra:

1. **Header** (fondo gris gradiente): codigo numerico (3 digitos) + nombre del area + menu kebab (Editar, Eliminar)
2. **Tipo**: badge con icono + label del tipo de area
3. **Stats row**: count de lotes (Layers), count de estructuras (Building2, si > 0), area total m², badge de status
4. **Barra de capacidad** (si max_capacity > 0): `OccupancyBar` con current/max y porcentaje, muestra tipo de contenedor o "Plantas"
5. **Info clima** (si climate_controlled): temperatura, luz, humedad
6. **Timestamp**: "Ult. Registro" con fecha/hora

### Acciones por Card

| Accion | Descripcion |
|--------|-------------|
| Click card | Navega a `/areas/[id]` |
| Editar (menu) | Navega a `/areas/[id]/edit` |
| Eliminar (menu) | Soft delete via `api.areas.remove` (pone status inactive) |

## Boton Crear

Boton "Crear Area" (amber-500) en la esquina superior derecha. Abre `AreaCreateModal` (ver [modal-crear-area.md](./modal-crear-area.md)).

## Estado Vacio

Cuando no hay areas: icono PackageOpen, titulo "No hay areas configuradas", descripcion explicativa, boton CTA "Crear Primera Area" (amber-500).

## Componentes

- `components/areas/area-list.tsx` — lista completa con filtros
- `components/areas/area-card.tsx` — card individual
- `components/areas/area-create-modal.tsx` — modal de creacion
- Query: `api.areas.list` (con facilityId, areaType, status)
- Query: `api.areas.getStats` (stats para CompactStats)
- Query: `api.crops.getCropTypes` (para info de cultivos en cards)
