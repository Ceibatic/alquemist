# Modal Crear Area

Dialog "Nueva Area" que se abre desde el boton "Crear Area" del listado. Contiene `AreaForm` en modo `create`.

## Dialog

- Titulo: "Nueva Area" con icono
- Max width: 3xl, scroll vertical
- Al guardar: llama `api.areas.create`, toast de confirmacion, cierra modal

## Campos del Formulario

### Basicos (requeridos)

| Campo | Tipo | Validacion |
|-------|------|------------|
| Nombre | Input texto | 3-100 caracteres, unico por instalacion |
| Tipo de Area | Select dropdown | propagation/vegetative/flowering/drying/curing/storage/processing/quarantine |
| Tipo de Ambiente | Radio group | indoor / outdoor |
| Status | Select | active (default) / maintenance / inactive |
| Cultivos Compatibles | Multi-checkbox | Min 1, max 10 crop types |
| Area Total m² | Input numerico | Positivo, max 1,000,000 |

### Dimensiones (opcionales)

| Campo | Tipo | Validacion |
|-------|------|------------|
| Largo | Input numerico | Metros, positivo |
| Ancho | Input numerico | Metros, positivo |
| Alto | Input numerico | Metros, positivo |
| Area Util m² | Input numerico | Positivo |

### Capacidad

Toggle "Usar Estructuras" (Switch):

**Si desactivado (modo manual)**:
- Campo unico: Capacidad maxima (numero de plantas)

**Si activado (modo estructuras)**:
- Seccion inline de template de estructura con campos:

| Campo | Tipo | Validacion |
|-------|------|------------|
| Prefijo | Input texto | 1-50 caracteres |
| Cantidad | Input numerico | 1-100 |
| Tipo de Estructura | Select | Filtrado por environment_type (ver tabla abajo) |
| Niveles | Input numerico | 1-20, entero |
| Contenedores por Nivel | Input numerico | 1-10,000, entero |
| Tipo de Contenedor | Select | Filtrado por environment_type |
| Posiciones por Contenedor | Input numerico | 1-1,000, entero |
| Footprint m² | Input numerico | Positivo, max 100,000 (opcional) |

Muestra calculo de capacidad: `niveles × contenedores × posiciones = total`

#### Tipos de Estructura por Ambiente

**Indoor**: rack_movil (4 niveles), rack_fijo (3), mesa_rolling (1), rack_vertical (8), hilera_tunel (1)

**Outdoor**: hilera (1), cama (1), hilera_espaldera (1), bloque (1)

**Greenhouse**: combinacion de indoor + outdoor

### Caracteristicas Tecnicas

| Campo | Tipo | Default |
|-------|------|---------|
| Control Climatico | Checkbox | false |
| Control de Iluminacion | Checkbox | false |
| Sistema de Riego | Checkbox | false |

### Especificaciones Ambientales (solo si climate_controlled)

| Campo | Tipo | Rango |
|-------|------|-------|
| Temperatura Min/Max | Input numerico | -10 a 50 °C |
| Humedad Min/Max | Input numerico | 0 a 100 % |
| Horas de Luz | Input numerico | 0 a 24 horas |
| pH Min/Max | Input numerico | 0 a 14 |

Validaciones: min <= max para temperatura, humedad y pH.

### Notas (opcional)

Textarea, max 1000 caracteres.

## Al Guardar

1. Valida form completo via Zod (`createAreaSchema`)
2. Llama `api.areas.create` con todos los campos
3. Si hay estructuras inline: crea area primero, luego cada estructura (batch con prefix)
4. Llama `recalculateAreaCapacity` si se crearon estructuras
5. Toast de confirmacion
6. Cierra modal, lista se actualiza reactivamente

## Componentes

- `components/areas/area-create-modal.tsx` — dialog wrapper
- `components/areas/area-form.tsx` — form completo (modo create/edit)
- Mutation: `api.areas.create`
- Schema: `lib/validations/area.ts` → `createAreaSchema`
- Constantes: `lib/constants/structures.ts`, `lib/constants/containers.ts`
