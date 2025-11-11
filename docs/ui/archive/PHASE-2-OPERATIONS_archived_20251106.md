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
- **Write**:
  - `inventory_items` → Create/update inventory records per area
  - `activities` → Log consumption events with materials_consumed array
- **Read**:
  - `facilities` → Get facility context
  - `suppliers` → Link inventory to supplier
  - `batches` → Track which batch consumed materials
  - `products` → Get product catalog (SKU, category, pricing)

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/inventory/get-by-facility
Body: { "facilityId": "f78ghi..." }
Response: {
  "items": [
    {
      "id": "inv123",
      "productId": "prod456",
      "productName": "Nutrient A",
      "quantityAvailable": 45,
      "quantityReserved": 10,
      "quantityUnit": "units",
      "reorderPoint": 20,
      "needsReorder": false,
      "supplierId": "s55mno...",
      "supplierName": "FarmChem Inc"
    },
    ...
  ]
}
```

```
POST https://[your-deployment].convex.site/inventory/add-item
Body: {
  "productId": "prod456",
  "areaId": "a99jkl...",
  "supplierId": "s55mno...",
  "quantityAvailable": 100,
  "quantityUnit": "units",
  "reorderPoint": 20,
  "purchasePrice": 25000,
  "batchNumber": "LOT-2025-001",
  "expirationDate": 1735689600000
}
Response: {
  "success": true,
  "inventoryItemId": "inv789...",
  "message": "Item agregado al inventario"
}
```

```
POST https://[your-deployment].convex.site/inventory/log-consumption
Body: {
  "inventoryItemId": "inv123",
  "batchId": "batch001",
  "quantityConsumed": 5,
  "activityType": "feeding",
  "performedBy": "user456",
  "notes": "Week 3 feeding schedule"
}
Response: {
  "success": true,
  "activityId": "act999...",
  "remainingQuantity": 40,
  "needsReorder": true
}
```

```
POST https://[your-deployment].convex.site/inventory/transfer
Body: {
  "inventoryItemId": "inv123",
  "fromAreaId": "a99jkl...",
  "toAreaId": "a88ijk...",
  "quantity": 10
}
Response: {
  "success": true,
  "message": "Transferencia completada"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `inventory.getByFacility` (query)
- `inventory.getByArea` (query)
- `inventory.addItem` (mutation)
- `inventory.updateStock` (mutation)
- `inventory.logConsumption` (mutation)
- `inventory.transfer` (mutation)
- `inventory.getLowStock` (query) - for alerts

### Notes
- 🔴 **Required**: Stock levels, consumption tracking
- 🟡 **Important**: Reorder alerts when quantity_available < reorder_point
- 🟢 **Nice-to-have**: Supplier purchase order generation
- System tracks every consumption event in `activities` table for audit trail
- Batch consumption auto-calculates from production template recipes
- Track lot numbers and expiration dates for compliance

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
- **Write**:
  - `production_templates` → Create reusable production workflow
  - `template_phases` → Define phases within template (propagation, veg, flower, drying)
  - `template_activities` → Define activities within each phase (watering, feeding, pruning)
- **Read**:
  - `crop_types` → Get crop for template
  - `cultivars` → Optional: specific cultivar
  - `areas` → Validate area_type requirements
  - `recipes` → Link nutrient recipes to feeding activities

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/templates/get-by-company
Body: { "companyId": "k12def..." }
Response: {
  "templates": [
    {
      "id": "tmpl123",
      "name": "Cannabis Full Cycle",
      "cropTypeId": "crop123",
      "defaultBatchSize": 200,
      "estimatedDurationDays": 140,
      "phaseCount": 4,
      "status": "active"
    },
    ...
  ]
}
```

```
POST https://[your-deployment].convex.site/templates/create
Body: {
  "companyId": "k12def...",
  "name": "Cannabis Full Cycle",
  "cropTypeId": "crop123",
  "cultivarId": "cult789",
  "defaultBatchSize": 200,
  "enableIndividualTracking": false,
  "description": "Standard cannabis seed-to-harvest workflow",
  "estimatedDurationDays": 140,
  "environmentalRequirements": {
    "tempMin": 20,
    "tempMax": 25,
    "humidityMin": 60,
    "humidityMax": 70
  }
}
Response: {
  "success": true,
  "templateId": "tmpl456...",
  "message": "Plantilla creada exitosamente"
}
```

```
POST https://[your-deployment].convex.site/templates/add-phase
Body: {
  "templateId": "tmpl456",
  "phaseName": "Vegetative",
  "phaseOrder": 2,
  "estimatedDurationDays": 28,
  "areaType": "vegetative",
  "requiredConditions": {
    "temp": "21-24",
    "humidity": "65-75",
    "lightCycle": "18/6"
  }
}
Response: {
  "success": true,
  "phaseId": "phase789...",
  "message": "Fase agregada"
}
```

```
POST https://[your-deployment].convex.site/templates/add-activity
Body: {
  "phaseId": "phase789",
  "activityName": "Watering",
  "activityOrder": 1,
  "activityType": "watering",
  "isRecurring": true,
  "timingConfiguration": {
    "frequency": "every_2_days",
    "startDay": 1
  },
  "requiredMaterials": [
    { "productId": "prod123", "quantityPerPlant": 2, "unit": "L" }
  ],
  "instructions": "Water until runoff, check pH 6.0-6.5"
}
Response: {
  "success": true,
  "activityId": "tact999...",
  "message": "Actividad agregada a la fase"
}
```

```
POST https://[your-deployment].convex.site/templates/clone
Body: {
  "templateId": "tmpl456",
  "newName": "Cannabis Full Cycle - Modified"
}
Response: {
  "success": true,
  "newTemplateId": "tmpl777...",
  "message": "Plantilla clonada exitosamente"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `templates.getByCompany` (query)
- `templates.getById` (query)
- `templates.create` (mutation)
- `templates.update` (mutation)
- `templates.clone` (mutation)
- `templates.addPhase` (mutation)
- `templates.updatePhase` (mutation)
- `templates.deletePhase` (mutation)
- `templates.addActivity` (mutation)
- `templates.updateActivity` (mutation)
- `templates.deleteActivity` (mutation)

### Notes
- 🔴 **Required**: Template name, crop type, at least 2 phases, at least 1 activity per phase
- 🟡 **Important**: Environmental targets guide automated alerts in daily operations
- 🟢 **Nice-to-have**: Clone existing template to save time
- Templates are reusable; same template can create multiple orders
- Activities auto-schedule when order starts (Module 12)
- Phase order determines workflow sequence (propagation → veg → flower → drying)

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
- **Write**:
  - `quality_check_templates` → Define reusable QC procedures
  - `pest_disease_records` → Log pest/disease detections
  - `activities` → Record QC execution (with quality_check_data object)
  - `media_files` → Store QC photos for AI analysis
- **Read**:
  - `batches` → Link QC to specific batch
  - `pest_diseases` → Reference library of known pests/diseases
  - `crop_types` → Filter applicable checks by crop

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/quality-checks/get-templates
Body: { "companyId": "k12def..." }
Response: {
  "templates": [
    {
      "id": "qc123",
      "name": "Daily Plant Inspection",
      "procedureType": "visual",
      "cropTypeId": "crop123",
      "applicableStages": ["vegetative", "flowering"],
      "frequencyRecommendation": "daily",
      "aiAssisted": false
    },
    ...
  ]
}
```

```
POST https://[your-deployment].convex.site/quality-checks/create-template
Body: {
  "companyId": "k12def...",
  "name": "Daily Plant Inspection",
  "cropTypeId": "crop123",
  "procedureType": "visual",
  "inspectionLevel": "batch",
  "regulatoryRequirement": false,
  "templateStructure": {
    "criteria": [
      { "name": "Leaf Color", "type": "pass_fail", "description": "Check for green, healthy leaves" },
      { "name": "Pest/Disease", "type": "pass_fail", "description": "Look for visible signs" }
    ]
  },
  "aiAssisted": true,
  "aiAnalysisTypes": ["pest_detection", "disease_detection"],
  "applicableStages": ["vegetative", "flowering"]
}
Response: {
  "success": true,
  "templateId": "qc456...",
  "message": "Plantilla de QC creada"
}
```

```
POST https://[your-deployment].convex.site/quality-checks/run-check
Body: {
  "templateId": "qc456",
  "batchId": "batch001",
  "performedBy": "user123",
  "results": [
    { "criteriaName": "Leaf Color", "status": "pass", "notes": "Green, healthy" },
    { "criteriaName": "Pest/Disease", "status": "fail", "notes": "Mites detected" }
  ],
  "overallResult": "fail",
  "photos": ["photo_url_1", "photo_url_2"]
}
Response: {
  "success": true,
  "activityId": "act888...",
  "pestDetected": true,
  "pestRecordId": "pest777...",
  "suggestedActions": [
    "Increase ventilation",
    "Apply miticide",
    "Recheck in 3 days"
  ]
}
```

```
POST https://[your-deployment].convex.site/quality-checks/ai-analyze-photo
Body: {
  "photoUrl": "https://storage.../qc_photo.jpg",
  "batchId": "batch001",
  "cropTypeId": "crop123"
}
Response: {
  "success": true,
  "aiAnalysis": {
    "confidence": 92,
    "detected": [
      { "type": "mites", "severity": "light", "confidence": 88 },
      { "type": "powdery_mildew", "severity": "trace", "confidence": 75 }
    ],
    "recommendations": [
      "Increase ventilation",
      "Spray fungicide",
      "Recheck in 2-3 days"
    ]
  }
}
```

```
GET https://[your-deployment].convex.site/quality-checks/get-history
Body: { "batchId": "batch001" }
Response: {
  "checks": [
    {
      "id": "act888",
      "templateName": "Daily Plant Inspection",
      "date": 1730073600000,
      "performedBy": "John Doe",
      "result": "fail",
      "pestDetected": true,
      "photos": ["url1", "url2"]
    },
    ...
  ]
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `qualityChecks.getTemplates` (query)
- `qualityChecks.getById` (query)
- `qualityChecks.createTemplate` (mutation)
- `qualityChecks.updateTemplate` (mutation)
- `qualityChecks.runCheck` (mutation)
- `qualityChecks.aiAnalyzePhoto` (mutation) - integrates with GCP Vision API
- `qualityChecks.getHistory` (query)
- `pests.getLibrary` (query) - reference library
- `pests.recordDetection` (mutation)

### Notes
- 🔴 **Required**: At least one QC template per facility
- 🟡 **Important**: Photo-based QC + manual QC both supported
- 🟢 **Nice-to-have**: AI pest detection (requires GCP Vision API integration)
- Failed checks create alerts and auto-suggest activities (e.g., "spray fungicide")
- QC history viewable per batch for compliance
- AI analysis stored in `activities.ai_assistance_data` field

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
- **Write**:
  - `production_orders` → Create production order from template
  - `batches` → Create batch linked to order
  - `scheduled_activities` → Auto-generate activities from template
  - `activities` → Log actual activities performed (watering, feeding, pruning, etc.)
- **Read**:
  - `production_templates` → Get template structure
  - `template_phases` → Get phases to execute
  - `template_activities` → Get activities to schedule
  - `facilities` → Validate facility capacity
  - `areas` → Check area availability
  - `cultivars` → Link cultivar to batch
  - `inventory_items` → Track material consumption

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/orders/get-active
Body: { "facilityId": "f78ghi..." }
Response: {
  "orders": [
    {
      "id": "order123",
      "orderNumber": "PO-2025-001",
      "batchId": "batch001",
      "batchQrCode": "QR-BATCH-001",
      "templateName": "Cannabis Full Cycle",
      "cropType": "Cannabis",
      "cultivar": "Cherry AK",
      "currentQuantity": 200,
      "plannedQuantity": 200,
      "currentPhase": "vegetative",
      "phaseProgress": "Week 3 of 4",
      "startDate": 1725148800000,
      "estimatedCompletionDate": 1735689600000,
      "status": "en_proceso",
      "upcomingActivities": [
        { "activityType": "watering", "scheduledDate": 1730073600000, "status": "pending" }
      ]
    },
    ...
  ]
}
```

```
POST https://[your-deployment].convex.site/orders/create
Body: {
  "templateId": "tmpl456",
  "facilityId": "f78ghi...",
  "areaId": "a99jkl...",
  "cultivarId": "cult789",
  "batchSize": 200,
  "startDate": 1730073600000,
  "requestedBy": "user123",
  "notes": "Premium batch for Q1 2025"
}
Response: {
  "success": true,
  "orderId": "order456...",
  "orderNumber": "PO-2025-002",
  "batchId": "batch002",
  "batchQrCode": "QR-BATCH-002",
  "scheduledActivities": 45,
  "estimatedCompletionDate": 1742140800000,
  "message": "Orden de producción creada exitosamente"
}
```

```
GET https://[your-deployment].convex.site/orders/get-detail
Body: { "orderId": "order456" }
Response: {
  "order": {
    "id": "order456",
    "orderNumber": "PO-2025-002",
    "batch": {
      "id": "batch002",
      "qrCode": "QR-BATCH-002",
      "currentQuantity": 200,
      "plannedQuantity": 200,
      "currentArea": "Propagation Room"
    },
    "template": { "name": "Cannabis Full Cycle", "phases": [...] },
    "currentPhase": {
      "name": "Propagation",
      "order": 1,
      "daysElapsed": 5,
      "daysRemaining": 2,
      "progress": 71
    },
    "upcomingActivities": [...],
    "materialsUsed": [
      { "product": "Nutrient A", "quantity": 40, "unit": "units" },
      { "product": "Water", "quantity": 800, "unit": "L" }
    ],
    "qcHistory": [...],
    "status": "en_proceso"
  }
}
```

```
POST https://[your-deployment].convex.site/orders/log-activity
Body: {
  "orderId": "order456",
  "batchId": "batch002",
  "activityType": "watering",
  "performedBy": "user123",
  "timestamp": 1730073600000,
  "durationMinutes": 30,
  "materialsConsumed": [
    { "inventoryItemId": "inv123", "quantity": 5, "unit": "units" }
  ],
  "observations": "Plant color good, growth progressing normally",
  "photos": ["photo_url_1", "photo_url_2"],
  "qrScanned": "QR-BATCH-002"
}
Response: {
  "success": true,
  "activityId": "act777...",
  "inventoryUpdated": true,
  "nextActivity": {
    "type": "feeding",
    "scheduledDate": 1730246400000
  },
  "message": "Actividad registrada exitosamente"
}
```

```
POST https://[your-deployment].convex.site/orders/complete-phase
Body: {
  "orderId": "order456",
  "currentPhaseId": "phase789",
  "nextAreaId": "a88ijk...",
  "notes": "Ready to move to vegetative"
}
Response: {
  "success": true,
  "newPhase": "vegetative",
  "batchMoved": true,
  "newArea": "Vegetative Room",
  "activitiesScheduled": 12,
  "message": "Fase completada, lote movido a Vegetativo"
}
```

```
POST https://[your-deployment].convex.site/orders/harvest
Body: {
  "orderId": "order456",
  "batchId": "batch002",
  "harvestDate": 1735689600000,
  "harvestedQuantity": 35,
  "quantityUnit": "kg",
  "qualityGrade": "A",
  "notes": "Excellent yield, premium quality",
  "performedBy": "user123"
}
Response: {
  "success": true,
  "orderStatus": "completado",
  "batchStatus": "harvested",
  "yieldVsTarget": 117,
  "message": "Cosecha registrada exitosamente"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `orders.getActive` (query)
- `orders.getCompleted` (query)
- `orders.getDetail` (query)
- `orders.create` (mutation)
- `orders.update` (mutation)
- `orders.cancel` (mutation)
- `orders.logActivity` (mutation)
- `orders.completePhase` (mutation)
- `orders.harvest` (mutation)
- `scheduledActivities.getUpcoming` (query)
- `scheduledActivities.getByBatch` (query)
- `scheduledActivities.markComplete` (mutation)
- `batches.getById` (query)
- `batches.updateQuantity` (mutation)
- `batches.moveToArea` (mutation)

### Notes
- 🔴 **Required**: Template selection, batch size, start date
- 🟡 **Important**: Activity logging + phase progression tracking
- 🟢 **Nice-to-have**: Automated activity reminders, photo uploads
- Batch size determines estimated material consumption
- Activities auto-generate from template but can be manually logged/adjusted
- Batch-first approach: one order = one batch (50-1000 plants together)
- QR code generation for batch tracking (print labels for field use)
- Phase completion triggers area transfer and next phase activities

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
- **Read**:
  - `production_orders` → Get current orders and progress
  - `batches` → Analyze batch performance
  - `activities` → Track activity patterns and timing
  - `quality_check_templates` → Check QC results
  - `pest_disease_records` → Detect pest trends
  - `inventory_items` → Predict stockouts
  - `scheduled_activities` → Compare planned vs actual
  - `template_phases` → Track phase durations
- **Write**:
  - (future: `insights` table for storing AI recommendations)
  - (future: `predictions` table for yield forecasts)

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/ai/get-insights
Body: {
  "facilityId": "f78ghi...",
  "timeframe": "week"
}
Response: {
  "insights": [
    {
      "id": "insight123",
      "type": "phase_progression",
      "priority": "high",
      "confidence": 95,
      "batchId": "batch001",
      "batchName": "Batch-2025-001",
      "title": "Ready to move to Flowering",
      "description": "Plant growth metrics indicate readiness to transition to flowering in 3-4 days",
      "supportingData": {
        "heightTarget": "achieved",
        "nodeDevelopment": "normal",
        "healthScore": 9.2
      },
      "suggestedActions": [
        "Run final veg QC check",
        "Adjust lighting to 12/12",
        "Move to Flower Room",
        "Update template timing"
      ],
      "createdAt": 1730073600000
    },
    {
      "id": "insight124",
      "type": "inventory_alert",
      "priority": "medium",
      "confidence": 100,
      "title": "Low Nutrient Alert",
      "description": "Nutrient A stock at 8 units. Will deplete in 5 days at current consumption rate",
      "suggestedActions": [
        "Reorder from supplier",
        "Adjust feeding schedule",
        "Check alternative suppliers"
      ]
    },
    {
      "id": "insight125",
      "type": "yield_forecast",
      "priority": "low",
      "confidence": 87,
      "batchId": "batch001",
      "title": "Yield Forecast",
      "description": "Batch-2025-001 on track for 35-38 kg (117% of target)",
      "forecast": {
        "estimated": 36.5,
        "min": 35,
        "max": 38,
        "unit": "kg",
        "targetYield": 30
      }
    },
    {
      "id": "insight126",
      "type": "pest_risk",
      "priority": "high",
      "confidence": 82,
      "title": "Pest Risk Alert",
      "description": "Humidity trending high (72%). Powdery mildew risk increased by 15%",
      "environmentalData": {
        "humidity": 72,
        "target": "60-70",
        "trend": "increasing"
      },
      "suggestedActions": [
        "Increase ventilation",
        "Reduce watering frequency",
        "Apply preventive fungicide"
      ]
    }
  ]
}
```

```
POST https://[your-deployment].convex.site/ai/analyze-batch
Body: {
  "batchId": "batch001"
}
Response: {
  "analysis": {
    "overallHealth": 9.2,
    "growthRate": "normal",
    "phaseReadiness": {
      "ready": true,
      "confidence": 95,
      "daysUntilReady": 3
    },
    "predictedYield": {
      "amount": 36.5,
      "unit": "kg",
      "confidence": 87
    },
    "riskFactors": [
      { "type": "humidity", "level": "medium", "score": 72 }
    ],
    "recommendations": [...]
  }
}
```

```
POST https://[your-deployment].convex.site/ai/predict-yield
Body: {
  "batchId": "batch001",
  "currentPhase": "vegetative"
}
Response: {
  "prediction": {
    "estimatedYield": 36.5,
    "minYield": 35,
    "maxYield": 38,
    "unit": "kg",
    "confidence": 87,
    "targetYield": 30,
    "vsTarget": 117,
    "factorsConsidered": [
      "growth rate",
      "health score",
      "environmental conditions",
      "historical performance"
    ]
  }
}
```

```
POST https://[your-deployment].convex.site/ai/auto-accept-recommendation
Body: {
  "insightId": "insight123",
  "action": "schedule_phase_transition",
  "performedBy": "user123"
}
Response: {
  "success": true,
  "activityCreated": "act999...",
  "message": "Recomendación aceptada, actividad programada"
}
```

```
POST https://[your-deployment].convex.site/ai/dismiss-insight
Body: {
  "insightId": "insight123",
  "reason": "Not ready yet, need 2 more weeks"
}
Response: {
  "success": true,
  "message": "Insight dismissed"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `ai.getInsights` (query)
- `ai.analyzeBatch` (query)
- `ai.predictYield` (query)
- `ai.detectAnomalies` (query)
- `ai.autoAcceptRecommendation` (mutation)
- `ai.dismissInsight` (mutation)
- `ai.calculateHealthScore` (internal function)
- `ai.analyzeGrowthRate` (internal function)
- `ai.predictInventoryDepletion` (internal function)

### AI Engine Architecture
```
Data Sources:
  - activities (historical patterns)
  - batches (current state)
  - environmental_data (conditions)
  - quality_checks (health indicators)
  - inventory (consumption rates)
      ↓
AI Analysis Engine:
  - Phase Progression Analyzer
  - Yield Predictor (ML model)
  - Pest Risk Predictor
  - Inventory Forecaster
      ↓
Outputs:
  - Insights (actionable recommendations)
  - Alerts (time-sensitive warnings)
  - Forecasts (predictive analytics)
```

### Notes
- 🔴 **Required**: AI engine must provide at least 3 types of insights (phase readiness, nutrient alerts, pest risk)
- 🟡 **Important**: Recommendations should be actionable (with suggested next steps)
- 🟢 **Nice-to-have**: Yield prediction models, historical comparison
- AI recommendations can be auto-accepted (creates activities/alerts) or dismissed
- Machine learning improves over time (more data = better predictions)
- Confidence scores help users trust AI recommendations
- Integration with GCP Vertex AI for ML models (yield prediction, pest detection)

---

## IMPLEMENTATION STATUS OVERVIEW

### ❌ Not Yet Implemented (Schema Ready, Full Implementation Needed)

All Phase 2 modules require complete Convex backend implementation. The database schema is ready, but API endpoints and business logic are not yet built.

**MODULE 9: Inventory Management**
- ✅ Database schema: `inventory_items`, `products`, `suppliers` tables ready
- ❌ Missing: CRUD endpoints for inventory management
- ❌ Missing: Consumption logging and tracking
- ❌ Missing: Low stock alerts
- **Priority**: CRITICAL - needed for all production operations
- **Convex File**: Need to create `convex/inventory.ts`

**MODULE 10: Production Templates**
- ✅ Database schema: `production_templates`, `template_phases`, `template_activities` tables ready
- ❌ Missing: Template CRUD operations
- ❌ Missing: Phase and activity management
- ❌ Missing: Template cloning functionality
- **Priority**: CRITICAL - needed before production orders can be created
- **Convex File**: Need to create `convex/templates.ts`

**MODULE 11: Quality Check Templates + AI**
- ✅ Database schema: `quality_check_templates`, `pest_disease_records` tables ready
- ❌ Missing: QC template management
- ❌ Missing: QC execution and logging
- ❌ Missing: AI photo analysis integration (GCP Vision API)
- ❌ Missing: Pest detection and tracking
- **Priority**: HIGH - important for compliance and crop health
- **Convex File**: Need to create `convex/qualityChecks.ts`, `convex/pests.ts`

**MODULE 12: Production Orders & Operations**
- ✅ Database schema: `production_orders`, `batches`, `scheduled_activities`, `activities` tables ready
- ❌ Missing: Order creation from templates
- ❌ Missing: Activity scheduling automation
- ❌ Missing: Activity logging with material consumption
- ❌ Missing: Phase progression and area transfers
- ❌ Missing: Harvest recording
- ❌ Missing: QR code generation for batches
- **Priority**: CRITICAL - core of Phase 2 operations
- **Convex File**: Need to create `convex/orders.ts`, `convex/batches.ts`, `convex/activities.ts`

**MODULE 13: AI Engine & Intelligent Services**
- ✅ Database schema: All necessary tables exist for data analysis
- ❌ Missing: AI insights generation
- ❌ Missing: Phase readiness analyzer
- ❌ Missing: Yield prediction model
- ❌ Missing: Inventory depletion forecasting
- ❌ Missing: Pest risk prediction
- ❌ Missing: Integration with GCP Vertex AI
- **Priority**: MEDIUM - enhances UX but not blocking
- **Convex File**: Need to create `convex/ai.ts`

---

## DEPENDENCIES & IMPLEMENTATION ORDER

### Phase 2 Depends On:
- ✅ **PHASE 1, Module 1**: Users & companies (authentication)
- ✅ **PHASE 1, Module 2**: Email verification
- ⚠️ **PHASE 1, Module 5**: Facilities (MUST be implemented before Phase 2)
- ⚠️ **PHASE 1, Module 6**: Crop types selection
- ⚠️ **PHASE 1, Module 7**: Areas creation
- ⚠️ **PHASE 1, Module 8**: Cultivars & suppliers

### Recommended Implementation Sequence:

**Step 1: Complete Phase 1 Prerequisites** (Modules 5-8)
```
1. Facilities CRUD (Module 5)
2. Crop Types & Selection (Module 6)
3. Areas Management (Module 7)
4. Cultivars & Suppliers (Module 8)
```

**Step 2: Build Phase 2 Foundation** (Weeks 1-2)
```
1. Products & Inventory (Module 9)
2. Production Templates (Module 10)
   ↓
   These two are independent, can be built in parallel
```

**Step 3: Core Operations** (Weeks 3-4)
```
3. Production Orders & Batches (Module 12)
   - Depends on: Templates (10), Inventory (9), Areas (Phase 1.7)
   - This is the heart of Phase 2
```

**Step 4: Quality & Intelligence** (Weeks 5-6)
```
4. Quality Check Templates (Module 11)
   - Can be built in parallel with Orders

5. AI Engine (Module 13)
   - Depends on: All previous modules (needs data to analyze)
   - Can start with basic alerts, add ML later
```

---

## BUBBLE INTEGRATION: PHASE 2 READINESS

### Current Status
❌ **NOT READY** - No Phase 2 endpoints implemented yet

### Required Before Phase 2 UI Development:
1. ✅ Complete PHASE-1 Modules 1-2 (auth & email) - **DONE**
2. ⚠️ Complete PHASE-1 Modules 5-8 (facilities, areas, cultivars) - **IN PROGRESS**
3. ❌ Implement PHASE-2 Modules 9-10 (inventory, templates) - **NOT STARTED**
4. ❌ Implement PHASE-2 Module 12 (orders, batches, activities) - **NOT STARTED**
5. 🟢 Implement PHASE-2 Modules 11, 13 (QC, AI) - **OPTIONAL** (can add later)

### Estimated Development Time
- Phase 1 Modules 5-8: **2-3 weeks**
- Phase 2 Modules 9-10: **2-3 weeks**
- Phase 2 Module 12: **3-4 weeks**
- Phase 2 Modules 11, 13: **2-3 weeks**

**Total for Phase 2 MVP**: ~10-13 weeks of Convex backend development

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
