# PHASE 2: OPERATIONS - UI REQUIREMENTS

**Focus**: Day-to-day production workflows and batch management
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md)
**API Endpoints**: See [../../api/PHASE-2-ENDPOINTS.md](../../api/PHASE-2-ENDPOINTS.md)

---

## Overview

Phase 2 is the operational hub for daily farming activities. Users create production templates, place orders, track inventory, log activities, and run quality checks. Everything is batch-centric (50-1000 plants per batch).

**Total Pages**: ~22 screens
**User Flow**: Non-linear, parallel workflows
**Primary Users**: FACILITY_MANAGER, PRODUCTION_SUPERVISOR, WORKER

---

## Internationalization (i18n)

**Languages Supported**: Spanish (default), English

All UI texts in this document must be implemented using the i18n system. See [../../i18n/STRATEGY.md](../../i18n/STRATEGY.md) for complete implementation strategy.

**Implementation Approach**:
- All UI texts stored in Bubble Option Set `UI_Texts` with both Spanish and English translations
- Enum values (activity types, status, etc.) stored in dedicated Option Sets
- Backend sends technical codes only, frontend handles translation
- Language switcher available in all pages

**Translation Tables**: Each module below includes translation tables following the same format as Phase 1.

For implementation details, see [../../i18n/BUBBLE-IMPLEMENTATION.md](../../i18n/BUBBLE-IMPLEMENTATION.md).

---

## MODULE 9: Inventory Management

### Page 1: Inventory Dashboard
```
┌────────────────────────────────┐
│   📦 INVENTORY                 │
│   North Farm                   │
├────────────────────────────────┤
│                                │
│ ⚠ CRITICAL ITEMS:              │
│ • Nutrient A [5 left]          │
│   Reorder point: 10            │
│   [Reorder Now]                │
│                                │
│ 🟡 LOW STOCK:                  │
│ • Seeds: Cherry AK [25]        │
│ • Pesticide B [3 L]            │
│                                │
│ ✓ IN STOCK:                    │
│ • Nutrient B [47 units]        │
│ • Water [4200 L]               │
│                                │
│ [View Full Inventory]          │
│ [+ Add Item]                   │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Repeating Group: Critical items (quantity < reorder_point)
- Repeating Group: Low stock items
- Repeating Group: In stock items
- Button: "View Full Inventory" → navigate to full list
- Button: "+ Add Item" → open popup

**Database Context**:
- **Reads from**: `inventory_items` table
  - Gets: all items for facility
  - Filters: by quantity_available vs. reorder_point
- **Reads from**: `products` table
  - Gets: product names and details

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | INVENTARIO | INVENTORY | inventory_header |
| Critical Items Section | ⚠ ARTÍCULOS CRÍTICOS: | ⚠ CRITICAL ITEMS: | inventory_critical_section |
| Low Stock Section | 🟡 STOCK BAJO: | 🟡 LOW STOCK: | inventory_low_stock_section |
| In Stock Section | ✓ EN STOCK: | ✓ IN STOCK: | inventory_in_stock_section |
| Left Text | restantes | left | inventory_left_text |
| Reorder Point Label | Punto de reorden: | Reorder point: | inventory_reorder_point_label |
| Reorder Now Button | Reordenar Ahora | Reorder Now | inventory_reorder_now_btn |
| View Full Inventory Button | Ver Inventario Completo | View Full Inventory | inventory_view_full_btn |
| Add Item Button | + Agregar Artículo | + Add Item | inventory_add_item_btn |

---

### Page 2: Inventory List (Full)
```
┌──────────────────────────────────────┐
│   📋 ALL INVENTORY                   │
├──────────────────────────────────────┤
│ [Search] Filter: [All ▼] Sort: [▼]  │
│                                      │
│ Item          Qty   Unit  Reorder    │
│ Nutrient A    5     units ⚠ [RO]    │
│ Nutrient B    47    units [ ]        │
│ Seeds-Cherry  25    units [RO]       │
│ Water         4200  L     [ ]        │
│                                      │
│ [+ Add Item] [Consume] [Transfer]    │
│                                      │
└──────────────────────────────────────┘
```

**Bubble Elements**:
- Search input: Filter by product name
- Dropdown: Filter by category
- Dropdown: Sort options
- Repeating Group: All inventory items
  - Shows: product name, quantity, unit, reorder status
  - Buttons: "RO" (reorder), "Consume", "Transfer"
- Button: "+ Add Item" → open add popup

**Database Context**:
- **Reads from**: `inventory_items` table joined with `products`
  - Gets: all inventory for selected facility

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | TODO EL INVENTARIO | ALL INVENTORY | inventory_all_header |
| Search Placeholder | Buscar | Search | inventory_search_placeholder |
| Filter Label | Filtrar: | Filter: | inventory_filter_label |
| Sort Label | Ordenar: | Sort: | inventory_sort_label |
| All Filter Option | Todos | All | inventory_filter_all |
| Item Column | Artículo | Item | inventory_column_item |
| Qty Column | Cant. | Qty | inventory_column_qty |
| Unit Column | Unidad | Unit | inventory_column_unit |
| Reorder Column | Reorden | Reorder | inventory_column_reorder |
| Add Item Button | + Agregar Artículo | + Add Item | inventory_add_item_btn_2 |
| Consume Button | Consumir | Consume | inventory_consume_btn |
| Transfer Button | Transferir | Transfer | inventory_transfer_btn |
| RO Button | RO | RO | inventory_ro_btn |

---

### Popup: Consume Material
```
┌────────────────────────────────┐
│   LOG CONSUMPTION              │
├────────────────────────────────┤
│ Item: Nutrient A               │
│ Current Stock: 45 units        │
│                                │
│ Batch Applied To:              │
│ [v Batch-2025-001 ▼]           │
│                                │
│ Quantity Consumed:             │
│ [____] units                   │
│                                │
│ Activity Type:                 │
│ [v Feeding ▼]                  │
│                                │
│ Notes:                         │
│ [___________________]          │
│                                │
│ [Cancel] [Log Consumption]     │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Text: Item name, current stock
- Dropdown: Batch selection
- Input: Quantity consumed (numeric)
- Dropdown: Activity type
- Input: Notes (textarea)
- Button: "Cancel" → close popup
- Button: "Log Consumption" → submit

**Workflow**:
1. Call API: Log consumption
2. Update inventory quantity
3. Create activity record
4. Close popup and refresh list

**Database Context**:
- **Reads from**: `batches` table → get active batches for dropdown
- **Updates**: `inventory_items` table → decrease quantity_available
- **Writes to**: `activities` table → log consumption event with materials_consumed array

**UI Translations (Popup)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Popup Header | REGISTRAR CONSUMO | LOG CONSUMPTION | inventory_consume_popup_header |
| Item Label | Artículo: | Item: | inventory_consume_item_label |
| Current Stock Label | Stock Actual: | Current Stock: | inventory_consume_current_stock_label |
| Batch Label | Lote Aplicado a: | Batch Applied To: | inventory_consume_batch_label |
| Quantity Label | Cantidad Consumida: | Quantity Consumed: | inventory_consume_quantity_label |
| Activity Type Label | Tipo de Actividad: | Activity Type: | inventory_consume_activity_type_label |
| Notes Label | Notas: | Notes: | inventory_consume_notes_label |
| Cancel Button | Cancelar | Cancel | inventory_consume_cancel_btn |
| Log Button | Registrar Consumo | Log Consumption | inventory_consume_log_btn |
| Success Message | Transferencia completada | Transfer completed | inventory_consume_success |

**Enum Translations (Activity Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| watering | Riego | Watering |
| feeding | Alimentación | Feeding |
| pruning | Poda | Pruning |
| inspection | Inspección | Inspection |
| treatment | Tratamiento | Treatment |
| harvest | Cosecha | Harvest |
| movement | Movimiento | Movement |
| quality_check | Control de Calidad | Quality Check |
| other | Otro | Other |

---

## MODULE 10: Production Templates

### Page 3: Templates List
```
┌────────────────────────────────┐
│   📋 PRODUCTION TEMPLATES      │
│   North Farm                   │
├────────────────────────────────┤
│ [+ New Template]               │
│                                │
│ ┌──────────────────────────┐  │
│ │ Cannabis Full Cycle      │  │
│ │ Crop: Cannabis           │  │
│ │ Duration: 20 weeks       │  │
│ │ Phases: 4                │  │
│ │ [Edit] [Clone] [Use]     │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ Coffee Processing        │  │
│ │ Crop: Coffee             │  │
│ │ Duration: 52 weeks       │  │
│ │ Phases: 3                │  │
│ │ [Edit] [Clone] [Use]     │  │
│ └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ New Template" → navigate to create page
- Repeating Group: Template cards
  - Shows: name, crop, duration, phase count
  - Buttons: "Edit", "Clone", "Use" (start order)

**Database Context**:
- **Reads from**: `production_templates` table
  - Gets: all templates for company
- **Reads from**: `crop_types` table
  - Gets: crop names for display

---

### Page 4: Create/Edit Template
```
┌────────────────────────────────┐
│   NEW PRODUCTION TEMPLATE      │
├────────────────────────────────┤
│ Template Name:                 │
│ [_______________________]      │
│                                │
│ Crop Type:                     │
│ [v Cannabis ▼]                 │
│                                │
│ Default Batch Size:            │
│ [200] plants                   │
│                                │
│ Estimated Duration:            │
│ [20] weeks                     │
│                                │
│ Environmental Targets:         │
│ Temp: [20] - [25] °C           │
│ Humidity: [60] - [70] %        │
│                                │
│ PHASES:                        │
│ [+ Add Phase]                  │
│                                │
│ ┌──────────────────────────┐  │
│ │ 1. Propagation (1 week)  │  │
│ │ [Edit] [Delete] [↑↓]     │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ 2. Vegetative (4 weeks)  │  │
│ │ [Edit] [Delete] [↑↓]     │  │
│ └──────────────────────────┘  │
│                                │
│ [Cancel] [Save Template]       │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Input: Template name
- Dropdown: Crop type
- Input: Default batch size (numeric)
- Input: Estimated duration (numeric)
- Input: Temperature range (min/max)
- Input: Humidity range (min/max)
- Button: "+ Add Phase" → open phase popup
- Repeating Group: Phases
  - Shows: phase order, name, duration
  - Buttons: "Edit", "Delete", "Move Up/Down"
- Button: "Save Template" → submit

**Database Context**:
- **Writes to**: `production_templates` table
  - Stores: name, crop_type_id, default_batch_size, estimated_duration_days, environmental_requirements
- **Writes to**: `template_phases` table (for each phase)
  - Stores: template_id, phase_name, phase_order, estimated_duration_days

---

### Popup: Add/Edit Phase
```
┌────────────────────────────────┐
│   EDIT PHASE: VEGETATIVE       │
├────────────────────────────────┤
│ Phase Name:                    │
│ [Vegetative]                   │
│                                │
│ Duration (days):               │
│ [28]                           │
│                                │
│ Area Type:                     │
│ [v Vegetative Room ▼]          │
│                                │
│ Target Conditions:             │
│ Temp: [21] - [24] °C           │
│ Humidity: [65] - [75] %        │
│ Light: [18]h on / [6]h off     │
│                                │
│ ACTIVITIES:                    │
│ [+ Add Activity]               │
│                                │
│ ☑ Watering (every 2 days)      │
│ ☑ Feeding (every 3 days)       │
│ ☑ Pruning (weekly)             │
│                                │
│ [Cancel] [Save Phase]          │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Input: Phase name
- Input: Duration (numeric, in days)
- Dropdown: Area type
- Input: Temperature, humidity, light cycle
- Button: "+ Add Activity" → open activity popup
- Repeating Group: Activities
  - Shows: activity name, frequency
  - Checkboxes: Enable/disable
- Button: "Save Phase" → submit

**Database Context**:
- **Writes to**: `template_phases` table
  - Stores: phase details
- **Writes to**: `template_activities` table (for each activity)
  - Stores: phase_id, activity_name, timing_configuration

---

## MODULE 11: Quality Check Templates

### Page 5: QC Templates List
```
┌────────────────────────────────┐
│   ✓ QUALITY CHECKS             │
│   North Farm                   │
├────────────────────────────────┤
│ [+ New QC Template]            │
│                                │
│ ┌──────────────────────────┐  │
│ │ Daily Visual Inspection  │  │
│ │ Type: Visual             │  │
│ │ Phases: Veg, Flower      │  │
│ │ [Edit] [Run] [Duplicate] │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ Pest Detection (AI)      │  │
│ │ Type: AI-Assisted        │  │
│ │ Phases: All              │  │
│ │ [Edit] [Run] [Duplicate] │  │
│ └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ New QC Template" → navigate to create page
- Repeating Group: QC template cards
  - Shows: name, type, applicable phases
  - Buttons: "Edit", "Run" (execute check), "Duplicate"

**Database Context**:
- **Reads from**: `quality_check_templates` table
  - Gets: all QC templates for company

---

### Page 6: Run Quality Check
```
┌────────────────────────────────┐
│   DAILY PLANT INSPECTION       │
│   Batch: Batch-2025-001        │
├────────────────────────────────┤
│ Date: 2025-10-27               │
│ Inspector: [John Doe ▼]        │
│                                │
│ CRITERIA 1: Leaf Color         │
│ Status: ○ Pass ○ Fail          │
│ Notes: [Green, healthy]        │
│ Photo: [📷 Take Photo]         │
│                                │
│ CRITERIA 2: Pest/Disease       │
│ Status: ○ Pass ○ Fail          │
│ Notes: [No visible signs]      │
│ Photo: [📷 Take Photo]         │
│ [🤖 AI Check Image]            │
│ AI Result: No pests detected   │
│                                │
│ CRITERIA 3: Growth Rate        │
│ Status: ○ Pass ○ Fail          │
│ Notes: [Normal for stage]      │
│                                │
│ Overall Result:                │
│ ☑ PASS ☐ FAIL                 │
│                                │
│ [Save Draft] [Submit Check]    │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Text: Batch name, date
- Dropdown: Inspector (user selector)
- Repeating Group: Criteria items
  - Radio buttons: Pass/Fail for each
  - Input: Notes (textarea)
  - Button: "Take Photo" → camera/file upload
  - Button: "AI Check Image" → trigger AI analysis
  - Text: AI result (if available)
- Radio buttons: Overall result
- Button: "Save Draft" → save without finalizing
- Button: "Submit Check" → finalize QC check

**Workflow**:
1. Load QC template criteria
2. User fills in Pass/Fail for each criteria
3. Optional: Upload photo and trigger AI analysis
4. On submit → Call API: Run check
5. If FAIL → Show alert and suggested actions

**Database Context**:
- **Reads from**: `quality_check_templates` table
  - Gets: template structure and criteria
- **Writes to**: `activities` table
  - Stores: QC check results in quality_check_data field
- **Writes to**: `pest_disease_records` table (if pest detected)
  - Stores: pest detection details
- **Writes to**: `media_files` table (if photo uploaded)
  - Stores: QC photos

---

## MODULE 12: Production Orders & Operations

### Page 7: Production Orders Dashboard
```
┌────────────────────────────────┐
│   🌱 PRODUCTION ORDERS         │
│   North Farm                   │
├────────────────────────────────┤
│ [+ New Order]                  │
│                                │
│ ACTIVE BATCHES:                │
│ ┌──────────────────────────┐  │
│ │ Batch-2025-001           │  │
│ │ Cannabis, 200 plants     │  │
│ │ Status: Vegetative W3/4  │  │
│ │ Started: 2025-09-15      │  │
│ │ [View] [Log Activity]    │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ Batch-2025-002           │  │
│ │ Cannabis, 150 plants     │  │
│ │ Status: Propagation W1   │  │
│ │ Started: 2025-10-01      │  │
│ │ [View] [Log Activity]    │  │
│ └──────────────────────────┘  │
│                                │
│ COMPLETED: 3                   │
│ [View Archive]                 │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ New Order" → navigate to create page
- Repeating Group: Active batches
  - Shows: batch number, crop, quantity, status, start date
  - Buttons: "View" (details), "Log Activity"
- Text: Completed count
- Button: "View Archive" → show completed orders

**Database Context**:
- **Reads from**: `production_orders` table joined with `batches`
  - Gets: active orders (status = "en_proceso")
  - Gets: batch details (current_phase, current_quantity)

---

### Page 8: Create Production Order
```
┌────────────────────────────────┐
│   NEW PRODUCTION ORDER         │
├────────────────────────────────┤
│ Select Template:               │
│ [v Cannabis Full Cycle ▼]      │
│                                │
│ Facility:                      │
│ [v North Farm ▼]               │
│                                │
│ Starting Area:                 │
│ [v Propagation Room ▼]         │
│                                │
│ Cultivar:                      │
│ [v Cherry AK ▼]                │
│                                │
│ Batch Size:                    │
│ [200] plants                   │
│ (Recommended: 200)             │
│                                │
│ Start Date:                    │
│ [2025-10-27]                   │
│                                │
│ Notes:                         │
│ [Premium batch for Q1]         │
│                                │
│ [Cancel] [Create Order]        │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Template selection
- Dropdown: Facility
- Dropdown: Starting area (filtered by facility)
- Dropdown: Cultivar
- Input: Batch size (numeric, pre-filled from template)
- Date picker: Start date
- Input: Notes (textarea)
- Button: "Create Order" → submit

**Workflow**:
1. On template select → Load template defaults (batch size, duration)
2. On facility select → Filter areas by facility
3. On submit → Call API: Create order
4. Navigate to order detail page

**Database Context**:
- **Reads from**: `production_templates` table → get templates
- **Reads from**: `facilities` table → get facilities for company
- **Reads from**: `areas` table → get areas for selected facility
- **Reads from**: `cultivars` table → get cultivars linked to facility
- **Writes to**: `production_orders` table
  - Stores: order details
- **Writes to**: `batches` table
  - Creates batch linked to order
- **Writes to**: `scheduled_activities` table
  - Auto-generates activities from template

---

### Page 9: Order Detail / Track Progress
```
┌────────────────────────────────┐
│   ORDER: Batch-2025-001        │
│   Cannabis, 200 plants         │
├────────────────────────────────┤
│ Status: Vegetative (W3/4)      │
│ Started: 2025-09-15            │
│ Est. Harvest: 2025-12-20       │
│ Days Remaining: 23             │
│                                │
│ PROGRESS:                      │
│ [✓✓✓✓] Propagation (1w)        │
│ [■■■■□□] Vegetative (4w) ← Now │
│ [      ] Flowering (8w)         │
│ [      ] Drying (7w)            │
│                                │
│ UPCOMING ACTIVITIES:           │
│ Today: Watering (due now)      │
│ [Log Now] [Skip] [Snooze]      │
│                                │
│ Thu: Feeding                   │
│ Sat: Inspection                │
│                                │
│ MATERIALS USED:                │
│ • Nutrient A: 40 units         │
│ • Water: 800L                  │
│ [View Consumption Log]         │
│                                │
│ [Complete Phase] [Harvest]     │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Text: Order/batch details
- Progress bars: Show phase completion
- Repeating Group: Upcoming activities
  - Shows: activity type, scheduled date, status
  - Buttons: "Log Now", "Skip", "Snooze"
- Repeating Group: Materials used
  - Shows: product name, quantity consumed
- Button: "Complete Phase" → move to next phase
- Button: "Harvest" → record harvest

**Database Context**:
- **Reads from**: `production_orders` table → get order details
- **Reads from**: `batches` table → get batch current state
- **Reads from**: `scheduled_activities` table → get upcoming activities
- **Reads from**: `activities` table → get material consumption history

---

### Popup: Log Activity
```
┌────────────────────────────────┐
│   LOG ACTIVITY                 │
│   Batch: Batch-2025-001        │
├────────────────────────────────┤
│ Activity: Watering             │
│ Phase: Vegetative (W3)         │
│                                │
│ Completed By:                  │
│ [v John Doe ▼]                 │
│                                │
│ Date & Time:                   │
│ [2025-10-27] [09:30]           │
│                                │
│ Materials Used:                │
│ Nutrient A: [5] units          │
│ Water: [100] L                 │
│ [+ Add Material]               │
│                                │
│ Observations:                  │
│ [Plant color good, growth]     │
│ [progressing normally]         │
│                                │
│ Photos (optional):             │
│ [📷 Upload] [Drag & Drop]      │
│                                │
│ [Cancel] [Log Activity]        │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Text: Activity type, batch, phase
- Dropdown: Completed by (user selector)
- Date/time picker: When performed
- Repeating Group: Materials consumed
  - Input: Quantity for each material
  - Button: "+ Add Material" → add row
- Input: Observations (textarea)
- File uploader: Photos
- Button: "Log Activity" → submit

**Workflow**:
1. Pre-fill activity details from scheduled activity
2. User fills in materials and notes
3. On submit → Call API: Log activity
4. Update inventory quantities
5. Mark scheduled activity as completed
6. Close popup and refresh order detail

**Database Context**:
- **Writes to**: `activities` table
  - Stores: batch_id, activity_type, performed_by, timestamp, materials_consumed, observations
- **Updates**: `inventory_items` table
  - Decrease quantity for consumed materials
- **Updates**: `scheduled_activities` table
  - Mark as completed
- **Writes to**: `media_files` table (if photos uploaded)

---

## MODULE 13: AI Engine & Insights

### Page 10: AI Insights Dashboard
```
┌────────────────────────────────┐
│   🤖 INTELLIGENT INSIGHTS      │
│   North Farm - This Week       │
├────────────────────────────────┤
│ 🎯 KEY RECOMMENDATIONS:        │
│                                │
│ ┌──────────────────────────┐  │
│ │ 1. BATCH-2025-001:       │  │
│ │ "Ready to move to        │  │
│ │  Flowering in 3-4 days"  │  │
│ │ Confidence: 95%          │  │
│ │ [View Details] [Auto]    │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ 2. LOW NUTRIENT ALERT:   │  │
│ │ "Nutrient A will run out │  │
│ │  in 5 days at current    │  │
│ │  consumption rate"       │  │
│ │ [Reorder] [Adjust]       │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ 3. YIELD FORECAST:       │  │
│ │ "Batch-2025-001 on track │  │
│ │  for 35-38 kg (117%)"    │  │
│ │ [View Details]           │  │
│ └──────────────────────────┘  │
│                                │
│ [View All Insights]            │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Repeating Group: Insight cards
  - Shows: insight type, title, description, confidence
  - Buttons: Action buttons (varies by insight type)
- Button: "View All Insights" → full list

**Database Context**:
- **Reads from**: Multiple sources for AI analysis
  - `production_orders` → current progress
  - `batches` → batch performance
  - `activities` → activity patterns
  - `inventory_items` → stock levels and consumption
  - `pest_disease_records` → pest trends
- **Calls**: AI analysis functions (server-side)
  - Analyzes data patterns
  - Generates recommendations

**Note**: AI insights are generated server-side and cached for performance

---

## RESPONSIVE DESIGN NOTES

### Desktop (1200px+)
- Two-column layout for lists and details
- Side-by-side popups
- Full data tables

### Tablet (768px - 1199px)
- Single column with collapsible sections
- Full-width popups
- Simplified tables

### Mobile (< 768px)
- See [../ui/bubble/MOBILE.md](../ui/bubble/MOBILE.md) for PWA-specific UI
- Bottom navigation
- Simplified dashboards
- Quick-log workflows

---

## KEY WORKFLOWS SUMMARY

### Inventory Workflow
```
Dashboard → View low stock
         → Add item (popup)
         → Consume material (popup + update)
         → Transfer between areas
```

### Template Creation Workflow
```
Templates list → New template
              → Add phases (popup)
              → Add activities to phase (popup)
              → Save template
              → Clone for variations
```

### Production Order Workflow
```
Orders dashboard → New order (select template)
                → Order created (auto-schedules activities)
                → Log activities daily
                → Complete phases
                → Harvest → Complete order
```

### Quality Check Workflow
```
QC Templates → Run check (select batch)
            → Fill criteria (Pass/Fail)
            → Upload photo (optional AI analysis)
            → Submit → Create pest record if FAIL
```

---

## Consolidated Translation Tables

### Module 10: Production Templates

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Templates Header | PLANTILLAS DE PRODUCCIÓN | PRODUCTION TEMPLATES | templates_header |
| New Template Button | + Nueva Plantilla | + New Template | templates_new_btn |
| Crop Label | Cultivo: | Crop: | templates_crop_label |
| Duration Label | Duración: | Duration: | templates_duration_label |
| Phases Label | Fases: | Phases: | templates_phases_label |
| Weeks | semanas | weeks | templates_weeks_unit |
| Edit Button | Editar | Edit | templates_edit_btn |
| Clone Button | Clonar | Clone | templates_clone_btn |
| Use Button | Usar | Use | templates_use_btn |
| Template Name Label | Nombre de la Plantilla: | Template Name: | templates_name_label |
| Crop Type Label | Tipo de Cultivo: | Crop Type: | templates_crop_type_label |
| Default Batch Size Label | Tamaño de Lote Predeterminado: | Default Batch Size: | templates_batch_size_label |
| Plants | plantas | plants | templates_plants_unit |
| Estimated Duration Label | Duración Estimada: | Estimated Duration: | templates_duration_label_2 |
| Environmental Targets | Objetivos Ambientales: | Environmental Targets: | templates_environmental_label |
| Temp Label | Temp: | Temp: | templates_temp_label |
| Humidity Label | Humedad: | Humidity: | templates_humidity_label |
| Phases Section | FASES: | PHASES: | templates_phases_section |
| Add Phase Button | + Agregar Fase | + Add Phase | templates_add_phase_btn |
| Delete Button | Eliminar | Delete | templates_delete_btn |
| Save Template Button | Guardar Plantilla | Save Template | templates_save_btn |
| Success Message | Plantilla creada exitosamente | Template created successfully | templates_create_success |
| Clone Success | Plantilla clonada exitosamente | Template cloned successfully | templates_clone_success |

### Module 11: Quality Check Templates

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| QC Header | CONTROLES DE CALIDAD | QUALITY CHECKS | qc_header |
| New QC Template Button | + Nueva Plantilla de QC | + New QC Template | qc_new_template_btn |
| Type Label | Tipo: | Type: | qc_type_label |
| Phases Label | Fases: | Phases: | qc_phases_label |
| Run Button | Ejecutar | Run | qc_run_btn |
| Duplicate Button | Duplicar | Duplicate | qc_duplicate_btn |
| Inspection Header | INSPECCIÓN DIARIA DE PLANTAS | DAILY PLANT INSPECTION | qc_inspection_header |
| Batch Label | Lote: | Batch: | qc_batch_label |
| Date Label | Fecha: | Date: | qc_date_label |
| Inspector Label | Inspector: | Inspector: | qc_inspector_label |
| Criteria Label | CRITERIOS: | CRITERIA: | qc_criteria_label |
| Status Label | Estado: | Status: | qc_status_label |
| Pass Option | Aprobar | Pass | qc_pass |
| Fail Option | Reprobar | Fail | qc_fail |
| Notes Label | Notas: | Notes: | qc_notes_label |
| Photo Label | Foto: | Photo: | qc_photo_label |
| Take Photo Button | 📷 Tomar Foto | 📷 Take Photo | qc_take_photo_btn |
| AI Check Button | 🤖 Verificar con IA | 🤖 AI Check Image | qc_ai_check_btn |
| AI Result Label | Resultado IA: | AI Result: | qc_ai_result_label |
| No Pests Detected | No se detectaron plagas | No pests detected | qc_no_pests |
| Overall Result Label | Resultado General: | Overall Result: | qc_overall_result_label |
| Save Draft Button | Guardar Borrador | Save Draft | qc_save_draft_btn |
| Submit Check Button | Enviar Control | Submit Check | qc_submit_btn |
| Success Message | Plantilla de QC creada | QC template created | qc_template_created |

### Module 12: Production Orders & Operations

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Orders Header | ÓRDENES DE PRODUCCIÓN | PRODUCTION ORDERS | orders_header |
| Active Batches Section | LOTES ACTIVOS: | ACTIVE BATCHES: | orders_active_section |
| Status Label | Estado: | Status: | orders_status_label |
| Started Label | Iniciado: | Started: | orders_started_label |
| Completed Section | COMPLETADOS: | COMPLETED: | orders_completed_section |
| New Order Button | + Nueva Orden | + New Order | orders_new_btn |
| View Button | Ver | View | orders_view_btn |
| Log Activity Button | Registrar Actividad | Log Activity | orders_log_activity_btn |
| View Archive Button | Ver Archivo | View Archive | orders_view_archive_btn |
| Success Message | Orden de producción creada exitosamente | Production order created successfully | orders_create_success |
| New Order Header | NUEVA ORDEN DE PRODUCCIÓN | NEW PRODUCTION ORDER | orders_new_header |
| Select Template Label | Seleccionar Plantilla: | Select Template: | orders_select_template_label |
| Facility Label | Instalación: | Facility: | orders_facility_label |
| Starting Area Label | Área Inicial: | Starting Area: | orders_starting_area_label |
| Cultivar Label | Cultivar: | Cultivar: | orders_cultivar_label |
| Batch Size Label | Tamaño del Lote: | Batch Size: | orders_batch_size_label |
| Recommended Text | (Recomendado: [X]) | (Recommended: [X]) | orders_recommended_text |
| Start Date Label | Fecha de Inicio: | Start Date: | orders_start_date_label |
| Create Order Button | Crear Orden | Create Order | orders_create_btn |
| Order Detail Header | ORDEN: | ORDER: | orders_detail_header |
| Est. Harvest Label | Cosecha Est.: | Est. Harvest: | orders_est_harvest_label |
| Days Remaining | Días Restantes: | Days Remaining: | orders_days_remaining_label |
| Progress Label | PROGRESO: | PROGRESS: | orders_progress_label |
| Now Label | Ahora | Now | orders_now_label |
| Today Label | Hoy: | Today: | orders_today_label |
| Due Now | vence ahora | due now | orders_due_now |
| Upcoming Activities | ACTIVIDADES PRÓXIMAS: | UPCOMING ACTIVITIES: | orders_upcoming_activities |
| Materials Used | MATERIALES USADOS: | MATERIALS USED: | orders_materials_used |
| Log Now Button | Registrar Ahora | Log Now | orders_log_now_btn |
| Skip Button | Omitir | Skip | orders_skip_btn |
| Snooze Button | Posponer | Snooze | orders_snooze_btn |
| Complete Phase Button | Completar Fase | Complete Phase | orders_complete_phase_btn |
| Harvest Button | Cosechar | Harvest | orders_harvest_btn |
| Log Activity Header | REGISTRAR ACTIVIDAD | LOG ACTIVITY | orders_log_activity_header |
| Activity Label | Actividad: | Activity: | orders_activity_label |
| Phase Label | Fase: | Phase: | orders_phase_label |
| Completed By Label | Completado Por: | Completed By: | orders_completed_by_label |
| Date Time Label | Fecha y Hora: | Date & Time: | orders_date_time_label |
| Materials Used Label | Materiales Usados: | Materials Used: | orders_materials_used_label |
| Add Material Button | + Agregar Material | + Add Material | orders_add_material_btn |
| Observations Label | Observaciones: | Observations: | orders_observations_label |
| Photos Label | Fotos (opcional): | Photos (optional): | orders_photos_label |
| Upload Button | 📷 Subir | 📷 Upload | orders_upload_btn |
| Drag Drop Text | Arrastrar y Soltar | Drag & Drop | orders_drag_drop_text |
| Log Activity Button | Registrar Actividad | Log Activity | orders_log_activity_btn |
| Activity Success | Actividad registrada exitosamente | Activity logged successfully | orders_activity_success |

### Module 13: AI Engine & Insights

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Insights Header | INFORMACIÓN INTELIGENTE | INTELLIGENT INSIGHTS | ai_insights_header |
| This Week | Esta Semana | This Week | ai_this_week |
| Key Recommendations | 🎯 RECOMENDACIONES CLAVE: | 🎯 KEY RECOMMENDATIONS: | ai_key_recommendations |
| Batch Label | LOTE-[número]: | BATCH-[number]: | ai_batch_label |
| Ready to Move | Listo para mover a Floración en [X] días | Ready to move to Flowering in [X] days | ai_ready_to_move |
| Confidence Label | Confianza: | Confidence: | ai_confidence_label |
| Low Nutrient Alert | ALERTA DE NUTRIENTE BAJO: | LOW NUTRIENT ALERT: | ai_low_nutrient |
| Will Run Out | Se agotará en [X] días al consumo actual | Will run out in [X] days at current consumption rate | ai_will_run_out |
| Yield Forecast | PRONÓSTICO DE RENDIMIENTO: | YIELD FORECAST: | ai_yield_forecast |
| On Track | en camino a [X] kg | on track for [X] kg | ai_on_track |
| View Details Button | Ver Detalles | View Details | ai_view_details_btn |
| Auto Button | Auto | Auto | ai_auto_btn |
| Reorder Button | Reordenar | Reorder | ai_reorder_btn |
| Adjust Button | Ajustar | Adjust | ai_adjust_btn |
| View All Button | Ver Todo | View All Insights | ai_view_all_btn |

### Additional Enum Translations

**Batch Status:**

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| harvested | Cosechado | Harvested |
| disposed | Desechado | Disposed |
| lost | Perdido | Lost |

**Production Order Status:**

| value | display_es | display_en |
|-------|------------|------------|
| draft | Borrador | Draft |
| approved | Aprobado | Approved |
| en_proceso | En Proceso | In Progress |
| completado | Completado | Completed |
| cancelled | Cancelado | Cancelled |

**Scheduled Activity Status:**

| value | display_es | display_en |
|-------|------------|------------|
| pending | Pendiente | Pending |
| in_progress | En Progreso | In Progress |
| completed | Completado | Completed |
| skipped | Omitido | Skipped |
| overdue | Vencido | Overdue |

**Quantity Units:**

| value | display_es | display_en |
|-------|------------|------------|
| plants | plantas | plants |
| seedlings | plántulas | seedlings |
| clones | clones | clones |
| units | unidades | units |
| kg | kg | kg |
| g | g | g |
| L | L | L |
| mL | mL | mL |

---

**Status**: UI requirements complete for Phase 2
**Next Steps**:
1. Implement API endpoints (see [PHASE-2-ENDPOINTS.md](../../api/PHASE-2-ENDPOINTS.md))
2. Build Bubble pages following these wireframes
3. Connect workflows to API endpoints
4. Test full production lifecycle
