# PHASE 2: BASIC SETUP - UI REQUIREMENTS

**Focus**: Core master data management and facility configuration
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md)
**API Endpoints**: See [../../api/PHASE-2-ENDPOINTS.md](../../api/PHASE-2-ENDPOINTS.md)

---

## Overview

Phase 2 establishes the foundational master data required for production operations. After onboarding (Phase 1), users configure their operational infrastructure by creating cultivation areas, defining cultivars, setting up supplier relationships, managing inventory, and configuring facility/account settings.

This phase uses the standard CRUD pattern (see [CRUD-PATTERN.md](CRUD-PATTERN.md)) for all entities.

**Total Modules**: 7 (MODULE 8, 15-21)
**Total Pages**: ~18 screens
**User Flow**: Non-linear - users can complete modules in any order
**Primary Users**: ADMIN, FACILITY_MANAGER
**Prerequisites**: Onboarding complete (Phase 1)
**Next Phase**: Templates configuration (Phase 3)

---

## Module Overview

| Module | Entity | Purpose | Status |
|--------|--------|---------|--------|
| **8** | Areas | Cultivation zones (rooms, greenhouses, etc.) | ✅ Backend Ready |
| **15** | Cultivars | Crop varieties (Cherry AK, Arabica, etc.) | ⚠️ Backend Pending |
| **16** | Suppliers | Input material providers | ⚠️ Backend Pending |
| **17** | User Invitations | Team member management | ⚠️ Backend Pending |
| **18** | Facility Management | Multi-facility operations | ⚠️ Backend Pending |
| **19** | Inventory | Stock management (plants, seeds, equipment, materials) | ⚠️ Backend Pending |
| **20** | Facility Settings | Facility-specific configuration | ⚠️ Backend Pending |
| **21** | Account Settings | User preferences and company settings | ⚠️ Backend Pending |

---

## Internationalization (i18n)

**Languages Supported**: Spanish (default), English

All UI texts in this document must be implemented using the i18n system. See [../../i18n/STRATEGY.md](../../i18n/STRATEGY.md) for complete implementation strategy.

**Implementation Approach**:
- All UI texts stored in Bubble Option Set `UI_Texts` with both Spanish and English translations
- Enum values (inventory categories, settings, etc.) stored in dedicated Option Sets
- Backend sends technical codes only, frontend handles translation
- Language switcher available in all pages

**Translation Tables**: Each module below includes translation tables following the same format as Phase 1.

For implementation details, see [../../i18n/BUBBLE-IMPLEMENTATION.md](../../i18n/BUBBLE-IMPLEMENTATION.md).

---

---

## Existing Modules (8, 15-18)

The following modules are already fully documented and follow the standard CRUD pattern:

### MODULE 8: Areas Management
**Reference**: See [PHASE-2-OPERATIONS.md](PHASE-2-OPERATIONS.md#module-8-areas-management) lines 36-607

**Summary**: Full CRUD for cultivation areas with:
- Areas List page (grid card view with environmental metrics)
- Create Area popup (2-column: Basic Info + Environmental Config)
- Area Detail page (tabs: Registro, Lotes, Historial)
- Area Edit page

**Key Features**: Climate control settings, capacity tracking, current occupancy, environmental monitoring

---

### MODULE 15: Cultivars Management
**Reference**: See [PHASE-2-OPERATIONS.md](PHASE-2-OPERATIONS.md#module-15-cultivars-management) lines 1569-1842

**Summary**: Full CRUD for crop varieties with:
- Cultivars List (grid card view filtered by crop type)
- Create Cultivar popup (Basic Info + Characteristics)
- Cultivar Detail page (General, Lotes, Historial tabs)
- Cultivar Edit page

**Key Features**: Variety type, flowering time, yield level, THC/CBD ranges, aroma/flavor profiles

---

### MODULE 16: Suppliers Management
**Reference**: See [PHASE-2-OPERATIONS.md](PHASE-2-OPERATIONS.md#module-16-suppliers-management) lines 1845-1950

**Summary**: Full CRUD for input material suppliers with:
- Suppliers List (table view with filters)
- Create Supplier popup (Basic Info + Product Categories)
- Supplier Detail page (General, Órdenes, Historial)
- Supplier Edit page

**Key Features**: Contact management, product categories (seeds, nutrients, equipment), purchase history

---

### MODULE 17: User Invitations
**Reference**: See [PHASE-2-OPERATIONS.md](PHASE-2-OPERATIONS.md#module-17-user-invitations) lines 1953-1997

**Summary**: Admin functionality for team management with:
- Users Management page (list with roles and status)
- Invite User popup (email + role assignment)
- Role management (FACILITY_MANAGER, PRODUCTION_SUPERVISOR, WORKER, QUALITY_CONTROLLER)

**Key Features**: Email invitations, role-based access control, facility-specific users

---

### MODULE 18: Facility Management
**Reference**: See [PHASE-2-OPERATIONS.md](PHASE-2-OPERATIONS.md#module-18-facility-management) lines 2000-2056

**Summary**: Multi-facility operations with:
- Facilities Management page (cards with facility info)
- Facility Switcher (global header dropdown)
- Add Facility functionality (if plan allows)

**Key Features**: Multi-facility context switching, plan-based limits, facility-scoped data

---

## New Modules (19-21)

The following modules are new additions to Phase 2 for complete master data management:

---

## MODULE 19: Inventory Management

**Pattern Reference**: See [CRUD-PATTERN.md](CRUD-PATTERN.md) for standard structure

Inventory manages all physical items required for operations: mother plants, seeds, clones, equipment, nutrients, pesticides, and other materials. This module provides full CRUD operations with stock tracking, consumption logging, and reorder alerts.

### Inventory Categories

1. **Living Inventory**
   - Mother Plants (cannabis, coffee, etc.)
   - Seeds
   - Clones/Cuttings
   - Seedlings

2. **Equipment**
   - Grow lights
   - Irrigation systems
   - Sensors (temperature, humidity, pH)
   - Tools

3. **Materials**
   - Nutrients (N-P-K formulations)
   - Pesticides/Fungicides
   - Growing media (soil, coco coir, rockwool)
   - Containers/pots

4. **Consumables**
   - Labels
   - Tags
   - Packaging materials

### Page 1: Inventory List

```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Inventario                [Agregar Item]   │
├─────────────────────────────────────────────────────────┤
│ 📦 Total Items: 156  |  ⚠️ Low Stock: 8                │
├─────────────────────────────────────────────────────────┤
│ [Todos] [Plantas Madre] [Semillas] [Equipamiento]      │
│ [Nutrientes] [Materiales]                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ID   Nombre        Categoría    Cantidad  Estado  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ 001  Cherry AK M1  Planta Madre 1 plant   🟢 OK  │ │
│ │ 002  Nutriente A   Nutrientes   5 units   🔴 Low │ │
│ │ 003  LED 600W      Equipamiento 12 units  🟢 OK  │ │
│ │ 004  Semillas WW   Semillas     250 seeds 🟡 Med │ │
│ │ 005  Coco Coir     Materiales   45 kg     🟢 OK  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [Ver Críticos] [Exportar]                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `inventory-list`

**Bubble Elements**:
- **Breadcrumb**: `text_breadcrumb_inventory` - "Inicio > Inventario"
- **Create Button**: `btn_add_inventory_item` - "Agregar Item" (Yellow primary button)
- **Header Metrics**: `group_inventory_header_metrics`
  - `text_total_items`: "Total Items: 156"
  - `text_low_stock_count`: "⚠️ Low Stock: 8"
- **Tab Group**: `group_inventory_tabs`
  - `btn_tab_todos`: "Todos"
  - `btn_tab_mother_plants`: "Plantas Madre"
  - `btn_tab_seeds`: "Semillas"
  - `btn_tab_equipment`: "Equipamiento"
  - `btn_tab_nutrients`: "Nutrientes"
  - `btn_tab_materials`: "Materiales"
  - Custom State: `current_category_filter` (text, default: "todos")
- **Table**: `rg_inventory_list`
  - **Data Source**: API Call `call_getInventoryByFacility`
    - Parameter: `facilityId` = `Current User > currentFacilityId`
  - **Layout Type**: Table with sortable columns
  - **Columns**: ID, Nombre, Categoría, Cantidad Disponible, Estado

**Inventory Row**: `group_inventory_row`
- `text_inventory_id`: "001"
- `text_inventory_name`: "Cherry AK M1"
- `text_inventory_category`: "Planta Madre"
- `text_quantity_available`: "1 plant"
- `icon_status`: 🟢/🟡/🔴 (based on stock level vs reorder point)
- `btn_inventory_menu`: "⋮" (3 dots menu)
  - Menu options: Ver, Editar, Consumir, Transferir, Eliminar

**Workflows**:

**Workflow: Load Inventory List**
- **Trigger**: Page is loaded
- **Step 1**: Display data from `call_getInventoryByFacility`
  - Parameter: `facilityId` = `Current User > currentFacilityId`
- **Step 2**: Filter by current tab category (if not "todos")
- **Step 3**: Calculate low stock count (items where `quantityAvailable` < `reorderPoint`)

**Workflow: Open Add Item Popup**
- **Trigger**: `btn_add_inventory_item` is clicked
- **Step 1**: Show `popup_create_inventory_item`

**Workflow: Navigate to Detail**
- **Trigger**: Inventory row is clicked
- **Step 1**: Navigate to `inventory-detail`
  - Send parameter `id` = `Current cell's inventory item > _id`

**Workflow: Filter by Category**
- **Trigger**: Any tab button is clicked
- **Step 1**: Set state `current_category_filter` = This tab's category value
- **Step 2**: Filter `rg_inventory_list` by category

**Database Context**:
- **Reads from**: `inventory_items` table
  - Gets: all inventory for current facility
  - Includes: category, quantity_available, quantity_reserved, reorder_point, supplier info

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Title | Inventario | Inventory | inventory_page_title |
| Add Item Button | Agregar Item | Add Item | inventory_add_item_btn |
| Total Items | Total Items: | Total Items: | inventory_total_items |
| Low Stock | Stock Bajo: | Low Stock: | inventory_low_stock |
| All Tab | Todos | All | inventory_tab_all |
| Mother Plants Tab | Plantas Madre | Mother Plants | inventory_tab_mother_plants |
| Seeds Tab | Semillas | Seeds | inventory_tab_seeds |
| Equipment Tab | Equipamiento | Equipment | inventory_tab_equipment |
| Nutrients Tab | Nutrientes | Nutrients | inventory_tab_nutrients |
| Materials Tab | Materiales | Materials | inventory_tab_materials |
| ID Column | ID | ID | inventory_column_id |
| Name Column | Nombre | Name | inventory_column_name |
| Category Column | Categoría | Category | inventory_column_category |
| Quantity Column | Cantidad | Quantity | inventory_column_quantity |
| Status Column | Estado | Status | inventory_column_status |
| View Critical Button | Ver Críticos | View Critical | inventory_view_critical_btn |
| Export Button | Exportar | Export | inventory_export_btn |

---

### Popup: Create Inventory Item

**Reusable Element Name**: `popup_create_inventory_item`

```
┌─────────────────────────────────────────────────────────┐
│ Nuevo Item de Inventario                          [X]  │
├─────────────────────────────────────────────────────────┤
│ Cultivos San José    🌿 Cannabis    📅 2025-10-27      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌───────────────────────┬───────────────────────────┐  │
│ │ INFORMACIÓN BÁSICA    │ STOCK & TRACKING          │  │
│ │                       │                           │  │
│ │ Categoría:            │ Cantidad Inicial:         │  │
│ │ [v Planta Madre ▼]    │ [__] [v plantas ▼]        │  │
│ │                       │                           │  │
│ │ Nombre:               │ Punto de Reorden:         │  │
│ │ [________________]    │ [__] unidades             │  │
│ │                       │                           │  │
│ │ Código/SKU:           │ Área de Almacenamiento:   │  │
│ │ [________________]    │ [v Almacén Principal ▼]   │  │
│ │                       │                           │  │
│ │ Proveedor:            │ Precio Unitario:          │  │
│ │ [v Seleccionar ▼]     │ $[____]                   │  │
│ │                       │                           │  │
│ │ Lote/Batch:           │ Fecha de Vencimiento:     │  │
│ │ [________________]    │ [__/__/____]              │  │
│ │                       │                           │  │
│ │ Notas:                │                           │  │
│ │ [________________]    │                           │  │
│ │                       │                           │  │
│ └───────────────────────┴───────────────────────────┘  │
│                                                          │
│ [Cancelar]                                 [Guardar]   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Bubble Elements**:
- **Popup Container**: `popup_create_inventory_item` (Reusable Element, 700px width)
- **Header**: `group_header_create_inventory`
  - `text_popup_title`: "Nuevo Item de Inventario"
  - `btn_close_popup`: "X"
- **Context Bar**: `group_context_info`
- **Form**: `group_form_create_inventory` (Two-column)

**Column 1 - Basic Info**: `group_col1_basic_info`
- `dropdown_category`: Planta Madre, Semillas, Clones, Equipamiento, Nutrientes, Materiales, Consumibles
- `input_item_name`: Text input
- `input_sku`: Text input (optional)
- `dropdown_supplier`: From suppliers list (optional)
- `input_batch_number`: Text input (optional)
- `input_notes`: Textarea (optional)

**Column 2 - Stock & Tracking**: `group_col2_stock`
- `input_initial_quantity`: Number input
- `dropdown_quantity_unit`: plantas, seeds, clones, units, kg, L, mL, etc.
- `input_reorder_point`: Number input
- `dropdown_storage_area`: From areas list
- `input_unit_price`: Number input (optional)
- `input_expiration_date`: Date picker (optional)

**Workflows**:

**Workflow: Submit Create Inventory Item**
- **Trigger**: `btn_submit_create_inventory` is clicked
- **Step 1**: Validate required fields (category, name, quantity, unit, storage area)
- **Step 2** (Only when valid): API Call `call_createInventoryItem`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `category`: `dropdown_category's value`
    - `name`: `input_item_name's value`
    - `sku`: `input_sku's value`
    - `supplierId`: `dropdown_supplier's value`
    - `batchNumber`: `input_batch_number's value`
    - `quantityAvailable`: `input_initial_quantity's value`
    - `quantityUnit`: `dropdown_quantity_unit's value`
    - `reorderPoint`: `input_reorder_point's value`
    - `areaId`: `dropdown_storage_area's value`
    - `unitPrice`: `input_unit_price's value`
    - `expirationDate`: `input_expiration_date's value`
    - `notes`: `input_notes's value`
- **Step 3** (Success): Hide popup, refresh list, show success message
- **Step 4** (Error): Show error message from API response

**Database Context**:
- **Writes to**: `inventory_items` table
  - Stores: facility_id, category, name, sku, supplier_id, batch_number, quantity_available, quantity_reserved, quantity_unit, reorder_point, area_id, unit_price, expiration_date, notes
  - Sets: status = "active", created_at = current timestamp

**UI Translations (Popup)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Popup Header | Nuevo Item de Inventario | New Inventory Item | inventory_popup_create_header |
| Basic Info Section | INFORMACIÓN BÁSICA | BASIC INFORMATION | inventory_popup_basic_section |
| Stock Section | STOCK & TRACKING | STOCK & TRACKING | inventory_popup_stock_section |
| Category Label | Categoría: | Category: | inventory_popup_category_label |
| Name Label | Nombre: | Name: | inventory_popup_name_label |
| SKU Label | Código/SKU: | Code/SKU: | inventory_popup_sku_label |
| Supplier Label | Proveedor: | Supplier: | inventory_popup_supplier_label |
| Batch Label | Lote/Batch: | Lot/Batch: | inventory_popup_batch_label |
| Notes Label | Notas: | Notes: | inventory_popup_notes_label |
| Initial Quantity Label | Cantidad Inicial: | Initial Quantity: | inventory_popup_initial_qty_label |
| Reorder Point Label | Punto de Reorden: | Reorder Point: | inventory_popup_reorder_point_label |
| Storage Area Label | Área de Almacenamiento: | Storage Area: | inventory_popup_storage_area_label |
| Unit Price Label | Precio Unitario: | Unit Price: | inventory_popup_unit_price_label |
| Expiration Date Label | Fecha de Vencimiento: | Expiration Date: | inventory_popup_expiration_label |
| Success Message | Item agregado exitosamente | Item added successfully | inventory_create_success |

**Enum Translations (Inventory Categories)**:

| value | display_es | display_en |
|-------|------------|------------|
| mother_plant | Planta Madre | Mother Plant |
| seeds | Semillas | Seeds |
| clones | Clones | Clones |
| equipment | Equipamiento | Equipment |
| nutrients | Nutrientes | Nutrients |
| pesticides | Pesticidas | Pesticides |
| materials | Materiales | Materials |
| consumables | Consumibles | Consumables |

**Enum Translations (Quantity Units)**:

| value | display_es | display_en |
|-------|------------|------------|
| plants | plantas | plants |
| seeds | semillas | seeds |
| clones | clones | clones |
| units | unidades | units |
| kg | kg | kg |
| g | g | g |
| L | L | L |
| mL | mL | mL |

---

### Page 2: Inventory Detail

**Page Name**: `inventory-detail`

```
┌─────────────────────────────────────────────────────────┐
│ Inventario > Cherry AK M1                      [Editar] │
├─────────────────────────────────────────────────────────┤
│ 001 - Cherry AK M1 (Planta Madre)                       │
│ 🟢 En Stock | Almacén Principal | 1 planta disponible   │
├─────────────────────────────────────────────────────────┤
│ [General] [Consumo] [Movimientos] [Historial]          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Categoría: Planta Madre                                 │
│ SKU: PM-CAK-001                                         │
│ Proveedor: Seed Supply Co.                              │
│ Lote: BATCH-2024-05                                     │
│                                                          │
│ Stock:                                                   │
│ • Disponible: 1 planta                                  │
│ • Reservado: 0 plantas                                  │
│ • Punto de Reorden: N/A (planta única)                  │
│                                                          │
│ Ubicación: Almacén Principal                            │
│ Precio Unitario: $150.00                                │
│ Fecha de Adquisición: 2024-05-15                        │
│                                                          │
│ Notas: Planta madre de alto rendimiento                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**URL Parameter**: `id` (inventory item ID)

**Workflows**: Similar to Area Detail (Load, Switch Tab, Navigate to Edit)

**Database Context**:
- **Reads from**: `inventory_items` table
- **Reads from**: `activities` table (for Consumo tab - consumption history)
- **Reads from**: `inventory_movements` table (for Movimientos tab)

---

### Page 3: Inventory Edit

**Page Name**: `inventory-edit`

```
┌─────────────────────────────────────────────────────────┐
│ Inventario > Cherry AK M1 > Editar   [Cancelar] [Guardar]│
├─────────────────────────────────────────────────────────┤
│ [Editable form with same fields as create popup]        │
└─────────────────────────────────────────────────────────┘
```

**Workflows**: Load for edit, Save changes, Cancel (similar to Area Edit)

**Database Context**:
- **Reads from**: `inventory_items` table
- **Updates**: `inventory_items` table

---

## MODULE 20: Facility Settings

**Purpose**: Facility-specific configuration and preferences

### Page: Facility Settings

```
┌─────────────────────────────────────────────────────────┐
│ Configuraciones > Instalación                          │
├─────────────────────────────────────────────────────────┤
│ [General] [Licencias] [Áreas] [Notificaciones]         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ INFORMACIÓN GENERAL                                      │
│ Nombre de Instalación: [North Farm_________]            │
│ Tipo de Licencia: [v Cultivo Comercial ▼]              │
│ Número de Licencia: [LIC-2024-001____]                  │
│ Área Licenciada: [500] m²                               │
│ Cultivo Principal: [v Cannabis ▼]                       │
│                                                          │
│ UBICACIÓN                                                │
│ Departamento: [v Antioquia ▼]                           │
│ Municipio: [v Medellín ▼]                               │
│ Dirección: [Calle 50 #45-23________]                    │
│ Coordenadas GPS:                                         │
│   Latitud: [6.2442] Longitud: [-75.5812]                │
│                                                          │
│ CONFIGURACIÓN AMBIENTAL PREDETERMINADA                   │
│ Zona Climática: [v Tropical ▼]                          │
│ Temperatura Objetivo: [20] - [25] °C                    │
│ Humedad Objetivo: [60] - [70] %                         │
│                                                          │
│ [Cancelar]                                   [Guardar]  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `facility-settings`

**Key Features**:
- Update facility information
- Manage license details
- Configure default environmental settings
- Set notification preferences

---

## MODULE 21: Account Settings

**Purpose**: User preferences and company-wide settings

### Page: Account Settings

```
┌─────────────────────────────────────────────────────────┐
│ Configuraciones > Cuenta                                │
├─────────────────────────────────────────────────────────┤
│ [Perfil] [Preferencias] [Seguridad] [Empresa]          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ INFORMACIÓN DE PERFIL                                    │
│ Nombre: [Juan_________]                                 │
│ Apellido: [Pérez_______]                                │
│ Email: [juan@email.com]                                 │
│ Teléfono: [300-123-4567]                                │
│                                                          │
│ PREFERENCIAS                                             │
│ Idioma: [v Español ▼]                                   │
│ Zona Horaria: [v America/Bogota ▼]                      │
│ Formato de Fecha: [v DD/MM/YYYY ▼]                      │
│ Unidades: [v Métricas ▼]                                │
│                                                          │
│ NOTIFICACIONES                                           │
│ ☑ Alertas de stock bajo                                 │
│ ☑ Actividades vencidas                                  │
│ ☐ Resumen diario por email                              │
│ ☑ Alertas de calidad                                    │
│                                                          │
│ [Cancelar]                                   [Guardar]  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `account-settings`

**Key Features**:
- Update personal profile
- Set language and locale preferences
- Configure notification preferences
- Manage company settings (admin only)
- Security settings (password change, 2FA)

---

**Status**: Phase 2 Basic Setup - Complete Documentation
**Next Steps**:
1. Implement backend endpoints for new modules (19-21)
2. Build Bubble pages following specifications
3. Test CRUD operations for all entities
4. Proceed to Phase 3 (Templates)

---

**Last Updated**: 2025-11-17
