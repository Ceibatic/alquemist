# FEAT-2026-02-activity-system-p1

## Metadata
- **Creado:** 2026-02-10
- **Prioridad:** high
- **Modulo relacionado:** activities, inventory
- **Tipo:** enhancement
- **Parte de:** Activity System Overhaul (P1 de 3)

## Descripcion

Reestructuracion del modelo core de actividades para reemplazar tipos hardcodeados con un catalogo configurable por empresa (`activity_types`), normalizar el tracking de recursos consumidos/producidos en una tabla dedicada (`activity_resources`), y evolucionar la tabla `activities` con campos de workflow, contexto expandido y vinculos directos.

Esta es la Parte 1 de 3 de la mejora al sistema de actividades. Establece la fundacion sobre la cual se construiran los templates evolucionados (P2) y las observaciones/lecturas ambientales (P3). Los modelos de datos de referencia estan en `docs/data-model-references/activity-model.jsx` y `docs/data-model-references/activity-templates.jsx`.

## User Stories

### US-ACT.1: Schema activity_types + seed data

**Como** administrador del sistema
**quiero** un catalogo configurable de tipos de actividad por empresa
**para** tener una fuente unica de verdad para clasificar actividades en vez de strings hardcodeados

#### Criterios de Aceptacion
- [x] Tabla `activity_types` creada en `convex/schema.ts` con todos los campos: company_id, category, code, name, description, icon, color, requires_zone, requires_batch, requires_resources, requires_photos, requires_verification, triggers_transformation, triggers_phase_change, metadata_schema, default_resources, is_system, status, sort_order, created_at, updated_at
- [x] Indexes: by_company, by_company_category, by_company_code, by_status
- [x] Archivo `lib/constants/activity-types.ts` con ACTIVITY_CATEGORIES (10 categorias) y DEFAULT_ACTIVITY_TYPES (~33 tipos)
- [x] Las 10 categorias son: cultivation, monitoring, transformation, application, movement, maintenance, quality, harvest, post_harvest, administrative
- [x] Archivo `convex/activityTypes.ts` con mutation `seedDefaults(companyId)` que crea los ~33 tipos default con `is_system: true`
- [x] Seed data incluye por categoria: cultivation (6 tipos), monitoring (4), transformation (3), application (3), movement (3), maintenance (3), quality (3), harvest (2), post_harvest (3), administrative (3)
- [x] Cada tipo default tiene: code unico, name en espanol, category correcta, flags de requerimientos apropiados
- [x] `npx next build` pasa sin errores

#### Backend
- Schema: `activity_types` (nueva tabla)
- Mutation: `api.activityTypes.seedDefaults`
- Archivo nuevo: `convex/activityTypes.ts`
- Archivo nuevo: `lib/constants/activity-types.ts`

#### Frontend
- N/A (solo backend en esta US)

#### Dependencias
- Ninguna (primera US)

---

### US-ACT.2: CRUD backend activity_types

**Como** administrador
**quiero** crear, editar y archivar tipos de actividad personalizados
**para** adaptar el catalogo a las necesidades especificas de mi empresa

#### Criterios de Aceptacion
- [x] Query `list(companyId, category?, status?)` retorna tipos filtrados, ordenados por sort_order
- [x] Query `getById(typeId)` retorna un tipo con todos sus campos
- [x] Query `getByCode(companyId, code)` retorna el tipo por code (para lookups internos)
- [x] Mutation `create(companyId, category, code, name, ...)` crea un tipo custom con `is_system: false`
- [x] Al crear, valida que `code` sea unico dentro de la empresa (error si ya existe)
- [x] Al crear, valida que `category` sea uno de los 10 valores validos
- [x] Mutation `update(typeId, fields)` actualiza campos permitidos (name, description, icon, color, requires_*, triggers_*, metadata_schema, default_resources, sort_order)
- [x] Mutation `archive(typeId)` cambia status a "archived"; rechaza si `is_system: true` con mensaje "Los tipos de sistema no se pueden archivar"
- [x] Mutation `restore(typeId)` cambia status de "archived" a "active"
- [x] `npx next build` pasa sin errores

#### Backend
- Queries: `api.activityTypes.list`, `api.activityTypes.getById`
- Mutations: `api.activityTypes.create`, `api.activityTypes.update`, `api.activityTypes.archive`, `api.activityTypes.restore`
- Validaciones: code unico por empresa, category valida, is_system protegido
- Archivo: `convex/activityTypes.ts`

#### Frontend
- N/A (solo backend en esta US)

#### Dependencias
- Requiere: US-ACT.1

---

### US-ACT.3: UI configuracion activity_types

**Como** administrador
**quiero** una interfaz visual para gestionar los tipos de actividad de mi empresa
**para** configurar que tipos estan disponibles, personalizar sus nombres/iconos, y crear tipos custom

#### Criterios de Aceptacion
- [x] Pagina accesible en `/settings/activity-types` (dentro del layout de dashboard)
- [x] Layout con tabs horizontales, una por cada categoria (10 tabs) mostrando icono + nombre de la categoria
- [x] Cada tab muestra la lista de tipos de esa categoria con: icono, nombre, code (en gris), color badge, chips de requerimientos activos (zona, lote, recursos, fotos, verificacion)
- [x] Tipos system muestran un icono de candado junto al nombre
- [x] Boton "Agregar tipo" por tab que abre un dialog/modal con formulario: nombre, code (auto-generado desde nombre pero editable), descripcion, icono (selector), color (selector), toggles de requerimientos
- [x] Al guardar un tipo nuevo, aparece en la lista y se muestra toast "Tipo de actividad creado"
- [x] Click en un tipo existente abre dialog de edicion con los mismos campos
- [x] Toggle de archivar/restaurar visible en cada tipo (excepto system types que muestran tooltip "Los tipos de sistema no se pueden archivar")
- [x] Tipos archivados se muestran al final de la lista con opacidad reducida y badge "Archivado"
- [x] Estados: loading skeleton mientras carga, empty state si no hay tipos en una categoria
- [x] Si el seed no se ha ejecutado (0 tipos), mostrar boton "Cargar tipos predeterminados" que ejecuta seedDefaults
- [x] `npx next build` pasa sin errores

#### Backend
- Usa queries/mutations de US-ACT.2

#### Frontend
- Pagina: `app/(dashboard)/settings/activity-types/page.tsx`
- Componentes: `components/settings/activity-type-list.tsx`, `components/settings/activity-type-form.tsx`
- UI: shadcn Tabs, Dialog, Button, Input, Select, Switch, Badge, Tooltip, Skeleton

#### Dependencias
- Requiere: US-ACT.2

---

### US-ACT.4: Schema activity_resources

**Como** desarrollador
**quiero** una tabla normalizada para tracking de recursos por actividad
**para** reemplazar los arrays embebidos materials_consumed/materials_produced y habilitar queries directas por producto, lote y tipo de movimiento

#### Criterios de Aceptacion
- [x] Tabla `activity_resources` creada en `convex/schema.ts` con campos: activity_id, direction (consumed/produced/applied/wasted), product_id, inventory_item_id (opcional), quantity, unit_id (opcional), quantity_unit, cost_per_unit (opcional), cost_total (opcional), transaction_id (opcional link a inventory_transactions), application_rate (opcional), application_method (opcional), batch_number (opcional), notes (opcional), created_at
- [x] Indexes: by_activity, by_product, by_inventory_item, by_direction
- [x] Archivo `convex/activityResources.ts` con queries: `listByActivity(activityId)`, `listByProduct(productId, limit?)`
- [x] `npx next build` pasa sin errores

#### Backend
- Schema: `activity_resources` (nueva tabla)
- Queries: `api.activityResources.listByActivity`, `api.activityResources.listByProduct`
- Archivo nuevo: `convex/activityResources.ts`

#### Frontend
- N/A (solo backend en esta US)

#### Dependencias
- Ninguna (independiente de US-ACT.1-3)

---

### US-ACT.5: Evolucionar tabla activities

**Como** desarrollador
**quiero** agregar campos de workflow, contexto expandido y vinculos directos a la tabla activities
**para** soportar el nuevo modelo de actividades con tipo configurable, estado, asignacion y relaciones

#### Criterios de Aceptacion
- [x] Campos nuevos agregados a `activities` en schema.ts (todos `v.optional()` para backward compat):
  - Tipo: `type_id` (id activity_types), `category` (string)
  - Contexto: `company_id` (id companies), `facility_id` (id facilities), `batch_id` (id batches), `crop_phase` (string), `zone_id` (id areas), `structure_id` (id structures)
  - Workflow: `status` (string: planned/in_progress/completed/verified/cancelled), `priority` (string: routine/urgent/critical)
  - Tiempo: `started_at` (number), `completed_at` (number)
  - Asignacion: `assigned_to` (id users), `verified_by` (id users), `verified_at` (number)
  - Descriptivo: `title` (string), `observations` (string, texto post-ejecucion)
  - Vinculos: `parent_activity_id` (id activities), `work_order_id` (id production_orders)
- [x] Nuevos indexes: by_company (company_id), by_type_id (type_id), by_batch_id (batch_id), by_facility (facility_id), by_status (status)
- [x] Queries existentes (`list`, `listByBatch`, `getStats`, etc.) siguen funcionando sin cambios
- [x] `npx next build` pasa sin errores
- [ ] Schema deploy exitoso (verificar con `npx convex dev`)

#### Backend
- Schema: Modificar tabla `activities` en schema.ts
- Sin cambios a mutations/queries existentes (solo agregar campos al schema)

#### Frontend
- N/A (solo schema en esta US)

#### Dependencias
- Requiere: US-ACT.1 (para que exista la tabla activity_types referenciada por type_id)

---

### US-ACT.6: Refactorizar activities.log() + nuevo logV2()

**Como** desarrollador
**quiero** una nueva mutation `logV2()` que use el modelo nuevo nativamente y un helper FIFO consolidado
**para** que codigo nuevo use activity_resources y type_id desde el inicio, mientras el codigo existente sigue funcionando

#### Criterios de Aceptacion
- [x] Nueva mutation `logV2()` en `convex/activities.ts` que acepta:
  - `type_id` (requerido, id activity_types) en vez de `activity_type` string
  - `company_id`, `facility_id`, `batch_id`, `crop_phase` (opcionales)
  - `status` (default: "completed"), `priority` (default: "routine")
  - `title` (opcional, auto-generado si no se provee: "{type_name} — {entity_name}")
  - `resources` (array de objetos con product_id, direction, quantity, unit, etc.)
  - `consume_inventory` flag para disparar consumo real
  - Demas campos existentes (performed_by, duration_minutes, etc.)
- [x] `logV2()` internamente:
  1. Valida type_id contra activity_types table
  2. Denormaliza `category` y `activity_type` (code) desde el tipo
  3. Inserta activity con todos los campos nuevos + legacy fields para compat
  4. Para cada recurso: crea fila en `activity_resources`
  5. Si `consume_inventory=true`: ejecuta consumo FIFO/especifico y vincula transaction_id en el activity_resource
  6. ~~Crea labor cost entry si duration_minutes > 0~~ (createLaborCostEntry no existe aun, se agrega en futuro)
  7. Sigue escribiendo `materials_consumed` en la activity (backup durante migracion)
- [x] Helper `consumeFromInventoryFIFO(ctx, args)` extraido como funcion compartida en `convex/helpers.ts`:
  - Acepta: product_id, quantity, facility_id, area_id opcional
  - Retorna: array de {inventory_item_id, quantity_consumed, cost_per_unit, batch_number}
  - Logica identica a la actual en logInventoryMovement() y log()
- [x] Mutation `log()` existente NO se modifica (sigue funcionando para callers actuales)
- [x] `npx next build` pasa sin errores

#### Backend
- Mutation nueva: `api.activities.logV2`
- Helper nuevo: `consumeFromInventoryFIFO()` en `convex/helpers.ts`
- Archivo modificado: `convex/activities.ts`, `convex/helpers.ts`

#### Frontend
- N/A (solo backend en esta US)

#### Dependencias
- Requiere: US-ACT.4 (activity_resources table), US-ACT.5 (activities evolution)

---

### US-ACT.7: Migrar inserts en batches.ts y recipes.ts

**Como** desarrollador
**quiero** que las 8 inserciones directas de actividades en batches.ts y recipes.ts usen el nuevo modelo
**para** que todas las actividades creadas desde operaciones de batch/receta tengan type_id, category, company_id y activity_resources

#### Criterios de Aceptacion
- [x] Helper `getActivityTypeByCode(ctx, companyId, code)` creado en `convex/helpers.ts` que busca type por code en activity_types; retorna el tipo o null
- [x] En `convex/batches.ts`, los 7 inserts de actividad (`ctx.db.insert("activities", ...)`) refactorizados para:
  - Resolver company_id desde batch → facility → company (o pasado como arg)
  - Lookup activity_type por code (movement, loss_record, batch_split, batch_merge, harvest, phase_transition)
  - Poblar: type_id, category, company_id, facility_id, batch_id, crop_phase, status: "completed", title auto-generado
  - Crear activity_resources rows para cada material en materials_consumed (si hay)
- [x] En `convex/recipes.ts`, el insert de actividad (recipe_execution) refactorizado igual:
  - Poblar type_id, category, company_id, facility_id, status: "completed"
  - Crear activity_resources rows para cada ingrediente consumido
- [x] Si no existe activity_type para el code (empresa sin seed), hacer fallback graceful: insert sin type_id (como antes)
- [x] Comportamiento externo identico: returns, batch updates, plant updates, inventory changes NO cambian
- [x] `npx next build` pasa sin errores

#### Backend
- Helper: `getActivityTypeByCode()` en `convex/helpers.ts`
- Archivos modificados: `convex/batches.ts`, `convex/recipes.ts`

#### Frontend
- N/A (solo backend en esta US)

#### Dependencias
- Requiere: US-ACT.6 (para consumeFromInventoryFIFO helper)

---

### US-ACT.8: Migrar mutations de inventario en activities.ts

**Como** desarrollador
**quiero** que logInventoryMovement(), logPhaseTransitionWithInventory() y logHarvest() creen activity_resources normalizados
**para** que todas las operaciones de inventario generen datos en el nuevo modelo

#### Criterios de Aceptacion
- [x] `logInventoryMovement()` (~700 lineas): despues de crear la actividad e inventory_transaction, crear fila(s) en activity_resources con:
  - direction: "consumed" para consumption/waste/return, "produced" para receipt, "applied" para application
  - transaction_id: link a la inventory_transaction creada
  - cost_per_unit y cost_total: del inventory_item al momento del consumo
  - batch_number: del inventory_item si existe
  - Poblar type_id, category, company_id, facility_id en la activity (lookup por movement_type → code mapping)
- [x] `logPhaseTransitionWithInventory()` (~250 lineas): crear 2 activity_resources:
  - direction: "consumed" para el source item (plantas/material fuente)
  - direction: "produced" para el target item (nuevo producto transformado)
  - Ambos con transaction_id, cost, batch_number
- [x] `logHarvest()` (~300 lineas): crear 2 activity_resources:
  - direction: "consumed" para plantas cosechadas
  - direction: "produced" para material vegetal cosechado (yield)
  - Poblar type_id (harvest), category, company_id, facility_id, crop_phase
- [x] FIFO en logInventoryMovement() usa el helper `consumeFromInventoryFIFO()` de US-ACT.6 (consolidar duplicacion)
- [x] Mapping de movement_type a activity_type code:
  - receipt → INVENTORY_RECEIPT
  - consumption → INVENTORY_CONSUMPTION
  - correction → INVENTORY_CORRECTION
  - waste → INVENTORY_WASTE
  - transfer → INVENTORY_TRANSFER
  - return → INVENTORY_RETURN
  - transformation → INVENTORY_TRANSFORMATION
- [x] Returns de las 3 mutations NO cambian (backward compat de API)
- [x] `npx next build` pasa sin errores

#### Backend
- Archivo modificado: `convex/activities.ts` (3 mutations grandes)
- Constantes: Agregar inventory-specific types al seed de US-ACT.1 si no estan

#### Frontend
- N/A (solo backend en esta US)

#### Dependencias
- Requiere: US-ACT.6, US-ACT.7 (helpers ya creados)

---

### US-ACT.9: Actualizar frontend + migracion de datos existentes

**Como** usuario
**quiero** que la interfaz de actividades muestre los datos correctamente con el nuevo modelo
**para** ver tipos con iconos/colores configurables y recursos normalizados

#### Criterios de Aceptacion
- [x] `components/batches/batch-activities-tab.tsx` actualizado:
  - Reemplazar map hardcodeado de tipos (lineas 25-68) con query a `activityTypes.list`
  - Resolver icono, color y label desde el catalogo via type_id o fallback a activity_type string
  - Mostrar materials_consumed de cada actividad cuando existen
  - Backward compat: si actividad no tiene type_id, usar el map legacy como fallback
- [x] `components/inventory/inventory-activity-history.tsx` actualizado:
  - Mostrar activity_resources cuando existen, fallback a materials_consumed embebido
  - Mostrar direction badge (consumed/produced/applied/wasted) con color
- [x] Mutation de migracion `migrateActivitiesToNewModel(companyId)` en `convex/activityTypes.ts`:
  - Obtiene todas las actividades de la empresa (via entity → batch → facility → company)
  - Para cada activity sin type_id:
    - Mapea activity_type string a code del catalogo
    - Sets: type_id, category, company_id, status: "completed"
    - Resuelve facility_id y batch_id del entity si entity_type es "batch"
  - Para cada activity con materials_consumed no vacio:
    - Crea activity_resources rows (direction: "consumed", con product_id, quantity, etc.)
  - Para cada activity con materials_produced no vacio:
    - Crea activity_resources rows (direction: "produced")
  - Idempotente: skip si activity ya tiene type_id y ya tiene activity_resources
  - Procesa en lotes de 50 con cursor para no exceder limites de Convex
- [x] Ejecutable via Convex dashboard (mutation directa)
- [x] `npx next build` pasa sin errores

#### Backend
- Mutation: `api.activityTypes.migrateActivitiesToNewModel`
- Archivo: `convex/activityTypes.ts`

#### Frontend
- Archivos modificados: `components/batches/batch-activities-tab.tsx`, `components/inventory/inventory-activity-history.tsx`

#### Dependencias
- Requiere: US-ACT.8 (todas las mutations ya migradas)

---

## Schema Changes

### Nueva tabla: `activity_types`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `v.id("companies")` | Empresa propietaria |
| `category` | `v.string()` | Categoria fija (10 valores) |
| `code` | `v.string()` | Codigo unico por empresa |
| `name` | `v.string()` | Nombre display |
| `description` | `v.optional(v.string())` | Descripcion del tipo |
| `icon` | `v.optional(v.string())` | Nombre de icono Lucide |
| `color` | `v.optional(v.string())` | Clase de color Tailwind |
| `requires_zone` | `v.boolean()` | Obliga seleccionar zona |
| `requires_batch` | `v.boolean()` | Obliga seleccionar lote |
| `requires_resources` | `v.boolean()` | Obliga registrar recursos |
| `requires_photos` | `v.boolean()` | Obliga adjuntar fotos |
| `requires_verification` | `v.boolean()` | Requiere verificacion |
| `triggers_transformation` | `v.boolean()` | Genera transformacion de inventario |
| `triggers_phase_change` | `v.boolean()` | Cambia fase del lote |
| `metadata_schema` | `v.optional(v.any())` | JSON Schema para campos dinamicos |
| `default_resources` | `v.optional(v.array(v.any()))` | Recursos sugeridos |
| `is_system` | `v.boolean()` | Tipo de sistema (no eliminable) |
| `status` | `v.string()` | active / archived |
| `sort_order` | `v.number()` | Orden de display |
| `created_at` | `v.number()` | Timestamp creacion |
| `updated_at` | `v.number()` | Timestamp actualizacion |

### Nueva tabla: `activity_resources`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `activity_id` | `v.id("activities")` | Actividad padre |
| `direction` | `v.string()` | consumed / produced / applied / wasted |
| `product_id` | `v.id("products")` | Producto/recurso |
| `inventory_item_id` | `v.optional(v.id("inventory_items"))` | Lote especifico (null si FIFO) |
| `quantity` | `v.number()` | Cantidad |
| `unit_id` | `v.optional(v.id("units_of_measure"))` | Unidad de medida |
| `quantity_unit` | `v.string()` | Unidad denormalizada |
| `cost_per_unit` | `v.optional(v.number())` | Costo unitario al momento |
| `cost_total` | `v.optional(v.number())` | Costo total (qty x cost_per_unit) |
| `transaction_id` | `v.optional(v.id("inventory_transactions"))` | Transaction generada |
| `application_rate` | `v.optional(v.string())` | Tasa de aplicacion (ej: "2mL/L") |
| `application_method` | `v.optional(v.string())` | Metodo (foliar, drench, etc.) |
| `batch_number` | `v.optional(v.string())` | Lote del item |
| `notes` | `v.optional(v.string())` | Notas |
| `created_at` | `v.number()` | Timestamp creacion |

### Campos nuevos en `activities` (todos v.optional)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `type_id` | `v.optional(v.id("activity_types"))` | Tipo configurable |
| `category` | `v.optional(v.string())` | Categoria denormalizada |
| `company_id` | `v.optional(v.id("companies"))` | Empresa |
| `facility_id` | `v.optional(v.id("facilities"))` | Instalacion |
| `batch_id` | `v.optional(v.id("batches"))` | Lote de cultivo (FK directo) |
| `crop_phase` | `v.optional(v.string())` | Fase del cultivo |
| `zone_id` | `v.optional(v.id("areas"))` | Zona |
| `structure_id` | `v.optional(v.id("structures"))` | Estructura |
| `status` | `v.optional(v.string())` | planned/in_progress/completed/verified/cancelled |
| `priority` | `v.optional(v.string())` | routine/urgent/critical |
| `started_at` | `v.optional(v.number())` | Inicio real |
| `completed_at` | `v.optional(v.number())` | Fin real |
| `assigned_to` | `v.optional(v.id("users"))` | Responsable asignado |
| `verified_by` | `v.optional(v.id("users"))` | Verificador |
| `verified_at` | `v.optional(v.number())` | Timestamp verificacion |
| `title` | `v.optional(v.string())` | Titulo descriptivo |
| `observations` | `v.optional(v.string())` | Observaciones post-ejecucion |
| `parent_activity_id` | `v.optional(v.id("activities"))` | Sub-actividad de |
| `work_order_id` | `v.optional(v.id("production_orders"))` | Orden de trabajo |

## Consideraciones Tecnicas

- **Arquitectura:** Migracion incremental — todos los campos nuevos son optional. El sistema funciona con datos viejos y nuevos coexistiendo. La migracion (US-ACT.9) es un proceso separado que se puede ejecutar cuando convenga.
- **FIFO consolidado:** Actualmente hay logica FIFO duplicada en `activities.log()` y `activities.logInventoryMovement()`. Se extrae a un helper compartido `consumeFromInventoryFIFO()`.
- **Riesgo principal:** US-ACT.8 modifica 3 mutations criticas (logInventoryMovement, logPhaseTransition, logHarvest) que manejan todo el flujo de inventario. Requiere testing exhaustivo.
- **Performance:** Los nuevos indexes permiten queries eficientes por company, type, batch, facility, status. La tabla activity_resources agrega N rows por actividad (donde N = numero de recursos), pero con index by_activity la lectura es rapida.
- **Convex limits:** La migracion procesa en batches de 100 para respetar limites de mutation de Convex.

## Out of Scope

- Templates de actividad evolucionados (FEAT-2026-02-activity-system-p2)
- Cultivation schedules / plan maestro (P2)
- Calendario de tareas / dashboard de hoy (P2)
- Observaciones estructuradas de monitoreo (FEAT-2026-02-activity-system-p3)
- Lecturas ambientales normalizadas (P3)
- Attachments normalizados (P3)
- Unificacion de plant_activities con activities
- Notificaciones/alertas de actividades
- Validacion runtime de metadata contra JSON Schema
- Formularios dinamicos basados en metadata_schema
- UI de reporte de actividades para operadores (se construye en P2 con templates)

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits
_pendiente_

### Archivos Modificados
_pendiente_

### Fecha de Completado
_pendiente_
