# PHASE 4: PRODUCTION EXECUTION - API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Related Documentation**:
- **Database Schema**: [../database/SCHEMA.md](../database/SCHEMA.md)
- **UI Requirements**: [../ui/bubble/PHASE-4-PRODUCTION.md](../ui/bubble/PHASE-4-PRODUCTION.md)
- **Activity Scheduling Logic**: [../ACTIVITY-SCHEDULING-LOGIC.md](../ACTIVITY-SCHEDULING-LOGIC.md)
- **AI Quality Checks**: [../AI-QUALITY-CHECKS.md](../AI-QUALITY-CHECKS.md)
- **Restructure Plan**: [../TEMP-API-RESTRUCTURE-PLAN.md](../TEMP-API-RESTRUCTURE-PLAN.md)

---

## PHASE 4 OVERVIEW

**Purpose**: Create and execute production orders with real-time tracking and AI-powered monitoring

**Modules**:
- **MODULE 24**: Production Orders with Auto-Scheduling
- **MODULE 25**: Activity Execution with AI Detection

**Estimated Pages**: 18 screens
**Entry Point**: After creating production templates (Phase 3)
**Key Features**:
- Create orders from templates
- Manager approval workflow
- Auto-schedule all activities
- Real-time progress tracking
- AI pest/disease detection
- Automatic remediation activities

---

## AUTHENTICATION

All Phase 4 endpoints require authentication via Bearer token.

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Token Source**: `Current User's session_token` in Bubble

---

## MODULE 24: Production Orders with Auto-Scheduling

Production orders are instances of templates with actual execution tracking.

### Create Production Order

**Endpoint**: `POST /production-orders/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.create` - TO BE CREATED

**Purpose**: Create production order from template, auto-schedule all activities

#### Bubble API Connector Configuration

**Name**: `createProductionOrder`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-orders/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "templateId": "<templateId>",
  "orderName": "<orderName>",
  "areaId": "<areaId>",
  "startDate": "<startDate>",
  "plantCount": <plantCount>,
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| templateId | text | No | Body | pt123... |
| orderName | text | No | Body | Batch Cannabis #45 - Cherry AK |
| areaId | text | No | Body | a99jkl... |
| startDate | text | No | Body | 2025-01-20 |
| plantCount | number | No | Body | 100 |
| notes | text | No | Body | First batch of 2025 |

**Complete Response**:
```json
{
  "success": true,
  "productionOrderId": "po123...",
  "activitiesScheduled": 145,
  "projectedEndDate": "2025-03-20",
  "requiresApproval": true,
  "message": "Orden de producción creada. Pendiente de aprobación.",
  "error": "Area not available",
  "code": "AREA_NOT_AVAILABLE"
}
```

**Response Fields**:
- `success` (boolean)
- `productionOrderId` (text)
- `activitiesScheduled` (number) - Total activities created
- `projectedEndDate` (text) - ISO date
- `requiresApproval` (boolean) - true if Manager+ approval needed
- `message` (text)
- `error` (text)
- `code` (text)

#### Bubble Workflow

1. **Trigger**: Button "Create Production Order" clicked
2. **Step 1**: Validate area availability for date range
3. **Step 2**: Plugins → createProductionOrder
4. **Step 3** (success): Show alert "Order created, pending approval"
5. **Step 4**: Navigate to production order detail page
6. **Step 5** (failure): Show alert with error

**Backend Processing**:
1. Validate template exists and is active
2. Check area availability (no overlapping orders)
3. Check area capacity >= plantCount
4. Create production order record (status="pending_approval")
5. Auto-schedule ALL activities based on template:
   - One-time: startDate + dayOffset
   - Recurring: Generate for each occurrence
   - Dependent: Calculate based on dependency chain
6. Reserve inventory (projected consumption)
7. Create notification for managers
8. Return order ID and metrics

**Validation**:
- Template must be active
- Area must be compatible with crop type
- Area capacity >= plant count
- No overlapping production orders in area
- Start date >= today

---

### Get Production Orders by Facility

**Endpoint**: `POST /production-orders/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getProductionOrdersByFacility`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/production-orders/get-by-facility`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | URL | f78ghi... |
| status | text | No | URL | active |

**Status Filter**: all, pending_approval, active, completed, cancelled

**Complete Response**:
```json
[
  {
    "id": "po123...",
    "orderName": "Batch Cannabis #45 - Cherry AK",
    "templateName": "Cannabis Flowering - Cherry AK",
    "areaName": "Greenhouse A",
    "status": "active",
    "startDate": "2025-01-20",
    "projectedEndDate": "2025-03-20",
    "plantCount": 100,
    "completionRate": 35.5,
    "activitiesCompleted": 52,
    "activitiesTotal": 145,
    "overdueActivities": 2,
    "createdBy": "Juan Pérez",
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

**Response Fields**:
- `id` (text)
- `orderName` (text)
- `templateName` (text)
- `areaName` (text)
- `status` (text) - pending_approval, active, in_progress, completed, cancelled
- `startDate` (text) - ISO date
- `projectedEndDate` (text) - ISO date
- `plantCount` (number)
- `completionRate` (number) - percentage
- `activitiesCompleted` (number)
- `activitiesTotal` (number)
- `overdueActivities` (number)
- `createdBy` (text) - user name
- `createdAt` (text) - ISO date

**Bubble Usage**:
- Repeating Group on Production Orders List Page
- Filter by status (tabs: All, Pending, Active, Completed)
- Sort by startDate, completionRate, overdueActivities
- Color-code by status

---

### Get Production Order by ID

**Endpoint**: `POST /production-orders/get-by-id`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.getById` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getProductionOrderById`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/production-orders/get-by-id`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | URL | po123... |

**Complete Response**:
```json
{
  "id": "po123...",
  "facilityId": "f78ghi...",
  "templateId": "pt123...",
  "templateName": "Cannabis Flowering - Cherry AK",
  "orderName": "Batch Cannabis #45 - Cherry AK",
  "areaId": "a99jkl...",
  "areaName": "Greenhouse A",
  "status": "active",
  "startDate": "2025-01-20",
  "projectedEndDate": "2025-03-20",
  "actualEndDate": null,
  "plantCount": 100,
  "projectedYield": 5000,
  "actualYield": null,
  "completionRate": 35.5,
  "activitiesCompleted": 52,
  "activitiesTotal": 145,
  "pendingActivities": 85,
  "overdueActivities": 8,
  "phaseProgress": [
    {
      "phaseName": "Early Flowering",
      "completionRate": 100,
      "status": "completed"
    },
    {
      "phaseName": "Mid Flowering",
      "completionRate": 45,
      "status": "in_progress"
    }
  ],
  "inventoryConsumption": [
    {
      "inventoryId": "inv789...",
      "inventoryName": "Nutriente A",
      "projectedQuantity": 252,
      "consumedQuantity": 89
    }
  ],
  "notes": "First batch of 2025",
  "createdBy": "j97abc...",
  "createdByName": "Juan Pérez",
  "createdAt": "2025-01-15T10:30:00Z",
  "approvedBy": "j98def...",
  "approvedByName": "Maria García",
  "approvedAt": "2025-01-16T09:00:00Z"
}
```

**Response Fields**:
- Complete production order details
- Phase-by-phase progress tracking
- Inventory consumption tracking (projected vs actual)
- Approval workflow metadata

**Bubble Usage**:
- Production Order Detail Page data source
- Progress visualization (charts, progress bars)
- Phase accordion/tabs
- Inventory consumption tracking

---

### Update Production Order Status

**Endpoint**: `POST /production-orders/update-status`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.updateStatus` - TO BE CREATED

**Purpose**: Update order status (complete, cancel, etc.)

#### Bubble API Connector Configuration

**Name**: `updateProductionOrderStatus`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-orders/update-status`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productionOrderId": "<productionOrderId>",
  "status": "<status>",
  "actualYield": <actualYield>,
  "completionNotes": "<completionNotes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | Body | po123... |
| status | text | No | Body | completed |
| actualYield | number | No | Body | 4850 |
| completionNotes | text | No | Body | Slightly lower yield due to pest issues |

**Status Values**: completed, cancelled

**Complete Response**:
```json
{
  "success": true,
  "message": "Orden completada exitosamente",
  "finalCompletionRate": 98.5,
  "error": "Cannot complete order with pending activities",
  "code": "HAS_PENDING_ACTIVITIES"
}
```

**Validation**:
- Cannot complete if pending activities exist
- Cannot cancel if in_progress (must have approval)
- Actual yield required when completing

---

### Approve Production Order

**Endpoint**: `POST /production-orders/approve`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.approve` - TO BE CREATED

**Purpose**: Manager approves pending production order

**Role Required**: Manager or Owner

#### Bubble API Connector Configuration

**Name**: `approveProductionOrder`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-orders/approve`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productionOrderId": "<productionOrderId>",
  "approvalNotes": "<approvalNotes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | Body | po123... |
| approvalNotes | text | No | Body | Approved for Q1 production |

**Complete Response**:
```json
{
  "success": true,
  "message": "Orden aprobada exitosamente",
  "newStatus": "active",
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**Validation**:
- User must have Manager or Owner role
- Order must be in pending_approval status

**Side Effects**:
- Change status: pending_approval → active
- Reserve area capacity
- Send notification to order creator

---

### Reject Production Order

**Endpoint**: `POST /production-orders/reject`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.reject` - TO BE CREATED

**Purpose**: Manager rejects pending production order

**Role Required**: Manager or Owner

#### Bubble API Connector Configuration

**Name**: `rejectProductionOrder`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-orders/reject`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productionOrderId": "<productionOrderId>",
  "rejectionReason": "<rejectionReason>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | Body | po123... |
| rejectionReason | text | Yes | Body | Area unavailable, reschedule for next month |

**Complete Response**:
```json
{
  "success": true,
  "message": "Orden rechazada",
  "newStatus": "rejected",
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**Side Effects**:
- Change status: pending_approval → rejected
- Release reserved inventory
- Send notification to order creator with reason

---

### Cancel Production Order

**Endpoint**: `POST /production-orders/cancel`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.cancel` - TO BE CREATED

**Purpose**: Cancel active production order (emergency/issues)

**Role Required**: Manager or Owner

#### Bubble API Connector Configuration

**Name**: `cancelProductionOrder`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-orders/cancel`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productionOrderId": "<productionOrderId>",
  "cancellationReason": "<cancellationReason>"
}
```

**Complete Response**:
```json
{
  "success": true,
  "message": "Orden cancelada",
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**Validation**:
- User must have Manager or Owner role
- Order must be active or in_progress
- Confirmation required (dangerous action)

**Side Effects**:
- Cancel all pending activities
- Release area capacity
- Record actual inventory consumption to date

---

### Complete Production Phase

**Endpoint**: `POST /production-orders/complete-phase`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.completePhase` - TO BE CREATED

**Purpose**: Manager marks entire phase as complete, transitions production order to next phase

**Role Required**: Manager or Owner

#### Bubble API Connector Configuration

**Name**: `completePhase`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-orders/complete-phase`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productionOrderId": "<productionOrderId>",
  "phaseId": "<phaseId>",
  "completedBy": "<userId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | Body | order123... |
| phaseId | text | No | Body | phase2... |
| completedBy | text | No | Body | user456... |

**Complete Response**:
```json
{
  "success": true,
  "message": "Fase completada exitosamente",
  "newCurrentPhase": "Fase 3: Floración",
  "newCurrentPhaseId": "phase3...",
  "progressPercentage": 66,
  "error": "Not all activities completed",
  "code": "PHASE_INCOMPLETE"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Not all activities in phase are completed",
  "code": "PHASE_INCOMPLETE",
  "pendingActivities": 3,
  "totalActivities": 8
}
```

```json
{
  "success": false,
  "error": "Phase is not the current active phase",
  "code": "INVALID_PHASE_TRANSITION"
}
```

**Validation**:
- User must have Manager or Owner role
- All activities in phase must be completed
- Phase must be current active phase (can't skip phases)
- Production order must be in "en_proceso" status

**Backend Processing**:
1. Verify user has Manager/Owner role
2. Verify all activities in phase have status="completed"
3. Update production order:
   - Mark phase as complete in `phaseProgress` array
   - Increment to next phase
   - Update `currentPhase` field
   - Calculate new `progressPercentage`
4. If final phase completed:
   - Set order status to "completado"
   - Set `actual_completion_date`
5. Return new current phase info

**Side Effects**:
- Transitions order to next phase
- Updates phase progress tracking
- If final phase: marks entire order as complete

**Database Tables**:
- **Updates**: `production_orders` (currentPhase, phaseProgress, status)
- **Reads**: `scheduled_activities` (to verify all complete)

---

### Check Area Availability

**Endpoint**: `POST /production-orders/check-area-availability`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.checkAreaAvailability` - TO BE CREATED

**Purpose**: Validate area is available for production order date range

#### Bubble API Connector Configuration

**Name**: `checkAreaAvailability`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/production-orders/check-area-availability`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| areaId | text | No | URL | a99jkl... |
| startDate | text | No | URL | 2025-01-20 |
| durationDays | number | No | URL | 60 |

**Complete Response**:
```json
{
  "available": true,
  "areaId": "a99jkl...",
  "areaName": "Greenhouse A",
  "capacity": 500,
  "currentOccupancy": 0,
  "conflictingOrders": [],
  "message": "Área disponible para el período seleccionado"
}
```

**If Conflicts**:
```json
{
  "available": false,
  "areaId": "a99jkl...",
  "areaName": "Greenhouse A",
  "capacity": 500,
  "currentOccupancy": 400,
  "conflictingOrders": [
    {
      "orderId": "po456...",
      "orderName": "Batch Cannabis #44",
      "startDate": "2025-01-10",
      "endDate": "2025-03-10",
      "plantCount": 400
    }
  ],
  "message": "Área no disponible - capacidad insuficiente"
}
```

**Bubble Usage**:
- Real-time validation as user selects area/dates
- Show warning if conflicts exist
- Suggest alternative areas or dates

---

### Auto-Schedule Activities

**Endpoint**: `POST /production-orders/auto-schedule`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionOrders.autoScheduleActivities` - TO BE CREATED

**Purpose**: Manually trigger activity re-scheduling (if dates change)

#### Bubble API Connector Configuration

**Name**: `autoScheduleActivities`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-orders/auto-schedule`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productionOrderId": "<productionOrderId>",
  "newStartDate": "<newStartDate>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | Body | po123... |
| newStartDate | text | No | Body | 2025-01-25 |

**Complete Response**:
```json
{
  "success": true,
  "activitiesRescheduled": 145,
  "newProjectedEndDate": "2025-03-25",
  "message": "Actividades reprogramadas exitosamente",
  "error": "Cannot reschedule order in progress",
  "code": "ORDER_ALREADY_STARTED"
}
```

**Validation**:
- Can only reschedule pending or approved orders (not in_progress)
- All activities recalculated based on new start date

---

## MODULE 25: Activity Execution with AI Detection

Execute activities with AI-powered pest detection and quality checks.

### Get Activities by Production Order

**Endpoint**: `POST /activities/get-by-order`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.getByOrder` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getActivitiesByOrder`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/activities/get-by-order`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | URL | po123... |
| status | text | No | URL | pending |

**Status Filter**: all, pending, in_progress, completed, overdue, skipped

**Complete Response**:
```json
[
  {
    "id": "act123...",
    "activityName": "Riego matutino",
    "description": "Riego con nutrientes fase vegetativa",
    "phaseName": "Early Flowering",
    "scheduledDate": "2025-01-21",
    "status": "pending",
    "assignedRoleId": "role_operator",
    "estimatedDurationMinutes": 30,
    "qcTemplateId": null,
    "hasPhotos": false,
    "requiresSignature": true,
    "isOverdue": false
  }
]
```

**Response Fields**:
- `id` (text)
- `activityName` (text)
- `description` (text)
- `phaseName` (text)
- `scheduledDate` (text) - ISO date
- `status` (text) - pending, in_progress, completed, overdue, skipped
- `assignedRoleId` (text)
- `estimatedDurationMinutes` (number)
- `qcTemplateId` (text) - if QC check required
- `hasPhotos` (boolean)
- `requiresSignature` (boolean)
- `isOverdue` (boolean)

**Bubble Usage**:
- Repeating Group on Activities List (by order)
- Filter tabs: All, Pending, Overdue, Completed
- Sort by scheduledDate
- Color-code by status

---

### Get Activity by ID

**Endpoint**: `POST /activities/get-by-id`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.getById` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getActivityById`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/get-by-id`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | URL | act123... |

**Complete Response**:
```json
{
  "id": "act123...",
  "productionOrderId": "po123...",
  "productionOrderName": "Batch Cannabis #45",
  "activityName": "Riego matutino",
  "description": "Riego con nutrientes fase vegetativa",
  "phaseName": "Early Flowering",
  "scheduledDate": "2025-01-21",
  "status": "pending",
  "assignedRoleId": "role_operator",
  "estimatedDurationMinutes": 30,
  "actualStartTime": null,
  "actualEndTime": null,
  "actualDurationMinutes": null,
  "qcTemplateId": "qc789...",
  "qcTemplateHtml": "<div class='qc-form'>...</div>",
  "qcResponses": null,
  "requiredInventoryItems": [
    {
      "inventoryId": "inv789...",
      "inventoryName": "Nutriente A",
      "quantityRequired": 2,
      "currentStock": 48
    }
  ],
  "photos": [],
  "pestsDetected": [],
  "remediationActivitiesCreated": [],
  "digitalSignature": null,
  "completedBy": null,
  "completionNotes": null
}
```

**Bubble Usage**: Activity Execution Page data source (multi-tab interface)

---

### Start Activity

**Endpoint**: `POST /activities/start`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.start` - TO BE CREATED

**Purpose**: Mark activity as started, record actual start time, validate dependencies

#### Bubble API Connector Configuration

**Name**: `startActivity`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/start`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "startedBy": "<userId>",
  "actualStartTime": "<actualStartTime>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| startedBy | text | No | Body | user456... |
| actualStartTime | text | No | Body | 2025-01-21T08:15:00Z |

**Complete Response**:
```json
{
  "success": true,
  "message": "Actividad iniciada",
  "actualStartTime": "2025-01-21T08:15:00Z",
  "error": "Dependencies not completed",
  "code": "DEPENDENCIES_NOT_MET"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Activity has dependencies that are not completed",
  "code": "DEPENDENCIES_NOT_MET",
  "pendingDependencies": [
    {
      "activityId": "act789...",
      "activityName": "Trasplante",
      "status": "pending"
    }
  ]
}
```

```json
{
  "success": false,
  "error": "Activity is already in progress or completed",
  "code": "INVALID_STATUS_TRANSITION"
}
```

**Validation**:
- Activity must have status="pending"
- All dependent activities must be completed
- User must be assigned to activity (or have Manager role)

**Backend Processing**:
1. Verify activity exists and has status="pending"
2. Check all dependencies completed
3. Update `scheduled_activities` record:
   - status: "in_progress"
   - actual_start_time: current timestamp
   - started_by: userId
4. Log start event in `activities` log
5. Return success

**Side Effects**:
- Activity status changes to "in_progress"
- Actual start time recorded
- Activity becomes editable in UI

**Database Tables**:
- **Updates**: `scheduled_activities` (status, actual_start_time, started_by)
- **Creates**: `activities` log entry (audit trail)
- **Reads**: `scheduled_activities` (dependency validation)

**Note**: This endpoint provides a clear workflow separation from `update-progress`. Alternatively, the first call to `update-progress` with `status: "in_progress"` could handle starting.

---

### Update Activity Progress

**Endpoint**: `POST /activities/update-progress`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.updateProgress` - TO BE CREATED

**Purpose**: Update activity status, save QC responses, add notes (auto-save)

#### Bubble API Connector Configuration

**Name**: `updateActivityProgress`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/update-progress`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "status": "<status>",
  "actualStartTime": "<actualStartTime>",
  "qcResponses": <qcResponses>,
  "completionNotes": "<completionNotes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| status | text | No | Body | in_progress |
| actualStartTime | text | No | Body | 2025-01-21T08:15:00Z |
| qcResponses | object | No | Body | {"field1": "value1"} |
| completionNotes | text | No | Body | All tasks completed successfully |

**Complete Response**:
```json
{
  "success": true,
  "message": "Progreso guardado",
  "error": "Activity not found",
  "code": "ACTIVITY_NOT_FOUND"
}
```

**Bubble Workflow**: Auto-save every 30 seconds while user fills form

---

### Complete Activity

**Endpoint**: `POST /activities/complete`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.complete` - TO BE CREATED

**Purpose**: Mark activity as completed, consume inventory, update production order progress

#### Bubble API Connector Configuration

**Name**: `completeActivity`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/complete`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "actualEndTime": "<actualEndTime>",
  "qcResponses": <qcResponses>,
  "inventoryConsumed": [
    {
      "inventoryId": "<inventoryId>",
      "quantityConsumed": <quantity>
    }
  ],
  "digitalSignature": "<digitalSignature>",
  "completionNotes": "<completionNotes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| actualEndTime | text | No | Body | 2025-01-21T08:45:00Z |
| qcResponses | object | No | Body | {"field1": "value1"} |
| inventoryConsumed | list | No | Body | [{...}] |
| digitalSignature | text | No | Body | base64-encoded-signature-image |
| completionNotes | text | No | Body | All tasks completed |

**Complete Response**:
```json
{
  "success": true,
  "message": "Actividad completada exitosamente",
  "dependentActivitiesScheduled": 2,
  "productionOrderCompletionRate": 36.2,
  "error": "QC responses required",
  "code": "QC_REQUIRED"
}
```

**Response Fields**:
- `dependentActivitiesScheduled` (number) - If activity had dependent activities, they're now scheduled
- `productionOrderCompletionRate` (number) - Updated overall progress

**Validation**:
- QC responses required if qcTemplateId present
- Digital signature required if activity configured as such
- Inventory consumption logged

**Side Effects**:
- Update activity status: in_progress → completed
- Consume inventory from facility stock
- Update production order completion rate
- Schedule dependent activities (if any)
- Update phase progress

---

### Reschedule Activity

**Endpoint**: `POST /activities/reschedule`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.reschedule` - TO BE CREATED

**Purpose**: Reschedule activity to new date/time with reason tracking

**Role Required**: Manager or assigned user

#### Bubble API Connector Configuration

**Name**: `rescheduleActivity`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/reschedule`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "newScheduledDate": "<newScheduledDate>",
  "rescheduledBy": "<userId>",
  "reason": "<reason>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| newScheduledDate | text | No | Body | 2025-03-22T10:00:00Z |
| rescheduledBy | text | No | Body | user456... |
| reason | text | No | Body | Equipment malfunction |

**Complete Response**:
```json
{
  "success": true,
  "message": "Actividad reprogramada",
  "newScheduledDate": "2025-03-22T10:00:00Z",
  "originalScheduledDate": "2025-03-20T10:00:00Z",
  "affectedDependentActivities": 3
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Cannot reschedule completed activity",
  "code": "INVALID_STATUS"
}
```

```json
{
  "success": false,
  "error": "New date conflicts with area availability",
  "code": "AREA_CONFLICT"
}
```

**Validation**:
- Activity must have status="pending" or "in_progress"
- New date must be in the future
- User must be assigned to activity or have Manager role
- Check area availability for new date

**Backend Processing**:
1. Verify activity can be rescheduled (not completed/cancelled)
2. Verify user has permission (Manager or assigned user)
3. Check area availability for new date/time
4. Update `scheduled_activities` record:
   - scheduled_date: new date
   - rescheduled_by: userId
   - reschedule_reason: reason
   - reschedule_count: increment
   - updated_at: current time
5. If activity has dependent activities:
   - Cascade reschedule to maintain dependencies
   - Or notify that dependencies need review
6. Log reschedule event in audit trail
7. Return success with affected activities count

**Side Effects**:
- Activity scheduled_date updated
- Dependent activities may be affected
- Area capacity recalculated for affected dates
- Audit log entry created

**Database Tables**:
- **Updates**: `scheduled_activities` (scheduled_date, reschedule_reason)
- **Reads**: `areas` (availability check)
- **Creates**: Audit log entry

**UI Workflow**:
```
1. User clicks "Reschedule" on activity
2. Modal popup: Select new date + reason
3. Call rescheduleActivity API
4. Show success message with new date
5. Refresh activities list
```

---

### Cancel Activity

**Endpoint**: `POST /activities/cancel`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.cancel` - TO BE CREATED

**Purpose**: Cancel pending or in-progress activity with reason tracking

**Role Required**: Manager or Owner

#### Bubble API Connector Configuration

**Name**: `cancelActivity`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/cancel`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "cancelledBy": "<userId>",
  "reason": "<reason>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| cancelledBy | text | No | Body | user456... |
| reason | text | No | Body | Batch damaged, activity no longer needed |

**Complete Response**:
```json
{
  "success": true,
  "message": "Actividad cancelada",
  "affectedDependentActivities": 2,
  "productionOrderImpact": "Phase progression may be affected"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Cannot cancel completed activity",
  "code": "INVALID_STATUS"
}
```

```json
{
  "success": false,
  "error": "Activity has dependent activities that must be cancelled first",
  "code": "HAS_DEPENDENCIES"
}
```

**Validation**:
- Activity must have status="pending" or "in_progress"
- User must have Manager or Owner role
- Check if activity has dependent activities
- Reason required (cannot be empty)

**Backend Processing**:
1. Verify user has Manager/Owner role
2. Verify activity can be cancelled (not completed)
3. Check for dependent activities:
   - If dependencies exist, require confirmation or cascade cancel
4. Update `scheduled_activities` record:
   - status: "cancelled"
   - cancelled_by: userId
   - cancellation_reason: reason
   - cancelled_at: current time
5. Release any reserved inventory for this activity
6. Update production order phase completion calculation
7. Log cancellation in audit trail
8. Return success with impact analysis

**Side Effects**:
- Activity status changes to "cancelled"
- Reserved inventory released
- Phase completion percentage recalculated
- Dependent activities may need review
- Audit log entry created

**Database Tables**:
- **Updates**: `scheduled_activities` (status, cancellation_reason)
- **Updates**: `inventory_items` (release reserved quantities)
- **Updates**: `production_orders` (recalculate completion rate)
- **Creates**: Audit log entry

**UI Workflow**:
```
1. User clicks "Cancel" on activity
2. Confirmation modal: Enter reason
3. If has dependencies: Show warning + option to cascade
4. Call cancelActivity API
5. Show success message
6. Refresh activities list
7. Update phase progress indicators
```

**Cascade Cancellation**:
If activity has dependent activities, UI should offer:
- **Option 1**: Cancel this activity only (dependencies become orphaned)
- **Option 2**: Cancel this activity + all dependent activities (cascade)
- **Option 3**: Reassign dependencies to different activity

---

### Upload Activity Photo

**Endpoint**: `POST /activities/upload-photo`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.uploadPhoto` - TO BE CREATED

**Purpose**: Upload photo during activity execution (plant health monitoring)

#### Bubble API Connector Configuration

**Name**: `uploadActivityPhoto`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/upload-photo`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "photoUrl": "<photoUrl>",
  "photoType": "<photoType>",
  "caption": "<caption>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| photoUrl | text | No | Body | https://cdn.../photo.jpg |
| photoType | text | No | Body | plant_health |
| caption | text | No | Body | Row 3, Plant #25 |

**Photo Types**: plant_health, pest_evidence, area_overview, equipment, other

**Complete Response**:
```json
{
  "success": true,
  "photoId": "photo123...",
  "message": "Foto subida exitosamente",
  "error": "File too large",
  "code": "FILE_TOO_LARGE"
}
```

**Bubble Workflow**:
1. User takes photo (mobile) or uploads (desktop)
2. Upload to file storage (S3, Bubble storage)
3. Call uploadActivityPhoto with URL
4. Photo stored in photos array

---

### Analyze Photos with AI (Batch Pest/Disease Detection)

**Endpoint**: `POST /ai/analyze-photos`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `ai.analyzePhotos` - TO BE CREATED

**Purpose**: **Batch AI analysis** of multiple photos in single call. Uses Google Gemini Vision API to detect pests/diseases across all photos, enriches results with database matches for treatment protocols.

**AI Service**: Google Gemini Vision API (gemini-pro-vision model)

**Key Features**:
- ✅ **Single API call** for all photos (not per-photo)
- ✅ Gemini analyzes all photos in one request
- ✅ Backend enriches detections with pest/disease database matches
- ✅ Returns consolidated results with confidence scores
- ✅ Includes recommended treatments (MIPE/MIRFE protocols)

#### Bubble API Connector Configuration

**Name**: `analyzePhotosWithAI`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/ai/analyze-photos`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "photoUrls": ["<photoUrl1>", "<photoUrl2>", "<photoUrl3>"],
  "facilityId": "<facilityId>",
  "cropType": "<cropType>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| photoUrls | list | No | Body | ["https://cdn.../photo1.jpg", "https://cdn.../photo2.jpg"] |
| facilityId | text | No | Body | fac001... |
| cropType | text | No | Body | cannabis |

**Complete Response**:
```json
{
  "success": true,
  "analysisId": "analysis123...",
  "totalPhotos": 5,
  "photosAnalyzed": 5,
  "detectionsFound": 2,
  "detections": [
    {
      "photoUrl": "https://cdn.../photo3.jpg",
      "detectionId": "det456...",
      "commonName": "Áfido / Aphid",
      "scientificName": "Aphis gossypii",
      "category": "pest",
      "severity": "medium",
      "confidence": 0.87,
      "description": "Pequeños insectos verdes agrupados en brotes tiernos",
      "dbMatch": {
        "found": true,
        "pestDiseaseId": "pest_aphid_gossypii",
        "controlMethod": "Jabón potásico (MIPE) - Aplicar cada 3-5 días",
        "urgency": "medium",
        "affectedCrops": ["cannabis", "vegetables"],
        "preventionMethods": ["Monitoreo regular", "Control biológico con mariquitas"]
      }
    },
    {
      "photoUrl": "https://cdn.../photo5.jpg",
      "detectionId": "det789...",
      "commonName": "Mildiu Polvoriento / Powdery Mildew",
      "scientificName": "Podosphaera macularis",
      "category": "disease",
      "severity": "high",
      "confidence": 0.92,
      "description": "Manchas blancas polvorientas en hojas",
      "dbMatch": {
        "found": true,
        "pestDiseaseId": "disease_powdery_mildew",
        "controlMethod": "Bicarbonato de potasio + aceite vegetal (MIPE)",
        "urgency": "high",
        "affectedCrops": ["cannabis"],
        "preventionMethods": ["Ventilación adecuada", "Evitar exceso humedad"]
      }
    }
  ],
  "photosWithoutDetections": [
    "https://cdn.../photo1.jpg",
    "https://cdn.../photo2.jpg",
    "https://cdn.../photo4.jpg"
  ],
  "processingTime": 3.2,
  "geminiTokensUsed": 1250,
  "message": "Análisis completado exitosamente",
  "error": null,
  "code": null
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Google Gemini API unavailable",
  "code": "AI_SERVICE_ERROR"
}
```

```json
{
  "success": false,
  "error": "Maximum 10 photos per analysis",
  "code": "TOO_MANY_PHOTOS"
}
```

**Response Fields**:
- `success` (boolean)
- `analysisId` (text) - Unique ID for this batch analysis
- `totalPhotos` (number) - Photos sent for analysis
- `photosAnalyzed` (number) - Photos successfully analyzed
- `detectionsFound` (number) - Total detections across all photos
- `detections` (list) - **Array of all detections from all photos**:
  - `photoUrl` (text) - Which photo this detection is from
  - `detectionId` (text) - Unique detection ID
  - `commonName` (text) - Common name (bilingual: Spanish / English)
  - `scientificName` (text) - Scientific name
  - `category` (text) - "pest" | "disease" | "deficiency"
  - `severity` (text) - "low" | "medium" | "high" | "critical"
  - `confidence` (number) - 0-1 confidence score from AI
  - `description` (text) - AI-generated description
  - `dbMatch` (object) - Database enrichment:
    - `found` (boolean) - If match found in pest/disease DB
    - `pestDiseaseId` (text) - Internal DB ID
    - `controlMethod` (text) - MIPE/MIRFE protocol
    - `urgency` (text) - Treatment urgency
    - `affectedCrops` (list) - Crops commonly affected
    - `preventionMethods` (list) - Prevention strategies
- `photosWithoutDetections` (list) - URLs of clean photos
- `processingTime` (number) - Total seconds
- `geminiTokensUsed` (number) - Tokens consumed (for cost tracking)

#### Bubble Workflow

**Single-Click Batch Analysis**:

1. **Trigger**: Button "Analizar con Gemini AI" clicked
2. **Step 1**: Collect all photo URLs from repeating group
   - `photo_repeating_group's list of Photos' image`
3. **Step 2**: Show loading overlay "Gemini está analizando 5 fotos..."
4. **Step 3**: Plugins → analyzePhotosWithAI
   - activityId = `Current Page Activity's _id`
   - photoUrls = `photo_repeating_group's list of Photos' url`
   - facilityId = `Current User's currentFacilityId`
   - cropType = `Current Page Activity's cropType`
5. **Step 4** (Only when `success = true`):
   - Hide loading overlay
   - Show `Result of Step 3's detectionsFound` detections
   - Display detections in repeating group
   - For each detection:
     - Show photo thumbnail
     - Show pest/disease name with confidence badge
     - Show severity indicator (color-coded)
     - Show recommended treatment
     - Checkbox to confirm detection
6. **Step 5**: User reviews detections and selects which to act on
7. **Step 6**: Confirmed detections passed to `completeActivity` call

**UI Display**:
```
┌─────────────────────────────────────────┐
│ ✅ Gemini analizó 5 fotos en 3.2s      │
│ 🐛 2 detecciones encontradas            │
├─────────────────────────────────────────┤
│ Photo 3 🖼️                             │
│ 🐛 Áfido / Aphid                        │
│ Confianza: 87% 🟡 Severidad: Media     │
│ Control: Jabón potásico (MIPE)         │
│ [☑️ Confirmar detección]                │
├─────────────────────────────────────────┤
│ Photo 5 🖼️                             │
│ 🦠 Mildiu Polvoriento                   │
│ Confianza: 92% 🔴 Severidad: Alta      │
│ Control: Bicarbonato + aceite          │
│ [☑️ Confirmar detección]                │
└─────────────────────────────────────────┘
```

#### Backend Processing

**Gemini API Integration**:

1. **Receive Request**: Array of photoUrls, facilityId, cropType
2. **Validate**:
   - Max 10 photos per request (Gemini limit + cost control)
   - Check photoUrls are accessible
   - Validate cropType exists
3. **Prepare Gemini Prompt**:
   ```
   Analyze these [N] photos of [cropType] plants for pests and diseases.
   For each photo with issues, provide:
   - Common name (Spanish/English)
   - Scientific name
   - Category (pest, disease, deficiency)
   - Severity (low, medium, high, critical)
   - Description of what you see
   Return JSON array with photo index and detections.
   ```
4. **Call Gemini Vision API**:
   - Model: `gemini-pro-vision`
   - Send all photos in single request
   - Parse JSON response
5. **Enrich with Database**:
   - For each Gemini detection:
     - Match against `pest_diseases` table (fuzzy match on name)
     - If match found, add:
       - Control method (MIPE/MIRFE protocol)
       - Urgency level
       - Prevention methods
       - Affected crops
6. **Generate detectionIds**: Create unique IDs for tracking
7. **Return Consolidated Response**: All detections with enrichment

**Cost Tracking**:
- Log Gemini API tokens used
- Track per-facility AI usage
- Alert if approaching monthly limits

**Database Tables**:
- **Reads**: `pest_diseases` (for enrichment matching)
- **Writes**: `ai_analysis_logs` (for auditing and cost tracking)

**Performance**:
- Expected processing time: 3-10 seconds for 5 photos
- Timeout: 30 seconds
- Retry logic: 1 retry on Gemini API failure

---

### Create Remediation Activity

**Endpoint**: `POST /activities/create-remediation`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.createRemediation` - TO BE CREATED

**Purpose**: Auto-create remediation activity based on pest detection

#### Bubble API Connector Configuration

**Name**: `createRemediationActivity`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/create-remediation`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productionOrderId": "<productionOrderId>",
  "detectionId": "<detectionId>",
  "scheduledDate": "<scheduledDate>",
  "treatmentMethod": "<treatmentMethod>",
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| productionOrderId | text | No | Body | po123... |
| detectionId | text | No | Body | det456... |
| scheduledDate | text | No | Body | 2025-01-22 |
| treatmentMethod | text | No | Body | neem_oil_spray |
| notes | text | No | Body | Apply at dusk to avoid leaf burn |

**Complete Response**:
```json
{
  "success": true,
  "activityId": "act789...",
  "activityName": "MIPE - Spider Mite Treatment",
  "message": "Actividad de remediación creada",
  "error": "Detection not found",
  "code": "DETECTION_NOT_FOUND"
}
```

**Activity Auto-Configuration**:
- Name: "MIPE - [Pest Name] Treatment" or "MIRFE - [Disease Name] Treatment"
- Description: Auto-populated from pest database
- Required inventory: Treatment materials (neem oil, etc.)
- Assigned role: Operator or Specialist
- Priority: High or Critical (based on severity)

**Bubble Workflow**:
1. After AI detection confirmed by user
2. User clicks "Create Treatment Activity"
3. Pre-filled form with detection details
4. User adjusts date/method if needed
5. Save → Activity added to production order

---

### Add Digital Signature

**Endpoint**: `POST /activities/add-signature`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.addSignature` - TO BE CREATED

**Purpose**: Capture digital signature for activity completion

#### Bubble API Connector Configuration

**Name**: `addDigitalSignature`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/activities/add-signature`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activityId": "<activityId>",
  "signatureData": "<signatureData>",
  "signedBy": "<signedBy>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | Body | act123... |
| signatureData | text | No | Body | data:image/png;base64,iVB... |
| signedBy | text | No | Body | Juan Pérez |

**Complete Response**:
```json
{
  "success": true,
  "signatureUrl": "https://cdn.../signatures/sig123.png",
  "message": "Firma guardada exitosamente",
  "error": "Activity already signed",
  "code": "ALREADY_SIGNED"
}
```

**Bubble Workflow**:
1. User draws signature on canvas (Signature Input plugin)
2. Convert to base64 image
3. Call addDigitalSignature
4. Display confirmation

**Use Cases**:
- Compliance activities
- Quality checks
- Critical operations
- Manager approvals

---

### Generate Activity Report (PDF)

**Endpoint**: `POST /activities/generate-report`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `activities.generateReport` - TO BE CREATED

**Purpose**: Generate PDF report for completed activity

#### Bubble API Connector Configuration

**Name**: `generateActivityReport`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/activities/generate-report`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| activityId | text | No | URL | act123... |

**Complete Response**:
```json
{
  "success": true,
  "reportUrl": "https://cdn.../reports/act123-report.pdf",
  "reportId": "rep789...",
  "generatedAt": "2025-01-21T09:00:00Z",
  "message": "Reporte generado exitosamente"
}
```

**Report Contents**:
- Activity details (name, date, duration)
- QC responses (formatted)
- Photos (embedded)
- Pest detections (if any)
- Inventory consumed
- Digital signature
- Completion notes
- Production order context

**Bubble Usage**:
- Button "Download Report" on completed activity
- Opens PDF in new tab or downloads

---

## IMPLEMENTATION STATUS SUMMARY

### Module Status

**MODULE 24: Production Orders** - 8 endpoints
- ⚠️ Create production order
- ⚠️ Get production orders by facility
- ⚠️ Get production order by ID
- ⚠️ Update production order status
- ⚠️ Approve production order
- ⚠️ Reject production order
- ⚠️ Cancel production order
- ⚠️ Check area availability
- ⚠️ Auto-schedule activities

**MODULE 25: Activity Execution** - 10 endpoints
- ⚠️ Get activities by production order
- ⚠️ Get activity by ID
- ⚠️ Update activity progress
- ⚠️ Complete activity
- ⚠️ Upload activity photo
- ⚠️ Detect pests with AI
- ⚠️ Create remediation activity
- ⚠️ Add digital signature
- ⚠️ Generate activity report

**Total Phase 4 Endpoints**: 18 endpoints (0 implemented, 18 pending)

---

### Convex Files to Create

- `convex/productionOrders.ts` - MODULE 24
- `convex/activities.ts` - MODULE 25
- `convex/scheduling.ts` - Auto-scheduling algorithm (shared with Phase 3)
- `convex/ai.ts` - AI utilities (pest detection, computer vision) (shared with Phase 3)
- `convex/reports.ts` - PDF generation

---

### External Dependencies

**AI Pest Detection**:
- **Option 1**: Google Cloud Vision API
- **Option 2**: Custom trained model (TensorFlow, PyTorch)
- **Option 3**: Third-party pest detection API

**Configuration**:
```
VISION_API_KEY=your-api-key
VISION_API_ENDPOINT=https://vision.googleapis.com/v1
PEST_DATABASE_URL=https://...
```

**PDF Generation**:
- Library: PDFKit, jsPDF, or Puppeteer
- Template engine: Handlebars or React-PDF

---

## ERROR CODES

**Phase 4 Specific Error Codes**:
- `TEMPLATE_NOT_ACTIVE` - Template is inactive
- `AREA_NOT_AVAILABLE` - Area has conflicting orders
- `AREA_CAPACITY_EXCEEDED` - Plant count > area capacity
- `ORDER_NOT_FOUND` - Production order ID doesn't exist
- `HAS_PENDING_ACTIVITIES` - Cannot complete order with pending activities
- `INSUFFICIENT_PERMISSIONS` - User role insufficient for action
- `ORDER_ALREADY_STARTED` - Cannot reschedule in-progress order
- `ACTIVITY_NOT_FOUND` - Activity ID doesn't exist
- `QC_REQUIRED` - QC responses required before completion
- `INSUFFICIENT_STOCK` - Not enough inventory to consume
- `AI_SERVICE_ERROR` - Computer vision API unavailable
- `DETECTION_NOT_FOUND` - Detection ID doesn't exist
- `ALREADY_SIGNED` - Activity already has signature
- `FILE_TOO_LARGE` - Photo exceeds size limit (10MB)

For complete error handling, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md).

---

## BUBBLE DEVELOPER NOTES

### Production Order Creation

**Multi-Step Process**:
1. Select template (dropdown with preview)
2. Select area (with availability check)
3. Set start date (calendar with conflict warnings)
4. Set plant count (validate against area capacity)
5. Review projected timeline and inventory
6. Submit for approval (if Manager+) or create directly (if Owner)

**Real-Time Validation**:
- Check area availability as dates change
- Show capacity warnings
- Preview projected end date
- Calculate inventory requirements

### Activity Execution Interface

**Multi-Tab Design**:
1. **General Tab**: Basic info, start/complete buttons
2. **Quality Check Tab**: Dynamic QC form (HTML rendering)
3. **Photos Tab**: Upload/capture photos, AI analysis button
4. **Signature Tab**: Digital signature canvas

**Auto-Save**:
- Save progress every 30 seconds
- Save on tab change
- Show "Saving..." indicator
- Confirm unsaved changes on navigation

**Photo Upload & AI**:
- Mobile: Use device camera
- Desktop: File upload
- After upload: Show "Analyze with AI" button
- AI processing: 2-5 seconds with spinner
- Results: List detections with confidence %
- User confirms/rejects each detection
- Option to create treatment activity

**QC Form Rendering**:
- HTML element with dynamic content
- Apply custom CSS for consistency
- Form validation before completion
- Save responses as JSON

### Progress Tracking

**Visualizations**:
- Overall completion % (progress bar)
- Phase-by-phase progress (accordion with bars)
- Activities timeline (Gantt chart or calendar)
- Inventory consumption (actual vs projected chart)

**Color Coding**:
- Pending: Gray
- In Progress: Blue
- Completed: Green
- Overdue: Red
- Skipped: Orange

---

## REAL-TIME UPDATES & DATA POLLING

**Overview**: Phase 4 is the most data-volatile phase. Production orders change status continuously, activities complete throughout the day, and multiple users track progress simultaneously. This requires aggressive polling for critical data.

### Polling Requirements by Module

| Module | Data Type | Volatility | Recommended Polling | Use Case |
|--------|-----------|-----------|-------------------|----------|
| Production Orders (List) | Order Status | High | 30-60 seconds | Track completion %, overdue activities, status changes |
| Production Orders (Detail) | Order Progress | **Very High** | **15-30 seconds** | Dashboard showing real-time progress, phases, activities |
| Activities List | Activity Status | **Very High** | **15-30 seconds** | Activities marked complete by operators throughout day |
| Activity Detail/Execution | Form Data & Photos | Medium | 30-45 seconds | Auto-save photos, QC forms, progress updates |
| Area Availability | Area Occupancy | High | 60 seconds | Check capacity during order creation |

### Implementation Patterns

#### Pattern 1: Aggressive Polling for Production Dashboard (CRITICAL)

**Use When**: Manager/Supervisor viewing active production orders.

**Workflow**:
```javascript
// Production Orders List Page (Active Orders)
Workflow: Page Load
  → Step 1: API getProductionOrdersByFacility (status=active)
  → Step 2: Set repeating group data source
  → Step 3: Store order count in state

Workflow: Every 20 seconds (aggressive interval)
  → IF Page is visible AND (user is manager OR supervisor):
    → API: getProductionOrdersByFacility (status=active)
    → Compare with stored data
    → IF any order status changed:
      → Update repeating group
      → Show subtle notification "Order status changed"
    → Update progress % in real-time
    → Highlight overdueActivities changes
```

**Cost**: 3 API calls per minute = 180 calls/hour per user
**Latency**: 0-20 seconds (shows changes within 20s)
**Justification**: Managers need to see issues immediately for intervention

---

#### Pattern 2: Real-Time Order Detail Page (Supervisor Monitoring)

**Use When**: Supervisor viewing specific active production order detail.

**Workflow**:
```javascript
// Production Order Detail Page (Supervisor Dashboard)
Workflow: Page Load
  → Step 1: API getProductionOrderById
  → Step 2: Display order, phases, activities, progress
  → Step 3: Set refresh timer

Workflow: Every 15 seconds (very aggressive - critical path)
  → IF Page is visible:
    → API: getProductionOrderById
    → Check for status changes
    → Check for phase progress changes
    → Check for new overdueActivities
    → IF progress % changed:
      → Smoothly animate progress bar
      → Update activity counts
    → IF new overdueActivities:
      → Highlight red section
      → Show alert notification
    → IF order status changed (to completed/cancelled):
      → Stop polling
      → Show completion summary

Element: "Refresh Now" Button
Workflow: Click
  → Immediately call getProductionOrderById
  → Update all display elements
```

**Cost**: 4 API calls per minute = 240 calls/hour per user
**Latency**: 0-15 seconds (real-time monitoring)
**Critical Use Case**: Supervisors need immediate visibility to oversee operations

---

#### Pattern 3: Activity Status Updates (Field Operator Tracking)

**Use When**: Field operator executing activities, needs to see peer activity status.

**Workflow**:
```javascript
// Activities List Page (In-Progress Activities)
Workflow: Page Load
  → Step 1: API getActivitiesByOrder (status=in_progress OR pending)
  → Step 2: Filter by today/upcoming dates
  → Step 3: Set repeating group data source

Workflow: Every 30 seconds
  → IF Page is visible:
    → API: getActivitiesByOrder
    → Update status for completed activities
    → Reorder list by priority
    → Remove completed activities from view
    → Show toast "Activity X marked complete by Juan"
```

**Cost**: 2 API calls per minute = 120 calls/hour per user
**Latency**: 0-30 seconds
**Use Case**: Operators see when peer activities complete

---

#### Pattern 4: Smart Activity Detail Page (Executing Activity)

**Use When**: Operator actively executing a single activity.

**Workflow**:
```javascript
// Activity Execution Page (User actively working)

Workflow: Page Load
  → API: getActivityById
  → Load QC form/photos
  → Start auto-save timer

Workflow: Every 30 seconds (auto-save)
  → IF Page is visible AND (form has changes):
    → Call saveActivityProgress (updates auto-save timestamp)
    → Show "Saving..." then "Saved at 14:32"

Element: Photo Upload
Workflow: Photo uploaded
  → Immediately show in gallery
  → Auto-save activity progress
  → Option to "Analyze with AI" appears immediately

Element: QC Form
Workflow: Any field changed
  → Mark as "unsaved" (visual indicator)
  → Auto-save after 30 seconds of no changes
  → Show validation errors in real-time

Workflow: Complete Activity Button clicked
  → Final save of all data
  → API: completeActivity
  → Emit notification visible to Supervisor
```

**Cost**: 1 auto-save call every 30s = 120 calls/hour per operator (when actively working)
**Latency**: Up to 30 seconds for progress save
**Design**: Non-blocking auto-save (operator doesn't wait)

---

#### Pattern 5: Supervisor Monitoring Board (Multiple Active Orders)

**Use When**: Supervisor viewing dashboard with multiple simultaneous active orders.

**Workflow**:
```javascript
// Production Monitoring Dashboard
Workflow: Page Load
  → Step 1: API getProductionOrdersByFacility (status=active, limit=10)
  → Step 2: Display cards/grid for each order
  → Step 3: Calculate average completion % and alerts

Workflow: Every 30 seconds
  → IF Page is visible:
    → API: getProductionOrdersByFacility (status=active, limit=10)
    → Update each order card:
      → Progress % animate
      → Overdue count change
      → Status badge updates
    → Recalculate overall metrics:
      → Total completion % (weighted)
      → Count of overdue activities across all orders
    → Highlight orders with critical issues (>5 overdue)
```

**Cost**: 2 API calls per minute = 120 calls/hour
**Latency**: 0-30 seconds
**UI Design**: Cards update smoothly without full page reload

---

### AI Processing in Phase 4 (Special Case)

**Challenge**: AI pest detection takes 2-5 seconds. Multiple photos per activity.

**Solution - Blocking Calls with Progress**:

```javascript
// Pest Detection Workflow

Element: "Analyze with AI" Button (on photo)
Workflow: Click
  → Show loading modal with spinner
  → "Analyzing photo for pests... (processing)"
  → Call API: analyzePhotoForPests
  → Wait for response (blocking, timeout 10s)
  → Show results:
    - List of detected pests with confidence
    - Bounding boxes overlaid on image
    - Treatment recommendations
  → User confirms/rejects each detection
  → Option to create remediation activity

Cost: 1 per photo analysis
Response Time: 2-5 seconds
No polling needed (HTTP blocking call handles it)
```

---

### Multi-User Collaboration Patterns

**Scenario**: Multiple operators working on same production order (different activities)

**Solution - Optimized Polling**:

```javascript
// Production Order with Multiple Activities

Operator A: Activity #1 - Riego → in_progress (saves every 30s)
Operator B: Activity #2 - Inspección → in_progress (saves every 30s)
Supervisor: Viewing order detail (polls every 15s)

When Operator A completes:
  → API: completeActivity (Activity #1)
  → Supervisor's next poll (max 15s later) shows:
    - Progress % increased
    - Activity #1 marked complete
    - Activity #3 now eligible to start

When Operator B uploads photo + AI analysis:
  → Auto-saves progress
  → Supervisor's next poll shows updated photo/analysis
  → Could trigger automatic remediation activity creation
```

**Cost Analysis**:
- Operator A: 120 calls/hour (auto-save only)
- Operator B: 120 calls/hour (auto-save only)
- Supervisor: 240 calls/hour (aggressive monitoring)
- **Total: 480 calls/hour for 3-user team**
- Per user: ~160 calls/hour (acceptable for critical operations)

---

### Data Freshness vs Cost Tradeoff

| Scenario | Pattern | Interval | Calls/Hour | Latency | Cost Impact |
|----------|---------|----------|-----------|---------|-------------|
| Manager Monitoring | Aggressive | 20s | 180 | 0-20s | High ($) |
| Supervisor Detail | Very Aggressive | 15s | 240 | 0-15s | **Very High ($$)** |
| Operator Executing | Auto-save | 30s | 120 | 0-30s | Medium |
| Field Team View | Standard | 30s | 120 | 0-30s | Medium |
| Admin Oversight | Moderate | 60s | 60 | 0-60s | Low |
| Multi-Order Board | Standard | 30s | 120 | 0-30s | Medium |

**Recommended for Phase 4**:
- **Active Order List (Managers)**: 30s polling (~60 calls/hour)
- **Order Detail Page (Supervisors)**: 30s polling (~60 calls/hour) or 15s if critical
- **Activity Execution (Operators)**: 30s auto-save only (~120 calls/hour)
- **Multi-Order Dashboard**: 30s polling (~120 calls/hour)
- **Field Team Activity List**: 30s polling (~120 calls/hour)

**Optional High-Performance**:
- Supervisor viewing critical order: 15s polling (~240 calls/hour) - only when needed
- Production emergency: 10s polling (~360 calls/hour) - temporary

---

### Optimization Techniques

#### 1. Smart Polling (Only Changed Data)

```javascript
// Minimize data transfer
API getProductionOrderSummary (lightweight)
Returns: {
  orderId, status, completionRate, overdueCount,
  lastModified timestamp
}

Workflow: Every 30 seconds
  → Call getProductionOrderSummary (lightweight)
  → IF lastModified > currentTimestamp:
    → Call getProductionOrderById (full details)
  → ELSE:
    → Skip full refresh
```

**Benefit**: 50-70% fewer API calls for unchanged data

#### 2. Conditional Polling

```javascript
// Only poll when necessary
Workflow: Every 30 seconds
  → IF Page is visible AND (
    →   (currentUser.role == "supervisor") OR
    →   (order.status == "active") OR
    →   (order.overdueActivities > 0)
    → ):
    → Continue polling
  → ELSE:
    → Stop polling (reduce cost for passive viewers)
```

**Benefit**: Users viewing historical/completed orders don't incur cost

#### 3. Batch Requests

```javascript
// Multiple orders in one call
API getProductionOrdersSummary (list view)
Returns: [{id, status, completionRate, overdue}, ...]

One API call = data for 10 orders
Saves: 9 API calls per poll cycle
```

**Benefit**: Dashboard with 10 active orders = 12 calls/hour instead of 120

---

### Bubble Developer Guidance

**Critical Implementation Notes**:

1. **Progressive Enhancement**:
   - ✅ Load page without polling first
   - ✅ After data loads, start polling timer
   - ✅ Show "Updates every 30 seconds" indicator
   - ✅ Stop polling when navigating away

2. **User-Visible Indicators**:
   - ✅ Show "Last updated: 2:45 PM" timestamp
   - ✅ Subtle glow effect when data refreshes
   - ✅ Toast notifications for critical changes (overdue activities)
   - ❌ Don't distract with every update

3. **Performance**:
   - ✅ Debounce rapid polling requests
   - ✅ Use data comparison to avoid unnecessary re-renders
   - ✅ Cache responses for 5 seconds max
   - ❌ Don't poll faster than 15 seconds (avoid abuse)

4. **Error Handling**:
   - ✅ If poll fails, retry 3 times with backoff
   - ✅ Show "Connection lost, will retry..." message
   - ✅ After 3 failures, show "Refresh manually" button
   - ✅ Log polling failures for debugging

5. **Cost Control**:
   - 🎯 Target: 120-180 calls/hour per active supervisor
   - 🎯 Target: 60-120 calls/hour per field operator
   - ⚠️ If exceeding 300 calls/hour per user, reduce interval
   - ⚠️ Monitor Convex analytics for usage patterns

6. **Testing Multi-User Scenarios**:
   - [ ] 5 operators + 2 supervisors polling simultaneously
   - [ ] Simulate activity completion while polling
   - [ ] Verify photo upload triggers immediate supervisor update
   - [ ] Test AI analysis doesn't break polling logic
   - [ ] Verify page hide/show resumes/pauses polling correctly

---

### Testing Real-Time Behavior

**Test Checklist**:
- [ ] Order completion rate updates every 30 seconds
- [ ] New overdue activities appear within 30 seconds
- [ ] Activity status changes visible in less than 1 minute
- [ ] Multiple operators editing same order don't conflict
- [ ] Photo upload immediately available for AI analysis
- [ ] AI analysis doesn't block activity editing
- [ ] Supervisor sees all activity updates in real-time
- [ ] Polling stops when page hidden/hidden tab
- [ ] Polling resumes when page becomes visible
- [ ] Auto-save doesn't interfere with operator workflow
- [ ] Network latency doesn't cause duplicate updates
- [ ] Cost monitoring shows expected call volumes

---

## TESTING CHECKLIST

Phase 4 Production Execution (0/18 endpoints ready):

**Production Orders**:
- [ ] Can create order from template
- [ ] Area availability check prevents conflicts
- [ ] Activities auto-scheduled correctly (all types)
- [ ] Order requires approval (Supervisor role)
- [ ] Manager can approve order
- [ ] Manager can reject order with reason
- [ ] Approval changes status to active
- [ ] Can check area availability for date range
- [ ] Conflicting orders displayed correctly
- [ ] Cannot reschedule in-progress order
- [ ] Can cancel active order (Manager+)

**Activity Execution**:
- [ ] Activities list shows correct status
- [ ] Can start activity (status → in_progress)
- [ ] Auto-save works every 30 seconds
- [ ] QC form renders from HTML
- [ ] Can upload photos
- [ ] AI detects pests in photo
- [ ] Detections show confidence scores
- [ ] Can create remediation activity from detection
- [ ] Inventory consumption logged on completion
- [ ] Dependent activities schedule after completion
- [ ] Digital signature captures correctly
- [ ] PDF report generates with all data

**AI Integration**:
- [ ] Pest detection API connects
- [ ] Detections match internal database
- [ ] Confidence scores reasonable (>0.7 for positive)
- [ ] Bounding boxes display correctly on image
- [ ] Treatment recommendations accurate
- [ ] Remediation activities pre-filled correctly

**Workflow Integration**:
- [ ] Completing activity updates order progress
- [ ] Phase progress calculates correctly
- [ ] All activities completed → can complete order
- [ ] Actual yield recorded on completion
- [ ] Inventory consumption tracked accurately

---

**Status**: Phase 4 specification complete
**Ready Endpoints**: 0/18 (0% complete)
**Next Steps**:
1. Implement auto-scheduling algorithm (complex)
2. Integrate computer vision API for pest detection
3. Implement PDF generation
4. Test activity execution workflows
5. Implement Bubble UI with multi-tab activity execution
6. Move to Phase 5 (Advanced Features)

---

**Last Updated**: 2025-01-19
**Version**: 2.0 (New - part of 5-phase restructure)
