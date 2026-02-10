# Plan de Implementación: Sistema Universal de Recursos Agrícolas

**Proyecto:** Refactorización del módulo de inventario → Resource Management System
**Fecha:** 2026-02-10
**Versión:** 1.0
**Alcance:** Diagnóstico del schema actual, schema evolucionado, funciones a desarrollar, y plan de migración

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Diagnóstico del Schema Actual](#2-diagnóstico-del-schema-actual)
3. [Schema Evolucionado](#3-schema-evolucionado)
4. [Categorías de Recursos](#4-categorías-de-recursos)
5. [Cadena de Transformación del Material Vegetal](#5-cadena-de-transformación-del-material-vegetal)
6. [Funciones y Endpoints a Desarrollar](#6-funciones-y-endpoints-a-desarrollar)
7. [Reglas de Negocio y Validaciones](#7-reglas-de-negocio-y-validaciones)
8. [Plan de Migración](#8-plan-de-migración)
9. [Estimación de Esfuerzo](#9-estimación-de-esfuerzo)

---

## 1. Resumen Ejecutivo

### Problema

El sistema actual gestiona inventario con dos tablas (`products` + `inventory_items`) usando un patrón catálogo-instancia que es fundamentalmente correcto. Sin embargo, presenta gaps críticos que impiden:

- **Trazabilidad completa**: no existe log inmutable de movimientos de inventario.
- **Transformaciones vegetales robustas**: el self-reference en `inventory_items` solo modela relaciones 1→1, no soporta mermas, ni rendimientos, ni multi-output.
- **Costeo por lote de cultivo**: no se puede calcular COGS real porque los consumos no se vinculan a fase de cultivo ni a zona.
- **Ejecución de recetas/BOM**: la tabla `recipes` existe pero no genera transacciones de inventario automáticas.
- **Categorías configurables**: el ENUM plano no soporta jerarquía ni configuración por empresa.
- **Conversión de unidades**: strings libres para unidades causan errores cuando un producto se compra en kg pero se aplica en g.

### Solución

Evolucionar el schema existente (no reescribirlo) incorporando:

1. **`inventory_transactions`** — tabla inmutable de movimientos (la pieza más crítica que falta).
2. **`resource_categories`** — categorías jerárquicas reemplazando el ENUM de `products.category`.
3. **`units_of_measure`** — catálogo de unidades con conversiones por dimensión.
4. **`recipe_executions`** — registro de ejecuciones de receta vinculando inputs/outputs.
5. **Campos nuevos en `products`** — `procurement_type`, `lot_tracking`, `transformation_produces_id`, `default_yield_pct`.
6. **Campos migrados de `inventory_items`** — los campos de transformación migran a `inventory_transactions`.

### Impacto estimado

- **2 tablas evolucionadas**: `products`, `inventory_items`
- **4 tablas nuevas**: `inventory_transactions`, `resource_categories`, `units_of_measure`, `recipe_executions`
- **3 campos eliminados** de `inventory_items` (migran a transactions)
- **~9 campos nuevos** en `products`
- **12 tipos de transacción** cubriendo todo movimiento posible
- **17+ funciones/endpoints** a desarrollar

---

## 2. Diagnóstico del Schema Actual

### 2.1. Lo que funciona bien (se mantiene)

| # | Aspecto | Detalle | Veredicto |
|---|---------|---------|-----------|
| 1 | **Separación catálogo vs instancia** | `products` (qué) → `inventory_items` (cuánto/dónde) es el patrón maestro-detalle correcto. | ✅ Se mantiene tal cual |
| 2 | **Triple accounting de cantidades** | `quantity_available` / `quantity_reserved` / `quantity_committed` cubre los tres estados de stock necesarios para operaciones reales. | ✅ Se mantiene tal cual |
| 3 | **Source tracking** | `source_type` (purchase/production/transfer), `source_recipe_id`, `source_batch_id` ya modelan el origen del item. | ✅ Se mantiene, se agrega tipo 'transformation' |
| 4 | **Transformation self-reference** | `transformed_to_item_id` + `transformed_by_activity_id` ya capturan la idea de cadena. | ⚠️ Migra a `inventory_transactions` |
| 5 | **Lote dual** | `batch_number` (interno) vs `supplier_lot_number` (proveedor) — correcto, son dos identidades. | ✅ Se mantiene tal cual |
| 6 | **Fechas de vida** | `received_date`, `manufacturing_date`, `expiration_date`, `last_tested_date` cubren el ciclo. | ✅ Se mantiene tal cual |
| 7 | **Quality grade + notes + certificates** | Campos de calidad flexibles. | ✅ Se mantiene tal cual |
| 8 | **Reorder management** | `minimum_stock_level`, `maximum_stock_level`, `reorder_point`, `lead_time_days`. | ✅ Se mantiene tal cual |

### 2.2. Gaps críticos

#### GAP-01: No existe tabla de transacciones inmutables

**Severidad:** 🔴 CRÍTICO — Es el gap más importante de todo el sistema.

**Situación actual:** Los cambios de cantidad en `inventory_items` son mutaciones directas (`UPDATE quantity_available = quantity_available - X`). No queda registro de qué se movió, cuándo, quién lo hizo, ni por qué.

**Consecuencias:**
- No hay trazabilidad real de movimientos.
- No se puede auditar quién consumió qué y cuándo.
- No hay rollback posible ante errores.
- No se puede calcular COGS por lote de cultivo (falta el vínculo transacción → zona → fase).
- Cualquier auditoría regulatoria (GACP, GlobalGAP, FSMA) falla.

**Solución:** Crear tabla `inventory_transactions` como registro inmutable. Cada movimiento genera un registro con tipo, cantidad, timestamp, usuario, y vínculos contextuales (zona, batch, fase, receta). Las quantities en `inventory_items` se pueden recalcular como `SUM(transactions)` para verificación.

**Referencia técnica:** Esto es equivalente a lo que METRC hace con cada Plant/Package event (timestamp + user + action), lo que farmOS hace con sus Logs (Activity, Input, Harvest), y lo que cualquier ERP financiero hace con asientos contables inmutables.

#### GAP-02: Categorías planas (ENUM)

**Severidad:** 🔴 CRÍTICO

**Situación actual:** `products.category` es un ENUM fijo: `seed | nutrient | pesticide | equipment | substrate | container | tool | clone | seedling | mother_plant | plant_material | other`.

**Problemas:**
- No soporta jerarquía. Ejemplo: `nutrient` no distingue entre sal mineral simple, fertilizante compuesto, quelato de micronutriente, o enmienda orgánica.
- No es configurable por empresa. Si una empresa necesita una subcategoría nueva, requiere migración de DB.
- No define comportamiento por categoría: ¿requiere lote? ¿es consumible? ¿es depreciable? ¿es transformable?
- La categoría `plant_material` es una bolsa genérica que mezcla flor húmeda, flor seca, trim y extractos.

**Solución:** Crear tabla `resource_categories` con `parent_id` para jerarquía N-niveles y flags de comportamiento (`is_consumable`, `is_depreciable`, `is_transformable`, `default_lot_tracking`).

#### GAP-03: Transformación vegetal como self-reference frágil

**Severidad:** 🔴 CRÍTICO

**Situación actual:** `inventory_items.transformed_to_item_id` apunta a otro inventory_item (self-reference).

**Problemas:**
- Solo vincula 1→1. Un lote de 50 semillas que se transforma en 45 plántulas no puede modelarse como: "resté 50, sumé 45, desperdicié 5".
- No registra merma/pérdida en la conversión.
- No queda claro qué cantidades se restaron/sumaron.
- Transformaciones multi-output son imposibles. Ejemplo: cosecha produce flor húmeda + trim + residuo.
- El campo `transformation_status` es redundante y propenso a desincronización.

**Solución:** Modelar transformaciones como pares de transacciones explícitas en `inventory_transactions`: N registros `transformation_out` (consumo de inputs) + M registros `transformation_in` (producción de outputs), vinculados por `related_transaction_id` y/o `recipe_execution_id`. Esto soporta 1→1, 1→N, N→1, y N→M nativamente.

#### GAP-04: Recetas no generan movimientos automáticos

**Severidad:** 🟠 ALTO

**Situación actual:** `source_recipe_id` existe en `inventory_items` pero es solo una referencia estática. No hay mecanismo para que al ejecutar una receta se generen automáticamente las salidas de ingredientes y la entrada del producto resultante.

**Solución:** Crear tabla `recipe_executions` que registre cada ejecución con: recipe_id, scale_factor, output esperado vs real, yield_pct. Cada execution genera N transacciones de input + M de output, todas vinculadas al mismo `recipe_execution_id`.

#### GAP-05: Sin distinción origen interno vs externo

**Severidad:** 🟠 ALTO

**Situación actual:** `source_type = 'production'` implica interno y `'purchase'` implica externo, pero eso está en `inventory_items` (la instancia), no en `products` (el catálogo). No hay forma de decir "este producto SIEMPRE se produce internamente" vs "este producto SIEMPRE se compra".

**Consecuencia:** No se puede hacer MRP (Material Requirements Planning): ante un plan de producción, ¿qué debo comprar y qué debo fabricar?

**Solución:** Agregar `products.procurement_type`: `'purchased'` | `'produced'` | `'both'`.

#### GAP-06: Sin tabla de unidades de medida con conversiones

**Severidad:** 🟠 ALTO

**Situación actual:** `quantity_unit` en `inventory_items` y `default_unit` en `products` son strings libres (`'kg'`, `'g'`, `'L'`, `'mL'`, `'unidades'`). No hay tabla de conversiones.

**Consecuencias:**
- Se compra fertilizante en kg pero se aplica en g → error si no se convierte manualmente.
- Typos: `'kilogramos'` vs `'kg'` vs `'Kg'` son tres unidades distintas para el sistema.
- No se puede agregar inventario entre items del mismo producto con unidades distintas.

**Solución:** Crear tabla `units_of_measure` con dimensión, unidad base y factor de conversión. Reemplazar strings libres por FKs.

### 2.3. Gaps menores pero importantes

| # | Gap | Impacto | Solución |
|---|-----|---------|----------|
| GAP-07 | **Lote sin enforcement por categoría** | Pesticidas sin lote violan regulación; sustratos a granel no necesitan lote. Hoy depende de disciplina del usuario. | Agregar `products.lot_tracking`: `'required'` / `'optional'` / `'none'`, heredable desde `resource_categories.default_lot_tracking`. |
| GAP-08 | **Sin vida útil por producto** | `expiration_date` está en items (correcto), pero no se auto-calcula al recibir. | Agregar `products.shelf_life_days`. Al crear `inventory_item`, calcular `expiration_date = received_date + shelf_life_days`. |
| GAP-09 | **PHI/REI ausentes** | Pre-Harvest Interval y Re-Entry Interval son obligatorios para productos fitosanitarios. Sin ellos, no se puede alertar automáticamente. | Agregar `products.phi_days` y `products.rei_hours` (solo aplica a categoría crop_protection). |
| GAP-10 | **Sin costo acumulado por lote de plantas** | Se puede rastrear qué se aplicó, pero no se acumula el costo total de insumos por lote de cultivo. | Con `inventory_transactions` vinculadas a `batch_id` + `crop_phase`, COGS = `SUM(cost_total) GROUP BY batch_id`. |
| GAP-11 | **Sin yield tracking sistemático** | No se registra rendimiento esperado vs real por transformación. | Agregar `products.default_yield_pct` + `recipe_executions.output_quantity_expected` vs `output_quantity_actual`. |

---

## 3. Schema Evolucionado

### 3.1. Tabla: `resource_categories` (NUEVA)

Reemplaza el ENUM de `products.category`. Jerárquica con self-reference. Configurable por empresa.

```
resource_categories
├── id                      UUID (PK)
├── company_id              FK → companies
├── parent_id               FK → self (nullable)  -- Permite jerarquía N-niveles
├── name                    VARCHAR                -- 'Sales Minerales'
├── name_en                 VARCHAR (nullable)     -- 'Mineral Salts'
├── code                    VARCHAR UNIQUE per company -- 'nutrient.salt'
├── icon                    VARCHAR (nullable)     -- '🧪'
├── description             TEXT (nullable)
│
│   -- Flags de comportamiento (heredables a products) --
├── is_consumable           BOOLEAN DEFAULT true   -- true = se agota al usar
├── is_depreciable          BOOLEAN DEFAULT false  -- true = equipos con vida útil
├── is_transformable        BOOLEAN DEFAULT false  -- true = material vegetal
├── default_lot_tracking    ENUM ['required', 'optional', 'none'] DEFAULT 'optional'
│
├── sort_order              INT DEFAULT 0
├── is_active               BOOLEAN DEFAULT true
├── created_at              TIMESTAMPTZ
└── updated_at              TIMESTAMPTZ
```

**Índices:** `(company_id, parent_id)`, `(company_id, code) UNIQUE`, `(company_id, is_active)`

### 3.2. Tabla: `units_of_measure` (NUEVA)

Catálogo de unidades con conversiones por dimensión. Elimina strings libres.

```
units_of_measure
├── id                      UUID (PK)
├── company_id              FK → companies (nullable) -- null = unidad del sistema
├── code                    VARCHAR UNIQUE          -- 'kg', 'g', 'L', 'mL', 'unit'
├── name                    VARCHAR                 -- 'Kilogramo'
├── name_en                 VARCHAR (nullable)      -- 'Kilogram'
├── symbol                  VARCHAR                 -- 'kg'
├── dimension               ENUM [
│                             'mass',          -- g, kg, lb, oz
│                             'volume',        -- mL, L, gal, fl_oz
│                             'count',         -- unidad, bandeja, caja, pallet
│                             'length',        -- cm, m
│                             'area',          -- m², ha
│                             'energy',        -- kWh, BTU
│                             'time',          -- hora, día
│                             'concentration'  -- ppm, mS/cm, %
│                           ]
├── base_unit_id            FK → self (nullable)   -- La unidad base de esta dimensión
├── to_base_factor          DECIMAL DEFAULT 1      -- ×1000 para kg→g, ×1000 para L→mL
├── is_active               BOOLEAN DEFAULT true
├── created_at              TIMESTAMPTZ
└── updated_at              TIMESTAMPTZ
```

**Índices:** `(code) UNIQUE`, `(dimension)`

**Datos semilla mínimos:**

| Código | Nombre | Dimensión | Base | Factor |
|--------|--------|-----------|------|--------|
| g | Gramo | mass | — (es la base) | 1 |
| kg | Kilogramo | mass | g | 1000 |
| mg | Miligramo | mass | g | 0.001 |
| lb | Libra | mass | g | 453.592 |
| oz | Onza | mass | g | 28.3495 |
| mL | Mililitro | volume | — (es la base) | 1 |
| L | Litro | volume | mL | 1000 |
| gal | Galón | volume | mL | 3785.41 |
| m3 | Metro cúbico | volume | mL | 1000000 |
| unit | Unidad | count | — (es la base) | 1 |
| tray | Bandeja | count | unit | 1 |
| box | Caja | count | unit | 1 |
| pallet | Pallet | count | unit | 1 |
| kWh | Kilovatio-hora | energy | — (es la base) | 1 |
| hour | Hora | time | — (es la base) | 1 |
| day | Día | time | hour | 24 |
| ppm | Partes por millón | concentration | — | 1 |
| pct | Porcentaje | concentration | — | 1 |

### 3.3. Tabla: `products` (EVOLUCIONADA)

Se mantienen todos los campos existentes. Se agregan campos marcados con ★. Se reemplaza `category` ENUM por FK a `resource_categories`.

```
products
├── id                      UUID (PK)
├── company_id              FK → companies
├── sku                     VARCHAR UNIQUE per company
├── gtin                    VARCHAR (nullable)
├── name                    VARCHAR
├── description             TEXT (nullable)
│
│   -- CAMBIA: category ENUM → FK --
├── category_id ★           FK → resource_categories  -- Reemplaza ENUM
├── subcategory             VARCHAR (nullable)         -- DEPRECAR gradualmente
│
│   -- CAMBIA: default_unit string → FK --
├── default_unit_id ★       FK → units_of_measure     -- Reemplaza string libre
│
│   -- NUEVOS: procurement & tracking --
├── procurement_type ★      ENUM ['purchased', 'produced', 'both'] DEFAULT 'purchased'
├── lot_tracking ★          ENUM ['required', 'optional', 'none'] DEFAULT 'optional'
├── shelf_life_days ★       INT (nullable)  -- Auto-calcula expiration al recibir
│
│   -- NUEVOS: regulatorio --
├── phi_days ★              INT (nullable)  -- Pre-Harvest Interval (crop protection)
├── rei_hours ★             INT (nullable)  -- Re-Entry Interval (crop protection)
│
│   -- NUEVOS: transformación vegetal --
├── transformation_produces_id ★  FK → products (nullable)  -- ¿Qué produce al transformarse?
├── default_yield_pct ★          DECIMAL (nullable)         -- Rendimiento esperado (0-100)
│
│   -- EXISTENTES sin cambio --
├── applicable_crop_type_ids     FK[] → crop_types
├── brand_id                     FK → brands (nullable)
├── manufacturer                 VARCHAR (nullable)
├── preferred_supplier_id        FK → suppliers (nullable)
├── regional_suppliers           FK[] → suppliers
├── weight_value, weight_unit    DECIMAL, VARCHAR (nullable)
├── dimensions_*                 (length, width, height, unit)
├── product_metadata             JSONB (nullable)
├── regulatory_registered        BOOLEAN
├── regulatory_registration_number  VARCHAR (nullable)
├── organic_certified            BOOLEAN
├── organic_cert_number          VARCHAR (nullable)
├── default_price                DECIMAL (nullable)
├── price_currency               CHAR(3) DEFAULT 'COP'
├── price_unit                   VARCHAR (nullable)
├── status                       ENUM ['active', 'discontinued']
├── created_at                   TIMESTAMPTZ
└── updated_at                   TIMESTAMPTZ
```

**Índices nuevos:** `(company_id, category_id)`, `(transformation_produces_id)`

**Campo `transformation_produces_id` — explicación de la cadena:**

```
Semilla (SEM-GELATO)
  └── transformation_produces_id → Plántula (PLN-GELATO)
        └── transformation_produces_id → Planta Vegetativa (VEG-GELATO)
              └── transformation_produces_id → Planta en Floración (FLO-GELATO)
                    └── transformation_produces_id → Flor Húmeda (WET-GELATO)
                          └── transformation_produces_id → Flor Seca (DRY-GELATO)
                                └── transformation_produces_id → Flor Trimmeada (TRM-GELATO)
                                      └── transformation_produces_id → NULL (producto final)
```

Esto permite que el sistema **sugiera automáticamente** qué producto crear cuando se ejecuta una transformación, y permite recorrer la cadena completa para trazabilidad.

### 3.4. Tabla: `inventory_items` (EVOLUCIONADA)

Se mantiene como instancia física de stock. Cambios mínimos: FK a unidades, se eliminan campos de transformación que migran a transactions.

```
inventory_items
├── id                      UUID (PK)
├── product_id              FK → products
├── area_id                 FK → areas
├── supplier_id             FK → suppliers (nullable)
│
│   -- Cantidades (sin cambio) --
├── quantity_available       DECIMAL DEFAULT 0
├── quantity_reserved        DECIMAL DEFAULT 0
├── quantity_committed       DECIMAL DEFAULT 0
│
│   -- CAMBIA: unit string → FK --
├── unit_id ★               FK → units_of_measure  -- Reemplaza quantity_unit string
│
│   -- Lote (sin cambio) --
├── batch_number             VARCHAR (nullable)
├── supplier_lot_number      VARCHAR (nullable)
├── serial_numbers           TEXT[] (nullable)
│
│   -- Fechas (sin cambio) --
├── received_date            DATE (nullable)
├── manufacturing_date       DATE (nullable)
├── expiration_date          DATE (nullable)
├── last_tested_date         DATE (nullable)
├── last_movement_date       TIMESTAMPTZ
│
│   -- Financiero (sin cambio) --
├── purchase_price           DECIMAL (nullable)
├── cost_per_unit            DECIMAL (nullable)
├── current_value            DECIMAL (nullable)
│
│   -- Calidad (sin cambio) --
├── quality_grade            VARCHAR (nullable)
├── quality_notes            TEXT (nullable)
├── certificates             TEXT[] (nullable)
│
│   -- Origen (evoluciona) --
├── source_type              ENUM ['purchase', 'production', 'transfer', 'transformation'] ★ +transformation
├── source_recipe_id         FK → recipes (nullable)
├── source_batch_id          FK → batches (nullable)
├── production_date          DATE (nullable)
│
│   -- Almacenamiento (sin cambio) --
├── storage_conditions       VARCHAR (nullable)
├── minimum_stock_level      DECIMAL (nullable)
├── maximum_stock_level      DECIMAL (nullable)
├── reorder_point            DECIMAL (nullable)
├── lead_time_days           INT (nullable)
│
│   -- Estado (sin cambio) --
├── lot_status               ENUM ['available', 'reserved', 'expired', 'quarantine', 'discontinued']
│
│   -- Creación (sin cambio) --
├── created_by_activity_id   FK → activities (nullable)
├── created_at               TIMESTAMPTZ
├── updated_at               TIMESTAMPTZ
│
│   -- ❌ ELIMINADOS (migran a inventory_transactions) --
│   -- transformation_status → se infiere del estado del item y sus transactions
│   -- transformed_to_item_id → migra a transactions.target_item_id
│   -- transformed_by_activity_id → migra a transactions.activity_id
```

### 3.5. Tabla: `inventory_transactions` (NUEVA — TABLA CORE)

Registro INMUTABLE de cada movimiento de inventario. Esta es la tabla más importante del sistema.

**Principio fundamental:** Nunca se edita ni elimina un registro. Para corregir un error, se crea una transacción de ajuste inversa.

```
inventory_transactions
├── id                      UUID (PK)
├── company_id              FK → companies
│
│   -- Tipo de movimiento --
├── type                    ENUM [
│                             'receipt',              -- Compra/recepción (+)
│                             'consumption',          -- Consumo general (-)
│                             'application',          -- Aplicación a cultivo (-) — vinculada a zona/batch/fase
│                             'transfer_out',         -- Salida por transferencia (-)
│                             'transfer_in',          -- Entrada por transferencia (+)
│                             'transformation_out',   -- Consumo en transformación (-)
│                             'transformation_in',    -- Producción por transformación (+)
│                             'adjustment_positive',  -- Ajuste positivo por inventario físico (+)
│                             'adjustment_negative',  -- Ajuste negativo por inventario físico (-)
│                             'waste',                -- Descarte/merma (-) — requiere razón
│                             'return_to_supplier',   -- Devolución a proveedor (-)
│                             'reservation',          -- Reserva (mueve available → reserved)
│                             'release'               -- Liberación de reserva (mueve reserved → available)
│                           ]
│
│   -- Item y cantidad --
├── inventory_item_id       FK → inventory_items     -- El item afectado
├── product_id              FK → products            -- Denormalizado para queries rápidas
├── quantity                DECIMAL NOT NULL          -- Siempre POSITIVO. El type determina dirección.
├── unit_id                 FK → units_of_measure
│
│   -- Temporalidad --
├── timestamp               TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- Momento real (inmutable)
├── effective_date          DATE NOT NULL DEFAULT CURRENT_DATE   -- Fecha lógica (puede diferir)
│
│   -- Vínculos contextuales (todos opcionales) --
├── area_id                 FK → areas (nullable)              -- Área/almacén
├── zone_id                 FK → zones (nullable)              -- Zona de cultivo (modelo de capacidad)
├── batch_id                FK → batches (nullable)            -- Lote de producción/cultivo
├── crop_phase              ENUM [
│                             'propagation',
│                             'vegetative',
│                             'flowering',
│                             'harvest',
│                             'post_harvest',
│                             'processing',
│                             'packaging'
│                           ] (nullable)
├── activity_id             FK → activities (nullable)         -- Actividad que generó el movimiento
├── recipe_execution_id     FK → recipe_executions (nullable)  -- Ejecución de receta/BOM
│
│   -- Vínculos de transformación/transferencia --
├── related_transaction_id  FK → self (nullable)               -- Vincula pares: out ↔ in
├── target_item_id          FK → inventory_items (nullable)    -- Para transform: el item destino
│
│   -- Financiero --
├── cost_per_unit           DECIMAL (nullable)                 -- Costo unitario al momento
├── cost_total              DECIMAL (nullable)                 -- qty × cost_per_unit (inmutable)
│
│   -- Auditoría --
├── user_id                 FK → users NOT NULL                -- Quién ejecutó
├── reason                  TEXT (nullable)                     -- Obligatorio para waste y adjustments
├── evidence_url            VARCHAR (nullable)                 -- Foto, documento, COA
├── notes                   TEXT (nullable)
│
├── created_at              TIMESTAMPTZ DEFAULT NOW()
└── updated_at              TIMESTAMPTZ  -- Solo para soft metadata, qty nunca cambia
```

**Índices:**

```sql
CREATE INDEX idx_tx_item ON inventory_transactions (inventory_item_id, timestamp DESC);
CREATE INDEX idx_tx_product ON inventory_transactions (product_id, timestamp DESC);
CREATE INDEX idx_tx_company_type ON inventory_transactions (company_id, type, timestamp DESC);
CREATE INDEX idx_tx_batch ON inventory_transactions (batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_tx_zone ON inventory_transactions (zone_id) WHERE zone_id IS NOT NULL;
CREATE INDEX idx_tx_recipe_exec ON inventory_transactions (recipe_execution_id) WHERE recipe_execution_id IS NOT NULL;
CREATE INDEX idx_tx_activity ON inventory_transactions (activity_id) WHERE activity_id IS NOT NULL;
CREATE INDEX idx_tx_related ON inventory_transactions (related_transaction_id) WHERE related_transaction_id IS NOT NULL;
CREATE INDEX idx_tx_effective_date ON inventory_transactions (company_id, effective_date DESC);
```

**Regla de dirección de cantidad:**

| Tipo | Dirección | Afecta en inventory_items |
|------|-----------|---------------------------|
| receipt | + | quantity_available += qty |
| consumption | - | quantity_available -= qty |
| application | - | quantity_available -= qty |
| transfer_out | - | quantity_available -= qty (item origen) |
| transfer_in | + | quantity_available += qty (item destino) |
| transformation_out | - | quantity_available -= qty (input consumido) |
| transformation_in | + | quantity_available += qty (output producido) |
| adjustment_positive | + | quantity_available += qty |
| adjustment_negative | - | quantity_available -= qty |
| waste | - | quantity_available -= qty |
| return_to_supplier | - | quantity_available -= qty |
| reservation | ± | quantity_available -= qty, quantity_reserved += qty |
| release | ± | quantity_reserved -= qty, quantity_available += qty |

### 3.6. Tabla: `recipe_executions` (NUEVA)

Cada vez que se ejecuta una receta/BOM. Agrupa las N transacciones de input + M de output.

```
recipe_executions
├── id                      UUID (PK)
├── company_id              FK → companies
├── recipe_id               FK → recipes
│
│   -- Ejecución --
├── executed_at             TIMESTAMPTZ
├── executed_by             FK → users
├── scale_factor            DECIMAL NOT NULL         -- receta base=1000L, se hicieron 500L → 0.5
│
│   -- Output --
├── output_quantity_expected DECIMAL (nullable)      -- Lo que debería producir
├── output_quantity_actual  DECIMAL (nullable)       -- Lo que realmente se produjo
├── output_item_id          FK → inventory_items (nullable)  -- El item creado/incrementado
├── yield_pct               DECIMAL GENERATED ALWAYS AS (
│                             CASE WHEN output_quantity_expected > 0
│                             THEN (output_quantity_actual / output_quantity_expected) * 100
│                             ELSE NULL END
│                           )
│
│   -- Contexto --
├── batch_id                FK → batches (nullable)
├── zone_id                 FK → zones (nullable)
├── activity_id             FK → activities (nullable)
│
│   -- Calidad --
├── quality_notes           TEXT (nullable)
├── measured_ec             DECIMAL (nullable)       -- EC medido post-mezcla
├── measured_ph             DECIMAL (nullable)       -- pH medido post-mezcla
│
│   -- Estado --
├── status                  ENUM ['planned', 'in_progress', 'completed', 'cancelled']
├── created_at              TIMESTAMPTZ
└── updated_at              TIMESTAMPTZ
```

**Índices:** `(company_id, recipe_id)`, `(batch_id)`, `(status, executed_at DESC)`

### 3.7. Relaciones entre tablas

```
resource_categories ←──── products ←──── inventory_items ←──── inventory_transactions
      (jerarquía)          (catálogo)       (instancia)            (movimientos)
                               │                                        │
                               │                                        │
                     units_of_measure                          recipe_executions
                       (conversiones)                           (ejecución BOM)
                                                                       │
                                                                   recipes
                                                                (definición BOM)
                                                                       │
                                                                 recipe_items
                                                               (ingredientes)
```

**Relaciones clave:**
- `resource_categories.parent_id → resource_categories.id` (jerarquía)
- `products.category_id → resource_categories.id`
- `products.transformation_produces_id → products.id` (cadena de transformación)
- `products.default_unit_id → units_of_measure.id`
- `inventory_items.product_id → products.id`
- `inventory_items.unit_id → units_of_measure.id`
- `inventory_transactions.inventory_item_id → inventory_items.id`
- `inventory_transactions.related_transaction_id → inventory_transactions.id` (pares)
- `inventory_transactions.target_item_id → inventory_items.id`
- `inventory_transactions.recipe_execution_id → recipe_executions.id`
- `recipe_executions.recipe_id → recipes.id`
- `recipe_executions.output_item_id → inventory_items.id`

---

## 4. Categorías de Recursos

### 4.1. Árbol de categorías base (11 categorías raíz, 47 subcategorías)

```
🌱 Material Vegetal (plant_material) [consumable, transformable, lot:required]
├── Semillas (seed)
├── Esquejes / Clones (clone)
├── Plántulas (seedling)
├── Plantas Madre (mother_plant)
├── Árboles / Portainjertos (rootstock)
├── Planta Vegetativa (plant_vegetative)
├── Planta en Floración (plant_flowering)
├── Cosecha Húmeda (harvest_wet)
├── Cosecha Seca (harvest_dry)
├── Material Trimmeado (trimmed)
└── Producto Vegetal Procesado (processed_plant)

🪨 Sustratos y Medios (substrate) [consumable, lot:optional]
├── Fibra de Coco (coco_coir)
├── Turba / Peat (peat)
├── Perlita / Vermiculita (perlite)
├── Lana de Roca (rockwool)
├── Mezclas Preparadas (substrate_mix)
└── Suelo / Enmiendas (soil_amendment)

🧪 Nutrientes y Fertilizantes (nutrient) [consumable, lot:optional]
├── Sales Minerales Simples (mineral_salt)
├── Fertilizantes Compuestos (compound_fert)
├── Micronutrientes / Quelatos (micronutrient)
├── Enmiendas Orgánicas (organic_amendment)
├── Reguladores de pH (ph_adjuster)
└── Soluciones Madre Preparadas (stock_solution)

🛡️ Protección de Cultivos (crop_protection) [consumable, lot:required]
├── Insecticidas (insecticide)
├── Fungicidas (fungicide)
├── Herbicidas (herbicide)
├── Biocontroladores (biocontrol)
└── Coadyuvantes (adjuvant)

💧 Agua y Soluciones (water) [consumable, lot:none]
├── Agua Cruda (raw_water)
├── Agua Tratada (treated_water)
├── Solución Nutritiva Final (nutrient_solution)
└── Soluciones de Aplicación (spray_solution)

⚡ Energía y Ambiente (energy) [consumable, lot:none]
├── Electricidad (electricity)
├── Gas Natural / Propano (gas)
├── CO₂ Suplementario (co2)
└── Combustibles (fuel)

📦 Empaque y Etiquetado (packaging) [consumable, lot:optional]
├── Contenedores Primarios (primary_container)
├── Etiquetas y Marcas (label)
├── Embalaje Secundario (secondary_packaging)
└── Materiales de Transporte (transport_material)

🔧 Equipamiento y Activos (equipment) [NOT consumable, depreciable, lot:none]
├── Iluminación (lighting)
├── Clima / HVAC (hvac)
├── Riego y Fertirrigación (irrigation)
├── Maquinaria de Campo (field_machinery)
├── Procesamiento / Poscosecha (processing_equipment)
└── Automatización / Sensores (automation)

🧤 Consumibles y Herramientas (consumable_tool) [consumable, lot:none]
├── EPP / Higiene (ppe)
├── Herramientas de Cultivo (cultivation_tool)
├── Contenedores de Cultivo (growing_container)
└── Limpieza y Sanitización (cleaning)

👷 Mano de Obra (labor) [consumable, lot:none]
├── Cultivo / Producción (labor_cultivation)
├── Procesamiento (labor_processing)
├── Mantenimiento (labor_maintenance)
└── Técnico / Especializado (labor_technical)

🏢 Servicios Externos (service) [consumable, lot:none]
├── Análisis de Laboratorio (lab_testing)
├── Alquiler de Equipos (equipment_rental)
├── Consultoría Técnica (consulting)
├── Transporte / Logística (transport)
└── Certificaciones / Licencias (certification)
```

### 4.2. Configuración por categoría

| Categoría | is_consumable | is_depreciable | is_transformable | lot_tracking | Notas |
|-----------|:---:|:---:|:---:|:---:|-------|
| Material Vegetal | ✅ | ❌ | ✅ | required | Cada transformación genera nuevo producto |
| Sustratos | ✅ | ❌ | ❌ | optional | A granel no necesita lote; slabs individuales sí |
| Nutrientes | ✅ | ❌ | ❌ | optional | Sales a granel=optional; soluciones preparadas=required |
| Protección Cultivos | ✅ | ❌ | ❌ | required | Regulatorio: siempre requiere lote para trazabilidad |
| Agua | ✅ | ❌ | ❌ | none | Se trackea por volumen, no por lote |
| Energía | ✅ | ❌ | ❌ | none | Se trackea por consumo (kWh, m³), no por lote |
| Empaque | ✅ | ❌ | ❌ | optional | Lote es útil pero no obligatorio |
| Equipamiento | ❌ | ✅ | ❌ | none | Se deprecia; no se "consume" — tiene vida útil |
| Consumibles | ✅ | ❌ | ❌ | none | Se reponen frecuentemente, sin trazabilidad de lote |
| Mano de Obra | ✅ | ❌ | ❌ | none | Se registra como hora-persona consumida |
| Servicios | ✅ | ❌ | ❌ | none | Se registra por evento/factura |

---

## 5. Cadena de Transformación del Material Vegetal

### 5.1. Productos en el catálogo para un ciclo de cannabis

Cada estado del material vegetal es un **producto distinto** con su propio SKU:

| # | Producto | SKU | Categoría | Unidad | Procurement | Lot Tracking | Yield Esperado | Transforma A |
|---|----------|-----|-----------|--------|:-----------:|:------------:|:--------------:|:------------:|
| 1 | Semilla Gelato Fem | SEM-GELATO-FEM | seed | unit | purchased | required | — | → PLN-GELATO |
| 2 | Plántula Gelato | PLN-GELATO | seedling | unit | produced | required | 90% | → VEG-GELATO |
| 3 | Planta Vegetativa Gelato | VEG-GELATO | plant_vegetative | unit | produced | required | 95% | → FLO-GELATO |
| 4 | Planta en Floración Gelato | FLO-GELATO | plant_flowering | unit | produced | required | 98% | → WET-GELATO |
| 5 | Flor Húmeda Gelato | WET-GELATO | harvest_wet | kg | produced | required | ~500g/planta | → DRY-GELATO |
| 6 | Flor Seca Gelato | DRY-GELATO | harvest_dry | kg | produced | required | 25% (4:1) | → TRM-GELATO |
| 7 | Flor Trimmeada Gelato | TRM-GELATO | trimmed | g | produced | required | 80% | → NULL (final) |
| 8 | Trim Seco | TRIM-SECO | trimmed | g | produced | required | 20% | → NULL (subproducto) |

### 5.2. Ejemplo de flujo completo con transacciones

**Paso 1: Compra de semillas**

Transacciones generadas:

```
TX-001  receipt           SEM-GELATO-FEM  +50 units   INV-SEM-001 (nuevo)
        cost_per_unit: $3.50, cost_total: $175.00
        supplier_id: DutchPassion, lot: DP-2026-0422
```

**Paso 2: Germinación (transformación)**

Se ejecuta recipe "Germinación". Scale_factor = 50 (50 semillas).

```
recipe_execution RE-001:
  recipe_id: REC-GERMINACION
  scale_factor: 50
  output_expected: 45 (90% yield)
  output_actual: 45
  yield_pct: 100% (del esperado)

TX-002  transformation_out  SEM-GELATO-FEM  -50 units  INV-SEM-001
        recipe_execution_id: RE-001
        crop_phase: propagation

TX-003  transformation_in   PLN-GELATO      +45 units  INV-PLN-001 (nuevo)
        recipe_execution_id: RE-001
        related_transaction_id: TX-002
        source_type: transformation

TX-004  waste               SEM-GELATO-FEM  -5 units   INV-SEM-001
        reason: "No germinación (5 de 50)"
        recipe_execution_id: RE-001
```

Resultado en inventory_items:
- INV-SEM-001: quantity_available = 0 (50 - 50 - 5 + 5 consumidas vía transformation)
- INV-PLN-001: quantity_available = 45, source_type = 'transformation'

**Paso 3: Fertirrigación semana 2**

Se ejecuta recipe "Sol. Nutritiva Vegetativa Sem 2", escalada a 200L:

```
recipe_execution RE-002:
  recipe_id: REC-NUTRIENT-VEG-SEM2
  scale_factor: 0.2 (base = 1000L, se hacen 200L)

TX-005  application   Nitrato de Calcio    -0.5 kg   INV-CANO3-003
        zone_id: ZONE-VEG-A, batch_id: BATCH-PLN-001
        crop_phase: vegetative, recipe_execution_id: RE-002
        cost_per_unit: $1.20/kg, cost_total: $0.60

TX-006  application   Sulfato de Magnesio  -0.3 kg   INV-MGSO4-007
        zone_id: ZONE-VEG-A, batch_id: BATCH-PLN-001
        crop_phase: vegetative, recipe_execution_id: RE-002
        cost_per_unit: $0.80/kg, cost_total: $0.24

TX-007  application   Agua RO              -200 L    INV-H2O-BULK
        zone_id: ZONE-VEG-A, batch_id: BATCH-PLN-001
        crop_phase: vegetative, recipe_execution_id: RE-002
        cost_per_unit: $0.005/L, cost_total: $1.00
```

**Paso 4: Cosecha (transformación multi-output)**

```
recipe_execution RE-005:
  recipe_id: REC-COSECHA-CANNABIS
  scale_factor: 42 (42 plantas)
  output_expected: 21 kg flor húmeda
  output_actual: 21 kg

TX-020  transformation_out  FLO-GELATO      -42 units  INV-FLO-001
        crop_phase: harvest, recipe_execution_id: RE-005

TX-021  transformation_in   WET-GELATO      +21 kg     INV-WET-001 (nuevo)
        related_transaction_id: TX-020
        recipe_execution_id: RE-005

TX-022  transformation_in   TRIM-HUMEDO     +8.4 kg    INV-TRIMH-001 (nuevo)
        related_transaction_id: TX-020
        recipe_execution_id: RE-005

TX-023  waste               Residuo vegetal  ~50 kg    —
        reason: "Tallos, raíces, material no aprovechable"
        recipe_execution_id: RE-005
```

### 5.3. Cálculo de COGS por lote

Con todas las transacciones vinculadas a `batch_id` y `crop_phase`:

```sql
-- COGS total del lote BATCH-PLN-001
SELECT
  crop_phase,
  SUM(cost_total) as phase_cost
FROM inventory_transactions
WHERE batch_id = 'BATCH-PLN-001'
  AND type IN ('application', 'consumption', 'transformation_out')
GROUP BY crop_phase
ORDER BY
  CASE crop_phase
    WHEN 'propagation' THEN 1
    WHEN 'vegetative' THEN 2
    WHEN 'flowering' THEN 3
    WHEN 'harvest' THEN 4
    WHEN 'post_harvest' THEN 5
  END;
```

Resultado ejemplo:

| Fase | Costo |
|------|------:|
| propagation | $175.00 (semillas) |
| vegetative | $342.50 (nutrientes + sustrato + energía) |
| flowering | $1,280.00 (nutrientes + energía + biocontrol) |
| harvest | $85.00 (mano de obra) |
| post_harvest | $120.00 (secado + trimming) |
| **TOTAL** | **$2,002.50** |
| **Producción** | **4,200 g trimmeados** |
| **COGS/g** | **$0.477/g** |

---

## 6. Funciones y Endpoints a Desarrollar

### 6.1. Módulo: Resource Categories

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-01 | Listar categorías (árbol) | GET | `/resource-categories` | Retorna árbol jerárquico. Query params: `flat=true` para lista plana, `root_only=true` para solo raíces. |
| F-02 | Crear categoría | POST | `/resource-categories` | Validar: `parent_id` debe existir si se envía. `code` unique por company. Heredar flags del padre si no se especifican. |
| F-03 | Actualizar categoría | PATCH | `/resource-categories/:id` | No permitir cambiar `parent_id` si tiene products hijos (requiere migración). |
| F-04 | Seed de categorías base | POST | `/resource-categories/seed` | Carga las 11 categorías raíz + 47 subcategorías para una empresa nueva. Idempotente. |

### 6.2. Módulo: Units of Measure

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-05 | Listar unidades | GET | `/units` | Filtrar por dimensión. Incluir factor de conversión. |
| F-06 | Convertir unidad | GET | `/units/convert` | Params: `from_unit_id`, `to_unit_id`, `quantity`. Retorna cantidad convertida. Validar misma dimensión. |
| F-07 | Seed de unidades base | POST | `/units/seed` | Carga las ~18 unidades base del sistema. Idempotente. |

### 6.3. Módulo: Products (evolución)

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-08 | Migrar category ENUM → FK | Migration | — | Script que mapea cada valor del ENUM actual a un `resource_categories.id`. |
| F-09 | Migrar default_unit → FK | Migration | — | Script que mapea cada string de unidad a un `units_of_measure.id`. |
| F-10 | Obtener cadena de transformación | GET | `/products/:id/transformation-chain` | Recorre `transformation_produces_id` recursivamente. Retorna array ordenado de la cadena completa. |
| F-11 | Configurar cadena de transformación | POST | `/products/:id/transformation-chain` | Recibe array de product_ids ordenados. Asigna `transformation_produces_id` en cascada. |

### 6.4. Módulo: Inventory Transactions (NUEVO — Core)

#### 6.4.1. Transacciones de entrada

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-12 | Recepción de compra | POST | `/inventory/receive` | Crea `inventory_item` (o incrementa existente si mismo producto+área+lote). Genera transaction tipo `receipt`. Calcula `expiration_date` si `shelf_life_days` existe. Valida `lot_tracking` según categoría. |
| F-13 | Ajuste positivo | POST | `/inventory/adjust` | Params: `item_id`, `quantity`, `reason` (obligatorio). Genera transaction `adjustment_positive`. |

**Payload F-12 (Recepción):**

```json
{
  "product_id": "uuid",
  "area_id": "uuid",
  "supplier_id": "uuid | null",
  "quantity": 50,
  "unit_id": "uuid",
  "batch_number": "auto | string | null",
  "supplier_lot_number": "string | null",
  "cost_per_unit": 3.50,
  "purchase_price": 175.00,
  "received_date": "2026-02-10",
  "quality_grade": "A | null",
  "storage_conditions": "string | null",
  "certificates": ["url1", "url2"],
  "notes": "string | null"
}
```

**Lógica de F-12:**

1. Validar `product.lot_tracking`:
   - Si `required` y no se envía `batch_number` → auto-generar (formato: `{SKU_PREFIX}-{YYMMDD}-{SEQ}`).
   - Si `none` → ignorar `batch_number` aunque se envíe.
2. Si `product.shelf_life_days` existe y no se envía `expiration_date`:
   - `expiration_date = received_date + shelf_life_days`.
3. Crear `inventory_item` con `source_type = 'purchase'`, `lot_status = 'available'`.
4. Crear `inventory_transaction` tipo `receipt`.
5. Retornar item + transaction.

#### 6.4.2. Transacciones de salida

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-14 | Consumo general | POST | `/inventory/consume` | Resta qty del item. Genera transaction `consumption`. No requiere contexto de cultivo. |
| F-15 | Aplicación a cultivo | POST | `/inventory/apply` | Resta qty del item. Genera transaction `application`. REQUIERE: `zone_id` y/o `batch_id` + `crop_phase`. Es la transacción que alimenta COGS. |
| F-16 | Descarte / Waste | POST | `/inventory/waste` | Resta qty. Genera transaction `waste`. REQUIERE `reason`. Opcional: `evidence_url` (foto del material descartado). |
| F-17 | Devolución a proveedor | POST | `/inventory/return` | Resta qty. Genera transaction `return_to_supplier`. Debe vincular al supplier original del item. |
| F-18 | Ajuste negativo | POST | `/inventory/adjust` | (Mismo endpoint que F-13, quantity negativa). Genera `adjustment_negative`. REQUIERE `reason`. |

**Payload F-15 (Aplicación a cultivo):**

```json
{
  "inventory_item_id": "uuid",
  "quantity": 0.5,
  "unit_id": "uuid",
  "zone_id": "uuid",
  "batch_id": "uuid | null",
  "crop_phase": "vegetative",
  "activity_id": "uuid | null",
  "recipe_execution_id": "uuid | null",
  "notes": "Aplicación foliar de micro semana 3"
}
```

**Lógica de F-15:**

1. Validar `quantity <= inventory_item.quantity_available`.
2. Si `unit_id` difiere de `inventory_item.unit_id`, convertir usando `units_of_measure.to_base_factor`.
3. Calcular `cost_total = quantity × inventory_item.cost_per_unit`.
4. Crear transaction tipo `application`.
5. Actualizar `inventory_item.quantity_available -= quantity`.
6. Actualizar `inventory_item.last_movement_date = NOW()`.
7. Si producto tiene `phi_days` > 0: crear alerta de PHI en zona (fecha cosecha segura = effective_date + phi_days).
8. Si producto tiene `rei_hours` > 0: crear alerta de REI (momento re-entrada segura = timestamp + rei_hours).

#### 6.4.3. Transacciones de transferencia

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-19 | Transferencia entre áreas | POST | `/inventory/transfer` | Genera par de transactions: `transfer_out` en origen + `transfer_in` en destino. Puede crear nuevo item en destino o incrementar existente. `related_transaction_id` vincula el par. |

**Payload F-19:**

```json
{
  "source_item_id": "uuid",
  "target_area_id": "uuid",
  "quantity": 10,
  "unit_id": "uuid",
  "notes": "Mover perlita de bodega a sala de mezclas"
}
```

**Lógica de F-19:**

1. Validar `quantity <= source_item.quantity_available`.
2. Buscar `inventory_item` existente en target_area con mismo product_id + batch_number + lot_status.
   - Si existe → incrementar quantity.
   - Si no existe → crear nuevo item clonando metadata del source.
3. Crear TX `transfer_out` para source (resta qty).
4. Crear TX `transfer_in` para target (suma qty).
5. Vincular ambas TX con `related_transaction_id`.
6. Actualizar quantities en ambos items.

#### 6.4.4. Transacciones de transformación

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-20 | Transformación simple | POST | `/inventory/transform` | Consume un item → produce otro. Usa `product.transformation_produces_id` para determinar el producto destino. Calcula yield. Registra waste opcional. |
| F-21 | Transformación multi-output | POST | `/inventory/transform-multi` | Consume uno o más items → produce múltiples outputs. Para cosecha que genera flor + trim + residuo. |

**Payload F-20 (Transformación simple):**

```json
{
  "source_item_id": "uuid",
  "quantity_consumed": 50,
  "quantity_produced": 45,
  "target_area_id": "uuid",
  "target_product_id": "uuid | auto",
  "waste_quantity": 5,
  "waste_reason": "No germinación",
  "activity_id": "uuid | null",
  "crop_phase": "propagation",
  "batch_id": "uuid | null",
  "notes": "Germinación lote febrero"
}
```

**Lógica de F-20:**

1. Si `target_product_id = 'auto'`:
   - Obtener `source_product.transformation_produces_id`.
   - Si es null → error "Producto no tiene transformación definida".
2. Validar `quantity_consumed <= source_item.quantity_available`.
3. Crear nuevo `inventory_item` para output:
   - `product_id = target_product_id`
   - `source_type = 'transformation'`
   - `quantity_available = quantity_produced`
   - Auto-generar `batch_number`.
4. Crear TX `transformation_out` (consume source).
5. Crear TX `transformation_in` (produce target).
6. Vincular con `related_transaction_id`.
7. Si `waste_quantity > 0`: crear TX `waste` con reason.
8. Calcular yield: `quantity_produced / (quantity_consumed - waste_quantity) × 100`.
9. Comparar yield vs `source_product.default_yield_pct` → alertar si desviación > 10%.

**Payload F-21 (Transformación multi-output):**

```json
{
  "inputs": [
    { "inventory_item_id": "uuid", "quantity": 42, "unit_id": "uuid" }
  ],
  "outputs": [
    { "product_id": "uuid-flor-humeda", "quantity": 21, "unit_id": "uuid-kg", "area_id": "uuid" },
    { "product_id": "uuid-trim", "quantity": 8.4, "unit_id": "uuid-kg", "area_id": "uuid" }
  ],
  "waste": {
    "quantity": 50,
    "unit_id": "uuid-kg",
    "reason": "Tallos, raíces, material no aprovechable"
  },
  "activity_id": "uuid",
  "crop_phase": "harvest",
  "batch_id": "uuid",
  "notes": "Cosecha sala B - Gelato"
}
```

#### 6.4.5. Ejecución de recetas (BOM)

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-22 | Previsualizar ejecución de receta | POST | `/recipes/:id/preview` | Calcula cantidades necesarias según scale_factor. Verifica stock disponible de cada ingrediente (FIFO/FEFO). Retorna si hay stock suficiente y de qué lotes se tomaría. NO ejecuta nada. |
| F-23 | Ejecutar receta | POST | `/recipes/:id/execute` | Crea `recipe_execution`. Genera N transactions `transformation_out` (una por ingrediente) + 1-M transactions `transformation_in` (outputs). Todas vinculadas al mismo `recipe_execution_id`. |
| F-24 | Aplicar receta a cultivo | POST | `/recipes/:id/apply` | Variante de F-23 para recetas de fertirrigación/spray. En vez de `transformation_out/in`, genera transactions tipo `application` (porque no hay output — se aplica directamente al cultivo). REQUIERE zona + batch + fase. |

**Payload F-22 (Preview):**

```json
{
  "scale_factor": 0.5,
  "target_area_id": "uuid",
  "zone_id": "uuid | null",
  "batch_id": "uuid | null"
}
```

**Respuesta F-22:**

```json
{
  "recipe": { "name": "Sol. Nutritiva Floración Sem 4-6", "base_output": "1000 L" },
  "scaled_output": "500 L",
  "ingredients": [
    {
      "product": "Nitrato de Calcio",
      "required_qty": 0.25,
      "unit": "kg",
      "available_items": [
        { "item_id": "uuid", "batch": "NC-2026-001", "available": 10.0, "expiry": "2027-01-15", "will_use": 0.25 }
      ],
      "sufficient": true
    },
    {
      "product": "Sulfato de Magnesio",
      "required_qty": 0.15,
      "unit": "kg",
      "available_items": [],
      "sufficient": false,
      "deficit": 0.15
    }
  ],
  "all_sufficient": false,
  "missing_ingredients": ["Sulfato de Magnesio: faltan 0.15 kg"]
}
```

**Lógica de F-23 (Ejecutar receta):**

1. Obtener recipe + recipe_items.
2. Calcular qty de cada ingrediente × `scale_factor`.
3. Para cada ingrediente, seleccionar items por FIFO (received_date ASC) o FEFO (expiration_date ASC):
   - Si un item no tiene suficiente qty, tomar parcial y continuar con el siguiente.
4. Validar que todos los ingredientes tengan stock suficiente. Si no → error con detalle de faltantes.
5. Crear `recipe_execution` con status = 'in_progress'.
6. Para cada ingrediente:
   - Crear TX `transformation_out` con: item_id, quantity, recipe_execution_id.
   - Actualizar `inventory_item.quantity_available`.
7. Si la receta tiene output_resource:
   - Crear nuevo `inventory_item` para el output.
   - Crear TX `transformation_in`.
8. Actualizar `recipe_execution.status = 'completed'`.
9. Calcular yield si aplica.
10. Retornar execution + todas las transactions generadas.

#### 6.4.6. Reservas

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-25 | Reservar stock | POST | `/inventory/reserve` | Mueve qty de `available` a `reserved`. Genera TX `reservation`. |
| F-26 | Liberar reserva | POST | `/inventory/release` | Mueve qty de `reserved` a `available`. Genera TX `release`. |
| F-27 | Confirmar reserva (commit) | POST | `/inventory/commit` | Mueve qty de `reserved` a `committed` y genera la transacción de consumo real. |

#### 6.4.7. Queries y reportes

| # | Función | Método | Ruta | Descripción |
|---|---------|--------|------|-------------|
| F-28 | Historial de movimientos por item | GET | `/inventory/:item_id/transactions` | Lista todas las transactions de un item, paginadas, con filtros por tipo y rango de fecha. |
| F-29 | Historial de movimientos por producto | GET | `/products/:id/transactions` | Agrega transactions de todos los items de un producto. |
| F-30 | COGS por batch/zona/fase | GET | `/reports/cogs` | Params: `batch_id`, `zone_id`, `crop_phase`, `date_range`. Retorna SUM(cost_total) agrupado según params. |
| F-31 | Yield tracking | GET | `/reports/yield` | Compara `default_yield_pct` vs yield real por producto transformable, por período. Identifica desviaciones. |
| F-32 | Stock valuation | GET | `/reports/valuation` | Valor total del inventario por categoría, área, producto. Método: costo promedio ponderado o FIFO. |
| F-33 | Reconciliación de inventario | POST | `/inventory/reconcile` | Recibe conteo físico por item. Genera transactions de ajuste (+/-) para cada diferencia. |
| F-34 | Trazabilidad completa de lote | GET | `/inventory/:item_id/trace` | Recorre `related_transaction_id` + `source_recipe_id` recursivamente hasta llegar al receipt original. Retorna la cadena completa: semilla → plántula → planta → cosecha → producto. |
| F-35 | Alertas de stock bajo | GET | `/alerts/low-stock` | Items donde `quantity_available < reorder_point`. Incluye lead_time y supplier info. |
| F-36 | Alertas de vencimiento | GET | `/alerts/expiring` | Items donde `expiration_date < NOW() + threshold_days`. FEFO ordering. |
| F-37 | Alertas PHI/REI activas | GET | `/alerts/phi-rei` | Zonas donde se aplicó un producto con PHI/REI y el intervalo aún no ha transcurrido. |

---

## 7. Reglas de Negocio y Validaciones

### 7.1. Validaciones de transacciones

| Regla | Aplica a | Validación |
|-------|----------|------------|
| R-01 | Toda salida | `quantity <= inventory_item.quantity_available`. Nunca permitir stock negativo. |
| R-02 | waste, adjustment_negative | `reason` es OBLIGATORIO. No se permite descarte sin explicación. |
| R-03 | application | `zone_id` O `batch_id` es OBLIGATORIO. No se permite aplicación a cultivo sin contexto. |
| R-04 | Productos con `lot_tracking = 'required'` | Al crear `inventory_item`, `batch_number` se auto-genera si no se envía, pero SIEMPRE debe existir. |
| R-05 | Productos con `phi_days > 0` | Al crear TX `application`, generar alerta de PHI automáticamente. |
| R-06 | Productos con `rei_hours > 0` | Al crear TX `application`, generar alerta de REI automáticamente. |
| R-07 | Productos expirados | `lot_status = 'expired'` no puede tener transacciones de `application` ni `consumption`. Solo `waste` o `return_to_supplier`. |
| R-08 | Conversión de unidades | Si TX.unit_id ≠ item.unit_id, verificar que ambas unidades son de la misma dimensión y convertir. |
| R-09 | Transformación | `transformation_out` siempre debe tener `related_transaction_id` → `transformation_in` (o grupo de). |
| R-10 | Recipe execution | Todas las TX de una ejecución deben tener el mismo `recipe_execution_id`. |
| R-11 | Inmutabilidad | Las transactions NUNCA se editan ni eliminan. Para corregir → crear adjustment inverso con `reason` explicando la corrección. |

### 7.2. Auto-generación de batch_number

Formato: `{CATEGORY_PREFIX}-{YYMMDD}-{SEQ_4_DIGITS}`

| Categoría | Prefix | Ejemplo |
|-----------|--------|---------|
| seed | SEM | SEM-260210-0001 |
| seedling | PLN | PLN-260215-0001 |
| plant_vegetative | VEG | VEG-260301-0001 |
| plant_flowering | FLO | FLO-260401-0001 |
| harvest_wet | HAR | HAR-260601-0001 |
| harvest_dry | DRY | DRY-260615-0001 |
| trimmed | TRM | TRM-260617-0001 |
| crop_protection | CPR | CPR-260210-0001 |
| nutrient | NUT | NUT-260210-0001 |
| stock_solution | SOL | SOL-260210-0001 |

### 7.3. Política FIFO/FEFO para consumo

Al consumir un producto, el sistema debe seleccionar automáticamente de qué items tomar:

1. **FEFO (First Expired, First Out):** Para productos con `expiration_date` no nulo. Consumir primero el lote que vence antes.
2. **FIFO (First In, First Out):** Para productos sin fecha de vencimiento. Consumir primero el lote recibido antes (`received_date` ASC).
3. **Manual override:** El usuario puede especificar `inventory_item_id` explícitamente para tomar de un lote específico.

Cuando un item no tiene suficiente stock, se consume parcial y se continúa con el siguiente item según la política.

---

## 8. Plan de Migración

### 8.1. Fases

#### Fase 0: Preparación (sin cambios en producción)

1. Crear tablas nuevas: `resource_categories`, `units_of_measure`, `inventory_transactions`, `recipe_executions`.
2. Seed de datos: categorías base, unidades base.
3. Scripts de mapeo: ENUM category → category_id, unit string → unit_id.
4. Tests unitarios para todas las funciones F-01 a F-37.

#### Fase 1: Tablas de soporte (bajo riesgo)

1. Deploy `resource_categories` + `units_of_measure` + seeds.
2. Agregar nuevos campos a `products`: `category_id`, `default_unit_id`, `procurement_type`, `lot_tracking`, `shelf_life_days`, `phi_days`, `rei_hours`, `transformation_produces_id`, `default_yield_pct`.
3. Ejecutar script de migración para popular `category_id` desde ENUM y `default_unit_id` desde string.
4. Mantener campos viejos (`category`, `default_unit`) temporalmente para backward compatibility.
5. Deploy endpoints F-01 a F-11.

#### Fase 2: Transactions (cambio principal)

1. Deploy tabla `inventory_transactions`.
2. Crear snapshot de todas las `inventory_items.quantity_available` como transactions tipo `adjustment_positive` con reason = "Migración: snapshot inicial" y fecha = momento de migración. Esto establece el baseline.
3. Deploy endpoints F-12 a F-21 (recepción, consumo, aplicación, transferencia, transformación).
4. Modificar toda lógica existente que mute `quantity_available` directamente → que pase por el endpoint de transactions.
5. Agregar `unit_id` a `inventory_items` (FK), popular desde string, mantener campo viejo temporalmente.

#### Fase 3: Recipes & Reports

1. Deploy `recipe_executions` + endpoints F-22 a F-24.
2. Deploy endpoints de reserva F-25 a F-27.
3. Deploy queries y reportes F-28 a F-37.

#### Fase 4: Cleanup

1. Eliminar campos deprecated de `inventory_items`: `transformation_status`, `transformed_to_item_id`, `transformed_by_activity_id`.
2. Eliminar `products.category` (ENUM), `products.default_unit` (string), `inventory_items.quantity_unit` (string).
3. Hacer `category_id` y `default_unit_id` NOT NULL.

### 8.2. Rollback plan

- Fase 0-1: las tablas nuevas son aditivas, no rompen nada existente. Rollback = drop tables.
- Fase 2: el snapshot de transactions permite recalcular quantities en cualquier momento. Si algo falla, revertir la lógica de mutations al estado anterior (los campos viejos se mantienen).
- Fase 3-4: solo se eliminan campos viejos después de verificar que todo funciona con los nuevos.

---

## 9. Estimación de Esfuerzo

### 9.1. Por módulo

| Módulo | Funciones | Complejidad | Estimación |
|--------|:---------:|:-----------:|:----------:|
| Resource Categories (F-01 a F-04) | 4 | Baja | 3-4 días |
| Units of Measure (F-05 a F-07) | 3 | Baja | 2-3 días |
| Products Evolution (F-08 a F-11) | 4 | Media | 4-5 días |
| Transactions Core (F-12 a F-18) | 7 | Alta | 8-10 días |
| Transfer (F-19) | 1 | Media | 2-3 días |
| Transformación (F-20, F-21) | 2 | Alta | 5-7 días |
| Recipe Execution (F-22 a F-24) | 3 | Alta | 5-7 días |
| Reservas (F-25 a F-27) | 3 | Media | 3-4 días |
| Reports & Queries (F-28 a F-37) | 10 | Media-Alta | 8-12 días |
| Migración de datos (Fases 1-4) | — | Alta | 5-7 días |
| **TOTAL** | **37** | | **45-62 días** |

### 9.2. Dependencias entre funciones

```
Fase 0 (paralelo):
  F-01..F-04 (Categories)  ──┐
  F-05..F-07 (Units)        ──┤── Fase 1
  F-08..F-09 (Migrations)  ──┘
                                │
Fase 1:                         ▼
  F-10..F-11 (Product chain) ──── Fase 2
                                │
Fase 2 (secuencial):           ▼
  F-12..F-13 (Receipt/Adjust) ──→ F-14..F-18 (Consumo) ──→ F-19 (Transfer) ──→ F-20..F-21 (Transform)
                                                                                      │
Fase 3 (paralelo):                                                                    ▼
  F-22..F-24 (Recipes) ────┐
  F-25..F-27 (Reservas) ───┤── F-28..F-37 (Reports)
                            │
Fase 4:                     ▼
  Cleanup campos deprecated
```

### 9.3. Prioridad de implementación

1. **Imprescindible (MVP):** F-12 (receipt), F-14 (consume), F-15 (apply), F-16 (waste), F-20 (transform simple), F-28 (history), F-34 (trace).
2. **Alta prioridad:** F-19 (transfer), F-22/F-23 (recipe preview/execute), F-30 (COGS), F-33 (reconcile).
3. **Media prioridad:** F-21 (transform multi), F-24 (recipe apply), F-25-27 (reserves), F-31/F-32 (yield/valuation).
4. **Puede esperar:** F-35-37 (alertas), F-01-F-04 (categories CRUD completo), mejoras de UI.
