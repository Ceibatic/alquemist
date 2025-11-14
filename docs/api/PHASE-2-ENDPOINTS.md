# PHASE 2: API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Database Schema**: See [../database/SCHEMA.md](../database/SCHEMA.md)
**UI Requirements**: See [../ui/bubble/PHASE-2-OPERATIONS.md](../ui/bubble/PHASE-2-OPERATIONS.md)

⚠️ **STATUS**: All Phase 2 endpoints are NOT YET IMPLEMENTED. Backend development required.

---

## Authentication

**All Phase 2 endpoints require authentication** using custom session tokens.

### Required Headers

```
Authorization: Bearer {session_token}
Content-Type: application/json
```

### Authentication Flow

Phase 2 endpoints use the same authentication system as Phase 1:

1. User logs in via `/api/v1/auth/login` → receives `session_token`
2. Token stored in Bubble User data type field: `session_token`
3. All API requests include token in `Authorization` header
4. Token valid for 30 days (renewed on each request)
5. Multi-tenant isolation via `company_id` extracted from token

**See**: [PHASE-1-ENDPOINTS.md](./PHASE-1-ENDPOINTS.md#authentication) for complete auth documentation.

### Error Handling

- **401 Unauthorized**: Invalid or expired session token → redirect to login
- **403 Forbidden**: Valid token but insufficient permissions
- **422 Validation Error**: Invalid request parameters

---

## MODULE 9: Inventory Management

### Get Inventory by Facility

**Endpoint**: `GET /inventory/get-by-facility`

**Triggered by**: Bubble inventory dashboard page load

**Headers**:
```
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Request**:
```json
{
  "facilityId": "f78ghi..."
}
```

**Note**: `facilityId` is optional - if not provided, company_id from session token determines scope.

**Response**:
```json
{
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
      "supplierName": "FarmChem Inc",
      "areaId": "a99jkl...",
      "areaName": "Vegetative Room"
    }
  ]
}
```

**Convex Function**: `inventory.getByFacility` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `inventory_items` joined with `products`, `suppliers`, `areas`

---

### Add Inventory Item

**Endpoint**: `POST /inventory/add-item`

**Triggered by**: Bubble "Save" button in add item popup

**Headers**:
```
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Request**:
```json
{
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
```

**Note**: `company_id` automatically extracted from session token for multi-tenant isolation.

**Response**:
```json
{
  "success": true,
  "inventoryItemId": "inv789...",
  "message": "Item agregado al inventario"
}
```

**Convex Function**: `inventory.addItem` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `inventory_items` table

---

### Log Consumption

**Endpoint**: `POST /inventory/log-consumption`

**Triggered by**: Bubble "Log Consumption" button

**Request**:
```json
{
  "inventoryItemId": "inv123",
  "batchId": "batch001",
  "quantityConsumed": 5,
  "activityType": "feeding",
  "performedBy": "user456",
  "notes": "Week 3 feeding schedule"
}
```

**Response**:
```json
{
  "success": true,
  "activityId": "act999...",
  "remainingQuantity": 40,
  "needsReorder": true
}
```

**Convex Function**: `inventory.logConsumption` ⚠️ TO BE CREATED

**Database Operations**:
- **Updates**: `inventory_items` → decrease quantity_available
- **Writes**: `activities` → log consumption event

---

### Transfer Inventory

**Endpoint**: `POST /inventory/transfer`

**Triggered by**: Bubble "Transfer" button

**Request**:
```json
{
  "inventoryItemId": "inv123",
  "fromAreaId": "a99jkl...",
  "toAreaId": "a88ijk...",
  "quantity": 10
}
```

**Response**:
```json
{
  "success": true,
  "message": "Transferencia completada"
}
```

**Convex Function**: `inventory.transfer` ⚠️ TO BE CREATED

**Database Operations**:
- **Updates**: `inventory_items` → adjust quantities for both areas

---

## MODULE 10: Production Templates

### Get Templates by Company

**Endpoint**: `GET /templates/get-by-company`

**Triggered by**: Bubble templates list page load

**Headers**:
```
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Request**:
```json
{
  "companyId": "k12def..."
}
```

**Note**: `companyId` parameter is optional - defaults to company from session token.

**Response**:
```json
{
  "templates": [
    {
      "id": "tmpl123",
      "name": "Cannabis Full Cycle",
      "cropTypeId": "crop123",
      "cropTypeName": "Cannabis",
      "defaultBatchSize": 200,
      "estimatedDurationDays": 140,
      "phaseCount": 4,
      "status": "active"
    }
  ]
}
```

**Convex Function**: `templates.getByCompany` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `production_templates` joined with `crop_types`

---

### Create Template

**Endpoint**: `POST /templates/create`

**Triggered by**: Bubble "Save Template" button

**Request**:
```json
{
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
```

**Response**:
```json
{
  "success": true,
  "templateId": "tmpl456...",
  "message": "Plantilla creada exitosamente"
}
```

**Convex Function**: `templates.create` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `production_templates` table

---

### Add Phase to Template

**Endpoint**: `POST /templates/add-phase`

**Triggered by**: Bubble "Save Phase" button in popup

**Request**:
```json
{
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
```

**Response**:
```json
{
  "success": true,
  "phaseId": "phase789...",
  "message": "Fase agregada"
}
```

**Convex Function**: `templates.addPhase` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `template_phases` table

---

### Add Activity to Phase

**Endpoint**: `POST /templates/add-activity`

**Triggered by**: Bubble "Save Activity" button

**Request**:
```json
{
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
    {
      "productId": "prod123",
      "quantityPerPlant": 2,
      "unit": "L"
    }
  ],
  "instructions": "Water until runoff, check pH 6.0-6.5"
}
```

**Response**:
```json
{
  "success": true,
  "activityId": "tact999...",
  "message": "Actividad agregada a la fase"
}
```

**Convex Function**: `templates.addActivity` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `template_activities` table

---

### Clone Template

**Endpoint**: `POST /templates/clone`

**Triggered by**: Bubble "Clone" button

**Request**:
```json
{
  "templateId": "tmpl456",
  "newName": "Cannabis Full Cycle - Modified"
}
```

**Response**:
```json
{
  "success": true,
  "newTemplateId": "tmpl777...",
  "message": "Plantilla clonada exitosamente"
}
```

**Convex Function**: `templates.clone` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: Original template, phases, activities
- **Writes**: New copies of all related records

---

## MODULE 11: Quality Check Templates

### Get QC Templates

**Endpoint**: `GET /quality-checks/get-templates`

**Triggered by**: Bubble QC templates page load

**Request**:
```json
{
  "companyId": "k12def..."
}
```

**Response**:
```json
{
  "templates": [
    {
      "id": "qc123",
      "name": "Daily Plant Inspection",
      "procedureType": "visual",
      "cropTypeId": "crop123",
      "applicableStages": ["vegetative", "flowering"],
      "frequencyRecommendation": "daily",
      "aiAssisted": false
    }
  ]
}
```

**Convex Function**: `qualityChecks.getTemplates` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `quality_check_templates` table

---

### Create QC Template

**Endpoint**: `POST /quality-checks/create-template`

**Triggered by**: Bubble "Save Template" button

**Request**:
```json
{
  "companyId": "k12def...",
  "name": "Daily Plant Inspection",
  "cropTypeId": "crop123",
  "procedureType": "visual",
  "inspectionLevel": "batch",
  "regulatoryRequirement": false,
  "templateStructure": {
    "criteria": [
      {
        "name": "Leaf Color",
        "type": "pass_fail",
        "description": "Check for green, healthy leaves"
      },
      {
        "name": "Pest/Disease",
        "type": "pass_fail",
        "description": "Look for visible signs"
      }
    ]
  },
  "aiAssisted": true,
  "aiAnalysisTypes": ["pest_detection", "disease_detection"],
  "applicableStages": ["vegetative", "flowering"]
}
```

**Response**:
```json
{
  "success": true,
  "templateId": "qc456...",
  "message": "Plantilla de QC creada"
}
```

**Convex Function**: `qualityChecks.createTemplate` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `quality_check_templates` table

---

### Run Quality Check

**Endpoint**: `POST /quality-checks/run-check`

**Triggered by**: Bubble "Submit Check" button

**Request**:
```json
{
  "templateId": "qc456",
  "batchId": "batch001",
  "performedBy": "user123",
  "results": [
    {
      "criteriaName": "Leaf Color",
      "status": "pass",
      "notes": "Green, healthy"
    },
    {
      "criteriaName": "Pest/Disease",
      "status": "fail",
      "notes": "Mites detected"
    }
  ],
  "overallResult": "fail",
  "photos": ["photo_url_1", "photo_url_2"]
}
```

**Response**:
```json
{
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

**Convex Function**: `qualityChecks.runCheck` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `activities` → QC check record
- **Writes**: `pest_disease_records` → if pest/disease detected
- **Writes**: `media_files` → QC photos

---

### AI Analyze Photo

**Endpoint**: `POST /quality-checks/ai-analyze-photo`

**Triggered by**: Bubble "AI Check Image" button

**Request**:
```json
{
  "photoUrl": "https://storage.../qc_photo.jpg",
  "batchId": "batch001",
  "cropTypeId": "crop123"
}
```

**Response**:
```json
{
  "success": true,
  "aiAnalysis": {
    "confidence": 92,
    "detected": [
      {
        "type": "mites",
        "severity": "light",
        "confidence": 88
      },
      {
        "type": "powdery_mildew",
        "severity": "trace",
        "confidence": 75
      }
    ],
    "recommendations": [
      "Increase ventilation",
      "Spray fungicide",
      "Recheck in 2-3 days"
    ]
  }
}
```

**Convex Function**: `qualityChecks.aiAnalyzePhoto` ⚠️ TO BE CREATED

**External Integration**: GCP Vision API for image analysis

**Database Operations**:
- **Reads**: `media_files` → get photo
- **Calls**: GCP Vision API → analyze image
- **Writes**: AI results to activity or media_file record

---

## MODULE 12: Production Orders & Operations

### Get Active Orders

**Endpoint**: `GET /orders/get-active`

**Triggered by**: Bubble orders dashboard page load

**Request**:
```json
{
  "facilityId": "f78ghi..."
}
```

**Response**:
```json
{
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
        {
          "activityType": "watering",
          "scheduledDate": 1730073600000,
          "status": "pending"
        }
      ]
    }
  ]
}
```

**Convex Function**: `orders.getActive` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `production_orders` joined with `batches`, `templates`, `scheduled_activities`

---

### Create Production Order

**Endpoint**: `POST /orders/create`

**Triggered by**: Bubble "Create Order" button

**Headers**:
```
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Request**:
```json
{
  "templateId": "tmpl456",
  "facilityId": "f78ghi...",
  "areaId": "a99jkl...",
  "cultivarId": "cult789",
  "batchSize": 200,
  "startDate": 1730073600000,
  "requestedBy": "user123",
  "notes": "Premium batch for Q1 2025"
}
```

**Note**: All created resources automatically associated with `company_id` from session token.

**Response**:
```json
{
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

**Convex Function**: `orders.create` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `production_templates` → get template structure
- **Writes**: `production_orders` → create order
- **Writes**: `batches` → create batch with QR code
- **Writes**: `scheduled_activities` → auto-generate from template

---

### Get Order Detail

**Endpoint**: `GET /orders/get-detail`

**Triggered by**: Bubble order detail page load

**Request**:
```json
{
  "orderId": "order456"
}
```

**Response**:
```json
{
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
    "template": {
      "name": "Cannabis Full Cycle",
      "phases": [...]
    },
    "currentPhase": {
      "name": "Propagation",
      "order": 1,
      "daysElapsed": 5,
      "daysRemaining": 2,
      "progress": 71
    },
    "upcomingActivities": [...],
    "materialsUsed": [
      {
        "product": "Nutrient A",
        "quantity": 40,
        "unit": "units"
      }
    ],
    "qcHistory": [...],
    "status": "en_proceso"
  }
}
```

**Convex Function**: `orders.getDetail` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: Complete order data from multiple joined tables

---

### Log Activity

**Endpoint**: `POST /orders/log-activity`

**Triggered by**: Bubble "Log Activity" button

**Request**:
```json
{
  "orderId": "order456",
  "batchId": "batch002",
  "activityType": "watering",
  "performedBy": "user123",
  "timestamp": 1730073600000,
  "durationMinutes": 30,
  "materialsConsumed": [
    {
      "inventoryItemId": "inv123",
      "quantity": 5,
      "unit": "units"
    }
  ],
  "observations": "Plant color good, growth progressing normally",
  "photos": ["photo_url_1", "photo_url_2"],
  "qrScanned": "QR-BATCH-002"
}
```

**Response**:
```json
{
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

**Convex Function**: `orders.logActivity` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `activities` → log activity
- **Updates**: `inventory_items` → consume materials
- **Updates**: `scheduled_activities` → mark completed
- **Writes**: `media_files` → store photos

---

### Complete Phase

**Endpoint**: `POST /orders/complete-phase`

**Triggered by**: Bubble "Complete Phase" button

**Request**:
```json
{
  "orderId": "order456",
  "currentPhaseId": "phase789",
  "nextAreaId": "a88ijk...",
  "notes": "Ready to move to vegetative"
}
```

**Response**:
```json
{
  "success": true,
  "newPhase": "vegetative",
  "batchMoved": true,
  "newArea": "Vegetative Room",
  "activitiesScheduled": 12,
  "message": "Fase completada, lote movido a Vegetativo"
}
```

**Convex Function**: `orders.completePhase` ⚠️ TO BE CREATED

**Database Operations**:
- **Updates**: `batches` → change current_phase, current_area_id
- **Writes**: `scheduled_activities` → schedule next phase activities
- **Writes**: `activities` → log phase transition

---

### Record Harvest

**Endpoint**: `POST /orders/harvest`

**Triggered by**: Bubble "Harvest" button

**Request**:
```json
{
  "orderId": "order456",
  "batchId": "batch002",
  "harvestDate": 1735689600000,
  "harvestedQuantity": 35,
  "quantityUnit": "kg",
  "qualityGrade": "A",
  "notes": "Excellent yield, premium quality",
  "performedBy": "user123"
}
```

**Response**:
```json
{
  "success": true,
  "orderStatus": "completado",
  "batchStatus": "harvested",
  "yieldVsTarget": 117,
  "message": "Cosecha registrada exitosamente"
}
```

**Convex Function**: `orders.harvest` ⚠️ TO BE CREATED

**Database Operations**:
- **Updates**: `batches` → set harvested_quantity, quality_grade, status="harvested"
- **Updates**: `production_orders` → set status="completado"
- **Writes**: `activities` → log harvest activity

---

## MODULE 13: AI Engine & Insights

### Get Insights

**Endpoint**: `GET /ai/get-insights`

**Triggered by**: Bubble AI dashboard page load

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "timeframe": "week"
}
```

**Response**:
```json
{
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
        "Move to Flower Room"
      ],
      "createdAt": 1730073600000
    },
    {
      "id": "insight124",
      "type": "inventory_alert",
      "priority": "medium",
      "confidence": 100,
      "title": "Low Nutrient Alert",
      "description": "Nutrient A stock at 8 units. Will deplete in 5 days at current consumption rate"
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
        "unit": "kg"
      }
    }
  ]
}
```

**Convex Function**: `ai.getInsights` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: Multiple sources for analysis
- **Executes**: AI analysis algorithms server-side

---

### Analyze Batch

**Endpoint**: `POST /ai/analyze-batch`

**Triggered by**: Bubble "View Details" on insight

**Request**:
```json
{
  "batchId": "batch001"
}
```

**Response**:
```json
{
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
      {
        "type": "humidity",
        "level": "medium",
        "score": 72
      }
    ],
    "recommendations": [...]
  }
}
```

**Convex Function**: `ai.analyzeBatch` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: Batch history, activities, environmental data
- **Executes**: ML models for prediction

---

## CONVEX FILES TO CREATE

### Required Files (Priority Order):

1. **`convex/inventory.ts`** - Inventory management endpoints
2. **`convex/templates.ts`** - Production template CRUD
3. **`convex/orders.ts`** - Production order management
4. **`convex/batches.ts`** - Batch tracking and operations
5. **`convex/activities.ts`** - Activity logging
6. **`convex/scheduledActivities.ts`** - Scheduled activity management
7. **`convex/qualityChecks.ts`** - QC template and execution
8. **`convex/pests.ts`** - Pest/disease detection and tracking
9. **`convex/ai.ts`** - AI insights and analysis
10. **`convex/media.ts`** - Photo and file management

---

## IMPLEMENTATION STATUS SUMMARY

### ❌ Not Yet Implemented

**All Phase 2 modules** require complete Convex backend implementation:

- ❌ Module 9: Inventory (7 endpoints)
- ❌ Module 10: Templates (8 endpoints)
- ❌ Module 11: Quality Checks (4 endpoints)
- ❌ Module 12: Production Orders (7 endpoints)
- ❌ Module 13: AI Insights (2 endpoints)

**Total**: ~28 endpoints to implement

---

## DEPENDENCIES

**Phase 2 requires Phase 1 completion**:
- ✅ Module 1-2: Auth & companies (implemented)
- ⚠️ Module 3: Facilities (not yet implemented)
- ⚠️ Module 4: Areas (not yet implemented)
- ⚠️ Module 5: Cultivars (not yet implemented)
- ⚠️ Module 6: Suppliers (not yet implemented)

**Implementation Order**:
1. Complete Phase 1 Modules 3-6 first
2. Then implement Phase 2 in this order:
   - Inventory → Templates → Orders → QC → AI

---

## INTERNATIONALIZATION (i18n) STRATEGY

**Backend Approach**: The API is **language-agnostic** and always sends technical codes, not translated messages.

See [PHASE-1-ENDPOINTS.md](./PHASE-1-ENDPOINTS.md#internationalization-i18n-strategy) for complete i18n strategy and error code translations.

### Additional Error Codes for Phase 2

| code | message_es | message_en |
|------|------------|------------|
| INVENTORY_ITEM_NOT_FOUND | Artículo de inventario no encontrado | Inventory item not found |
| INSUFFICIENT_STOCK | Stock insuficiente | Insufficient stock |
| TEMPLATE_NOT_FOUND | Plantilla no encontrada | Template not found |
| BATCH_NOT_FOUND | Lote no encontrado | Batch not found |
| INVALID_BATCH_SIZE | Tamaño de lote inválido | Invalid batch size |
| INVALID_QUANTITY | Cantidad inválida | Invalid quantity |
| INVALID_PHASE | Fase inválida | Invalid phase |
| ACTIVITY_NOT_FOUND | Actividad no encontrada | Activity not found |
| MATERIAL_NOT_FOUND | Material no encontrado | Material not found |
| QC_TEMPLATE_NOT_FOUND | Plantilla de QC no encontrada | QC template not found |
| PHASE_NOT_COMPLETE | Fase no completada | Phase not complete |
| BATCH_ALREADY_HARVESTED | Lote ya cosechado | Batch already harvested |
| ORDER_NOT_FOUND | Orden no encontrada | Order not found |
| INVALID_CULTIVAR | Cultivar inválido | Invalid cultivar |
| AREA_NOT_AVAILABLE | Área no disponible | Area not available |
| AREA_AT_CAPACITY | Área en capacidad máxima | Area at capacity |

For implementation details, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md) and [../i18n/BUBBLE-IMPLEMENTATION.md](../i18n/BUBBLE-IMPLEMENTATION.md).

---

**Status**: Phase 2 API specification complete
**Ready Endpoints**: 0 endpoints
**Pending Endpoints**: 28 endpoints
**Next Steps**:
1. Complete Phase 1 Modules 3-6
2. Implement Phase 2 Convex functions
3. Test full production workflow end-to-end
