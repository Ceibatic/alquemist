# Tab Detalle

Quinto tab de `/areas/[id]`. Muestra toda la informacion de configuracion del area en cards apiladas.

## Informacion General

Card con header "Informacion General" + badge de status.

Grid responsivo (`md:grid-cols-2 lg:grid-cols-3`) con:
- Tipo de Area (con label traducido)
- Area Total (m²)
- Area Util (m², si tiene)
- Dimensiones (largo × ancho × alto, si tiene)

### Capacidad y Ocupacion

Seccion separada por borde superior. Muestra la capacidad segun el modo:

**Modo `structures`** (si `capacity_mode === "structures"` y hay `structureSummary`):
- 3 cards de resumen:
  - Estructuras (azul, icono Building2): count de estructuras
  - Capacidad Total (verde, icono Package): total plantas
  - Area de Cultivo (naranja): total growing area m²
- `OccupancyBar` con current_occupancy / max_capacity

**Modo `containers`** (si tiene `container_type` en capacity_configurations):
- 3 cards: Tipo de Contenedor, Cantidad, Plantas por Contenedor
- `OccupancyBar` con current_occupancy / max_capacity

**Modo manual** (max_capacity > 0 sin containers ni structures):
- `OccupancyBar` con current_occupancy / max_capacity
- Texto: "Capacidad manual: X plantas"

### Descripcion

Muestra notas del area (si tiene), separada por borde superior.

## Cultivos Compatibles

Card con badges verdes (bg-green-50, text-green-700, border-green-200) para cada tipo de cultivo compatible. Si no hay cultivos, muestra mensaje "No se han especificado cultivos compatibles".

## Especificaciones Ambientales

Card visible solo si `climate_controlled === true` y tiene `environmental_specs`. Grid (`md:grid-cols-2 lg:grid-cols-4`) con:

| Spec | Icono | Formato |
|------|-------|---------|
| Temperatura | Thermometer | min°C - max°C |
| Humedad | Droplets | min% - max% |
| Iluminacion | Sun | X horas/dia |
| pH | FlaskConical | min - max |

Cada spec solo se muestra si tiene valor definido.

## Caracteristicas Tecnicas

Card con grid de 3 columnas. Cada feature es un dot (verde si habilitado, gris si no) + label:

| Feature | Label |
|---------|-------|
| `climate_controlled` | Control Climatico |
| `lighting_controlled` | Control de Iluminacion |
| `irrigation_system` | Sistema de Riego |

## Fechas

Card con 2 columnas:
- Creada: fecha completa (dia mes año, formato es-ES)
- Ultima Actualizacion: fecha completa

## Estructuras

Al final del tab, se renderiza `AreaStructuresTab` para gestionar las estructuras del area (ver [estructuras.md](./estructuras.md)).

## Componentes

- Tab inline en `app/(dashboard)/areas/[id]/page.tsx` (lineas 218-538)
- `components/areas/area-structures-tab.tsx` — sub-seccion de estructuras
- `components/ui/occupancy-bar.tsx` — barra de capacidad
- `components/ui/status-badge.tsx` — badge de estado
- Query: `api.areas.getById` (con structureSummary y occupancy)
- Query: `api.crops.getCropTypes` (para cultivos compatibles)
