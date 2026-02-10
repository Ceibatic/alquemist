# FEAT-2026-02-cogs-completo

## Metadata
- **Creado:** 2026-02-10
- **Prioridad:** high
- **Modulo relacionado:** M19-inventory-management
- **Tipo:** enhancement

## Descripcion

Evolucion del sistema de costos para pasar de un COGS parcial (solo insumos fisicos) a un COGS completo que incluya los tres componentes de costo mas impactantes en agricultura: **mano de obra**, **utilities (energia + agua)** y **depreciacion de equipos**. Actualmente `getCostByBatch` solo suma `cost_total` de `inventory_transactions`. Un COGS real necesita sumar tambien las horas-persona valorizadas, el prorrateo de utilities, y la depreciacion de equipos usados.

La estrategia es crear una tabla generica `cost_entries` que registre costos no-inventario vinculados a batches, en lugar de extender `inventory_transactions` (que es especifica de movimientos fisicos). Esto mantiene separacion de concerns y permite agregar fuentes de costo sin modificar el flujo de inventario existente.

**Modelo de referencia:** `docs/data-model-references/resource-model.jsx` (11 categorias de recursos agricolas — esta feature cubre 3 de las 6 faltantes).

## User Stories

### US-COGS.1: Tarifas por rol para costeo de mano de obra

**Como** administrador de la empresa
**quiero** definir una tarifa horaria por cada rol del sistema
**para** que el sistema pueda calcular automaticamente el costo de mano de obra de cada actividad

#### Criterios de Aceptacion
- [ ] Nuevo campo `hourly_rate` (number, opcional) en la tabla `roles`
- [ ] Nuevo campo `rate_currency` (string, opcional, default: "COP") en la tabla `roles`
- [ ] Pantalla de roles (`/settings/roles`) muestra columna "Tarifa/hora" editable
- [ ] Al editar un rol, aparece campo "Tarifa horaria" con input numerico y selector de moneda
- [ ] Si un rol no tiene tarifa definida, el costo de labor se registra como 0 (no bloquea)
- [ ] Los roles del sistema existentes no se ven afectados (campo es `v.optional()`)

#### Backend
- Schema: `roles` — agregar `hourly_rate: v.optional(v.number())`, `rate_currency: v.optional(v.string())`
- Mutation: `roles.update` — aceptar nuevos campos
- Query: `roles.getById` — incluir nuevos campos en retorno

#### Frontend
- Componente: editar el formulario existente de roles en settings
- Validacion: tarifa >= 0, moneda ISO 4217 (COP, USD, EUR, MXN)

#### Dependencias
- Ninguna

---

### US-COGS.2: Calculo automatico de costo de mano de obra por actividad

**Como** sistema
**quiero** calcular el costo de mano de obra al registrar una actividad con `duration_minutes`
**para** acumular costos laborales por batch y fase de cultivo

#### Criterios de Aceptacion
- [x] Nueva tabla `cost_entries` para registrar costos no-inventario vinculados a batches
- [x] Cuando se crea una actividad con `duration_minutes > 0` Y el usuario tiene un rol con `hourly_rate`, se crea automaticamente un `cost_entry` tipo `labor`
- [x] Calculo: `cost_total = (duration_minutes / 60) * hourly_rate`
- [x] El `cost_entry` registra: `batch_id`, `crop_phase`, `activity_id`, `cost_type: "labor"`, `cost_total`, `performed_by`, `details` (nombre rol, tarifa, minutos)
- [x] Si la actividad no tiene `batch_id` (no es de cultivo), el `cost_entry` se crea con `batch_id: undefined` (costo indirecto, no se suma a COGS de batch)
- [x] Si el usuario no tiene rol o el rol no tiene tarifa, no se crea `cost_entry` (solo se pierde visibilidad de costo, no bloquea la actividad)
- [x] Las actividades existentes NO generan cost_entries retroactivamente (solo nuevas)

#### Backend
- Schema: nueva tabla `cost_entries` (ver Schema Changes abajo)
- Mutation: modificar `activities.log()`, `activities.logInventoryMovement()`, `activities.logPhaseTransitionWithInventory()`, `activities.logHarvest()` — al final de cada mutation, si hay `duration_minutes` + rol con tarifa, insertar cost_entry
- Helper: `calculateLaborCost(ctx, userId, durationMinutes)` en `convex/helpers.ts`

#### Frontend
- No hay UI directa — los costos se ven en el COGS expandido (US-COGS.6)

#### Dependencias
- US-COGS.1 (tarifas por rol)

---

### US-COGS.3: Registro de lecturas de utilities (energia y agua)

**Como** administrador de instalacion
**quiero** registrar lecturas periodicas de medidores de energia y agua
**para** que el sistema pueda prorratear estos costos entre los batches activos

#### Criterios de Aceptacion
- [x] Nueva tabla `utility_readings` para registrar lecturas de medidores
- [x] Formulario accesible desde pagina de facility (`/facilities/[id]`) con boton "Registrar Lectura"
- [x] Campos del formulario: Tipo (electricidad/agua/gas), Periodo (mes/ano), Lectura anterior, Lectura actual, Consumo (calculado: actual - anterior), Unidad (kWh/m3/galones), Costo total del periodo, Notas
- [x] Validacion: lectura actual >= lectura anterior, consumo >= 0, costo >= 0
- [x] Tabla de lecturas historicas en pagina de facility con: periodo, tipo, consumo, costo, fecha registro
- [x] Una sola lectura por tipo por periodo por facility (no duplicados)

#### Backend
- Schema: nueva tabla `utility_readings` (ver Schema Changes abajo)
- Mutation: `utilities.createReading` — valida unicidad tipo+periodo+facility
- Query: `utilities.getByFacility` — lecturas ordenadas por periodo desc
- Archivo nuevo: `convex/utilities.ts`

#### Frontend
- Componente: `components/facilities/utility-reading-modal.tsx` (NUEVO)
- Componente: `components/facilities/utility-readings-table.tsx` (NUEVO)
- Pagina: agregar seccion en `app/(dashboard)/facilities/[id]/page.tsx`

#### Dependencias
- Ninguna (puede implementarse en paralelo con US-COGS.1-2)

---

### US-COGS.4: Prorrateo automatico de utilities a batches activos

**Como** sistema
**quiero** distribuir el costo de utilities entre los batches que estuvieron activos durante el periodo
**para** que cada batch refleje su parte proporcional de energia y agua

#### Criterios de Aceptacion
- [x] Al guardar una lectura de utility, el sistema genera `cost_entries` tipo `utility_electricity`, `utility_water` o `utility_gas` para cada batch activo en la facility durante ese periodo
- [x] Metodo de prorrateo: proporcional al area ocupada. Cada batch tiene `zone_id` → area en m2. El prorrateo es `(area_batch / area_total_facility) * costo_periodo`
- [x] Si un batch estuvo activo solo parte del periodo (inicio o fin dentro del mes), se prorratea tambien por dias: `(dias_activo / dias_periodo) * proporcion_area`
- [x] Los `cost_entries` generados tienen `crop_phase` basado en la fase del batch al momento del prorrateo
- [x] Si no hay batches activos, el costo queda como overhead sin asignar (sin `batch_id`)
- [x] Un batch se considera "activo" si su `status` es `active` y tiene `start_date` <= fin del periodo
- [x] Mutation para re-calcular prorrateo si se corrige una lectura (borra cost_entries anteriores de ese periodo+tipo y recalcula)

#### Backend
- Mutation: `utilities.allocateToActiveBatches(readingId)` — logica de prorrateo
- Query: necesita areas (m2) de cada batch activo via `batches.zone_id` → `areas.dimensions`
- Helper: `getAllocatedBatches(ctx, facilityId, periodStart, periodEnd)` — retorna batches con su area y dias activos

#### Frontend
- Indicador en tabla de lecturas: "Prorrateado a N batches" o "Sin batches activos"

#### Dependencias
- US-COGS.3 (lecturas de utilities)

---

### US-COGS.5: Registro de depreciacion de equipos

**Como** administrador de instalacion
**quiero** registrar equipos con su valor de adquisicion, vida util y depreciacion mensual
**para** incluir la depreciacion en el COGS de los batches que usan esos equipos

#### Criterios de Aceptacion
- [x] Nuevos campos opcionales en `products` (donde `category === "equipment"`): `acquisition_value`, `useful_life_months`, `salvage_value`, `depreciation_method` (default: "straight_line")
- [x] Depreciacion mensual calculada: `(acquisition_value - salvage_value) / useful_life_months`
- [x] Al registrar lectura de utilities mensual, se ejecuta tambien el calculo de depreciacion de equipos activos en la facility
- [x] Genera `cost_entries` tipo `depreciation` para cada equipo, prorrateado entre batches activos igual que utilities (por area)
- [x] Product form para equipos muestra seccion "Depreciacion" con campos: Valor de adquisicion, Vida util (meses), Valor residual, Metodo (solo linea recta por ahora)
- [x] Solo se deprecian equipos con `lot_status !== "discontinued"` y con `acquisition_value > 0`

#### Backend
- Schema: `products` — agregar `acquisition_value: v.optional(v.number())`, `useful_life_months: v.optional(v.number())`, `salvage_value: v.optional(v.number())`, `depreciation_method: v.optional(v.string())`
- Mutation: `utilities.calculateDepreciation(facilityId, period)` — calcula y crea cost_entries
- Query: `products.getEquipmentWithDepreciation(facilityId)` — lista equipos con depreciacion mensual calculada

#### Frontend
- Componente: seccion en product-form.tsx condicional a `category === "equipment"`
- Componente: tabla de equipos con depreciacion en facility page

#### Dependencias
- US-COGS.4 (usa el mismo mecanismo de prorrateo)

---

### US-COGS.6: COGS completo expandido con tabs por tipo de costo

**Como** gerente de operaciones
**quiero** ver el COGS completo de un batch desglosado por tipo de costo (insumos, mano de obra, utilities, depreciacion)
**para** entender la estructura real de costos y optimizar recursos

#### Criterios de Aceptacion
- [x] Query `inventory.getFullCostByBatch(batchId)` que combina: insumos (de `inventory_transactions`) + labor + utilities + depreciacion (de `cost_entries`)
- [x] Retorna estructura con 4 secciones: `materials`, `labor`, `utilities`, `depreciation`, cada una con subtotal y detalle
- [x] Resumen superior muestra: COGS total, COGS por unidad de output (si hay cosecha), y porcentaje de cada componente
- [x] UI con 4 tabs + tab "Resumen":
  - **Resumen:** Proporcion bar con porcentaje de cada tipo + KPIs (total, por tipo)
  - **Insumos:** Tabla con: Fecha, Producto, Fase, Cantidad, Costo/Unidad, Total
  - **Mano de Obra:** Tabla con: Fecha, Actividad, Usuario, Rol, Horas, Tarifa, Costo
  - **Utilities:** Tabla con: Periodo, Tipo (electricidad/agua/gas), Consumo total facility, Proporcion batch, Costo asignado
  - **Depreciacion:** Tabla con: Equipo, Valor mensual, Proporcion batch, Costo asignado
- [x] Si un tipo no tiene datos, el tab muestra estado vacio con mensaje "No hay registros de [tipo] para este batch"
- [x] El batch-cost-summary.tsx creado como componente con tabs integrado en batch detail page

#### Backend
- Query: `inventory.getFullCostByBatch` — combina getCostByBatch actual + query a cost_entries agrupado por cost_type
- La query actual `getCostByBatch` se mantiene como esta (no breaking change)

#### Frontend
- Componente: refactorizar `components/batches/batch-cost-summary.tsx` — agregar tabs
- Componente: `components/batches/cost-tab-labor.tsx` (NUEVO)
- Componente: `components/batches/cost-tab-utilities.tsx` (NUEVO)
- Componente: `components/batches/cost-tab-depreciation.tsx` (NUEVO)
- Componente: `components/batches/cost-tab-summary.tsx` (NUEVO) — resumen con proporciones

#### Dependencias
- US-COGS.2 (labor costs), US-COGS.4 (utilities), US-COGS.5 (depreciacion)

---

## Schema Changes

### Nueva tabla: `cost_entries`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `facility_id` | `v.id("facilities")` | Facility donde se genero el costo |
| `batch_id` | `v.optional(v.id("batches"))` | Batch asociado (null = overhead sin asignar) |
| `cost_type` | `v.string()` | `labor` / `utility_electricity` / `utility_water` / `utility_gas` / `depreciation` |
| `crop_phase` | `v.optional(v.string())` | Fase del cultivo cuando se genero |
| `activity_id` | `v.optional(v.id("activities"))` | Actividad que genero el costo (labor) |
| `source_id` | `v.optional(v.string())` | ID de referencia (utility_reading_id o product_id para equipo) |
| `cost_total` | `v.number()` | Costo en moneda local |
| `cost_currency` | `v.string()` | ISO 4217 (COP, USD) |
| `period` | `v.optional(v.string())` | Periodo (YYYY-MM) para utilities y depreciacion |
| `details` | `v.optional(v.any())` | Metadata especifica del tipo (horas, tarifa, lectura, equipo, etc.) |
| `performed_by` | `v.optional(v.id("users"))` | Usuario (para labor) |
| `created_at` | `v.number()` | Timestamp |

**Indices:** `by_batch_id` (batch_id), `by_facility` (facility_id), `by_cost_type` (cost_type), `by_period` (period)

### Nueva tabla: `utility_readings`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `facility_id` | `v.id("facilities")` | Facility |
| `utility_type` | `v.string()` | `electricity` / `water` / `gas` |
| `period` | `v.string()` | Formato YYYY-MM |
| `reading_previous` | `v.number()` | Lectura anterior del medidor |
| `reading_current` | `v.number()` | Lectura actual del medidor |
| `consumption` | `v.number()` | reading_current - reading_previous |
| `consumption_unit` | `v.string()` | kWh / m3 / galones |
| `cost_total` | `v.number()` | Costo total del periodo |
| `cost_currency` | `v.string()` | ISO 4217 |
| `allocation_status` | `v.string()` | `pending` / `allocated` / `no_batches` |
| `notes` | `v.optional(v.string())` | Notas |
| `recorded_by` | `v.id("users")` | Quien registro |
| `created_at` | `v.number()` | Timestamp |

**Indices:** `by_facility` (facility_id), `by_period` (period), `by_type_period` (utility_type, period)

### Campos nuevos en tablas existentes

| Tabla | Campo | Tipo | US |
|-------|-------|------|-----|
| `roles` | `hourly_rate` | `v.optional(v.number())` | COGS.1 |
| `roles` | `rate_currency` | `v.optional(v.string())` | COGS.1 |
| `products` | `acquisition_value` | `v.optional(v.number())` | COGS.5 |
| `products` | `useful_life_months` | `v.optional(v.number())` | COGS.5 |
| `products` | `salvage_value` | `v.optional(v.number())` | COGS.5 |
| `products` | `depreciation_method` | `v.optional(v.string())` | COGS.5 |

**Total: 2 tablas nuevas, 6 campos opcionales en 2 tablas existentes.**

## Consideraciones Tecnicas

- **Backward compatible:** Todos los campos nuevos son `v.optional()`. La tabla `cost_entries` es aditiva. `getCostByBatch` sigue funcionando como antes
- **Separacion de concerns:** `cost_entries` es independiente de `inventory_transactions`. Los insumos siguen en transactions; labor/utilities/depreciation van en cost_entries. La query `getFullCostByBatch` combina ambas fuentes
- **Prorrateo simplificado:** Se usa area ocupada como proxy de consumo. No es perfecto (un batch bajo luces HPS consume mas electricidad que uno al sol), pero es el estandar contable para agricultura y evita la complejidad de sub-metering
- **Performance:** `getFullCostByBatch` hace 2 queries (transactions + cost_entries) y combina en memoria. Con indices por batch_id, deberia ser rapido
- **Riesgo:** Las mutations de activities.ts son las mas grandes del proyecto (~1900 lineas). Los cambios para labor cost deben ser quirurgicos — un helper externo que se llama al final de cada mutation
- **activities.ts:** El calculo de labor cost se implementa como helper separado llamado al final de cada mutation que registra `duration_minutes`, no como logica interna de las mutations
- **Depreciacion:** Solo linea recta por ahora. Si se necesitan otros metodos (declining balance, units of production), se agregan al `depreciation_method` en el futuro

## Out of Scope

- **Empaque y etiquetado** — No hay flujo de packing implementado. Se agrega cuando exista un modulo de ordenes de empaque
- **Servicios externos** — Lab testing, consultoria, certificaciones. Requiere UI de gastos/facturas que no existe. Feature separada
- **Mano de obra por tarea/rendimiento** — El modelo de referencia propone tracking de plantas/hora o kg/hora por tarea. Es optimizacion avanzada, no day-1 para COGS
- **IoT / medidores automaticos** — Integracion con sensores para lecturas automaticas de energia/agua. Requiere infraestructura IoT
- **Costos variables de energia por franja horaria** — Tarifas electricas que cambian por hora del dia
- **Depreciacion acelerada o por unidades de produccion** — Solo linea recta en esta iteracion
- **Sub-metering por zona** — Medir consumo electrico por zona (ej: luces de un cuarto vs otro). Actualmente se prorratea por area
- **WACC / valoracion de inventario avanzada** — Reportes financieros de valoracion (WACC, FIFO cost layers). Feature separada
- **Mano de obra externa / contratistas** — Solo usuarios del sistema con rol asignado
- **Retroactividad** — No se generan cost_entries para actividades historicas. Solo aplica a datos nuevos

---

## Implementacion

### Commits

- `35f57d7` feat(cogs): US-COGS.1 add hourly rate to roles for labor costing
- `01cfe8d` feat(cogs): US-COGS.2 add auto labor cost calculation
- `41430cd` feat(cogs): US-COGS.3 add utility readings with UI
- `ba3de5e` feat(cogs): US-COGS.4 add utility cost allocation to batches
- `d1db091` feat(cogs): US-COGS.5 add equipment depreciation tracking
- `22eb273` feat(cogs): US-COGS.6 add full COGS UI with tabs by cost type

### Archivos Modificados

- `convex/schema.ts` — Added cost_entries, utility_readings tables + depreciation fields in products + hourly_rate in roles
- `convex/helpers.ts` — Added calculateLaborCost, createLaborCostEntry helpers
- `convex/activities.ts` — Hooked labor cost into log() and completeScheduledActivity()
- `convex/utilities.ts` — NEW: createReading, getByFacility, updateReading, deleteReading, allocateToActiveBatches, calculateDepreciation
- `convex/roles.ts` — Added hourly_rate/rate_currency to returns + updateRate mutation
- `convex/products.ts` — Added depreciation fields to create/update mutations
- `convex/inventory.ts` — Added getFullCostByBatch query
- `lib/validations/product.ts` — Added depreciation fields to Zod schema
- `components/facilities/utility-reading-modal.tsx` — NEW
- `components/facilities/utility-readings-table.tsx` — NEW
- `components/batches/batch-cost-summary.tsx` — NEW
- `components/products/product-form.tsx` — Added depreciation section for equipment
- `components/products/product-create-modal.tsx` — Pass depreciation fields
- `app/(dashboard)/settings/system/page.tsx` — Added "Tarifas por Rol" card
- `app/(dashboard)/facilities/[id]/page.tsx` — Added "Utilities" tab
- `app/(dashboard)/batches/[id]/page.tsx` — Added "Costos" tab
- `app/(dashboard)/products/[id]/edit/product-edit-content.tsx` — Pass depreciation fields

### Fecha de Completado

2026-02-10
