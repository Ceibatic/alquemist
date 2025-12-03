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

The following modules provide full CRUD operations following the standard pattern:

---

## MODULE 8: Area Management

**Pattern Reference**: See [CRUD-PATTERN.md](CRUD-PATTERN.md) for standard structure

Area Management provides full CRUD operations for cultivation zones within a facility. Areas represent physical production spaces like propagation rooms, vegetative rooms, flowering rooms, drying rooms, greenhouses, or outdoor fields. Each area has specific environmental specifications, capacity limits, and can track current occupancy.

### Area Types

- **propagation**: Initial seed/clone propagation zones
- **vegetative**: Vegetative growth phase areas
- **flowering**: Flowering/fruiting phase areas
- **drying**: Post-harvest drying rooms
- **curing**: Curing/aging spaces
- **storage**: Long-term storage areas
- **processing**: Processing and packaging zones
- **quarantine**: Isolated areas for pest/disease management

### Page 1: Areas List

```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Áreas                      [+ Nueva Área]   │
├─────────────────────────────────────────────────────────┤
│ 📊 Total Áreas: 8  |  🟢 Activas: 6  |  🔴 Inactivas: 2 │
├─────────────────────────────────────────────────────────┤
│ [Todas] [Propagación] [Vegetativo] [Floración] [Más ▾] │
├─────────────────────────────────────────────────────────┤
│ 🔍 Buscar áreas...                      [Filtros ▾]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 🌱 Propagation Room A               [⋮]         │   │
│ │ Tipo: Propagación | 50 m² | 🟢 Activa           │   │
│ │ Capacidad: 500 plantas | Ocupación: 320 (64%)   │   │
│ │ 🌡️ 22°C | 💧 65% | ☀️ Control climático        │   │
│ │ [Ver Detalles]  [Editar]  [Ver Lotes]           │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 🌿 Vegetative Room B                [⋮]         │   │
│ │ Tipo: Vegetativo | 120 m² | 🟢 Activa           │   │
│ │ Capacidad: 800 plantas | Ocupación: 650 (81%)   │   │
│ │ 🌡️ 23°C | 💧 70% | ☀️ Control climático        │   │
│ │ [Ver Detalles]  [Editar]  [Ver Lotes]           │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 🏵️ Flowering Greenhouse               [⋮]       │   │
│ │ Tipo: Floración | 200 m² | 🟡 Mantenimiento     │   │
│ │ Capacidad: 600 plantas | Ocupación: 0 (0%)      │   │
│ │ 🌡️ -- | 💧 -- | ☀️ Natural                    │   │
│ │ [Ver Detalles]  [Activar]  [Editar]             │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `areas-list`

**Bubble Elements**:
- **Breadcrumb**: `text_breadcrumb_areas` - "Inicio > Áreas"
- **Create Button**: `btn_add_area` - "Nueva Área" (Yellow primary button)
- **Header Metrics**: `group_areas_header_metrics`
  - `text_total_areas`: "Total Áreas: 8"
  - `text_active_areas`: "🟢 Activas: 6"
  - `text_inactive_areas`: "🔴 Inactivas: 2"
- **Tab Group**: `group_area_type_tabs`
  - `btn_tab_all`: "Todas"
  - `btn_tab_propagation`: "Propagación"
  - `btn_tab_vegetative`: "Vegetativo"
  - `btn_tab_flowering`: "Floración"
  - `btn_tab_more`: "Más ▾" (dropdown: Drying, Curing, Storage, Processing, Quarantine)
  - Custom State: `current_type_filter` (text, default: "all")
- **Search**: `input_search_areas` - Search by name
- **Repeating Group**: `rg_areas_list`
  - **Data Source**: API Call `call_getAreasByFacility`
    - Parameter: `facilityId` = `Current User > currentFacilityId`
  - **Layout Type**: Card grid (2 columns on desktop, 1 on mobile)

**Area Card**: `group_area_card`
- `icon_area_type`: 🌱/🌿/🏵️ based on area type
- `text_area_name`: "Propagation Room A"
- `btn_area_menu`: "⋮" (3 dots menu)
- `text_area_type`: "Propagación"
- `text_total_area`: "50 m²"
- `icon_status`: 🟢 active, 🟡 maintenance, 🔴 inactive
- `text_status`: "Activa"
- `text_capacity`: "Capacidad: 500 plantas"
- `text_occupancy`: "Ocupación: 320 (64%)"
- `progress_bar_occupancy`: Visual occupancy bar
- `text_temp`: "🌡️ 22°C"
- `text_humidity`: "💧 65%"
- `text_climate_control`: "☀️ Control climático" or "☀️ Natural"
- `btn_view_details`: "Ver Detalles"
- `btn_edit_area`: "Editar"
- `btn_view_batches`: "Ver Lotes"

**Workflows**:

**Workflow: Load Areas List**
- **Trigger**: Page is loaded
- **Step 1**: API Call `call_getAreasByFacility`
  - Parameter: `facilityId` = `Current User > currentFacilityId`
- **Step 2**: Display data in `rg_areas_list`
- **Step 3**: Calculate metrics (total, active, inactive counts)
- **Step 4**: Apply type filter if not "all"

**Workflow: Open Add Area Popup**
- **Trigger**: `btn_add_area` is clicked
- **Step 1**: Show `popup_create_area`

**Workflow: Navigate to Area Detail**
- **Trigger**: `btn_view_details` is clicked
- **Step 1**: Navigate to `area-detail`
  - Send parameter `id` = `Current cell's area > _id`

**Workflow: Navigate to Area Edit**
- **Trigger**: `btn_edit_area` is clicked
- **Step 1**: Navigate to `area-edit`
  - Send parameter `id` = `Current cell's area > _id`

**Workflow: Filter by Type**
- **Trigger**: Any tab button is clicked
- **Step 1**: Set state `current_type_filter` = This tab's type value
- **Step 2**: Filter `rg_areas_list` by area type

**Database Context**:
- **Reads from**: `areas` table
  - Gets: all areas for current facility
  - Includes: area_type, total_area_m2, capacity, status, current_occupancy, climate_controlled, environmental_specs

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Title | Áreas | Areas | areas_page_title |
| Add Area Button | Nueva Área | New Area | areas_add_btn |
| Total Areas | Total Áreas: | Total Areas: | areas_total |
| Active | Activas: | Active: | areas_active |
| Inactive | Inactivas: | Inactive: | areas_inactive |
| All Tab | Todas | All | areas_tab_all |
| Propagation Tab | Propagación | Propagation | areas_tab_propagation |
| Vegetative Tab | Vegetativo | Vegetative | areas_tab_vegetative |
| Flowering Tab | Floración | Flowering | areas_tab_flowering |
| More Tab | Más | More | areas_tab_more |
| Search Placeholder | Buscar áreas... | Search areas... | areas_search_placeholder |
| Filters | Filtros | Filters | areas_filters |
| Type Label | Tipo: | Type: | areas_type_label |
| Capacity | Capacidad: | Capacity: | areas_capacity |
| Occupancy | Ocupación: | Occupancy: | areas_occupancy |
| Climate Controlled | Control climático | Climate Controlled | areas_climate_controlled |
| Natural | Natural | Natural | areas_natural |
| View Details | Ver Detalles | View Details | areas_view_details |
| Edit | Editar | Edit | areas_edit |
| View Batches | Ver Lotes | View Batches | areas_view_batches |

---

### Popup: Create Area

**Reusable Element Name**: `popup_create_area`

```
┌─────────────────────────────────────────────────────────┐
│ Nueva Área                                        [X]  │
├─────────────────────────────────────────────────────────┤
│ Cultivos San José    🌿 Cannabis    📅 2025-11-21      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────┬──────────────────────────┐    │
│ │ INFORMACIÓN BÁSICA   │ CAPACIDAD & AMBIENTE     │    │
│ │                      │                          │    │
│ │ Nombre del Área:     │ Área Total (m²):         │    │
│ │ [________________]   │ [____]                   │    │
│ │                      │                          │    │
│ │ Tipo de Área:        │ Capacidad (plantas):     │    │
│ │ [v Propagación ▼]    │ [____]                   │    │
│ │                      │                          │    │
│ │ Cultivos Compatibles:│ Control Climático:       │    │
│ │ ☑ Cannabis           │ ○ Sí  ○ No               │    │
│ │ ☐ Coffee             │                          │    │
│ │ ☐ Cocoa              │ Especificaciones         │    │
│ │                      │ (si control climático):  │    │
│ │ Estado:              │                          │    │
│ │ ○ Activa             │ Temperatura (°C):        │    │
│ │ ○ Inactiva           │ Min [__] Max [__]        │    │
│ │ ○ Mantenimiento      │                          │    │
│ │                      │ Humedad (%):             │    │
│ │ Descripción:         │ Min [__] Max [__]        │    │
│ │ [________________]   │                          │    │
│ │ [________________]   │ Luz (hrs/día):           │    │
│ │                      │ [__]                     │    │
│ │                      │                          │    │
│ │                      │ pH Objetivo:             │    │
│ │                      │ Min [__] Max [__]        │    │
│ └──────────────────────┴──────────────────────────┘    │
│                                                          │
│ [Cancelar]                                   [Guardar]  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Bubble Elements**:
- **Popup Container**: `popup_create_area` (Reusable Element, 800px width)
- **Header**: `group_header_create_area`
  - `text_popup_title`: "Nueva Área"
  - `btn_close_popup`: "X"
- **Context Bar**: `group_context_info`
- **Form**: `group_form_create_area` (Two-column)

**Column 1 - Basic Info**: `group_col1_basic`
- `input_area_name`: Text input (required)
- `dropdown_area_type`: propagation, vegetative, flowering, drying, curing, storage, processing, quarantine (required)
- `checkbox_group_compatible_crops`: Multi-select crop types
  - `checkbox_cannabis`: Cannabis
  - `checkbox_coffee`: Coffee
  - `checkbox_cocoa`: Cocoa
  - `checkbox_other`: Other
- `radio_status`: active, inactive, maintenance (default: active)
- `input_description`: Textarea (optional)

**Column 2 - Capacity & Environment**: `group_col2_capacity`
- `input_total_area_m2`: Number input (required)
- `input_capacity`: Number input (required)
- `radio_climate_controlled`: Yes/No (default: Yes)
- `group_environmental_specs`: (Conditional: visible when climate_controlled = Yes)
  - `input_temp_min`: Number input
  - `input_temp_max`: Number input
  - `input_humidity_min`: Number input
  - `input_humidity_max`: Number input
  - `input_light_hours`: Number input
  - `input_ph_min`: Number input (decimal)
  - `input_ph_max`: Number input (decimal)

**Workflows**:

**Workflow: Submit Create Area**
- **Trigger**: `btn_submit_create_area` is clicked
- **Step 1**: Validate required fields (name, type, area, capacity)
- **Step 2** (Only when valid): API Call `call_createArea`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `name`: `input_area_name's value`
    - `areaType`: `dropdown_area_type's value`
    - `compatibleCropTypeIds`: Array from checked crop checkboxes
    - `totalAreaM2`: `input_total_area_m2's value`
    - `capacity`: `input_capacity's value`
    - `climateControlled`: `radio_climate_controlled's value` = "yes"
    - `environmentalSpecs`: (if climate controlled)
      - `tempMin`: `input_temp_min's value`
      - `tempMax`: `input_temp_max's value`
      - `humidityMin`: `input_humidity_min's value`
      - `humidityMax`: `input_humidity_max's value`
      - `lightHours`: `input_light_hours's value`
      - `phMin`: `input_ph_min's value`
      - `phMax`: `input_ph_max's value`
    - `status`: `radio_status's value`
    - `description`: `input_description's value`
- **Step 3** (Success): Hide popup, refresh list, show success message
- **Step 4** (Error): Show error message from API response

**Database Context**:
- **Writes to**: `areas` table
  - Stores: facility_id, name, area_type, compatible_crop_type_ids, total_area_m2, capacity, climate_controlled, environmental_specs, status, description
  - Sets: current_occupancy = 0, created_at = current timestamp

**UI Translations (Popup)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Popup Header | Nueva Área | New Area | area_popup_create_header |
| Basic Info Section | INFORMACIÓN BÁSICA | BASIC INFORMATION | area_popup_basic_section |
| Capacity Section | CAPACIDAD & AMBIENTE | CAPACITY & ENVIRONMENT | area_popup_capacity_section |
| Name Label | Nombre del Área: | Area Name: | area_popup_name_label |
| Type Label | Tipo de Área: | Area Type: | area_popup_type_label |
| Compatible Crops | Cultivos Compatibles: | Compatible Crops: | area_popup_crops_label |
| Status Label | Estado: | Status: | area_popup_status_label |
| Description Label | Descripción: | Description: | area_popup_description_label |
| Total Area Label | Área Total (m²): | Total Area (m²): | area_popup_total_area_label |
| Capacity Label | Capacidad (plantas): | Capacity (plants): | area_popup_capacity_label |
| Climate Control | Control Climático: | Climate Control: | area_popup_climate_label |
| Specs Label | Especificaciones | Specifications | area_popup_specs_label |
| Temperature | Temperatura (°C): | Temperature (°C): | area_popup_temp_label |
| Humidity | Humedad (%): | Humidity (%): | area_popup_humidity_label |
| Light | Luz (hrs/día): | Light (hrs/day): | area_popup_light_label |
| pH Target | pH Objetivo: | Target pH: | area_popup_ph_label |
| Min | Min | Min | area_popup_min |
| Max | Max | Max | area_popup_max |
| Success Message | Área creada exitosamente | Area created successfully | area_create_success |

**Enum Translations (Area Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| propagation | Propagación | Propagation |
| vegetative | Vegetativo | Vegetative |
| flowering | Floración | Flowering |
| drying | Secado | Drying |
| curing | Curado | Curing |
| storage | Almacenamiento | Storage |
| processing | Procesamiento | Processing |
| quarantine | Cuarentena | Quarantine |

**Enum Translations (Area Status)**:

| value | display_es | display_en |
|-------|------------|------------|
| active | Activa | Active |
| inactive | Inactiva | Inactive |
| maintenance | Mantenimiento | Maintenance |

---

### Page 2: Area Detail

**Page Name**: `area-detail`

```
┌─────────────────────────────────────────────────────────┐
│ Áreas > Propagation Room A                    [Editar] │
├─────────────────────────────────────────────────────────┤
│ 🌱 Propagation Room A (Propagación)                     │
│ 🟢 Activa | 50 m² | 320/500 plantas (64% ocupación)    │
├─────────────────────────────────────────────────────────┤
│ [Registro] [Lotes Actuales] [Historial]                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ INFORMACIÓN GENERAL                                      │
│ Tipo: Propagación                                        │
│ Área Total: 50 m²                                        │
│ Capacidad: 500 plantas                                   │
│ Ocupación Actual: 320 plantas (64%)                     │
│ Estado: Activa                                           │
│                                                          │
│ CULTIVOS COMPATIBLES                                     │
│ • Cannabis                                               │
│                                                          │
│ CONTROL CLIMÁTICO                                        │
│ Control Activo: Sí                                       │
│ Temperatura: 20°C - 25°C (Actual: 22°C 🟢)             │
│ Humedad: 60% - 70% (Actual: 65% 🟢)                     │
│ Luz: 18 hrs/día                                          │
│ pH: 5.5 - 6.5                                            │
│                                                          │
│ DESCRIPCIÓN                                              │
│ Sala de propagación con control climático completo      │
│                                                          │
│ FECHAS                                                   │
│ Creado: 2025-01-15 10:30 AM                             │
│ Última Actualización: 2025-03-10 02:45 PM               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**URL Parameter**: `id` (area ID)

**Bubble Elements**:
- **Breadcrumb**: `text_breadcrumb_detail` - Dynamic with area name
- **Edit Button**: `btn_edit_area_detail`
- **Area Header**: `group_area_header_detail`
  - `icon_area_type`: Dynamic icon
  - `text_area_name`: Area name
  - `text_area_type_display`: Translated type
  - `icon_status_detail`: Status icon
  - `text_status_detail`: Status text
  - `text_area_size`: "50 m²"
  - `text_occupancy_detail`: "320/500 plantas (64% ocupación)"
- **Tab Navigation**: `group_tabs_detail`
  - `btn_tab_registro`: "Registro" (General info - default)
  - `btn_tab_lotes`: "Lotes Actuales" (Current batches)
  - `btn_tab_historial`: "Historial" (History)
- **Content Area**: `group_detail_content`
  - Changes based on selected tab

**Tab 1: Registro (General Info)**
- `group_general_info`
- `group_compatible_crops`
- `group_climate_control`
- `group_description`
- `group_dates`

**Workflows**:

**Workflow: Load Area Detail**
- **Trigger**: Page is loaded
- **Step 1**: API Call `call_getAreaById`
  - Parameter: `areaId` = URL parameter `id`
- **Step 2**: Display area information
- **Step 3**: Load default tab (Registro)

**Workflow: Switch Tab**
- **Trigger**: Tab button is clicked
- **Step 1**: Show corresponding content group
- **Step 2**: Load tab-specific data if needed

**Workflow: Navigate to Edit**
- **Trigger**: `btn_edit_area_detail` is clicked
- **Step 1**: Navigate to `area-edit`
  - Send parameter `id` = Current area ID

**Database Context**:
- **Reads from**: `areas` table
- **Reads from**: `batches` table (for Lotes tab - current batches in this area)
- **Reads from**: `activities` table (for Historial tab)

**UI Translations (Detail Page)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Edit Button | Editar | Edit | area_detail_edit_btn |
| Tab Registro | Registro | Details | area_tab_registro |
| Tab Lotes | Lotes Actuales | Current Batches | area_tab_lotes |
| Tab Historial | Historial | History | area_tab_historial |
| General Info Header | INFORMACIÓN GENERAL | GENERAL INFORMATION | area_detail_general_header |
| Type | Tipo: | Type: | area_detail_type |
| Total Area | Área Total: | Total Area: | area_detail_total_area |
| Capacity | Capacidad: | Capacity: | area_detail_capacity |
| Current Occupancy | Ocupación Actual: | Current Occupancy: | area_detail_occupancy |
| Status | Estado: | Status: | area_detail_status |
| Compatible Crops | CULTIVOS COMPATIBLES | COMPATIBLE CROPS | area_detail_crops_header |
| Climate Control Header | CONTROL CLIMÁTICO | CLIMATE CONTROL | area_detail_climate_header |
| Active Control | Control Activo: | Active Control: | area_detail_control_active |
| Temperature | Temperatura: | Temperature: | area_detail_temperature |
| Humidity | Humedad: | Humidity: | area_detail_humidity |
| Light | Luz: | Light: | area_detail_light |
| pH | pH: | pH: | area_detail_ph |
| Current | Actual: | Current: | area_detail_current |
| Description Header | DESCRIPCIÓN | DESCRIPTION | area_detail_description_header |
| Dates Header | FECHAS | DATES | area_detail_dates_header |
| Created | Creado: | Created: | area_detail_created |
| Last Updated | Última Actualización: | Last Updated: | area_detail_updated |

---

### Page 3: Area Edit

**Page Name**: `area-edit`

```
┌─────────────────────────────────────────────────────────┐
│ Áreas > Propagation Room A > Editar  [Cancelar] [Guardar]│
├─────────────────────────────────────────────────────────┤
│ [Same form as Create popup, but pre-filled with data]   │
└─────────────────────────────────────────────────────────┘
```

**URL Parameter**: `id` (area ID)

**Bubble Elements**: Same as Create popup, but:
- Form is pre-populated with current area data
- Title changes to "Editar Área"
- Cancel button navigates back to detail page

**Workflows**:

**Workflow: Load Area for Edit**
- **Trigger**: Page is loaded
- **Step 1**: API Call `call_getAreaById`
  - Parameter: `areaId` = URL parameter `id`
- **Step 2**: Pre-fill all form fields with area data

**Workflow: Submit Update**
- **Trigger**: `btn_submit_update_area` is clicked
- **Step 1**: Validate required fields
- **Step 2**: API Call `call_updateArea`
  - Parameters: Same as create, plus `areaId`
- **Step 3** (Success): Navigate to detail page, show success message
- **Step 4** (Error): Show error message

**Workflow: Cancel Edit**
- **Trigger**: `btn_cancel_edit` is clicked
- **Step 1**: Navigate back to `area-detail`
  - Send parameter `id` = Current area ID

**Database Context**:
- **Reads from**: `areas` table
- **Updates**: `areas` table (updates fields, sets updated_at)

**UI Translations (Edit Page)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Title | Editar Área | Edit Area | area_edit_title |
| Cancel Button | Cancelar | Cancel | area_edit_cancel |
| Save Button | Guardar | Save | area_edit_save |
| Success Message | Área actualizada exitosamente | Area updated successfully | area_update_success |

---

## MODULE 15: Cultivar Management

**Pattern Reference**: See [CRUD-PATTERN.md](CRUD-PATTERN.md) for standard structure

Cultivar Management provides full CRUD operations for specific plant varieties or strains within a crop type. For cannabis, this includes strains like Cherry AK, White Widow, etc. For coffee, this might be Arabica varieties. Each cultivar has specific characteristics like variety type, flowering time, yield expectations, and compound profiles (THC/CBD for cannabis).

### Cultivar Workflow

1. **System Cultivars**: Pre-defined cultivars in the system database (common varieties)
2. **Facility Linking**: Facilities select which cultivars they grow from the system list
3. **Custom Cultivars**: Facilities can create proprietary varieties specific to their operations
4. **Usage**: Cultivars are referenced when creating production templates and batches

### Page 1: Cultivars List

```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Cultivares                [+ Nuevo Cultivar]│
├─────────────────────────────────────────────────────────┤
│ 📊 Total: 12  |  🌿 Cannabis: 8  |  ☕ Café: 4          │
├─────────────────────────────────────────────────────────┤
│ Tipo de Cultivo: [v Cannabis ▼]      [Agregar de Sistema]│
├─────────────────────────────────────────────────────────┤
│ 🔍 Buscar cultivares...                  [Filtros ▾]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 🌿 Cherry AK                     [⭐] [⋮]        │   │
│ │ Indica Dominante | 8-9 semanas floración         │   │
│ │ Rendimiento: Medio-Alto | THC: 18-22%            │   │
│ │ Personalizado: No (Sistema)                      │   │
│ │ [Ver Detalles]  [Editar]  [Ver Lotes]            │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 🌿 Ceibatic Special #1           [✓] [⋮]        │   │
│ │ Híbrida | 9-10 semanas floración                 │   │
│ │ Rendimiento: Alto | THC: 20-25%                  │   │
│ │ Personalizado: Sí (Propietary)                   │   │
│ │ [Ver Detalles]  [Editar]  [Eliminar]             │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ ☕ Caturra                        [⭐] [⋮]        │   │
│ │ Arábica | Rendimiento: Medio                     │   │
│ │ Notas: Cítrico, Dulce                            │   │
│ │ Personalizado: No (Sistema)                      │   │
│ │ [Ver Detalles]  [Ver Lotes]                      │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `cultivars-list`

**Bubble Elements**:
- **Breadcrumb**: `text_breadcrumb_cultivars` - "Inicio > Cultivares"
- **Create Button**: `btn_add_cultivar` - "Nuevo Cultivar" (Yellow primary button)
- **Add from System Button**: `btn_link_system_cultivars` - "Agregar de Sistema"
- **Header Metrics**: `group_cultivars_header_metrics`
  - `text_total_cultivars`: "Total: 12"
  - `text_cannabis_count`: "🌿 Cannabis: 8"
  - `text_coffee_count`: "☕ Café: 4"
- **Crop Type Filter**: `dropdown_crop_type_filter`
  - Options: Cannabis, Coffee, Cocoa, Other
  - Default: Cannabis
- **Search**: `input_search_cultivars` - Search by name
- **Repeating Group**: `rg_cultivars_list`
  - **Data Source**: API Call `call_getCultivarsByFacility`
    - Parameter: `facilityId` = `Current User > currentFacilityId`
    - Parameter: `cropTypeId` = `dropdown_crop_type_filter's value` (optional)
  - **Layout Type**: Card grid (2 columns on desktop, 1 on mobile)

**Cultivar Card**: `group_cultivar_card`
- `icon_crop_type`: 🌿/☕/🍫 based on crop type
- `text_cultivar_name`: "Cherry AK"
- `icon_system`: ⭐ if system cultivar, ✓ if custom
- `btn_cultivar_menu`: "⋮" (3 dots menu)
- `text_variety_type`: "Indica Dominante" (for cannabis) or "Arábica" (for coffee)
- `text_flowering_weeks`: "8-9 semanas floración"
- `text_yield_level`: "Rendimiento: Medio-Alto"
- `text_thc_range`: "THC: 18-22%" (cannabis only)
- `text_cbd_range`: "CBD: 0.5-1.5%" (cannabis only, if significant)
- `text_flavor_notes`: "Notas: Cítrico, Dulce" (coffee/cocoa)
- `text_is_custom`: "Personalizado: Sí/No"
- `btn_view_details`: "Ver Detalles"
- `btn_edit_cultivar`: "Editar" (only for custom cultivars)
- `btn_delete_cultivar`: "Eliminar" (only for custom cultivars)
- `btn_view_batches`: "Ver Lotes"

**Workflows**:

**Workflow: Load Cultivars List**
- **Trigger**: Page is loaded
- **Step 1**: API Call `call_getCultivarsByFacility`
  - Parameter: `facilityId` = `Current User > currentFacilityId`
  - Parameter: `cropTypeId` = `dropdown_crop_type_filter's value`
- **Step 2**: Display data in `rg_cultivars_list`
- **Step 3**: Calculate metrics by crop type

**Workflow: Open Add Custom Cultivar Popup**
- **Trigger**: `btn_add_cultivar` is clicked
- **Step 1**: Show `popup_create_custom_cultivar`

**Workflow: Open Link System Cultivars**
- **Trigger**: `btn_link_system_cultivars` is clicked
- **Step 1**: Show `popup_link_cultivars`
  - Displays list of system cultivars not yet linked to facility
  - Multi-select interface

**Workflow: Navigate to Cultivar Detail**
- **Trigger**: `btn_view_details` is clicked
- **Step 1**: Navigate to `cultivar-detail`
  - Send parameter `id` = `Current cell's cultivar > _id`

**Workflow: Navigate to Cultivar Edit**
- **Trigger**: `btn_edit_cultivar` is clicked (only visible for custom cultivars)
- **Step 1**: Navigate to `cultivar-edit`
  - Send parameter `id` = `Current cell's cultivar > _id`

**Workflow: Delete Custom Cultivar**
- **Trigger**: `btn_delete_cultivar` is clicked
- **Step 1**: Show confirmation: "¿Eliminar este cultivar? No podrá recuperarlo."
- **Step 2** (If confirmed): API Call `call_deleteCultivar`
  - Parameter: `cultivarId` = `Current cell's cultivar > _id`
- **Step 3** (Success): Remove from list, show success message
- **Step 4** (Error): Show error message (e.g., "Cannot delete cultivar with active production")

**Workflow: Filter by Crop Type**
- **Trigger**: `dropdown_crop_type_filter` value changes
- **Step 1**: Refresh `rg_cultivars_list` with new crop type filter

**Database Context**:
- **Reads from**: `cultivars` table
  - Gets: all cultivars linked to current facility
  - Includes: crop_type, variety_type, flowering_weeks, yield_level, thc_range, cbd_range, is_custom
- **Reads from**: `facility_cultivars` table (many-to-many relationship)

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Title | Cultivares | Cultivars | cultivars_page_title |
| Add Cultivar Button | Nuevo Cultivar | New Cultivar | cultivars_add_btn |
| Add from System | Agregar de Sistema | Add from System | cultivars_add_system_btn |
| Total | Total: | Total: | cultivars_total |
| Crop Type Filter | Tipo de Cultivo: | Crop Type: | cultivars_crop_filter |
| Search Placeholder | Buscar cultivares... | Search cultivars... | cultivars_search_placeholder |
| Filters | Filtros | Filters | cultivars_filters |
| Variety Type | Tipo de Variedad | Variety Type | cultivars_variety_type |
| Flowering Weeks | semanas floración | weeks flowering | cultivars_flowering_weeks |
| Yield | Rendimiento: | Yield: | cultivars_yield |
| Custom | Personalizado: | Custom: | cultivars_custom |
| System | Sistema | System | cultivars_system |
| Proprietary | Propietario | Proprietary | cultivars_proprietary |
| View Details | Ver Detalles | View Details | cultivars_view_details |
| Edit | Editar | Edit | cultivars_edit |
| Delete | Eliminar | Delete | cultivars_delete |
| View Batches | Ver Lotes | View Batches | cultivars_view_batches |
| Delete Confirm | ¿Eliminar este cultivar? No podrá recuperarlo. | Delete this cultivar? You cannot recover it. | cultivars_delete_confirm |

---

### Popup: Link System Cultivars

**Reusable Element Name**: `popup_link_cultivars`

```
┌─────────────────────────────────────────────────────────┐
│ Agregar Cultivares del Sistema                    [X]  │
├─────────────────────────────────────────────────────────┤
│ Selecciona los cultivares que cultivas en tu instalación│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Tipo de Cultivo: [v Cannabis ▼]                         │
│                                                          │
│ 🔍 Buscar en catálogo...                                │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ☐ Cherry AK (Indica) - 8-9 sem - THC 18-22%       │ │
│ │ ☐ White Widow (Híbrida) - 9-10 sem - THC 20-25%   │ │
│ │ ☑ OG Kush (Indica) - 8-9 sem - THC 19-24%         │ │
│ │ ☐ Sour Diesel (Sativa) - 10-11 sem - THC 20-25%   │ │
│ │ ☑ Blue Dream (Híbrida) - 9-10 sem - THC 17-24%    │ │
│ │ ☐ Jack Herer (Sativa) - 8-10 sem - THC 18-24%     │ │
│ │ ...                                                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Seleccionados: 2                                        │
│                                                          │
│ [Cancelar]                    [Agregar Seleccionados]  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Bubble Elements**:
- **Popup Container**: `popup_link_cultivars` (700px width)
- **Header**: `group_header_link`
- **Crop Type Selector**: `dropdown_system_crop_type`
- **Search**: `input_search_system_cultivars`
- **Repeating Group**: `rg_system_cultivars`
  - **Data Source**: API Call `call_getCultivarsByCrop`
    - Parameter: `cropTypeId` = `dropdown_system_crop_type's value`
  - Filter: Exclude cultivars already linked to this facility
- **Cultivar Row**: `group_system_cultivar_row`
  - `checkbox_select_cultivar`: Checkbox for selection
  - `text_system_cultivar_name`: Cultivar name + key details
- **Selected Count**: `text_selected_count`
- **Buttons**:
  - `btn_cancel_link`: "Cancelar"
  - `btn_submit_link`: "Agregar Seleccionados"

**Workflows**:

**Workflow: Submit Link Cultivars**
- **Trigger**: `btn_submit_link` is clicked
- **Step 1**: Collect selected cultivar IDs
- **Step 2**: API Call `call_linkCultivarsToFacility`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `cultivarIds`: Array of selected IDs
- **Step 3** (Success): Hide popup, refresh cultivars list, show success message
- **Step 4** (Error): Show error message

**UI Translations (Link Popup)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Popup Header | Agregar Cultivares del Sistema | Add System Cultivars | cultivars_link_header |
| Instructions | Selecciona los cultivares que cultivas en tu instalación | Select the cultivars you grow at your facility | cultivars_link_instructions |
| Search System | Buscar en catálogo... | Search catalog... | cultivars_search_system |
| Selected Count | Seleccionados: | Selected: | cultivars_selected_count |
| Add Selected | Agregar Seleccionados | Add Selected | cultivars_add_selected |
| Link Success | Cultivares agregados exitosamente | Cultivars added successfully | cultivars_link_success |

---

### Popup: Create Custom Cultivar

**Reusable Element Name**: `popup_create_custom_cultivar`

```
┌─────────────────────────────────────────────────────────┐
│ Nuevo Cultivar Personalizado                      [X]  │
├─────────────────────────────────────────────────────────┤
│ Cultivos San José    🌿 Cannabis    📅 2025-11-21      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────┬──────────────────────────┐    │
│ │ INFORMACIÓN BÁSICA   │ CARACTERÍSTICAS          │    │
│ │                      │                          │    │
│ │ Tipo de Cultivo:     │ Tiempo de Floración:     │    │
│ │ [v Cannabis ▼]       │ [__] semanas             │    │
│ │                      │                          │    │
│ │ Nombre del Cultivar: │ Nivel de Rendimiento:    │    │
│ │ [________________]   │ [v Medio ▼]              │    │
│ │                      │                          │    │
│ │ Tipo de Variedad:    │ THC Rango (%):           │    │
│ │ ○ Indica             │ Min [__] Max [__]        │    │
│ │ ○ Sativa             │                          │    │
│ │ ● Híbrida            │ CBD Rango (%):           │    │
│ │                      │ Min [__] Max [__]        │    │
│ │ Genética Parental:   │                          │    │
│ │ [________________]   │ Aromas/Sabores:          │    │
│ │                      │ [________________]       │    │
│ │ Breeder/Origen:      │ [________________]       │    │
│ │ [________________]   │                          │    │
│ │                      │ Efectos:                 │    │
│ │ Notas:               │ [________________]       │    │
│ │ [________________]   │                          │    │
│ │ [________________]   │                          │    │
│ └──────────────────────┴──────────────────────────┘    │
│                                                          │
│ [Cancelar]                                   [Guardar]  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Bubble Elements**:
- **Popup Container**: `popup_create_custom_cultivar` (800px width)
- **Header**: Similar to other popups
- **Form**: `group_form_create_cultivar` (Two-column)

**Column 1 - Basic Info**: `group_col1_basic`
- `dropdown_crop_type`: Cannabis, Coffee, Cocoa, Other (required)
- `input_cultivar_name`: Text input (required)
- `radio_variety_type`: (for Cannabis) Indica, Sativa, Híbrida
- `input_genetics`: Text input (optional)
- `input_breeder`: Text input (optional)
- `input_notes`: Textarea (optional)

**Column 2 - Characteristics**: `group_col2_characteristics`
- `input_flowering_weeks`: Number input (required for Cannabis/Coffee)
- `dropdown_yield_level`: low, medium, medium-high, high (required)
- `group_cannabinoid_ranges`: (Cannabis only)
  - `input_thc_min`: Number (decimal)
  - `input_thc_max`: Number (decimal)
  - `input_cbd_min`: Number (decimal)
  - `input_cbd_max`: Number (decimal)
- `input_aromas`: Text input (comma-separated)
- `input_effects`: Text input (comma-separated)

**Workflows**:

**Workflow: Submit Create Custom Cultivar**
- **Trigger**: `btn_submit_create_cultivar` is clicked
- **Step 1**: Validate required fields (crop type, name, flowering weeks, yield level)
- **Step 2** (Only when valid): API Call `call_createCustomCultivar`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `cropTypeId`: `dropdown_crop_type's value`
    - `name`: `input_cultivar_name's value`
    - `varietyType`: `radio_variety_type's value` (if cannabis)
    - `floweringWeeks`: `input_flowering_weeks's value`
    - `yieldLevel`: `dropdown_yield_level's value`
    - `thcRange`: `input_thc_min's value + "-" + input_thc_max's value` (if cannabis)
    - `cbdRange`: `input_cbd_min's value + "-" + input_cbd_max's value` (if cannabis)
    - `genetics`: `input_genetics's value`
    - `breeder`: `input_breeder's value`
    - `aromas`: `input_aromas's value`
    - `effects`: `input_effects's value`
    - `notes`: `input_notes's value`
- **Step 3** (Success): Hide popup, refresh list, show success message
- **Step 4** (Error): Show error message

**Database Context**:
- **Writes to**: `cultivars` table
  - Stores: facility_id, crop_type_id, name, variety_type, flowering_weeks, yield_level, thc_range, cbd_range, genetics, breeder, aromas, effects, notes, is_custom = true
  - Sets: created_at = current timestamp

**UI Translations (Create Popup)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Popup Header | Nuevo Cultivar Personalizado | New Custom Cultivar | cultivar_popup_create_header |
| Basic Info Section | INFORMACIÓN BÁSICA | BASIC INFORMATION | cultivar_popup_basic_section |
| Characteristics Section | CARACTERÍSTICAS | CHARACTERISTICS | cultivar_popup_characteristics_section |
| Crop Type | Tipo de Cultivo: | Crop Type: | cultivar_popup_crop_type |
| Name | Nombre del Cultivar: | Cultivar Name: | cultivar_popup_name |
| Variety Type | Tipo de Variedad: | Variety Type: | cultivar_popup_variety_type |
| Genetics | Genética Parental: | Parent Genetics: | cultivar_popup_genetics |
| Breeder | Breeder/Origen: | Breeder/Origin: | cultivar_popup_breeder |
| Notes | Notas: | Notes: | cultivar_popup_notes |
| Flowering Time | Tiempo de Floración: | Flowering Time: | cultivar_popup_flowering_time |
| Weeks | semanas | weeks | cultivar_popup_weeks |
| Yield Level | Nivel de Rendimiento: | Yield Level: | cultivar_popup_yield_level |
| THC Range | THC Rango (%): | THC Range (%): | cultivar_popup_thc_range |
| CBD Range | CBD Rango (%): | CBD Range (%): | cultivar_popup_cbd_range |
| Aromas | Aromas/Sabores: | Aromas/Flavors: | cultivar_popup_aromas |
| Effects | Efectos: | Effects: | cultivar_popup_effects |
| Success Message | Cultivar creado exitosamente | Cultivar created successfully | cultivar_create_success |

**Enum Translations (Variety Types - Cannabis)**:

| value | display_es | display_en |
|-------|------------|------------|
| indica | Indica | Indica |
| sativa | Sativa | Sativa |
| hybrid | Híbrida | Hybrid |

**Enum Translations (Yield Levels)**:

| value | display_es | display_en |
|-------|------------|------------|
| low | Bajo | Low |
| medium | Medio | Medium |
| medium_high | Medio-Alto | Medium-High |
| high | Alto | High |

---

### Page 2: Cultivar Detail

**Page Name**: `cultivar-detail`

```
┌─────────────────────────────────────────────────────────┐
│ Cultivares > Cherry AK                        [Editar*] │
├─────────────────────────────────────────────────────────┤
│ 🌿 Cherry AK (Indica Dominante)                         │
│ Cannabis | Sistema | 8-9 semanas floración              │
├─────────────────────────────────────────────────────────┤
│ [General] [Lotes] [Historial]                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ INFORMACIÓN GENERAL                                      │
│ Tipo de Cultivo: Cannabis                                │
│ Tipo de Variedad: Indica Dominante                      │
│ Tiempo de Floración: 8-9 semanas                        │
│ Nivel de Rendimiento: Medio-Alto                        │
│                                                          │
│ PERFIL DE CANNABINOIDES                                 │
│ THC: 18-22%                                              │
│ CBD: 0.5-1.5%                                            │
│                                                          │
│ CARACTERÍSTICAS                                          │
│ Genética: Afghani × Skunk #1                            │
│ Breeder: Unknown                                         │
│ Aromas: Dulce, Tierra, Skunky                           │
│ Efectos: Relajante, Eufórico, Creativo                  │
│                                                          │
│ NOTAS                                                    │
│ Variedad popular para uso medicinal y recreativo        │
│                                                          │
│ FECHAS                                                   │
│ Agregado: 2025-01-20 09:15 AM                           │
│ * Los cultivares del sistema no son editables           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**URL Parameter**: `id` (cultivar ID)

*Note: Edit button only visible for custom cultivars, disabled for system cultivars

**Workflows**: Similar to Area Detail (Load, Switch Tab, Navigate to Edit if custom)

**Database Context**:
- **Reads from**: `cultivars` table
- **Reads from**: `batches` table (for Lotes tab)
- **Reads from**: `production_orders` table (for usage history)

**UI Translations (Detail Page)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Edit Button | Editar | Edit | cultivar_detail_edit_btn |
| System Note | * Los cultivares del sistema no son editables | * System cultivars are not editable | cultivar_detail_system_note |
| General Tab | General | General | cultivar_tab_general |
| Batches Tab | Lotes | Batches | cultivar_tab_lotes |
| History Tab | Historial | History | cultivar_tab_historial |
| General Info Header | INFORMACIÓN GENERAL | GENERAL INFORMATION | cultivar_detail_general_header |
| Cannabinoid Profile | PERFIL DE CANNABINOIDES | CANNABINOID PROFILE | cultivar_detail_cannabinoid_header |
| Characteristics | CARACTERÍSTICAS | CHARACTERISTICS | cultivar_detail_characteristics_header |
| Genetics | Genética: | Genetics: | cultivar_detail_genetics |
| Breeder | Breeder: | Breeder: | cultivar_detail_breeder |
| Aromas | Aromas: | Aromas: | cultivar_detail_aromas |
| Effects | Efectos: | Effects: | cultivar_detail_effects |
| Added | Agregado: | Added: | cultivar_detail_added |

---

### Page 3: Cultivar Edit

**Page Name**: `cultivar-edit`

**Note**: Only accessible for custom cultivars (is_custom = true)

```
┌─────────────────────────────────────────────────────────┐
│ Cultivares > Ceibatic Special #1 > Editar  [Cancelar] [Guardar]│
├─────────────────────────────────────────────────────────┤
│ [Same form as Create Custom popup, pre-filled with data]│
└─────────────────────────────────────────────────────────┘
```

**Workflows**: Similar to Area Edit (Load for edit, Submit update, Cancel)

**Database Context**:
- **Reads from**: `cultivars` table (verify is_custom = true)
- **Updates**: `cultivars` table

**UI Translations (Edit Page)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Title | Editar Cultivar | Edit Cultivar | cultivar_edit_title |
| Success Message | Cultivar actualizado exitosamente | Cultivar updated successfully | cultivar_update_success |
| Cannot Edit System | No se pueden editar cultivares del sistema | Cannot edit system cultivars | cultivar_cannot_edit_system |

---

## MODULE 16: Supplier Management

**Pattern Reference**: See [CRUD-PATTERN.md](CRUD-PATTERN.md) for standard structure

Supplier Management provides full CRUD operations for tracking vendors that provide input materials like seeds, nutrients, pesticides, equipment, growing media, and other supplies. Each supplier has contact information, product categories, and purchase history.

### Page: Suppliers List

```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Proveedores              [+ Nuevo Proveedor]│
├─────────────────────────────────────────────────────────┤
│ 📊 Total: 15  |  🟢 Activos: 12  |  🔴 Inactivos: 3     │
├─────────────────────────────────────────────────────────┤
│ 🔍 Buscar proveedores...            [Categorías ▾]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ID   Nombre         Categorías    Contacto      Estado  │
│ 001  FarmChem Inc   Nutrientes,  ventas@...    🟢 Activo│
│                     Pesticidas                           │
│ 002  SeedSupply Co  Semillas     info@...      🟢 Activo│
│ 003  GrowTech SA    Equipamiento  tech@...     🟢 Activo│
│ 004  BioNutrients   Nutrientes   bio@...       🟡 Inact│
│                                                          │
│ [Ver] [Editar] [Contactar] [Desactivar]                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `suppliers-list`

Follows standard CRUD pattern with:
- List view with table layout
- Create popup for new suppliers
- Detail pages showing contact info, product categories, purchase history
- Edit functionality

**Key Features**:
- Product categories: nutrients, pesticides, seeds, equipment, growing_media, packaging, lab_testing, other
- Contact management (name, email, phone, address)
- Purchase order tracking
- Active/inactive status

**API Calls**: `call_getSuppliersByCompany`, `call_createSupplier`, `call_getSupplierById`, `call_updateSupplier`, `call_deleteSupplier`

---

## MODULE 17: User Invitations & Team Management

**Pattern Reference**: Company/Admin-level functionality

User Invitations provides admin functionality to invite team members to the platform and assign them roles. This module manages the facility's workforce with role-based access control.

> **Cross-Reference**: This module covers the **admin side** of invitations (sending, tracking, resending). For the **invited user side** (accepting invitations, setting password, joining the company), see [Phase 1 Module 5: Invited User Acceptance](PHASE-1-ONBOARDING.md#module-5-invited-user-acceptance).

### Page: Users Management

```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Gestión de Usuarios      [+ Invitar Usuario]│
├─────────────────────────────────────────────────────────┤
│ 📊 Total Usuarios: 12  |  👤 Activos: 10  |  ⏳ Pendientes: 2│
├─────────────────────────────────────────────────────────┤
│ 🔍 Buscar usuarios...                 [Rol ▾] [Estado ▾]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Usuario          Email           Rol            Estado  │
│ Juan Manager     juan@...        Manager        🟢 Activo│
│ María Supervisor maria@...       Supervisor     🟢 Activo│
│ Pedro Worker     pedro@...       Worker         🟢 Activo│
│ Ana QC          ana@...          QC Controller  🟢 Activo│
│ Luis Pending    luis@...         Worker         ⏳ Pendiente│
│                                                          │
│ [Ver Perfil] [Editar Rol] [Reenviar Invitación] [Desactivar]│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `users-management`

**User Roles**:
- **ADMIN**: Full system access, company-wide settings
- **FACILITY_MANAGER**: Manage facility operations, users, templates
- **PRODUCTION_SUPERVISOR**: Create orders, assign activities, review quality
- **WORKER**: Execute assigned activities, log data
- **QUALITY_CONTROLLER**: Perform quality checks, AI pest detection

**Invite User Popup**:
```
┌─────────────────────────────────────────┐
│ Invitar Nuevo Usuario            [X]  │
├─────────────────────────────────────────┤
│ Email: [___________________]           │
│ Nombre: [___________________]          │
│ Rol: [v Worker ▼]                      │
│ Instalación: [v North Farm ▼]         │
│                                         │
│ [Cancelar]          [Enviar Invitación]│
└─────────────────────────────────────────┘
```

**Key Features**:
- Email-based invitation system
- Role assignment (facility-specific)
- Invitation status tracking (pending, accepted, expired)
- Resend invitation functionality
- User activation/deactivation

**Complete Invitation Flow**:
1. **Admin sends invitation** (this module):
   - Admin fills invitation form with email, name, role, facilities
   - System creates invitation record with unique token
   - Email sent to invitee with link: `/accept-invitation?token=ABC123XYZ`
   - Invitation status: `pending` (expires in 72 hours)

2. **Invitee accepts invitation** ([Module 5](PHASE-1-ONBOARDING.md#module-5-invited-user-acceptance)):
   - Invitee clicks email link → Accept Invitation page
   - Sets password and personal details
   - Account created automatically (email pre-verified via invitation link)
   - User logged in and redirected to dashboard with facility context pre-set

3. **Admin tracks invitations** (this module):
   - View pending invitations in Users Management page
   - Resend invitation (generates new token, invalidates old)
   - Revoke invitation if needed
   - See when invitation was accepted

**API Calls**:
- Admin operations: `call_getUsersByCompany`, `call_inviteUser`, `call_updateUserRole`, `call_resendInvitation`, `call_deactivateUser`, `call_revokeInvitation`
- Invitee operations (Module 1B): See [Phase 1 API Endpoints: Module 1B](../api/PHASE-1-ONBOARDING-ENDPOINTS.md#module-1b-invited-user-acceptance)

---

## MODULE 18: Facility Management & Switcher

**Pattern Reference**: Multi-facility operations

Facility Management enables companies with multiple cultivation sites to manage all facilities from one account and quickly switch context between facilities. All data (areas, inventory, orders) is scoped to the active facility.

### Component 1: Facility Switcher (Global Header)

```
┌─────────────────────────────────────────┐
│ Alquemist  [🏭 North Farm ▾]    [User]│
├─────────────────────────────────────────┤
│ Dropdown Menu:                         │
│ ┌───────────────────────────────────┐ │
│ │ 🏭 North Farm ✓                   │ │
│ │ 🏭 South Greenhouse               │ │
│ │ 🏭 Urban Facility                 │ │
│ │ ────────────────────────────      │ │
│ │ + Agregar Instalación             │ │
│ │ ⚙️ Gestionar Instalaciones        │ │
│ └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Element**: `dropdown_facility_switcher` (in global header/reusable element)

**Functionality**:
- Displays current facility name
- Lists all facilities user has access to
- Quick switch to another facility
- Link to Facility Management page
- Add new facility (if plan allows)

**Workflow: Switch Facility**
- **Trigger**: User selects different facility from dropdown
- **Step 1**: Set Current User's `currentFacilityId` = selected facility ID
- **Step 2**: Refresh current page with new facility context
- **Step 3**: All subsequent API calls use new facility ID

---

### Component 2: Facilities Management Page

```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Instalaciones           [+ Nueva Instalación*]│
├─────────────────────────────────────────────────────────┤
│ 📊 Total Instalaciones: 3  |  Plan: Professional (5 max)│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🏭 North Farm                    [⋮] [Activa]     │ │
│ │ Medellín, Antioquia  |  500 m² licenciados         │ │
│ │ Tipo: Cultivo Comercial  |  Cannabis               │ │
│ │ Áreas: 8  |  Usuarios: 12  |  Órdenes activas: 5   │ │
│ │ [Ver Dashboard]  [Configurar]  [Cambiar a esta]    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🏭 South Greenhouse              [⋮]              │ │
│ │ Rionegro, Antioquia  |  200 m² licenciados         │ │
│ │ Tipo: Invernadero  |  Cannabis                     │ │
│ │ Áreas: 4  |  Usuarios: 5  |  Órdenes activas: 2    │ │
│ │ [Ver Dashboard]  [Configurar]  [Cambiar a esta]    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ * Plan permite hasta 5 instalaciones. 2 disponibles.   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Page Name**: `facilities-management`

**Key Features**:
- View all facilities in company
- Quick stats per facility (areas, users, active orders)
- Switch to facility (sets as current context)
- Configure facility settings (link to MODULE 20)
- Add new facility (if plan allows)
- Plan-based limits displayed

**Add Facility Popup** (if plan allows):
```
┌─────────────────────────────────────────┐
│ Nueva Instalación                 [X]  │
├─────────────────────────────────────────┤
│ Nombre: [___________________]          │
│ Tipo de Licencia: [v Cultivo Comercial▼]│
│ Número de Licencia: [___________]      │
│ Área Licenciada (m²): [_____]          │
│                                         │
│ Ubicación:                              │
│ Departamento: [v Antioquia ▼]          │
│ Municipio: [v Medellín ▼]              │
│ Dirección: [___________________]       │
│                                         │
│ [Cancelar]              [Crear Instalación]│
└─────────────────────────────────────────┘
```

**Plan-Based Limits**:
- **Basic Plan**: 1 facility
- **Professional Plan**: 5 facilities
- **Enterprise Plan**: Unlimited facilities

**API Calls**: `call_getFacilitiesByCompany`, `call_createFacility`, `call_updateFacility`, `call_switchFacility`

**Database Context**:
- **Reads from**: `facilities` table (all facilities where user has access)
- **Writes to**: `facilities` table (when creating new facility)
- **Updates**: `users` table (current_facility_id when switching)

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Title | Instalaciones | Facilities | facilities_page_title |
| Add Facility | Nueva Instalación | New Facility | facilities_add_btn |
| Total Facilities | Total Instalaciones: | Total Facilities: | facilities_total |
| Plan | Plan: | Plan: | facilities_plan |
| Max | max | max | facilities_max |
| Licensed Area | m² licenciados | m² licensed | facilities_licensed_area |
| Type | Tipo: | Type: | facilities_type |
| Areas | Áreas: | Areas: | facilities_areas |
| Users | Usuarios: | Users: | facilities_users |
| Active Orders | Órdenes activas: | Active Orders: | facilities_active_orders |
| View Dashboard | Ver Dashboard | View Dashboard | facilities_view_dashboard |
| Configure | Configurar | Configure | facilities_configure |
| Switch To | Cambiar a esta | Switch to this | facilities_switch_to |
| Plan Limit Note | Plan permite hasta X instalaciones. Y disponibles. | Plan allows up to X facilities. Y available. | facilities_plan_limit_note |
| Facility Switcher | Instalación Actual | Current Facility | header_facility_switcher |
| Add Facility Menu | Agregar Instalación | Add Facility | header_add_facility |
| Manage Facilities | Gestionar Instalaciones | Manage Facilities | header_manage_facilities |

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
