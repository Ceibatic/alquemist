# CRUD Pattern - Standard Entity Management

Este documento define el patrón estándar para gestión de entidades en Alquemist. Todas las entidades (Areas, Cultivares, Proveedores, Productos, Lotes, etc.) deben seguir esta estructura de 4 componentes.

## Estructura de 4 Componentes

```
1. Main List Page (entity-list)
   ├─→ [Create Button] → 2. Create Popup → [Success] → Refresh List
   ├─→ [Click Card/Row] → 3. Detail Page
   │                        ├─→ [Edit Button] → 4. Edit Page → [Save] → Back to Detail
   │                        └─→ [Delete Button] → Confirm → API → Back to List
   └─→ [Menu: Edit] → 4. Edit Page → [Save] → Back to Detail
```

---

## 1. Main List Page

**Purpose**: Vista principal para listar y acceder a todas las entidades

**Naming Convention**: `{entity}-list` (ejemplo: `areas-list`, `cultivars-list`, `products-list`)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Breadcrumb: {Entity Name}                               │ │
│ │ [Create {Entity} Button]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Filters/Tabs (optional)                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Tab 1] [Tab 2] [Tab 3]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Entity List (Repeating Group)                               │
│ ┌───────────────┬───────────────┬───────────────────────┐  │
│ │  Card/Row 1   │  Card/Row 2   │  Card/Row 3          │  │
│ │  [View]       │  [View]       │  [View]              │  │
│ │  [...Menu]    │  [...Menu]    │  [...Menu]           │  │
│ └───────────────┴───────────────┴───────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements

**Main Container**: `group_{entity}_list_page`
- **Breadcrumb**: `text_breadcrumb_{entity}`
- **Create Button**: `btn_create_{entity}` (Yellow primary button)
  - Text: "Crear {Entity}"
  - Action: Open `popup_create_{entity}`

**Filter/Tab Group** (if applicable): `group_{entity}_tabs`
- **Tab Buttons**: `btn_tab_{tab_name}`
- **Custom State**: `current_tab` (text)

**Repeating Group**: `rg_{entity}_list`
- **Data Source**: API Call `call_get{Entity}ByFacility`
- **Layout Type**: Grid/Table/Ext. Vertical Scroll (según convenga)
- **Item spacing**: 10-15px

**Entity Card/Row**: `group_{entity}_card`
- **Title/ID**: `text_{entity}_name`
- **Metadata**: Various text elements
- **View Action**: Click → Navigate to `{entity}-detail` with parameter `id`
- **Menu Button**: `btn_{entity}_menu` (3 dots)
  - Menu options: View, Edit, Delete

### View Types by Entity

| Entity | Recommended View | Rationale |
|--------|-----------------|-----------|
| Areas | Grid Cards | Visual overview con métricas |
| Cultivars | Grid Cards | Imágenes y características |
| Suppliers | Table | Datos tabulares (contacto, ubicación) |
| Products | Grid Cards | Imágenes de productos |
| Batches | Timeline/Kanban | Estado temporal/flujo |
| Orders | Table | Datos estructurados |

### Workflows

**Workflow: Load Entity List**
- **Trigger**: Page is loaded
- **Step 1**: Display data from `call_get{Entity}ByFacility`
  - Facility ID from `Current User > currentFacilityId`

**Workflow: Open Create Popup**
- **Trigger**: `btn_create_{entity}` is clicked
- **Step 1**: Show `popup_create_{entity}`

**Workflow: Navigate to Detail**
- **Trigger**: Entity card/row is clicked
- **Step 1**: Navigate to `{entity}-detail`
  - Send parameter `id` = `Current cell's {Entity} > _id`

**Workflow: Open Menu**
- **Trigger**: `btn_{entity}_menu` is clicked
- **Step 1**: Show menu dropdown (custom element or floating group)

**Workflow: Quick Delete**
- **Trigger**: Menu → Delete is clicked
- **Step 1**: Show confirmation popup
- **Step 2** (Only when confirmed): API Call `call_delete{Entity}`
  - Parameter: `id` = selected entity `_id`
- **Step 3** (Only when Step 2's success = true): Refresh `rg_{entity}_list`

---

## 2. Create Popup (Reusable Element)

**Purpose**: Modal reutilizable para crear nuevas entidades

**Naming Convention**: `popup_create_{entity}` (ejemplo: `popup_create_area`, `popup_create_cultivar`)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗  │
│ ║ Nueva {Entity}                                    [X] ║  │
│ ╠═══════════════════════════════════════════════════════╣  │
│ ║ Context Header (Company, Facility, Date)              ║  │
│ ╠═══════════════════════════════════════════════════════╣  │
│ ║ ┌──────────────────────┬──────────────────────────┐  ║  │
│ ║ │ Column 1             │ Column 2                 │  ║  │
│ ║ │ Section 1 Fields     │ Section 2 Fields         │  ║  │
│ ║ │ - Input 1            │ - Input 4                │  ║  │
│ ║ │ - Input 2            │ - Input 5                │  ║  │
│ ║ │ - Input 3            │ - Toggle/Checkbox        │  ║  │
│ ║ └──────────────────────┴──────────────────────────┘  ║  │
│ ║                                                       ║  │
│ ║ [Cancelar]                              [Siguiente]  ║  │
│ ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements

**Popup Container**: `popup_create_{entity}`
- **Type**: Reusable Element (Popup)
- **Width**: 600-800px
- **Center**: Yes

**Header**: `group_header_{entity}_create`
- **Title**: `text_popup_title` - "Nueva {Entity}"
- **Close Button**: `btn_close_popup`

**Context Bar** (optional): `group_context_info`
- Company name, facility badge, current date

**Form Container**: `group_form_create_{entity}`
- **Layout**: Two-column (50/50 split)
- **Column 1**: `group_col1_basic_info`
  - Información Básica fields
- **Column 2**: `group_col2_config`
  - Configuración/Additional fields

**Input Fields**: `input_{field_name}` or `dropdown_{field_name}`
- All required fields marked with red asterisk
- Validation on submit

**Action Buttons**:
- **Cancel**: `btn_cancel_create_{entity}`
  - Text: "Cancelar"
  - Action: Hide popup, reset inputs
- **Submit**: `btn_submit_create_{entity}`
  - Text: "Siguiente" or "Crear"
  - Style: Yellow primary button
  - Action: Create workflow

### Workflows

**Workflow: Open Create Popup**
- **Trigger**: Popup is shown
- **Step 1**: Reset all input fields
- **Step 2**: Set default values (if any)

**Workflow: Submit Create**
- **Trigger**: `btn_submit_create_{entity}` is clicked
- **Step 1**: Validate all required fields
  - Show error if validation fails
- **Step 2** (Only when all fields valid): API Call `call_create{Entity}`
  - Pass all input values as parameters
  - Include `facilityId` from `Current User > currentFacilityId`
- **Step 3** (Only when Step 2's success = true):
  - Hide popup
  - Refresh parent page's repeating group
  - Show success message
- **Step 4** (Only when Step 2's success = false):
  - Show error message from API response

**Workflow: Cancel Create**
- **Trigger**: `btn_cancel_create_{entity}` is clicked
- **Step 1**: Hide popup
- **Step 2**: Reset all inputs

---

## 3. Detail Page

**Purpose**: Vista detallada de una entidad con información completa y tabs

**Naming Convention**: `{entity}-detail` (ejemplo: `area-detail`, `cultivar-detail`, `product-detail`)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Breadcrumb: {Entity} > {Entity Name}                    │ │
│ │ [Editar Button]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Entity Header                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 001 - {Entity Name}                                     │ │
│ │ Status Badge | Metadata | Metrics                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Tab Navigation                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [General] [Registros] [Historial] [Other]              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Tab Content (Dynamic)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Content based on selected tab                           │ │
│ │ - General: Read-only form fields                        │ │
│ │ - Registros: Table of records                           │ │
│ │ - Historial: Timeline of changes                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements

**Main Container**: `group_{entity}_detail_page`
- **URL Parameter**: `id` (entity ID)

**Breadcrumb**: `group_breadcrumb`
- **Text**: `text_breadcrumb`
  - Value: "{Entity} > " & `entity_data's name`
- **Links**: Clickable back to list

**Edit Button**: `btn_edit_{entity}`
- Text: "Editar"
- Style: Yellow primary button
- Action: Navigate to `{entity}-edit` with parameter `id`

**Entity Header**: `group_{entity}_header`
- **ID/Code**: `text_{entity}_code`
- **Name**: `text_{entity}_name`
- **Status Badge**: `shape_status_badge`
- **Metrics**: `group_metrics` (stats relevant to entity)

**Tab Navigation**: `group_tabs_{entity}`
- **Tab Buttons**: `btn_tab_general`, `btn_tab_registros`, `btn_tab_historial`, etc.
- **Custom State**: `current_tab` (text, default: "general")
- **Active State Styling**: Conditional formatting

**Tab Content Groups**:
- **General Tab**: `group_tab_general`
  - Read-only fields displaying entity data
  - Two-column layout matching create popup
- **Registros Tab**: `group_tab_registros`
  - Repeating group of related records
  - Table format
- **Historial Tab**: `group_tab_historial`
  - Timeline of changes/audit log
- **Other Tabs**: As needed per entity

**Delete Button** (optional): `btn_delete_{entity}`
- Style: Red/destructive
- Action: Show confirmation before delete

### Workflows

**Workflow: Load Entity Detail**
- **Trigger**: Page is loaded
- **Step 1**: API Call `call_get{Entity}ById`
  - Parameter: `id` = Get data from page URL parameter `id`
- **Step 2**: Display data in all tabs
- **Step 3** (Only when Step 1's success = false):
  - Show error message
  - Navigate back to list

**Workflow: Switch Tab**
- **Trigger**: Any tab button is clicked
- **Step 1**: Set state `current_tab` = This tab's name
- **Step 2**: Show corresponding tab group, hide others

**Workflow: Navigate to Edit**
- **Trigger**: `btn_edit_{entity}` is clicked
- **Step 1**: Navigate to `{entity}-edit`
  - Send parameter `id` = Get data from page URL parameter `id`

**Workflow: Delete Entity**
- **Trigger**: `btn_delete_{entity}` is clicked
- **Step 1**: Show confirmation popup
- **Step 2** (Only when confirmed): API Call `call_delete{Entity}`
  - Parameter: `id` = Get data from page URL parameter `id`
- **Step 3** (Only when Step 2's success = true):
  - Navigate to `{entity}-list`
  - Show success message

---

## 4. Edit Page

**Purpose**: Formulario editable para modificar una entidad existente

**Naming Convention**: `{entity}-edit` (ejemplo: `area-edit`, `cultivar-edit`)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Breadcrumb: {Entity} > {Entity Name} > Editar           │ │
│ │ [Cancelar] [Guardar]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Tab Navigation (optional, for complex entities)             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [General] [Advanced] [Settings]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Edit Form                                                    │
│ ┌──────────────────────┬──────────────────────────────────┐ │
│ │ Column 1             │ Column 2                         │ │
│ │ Section 1            │ Section 2                        │ │
│ │ - Input 1 (editable) │ - Input 4 (editable)             │ │
│ │ - Input 2 (editable) │ - Input 5 (editable)             │ │
│ │ - Input 3 (editable) │ - Toggle/Checkbox                │ │
│ └──────────────────────┴──────────────────────────────────┘ │
│                                                              │
│ [Cancelar]                                      [Guardar]   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements

**Main Container**: `group_{entity}_edit_page`
- **URL Parameter**: `id` (entity ID)

**Breadcrumb**: `group_breadcrumb`
- **Text**: "{Entity} > {Name} > Editar"
- **Links**: Back to detail

**Edit Form**: `group_form_edit_{entity}`
- **Layout**: Two-column (matching create popup)
- **Column 1**: `group_col1_basic_info`
- **Column 2**: `group_col2_config`

**Input Fields**: `input_edit_{field_name}`
- Pre-filled with current values
- All fields editable
- Validation on submit

**Action Buttons**:
- **Cancel**: `btn_cancel_edit_{entity}`
  - Text: "Cancelar"
  - Action: Navigate back to detail without saving
- **Save**: `btn_save_{entity}`
  - Text: "Guardar"
  - Style: Yellow primary button
  - Action: Update workflow

### Workflows

**Workflow: Load Entity for Edit**
- **Trigger**: Page is loaded
- **Step 1**: API Call `call_get{Entity}ById`
  - Parameter: `id` = Get data from page URL parameter `id`
- **Step 2**: Pre-fill all input fields with current values
- **Step 3** (Only when Step 1's success = false):
  - Show error message
  - Navigate back to detail

**Workflow: Save Changes**
- **Trigger**: `btn_save_{entity}` is clicked
- **Step 1**: Validate all required fields
  - Show error if validation fails
- **Step 2** (Only when all fields valid): API Call `call_update{Entity}`
  - Parameter: `id` = Get data from page URL parameter `id`
  - Pass all updated input values
- **Step 3** (Only when Step 2's success = true):
  - Navigate to `{entity}-detail` with parameter `id`
  - Show success message
- **Step 4** (Only when Step 2's success = false):
  - Show error message from API response

**Workflow: Cancel Edit**
- **Trigger**: `btn_cancel_edit_{entity}` is clicked
- **Step 1**: Navigate to `{entity}-detail` with parameter `id`
  - No API call, changes discarded

---

## Naming Conventions Summary

### Pages
| Component | Pattern | Example |
|-----------|---------|---------|
| List Page | `{entity}-list` | `areas-list` |
| Detail Page | `{entity}-detail` | `areas-detail` |
| Edit Page | `{entity}-edit` | `areas-edit` |

### Reusable Elements
| Component | Pattern | Example |
|-----------|---------|---------|
| Create Popup | `popup_create_{entity}` | `popup_create_area` |
| Delete Confirmation | `popup_confirm_delete_{entity}` | `popup_confirm_delete_area` |

### Elements
| Element Type | Pattern | Example |
|--------------|---------|---------|
| Group | `group_{entity}_{purpose}` | `group_area_card` |
| Repeating Group | `rg_{entity}_list` | `rg_areas_list` |
| Button | `btn_{action}_{entity}` | `btn_create_area` |
| Input | `input_{field_name}` or `input_edit_{field_name}` | `input_area_name` |
| Text | `text_{entity}_{field}` | `text_area_name` |
| Dropdown | `dropdown_{field_name}` | `dropdown_area_type` |

### API Calls
| Operation | Pattern | Example |
|-----------|---------|---------|
| Get List | `call_get{Entity}ByFacility` | `call_getAreasByFacility` |
| Get Detail | `call_get{Entity}ById` | `call_getAreaById` |
| Create | `call_create{Entity}` | `call_createArea` |
| Update | `call_update{Entity}` | `call_updateArea` |
| Delete | `call_delete{Entity}` | `call_deleteArea` |

### Custom States
| State | Pattern | Type | Example |
|-------|---------|------|---------|
| Current Tab | `current_tab` | text | "general", "registros", "historial" |
| Selected Entity | `selected_{entity}` | {Entity} type | selected_area |
| Form Validation | `form_valid` | boolean | true/false |

---

## Navigation Flows

### Create Flow
```
List Page
  └→ [Crear Button]
     └→ Create Popup (opens)
        └→ [Fill Form & Submit]
           └→ API Call create{Entity}
              ├→ Success: Close Popup → Refresh List → Show Success
              └→ Error: Show Error in Popup
```

### View Flow
```
List Page
  └→ [Click Card/Row]
     └→ Detail Page (id parameter)
        └→ API Call get{Entity}ById
           ├→ Success: Display Data in Tabs
           └→ Error: Show Error → Back to List
```

### Edit Flow
```
Detail Page
  └→ [Editar Button]
     └→ Edit Page (id parameter)
        └→ API Call get{Entity}ById
           └→ Pre-fill Form
              └→ [Modify & Save]
                 └→ API Call update{Entity}
                    ├→ Success: Navigate to Detail → Show Success
                    └→ Error: Show Error in Edit Page
```

### Delete Flow
```
Detail Page (or List Page Menu)
  └→ [Delete Button]
     └→ Confirmation Popup
        └→ [Confirm]
           └→ API Call delete{Entity}
              ├→ Success: Navigate to List → Show Success
              └→ Error: Show Error → Stay on Current Page
```

---

## Responsive Design Guidelines

### Desktop (1200px+)
- Two-column layouts for forms
- Grid view for cards (3-4 columns)
- Full navigation sidebar visible

### Tablet (768px - 1199px)
- Two-column layouts collapse to single column
- Grid view for cards (2 columns)
- Collapsible sidebar

### Mobile (<768px)
- All layouts single column
- Cards full width
- Tab navigation as horizontal scroll
- Sidebar becomes hamburger menu

---

## Example: Areas CRUD Implementation

### 1. Areas List Page (`areas-list`)

**Elements**:
- `group_areas_list_page`
  - `text_breadcrumb_areas`: "Areas"
  - `btn_create_area`: "Crear Area" (Yellow)
  - `group_areas_tabs`
    - `btn_tab_produccion`: "Producción"
    - `btn_tab_sociales`: "Sociales"
  - `rg_areas_list` (Grid, 3 columns)
    - `group_area_card`
      - `text_area_code`: "001"
      - `text_area_name`: "Propagación A"
      - `text_area_type`: "Producción"
      - `text_area_size`: "50 m²"
      - `text_area_capacity`: Progress bar
      - `group_area_metrics`: Temp, Luz, Humedad
      - `btn_area_menu`: 3 dots

**Workflows**:
- On page load → `call_getAreasByFacility`
- Create button → Show `popup_create_area`
- Click card → Navigate to `area-detail?id={area_id}`

### 2. Create Area Popup (`popup_create_area`)

**Elements**:
- Column 1: Información Básica
  - `input_area_name`
  - `dropdown_area_type`
  - `input_area_size`
  - `input_area_capacity`
- Column 2: Configuración Ambiental
  - `checkbox_climate_controlled`
  - `input_temp_min`
  - `input_temp_max`
  - `input_humidity_target`

**Workflows**:
- Submit → `call_createArea` → Close popup → Refresh list

### 3. Area Detail Page (`area-detail`)

**Elements**:
- `group_area_header`: "001 - Propagación A"
- Tabs: General, Registros, Lotes, Historial
- `group_tab_general`: Read-only fields
- `group_tab_registros`: Table of records
- `btn_edit_area`: "Editar"

**Workflows**:
- On load → `call_getAreaById?id={url_param_id}`
- Edit button → Navigate to `area-edit?id={area_id}`

### 4. Area Edit Page (`area-edit`)

**Elements**:
- Same layout as create popup
- Pre-filled with current values
- `btn_save_area`: "Guardar"
- `btn_cancel_edit_area`: "Cancelar"

**Workflows**:
- On load → `call_getAreaById` → Pre-fill inputs
- Save → `call_updateArea` → Navigate to detail

---

## Applicable Entities

Este patrón CRUD se aplica a:

✅ **Core Entities**:
- Areas
- Cultivars
- Suppliers
- Products (Inventory)
- Batches (Lotes)

✅ **Operations**:
- Production Orders
- Movement Records
- Harvest Records

✅ **Configuration**:
- Templates
- Users (within facility)
- Facilities (for admin)

✅ **Advanced**:
- Quality Control Records
- Waste Records
- Compliance Reports

---

## Next Steps

When implementing a new entity:

1. ✅ Review this CRUD pattern
2. ✅ Determine appropriate view type for list page
3. ✅ Design create popup fields (2 columns)
4. ✅ Define detail page tabs
5. ✅ Create edit page layout
6. ✅ Apply naming conventions
7. ✅ Implement workflows
8. ✅ Test navigation flows
9. ✅ Add to documentation

---

**Última actualización**: 2025-11-17
