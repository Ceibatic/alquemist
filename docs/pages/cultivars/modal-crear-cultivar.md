# Modal Crear Cultivar

Dialog que se abre desde el boton "Crear Cultivar" del listado. Contiene `CultivarForm` en modo creacion.

## Dialog

- Max width: 4xl, max height: 90vh con scroll
- Header: icono Leaf + titulo "Nuevo Cultivar" + descripcion
- Al guardar: llama `api.cultivars.create`, toast de confirmacion, cierra modal

## Campos del Formulario

Layout de 2 columnas:

### Columna Izquierda — Informacion Basica

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre | Input texto | Si | 2-100 caracteres, unico por empresa |
| Tipo de Cultivo | Select dropdown | Si | Crop types activos del sistema |
| Tipo de Variedad | Select | No | Solo visible para Cannabis: Indica/Sativa/Hybrid/Ruderalis |
| Linaje Genetico | Input texto | No | Max 500 caracteres |
| Proveedor | Select | No | Solo si hay suppliers disponibles |

### Columna Derecha — Informacion de Cultivo

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Tiempo de Floracion | Input numerico | No | Entero, 1-365 dias |
| THC Min | Input numerico | No | 0-100%, step 0.1 (solo Cannabis) |
| THC Max | Input numerico | No | 0-100%, step 0.1, >= THC Min |
| CBD Min | Input numerico | No | 0-100%, step 0.1 (solo Cannabis) |
| CBD Max | Input numerico | No | 0-100%, step 0.1, >= CBD Min |
| Notas | Textarea | No | Max 1000 caracteres |

### Componente CannabinoidRangeInput

Input especializado para rangos de cannabinoides:
- Dos columnas: Min % | Max %
- Inputs numericos (0-100, step 0.1)
- Validacion: min <= max
- Barra visual de rango (verde)
- Se usa para THC y CBD independientemente

### Campos Condicionales

Los campos de **Tipo de Variedad** y **Cannabinoides** (THC/CBD) solo se muestran cuando el tipo de cultivo seleccionado es "Cannabis". Al cambiar de tipo de cultivo, estos campos se ocultan.

## Al Guardar

1. Valida form completo via Zod (`createCustomCultivarSchema`)
2. Llama `api.cultivars.create` con todos los campos
3. Auto-set: `status: "active"`, `performance_metrics: {}`
4. Valida nombre unico por empresa (solo activos)
5. Valida rangos THC/CBD (min <= max)
6. Toast de confirmacion
7. Cierra modal, lista se actualiza reactivamente

## Componentes

- `components/cultivars/cultivar-create-modal.tsx` — dialog wrapper
- `components/cultivars/cultivar-form.tsx` — form completo
- `components/cultivars/cannabinoid-range-input.tsx` — input de rango
- Mutation: `api.cultivars.create`
- Schema: `lib/validations/cultivar.ts` → `createCustomCultivarSchema`
