# PHASE 2: OPERATIONS UI REQUIREMENTS

**Modules 9-13** | Day-to-day production workflows and batch management
**Status**: In design (ready after Phase 1 complete)
**Duration**: Continuous daily use
**Primary Users**: FACILITY_MANAGER, PRODUCTION_SUPERVISOR, WORKER

---

## Overview

Phase 2 transforms Alquemist into the operational hub for farming. Users create production templates (reusable workflows), place production orders (start growing batches), track inventory consumption, perform quality checks, and leverage AI insights. This is where the batch-first philosophy becomes visible: every operation is batch-centric (50-1000 plants per batch).

**Total Pages**: 20-25 screens
**User Flow**: Non-linear, parallel workflows (multiple batches running simultaneously)
**Entry Point**: Dashboard
**Key Workflows**: Production planning → order placement → activity logging → quality checks → harvest

---

## MODULE 9: Inventory Management

### Purpose
Track input materials (seeds, nutrients, pesticides) at facility level. Manage consumption logs, set reorder alerts, and track supplier relationships.

### Pages

**1. Inventory Dashboard**
```
┌──────────────────────────┐
│   INVENTORY OVERVIEW     │
│   at North Farm          │
├──────────────────────────┤
│ CRITICAL ITEMS:          │
│ • Nutrient A [5 left]    │
│   Reorder point: 10      │
│   [Reorder Now]          │
│                          │
│ LOW STOCK:               │
│ • Seeds: Cherry AK [25]  │
│ • Pesticide B [3 L]      │
│                          │
│ IN STOCK:                │
│ • Nutrient B [47 units]  │
│ • Nutrient C [102 units] │
│                          │
│ [Search] [Filter] [Sort] │
│                          │
│ [View Full Inventory]    │
│ [+ New Item]             │
└──────────────────────────┘
```

**2. Inventory List**
```
┌────────────────────────────┐
│   ALL INVENTORY ITEMS      │
├────────────────────────────┤
│ Filter: [All ▼] Status:    │
│ [In Stock ▼] Supplier: [ ] │
│                            │
│ Item          Qty  Reorder │
│ Nutrient A    5   ⚠ [RO]  │
│ Nutrient B    47        [ ]│
│ Nutrient C    102       [ ]│
│ Pesticide X   8    ⚠ [RO] │
│ Seeds-Cherry  25             │
│                            │
│ [+ Add Item] [Edit] [Use] │
│ [Consume] [Transfer]      │
│                            │
│ Sort: By qty | By date    │
└────────────────────────────┘
```

**3. Consume Material**
```
┌────────────────────────────┐
│   LOG CONSUMPTION          │
├────────────────────────────┤
│ Item: Nutrient A           │
│ Current Stock: 45 units    │
│                            │
│ Batch Applied To:          │
│ [Batch-2025-001] -         │
│ Cannabis, Area: Veg        │
│                            │
│ Quantity Consumed:         │
│ [__] units [UOM ▼]         │
│                            │
│ Activity:                  │
│ [Feeding - Week 3]         │
│                            │
│ Notes: [____________]      │
│                            │
│ [Log Consumption]          │
│ [Cancel]                   │
└────────────────────────────┘
```

**4. Add Supplier Product**
```
┌────────────────────────────┐
│   ADD INVENTORY ITEM       │
├────────────────────────────┤
│ Supplier: [FarmChem Inc ▼] │
│                            │
│ Product Category:          │
│ ○ Seeds/Cuttings           │
│ ○ Nutrients                │
│ ○ Pesticides               │
│ ○ Equipment                │
│ ○ Other                    │
│                            │
│ Product Name:              │
│ [_______________________] │
│                            │
│ SKU (optional): [____]     │
│ Unit of Measure: L / kg / units
│ Cost per Unit: $[__]       │
│ Quantity On Hand: [__]     │
│ Reorder Point: [__]        │
│                            │
│ [Add Item]                 │
└────────────────────────────┘
```

### Key Data Flow
- **Inputs**: Item name, quantity, UOM, supplier, reorder point, consumption logs
- **Outputs**: inventory_items record, consumption activity logged
- **Auto-Updates**: Stock quantity decreases as batches consume materials

### Database Tables
- **Write**: inventory_items, activities (consumption logs)
- **Read**: facilities, suppliers, batches
- **Related**: production_orders (which batches consuming this)

### Notes
- 🔴 **Required**: Stock levels, consumption tracking
- 🟡 **Important**: Reorder alerts when stock < reorder point
- 🟢 **Nice-to-have**: Supplier purchase order generation
- System tracks every consumption event for audit trail
- Batch consumption auto-calculates from production template recipes

---

## MODULE 10: Production Templates

### Purpose
Create reusable production workflows. Templates define phases (propagation → vegetative → flowering → harvest/drying), activities within each phase, and environment targets.

### Pages

**5. Production Templates List**
```
┌────────────────────────────┐
│  PRODUCTION TEMPLATES      │
│  at North Farm             │
├────────────────────────────┤
│ [+ New Template]           │
│                            │
│ TEMPLATE NAME  CROP    DUR │
│ Cannabis Gen   Cannabis 20w│
│ -Phase 1: Prop [Edit]   [ ]│
│ -Phase 2: Veg  [Duplicate]│
│ -Phase 3: Flower
│ -Phase 4: Dry  [Delete]
│                            │
│ Coffee Cycle   Coffee  52w │
│ -Phase 1: [Edit] [Clone]  │
│ -Phase 2:                  │
│ -Phase 3:                  │
│                            │
│ Cocoa Process  Cocoa   12w │
│ [Use for New Order]        │
│                            │
│ Search: [______] Status:   │
│ [All ▼]                    │
└────────────────────────────┘
```

**6. Create/Edit Template**
```
┌────────────────────────────┐
│  NEW PRODUCTION TEMPLATE   │
├────────────────────────────┤
│ Template Name:             │
│ [Cannabis Full Cycle]      │
│                            │
│ Crop Type: [Cannabis ▼]    │
│                            │
│ Default Batch Size:        │
│ [200] plants per batch     │
│                            │
│ Total Duration:            │
│ [20] weeks estimated       │
│                            │
│ Environmental Targets:     │
│ Temp: [20] - [25] °C       │
│ Humidity: [60] - [70] %    │
│ Light: [18]h / [6]h dark   │
│                            │
│ [+ Add Phase] [Save]       │
│                            │
│ PHASES:                    │
│ Phase 1: Propagation (1w)  │
│ [Edit] [Delete] [↑↓Move]   │
│                            │
│ Phase 2: Vegetative (4w)   │
│ Phase 3: Flowering (8w)    │
│ Phase 4: Drying (7w)       │
└────────────────────────────┘
```

**7. Edit Phase with Activities**
```
┌────────────────────────────┐
│  EDIT PHASE: VEGETATIVE    │
│  (Week 2-5, Cannabis)      │
├────────────────────────────┤
│ Phase Name: [Vegetative]   │
│ Duration: [4] weeks        │
│                            │
│ Area Type:                 │
│ [Vegetative Room ▼]        │
│                            │
│ Target Environment:        │
│ Temp: [21-24]°C            │
│ Humidity: [65-75]%         │
│ Light: [18h] on / [6h] off │
│                            │
│ ACTIVITIES (tasks):        │
│ [+ Add Activity]           │
│                            │
│ ☑ Watering (3x per week)   │
│   - Frequency: Every 2.5d  │
│   - Amount: 2L per plant   │
│   [Edit] [Delete]          │
│                            │
│ ☑ Feeding (2x per week)    │
│   - Nutrient Mix: Recipe 2 │
│   - Frequency: Every 3.5d  │
│   [Edit] [Delete]          │
│                            │
│ ☑ Pruning (1x per week)    │
│   - Method: Remove leaves  │
│   [Edit] [Delete]          │
│                            │
│ [Save Phase]               │
└────────────────────────────┘
```

**8. Add Activity to Phase**
```
┌────────────────────────────┐
│  ADD ACTIVITY              │
│  (to Vegetative Phase)     │
├────────────────────────────┤
│ Activity Type:             │
│ ○ Watering                 │
│ ○ Feeding                  │
│ ○ Pruning                  │
│ ○ Inspection               │
│ ○ Treatment                │
│ ○ Other [specify]          │
│                            │
│ Frequency: [Every 3 days]  │
│                            │
│ Assigned To:               │
│ [Production Supervisor ▼]  │
│                            │
│ Input Material (if needed):│
│ [Recipe 1: Veg Nutrients▼] │
│                            │
│ Notes:                     │
│ [Adjust pH to 6.0-6.5]     │
│                            │
│ [Add Activity] [Cancel]    │
└────────────────────────────┘
```

### Key Data Flow
- **Inputs**: Template name, crop, phases, activities, environmental targets
- **Outputs**: production_templates, template_phases, template_activities created
- **Used By**: Module 12 (Production Orders use templates to create orders)

### Database Tables
- **Write**: production_templates, template_phases, template_activities
- **Read**: crop_types, areas
- **Related**: recipes (if using nutrient formulas), quality_check_templates

### Notes
- 🔴 **Required**: Template name, at least 2 phases, at least 1 activity per phase
- 🟡 **Important**: Environmental targets guide automated alerts in daily operations
- 🟢 **Nice-to-have**: Clone existing template to save time
- Templates are reusable; same template can create multiple orders
- Activities auto-schedule when order starts (Module 12)

---

## MODULE 11: Quality Check Templates + AI

### Purpose
Define quality control procedures. Checks can be manual (visual), measurement-based (pH, weight), or lab-based. Optional AI pest detection for images.

### Pages

**9. Quality Check Templates List**
```
┌────────────────────────────┐
│  QUALITY CHECKS            │
│  at North Farm             │
├────────────────────────────┤
│ [+ New QC Template]        │
│                            │
│ QC TEMPLATE      PHASE    │
│ Daily Visual    Veg/Flower │
│ Inspect leaves [Edit] [  ]│
│                  [Duplicate]
│                  [Delete]
│                            │
│ Weekly pH Test  All        │
│ Measure pH [Run on Batch]  │
│                            │
│ Pest Detection   Veg/Flower│
│ (AI-Assisted)  [Uses Photos│
│                [Edit]      │
│                            │
│ Harvest QC      Flower    │
│ [Create from template]     │
│                            │
│ Search: [____] Filter:     │
│ [All Phases ▼]             │
└────────────────────────────┘
```

**10. Create QC Template**
```
┌────────────────────────────┐
│  NEW QC TEMPLATE           │
├────────────────────────────┤
│ QC Name:                   │
│ [Daily Plant Inspection]   │
│                            │
│ Applies To Phases:         │
│ ☑ Vegetative              │
│ ☑ Flowering               │
│ ☐ Drying                  │
│                            │
│ Type of Check:             │
│ ☑ Visual Inspection        │
│ ☐ Measurement              │
│ ☐ Laboratory Test          │
│ ☐ AI-Assisted (Photo)      │
│                            │
│ Frequency:                 │
│ [Daily] [Every 3 days]     │
│ [Weekly] [As Needed]       │
│                            │
│ Pass/Fail Criteria:        │
│ [Leaves green, no spots]   │
│ [Healthy growth rate]      │
│                            │
│ [+ Add Criteria]           │
│                            │
│ [Create Template]          │
└────────────────────────────┘
```

**11. Run Quality Check**
```
┌────────────────────────────┐
│  DAILY PLANT INSPECTION    │
│  Batch: Batch-2025-001     │
├────────────────────────────┤
│ Date: 2025-10-27           │
│ Inspector: [John Doe ▼]    │
│                            │
│ CRITERIA 1: Leaf Color     │
│ Status: ○ Pass ○ Fail      │
│ Notes: [Green, healthy]    │
│ Photo: [📷 Take Photo] [ ] │
│                            │
│ CRITERIA 2: Pest/Disease   │
│ Status: ○ Pass ○ Fail      │
│ Notes: [No visible signs]  │
│ Photo: [📷 Take Photo]     │
│ [↔ AI Check Image]         │
│ AI Result: No pests        │
│                            │
│ CRITERIA 3: Growth Rate    │
│ Status: ○ Pass ○ Fail      │
│ Notes: [Normal for stage]  │
│                            │
│ Overall Result:            │
│ ☑ PASS ☐ FAIL             │
│ [Alert if Fail]            │
│                            │
│ [Submit Check] [Save Draft]│
└────────────────────────────┘
```

**12. AI Pest Detection Detail** (if uploaded photo)
```
┌────────────────────────────┐
│  AI PEST ANALYSIS          │
│  Photo: 2025-10-27_001.jpg │
├────────────────────────────┤
│ Confidence: 92%            │
│                            │
│ Detected:                  │
│ • Mites (light)            │
│ • Powdery mildew (trace)   │
│                            │
│ Recommended Actions:       │
│ 1. Increase ventilation    │
│ 2. Spray fungicide (record)│
│ 3. Recheck in 2-3 days     │
│                            │
│ [Create Activity to treat] │
│ [Mark for manual review]   │
│ [Dismiss]                  │
│                            │
│ Photo Analysis: [✓ Done]   │
└────────────────────────────┘
```

### Key Data Flow
- **Inputs**: QC check result (pass/fail), notes, optional photos
- **Outputs**: pest_disease_records, activities (auto-create if pest detected)
- **AI Feature**: Photo analysis returns pest list + confidence scores

### Database Tables
- **Write**: quality_check_templates, pest_disease_records, activities
- **Read**: batches, pest_diseases (reference library)
- **Related**: production_orders (links QC to batch)

### Notes
- 🔴 **Required**: At least one QC template per facility
- 🟡 **Important**: Photo-based QC + manual QC both supported
- 🟢 **Nice-to-have**: AI pest detection (requires GCP Vision API)
- Failed checks create alerts and auto-suggest activities (e.g., "spray fungicide")
- QC history viewable per batch for compliance

---

## MODULE 12: Production Orders & Operations

### Purpose
Create production orders from templates. Orders represent actual batches being grown. Track phases, schedule activities, log daily operations, monitor progress from planting to harvest.

### Pages

**13. Production Orders Dashboard**
```
┌──────────────────────────┐
│   PRODUCTION ORDERS      │
│   North Farm             │
├──────────────────────────┤
│ [+ New Order]            │
│                          │
│ ACTIVE BATCHES:          │
│ Batch-2025-001           │
│ Cannabis, 200 plants     │
│ Started: 2025-09-15      │
│ Status: Vegetative (W3/4)│
│ [View] [Log Activity]    │
│                          │
│ Batch-2025-002           │
│ Cannabis, 150 plants     │
│ Started: 2025-10-01      │
│ Status: Propagation (W1) │
│ [View] [Log Activity]    │
│                          │
│ COMPLETED:               │
│ Batch-2025-001 (old)     │
│ Harvested: 35 kg         │
│ [Expand] [Report]        │
│                          │
│ Filter: [All ▼] Sort:    │
│ [By Date ▼]              │
└──────────────────────────┘
```

**14. Create Production Order**
```
┌──────────────────────────┐
│  NEW PRODUCTION ORDER    │
├──────────────────────────┤
│ Select Template:         │
│ [Cannabis Full Cycle ▼]  │
│                          │
│ Facility:                │
│ [North Farm ▼]           │
│                          │
│ Starting Area:           │
│ [Propagation Room ▼]     │
│                          │
│ Cultivar:                │
│ [Cherry AK ▼]            │
│                          │
│ Batch Size:              │
│ [200] plants             │
│ (Recommended: 200)       │
│                          │
│ Start Date:              │
│ [2025-10-27]             │
│                          │
│ Notes:                   │
│ [Premium batch] [...]    │
│                          │
│ [Create Order]           │
└──────────────────────────┘
```

**15. Order Detail / Track Progress**
```
┌────────────────────────────┐
│  ORDER: Batch-2025-001     │
│  Cannabis, 200 plants      │
├────────────────────────────┤
│ Status: Vegetative (W3/4)  │
│ Started: 2025-09-15        │
│ Estimated Harvest:         │
│ 2025-10-20                 │
│ Days Remaining: 23         │
│                            │
│ PROGRESS:                  │
│ [COMPLETE] Propagation (1w)│
│ [≡≡≡≡≡≡] Vegetative (4w)   │ ← Active
│ [        ] Flowering (8w)   │
│ [        ] Drying (7w)      │
│                            │
│ UPCOMING ACTIVITIES:       │
│ Today: Watering (due)      │
│ [Log Now] [Skip] [Snooze] │
│                            │
│ Thu: Feeding               │
│ Sat: Inspection            │
│                            │
│ [Reschedule] [Edit Order] │
│ [Complete Phase] [Harvest]│
│                            │
│ MATERIALS USED:            │
│ • Nutrient A: 40 units     │
│ • Water: 800L              │
│ [View Consumption Log]     │
└────────────────────────────┘
```

**16. Log Activity**
```
┌────────────────────────────┐
│  LOG ACTIVITY              │
│  Batch: Batch-2025-001     │
├────────────────────────────┤
│ Activity: Watering         │
│ Phase: Vegetative (W3)     │
│                            │
│ Completed By:              │
│ [John Doe ▼]               │
│                            │
│ Date & Time:               │
│ 2025-10-27 09:30           │
│                            │
│ Materials Used:            │
│ Nutrient A: [5] units      │
│ Water: [100] L             │
│ [+ Add Material]           │
│                            │
│ Observations:              │
│ [Plant color good, growth] │
│ [progressing normally]     │
│                            │
│ Photos (optional):         │
│ [📷 Upload] [Drag & Drop]  │
│                            │
│ [Log Activity]             │
└────────────────────────────┘
```

### Key Data Flow
- **Inputs**: Template selection, batch size, start date, daily activities
- **Outputs**: production_orders, scheduled_activities, activities (log entries)
- **Auto-Actions**: Activities scheduled based on template, materials tracked

### Database Tables
- **Write**: production_orders, batches, scheduled_activities, activities
- **Read**: production_templates, template_phases, template_activities, facilities, areas
- **Related**: inventory_items (consumption), quality_check_templates (QC runs)

### Notes
- 🔴 **Required**: Template selection, batch size, start date
- 🟡 **Important**: Activity logging + phase progression tracking
- 🟢 **Nice-to-have**: Automated activity reminders, photo uploads
- Batch size determines estimated material consumption
- Activities auto-generate from template but can be manually logged/adjusted
- Batch-first approach: one order = one batch (50-1000 plants together)

---

## MODULE 13: AI Engine & Intelligent Services

### Purpose
Leverages data from Modules 9-12 (inventory, templates, quality checks, activities) to provide insights and recommendations: optimal nutrient ratios, pest risk alerts, harvest timing, yield predictions.

### Pages

**17. AI Dashboard / Insights**
```
┌────────────────────────────┐
│  INTELLIGENT INSIGHTS      │
│  North Farm - Week of 10/27│
├────────────────────────────┤
│ 🎯 KEY RECOMMENDATIONS:    │
│                            │
│ 1. BATCH-2025-001:         │
│    "Ready to move to       │
│     Flowering in 3-4 days" │
│    Confidence: 95%         │
│    [View Details]          │
│                            │
│ 2. LOW NUTRIENT ALERT:     │
│    "Nutrient A stock at    │
│     8 units. Will deplete  │
│     in 5 days if current   │
│     rate continues"        │
│    [Reorder] [Adjust]      │
│                            │
│ 3. YIELD FORECAST:         │
│    "Batch-2025-001 on      │
│     track for 35-38 kg     │
│     (based on growth rate)"│
│    [View Details]          │
│                            │
│ 4. PEST RISK:              │
│    "Humidity trending high │
│     (72%). Powdery mildew  │
│     risk +15%"             │
│    [Recommendations]       │
│                            │
│ [View All Insights]        │
└────────────────────────────┘
```

**18. Detailed Insight**
```
┌────────────────────────────┐
│  PHASE PROGRESSION READY    │
│  Batch-2025-001            │
├────────────────────────────┤
│ Current Phase:             │
│ Vegetative (Week 3 of 4)   │
│                            │
│ Recommendation:            │
│ "Plant growth metrics      │
│  indicate readiness to     │
│  transition to flowering"  │
│                            │
│ Supporting Data:           │
│ • Height reached target    │
│ • Node development normal  │
│ • Health score: 9.2/10     │
│ • Growth trajectory: ↑     │
│                            │
│ Suggested Next Steps:      │
│ 1. Run final veg QC check  │
│ 2. Adjust lighting to 12/12│
│ 3. Move to Flower Room     │
│ 4. Update template timing  │
│                            │
│ [Auto-Schedule] [Manual]   │
│ [Dismiss] [Mark Done]      │
└────────────────────────────┘
```

### Key Data Flow
- **Inputs**: Activity logs, quality check results, inventory consumption, template timings
- **Outputs**: Recommendations, alerts, forecasts
- **AI Processing**: Analyzes patterns from historical + current data

### Database Tables
- **Read**: production_orders, batches, activities, quality_check_templates, pest_disease_records, inventory_items, scheduled_activities
- **Write**: (future: insights, predictions records)

### Notes
- 🔴 **Required**: AI engine must provide at least 3 types of insights (phase readiness, nutrient alerts, pest risk)
- 🟡 **Important**: Recommendations should be actionable (with suggested next steps)
- 🟢 **Nice-to-have**: Yield prediction models, historical comparison
- AI recommendations can be auto-accepted (creates activities/alerts) or dismissed
- Machine learning improves over time (more data = better predictions)

---

## PHASE 2 SUMMARY

### Total Pages: ~22 screens
```
Module 9 (Inventory):       4 pages
Module 10 (Templates):      4 pages
Module 11 (QC Templates):   4 pages
Module 12 (Orders):         4 pages
Module 13 (AI Insights):    2 pages
────────────────────────
Total: ~22 pages
```

### Key Workflows

**Production Order Lifecycle**
```
[New Order] → [Select Template]
    ↓
[Propagation Phase]
    ↓ (run QC checks, log activities)
    ↓ (consume materials)
    ↓ (AI suggests "ready to progress")
[Vegetative Phase] (same pattern)
    ↓
[Flowering Phase] (same pattern)
    ↓
[Harvest & Drying] (same pattern)
    ↓
[Complete Order] → [Log Harvest Weight]
```

**Daily Operations**
```
Morning:
  → Check dashboard (AI insights, alerts)
  → Log activities for active batches
  → Review QC checks due today

Whenever:
  → Log consumption (inventory usage)
  → Run quality checks (manual or AI)
  → View batch progress

As Needed:
  → Adjust batch schedule
  → Create new orders
  → Update templates based on results
```

### Database State During Phase 2
- ✅ Production templates defined (reusable)
- ✅ Multiple active batches running in parallel
- ✅ Daily activity logs for audit trail
- ✅ Inventory consumed and tracked per batch
- ✅ Quality checks performed and recorded
- ✅ AI providing recommendations based on live data

### Role Access
- 🔴 FACILITY_MANAGER: Full Phase 2 access (create orders, templates, manage inventory)
- 🔴 PRODUCTION_SUPERVISOR: Log activities, run QC checks, view orders (no template creation)
- 🟡 WORKER: Simple task list (log activities assigned to them)
- 🟡 COMPANY_OWNER: View-only dashboard (no daily operations)

---

**Status**: Design phase complete, ready for development after Phase 1 implementation
**Next**: Move to [PHASE-3-ADVANCED.md](PHASE-3-ADVANCED.md) for analytics and compliance
