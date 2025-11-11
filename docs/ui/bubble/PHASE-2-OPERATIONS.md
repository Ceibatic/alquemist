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

**Status**: UI requirements complete for Phase 2
**Next Steps**:
1. Implement API endpoints (see [PHASE-2-ENDPOINTS.md](../../api/PHASE-2-ENDPOINTS.md))
2. Build Bubble pages following these wireframes
3. Connect workflows to API endpoints
4. Test full production lifecycle
