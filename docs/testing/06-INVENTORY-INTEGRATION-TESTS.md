# ALQUEMIST - INVENTORY INTEGRATION TESTS

## Propósito

Este documento proporciona casos de prueba end-to-end para validar las **integraciones** entre el módulo de Inventory Management (M19) y los módulos dependientes:

- **Batches (M25)**: Creación de lotes, transformaciones, cosechas
- **Plants (M26)**: Clonación, transiciones de fase, cosecha individual
- **Activities**: Consumo de materiales en actividades de producción
- **Products (M22)**: Relación producto → inventory items

Estos tests asumen que tanto M19 como los módulos dependientes están completamente implementados.

## Flujo General de Integración

```
Products (M22) ────┐
                   ├──> Inventory (M19) ──┐
Suppliers (M11) ───┘                      │
                                          ├──> Activities (consume materials)
Batches (M25) ────────────────────────────┤
                                          │
Plants (M26) ─────────────────────────────┘
```

## Entorno de Testing

Usar los mismos datos de prueba de `00-TESTING-OVERVIEW.md`:
- **Empresa**: Test Farm SA
- **Facility**: North Greenhouse
- **Usuario**: admin@ceibatic.com (Company Owner)

## Precondiciones Generales

Antes de ejecutar estos tests, deben estar completados:
- **Phase 1**: Empresa y facility creados
- **Phase 2**: Áreas, cultivares, proveedores, productos e inventario inicial
- **M19**: Al menos 5 inventory items de diferentes categorías (nutrientes, sustrato, plantas)

---

## Test 6.1: Batch Creation → Inventory Receipt

**Objetivo**: Verificar que al crear un batch desde el módulo de Batches, se genera automáticamente un inventory item vinculado.

**Precondiciones**:
- Módulo de Batches (M25) implementado
- Al menos 1 producto tipo "Clone" o "Seedling" registrado
- Usuario con permisos de creación de batches

**Pasos**:

1. Navegar a `/batches`
2. Click en "Crear Batch"
3. Completar formulario:
   - Product: "Cherry AK Clone" (producto tipo Clone)
   - Quantity: 50 esquejes
   - Source: "Mother Plant 001"
   - Created Date: Hoy
4. Guardar batch
5. Navegar a `/inventory`
6. Buscar el batch_number recién creado

**Resultados Esperados**:
- ✅ Batch creado exitosamente con estado "active"
- ✅ Inventory item automáticamente generado con:
  - `product_id` = producto seleccionado
  - `batch_number` = el generado por el batch (ej: "CLO-2026-001")
  - `quantity_available` = 50
  - `transformation_status` = "active"
  - `source_batch_id` = ID del batch creado
- ✅ Primera actividad en historial: "Recepción" (movement_type: "receipt")
- ✅ Consumo posterior de este item reduce `quantity_available` del batch

**Notas**:
- Esta integración usa `activities.logInventoryMovement({ movement_type: "receipt" })`
- El batch_number debe estar en formato LOT_PREFIXES según categoría del producto

---

## Test 6.2: Batch Transformation → Inventory Phase Transition

**Objetivo**: Validar que las transformaciones de batch (ej: clones → plántulas) crean nuevos inventory items y actualizan el estado del origen.

**Precondiciones**:
- Test 6.1 completado (batch de clones activo)
- Inventario del batch origen con quantity_available ≥ 20

**Pasos**:

1. Navegar a `/batches`
2. Seleccionar el batch de clones creado en Test 6.1
3. Click en "Registrar Transformación"
4. Completar formulario:
   - Transformation Type: "Clone → Seedling"
   - Source Quantity: 20 clones
   - Destination Quantity: 18 plántulas (pérdida del 10%)
   - Transformation Date: Hoy
   - Notes: "Enraizamiento exitoso, 2 clones no prendieron"
5. Guardar transformación
6. Navegar a `/inventory`
7. Buscar el batch_number origen y el nuevo generado

**Resultados Esperados**:
- ✅ Batch origen actualizado:
  - `quantity_available` reducida en 20 (de 50 → 30)
  - `transformation_status` = "active" (aún tiene stock)
- ✅ Nuevo batch destino creado:
  - `batch_number` = nuevo (ej: "PLT-2026-001")
  - `quantity_available` = 18
  - `product_id` = producto tipo "Seedling"
  - `transformation_status` = "active"
  - `source_batch_id` = batch origen
- ✅ Actividad en historial del origen:
  - Tipo: "Transformación"
  - Quantity: -20
  - Resultado: "→ 18 plántulas (PLT-2026-001)"
  - Link clickeable al nuevo item
- ✅ Actividad en historial del destino:
  - Tipo: "Transformación" (como origen)
  - Quantity: +18
  - Origen: "← 20 clones (CLO-2026-001)"

**Notas**:
- Usa `activities.logPhaseTransitionWithInventory()`
- El waste (2 clones perdidos) debe estar registrado en `materials_consumed`

---

## Test 6.3: Batch Harvest → Inventory Material Creation

**Objetivo**: Verificar que al cosechar un batch de plantas en floración, se genera inventory de material vegetal (flores secas).

**Precondiciones**:
- Batch de plantas en estado "flowering" con quantity_available ≥ 10
- Producto tipo "Dried Flower" registrado

**Pasos**:

1. Navegar a `/batches`
2. Seleccionar batch en floración (ej: "PLT-2026-001" → transicionado a flowering)
3. Click en "Registrar Cosecha"
4. Completar formulario:
   - Plants Harvested: 10 plantas
   - Fresh Weight: 5000g (500g por planta promedio)
   - Expected Dry Weight: 1000g (ratio 5:1)
   - Harvest Date: Hoy
   - Destination Product: "Cherry AK Dried Flower"
5. Guardar cosecha
6. Navegar a `/inventory`
7. Buscar el nuevo batch de flores secas

**Resultados Esperados**:
- ✅ Batch de plantas actualizado:
  - `quantity_available` reducida en 10
  - Si llega a 0, `transformation_status` = "harvested"
- ✅ Nuevo inventory item creado:
  - `batch_number` = nuevo con prefijo MAT (ej: "MAT-2026-001")
  - `product_id` = "Cherry AK Dried Flower"
  - `quantity_available` = 1000g
  - `unit` = "g"
  - `transformation_status` = "active"
  - `source_batch_id` = batch de plantas cosechadas
- ✅ Actividad en historial de plantas:
  - Tipo: "Cosecha"
  - Quantity: -10
  - Resultado: "→ 1000g flores secas (MAT-2026-001)"
- ✅ Actividad en historial de flores:
  - Tipo: "Cosecha" (como origen)
  - Quantity: +1000
  - Origen: "← 10 plantas (PLT-2026-001)"

**Notas**:
- Usa `activities.logHarvest()`
- El fresh_weight debe estar en `materials_consumed` para trazabilidad
- El sistema debe calcular automáticamente el batch_number con prefijo MAT

---

## Test 6.4: Activity Consumption → Inventory Deduction (FIFO)

**Objetivo**: Validar que al registrar una actividad que consume materiales, se deduce del inventario usando lógica FIFO.

**Precondiciones**:
- Orden de producción activa con al menos 1 actividad pendiente
- 2 inventory items del mismo producto con fechas de recepción diferentes:
  - Item A: "Base Vegetativa A+B", 100L, recibido hace 10 días
  - Item B: "Base Vegetativa A+B", 100L, recibido hace 2 días

**Pasos**:

1. Navegar a la orden de producción activa
2. Seleccionar actividad "Fertilización Vegetativa"
3. Click en "Registrar Actividad"
4. Completar formulario:
   - Materials Consumed:
     - "Base Vegetativa A+B": 30L
   - Performed By: Juan López (Production Operator)
   - Completion Date: Hoy
   - Notes: "Aplicación en sistema de riego"
5. Guardar actividad
6. Navegar a `/inventory`
7. Verificar los 2 items de "Base Vegetativa A+B"

**Resultados Esperados**:
- ✅ Actividad registrada exitosamente
- ✅ FIFO aplicado correctamente:
  - Item A (más antiguo): `quantity_available` = 70L (consumió 30L)
  - Item B (más reciente): `quantity_available` = 100L (no tocado)
- ✅ Historial de Item A:
  - Nueva entrada "Consumo en Actividad"
  - Quantity: -30
  - Activity: Link a "Fertilización Vegetativa"
  - quantity_before: 100, quantity_after: 70
- ✅ Item B sin cambios en historial

**Notas**:
- Si Item A tuviera solo 20L, el sistema debería:
  - Consumir 20L de Item A (dejándolo en 0, status = "consumed")
  - Consumir 10L de Item B
- Verificar que la UI muestra advertencia de "Stock Bajo" si el total disponible < cantidad requerida

---

## Test 6.5: Activity Consumption → Multiple Materials with Warnings

**Objetivo**: Validar el consumo de múltiples materiales en una actividad con validación de stock insuficiente.

**Precondiciones**:
- Inventario con:
  - "Cal-Mag": 5L disponible
  - "pH Down": 2L disponible
  - "Base Vegetativa A+B": 50L disponible
- Actividad pendiente que requiere estos 3 materiales

**Pasos**:

1. Navegar a la actividad pendiente
2. Click en "Registrar Actividad"
3. Intentar agregar materiales:
   - "Cal-Mag": 10L (más de lo disponible)
   - "pH Down": 1L (dentro del stock)
   - "Base Vegetativa A+B": 20L (dentro del stock)
4. Guardar actividad

**Resultados Esperados**:
- ✅ Validación pre-submit:
  - Error en "Cal-Mag": "Stock insuficiente. Disponible: 5L"
  - Campo resaltado en rojo
  - Botón "Guardar" deshabilitado
- ✅ Usuario corrige a 5L en "Cal-Mag"
- ✅ Warning amber: "Esta cantidad consumirá todo el stock de Cal-Mag (5L)"
- ✅ Usuario confirma y guarda
- ✅ Actividad registrada exitosamente
- ✅ Inventario actualizado:
  - "Cal-Mag": 0L, status = "consumed"
  - "pH Down": 1L, status = "active"
  - "Base Vegetativa A+B": 30L, status = "active"
- ✅ Historial de cada item con entrada de consumo vinculada a la actividad

**Notas**:
- La validación de stock debe ser en tiempo real (no solo al guardar)
- El warning de consumo total debe ser claro pero no bloqueante

---

## Test 6.6: Plant Individual Tracking → Inventory Linkage

**Objetivo**: Verificar que plantas individuales (M26) consumen inventory items de clones/plántulas al crearse.

**Precondiciones**:
- Módulo de Plants (M26) implementado
- Inventory item de "Cherry AK Clone" con quantity_available ≥ 10
- Área "Propagation Room" creada

**Pasos**:

1. Navegar a `/plants`
2. Click en "Agregar Planta"
3. Completar formulario:
   - Source Inventory Item: Seleccionar "Cherry AK Clone" (batch CLO-2026-001)
   - Quantity: 1 clone
   - Destination Area: "Propagation Room"
   - Plant Tag: "CHR-001"
   - Creation Date: Hoy
4. Guardar planta
5. Navegar a `/inventory`
6. Verificar el inventory item de clones

**Resultados Esperados**:
- ✅ Planta creada exitosamente con:
  - `plant_tag` = "CHR-001"
  - `source_inventory_item_id` = ID del batch de clones
  - `current_phase` = "clone"
  - `status` = "active"
- ✅ Inventory item actualizado:
  - `quantity_available` reducida en 1
- ✅ Historial del inventory item:
  - Nueva entrada "Consumo en Planta"
  - Quantity: -1
  - Link a planta "CHR-001"
  - quantity_before: 10, quantity_after: 9

**Notas**:
- **CRITICAL GAP**: Este flujo requiere implementar `plants.create()` con consumo de inventario
- Actualmente M26 (Plants) solo está 20% implementado
- Este test fallará hasta que se implemente la integración Plants → Inventory

---

## Test 6.7: Plant Phase Transition → Inventory Consumption

**Objetivo**: Validar que al transicionar una planta de fase (ej: clone → seedling), se consume un espacio de inventario correspondiente.

**Precondiciones**:
- Test 6.6 completado (planta "CHR-001" creada)
- Planta en fase "clone" con al menos 14 días de edad
- Área "Vegetative Room" disponible

**Pasos**:

1. Navegar a `/plants`
2. Seleccionar planta "CHR-001"
3. Click en "Registrar Transición de Fase"
4. Completar formulario:
   - New Phase: "Seedling"
   - Destination Area: "Vegetative Room"
   - Transition Date: Hoy
   - Notes: "Raíces bien desarrolladas"
5. Guardar transición
6. Verificar cambios en planta e inventario

**Resultados Esperados**:
- ✅ Planta actualizada:
  - `current_phase` = "seedling"
  - `current_area_id` = "Vegetative Room"
  - Historial con entrada de transición
- ✅ **Inventario NO debería cambiar** en este caso:
  - Las transiciones de fase de plantas individuales no crean nuevos inventory items
  - Solo las transformaciones de batch (Test 6.2) generan nuevos items
- ✅ Actividad registrada vinculada a la planta (no a inventario)

**Notas**:
- Las plantas individuales rastrean su fase sin afectar inventario
- Solo cuando se cosecha una planta individual (Test 6.8) se genera inventory de material

---

## Test 6.8: Plant Harvest → Inventory Material Creation (Individual)

**Objetivo**: Verificar que al cosechar una planta individual, se genera inventory de material vegetal.

**Precondiciones**:
- Planta "CHR-001" en fase "flowering" con al menos 56 días en esta fase
- Producto "Cherry AK Dried Flower" registrado

**Pasos**:

1. Navegar a `/plants`
2. Seleccionar planta "CHR-001"
3. Click en "Registrar Cosecha"
4. Completar formulario:
   - Fresh Weight: 450g
   - Expected Dry Weight: 90g (ratio 5:1)
   - Harvest Date: Hoy
   - Destination Product: "Cherry AK Dried Flower"
   - Quality Notes: "Tricomas lechosos, cosecha óptima"
5. Guardar cosecha
6. Navegar a `/inventory`
7. Buscar el nuevo item de flores

**Resultados Esperados**:
- ✅ Planta actualizada:
  - `status` = "harvested"
  - `harvest_date` = hoy
  - `harvest_fresh_weight` = 450
  - `harvest_dry_weight` = 90
- ✅ Nuevo inventory item creado:
  - `batch_number` = nuevo con prefijo MAT (ej: "MAT-2026-002")
  - `product_id` = "Cherry AK Dried Flower"
  - `quantity_available` = 90g
  - `source_plant_id` = ID de "CHR-001"
  - `transformation_status` = "active"
- ✅ Historial del nuevo item:
  - Entrada "Cosecha Individual"
  - Origen: "← Planta CHR-001 (450g fresco)"
  - Link clickeable a la planta

**Notas**:
- **CRITICAL GAP**: Este flujo requiere implementar `plants.harvest()` con creación de inventario
- El sistema debe diferenciar entre cosecha de batch (Test 6.3) y cosecha individual
- Actualmente M26 no tiene esta funcionalidad implementada

---

## Test 6.9: Product → Inventory Items Relationship

**Objetivo**: Validar que un producto puede tener múltiples inventory items y que la UI refleja correctamente el stock total.

**Precondiciones**:
- Producto "Base Vegetativa A+B" registrado
- 3 inventory items de este producto con diferentes batch_numbers:
  - Item 1: 50L, batch BIO-2026-001, recibido hace 20 días
  - Item 2: 75L, batch BIO-2026-002, recibido hace 10 días
  - Item 3: 100L, batch BIO-2026-003, recibido hace 2 días

**Pasos**:

1. Navegar a `/products`
2. Seleccionar "Base Vegetativa A+B"
3. Verificar sección "Stock Actual"
4. Navegar a `/inventory`
5. Filtrar por producto "Base Vegetativa A+B"

**Resultados Esperados**:
- ✅ Vista de producto muestra:
  - **Stock Total**: 225L (suma de los 3 items)
  - **Lotes Activos**: 3
  - **Próximo a Vencer**: Item 1 (si tiene expiration_date más cercana)
  - Link a "Ver Inventario" que filtra en `/inventory`
- ✅ Vista de inventario muestra los 3 items:
  - Ordenados por fecha de recepción (FIFO order)
  - Cada uno con su batch_number único
  - Transformation_status = "active" en los 3
- ✅ Al consumir materiales en actividad, FIFO consume primero Item 1 (más antiguo)

**Notas**:
- Esta integración permite rastrear múltiples lotes del mismo producto
- Útil para control de calidad y recall de lotes específicos

---

## Test 6.10: Inventory Expiration → Automated Status Update

**Objetivo**: Verificar que inventory items con `expiration_date` pasada cambian automáticamente su estado a "expired".

**Precondiciones**:
- Inventory item de "Aceite de Neem" con:
  - `expiration_date` = Hace 1 día (fecha pasada)
  - `quantity_available` = 5L
  - `transformation_status` = "active"

**Pasos**:

1. Navegar a `/inventory`
2. Buscar "Aceite de Neem"
3. Verificar badge de estado
4. Intentar usar este item en una actividad

**Resultados Esperados**:
- ✅ Badge de estado muestra "Expirado" (rojo)
- ✅ En la lista de inventario, el item tiene indicador visual de expiración
- ✅ Al intentar usar en actividad:
  - Item NO aparece en el selector de materiales disponibles
  - O aparece con advertencia "Material expirado - No recomendado"
- ✅ Query `inventory.getActiveStock` NO incluye este item en el conteo total

**Notas**:
- **IMPORTANT GAP**: El sistema actualmente no valida automáticamente expiration_date
- Necesita implementar computed field o background job que actualice `transformation_status`
- Alternativa: validar en runtime en `inventory.getActiveStock` query

---

## Test 6.11: Inventory Hard Delete → Cascade Validation

**Objetivo**: Verificar que no se puede eliminar (hard delete) un inventory item si tiene dependencias activas.

**Precondiciones**:
- Inventory item "CLO-2026-001" con:
  - `quantity_available` = 0
  - `transformation_status` = "transformed"
  - Ha generado un batch destino "PLT-2026-001" que aún está activo
- Inventory item "NUT-2026-001" sin dependencias

**Pasos**:

1. Navegar a `/inventory`
2. Seleccionar "CLO-2026-001" (con dependencias)
3. Click en opciones → "Eliminar Permanentemente"
4. Confirmar eliminación
5. Repetir con "NUT-2026-001" (sin dependencias)

**Resultados Esperados**:
- ✅ Para "CLO-2026-001":
  - Toast de error: "No se puede eliminar. Este lote es origen de PLT-2026-001 que aún está activo."
  - Item permanece en la base de datos
- ✅ Para "NUT-2026-001":
  - Dialog de confirmación:
    ```
    ⚠️ Eliminar Permanentemente
    Esta acción es IRREVERSIBLE y eliminará:
    - El registro del inventario
    - Todo el historial de actividades
    - Los vínculos en reportes

    ¿Está seguro?
    ```
  - Al confirmar, item eliminado de la BD
  - Toast de éxito: "Lote NUT-2026-001 eliminado permanentemente"

**Notas**:
- Hard delete solo debe permitirse si:
  - `quantity_available` = 0
  - No tiene dependencias (no es source_batch_id de ningún item activo)
- Implementado en Test 6.11 del audit report

---

## Test 6.12: Bulk Inventory Receipt → Batch Processing

**Objetivo**: Validar la creación de múltiples inventory items en una sola operación de recepción masiva.

**Precondiciones**:
- Orden de compra con 5 productos de un proveedor
- Usuario con permisos de recepción

**Pasos**:

1. Navegar a `/inventory`
2. Click en "Recepción Masiva"
3. Completar formulario:
   - Proveedor: "FarmChem Inc"
   - Fecha de Recepción: Hoy
   - Productos:
     - Base Vegetativa A+B: 200L, lote BIO-2026-004
     - Base Floración A+B: 200L, lote BIO-2026-005
     - Cal-Mag: 50L, lote CAL-2026-001
     - pH Down: 25L, lote PHD-2026-001
     - pH Up: 25L, lote PHU-2026-001
4. Guardar recepción masiva
5. Verificar inventario creado

**Resultados Esperados**:
- ✅ 5 inventory items creados correctamente
- ✅ Cada uno con:
  - `batch_number` generado según prefijo de categoría
  - `received_date` = hoy
  - `supplier_id` = "FarmChem Inc"
  - `quantity_available` = cantidad especificada
  - Primera actividad en historial: "Recepción Masiva"
- ✅ Toast de éxito: "5 lotes agregados al inventario"
- ✅ Todos visibles en `/inventory` inmediatamente

**Notas**:
- Esta funcionalidad simplifica la recepción de órdenes de compra grandes
- Debe validar que no se dupliquen batch_numbers si se proporciona manual

---

## Test 6.13: Inventory Search → Advanced Filters

**Objetivo**: Validar que los filtros avanzados de inventario funcionan correctamente.

**Precondiciones**:
- Inventario con al menos 20 items de diferentes categorías, estados y fechas

**Pasos**:

1. Navegar a `/inventory`
2. Aplicar filtros:
   - **Producto**: "Base Vegetativa A+B"
   - **Estado**: "Activo"
   - **Categoría**: "Nutrientes"
   - **Proveedor**: "FarmChem Inc"
3. Verificar resultados
4. Cambiar filtro de Estado a "Consumido"
5. Limpiar todos los filtros
6. Buscar por batch_number: "CLO-2026"

**Resultados Esperados**:
- ✅ Con filtros múltiples:
  - Solo muestra items que cumplen TODOS los criterios (AND lógico)
  - Contador de resultados: "Mostrando 3 de 20 items"
- ✅ Con Estado "Consumido":
  - Solo items con `quantity_available` = 0 y `transformation_status` = "consumed"
- ✅ Al limpiar filtros:
  - Muestra todos los 20 items
- ✅ Búsqueda por batch_number parcial:
  - Muestra todos los items con batch_number que contengan "CLO-2026"
  - Ejemplo: CLO-2026-001, CLO-2026-002, CLO-2026-003

**Notas**:
- La búsqueda por batch_number fue agregada en el audit (Task 9)
- El filtro de lot_status fue agregado en el audit (Task 10)

---

## Gaps Identificados para Integración

Los siguientes gaps deben implementarse antes de que estos tests puedan ejecutarse completamente:

### Critical (Bloquean funcionalidad core)

1. **Plants → Inventory Linkage (M26)**
   - **Gap**: No existe `source_inventory_item_id` en plants table
   - **Impact**: Tests 6.6, 6.7, 6.8 fallarán completamente
   - **Files**: `convex/schema.ts`, `convex/plants.ts`, `components/plants/plant-form.tsx`
   - **Implementación**: Agregar campo a schema, mutation `plants.create()` que consuma inventario

2. **Batch Creation → Inventory Auto-generation**
   - **Gap**: Crear batch no genera automáticamente inventory item
   - **Impact**: Test 6.1 requiere paso manual adicional
   - **Files**: `convex/batches.ts`
   - **Implementación**: En `batches.create()` llamar a `activities.logInventoryMovement({ movement_type: "receipt" })`

3. **Expiration Date Validation**
   - **Gap**: No hay validación automática de `expiration_date`
   - **Impact**: Test 6.10 no funciona como se describe
   - **Files**: `convex/inventory.ts`
   - **Implementación**: Agregar computed field o runtime check en `getActiveStock`

### Important (Afectan experiencia de usuario)

4. **Bulk Receipt UI**
   - **Gap**: No existe componente de recepción masiva
   - **Impact**: Test 6.12 no puede ejecutarse
   - **Files**: `components/inventory/bulk-receipt-modal.tsx` (nuevo)
   - **Implementación**: Crear modal con array de productos + mutation `inventory.bulkReceipt()`

5. **Cascade Delete Validation**
   - **Gap**: Hard delete no valida dependencias activas
   - **Impact**: Test 6.11 podría permitir eliminaciones incorrectas
   - **Files**: `convex/inventory.ts` (mutation `hardDelete`)
   - **Implementación**: Query para buscar `source_batch_id` antes de eliminar

---

## Métricas de Éxito

Al completar todos los tests de integración, deberías verificar:

**Inventory → Batches**:
- ✅ Batch creation genera inventory item automáticamente
- ✅ Transformaciones FIFO correctas
- ✅ Cosechas generan inventory de material vegetal
- ✅ Historial completo de trazabilidad

**Inventory → Plants**:
- ✅ Plantas consumen inventory items al crearse
- ✅ Cosechas individuales generan inventory
- ✅ Linkage bidireccional Plant ↔ Inventory

**Inventory → Activities**:
- ✅ Consumo FIFO en actividades
- ✅ Validación de stock en tiempo real
- ✅ Historial detallado de consumos

**Inventory → Products**:
- ✅ Stock total calculado correctamente
- ✅ Múltiples lotes por producto
- ✅ Filtrado por producto funcional

---

## Troubleshooting de Integración

### Error: "Inventory item not found" al consumir en actividad
- Verificar que el item tenga `quantity_available` > 0
- Verificar que `transformation_status` = "active"
- Verificar que no esté expirado

### Batch transformation no genera nuevo inventory item
- Verificar que el producto destino esté configurado correctamente
- Verificar que `activities.logPhaseTransitionWithInventory()` se esté llamando
- Revisar logs de Convex para errores de validación

### FIFO no consume el lote correcto
- Verificar que los items tengan `received_date` correcta
- Verificar que el query ordene por `received_date ASC`
- Revisar que no haya items con misma fecha (desempate por `_creationTime`)

### Plant harvest no crea inventory
- **Este error es esperado**: M26 (Plants) solo está 20% implementado
- Ver Gap #1 arriba para implementación necesaria

---

**Última actualización**: 2026-01-28
**Versión**: 1.0
**Dependencias**: M19, M22, M25, M26 (parcial), Activities module
