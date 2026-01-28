# MODULE 19: INVENTORY MANAGEMENT - USER FLOWS & TESTS

**Objetivo**: Validar la gestión completa de inventario incluyendo entrada de materiales, movimientos, transformaciones (Phase E+F+G) y trazabilidad.
**Prerequisites**: Phase 2 parcialmente completada (áreas, proveedores, productos configurados).
**UI Reference**: Ver [../UI-PATTERNS.md](../UI-PATTERNS.md) para patrones visuales.

---

## Resumen del Módulo

| Funcionalidad | Propósito | Ruta |
|---------------|-----------|------|
| **Lista de Inventario** | Ver stock disponible por instalación | `/inventory` |
| **Recepción de Materiales** | Registrar entrada de insumos/productos | Modal desde lista |
| **Movimientos de Inventario** | Consumo, desperdicio, transferencias | Modal desde detalle |
| **Detalle de Item** | Ver info completa + historial | `/inventory/[id]` |
| **Transformaciones** | Tracking de ciclo de vida (clone→seedling→harvest) | Activities integration |
| **Filtros y Búsqueda** | Buscar por nombre, SKU, lote, categoría, estado | Filtros en lista |

---

## Datos de Prueba Base

**Facility**: North Greenhouse
**Usuario**: admin@ceibatic.com (Company Owner)
**Areas configuradas**: Propagation Room, Vegetative Room, Storage Room
**Proveedores**: FarmChem Inc, GrowSupply Colombia

---

## FLUJO 1: Ver Lista de Inventario

### Test 19.1: Visualizar inventario por instalación

**Objetivo**: Verificar que se muestra correctamente el inventario con stats, filtros y tabla.

**Precondiciones**:
- Usuario autenticado con acceso a facility
- Al menos 1 área creada en el facility

**Estructura de Página**:
```
┌──────────────────────────────────────────────────────────────┐
│ [PageHeader: "Inventario" + Breadcrumb]                      │
├──────────────────────────────────────────────────────────────┤
│ [Stats: Total Items | Stock Bajo | Crítico | Sin Stock]      │
├──────────────────────────────────────────────────────────────┤
│ [Alert: X items con stock bajo (Y críticos)] ← Si aplica     │
├──────────────────────────────────────────────────────────────┤
│ [Categoría ▼] [Filtros ▼] [🔍 Buscar...] [+ Recibir Item]   │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐│
│ │ TABLA DE INVENTARIO                                      ││
│ │                                                          ││
│ │ Producto  SKU  Categoría  Cantidad  Estado  Vencimiento ││
│ │ [Badges de estado stock: verde/amarillo/rojo/gris/azul] ││
│ │ [Badge transformation_status si no es "active"]         ││
│ │ [Menu kebab: Ver | Editar | Movimiento | Eliminar]     ││
│ └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Navegar a `/inventory`
2. Ver estadísticas en header (total, bajo, crítico, sin stock)
3. Verificar que tabla muestra columnas completas
4. Observar badges de estado de stock y transformation_status

**Resultados Esperados**:
- ✅ Stats cards muestran conteos correctos
- ✅ Tabla muestra: Producto, SKU, Categoría, Cantidad, Unidad, Proveedor, Estado Stock, Estado Transformación, Vencimiento
- ✅ Badge de estado stock con colores: verde (adequate), amarillo (low), rojo (critical), gris (out_of_stock), azul (overstocked)
- ✅ Badge de transformation_status visible si no es "active": transformado (azul), consumido (gris), cosechado (amarillo), expirado (rojo), desperdicio (rojo)
- ✅ Filas clickeables navegan a `/inventory/[id]`
- ✅ Menu kebab con opciones: Ver, Editar, Registrar Movimiento, Eliminar
- ✅ Estado vacío muestra icono Package + mensaje + CTA "Recibir Primer Item"

**Notas**:
- Si no hay items de inventario, debe mostrar empty state
- Alert de stock bajo aparece solo si hay items con status low/critical/out_of_stock

---

### Test 19.2: Filtrar y buscar inventario

**Objetivo**: Verificar funcionamiento de filtros de categoría, estado stock, lot status y búsqueda.

**Precondiciones**:
- Al menos 5 items de inventario con diferentes categorías y estados

**Pasos**:
1. Click en dropdown "Categoría"
2. Seleccionar una categoría (ej: Nutrientes)
3. Verificar que tabla filtra por categoría
4. Click en popover "Filtros"
5. Seleccionar checkboxes de estado stock (Normal, Bajo, Crítico, Sin Stock)
6. Verificar filtrado por stock status
7. En sección "Estado de Lote", seleccionar estados (Disponible, Reservado, Expirado)
8. Verificar filtrado por lot_status
9. Ingresar búsqueda: nombre de producto, SKU o número de lote
10. Click botón X para limpiar búsqueda
11. Click "Limpiar" en popover para resetear filtros

**Resultados Esperados**:
- ✅ Dropdown categoría con 9 opciones + iconos: Semillas, Nutrientes, Pesticidas, Equipos, Sustratos, Contenedores, Herramientas, Otros, Todas
- ✅ Popover de filtros con checkboxes de estado stock (4 opciones, todos seleccionados por defecto)
- ✅ Popover de filtros con sección "Estado de Lote" (5 opciones): Disponible, Reservado, Expirado, Cuarentena, Descontinuado
- ✅ Badge contador de filtros activos (cuenta stock + lot status)
- ✅ Búsqueda funciona por nombre de producto, SKU y batch_number
- ✅ Placeholder del input: "Buscar por nombre, SKU o lote..."
- ✅ Botón X limpia búsqueda
- ✅ Botón "Limpiar" resetea todos los filtros
- ✅ Estado vacío de búsqueda con mensaje + link limpiar

---

## FLUJO 2: Recepción de Materiales (Phase E)

### Test 19.3: Registrar entrada de inventario vía actividad

**Objetivo**: Verificar creación de inventory item usando arquitectura Phase E centralizada.

**Precondiciones**:
- Al menos 1 producto configurado en catálogo
- Al menos 1 área de almacenamiento (ej: Storage Room)
- Al menos 1 proveedor registrado

**Trigger**: Click botón "Recibir Item" (amber-500)

**Modal de Recepción**:
```
┌──────────────────────────────────────────────────────────────┐
│ [Icon] Registrar Entrada de Inventario                  [X]  │
│        Registra la recepción de materiales o productos       │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐  │
│ │ PRODUCTO Y ORIGEN                                      │  │
│ │                                                        │  │
│ │ Producto*: [Combobox con búsqueda + crear nuevo]      │  │
│ │ Proveedor: [Select de proveedores activos]            │  │
│ │ Lote de Proveedor: [___________]                       │  │
│ │                                                        │  │
│ │ UBICACIÓN Y CANTIDADES                                 │  │
│ │                                                        │  │
│ │ Área de Almacenamiento*: [Select de áreas]            │  │
│ │ Cantidad*: [___]  Unidad*: [▼ kg/g/L/mL/unidades]     │  │
│ │                                                        │  │
│ │ FECHAS                                                 │  │
│ │                                                        │  │
│ │ Fecha Recepción: [📅 __/__/____]                      │  │
│ │ Fecha Manufactura: [📅 __/__/____]                    │  │
│ │ Fecha Vencimiento: [📅 __/__/____]                    │  │
│ │                                                        │  │
│ │ COSTOS                                                 │  │
│ │                                                        │  │
│ │ Precio Total Compra: [$_____]                         │  │
│ │ Costo por Unidad: [$_____] (auto-calculado)          │  │
│ │                                                        │  │
│ │ [Alert: Precio base del catálogo: $XXX]              │  │
│ │ [Alert: ⚠️ Precio difiere del catálogo en +15%]      │  │
│ └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                    [Cancelar] [Registrar Entrada]            │
└──────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Click "Recibir Item"
2. Buscar y seleccionar producto: "Base Vegetativa A+B"
3. Seleccionar proveedor: "FarmChem Inc"
4. Ingresar lote proveedor: "LOT-FCI-2024-001"
5. Seleccionar área: "Storage Room"
6. Ingresar cantidad: 500
7. Seleccionar unidad: "L"
8. Ingresar fecha recepción: Hoy
9. Ingresar fecha manufactura: Hace 1 mes
10. Ingresar fecha vencimiento: +2 años
11. Ingresar precio total: $500,000
12. Verificar costo unitario auto-calculado: $1,000/L
13. Click "Registrar Entrada"

**Validaciones Implementadas** (Pre-Submit):
- ❌ Fecha recepción NO puede ser futura → "La fecha no puede ser en el futuro"
- ❌ Fecha manufactura NO puede ser futura
- ❌ Vencimiento debe ser > manufactura → "La fecha de vencimiento debe ser posterior a la fecha de manufactura"
- ⚠️ Warning si vencimiento < 30 días: "Este producto vence en menos de 30 días"
- ⚠️ Warning si precio difiere >5% del catálogo: Badge con porcentaje ±X%

**Resultados Esperados**:
- ✅ Modal abre correctamente
- ✅ Product combobox con autocomplete funciona
- ✅ Costo por unidad se calcula automáticamente (precio / cantidad)
- ✅ Alert muestra precio base del catálogo si existe
- ✅ Alert de comparación aparece si precio difiere >5%
- ✅ Validaciones de fecha bloquean submit si son inválidas
- ✅ Warning de near expiration aparece si <30 días
- ✅ Al guardar:
  - Crea actividad tipo `inventory_receipt` en tabla `activities`
  - Crea inventory_item con `created_by_activity_id`
  - Auto-genera `batch_number` con formato PREFIX-YYMMDD-XXXX (ej: NUT-260128-0001)
  - Toast de éxito: "Entrada registrada exitosamente"
  - Modal cierra
  - Redirige a detalle del nuevo item `/inventory/[id]`
- ✅ Item aparece en lista con datos correctos
- ✅ Stats actualizan conteo

**Notas**:
- **Arquitectura Phase E**: Usa `activities.logInventoryMovement({ movement_type: "receipt" })`
- Lote interno (batch_number) se genera automáticamente (Phase G)
- Si no se proporciona supplier_id, el item no tendrá proveedor (producción interna)
- `source_type` se marca como "purchase" automáticamente

---

## FLUJO 3: Detalle de Item de Inventario

### Test 19.4: Ver información completa de item

**Objetivo**: Verificar visualización de detalle con todas las cards de información.

**Precondiciones**:
- Al menos 1 item de inventario creado

**Ruta**: `/inventory/[id]`

**Estructura de Página**:
```
┌──────────────────────────────────────────────────────────────┐
│ [Breadcrumb: Inicio > Inventario > Base Vegetativa A+B]      │
│ Base Vegetativa A+B                    [Badge Stock] [Editar]│
│                                 [Registrar Movimiento]        │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────┐  │
│ │ STOCK          │ │ PRODUCTO       │ │ UBICACIÓN        │  │
│ │                │ │                │ │                  │  │
│ │ 450 L          │ │ SKU: NUT-001   │ │ Storage Room     │  │
│ │ Disponible     │ │ Categoría:     │ │ [Link al área]   │  │
│ │                │ │ Nutrientes     │ │                  │  │
│ │ Reservado: 0   │ │ Lote Interno:  │ │                  │  │
│ │ Punto reorden: │ │ NUT-260128-001 │ │                  │  │
│ │ 100 L          │ │ Lote Proveedor:│ │                  │  │
│ │                │ │ LOT-FCI-001    │ │                  │  │
│ │ [Barra visual] │ │                │ │                  │  │
│ └────────────────┘ └────────────────┘ └──────────────────┘  │
│                                                              │
│ ┌────────────────┐ ┌────────────────┐                       │
│ │ PROVEEDOR      │ │ FECHAS         │                       │
│ │                │ │                │                       │
│ │ FarmChem Inc   │ │ Recepción:     │                       │
│ │ [Link]         │ │ 28/01/2026     │                       │
│ │                │ │                │                       │
│ │ Costo/unidad:  │ │ Manufactura:   │                       │
│ │ $1,000/L       │ │ 28/12/2025     │                       │
│ │                │ │                │                       │
│ │                │ │ Vencimiento:   │                       │
│ │                │ │ 28/01/2028     │                       │
│ │                │ │ [Badge: 729    │                       │
│ │                │ │  días restantes│                       │
│ └────────────────┘ └────────────────┘                       │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ HISTORIAL DE MOVIMIENTOS                                 ││
│ │                                                          ││
│ │ [Ver inventory-activity-history]                        ││
│ │ Muestra actividades relacionadas con este item          ││
│ └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Click en item desde lista
2. Ver card Stock con cantidad disponible destacada
3. Ver barra visual de nivel de stock
4. Ver card Producto con SKU, categoría, lotes
5. Ver card Ubicación con link al área
6. Ver card Proveedor con link y costo
7. Ver card Fechas con badges de vencimiento
8. Scroll a historial de movimientos

**Resultados Esperados**:
- ✅ Header con nombre producto + badge stock + botón Editar
- ✅ Breadcrumb: Inicio > Inventario > [Producto]
- ✅ Card Stock:
  - Cantidad disponible (grande, destacado)
  - Cantidad reservada, comprometida
  - Punto de reorden con indicador
  - Barra visual de nivel de stock
- ✅ Card Producto:
  - Nombre, SKU, Categoría
  - Batch number (lote interno)
  - Supplier lot number (lote de proveedor)
- ✅ Card Ubicación:
  - Nombre del área (link clickeable a `/areas/[id]`)
  - Condiciones de almacenamiento (si aplica)
- ✅ Card Proveedor (si existe):
  - Nombre (link a detalle del proveedor)
  - Costo por unidad
- ✅ Card Fechas:
  - Recepción, Manufactura, Vencimiento
  - Alerta roja si vencimiento < 30 días
  - Badge con días restantes
- ✅ Botón "Registrar Movimiento" en header
- ✅ Historial de movimientos (ver Test 19.10)

**Notas**:
- Si `transformation_status` no es "active", mostrar badge especial en header
- Si item está transformado, mostrar link a item destino

---

## FLUJO 4: Movimientos de Inventario (Phase E)

### Test 19.5: Registrar consumo de material

**Objetivo**: Verificar consumo de inventario usando arquitectura centralizada.

**Precondiciones**:
- Item de inventario con stock > 0
- Usuario autenticado

**Trigger**: Click "Registrar Movimiento" desde detalle

**Modal de Movimiento**:
```
┌──────────────────────────────────────────────────────────────┐
│ [Icon] Registrar Movimiento de Inventario               [X]  │
│        Base Vegetativa A+B - Stock actual: 450 L             │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐  │
│ │ TIPO DE MOVIMIENTO                                     │  │
│ │                                                        │  │
│ │ ⦿ Consumo    ○ Corrección  ○ Desperdicio             │  │
│ │ ○ Transferencia  ○ Devolución                        │  │
│ │                                                        │  │
│ │ DETALLES DEL MOVIMIENTO                                │  │
│ │                                                        │  │
│ │ Cantidad*: [___]  Unidad: L                            │  │
│ │                                                        │  │
│ │ Stock Actual: 450 L                                    │  │
│ │ Nuevo Stock:  [Auto-calc]                              │  │
│ │                                                        │  │
│ │ [Alert: ⚠️ Vas a consumir todo el stock disponible]  │  │
│ │                                                        │  │
│ │ Razón del Movimiento*:                                 │  │
│ │ [_________________________________]                    │  │
│ │ (mínimo 10 caracteres)                                 │  │
│ │                                                        │  │
│ │ Notas Adicionales:                                     │  │
│ │ [_________________________________]                    │  │
│ │                                                        │  │
│ │ [Solo si es Transferencia:]                            │  │
│ │ Área Destino*: [Select de áreas]                      │  │
│ └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                  [Cancelar] [Registrar Movimiento]           │
└──────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Desde detalle de item, click "Registrar Movimiento"
2. Seleccionar tipo: "Consumo"
3. Ingresar cantidad: 50
4. Ver cálculo automático: Nuevo Stock = 400 L
5. Ingresar razón: "Uso en producción batch B-2024-001"
6. Click "Registrar Movimiento"

**Validaciones Implementadas** (Pre-Submit):
- ❌ Cantidad > stock disponible → "Stock insuficiente. Disponible: 450 L"
- ❌ Cantidad ≤ 0 → "La cantidad ingresada es inválida. Debe ser mayor a 0"
- ❌ Razón < 10 caracteres → "La razón debe tener al menos 10 caracteres"
- ⚠️ Warning si cantidad === quantity_available: "Vas a consumir todo el stock disponible de este item. ¿Estás seguro?"

**Resultados Esperados**:
- ✅ Modal abre con stock actual visible
- ✅ Tipos de movimiento: Consumo, Corrección, Desperdicio, Transferencia, Devolución
- ✅ Cantidad a ajustar es requerido
- ✅ Stock actual mostrado (read-only)
- ✅ Nuevo stock calculado en tiempo real
- ✅ Validación real-time de stock suficiente
- ✅ Alert warning aparece si consumo total (cantidad === available)
- ✅ Razón del movimiento requerida (mínimo 10 caracteres)
- ✅ Notas adicionales opcionales
- ✅ Si tipo = Transferencia: campo "Área Destino" aparece y es requerido
- ✅ Al guardar:
  - Crea actividad con `activity_type: "consumption"` (o tipo correspondiente)
  - Actualiza `quantity_available` del inventory_item
  - Registra `quantity_before` y `quantity_after` en activity
  - Toast éxito con nuevo stock: "Movimiento registrado. Stock actual: 400 L"
  - Modal cierra
  - Página detalle actualiza con nuevo stock
  - Historial de movimientos muestra nueva entrada

**Errores Mapeados**:
- "insufficient stock" → "Stock insuficiente para realizar esta operación"
- "not found" → "El item de inventario no fue encontrado"
- "unauthorized" → "No tienes permiso para realizar esta operación"
- "invalid quantity" → "La cantidad ingresada es inválida. Debe ser mayor a 0"
- "connection error" → "Error de conexión. Verifica tu conexión a internet e intenta nuevamente"

**Notas**:
- **Arquitectura Phase E**: Usa `activities.logInventoryMovement()`
- Validation de stock ocurre en backend pero también en frontend (UX mejorado)
- Para correcciones, el nuevo stock = cantidad ingresada (no resta/suma)

---

### Test 19.6: Transferir item entre áreas

**Objetivo**: Verificar transferencia de inventario entre áreas.

**Precondiciones**:
- Item con stock > 0
- Al menos 2 áreas en el facility

**Pasos**:
1. Desde detalle, click "Registrar Movimiento"
2. Seleccionar tipo: "Transferencia"
3. Ingresar cantidad: 100
4. Seleccionar área destino: "Vegetative Room"
5. Ingresar razón: "Transferencia a área vegetativa para uso en batch activo"
6. Click "Registrar Movimiento"

**Resultados Esperados**:
- ✅ Campo "Área Destino" aparece cuando tipo = Transferencia
- ✅ Área destino es requerida
- ✅ Validación de stock suficiente
- ✅ Al guardar:
  - Actualiza `area_id` del inventory_item a área destino
  - Registra `source_area_id` y `destination_area_id` en activity
  - Toast éxito: "Item transferido a Vegetative Room exitosamente"
  - Card Ubicación actualiza con nueva área

**Notas**:
- Transferencias actualizan la ubicación física del item
- En el historial, se muestra "Área Origen → Área Destino"

---

## FLUJO 5: Historial y Trazabilidad

### Test 19.7: Ver historial de movimientos

**Objetivo**: Verificar historial completo con información de transacciones.

**Precondiciones**:
- Item con al menos 3 movimientos registrados

**Ubicación**: Card "Historial de Movimientos" en página detalle

**Tabla de Historial**:
```
┌──────────────────────────────────────────────────────────────┐
│ HISTORIAL DE MOVIMIENTOS                                     │
├──────────────────────────────────────────────────────────────┤
│ Fecha    Tipo       Cantidad  Antes  Después  Usuario  Razón │
│ ─────────────────────────────────────────────────────────────│
│ 28/01    [Receipt] +500 L     0 L    500 L    Admin    Recep │
│          🟢 verde                                     inicial │
│                                                               │
│ 28/01    [Consumo] -50 L      500 L  450 L    Admin    Uso   │
│          🔵 azul                                     batch B  │
│                                                               │
│ 28/01    [Transfer] -100 L    450 L  350 L    Admin    Transf│
│          🟣 morado                              Vegetative    │
│          Storage Room → Vegetative Room                       │
└──────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Desde detalle de item, scroll a "Historial de Movimientos"
2. Ver tabla con movimientos ordenados por fecha (más reciente primero)
3. Observar badges de tipo de movimiento
4. Ver indicadores visuales (+verde / -rojo)
5. Leer notas y referencias

**Resultados Esperados**:
- ✅ Card de historial de movimientos en detalle
- ✅ Tabla con columnas: Fecha, Tipo, Cambio Cantidad, Antes, Después, Razón, Usuario
- ✅ Indicadores visuales:
  - Entrada (+verde): addition, receipt
  - Salida (-rojo): consumption, waste, transfer
- ✅ Badge de tipo de movimiento con colores:
  - Entrada (verde): ArrowUpCircle, Package
  - Consumo (azul): ArrowDownCircle
  - Desperdicio (rojo): Trash2
  - Transferencia (morado): ArrowRightLeft
  - Corrección (ámbar): RefreshCw
- ✅ Fechas relativas con tooltip de fecha completa (formatDistanceToNow)
- ✅ Notas y referencias visibles
- ✅ Para transferencias: muestra "Área Origen → Área Destino"
- ✅ Usuario que realizó el movimiento con nombre completo

**Notas**:
- Query: `inventory.getTransactionHistory({ inventoryId, limit })`
- Historial incluye actividad de creación (`receipt`)

---

### Test 19.8: Ver transformaciones en historial (Phase F)

**Objetivo**: Verificar visualización de transformaciones de inventario.

**Precondiciones**:
- Item de inventario que fue transformado (ej: clone → seedling)
- Fase F implementada con `logPhaseTransitionWithInventory`

**Ubicación**: Card "Historial de Actividades" en detalle

**Visualización de Transformación**:
```
┌──────────────────────────────────────────────────────────────┐
│ HISTORIAL DE ACTIVIDADES                                     │
├──────────────────────────────────────────────────────────────┤
│ [Sprout Icon] Transición de Fase            28 ene, 14:30    │
│ ──────────────────────────────────────────────────────────── │
│ 100 esquejes → 95 plántulas                                  │
│                                                              │
│ Antes/Después:                                               │
│ 100 unidades → 0 unidades (transformado)                     │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🎯 Resultado de la transformación                        ││
│ │                                                          ││
│ │ → Ver item producido (Plántulas)            +95 unidades ││
│ │   [Link clickeable a /inventory/new-item-id]            ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Razón: Transición vegetativa exitosa, pérdidas normales     │
│ Usuario: Admin                                               │
└──────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Realizar transición de fase en un batch (fuera de scope de este test, asumir hecho)
2. Navegar a detalle del item fuente (esquejes)
3. Ver historial de actividades
4. Observar entrada de "Transición de Fase" o "Cosecha"
5. Ver visualización "Producto A → Producto B"
6. Click en link "Ver item producido"
7. Navegar a item destino

**Resultados Esperados**:
- ✅ Historial incluye actividades tipo `phase_transition` y `harvest`
- ✅ Visualización clara con arrow (→):
  - "100 esquejes → 95 plántulas"
  - "95 plantas → 450 kg de Material Vegetal"
- ✅ Sección "Resultado" con estilo emerald/success
- ✅ Link clickeable al item producido
- ✅ Muestra cantidad producida con unidad
- ✅ Indicador "transformado" en quantity_before/after
- ✅ Icono distintivo: Sprout (phase_transition), Scissors (harvest)
- ✅ Color coding especial: teal (phase_transition), emerald (harvest)

**Notas**:
- **Phase F Integration**: Transformaciones automáticas sincronizadas con batches
- `transformation_status` del item fuente cambia a "transformed"
- `transformed_to_item_id` apunta al item producido
- `materials_produced` en activity registra item destino

---

## FLUJO 6: Edición y Eliminación

### Test 19.9: Editar item de inventario

**Objetivo**: Verificar edición de metadata sin afectar cantidad.

**Precondiciones**:
- Item de inventario existente

**Ruta**: `/inventory/[id]/edit`

**Pasos**:
1. Desde detalle, click "Editar"
2. Modificar campos editables:
   - Proveedor
   - Punto de reorden: 150
   - Cantidad de reorden
   - Costo por unidad
   - Ubicación de almacenamiento (área)
   - Fecha de vencimiento
   - Notas
3. Click "Guardar Cambios"

**Resultados Esperados**:
- ✅ Página `/inventory/[id]/edit` con formulario pre-poblado
- ✅ Campos editables:
  - Proveedor
  - Punto de reorden
  - Cantidad de reorden
  - Costo por unidad
  - Ubicación de almacenamiento
  - Fecha de vencimiento
  - Notas
- ✅ Cantidad NO editable (debe usar "Registrar Movimiento")
- ✅ Botones: Cancelar + Guardar Cambios
- ✅ Al guardar:
  - Toast éxito: "Item actualizado exitosamente"
  - Redirige a detalle
  - Cambios visibles en detalle

---

### Test 19.10: Eliminar item de inventario

**Objetivo**: Verificar soft/hard delete con confirmación diferenciada.

**Precondiciones**:
- Al menos 2 items: uno con stock > 0, otro con stock = 0

**Trigger**: Menu kebab → Eliminar

**Pasos - Item con Stock**:
1. Seleccionar item con `quantity_available > 0`
2. Click "Eliminar" en menu
3. Ver dialog de confirmación

**Dialog (Soft Delete)**:
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️ ¿Eliminar Item de Inventario?                             │
├──────────────────────────────────────────────────────────────┤
│ Este item será marcado como descontinuado porque tiene       │
│ stock o historial de transacciones. Dejará de aparecer en    │
│ la lista activa pero mantendrá su historial.                 │
│                                                              │
│              [Cancelar] [Marcar como Descontinuado]          │
└──────────────────────────────────────────────────────────────┘
```

4. Click "Marcar como Descontinuado"

**Resultados Esperados (Soft Delete)**:
- ✅ Mensaje indica que será soft delete (marcar como discontinued)
- ✅ Botón dice "Marcar como Descontinuado"
- ✅ Al confirmar:
  - `lot_status` cambia a "discontinued"
  - Toast: "Item marcado como descontinuado"
  - Item no aparece en lista activa por defecto
  - Item mantiene historial completo

**Pasos - Item sin Stock**:
1. Seleccionar item con `quantity_available = 0` AND `quantity_reserved = 0` AND `quantity_committed = 0`
2. Click "Eliminar" en menu
3. Ver dialog de confirmación

**Dialog (Hard Delete)**:
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️ ¿Eliminar Item de Inventario?                             │
├──────────────────────────────────────────────────────────────┤
│ ⚠️ Este item será eliminado permanentemente porque no        │
│ tiene stock ni transacciones. Esta acción no se puede        │
│ deshacer.                                                    │
│                                                              │
│              [Cancelar] [Eliminar Permanentemente]           │
└──────────────────────────────────────────────────────────────┘
```

4. Click "Eliminar Permanentemente"

**Resultados Esperados (Hard Delete)**:
- ✅ Mensaje en rojo indica eliminación permanente
- ✅ Texto warning: "Esta acción no se puede deshacer"
- ✅ Botón dice "Eliminar Permanentemente"
- ✅ Al confirmar:
  - Item se borra de base de datos
  - Toast: "Item eliminado exitosamente"
  - Redirige a lista
  - Item desaparece completamente

---

## FLUJO 7: Alertas y Notificaciones

### Test 19.11: Alert de stock bajo

**Objetivo**: Verificar alerta cuando hay items con stock bajo/crítico.

**Precondiciones**:
- Al menos 1 item con `quantity_available <= reorder_point`

**Ubicación**: Banner debajo de stats en `/inventory`

**Alert Banner**:
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️ 3 items con stock bajo (1 críticos)          [Ver Items]  │
└──────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Navegar a `/inventory`
2. Ver banner de alerta (si aplica)
3. Click "Ver Items"
4. Verificar que tabla filtra automáticamente

**Resultados Esperados**:
- ✅ Banner de alerta debajo de stats si hay stock bajo
- ✅ Color amarillo si hay items "low", rojo si hay "critical"
- ✅ Muestra contador: "X items con stock bajo (Y críticos)"
- ✅ Botón "Ver Items" aplica filtro de stock bajo/crítico automáticamente
- ✅ Desaparece si no hay items en esa condición

---

## FLUJO 8: Arquitectura Phase E+F+G (Backend)

### Test 19.12: Validar generación automática de lotes (Phase G)

**Objetivo**: Verificar que lotes internos se generan automáticamente.

**Precondiciones**:
- Productos configurados con diferentes categorías

**Pasos**:
1. Crear entrada de inventario (receipt) sin especificar batch_number
2. Verificar que se genera automáticamente
3. Observar formato: PREFIX-YYMMDD-XXXX
4. Repetir con diferentes categorías

**Prefijos Esperados**:
- Semillas: SEM
- Nutrientes: NUT
- Pesticidas: PES
- Equipos: EQP
- Sustratos: SUS
- Contenedores: CON
- Herramientas: HER
- Otros: OTR
- Esquejes (clone): CLO
- Plántulas (seedling): PLT
- Plantas Madre (mother_plant): MAD
- Material Vegetal (plant_material): MAT

**Ejemplo de Secuencia**:
- Primer lote de nutrientes del día: NUT-260128-0001
- Segundo lote de nutrientes del día: NUT-260128-0002
- Primer lote de esquejes del día: CLO-260128-0001

**Resultados Esperados**:
- ✅ `batch_number` se genera automáticamente si no se proporciona
- ✅ Formato correcto: PREFIX-YYMMDD-XXXX
- ✅ Prefijo basado en `product.category`
- ✅ Secuencia incrementa por día y categoría
- ✅ Helper: `generateInternalLotNumber(ctx, category, date?)`
- ✅ Para productos internos (transformaciones), `supplier_id` = undefined
- ✅ `source_type` = "production" para transformaciones, "purchase" para recepciones

**Notas**:
- **Phase G**: Generación automática implementada en `convex/helpers.ts`
- Lote de proveedor (`supplier_lot_number`) sigue siendo manual/opcional

---

### Test 19.13: Validar auth guards y ownership

**Objetivo**: Verificar seguridad y control de acceso.

**Precondiciones**:
- 2 usuarios: uno con acceso al facility, otro sin acceso

**Pasos - Usuario Autorizado**:
1. Login como usuario con acceso a "North Greenhouse"
2. Navegar a `/inventory`
3. Ver lista de inventario
4. Crear entrada de material
5. Editar item
6. Eliminar item

**Resultados Esperados (Usuario Autorizado)**:
- ✅ Puede ver lista de inventario
- ✅ Puede crear nuevos items
- ✅ Puede editar items del facility
- ✅ Puede eliminar items del facility

**Pasos - Usuario No Autorizado**:
1. Login como usuario SIN acceso a "North Greenhouse"
2. Intentar navegar a `/inventory` con facilityId de North Greenhouse
3. Intentar editar item de North Greenhouse

**Resultados Esperados (Usuario No Autorizado)**:
- ✅ Query `inventory.getByFacility` verifica `getAuthUserId(ctx)`
- ✅ Query retorna error "Unauthorized" si no hay userId
- ✅ Mutation `inventory.update` verifica ownership
- ✅ Mutation retorna error "Access denied" si user no tiene acceso a facility
- ✅ Frontend muestra toast: "No tienes permiso para realizar esta operación"

**Auth Guards Implementados**:
- `inventory.list` - Auth check ✅
- `inventory.getByFacility` - Auth check ✅
- `inventory.getByCategory` - Auth check ✅
- `inventory.getById` - Auth check ✅
- `inventory.getLowStock` - Auth check ✅
- `inventory.getTransactionHistory` - Auth check ✅
- `inventory.update` - Auth + ownership check ✅
- `inventory.remove` - Auth + ownership check ✅

---

## Métricas de Éxito

Al completar todos los tests, deberías tener:

**Items Creados**:
- 5+ items de inventario con diferentes categorías
- Al menos 2 items con stock bajo (para testar alertas)
- Al menos 1 item con transformación (si Phase F disponible)

**Movimientos Registrados**:
- 3+ recepciones (entries)
- 2+ consumos
- 1+ transferencia
- 1+ transformación (si Phase F disponible)

**Validaciones Probadas**:
- ✅ Fechas no futuras
- ✅ Stock insuficiente
- ✅ Warning near expiration
- ✅ Warning precio mismatch
- ✅ Warning consumo total
- ✅ Auth guards funcionando

**Arquitectura Validada**:
- ✅ Phase E: Todos los movimientos via `activities.logInventoryMovement`
- ✅ Phase F: Transformaciones sincronizadas con batches (si disponible)
- ✅ Phase G: Lotes internos auto-generados
- ✅ Trazabilidad completa en historial

---

## Notas Importantes

### Arquitectura Phase E (Centralizada)
- **Deprecados**: `inventory.create`, `inventory.adjustStock`
- **Actual**: `activities.logInventoryMovement()` para TODO
- Beneficios: Trazabilidad, audit trail, consistencia

### Transformaciones (Phase F)
- Solo aplica si módulo de Batches está implementado
- Sincroniza inventario con ciclo de vida de plantas
- Clone → Seedling → Vegetative → Flowering → Harvest

### Errores Conocidos
- Legacy code puede existir en branches antiguas
- Todos los nuevos desarrollos DEBEN usar Phase E

### Limitaciones
- Paginación no implementada (lista completa)
- Exportación CSV no disponible
- Error boundaries específicos pendientes

---

**Última actualización**: 2026-01-28
**Versión**: 1.0 (Post M19 Audit)
**Estado**: ✅ Production Ready
