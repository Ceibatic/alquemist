# FEAT-2026-02-area-form-redesign

## Metadata
- **Creado:** 2026-02-11
- **Prioridad:** high
- **Modulo relacionado:** M08-area-management
- **Tipo:** enhancement

## Descripcion

Rediseno completo del formulario de crear area para mejorar UX: eliminar campos innecesarios de dimensiones (largo/ancho/alto, area util), simplificar la seleccion de ambiente a solo Indoor/Outdoor, eliminar el modo "contenedores" del selector de capacidad, e integrar la creacion de estructuras directamente en el formulario de crear area. Antes el usuario tenia que crear el area, navegar al detalle, y agregar estructuras una por una. Ahora puede configurar un template de estructuras con prefijo + cantidad durante la creacion. Tambien se agregaron descripciones contextuales a tipos de estructura, tipos de contenedor, y huella en piso para guiar al usuario.

## User Stories

### US-AFR.1: Schema + Constantes (environment_type y descripciones)

**Como** desarrollador
**quiero** tener el campo environment_type en areas y descripciones en los tipos de contenedor
**para** soportar la seleccion Indoor/Outdoor y mostrar ayuda contextual al usuario

#### Criterios de Aceptacion
- [x] Campo `environment_type: v.optional(v.string())` agregado a tabla `areas` en schema.ts
- [x] Campo `description: string` agregado a interface `ContainerTypeByEnvOption` en containers.ts
- [x] Descripciones agregadas a los 8 tipos indoor y 5 tipos outdoor de `CONTAINER_TYPES_BY_ENV`
- [x] Backward compatible: areas existentes sin environment_type siguen funcionando

#### Backend
- Schema: `areas.environment_type` (v.optional(v.string()))

#### Frontend
- Constantes: `lib/constants/containers.ts` — ContainerTypeByEnvOption + descriptions

---

### US-AFR.2: Validacion simplificada

**Como** desarrollador
**quiero** actualizar el schema de validacion Zod del formulario de areas
**para** reflejar los campos simplificados y soportar creacion inline de estructuras

#### Criterios de Aceptacion
- [x] Nuevo campo `environment_type: z.enum(['indoor', 'outdoor'])` requerido en createAreaSchema
- [x] Nuevo schema `inlineStructureSchema` con prefix, quantity, structure_type, num_levels, containers_per_level, container_type, positions_per_container, footprint_m2
- [x] Campo `structures: z.array(inlineStructureSchema).optional()` agregado a createAreaSchema
- [x] Campos de dimensiones (length_meters, width_meters, height_meters, usable_area_m2) movidos a optional
- [x] Modo "contenedores" eliminado de capacityConfigurationSchema (solo max_capacity + source)
- [x] Tipos exportados: `EnvironmentType`, `InlineStructure`

#### Frontend
- Validacion: `lib/validations/area.ts` — createAreaSchema, inlineStructureSchema

---

### US-AFR.3: Backend — crear area con estructuras inline

**Como** operador
**quiero** que al crear un area con estructuras, estas se creen atomicamente junto al area
**para** no tener que ir al detalle a agregar estructuras una por una

#### Criterios de Aceptacion
- [x] Mutation `areas.create` acepta nuevo arg `structures: v.optional(v.array(v.object({...})))`
- [x] Mutation `areas.create` acepta arg `environmentType: v.optional(v.string())`
- [x] Al crear area con structures, se insertan N estructuras con nombre "{prefix} {i}"
- [x] Se calcula total_capacity y growing_area_m2 por estructura
- [x] Se llama `recalculateAreaCapacity(ctx, areaId)` al final para sincronizar capacidad del area
- [x] `recalculateAreaCapacity` exportada desde structures.ts para reusar en areas.ts
- [x] Mutation `areas.update` acepta `environmentType` para editar el campo

#### Backend
- Mutation: `api.areas.create` — +environmentType, +structures args
- Mutation: `api.areas.update` — +environmentType arg
- Helper: `recalculateAreaCapacity()` exportada desde `convex/structures.ts`

---

### US-AFR.4: Backend — createBatch para tab de estructuras

**Como** operador
**quiero** agregar multiples estructuras con consecutivo desde el tab de estructuras
**para** no tener que crear una por una cuando quiero expandir un area

#### Criterios de Aceptacion
- [x] Nueva mutation `structures.createBatch` con args: areaId, prefix, startNumber, quantity, structureType, environmentType, numLevels, containersPerLevel, containerType, positionsPerContainer, footprintM2?, notes?
- [x] Valida unicidad de nombres generados contra estructuras existentes
- [x] Crea N estructuras con nombre "{prefix} {startNumber+i}" y sort_order consecutivo
- [x] Recalcula capacidad del area al terminar
- [x] Error si un nombre generado ya existe

#### Backend
- Mutation: `api.structures.createBatch`

---

### US-AFR.5: Reescritura del formulario de area

**Como** operador
**quiero** un formulario simplificado para crear areas con opcion de configurar estructuras inline
**para** completar el setup de un area en un solo paso

#### Criterios de Aceptacion
- [x] Seccion 1 — Info Basica: nombre, tipo de area, ambiente (Indoor/Outdoor radio cards), area total m2, cultivos compatibles (checkboxes), estado
- [x] Seccion 2 — Estructuras (solo mode="create"): toggle sin estructuras/configurar estructuras
- [x] Con estructuras habilitadas: selects de tipo estructura y contenedor filtrados por environment, con descripcion debajo de cada select
- [x] Grid de configuracion: niveles, contenedores/nivel, posiciones/contenedor
- [x] Input huella en piso con descripcion "Espacio que ocupa cada estructura en el piso"
- [x] Inputs prefijo + cantidad con preview de nombres generados
- [x] Banner de capacidad total calculada: "Capacidad total: X plantas (N estructuras x Y plantas c/u)"
- [x] Auto-fill: tipo estructura → niveles por defecto, tipo contenedor → posiciones por defecto
- [x] Environment change resetea selecciones de estructura/contenedor
- [x] Campos de dimensiones eliminados (largo, ancho, alto, area util)
- [x] Modo "contenedores" eliminado del selector de capacidad
- [x] Seccion 3 — Ajustes: climate control, iluminacion, riego, notas (sin cambios funcionales)
- [x] Prop `mode: 'create' | 'edit'` controla visibilidad de seccion estructuras
- [x] Build pasa sin errores TypeScript

#### Frontend
- Componente: `components/areas/area-form.tsx` — reescritura completa (~960 → ~600 lineas)
- Modal: `components/areas/area-create-modal.tsx` — actualizar submit handler
- Edit page: `app/(dashboard)/areas/[id]/edit/page.tsx` — +environment_type, mode="edit"

---

### US-AFR.6: Prefix continuation en tab de estructuras

**Como** operador
**quiero** poder continuar la secuencia de nombres existentes al agregar nuevas estructuras
**para** mantener el consecutivo sin tener que recordar el ultimo numero

#### Criterios de Aceptacion
- [x] StructureForm detecta prefijos existentes via regex `/^(.+?)\s+(\d+)$/` en nombres de estructuras
- [x] Modo "Continuar secuencia": dropdown de prefijos existentes, campo cantidad, preview nombres
- [x] Modo "Nombre personalizado": formulario original con nombre libre
- [x] AreaStructuresTab pasa `existingPrefixes` y `onSubmitBatch` a StructureForm
- [x] AreaStructuresTab extrae prefijos de nombres existentes con funcion `extractPrefixes()`
- [x] Handler de batch creation llama mutation `structures.createBatch`
- [x] Area detail page pasa `environmentType` a AreaStructuresTab

#### Frontend
- Componente: `components/areas/structure-form.tsx` — +prefix continuation mode
- Componente: `components/areas/area-structures-tab.tsx` — +batch creation, +prefix extraction
- Page: `app/(dashboard)/areas/[id]/page.tsx` — pasar environmentType

---

## Schema Changes

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `areas` | `environment_type` | `v.optional(v.string())` | "indoor" o "outdoor", requerido en form nuevo |

## Consideraciones Tecnicas

- **Backward compat:** Campos de dimensiones permanecen en schema, solo se ocultan en form. Areas existentes sin environment_type defaultean a "indoor" en UI
- **Atomicidad:** Creacion de area + estructuras en una sola mutation de Convex (transaccional)
- **Reutilizacion:** `recalculateAreaCapacity()` exportada como helper compartido entre areas.ts y structures.ts
- **Filtrado por environment:** Tipos de estructura y contenedor se filtran dinamicamente segun Indoor/Outdoor

## Out of Scope

- Multiples templates de estructura en un solo formulario (se soporta 1 template, luego agregar mas desde tab)
- Migracion de areas existentes a environment_type (se hace manual o via script)
- Eliminacion de campos de dimensiones del schema (permanecen para backward compat)
- Edicion de estructuras desde el formulario de editar area (se gestionan en tab Estructuras)

---

## Implementacion

### Archivos Modificados
- `convex/schema.ts` — +environment_type en tabla areas
- `convex/areas.ts` — create: +environmentType, +structures inline; update: +environmentType
- `convex/structures.ts` — export recalculateAreaCapacity, +createBatch mutation
- `lib/constants/containers.ts` — +description a ContainerTypeByEnvOption
- `lib/validations/area.ts` — +environment_type, +inlineStructureSchema, -dimensions, -containers mode
- `components/areas/area-form.tsx` — reescritura completa
- `components/areas/area-create-modal.tsx` — actualizar submit handler
- `components/areas/structure-form.tsx` — +prefix continuation mode
- `components/areas/area-structures-tab.tsx` — +batch creation, +prefix extraction
- `app/(dashboard)/areas/[id]/page.tsx` — pasar environmentType a AreaStructuresTab
- `app/(dashboard)/areas/[id]/edit/page.tsx` — +environment_type, mode="edit"

### Fecha de Completado
2026-02-11
