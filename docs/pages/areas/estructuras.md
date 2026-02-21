# Estructuras

Sub-seccion del tab Detalle de `/areas/[id]`. Permite gestionar las estructuras fisicas (racks, mesas, hileras) dentro de un area.

## Listado

Muestra todas las estructuras del area ordenadas por `sort_order`. Cada estructura se renderiza como `StructureCard`.

### Structure Card

Cada card muestra:
- Nombre de la estructura
- Tipo + ambiente (indoor/outdoor/greenhouse)
- Jerarquia de capacidad: "X niveles × Y contenedores × Z posiciones = total plantas"
- Area de cultivo m² (si tiene)
- Footprint m² (si tiene)
- Menu kebab: Editar, Eliminar
- Indicador de status (active/inactive)

### Boton Agregar

Boton "Agregar Estructura" (Building2 + Plus). Abre `StructureForm` en modo crear.

### Prefijos Inteligentes

El componente detecta prefijos existentes (ej: "Rack A 1", "Rack A 2" → prefijo "Rack A", siguiente = 3) y los ofrece como sugerencia al crear nuevas estructuras en lote.

## Formulario de Estructura

Dialog `StructureForm` con 2 tabs:

### Tab "Estructura" (individual)

| Campo | Tipo | Validacion |
|-------|------|------------|
| Nombre | Input texto | 2-100 caracteres, unico por area |
| Tipo de Estructura | Select | Filtrado por environment_type |
| Tipo de Ambiente | Select | indoor / outdoor / greenhouse |
| Niveles | Input numerico | 1-20, entero |
| Contenedores por Nivel | Input numerico | 1-10,000, entero |
| Tipo de Contenedor | Select | Filtrado por environment_type y structure_type |
| Posiciones por Contenedor | Input numerico | 1-1,000, entero |
| Footprint m² | Input numerico | Positivo, max 100,000 (opcional) |
| Notas | Textarea | Max 500 caracteres (opcional) |

### Tab "Lotes" (batch create)

| Campo | Tipo | Validacion |
|-------|------|------------|
| Prefijo | Input texto | Requerido |
| Numero Inicial | Input numerico | Inicio de secuencia |
| Cantidad | Input numerico | Cuantas crear |
| (mismos campos de jerarquia) | | |

Crea multiples estructuras con nombres secuenciales: "{Prefijo} {N}", "{Prefijo} {N+1}", etc.

## Calculos Automaticos

- **Capacidad total**: `num_levels × containers_per_level × positions_per_container`
- **Area de cultivo**: `footprint_m2 × num_levels`
- **Capacidad del area**: se recalcula via `recalculateAreaCapacity()` despues de cada operacion CRUD

## Seleccion Inteligente de Contenedores

Los tipos de contenedor disponibles cambian segun:
- `environment_type` (indoor vs outdoor vs greenhouse)
- `structure_type` (rack_movil vs mesa_rolling, etc.)

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Crear individual | `api.structures.create` + recalcular capacidad area |
| Crear lote | `api.structures.createBatch` + recalcular capacidad area |
| Editar | `api.structures.update` + recalcular si campos de jerarquia cambiaron |
| Eliminar | `api.structures.remove` (hard delete) + recalcular capacidad area |

Todas las operaciones llaman `recalculateAreaCapacity(ctx, areaId)` para sincronizar `max_capacity` del area.

## Componentes

- `components/areas/area-structures-tab.tsx` — listado + logica de prefijos
- `components/areas/structure-card.tsx` — card individual
- `components/areas/structure-form.tsx` — dialog con tabs individual/lote
- Query: `api.structures.getByArea`
- Mutations: `api.structures.create`, `api.structures.createBatch`, `api.structures.update`, `api.structures.remove`
- Schema: `lib/validations/structure.ts`
- Constantes: `lib/constants/structures.ts` (tipos por ambiente)
