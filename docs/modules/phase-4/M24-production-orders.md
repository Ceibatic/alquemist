# Module 24: Production Orders

## Overview

El modulo de Ordenes de Produccion permite crear y gestionar ordenes de trabajo basadas en templates de produccion. Una orden de produccion representa un ciclo de cultivo planificado, desde la siembra hasta la cosecha, y genera automaticamente las actividades y batches correspondientes segun el template seleccionado.

**Estado**: ✅ Implementado (Backend + Frontend)

---

## Implementacion Actual

### Backend (Convex)

**Archivo**: `convex/productionOrders.ts`

#### Queries Implementadas
| Funcion | Descripcion |
|---------|-------------|
| `list` | Lista ordenes con filtros por company, facility, status |
| `getById` | Detalle completo con fases, batches, stats |
| `getActivities` | Actividades programadas de la orden |
| `getByFacility` | Ordenes por instalacion para calendario |

#### Mutations Implementadas
| Funcion | Descripcion |
|---------|-------------|
| `create` | Crea orden + fases + scheduled_activities desde template |
| `update` | Actualiza datos basicos de orden |
| `activate` | Aprueba orden, crea batches, actualiza activities |
| `completePhase` | Completa fase y activa siguiente |
| `cancel` | Cancela orden y activities pendientes |

### Flujo de Creacion de Orden

```
1. CREAR ORDEN (Admin)
   └── productionOrders.create({templateId, facilityId, ...})
       ├── Genera order_phases desde template_phases
       ├── Genera scheduled_activities con algoritmos de timing:
       │   ├── one_time: phaseStart + (phaseDay - 1) * DAY_MS
       │   ├── daily_range: instancia por cada dia del rango
       │   ├── specific_days: filtrado por dias de semana
       │   ├── every_n_days: intervalos regulares
       │   └── dependent: phaseStart + daysAfter * DAY_MS
       └── Status: "planning"

2. APROBAR ORDEN (Manager)
   └── productionOrders.activate({orderId, approvedBy, targetAreaId})
       ├── Crea N batches: ceil(requested_quantity / batch_size)
       ├── Actualiza scheduled_activities.entity_type: "batch"
       ├── Activa primera fase
       └── Status: "active"

3. COMPLETAR FASES (Operador)
   └── productionOrders.completePhase({orderId, phaseId})
       ├── Marca fase como completada
       ├── Activa siguiente fase
       └── Si es ultima fase: order.status = "completed"
```

### Frontend

**Archivo**: `app/(dashboard)/production-orders/[id]/page.tsx`

**Tabs implementados**:
- **Detalle**: Info general, cantidades, fechas
- **Fases**: Timeline de fases con boton "Completar"
- **Batches**: Lista de lotes creados con navegacion
- **Actividades**:
  - Scheduled activities con boton "Completar"
  - Historial de activities ejecutadas

---

## User Stories

### US-24.1: Ver lista de ordenes de produccion
**Como** administrador de produccion
**Quiero** ver todas las ordenes de produccion activas
**Para** monitorear el estado general de la operacion

**Criterios de Aceptacion:**
- [ ] Grid/tabla de ordenes de produccion
- [ ] Filtros: estado (planning, active, completed, cancelled), template, instalacion, fecha
- [ ] Cada orden muestra: codigo, template usado, fecha inicio, fecha estimada fin, batches activos, progreso %
- [ ] Badge de estado con color (azul=planning, verde=active, gris=completed)
- [ ] Search por codigo o template
- [ ] Cards clickeables navegan a `/production-orders/[id]`
- [ ] Stats: Ordenes activas, Progreso promedio, Batches totales, Cosecha estimada
- [ ] Estado vacio: icono + mensaje + CTA "Crear Orden"

**Consulta:** `productionOrders.list({ companyId, facilityId?, status?, templateId? })`

**Componentes:** `app/(dashboard)/production-orders/page.tsx`, `components/production-orders/order-list.tsx`

---

### US-24.2: Crear orden de produccion
**Como** administrador de produccion
**Quiero** crear una nueva orden de produccion
**Para** iniciar un ciclo de cultivo

**Criterios de Aceptacion:**
- [ ] Boton "Nueva Orden" abre wizard multi-paso
- [ ] **Paso 1 - Seleccionar Template:**
  - Lista de templates activos de la empresa
  - Filtro por tipo de cultivo
  - Preview de template seleccionado (fases, duracion)
- [ ] **Paso 2 - Configuracion:**
  - Codigo de orden (auto-generado o custom)
  - Fecha de inicio planificada*
  - Instalacion* (select de facilities)
  - Area inicial* (select de areas compatibles)
  - Cultivar especifico (si template no lo especifica)
- [ ] **Paso 3 - Batch Inicial:**
  - Cantidad de plantas* (default del template)
  - Tipo de lote: produccion, madre, investigacion
  - Fuente de material: semilla, clon, compra
  - Proveedor (si aplica)
  - Codigo de lote (auto-generado)
- [ ] **Paso 4 - Revision:**
  - Resumen de orden
  - Actividades que se generaran
  - Costo estimado
  - Confirmar o editar
- [ ] Orden se crea como `status: planning`
- [ ] Se genera batch inicial automaticamente
- [ ] Se programan actividades de la primera fase
- [ ] Toast de exito al crear

**Escribe:** `productionOrders.create({ templateId, facilityId, areaId, startDate, initialBatchSize, ... })`

**Componentes:** `components/production-orders/order-wizard.tsx`

---

### US-24.3: Ver detalle de orden de produccion
**Como** administrador de produccion
**Quiero** ver el detalle completo de una orden
**Para** monitorear progreso y tomar decisiones

**Criterios de Aceptacion:**
- [ ] Pagina `/production-orders/[id]` con informacion completa
- [ ] Header con codigo, estado, progreso visual
- [ ] Botones: Editar, Activar, Cancelar (segun estado)
- [ ] Breadcrumb: Inicio > Ordenes > [Codigo]
- [ ] **Tab Resumen:**
  - Info del template usado
  - Fechas: inicio real, fin estimado, fin real
  - Progreso por fase (barra visual)
  - KPIs: plantas activas, mortalidad, rendimiento proyectado
- [ ] **Tab Batches:**
  - Lista de batches de la orden
  - Estado de cada batch
  - Boton agregar batch adicional
- [ ] **Tab Timeline:**
  - Vista Gantt de fases
  - Actividades completadas vs pendientes
  - Indicadores de retraso
- [ ] **Tab Actividades:**
  - Lista de actividades programadas
  - Filtro por fase, tipo, estado
  - Quick complete desde la lista
- [ ] **Tab Costos:**
  - Desglose de costos por categoria
  - Costo real vs estimado
  - Proyeccion de rentabilidad

**Consulta:** `productionOrders.getById({ orderId })` con batches y actividades

**Componentes:** `app/(dashboard)/production-orders/[id]/page.tsx`

---

### US-24.4: Activar orden de produccion
**Como** administrador de produccion
**Quiero** activar una orden en estado planning
**Para** iniciar el ciclo de produccion

**Criterios de Aceptacion:**
- [ ] Boton "Activar" disponible solo si `status: planning`
- [ ] Validaciones antes de activar:
  - Area asignada tiene capacidad disponible
  - Inventario de materiales disponible
  - Fecha de inicio <= hoy
- [ ] Al activar:
  - `status` cambia a `active`
  - `actual_start_date` se registra
  - Batch inicial pasa a `active`
  - Primera fase se marca como `in_progress`
  - Actividades de fase 1 se programan con fechas reales
- [ ] Toast de confirmacion
- [ ] Notificacion a usuarios asignados

**Escribe:** `productionOrders.activate({ orderId })`

---

### US-24.5: Avanzar fase de produccion
**Como** operador de produccion
**Quiero** completar una fase y avanzar a la siguiente
**Para** mantener el flujo de produccion

**Criterios de Aceptacion:**
- [ ] Boton "Completar Fase" en fase activa
- [ ] Modal de confirmacion con:
  - Checklist de criterios de completitud
  - Actividades pendientes (warning si hay)
  - Control de calidad final (si requerido)
- [ ] Al completar fase:
  - Fase actual: `status: completed`, `actual_end_date` registrado
  - Siguiente fase: `status: in_progress`
  - Actividades de nueva fase se programan
  - Movimiento de plantas (si requiere cambio de area)
- [ ] Si es la ultima fase:
  - Orden pasa a `status: completed`
  - Batch pasa a cosecha

**Escribe:** `productionOrders.completePhase({ orderId, phaseId, completionData })`

---

### US-24.6: Cancelar orden de produccion
**Como** administrador de produccion
**Quiero** cancelar una orden
**Para** terminar ciclos fallidos o no viables

**Criterios de Aceptacion:**
- [ ] Boton "Cancelar" con confirmacion
- [ ] Razon de cancelacion requerida (select + textarea)
- [ ] Al cancelar:
  - Orden: `status: cancelled`, `cancellation_reason`
  - Batches activos: opcion de archivar o mantener para rescate
  - Actividades pendientes se cancelan
- [ ] Registro en historial
- [ ] Liberacion de areas asignadas

**Escribe:** `productionOrders.cancel({ orderId, reason, archiveBatches })`

---

### US-24.7: Programar actividades
**Como** operador de produccion
**Quiero** ver y gestionar actividades programadas
**Para** ejecutar el plan de produccion

**Criterios de Aceptacion:**
- [ ] Calendario de actividades por fecha
- [ ] Vista: dia, semana, mes
- [ ] Filtro por orden, batch, tipo de actividad
- [ ] Cada actividad muestra: hora, tipo, batch, instrucciones
- [ ] Click abre modal de ejecucion
- [ ] Drag & drop para reprogramar (con limites)
- [ ] Indicadores de vencidas (rojo) y proximas (amarillo)
- [ ] Bulk complete para actividades recurrentes

**Consulta:** `scheduledActivities.list({ companyId, dateRange, orderId?, batchId? })`

**Componentes:** `app/(dashboard)/activities/page.tsx`, `components/activities/activity-calendar.tsx`

---

### US-24.8: Ejecutar actividad
**Como** operador de produccion
**Quiero** registrar la ejecucion de una actividad
**Para** mantener trazabilidad del proceso

**Criterios de Aceptacion:**
- [ ] Modal/drawer de ejecucion de actividad
- [ ] Info: instrucciones, materiales requeridos, notas de seguridad
- [ ] Campos a completar:
  - Fecha/hora de ejecucion (default: ahora)
  - Ejecutado por (default: usuario actual)
  - Materiales usados (con cantidades)
  - Notas/observaciones
  - Fotos (opcional)
- [ ] Si actividad es quality check: enlaza a formulario QC
- [ ] Validaciones segun tipo de actividad
- [ ] Al completar:
  - Actividad: `status: completed`
  - Inventario se descuenta (si aplica)
  - Batch se actualiza (si aplica)
- [ ] Generar siguiente si es recurrente

**Escribe:** `scheduledActivities.complete({ activityId, executionData })`

---

## Schema

### Tabla: `production_orders`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa |
| `facility_id` | `id("facilities")` | Instalacion |
| `template_id` | `id("production_templates")` | Template base |
| `order_code` | `string` | Codigo unico |
| `cultivar_id` | `id("cultivars")` | Cultivar |
| `planned_start_date` | `number` | Fecha inicio planificada |
| `actual_start_date` | `number?` | Fecha inicio real |
| `estimated_end_date` | `number?` | Fecha fin estimada |
| `actual_end_date` | `number?` | Fecha fin real |
| `current_phase_id` | `id("order_phases")?` | Fase actual |
| `total_plants_planned` | `number` | Plantas planificadas |
| `total_plants_actual` | `number` | Plantas activas |
| `estimated_yield` | `number?` | Rendimiento estimado |
| `actual_yield` | `number?` | Rendimiento real |
| `estimated_cost` | `number?` | Costo estimado |
| `actual_cost` | `number?` | Costo real |
| `progress_percentage` | `number` | Progreso 0-100 |
| `status` | `string` | planning/active/completed/cancelled |
| `cancellation_reason` | `string?` | Razon de cancelacion |
| `created_by` | `id("users")` | Creador |
| `created_at` | `number` | Timestamp |
| `updated_at` | `number` | Timestamp |

### Tabla: `order_phases`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `order_id` | `id("production_orders")` | Orden padre |
| `template_phase_id` | `id("template_phases")` | Fase del template |
| `phase_name` | `string` | Nombre |
| `phase_order` | `number` | Orden |
| `planned_start_date` | `number` | Inicio planificado |
| `actual_start_date` | `number?` | Inicio real |
| `planned_end_date` | `number` | Fin planificado |
| `actual_end_date` | `number?` | Fin real |
| `area_id` | `id("areas")?` | Area asignada |
| `status` | `string` | pending/in_progress/completed/skipped |
| `completion_notes` | `string?` | Notas de completitud |
| `created_at` | `number` | Timestamp |

### Tabla: `scheduled_activities`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `order_id` | `id("production_orders")` | Orden |
| `phase_id` | `id("order_phases")` | Fase |
| `batch_id` | `id("batches")?` | Batch (si aplica) |
| `template_activity_id` | `id("template_activities")?` | Actividad del template |
| `activity_name` | `string` | Nombre |
| `activity_type` | `string` | Tipo de actividad |
| `scheduled_date` | `number` | Fecha programada |
| `scheduled_time` | `string?` | Hora programada |
| `executed_date` | `number?` | Fecha ejecucion |
| `executed_by` | `id("users")?` | Ejecutor |
| `materials_used` | `array` | Materiales usados |
| `notes` | `string?` | Notas |
| `photos` | `array<string>` | URLs de fotos |
| `quality_check_id` | `id("quality_checks")?` | QC asociado |
| `is_recurring` | `boolean` | Es recurrente |
| `recurrence_parent_id` | `id("scheduled_activities")?` | Actividad padre |
| `status` | `string` | pending/in_progress/completed/skipped/overdue |
| `company_id` | `id("companies")` | Empresa |
| `created_at` | `number` | Timestamp |

---

## Estados de Orden

| Estado | Descripcion | Acciones Disponibles |
|--------|-------------|---------------------|
| `planning` | En planificacion | Editar, Activar, Cancelar |
| `active` | En produccion | Completar fase, Agregar batch, Cancelar |
| `completed` | Finalizada | Ver historial |
| `cancelled` | Cancelada | Ver historial |

---

## Estados de Fase

| Estado | Descripcion |
|--------|-------------|
| `pending` | Aun no iniciada |
| `in_progress` | En ejecucion |
| `completed` | Completada |
| `skipped` | Omitida |

---

## Estados de Actividad

| Estado | Descripcion |
|--------|-------------|
| `pending` | Programada para futuro |
| `in_progress` | En ejecucion |
| `completed` | Completada |
| `skipped` | Omitida |
| `overdue` | Vencida sin completar |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M22-Templates | Padre | Template define estructura |
| M25-Batches | Hijo | Orden contiene batches |
| M08-Areas | Referencia | Fases usan areas |
| M19-Inventory | Consumo | Actividades consumen inventario |
| M23-Quality Checks | Referencia | Actividades QC |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `companyId, facilityId?, status?` | Order[] |
| `getById` | `orderId` | Order con fases, batches |
| `getOrderActivities` | `orderId, status?` | Activity[] |
| `getCalendar` | `companyId, dateRange` | Activity[] agrupadas |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `templateId, facilityId, startDate, ...` | template existe, area compatible |
| `activate` | `orderId` | status=planning, area disponible |
| `completePhase` | `orderId, phaseId, data` | fase in_progress |
| `cancel` | `orderId, reason` | status!=completed |
| `scheduledActivities.complete` | `activityId, data` | status=pending/in_progress |

---

## Notas de Implementacion

### Generacion de Actividades
- Al crear orden: generar actividades de fase 1
- Al activar orden: calcular fechas reales basado en fecha inicio
- Al completar fase: generar actividades de siguiente fase
- Actividades recurrentes: generar todas las instancias al inicio de fase

### Calculo de Progreso
```typescript
progress = (diasTranscurridos / duracionTotalEstimada) * 100
// Ajustado por fases completadas
```

### Codigos de Orden
```typescript
// Formato: ORD-{YYYY}-{secuencial}
// Ejemplo: ORD-2025-0042
```
