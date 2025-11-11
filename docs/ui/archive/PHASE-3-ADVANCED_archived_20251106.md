# PHASE 3: ADVANCED UI REQUIREMENTS

**Modules 14-17** | Compliance, analytics, mobile, and integrations
**Status**: Future (post-Phase 2 completion)
**Duration**: As-needed and periodic use
**Primary Users**: COMPANY_OWNER, FACILITY_MANAGER, VIEWER

---

## Overview

Phase 3 adds reporting, compliance, cross-platform experience, and ecosystem integration. Transforms operational data (from Phase 2) into regulatory compliance artifacts, business intelligence dashboards, and mobile workflows. Also enables third-party integrations for broader ecosystem.

**Total Pages**: 15-20 screens
**User Flow**: Non-linear, analytics-heavy
**Key Workflows**: Data export → compliance reports → performance dashboards → mobile field ops

---

## MODULE 14: Compliance & Reporting

### Purpose
Track regulatory requirements (by region and crop type), generate compliance reports, manage certifications, audit trail visibility.

### Pages

**1. Compliance Events Dashboard**
```
┌────────────────────────────┐
│   COMPLIANCE OVERVIEW      │
│   North Farm               │
├────────────────────────────┤
│ REQUIRED COMPLIANCE ITEMS: │
│                            │
│ Cannabis - Colombia:       │
│ • Inventory reports:       │
│   Due: 2025-11-15 [⚠ 18d] │
│   [View Template]          │
│                            │
│ • Facility audit:          │
│   Due: 2025-12-01 [  28d] │
│   [Schedule]               │
│                            │
│ • Pesticide usage log:     │
│   Auto-generated from      │
│   activities [View]        │
│                            │
│ CERTIFICATES:              │
│ • Organic (exp: 2026-03)   │
│   [View] [Renew]           │
│                            │
│ PAST REPORTS:              │
│ • Q3 Inventory Report [DL] │
│ • Q2 Facility Audit [DL]   │
│                            │
│ [Generate Report] [Export] │
└────────────────────────────┘
```

**2. Generate Compliance Report**
```
┌────────────────────────────┐
│  COMPLIANCE REPORT         │
│  Generator                 │
├────────────────────────────┤
│ Report Type:               │
│ [Inventory Report ▼]       │
│                            │
│ Reporting Period:          │
│ From: [2025-09-01]         │
│ To:   [2025-09-30]         │
│                            │
│ Include:                   │
│ ☑ Stock levels at start    │
│ ☑ Purchases (by supplier)  │
│ ☑ Consumption logs         │
│ ☑ Batch tracking           │
│ ☑ Waste/disposal records   │
│                            │
│ Format:                    │
│ ○ PDF (official document) │
│ ○ Excel (editable)         │
│ ○ JSON (system import)     │
│                            │
│ Certification Required:    │
│ ○ Digital signature        │
│ ○ Manager approval         │
│                            │
│ [Preview] [Generate]       │
└────────────────────────────┘
```

**3. Audit Trail / Activity Log**
```
┌────────────────────────────┐
│   AUDIT TRAIL              │
│   Facility: North Farm     │
├────────────────────────────┤
│ Filter: [All Activities▼]  │
│ Date Range: [Last 30 days] │
│ User: [All ▼]              │
│                            │
│ DATE    TIME   ACTION      │
│ 10/27   09:30  Log Watering│
│         User: John Doe     │
│         Batch: B-2025-001  │
│         Water: 100 L       │
│         [View Details]     │
│                            │
│ 10/27   08:15  QC Check    │
│         User: Mary Smith   │
│         Result: PASS       │
│         [View Details]     │
│                            │
│ 10/26   14:00  Batch moved │
│         to Vegetative      │
│         by: John Doe       │
│         [View Details]     │
│                            │
│ 10/26   10:30  Material    │
│         consumed (Nutrient)│
│         Qty: 10 units      │
│                            │
│ [Export Audit Log] [Print] │
└────────────────────────────┘
```

**4. Certifications Management**
```
┌────────────────────────────┐
│   CERTIFICATIONS           │
│   Facility: North Farm     │
├────────────────────────────┤
│ [+ Add Certificate]        │
│                            │
│ ACTIVE CERTIFICATES:       │
│ Organic (IFOAM)            │
│ Expires: 2026-03-15        │
│ Issued: 2023-03-15         │
│ [View PDF] [Renew] [Delete]│
│ Status: ✓ Valid (135d)     │
│                            │
│ Cannabis License           │
│ Expires: 2025-12-31        │
│ Issued: 2024-01-01         │
│ [View PDF] [Renew] [Delete]│
│ Status: ⚠ Expiring (65d)   │
│                            │
│ EXPIRED CERTIFICATES:      │
│ Previous Organic Cert      │
│ Expired: 2023-03-14        │
│ [View Archive]             │
│                            │
│ [Upload New Certificate]   │
└────────────────────────────┘
```

### Key Data Flow
- **Inputs**: Compliance requirement selection, report period, format preference, digital signature
- **Outputs**: Compliance report (PDF/Excel), audit trail export, certification records
- **Auto-Synced**: Inventory, activities, QC results auto-populate reports

### Database Tables
- **Write**:
  - `compliance_events` → Track regulatory events (inspections, violations, audits)
  - `certificates` → Store licenses, permits, certifications
  - `media_files` → Store report exports and certificate documents
- **Read**:
  - `activities` → Audit trail of all operations
  - `inventory_items` → Inventory reports
  - `pest_disease_records` → Pesticide usage logs
  - `production_orders` → Production tracking
  - `batches` → Batch tracking for traceability
  - `quality_check_templates` → QC compliance records
  - `companies` → Regulatory framework by region

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/compliance/get-events
Body: { "facilityId": "f78ghi..." }
Response: {
  "events": [
    {
      "id": "comp123",
      "eventType": "inspection",
      "eventCategory": "ica",
      "title": "Annual ICA Inspection",
      "status": "open",
      "dueDate": 1732924800000,
      "daysUntilDue": 18,
      "severity": "medium",
      "assignedTo": "user123"
    },
    {
      "id": "comp124",
      "eventType": "permit",
      "title": "Facility License Renewal",
      "status": "completed",
      "completionDate": 1728000000000
    }
  ]
}
```

```
POST https://[your-deployment].convex.site/compliance/generate-report
Body: {
  "reportType": "inventory_report",
  "facilityId": "f78ghi...",
  "startDate": 1725148800000,
  "endDate": 1727827200000,
  "includeOptions": {
    "stockLevels": true,
    "purchases": true,
    "consumption": true,
    "batchTracking": true,
    "wasteDisposal": true
  },
  "format": "pdf",
  "requireSignature": true
}
Response: {
  "success": true,
  "reportId": "report456...",
  "reportUrl": "https://storage.../reports/inventory_Q3_2025.pdf",
  "generatedAt": 1730073600000,
  "summary": {
    "totalItems": 45,
    "totalValue": 125000000,
    "batchesTracked": 12
  },
  "message": "Reporte generado exitosamente"
}
```

```
GET https://[your-deployment].convex.site/compliance/get-audit-trail
Body: {
  "facilityId": "f78ghi...",
  "startDate": 1727827200000,
  "endDate": 1730505600000,
  "activityTypes": ["watering", "feeding", "harvest", "movement"],
  "userId": null
}
Response: {
  "activities": [
    {
      "id": "act777",
      "timestamp": 1730073600000,
      "activityType": "watering",
      "performedBy": "John Doe",
      "entityType": "batch",
      "entityId": "batch001",
      "details": {
        "materialsUsed": [{ "product": "Water", "quantity": 100, "unit": "L" }],
        "notes": "Plant color good"
      }
    },
    ...
  ],
  "totalActivities": 324,
  "exportUrl": "https://storage.../audit_trail_export.xlsx"
}
```

```
POST https://[your-deployment].convex.site/compliance/add-certificate
Body: {
  "facilityId": "f78ghi...",
  "certificateName": "Organic Certification",
  "certificateType": "certification",
  "issuingAuthority": "IFOAM",
  "certificateNumber": "ORG-2025-12345",
  "issuedDate": 1711929600000,
  "expiryDate": 1774915200000,
  "isRenewable": true,
  "renewalNoticeDays": 90,
  "documentUrl": "https://storage.../organic_cert.pdf"
}
Response: {
  "success": true,
  "certificateId": "cert789...",
  "renewalDate": 1767139200000,
  "message": "Certificado agregado exitosamente"
}
```

```
GET https://[your-deployment].convex.site/compliance/get-certificates
Body: {
  "facilityId": "f78ghi...",
  "status": "valid"
}
Response: {
  "certificates": [
    {
      "id": "cert789",
      "name": "Organic Certification",
      "type": "certification",
      "status": "valid",
      "expiryDate": 1774915200000,
      "daysUntilExpiry": 135,
      "documentUrl": "https://storage.../organic_cert.pdf",
      "requiresRenewal": false
    },
    {
      "id": "cert790",
      "name": "Cannabis License",
      "type": "license",
      "status": "expiring_soon",
      "expiryDate": 1735689600000,
      "daysUntilExpiry": 65,
      "requiresRenewal": true
    }
  ]
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `compliance.getEvents` (query)
- `compliance.createEvent` (mutation)
- `compliance.updateEvent` (mutation)
- `compliance.generateReport` (mutation) - generates PDF/Excel reports
- `compliance.getAuditTrail` (query)
- `compliance.exportAuditTrail` (mutation)
- `certificates.add` (mutation)
- `certificates.getByFacility` (query)
- `certificates.update` (mutation)
- `certificates.checkExpiry` (query) - automated expiry checks

### Notes
- 🔴 **Required**: Audit trail, basic compliance export capability
- 🟡 **Important**: Automated report generation (reduces manual work)
- 🟢 **Nice-to-have**: Digital signature, reminder system for upcoming deadlines
- All historical data retrievable for compliance (never deleted, marked archived)
- Regulatory framework varies by crop and region (cannabis stricter than coffee)
- Certificate renewal notifications sent 90 days before expiry
- Reports stored in `media_files` table with category = 'compliance_report'

---

## MODULE 15: Analytics & Business Intelligence

### Purpose
Transform operational data into insights. Dashboards show KPIs (yield per area, resource consumption, time-to-harvest), trends, and performance comparisons.

### Pages

**5. Analytics Dashboard**
```
┌──────────────────────────────┐
│   FARM ANALYTICS             │
│   North Farm - October 2025  │
├──────────────────────────────┤
│                              │
│ KEY METRICS (this month):    │
│ ┌──────────┬─────────────┐   │
│ │ Batches  │ 6 active    │   │
│ │ Completed│ 3 harvested │   │
│ │ Total Yld│ 108 kg      │   │
│ └──────────┴─────────────┘   │
│                              │
│ YIELD TRENDS:                │
│ [Graph: Sep-98kg Oct-108kg]  │
│ Avg: 100kg ↑ 8% vs Sept      │
│                              │
│ CONSUMPTION:                 │
│ Nutrient A: 245 units        │
│ Water: 4200 L                │
│ Cost per kg: $125 [▼ 5%]     │
│                              │
│ TIME-TO-HARVEST:             │
│ Avg: 18 weeks (target 20)    │
│ [✓ Better than target]       │
│                              │
│ [View Details] [Export]      │
└──────────────────────────────┘
```

**6. Detailed Performance Report**
```
┌──────────────────────────────┐
│   YIELD ANALYSIS             │
│   Cannabis (all batches)     │
├──────────────────────────────┤
│ Time Period: Last 6 months   │
│ [Change Range ▼]             │
│                              │
│ HARVEST DATA:                │
│ Batch-001: 35 kg (target 30) │
│ Batch-002: 38 kg (target 30) │
│ Batch-003: 32 kg (target 30) │
│ Batch-004: 29 kg (target 30) │
│ Average: 33.5 kg ↑ 12% vs y/ │
│                              │
│ FACTORS INFLUENCING YIELD:   │
│ • Nutrient timing (positive) │
│ • Light cycle optimization   │
│ • Humidity control (weak)    │
│                              │
│ CULTIVAR COMPARISON:         │
│ Cherry AK:   34 kg avg       │
│ White Widow: 35 kg avg       │
│ Green Crack: 32 kg avg       │
│                              │
│ AREA PERFORMANCE:            │
│ Veg Room 1: 34.2 kg avg      │
│ Veg Room 2: 33.8 kg avg      │
│ [Rooms performing similarly] │
│                              │
│ [Download Report] [Compare]  │
└──────────────────────────────┘
```

**7. Resource Efficiency Dashboard**
```
┌──────────────────────────────┐
│   RESOURCE OPTIMIZATION      │
│   North Farm                 │
├──────────────────────────────┤
│                              │
│ COST PER KG:                 │
│ Nutrients:   $45 (Sep: $48)  │
│ Water:       $8  (Sep: $10)  │
│ Labor:       $60 (Sep: $65)  │
│ Misc:        $12 (Sep: $12)  │
│ ────────────────────────     │
│ Total:      $125 per kg      │
│                              │
│ CONSUMPTION TRENDS:          │
│ Nutrient A: 245u (trend ↑)   │
│ Nutrient B: 189u (trend ←)   │
│ Nutrient C: 92u  (trend ↓)   │
│ Water:     4200L (trend ↑)   │
│                              │
│ EFFICIENCY SCORE: 8.2/10     │
│ [Below average for crop type]│
│                              │
│ RECOMMENDATIONS:             │
│ • Reduce Nutrient A dosage   │
│ • Optimize watering schedule │
│ • Consider bulk purchasing   │
│                              │
│ [View Detailed Costs]        │
└──────────────────────────────┘
```

**8. Comparative Analytics** (multiple facilities/periods)
```
┌──────────────────────────────┐
│   MULTI-FACILITY COMPARISON  │
│   Oct 2025                   │
├──────────────────────────────┤
│ Facilities: [North Farm ✓]   │
│             [South Farm  ✓]  │
│                              │
│ Metric: [Yield per sqm ▼]    │
│                              │
│ North Farm:    1.85 kg/sqm   │
│ South Farm:    1.92 kg/sqm   │
│ Company Avg:   1.88 kg/sqm   │
│ [South Farm leading by 3.7%] │
│                              │
│ TIME-TO-HARVEST:             │
│ North Farm:    18 weeks      │
│ South Farm:    17 weeks      │
│ Difference:    -1 week       │
│ [South Farm 5.6% faster]     │
│                              │
│ COST EFFICIENCY:             │
│ North Farm:    $125/kg       │
│ South Farm:    $118/kg       │
│ Difference:    -$7           │
│                              │
│ [Export Comparison]          │
└──────────────────────────────┘
```

### Key Data Flow
- **Inputs**: Selectable time periods, facilities, metrics, filters
- **Outputs**: Dashboard visualizations, detailed reports, comparative analytics
- **Data Sources**: All Phase 1-2 operational data (activities, harvests, consumption, yields)

### Database Tables
- **Read**:
  - `production_orders` → Get order data and completion status
  - `batches` → Calculate yields and batch performance
  - `activities` → Analyze activity patterns and timing
  - `inventory_items` → Track consumption and costs
  - `facilities` → Multi-facility comparisons
  - `areas` → Yield per area analysis
  - `cultivars` → Cultivar performance comparison
- **Write**:
  - (optional: `analytics_snapshots` for caching trend data)

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/analytics/get-dashboard
Body: {
  "facilityId": "f78ghi...",
  "timeframe": "month",
  "month": 10,
  "year": 2025
}
Response: {
  "metrics": {
    "activeBatches": 6,
    "completedBatches": 3,
    "totalYield": 108,
    "yieldUnit": "kg",
    "avgYield": 36,
    "targetYield": 30,
    "yieldVsTarget": 120
  },
  "trends": {
    "yieldTrend": [
      { "month": "Sep", "yield": 98 },
      { "month": "Oct", "yield": 108 }
    ],
    "yieldChange": 10.2,
    "yieldChangePercent": 10.4
  },
  "consumption": {
    "nutrientA": { "quantity": 245, "unit": "units" },
    "water": { "quantity": 4200, "unit": "L" }
  },
  "costPerKg": {
    "nutrients": 45000,
    "water": 8000,
    "labor": 60000,
    "misc": 12000,
    "total": 125000,
    "currency": "COP"
  },
  "timeToHarvest": {
    "average": 18,
    "target": 20,
    "unit": "weeks",
    "performance": "better"
  }
}
```

```
POST https://[your-deployment].convex.site/analytics/get-yield-analysis
Body: {
  "facilityId": "f78ghi...",
  "cropTypeId": "crop123",
  "startDate": 1712016000000,
  "endDate": 1730073600000
}
Response: {
  "summary": {
    "batchCount": 4,
    "avgYield": 33.5,
    "minYield": 29,
    "maxYield": 38,
    "targetYield": 30,
    "avgVsTarget": 112,
    "unit": "kg"
  },
  "batches": [
    { "id": "batch001", "yield": 35, "target": 30, "vsTarget": 117 },
    { "id": "batch002", "yield": 38, "target": 30, "vsTarget": 127 },
    { "id": "batch003", "yield": 32, "target": 30, "vsTarget": 107 },
    { "id": "batch004", "yield": 29, "target": 30, "vsTarget": 97 }
  ],
  "factorsInfluencingYield": [
    { "factor": "nutrient_timing", "impact": "positive" },
    { "factor": "light_cycle_optimization", "impact": "positive" },
    { "factor": "humidity_control", "impact": "weak" }
  ],
  "cultivarComparison": [
    { "cultivar": "Cherry AK", "avgYield": 34 },
    { "cultivar": "White Widow", "avgYield": 35 },
    { "cultivar": "Green Crack", "avgYield": 32 }
  ],
  "areaPerformance": [
    { "area": "Veg Room 1", "avgYield": 34.2 },
    { "area": "Veg Room 2", "avgYield": 33.8 }
  ]
}
```

```
GET https://[your-deployment].convex.site/analytics/get-resource-efficiency
Body: { "facilityId": "f78ghi...", "timeframe": "month" }
Response: {
  "costPerKg": {
    "nutrients": 45000,
    "water": 8000,
    "labor": 60000,
    "misc": 12000,
    "total": 125000,
    "previousMonth": 132000,
    "change": -5.3,
    "currency": "COP"
  },
  "consumptionTrends": [
    { "product": "Nutrient A", "quantity": 245, "trend": "up" },
    { "product": "Nutrient B", "quantity": 189, "trend": "stable" },
    { "product": "Nutrient C", "quantity": 92, "trend": "down" },
    { "product": "Water", "quantity": 4200, "trend": "up", "unit": "L" }
  ],
  "efficiencyScore": {
    "score": 8.2,
    "maxScore": 10,
    "benchmark": 7.8,
    "status": "above_average"
  },
  "recommendations": [
    "Reduce Nutrient A dosage by 10%",
    "Optimize watering schedule to reduce water usage",
    "Consider bulk purchasing for cost savings"
  ]
}
```

```
POST https://[your-deployment].convex.site/analytics/compare-facilities
Body: {
  "facilityIds": ["f78ghi...", "f99jkl..."],
  "metric": "yield_per_sqm",
  "timeframe": "month"
}
Response: {
  "comparison": [
    {
      "facilityId": "f78ghi",
      "facilityName": "North Farm",
      "yieldPerSqm": 1.85,
      "timeToHarvest": 18,
      "costPerKg": 125000
    },
    {
      "facilityId": "f99jkl",
      "facilityName": "South Farm",
      "yieldPerSqm": 1.92,
      "timeToHarvest": 17,
      "costPerKg": 118000
    }
  ],
  "companyAverage": {
    "yieldPerSqm": 1.88,
    "timeToHarvest": 17.5,
    "costPerKg": 121500
  },
  "leader": {
    "facilityId": "f99jkl",
    "facilityName": "South Farm",
    "leadBy": 3.7
  },
  "insights": [
    "South Farm leading by 3.7% in yield per sqm",
    "South Farm 5.6% faster time-to-harvest",
    "South Farm $7,000 lower cost per kg"
  ]
}
```

```
POST https://[your-deployment].convex.site/analytics/export-report
Body: {
  "reportType": "yield_analysis",
  "facilityId": "f78ghi...",
  "startDate": 1712016000000,
  "endDate": 1730073600000,
  "format": "excel"
}
Response: {
  "success": true,
  "exportUrl": "https://storage.../analytics_yield_Q3_2025.xlsx",
  "generatedAt": 1730073600000,
  "message": "Reporte exportado exitosamente"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `analytics.getDashboard` (query)
- `analytics.getYieldAnalysis` (query)
- `analytics.getResourceEfficiency` (query)
- `analytics.compareFacilities` (query)
- `analytics.exportReport` (mutation)
- `analytics.calculateCostPerKg` (internal function)
- `analytics.calculateYieldTrends` (internal function)
- `analytics.calculateEfficiencyScore` (internal function)

### Notes
- 🔴 **Required**: Yield tracking, cost per kg calculation, time-to-harvest metric
- 🟡 **Important**: Trend visualization (month-over-month, season-over-season)
- 🟢 **Nice-to-have**: Predictive analytics (forecasting future yields), benchmarking vs. industry
- Dashboards auto-update as new batches complete
- Insights help identify optimization opportunities
- Analytics cached for performance (refresh every 6 hours)
- Multi-facility comparison helps identify best practices

---

## MODULE 16: Mobile Experience & Media Management

### Purpose
Provide mobile-friendly (PWA) interface for field operations. Manage photo/document uploads from field. Offline capability for remote facilities.

### Pages

**9. Mobile Dashboard** (responsive design, optimized for phone)
```
Phone Screen (360px wide):

┌────────────────────────┐
│   ALQUEMIST FARM       │
│   (Mobile View)        │
├────────────────────────┤
│                        │
│ 📍 North Farm          │
│ Status: 3 active       │
│        2 alerts        │
│                        │
│ TODAY'S TASKS:         │
│ ☐ Batch-001: Water     │
│   [Log Now]            │
│                        │
│ ☐ Batch-002: Inspect   │
│   [QC Check]           │
│                        │
│ ⚠ ALERT:               │
│ Nutrient A low (5 left)│
│ [Acknowledge]          │
│                        │
│ [≡] Menu  [⊕] More     │
└────────────────────────┘

Menu: Dashboard | Orders | Tasks | Reports | Settings
```

**10. Mobile Activity Logging**
```
Phone Screen:

┌────────────────────────┐
│   LOG ACTIVITY         │
│   (Mobile)             │
├────────────────────────┤
│ Batch: B-2025-001      │
│ Activity: Watering     │
│                        │
│ Time: 09:30 [⏱ Now]    │
│                        │
│ Materials:             │
│ Nutrient A: [3] units  │
│ Water: [80] L          │
│                        │
│ Photo: [📷 Camera]     │
│ (optional)             │
│                        │
│ [Log] [Cancel]         │
│                        │
│ (Offline mode indicated:
│ Will sync when online) │
└────────────────────────┘
```

**11. Media Gallery / File Management**
```
┌──────────────────────────┐
│   MEDIA LIBRARY          │
│   North Farm             │
├──────────────────────────┤
│ [Upload] [Filter] [Sort] │
│                          │
│ RECENT UPLOADS:          │
│ Photo: QC-001.jpg (3h)   │
│ Tag: Batch-2025-001      │
│ [View] [Delete] [Details]│
│                          │
│ Photo: Pest-Alert.jpg    │
│ (10h ago)                │
│ Tag: Pest Detection      │
│ AI Result: Mites         │
│ [View] [Mark Treated]    │
│                          │
│ Document: License.pdf    │
│ (uploaded 5d ago)        │
│ Type: Business License   │
│ [Download] [Share]       │
│                          │
│ CATEGORIES:              │
│ All (47)                 │
│ QC Checks (18)           │
│ Pests (4)                │
│ Documents (12)           │
│ Harvest (13)             │
│                          │
│ [Storage: 1.2GB / 10GB]  │
└──────────────────────────┘
```

### Key Data Flow
- **Inputs**: Mobile activity logs, photo uploads, offline queue
- **Outputs**: Activities synced to backend, media files indexed
- **Offline**: Local cache, auto-sync when connection restored

### Database Tables
- **Write**:
  - `activities` → Sync mobile activity logs
  - `media_files` → Store photos, documents, voice notes
- **Read**:
  - `production_orders` → Get active orders for mobile view
  - `batches` → Get batch details for activity logging
  - `scheduled_activities` → Get today's tasks

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Partially implemented (depends on Phase 2 endpoints)
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/mobile/get-dashboard
Body: {
  "userId": "user123",
  "facilityId": "f78ghi..."
}
Response: {
  "facilityName": "North Farm",
  "activeBatches": 3,
  "alerts": 2,
  "todaysTasks": [
    {
      "id": "task123",
      "batchId": "batch001",
      "batchName": "Batch-2025-001",
      "activityType": "watering",
      "scheduledTime": 1730106000000,
      "status": "pending"
    },
    {
      "id": "task124",
      "batchId": "batch002",
      "activityType": "inspection",
      "scheduledTime": 1730113200000,
      "status": "pending"
    }
  ],
  "alerts": [
    {
      "type": "low_stock",
      "message": "Nutrient A low (5 left)",
      "severity": "medium"
    }
  ]
}
```

```
POST https://[your-deployment].convex.site/mobile/log-activity
Body: {
  "batchId": "batch001",
  "activityType": "watering",
  "performedBy": "user123",
  "timestamp": 1730106000000,
  "durationMinutes": 30,
  "materialsConsumed": [
    { "inventoryItemId": "inv123", "quantity": 3, "unit": "units" }
  ],
  "observations": "Plant color good",
  "location": { "lat": 6.244747, "lng": -75.581211 },
  "offline": false
}
Response: {
  "success": true,
  "activityId": "act888...",
  "message": "Actividad registrada",
  "syncStatus": "synced"
}
```

```
POST https://[your-deployment].convex.site/mobile/upload-photo
Body: {
  "entityType": "batch",
  "entityId": "batch001",
  "photoBase64": "[base64_string]",
  "category": "quality_check",
  "caption": "QC check - Day 15",
  "takenAt": 1730106000000,
  "location": { "lat": 6.244747, "lng": -75.581211 }
}
Response: {
  "success": true,
  "mediaFileId": "media999...",
  "url": "https://storage.../qc_batch001_20251028.jpg",
  "thumbnailUrl": "https://storage.../thumbnails/qc_batch001_20251028_thumb.jpg",
  "message": "Foto subida exitosamente"
}
```

```
POST https://[your-deployment].convex.site/mobile/sync-offline-queue
Body: {
  "userId": "user123",
  "queuedActivities": [
    {
      "localId": "offline_1",
      "batchId": "batch001",
      "activityType": "watering",
      "timestamp": 1730099800000,
      "materialsConsumed": [...],
      "observations": "Offline activity 1"
    },
    {
      "localId": "offline_2",
      "batchId": "batch002",
      "activityType": "feeding",
      "timestamp": 1730103400000,
      "materialsConsumed": [...],
      "observations": "Offline activity 2"
    }
  ]
}
Response: {
  "success": true,
  "syncedCount": 2,
  "failedCount": 0,
  "syncedActivities": [
    { "localId": "offline_1", "activityId": "act888..." },
    { "localId": "offline_2", "activityId": "act889..." }
  ],
  "message": "2 actividades sincronizadas"
}
```

```
GET https://[your-deployment].convex.site/media/get-gallery
Body: {
  "facilityId": "f78ghi...",
  "category": "all",
  "limit": 50,
  "offset": 0
}
Response: {
  "mediaFiles": [
    {
      "id": "media999",
      "url": "https://storage.../qc_photo.jpg",
      "thumbnailUrl": "https://storage.../thumbnails/qc_photo_thumb.jpg",
      "category": "quality_check",
      "entityType": "batch",
      "entityId": "batch001",
      "caption": "QC check - Day 15",
      "uploadedBy": "John Doe",
      "uploadedAt": 1730106000000,
      "fileSize": 2456789,
      "aiAnalysisAvailable": true
    },
    ...
  ],
  "total": 47,
  "storageUsed": 1258291200,
  "storageLimit": 10737418240
}
```

```
DELETE https://[your-deployment].convex.site/media/delete
Body: {
  "mediaFileId": "media999",
  "userId": "user123"
}
Response: {
  "success": true,
  "message": "Archivo eliminado"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `mobile.getDashboard` (query)
- `mobile.logActivity` (mutation) - wrapper around orders.logActivity
- `mobile.uploadPhoto` (mutation)
- `mobile.syncOfflineQueue` (mutation)
- `media.getGallery` (query)
- `media.getByEntity` (query)
- `media.upload` (mutation)
- `media.delete` (mutation)
- `media.updateCaption` (mutation)

### PWA Configuration
```json
{
  "name": "Alquemist Farm",
  "short_name": "Alquemist",
  "start_url": "/mobile",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "offline_enabled": true,
  "cache_strategy": "network_first"
}
```

### Notes
- 🔴 **Required**: Mobile-responsive interface, offline capability
- 🟡 **Important**: Camera access for photo QC, fast activity logging
- 🟢 **Nice-to-have**: Voice notes, barcode/QR scanning for batch tracking
- PWA saves to home screen like native app
- Works on 3G/4G for remote facilities
- Offline activities queue locally in IndexedDB, sync when online
- GPS location captured with each mobile activity (for compliance)
- Photo compression before upload (reduce bandwidth usage)
- Service worker caches essential data for offline mode

---

## MODULE 17: Integrations & APIs

### Purpose
Enable ecosystem connections. Integrate with suppliers, distributors, analytics platforms, lab services. Standardized API for data exchange.

### Pages

**12. Integrations Management Dashboard**
```
┌────────────────────────────┐
│   INTEGRATIONS             │
│   North Farm               │
├────────────────────────────┤
│ [+ Add Integration]        │
│                            │
│ CONNECTED:                 │
│ Supplier X API             │
│ Status: ✓ Active (sync 6h) │
│ Syncing: Product catalog   │
│          Purchase orders   │
│ [Configure] [Disconnect]   │
│                            │
│ Analytics Platform Y       │
│ Status: ✓ Active (realtime)│
│ Syncing: Yield data        │
│ [Configure] [Disconnect]   │
│                            │
│ Lab Service Z              │
│ Status: ⚠ Paused          │
│ (Last sync: 2d ago)        │
│ [Retry] [Settings]         │
│                            │
│ AVAILABLE TO CONNECT:      │
│ • Supplier B               │
│ • Distributor D            │
│ • Analytics Platform W     │
│ [View Marketplace]         │
│                            │
│ [API Keys] [Logs] [Docs]   │
└────────────────────────────┘
```

**13. Configure Integration**
```
┌────────────────────────────┐
│   CONNECT: Supplier API    │
├────────────────────────────┤
│ Supplier Name:             │
│ [FarmChem Supplier ▼]      │
│                            │
│ API Key:                   │
│ [••••••••••••••••]         │
│ [Regenerate Key]           │
│                            │
│ Data to Sync:              │
│ ☑ Product Catalog          │
│ ☑ Purchase Orders (to them)│
│ ☐ Invoice Status           │
│ ☐ Payment Records          │
│                            │
│ Sync Frequency:            │
│ [Daily ▼] at [03:00 UTC]   │
│                            │
│ Webhooks:                  │
│ ☑ New Orders (from Alquem) │
│ ☑ Shipment Updates         │
│                            │
│ [Test Connection]          │
│ [Save] [Cancel]            │
│                            │
│ Last Sync: 6h ago          │
│ Status: ✓ Successful       │
└────────────────────────────┘
```

**14. API Documentation / Developer Portal**
```
┌────────────────────────────┐
│   API REFERENCE            │
│   For External Integrators  │
├────────────────────────────┤
│ Base URL:                  │
│ https://api.alquemist.io/  │
│ v1/                        │
│                            │
│ AVAILABLE ENDPOINTS:       │
│ • GET /batches             │
│ • POST /activities/log     │
│ • GET /inventory           │
│ • POST /quality-checks     │
│ • GET /reports             │
│ • POST /orders             │
│                            │
│ Authentication:            │
│ API Key (header)           │
│ OAuth 2.0 (future)         │
│                            │
│ Rate Limit:                │
│ 1000 req / hour            │
│                            │
│ [Full API Docs]            │
│ [Code Examples]            │
│ [Webhooks Reference]       │
│ [Support Forum]            │
└────────────────────────────┘
```

### Key Data Flow
- **Inputs**: Integration config (API keys, data selection, sync frequency)
- **Outputs**: Synced data to/from external systems, webhook events
- **Trigger**: Scheduled syncs or real-time webhooks

### Database Tables
- **Write**:
  - `integrations` → Store integration configurations
  - `integration_logs` → Track sync history and errors
  - `webhook_subscriptions` → Store webhook endpoints
- **Read**:
  - `production_orders` → Export order data
  - `batches` → Export batch data
  - `activities` → Export activity logs
  - `inventory_items` → Export inventory data
  - `facilities` → Export facility info
  - `suppliers` → Sync supplier data

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
GET https://[your-deployment].convex.site/integrations/get-active
Body: { "companyId": "k12def..." }
Response: {
  "integrations": [
    {
      "id": "int123",
      "name": "FarmChem Supplier Integration",
      "type": "supplier",
      "status": "active",
      "lastSync": 1730073600000,
      "syncFrequency": "daily",
      "dataSync": ["product_catalog", "purchase_orders"],
      "nextSync": 1730160000000
    },
    {
      "id": "int124",
      "name": "Analytics Platform Y",
      "type": "analytics",
      "status": "active",
      "lastSync": 1730073600000,
      "syncFrequency": "realtime",
      "dataSync": ["yield_data", "batch_completion"]
    },
    {
      "id": "int125",
      "name": "Lab Service Z",
      "type": "lab",
      "status": "paused",
      "lastSync": 1729900800000,
      "error": "Connection timeout"
    }
  ]
}
```

```
POST https://[your-deployment].convex.site/integrations/create
Body: {
  "companyId": "k12def...",
  "name": "FarmChem Supplier",
  "integrationType": "supplier",
  "config": {
    "apiKey": "sk_test_abc123...",
    "apiUrl": "https://api.farmchem.com/v1",
    "dataToSync": ["product_catalog", "purchase_orders"],
    "syncFrequency": "daily",
    "syncTime": "03:00"
  },
  "webhooks": {
    "enabled": true,
    "events": ["new_order", "shipment_update"]
  }
}
Response: {
  "success": true,
  "integrationId": "int456...",
  "message": "Integración creada exitosamente",
  "testConnection": "passed"
}
```

```
POST https://[your-deployment].convex.site/integrations/test-connection
Body: {
  "integrationId": "int456"
}
Response: {
  "success": true,
  "status": "connected",
  "responseTime": 245,
  "message": "Conexión exitosa"
}
```

```
POST https://[your-deployment].convex.site/integrations/sync-now
Body: {
  "integrationId": "int456",
  "direction": "pull"
}
Response: {
  "success": true,
  "syncId": "sync789...",
  "recordsSynced": 45,
  "recordsFailed": 0,
  "duration": 1234,
  "message": "Sincronización completada"
}
```

```
GET https://[your-deployment].convex.site/integrations/get-logs
Body: {
  "integrationId": "int456",
  "limit": 50
}
Response: {
  "logs": [
    {
      "id": "log123",
      "timestamp": 1730073600000,
      "action": "sync",
      "status": "success",
      "recordsSynced": 45,
      "duration": 1234
    },
    {
      "id": "log124",
      "timestamp": 1729987200000,
      "action": "sync",
      "status": "partial_failure",
      "recordsSynced": 42,
      "recordsFailed": 3,
      "error": "Timeout on 3 records"
    }
  ]
}
```

```
POST https://[your-deployment].convex.site/webhooks/subscribe
Body: {
  "companyId": "k12def...",
  "webhookUrl": "https://external-system.com/webhook/alquemist",
  "events": ["batch_completed", "low_stock", "harvest_recorded"],
  "secret": "whsec_abc123..."
}
Response: {
  "success": true,
  "webhookId": "wh789...",
  "message": "Webhook suscrito exitosamente"
}
```

### Public API Endpoints (for External Integrators)

**These endpoints allow external systems to access Alquemist data**

```
GET https://api.alquemist.io/v1/batches
Headers: { "Authorization": "Bearer sk_live_abc123..." }
Query: { "facilityId": "f78ghi", "status": "active" }
Response: {
  "data": [
    {
      "id": "batch001",
      "batchNumber": "B-2025-001",
      "cropType": "Cannabis",
      "cultivar": "Cherry AK",
      "currentQuantity": 200,
      "status": "en_proceso",
      "currentPhase": "vegetative",
      "startDate": 1725148800000
    },
    ...
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "perPage": 50
  }
}
```

```
POST https://api.alquemist.io/v1/activities
Headers: { "Authorization": "Bearer sk_live_abc123..." }
Body: {
  "batchId": "batch001",
  "activityType": "watering",
  "performedBy": "external_system",
  "timestamp": 1730073600000,
  "observations": "Automated watering from IoT system"
}
Response: {
  "success": true,
  "activityId": "act999...",
  "message": "Activity logged successfully"
}
```

```
GET https://api.alquemist.io/v1/inventory
Headers: { "Authorization": "Bearer sk_live_abc123..." }
Query: { "facilityId": "f78ghi", "status": "low_stock" }
Response: {
  "data": [
    {
      "id": "inv123",
      "productName": "Nutrient A",
      "quantityAvailable": 5,
      "reorderPoint": 20,
      "needsReorder": true
    },
    ...
  ]
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `integrations.getActive` (query)
- `integrations.create` (mutation)
- `integrations.update` (mutation)
- `integrations.testConnection` (mutation)
- `integrations.syncNow` (mutation)
- `integrations.getLogs` (query)
- `webhooks.subscribe` (mutation)
- `webhooks.unsubscribe` (mutation)
- `webhooks.triggerEvent` (internal function)
- `api.authenticate` (middleware for public API)
- `api.rateLimit` (middleware for public API)

### API Documentation Structure
```markdown
# Alquemist Public API Documentation

## Authentication
All API requests require authentication via Bearer token:
`Authorization: Bearer sk_live_abc123...`

## Rate Limits
- 1000 requests per hour per API key
- Burst limit: 100 requests per minute

## Available Endpoints

### Batches
- GET /v1/batches - List all batches
- GET /v1/batches/:id - Get batch details
- POST /v1/batches - Create batch (requires order template)

### Activities
- GET /v1/activities - List activities
- POST /v1/activities - Log activity
- GET /v1/activities/:id - Get activity details

### Inventory
- GET /v1/inventory - List inventory items
- POST /v1/inventory/consume - Log consumption
- GET /v1/inventory/low-stock - Get low stock alerts

### Quality Checks
- POST /v1/quality-checks - Run QC check
- GET /v1/quality-checks/:batchId - Get QC history

### Webhooks
Available webhook events:
- batch_completed
- harvest_recorded
- low_stock_alert
- pest_detected
- phase_transition
```

### Notes
- 🔴 **Required**: API documentation, REST endpoints for key resources
- 🟡 **Important**: Supplier integrations (purchase orders, product catalogs)
- 🟢 **Nice-to-have**: Webhook events, OAuth 2.0, integration marketplace
- API secured with API keys (stored in `api_keys` table)
- Future: OAuth 2.0 for more secure third-party access
- Webhook events notify external systems (batch completed, low stock, etc.)
- Rate limiting: 1000 req/hour, 100 req/minute burst
- API versioning (v1, v2) for backward compatibility
- CORS enabled for web-based integrations

---

## IMPLEMENTATION STATUS OVERVIEW

### ❌ Not Yet Implemented (Schema Partially Ready, Full Implementation Needed)

All Phase 3 modules require complete Convex backend implementation. Some database tables exist, but most Phase 3-specific features need to be built from scratch.

**MODULE 14: Compliance & Reporting**
- ⚠️ Database schema: `compliance_events`, `certificates` tables need creation
- ✅ Data sources ready: `activities`, `inventory_items`, `batches` (from Phase 2)
- ❌ Missing: Compliance event tracking
- ❌ Missing: Report generation (PDF/Excel)
- ❌ Missing: Audit trail export
- ❌ Missing: Certificate management
- **Priority**: HIGH - required for regulatory compliance (cannabis, coffee)
- **Convex File**: Need to create `convex/compliance.ts`, `convex/certificates.ts`

**MODULE 15: Analytics & Business Intelligence**
- ✅ Data sources ready: All operational data from Phase 1-2
- ❌ Missing: Analytics aggregation queries
- ❌ Missing: Cost per kg calculation engine
- ❌ Missing: Yield trend analysis
- ❌ Missing: Multi-facility comparison
- ❌ Missing: Report export functionality
- **Priority**: MEDIUM - enhances decision-making but not blocking
- **Convex File**: Need to create `convex/analytics.ts`

**MODULE 16: Mobile Experience & Media Management**
- ⚠️ Database schema: `media_files` table exists
- ❌ Missing: Mobile-optimized endpoints
- ❌ Missing: Offline sync functionality
- ❌ Missing: Photo upload and compression
- ❌ Missing: Media gallery management
- ❌ Missing: PWA configuration
- **Priority**: HIGH - field workers need mobile access
- **Convex File**: Need to create `convex/mobile.ts`, `convex/media.ts`
- **Frontend Work**: PWA setup, service worker, offline caching

**MODULE 17: Integrations & APIs**
- ❌ Missing: Integration management system
- ❌ Missing: Public API infrastructure
- ❌ Missing: Webhook system
- ❌ Missing: API key management
- ❌ Missing: Rate limiting
- ❌ Missing: API documentation site
- **Priority**: LOW - nice-to-have for ecosystem, not MVP
- **Convex File**: Need to create `convex/integrations.ts`, `convex/webhooks.ts`, `convex/api.ts`

---

## DEPENDENCIES & IMPLEMENTATION ORDER

### Phase 3 Depends On:
- ✅ **PHASE 1, Modules 1-2**: Auth & email (implemented)
- ⚠️ **PHASE 1, Modules 5-8**: Facilities, areas, cultivars (not yet implemented)
- ⚠️ **PHASE 2, All Modules**: Inventory, templates, orders, QC, AI (not yet implemented)

**Phase 3 CANNOT START until Phase 2 is complete** because it analyzes and reports on Phase 2 operational data.

### Recommended Implementation Sequence:

**Step 1: Complete Phase 1 & Phase 2 First** (12-15 weeks)
```
Phase 1 completion (Modules 5-8): 2-3 weeks
Phase 2 completion (Modules 9-13): 10-13 weeks
```

**Step 2: Build Phase 3 Foundation** (Weeks 1-2)
```
1. Mobile Experience (Module 16)
   - Most critical for field operations
   - Enables workers to log activities from the field
   - PWA setup for offline capability
```

**Step 3: Compliance & Analytics** (Weeks 3-5)
```
2. Compliance & Reporting (Module 14)
   - Required for regulatory compliance
   - Audit trail and report generation

3. Analytics & BI (Module 15)
   - Built in parallel with compliance
   - Uses same data sources
```

**Step 4: Ecosystem Integration** (Weeks 6-8)
```
4. Integrations & APIs (Module 17)
   - Last to implement
   - Requires all previous modules as data sources
   - Public API for external systems
```

---

## BUBBLE INTEGRATION: PHASE 3 READINESS

### Current Status
❌ **NOT READY** - No Phase 3 endpoints implemented yet

### Required Before Phase 3 UI Development:
1. ✅ Complete PHASE-1 Modules 1-2 (auth & email) - **DONE**
2. ⚠️ Complete PHASE-1 Modules 5-8 (facilities, areas, cultivars) - **NOT STARTED**
3. ⚠️ Complete PHASE-2 Modules 9-13 (inventory, templates, orders, QC, AI) - **NOT STARTED**
4. ❌ Implement PHASE-3 Module 16 (mobile & media) - **NOT STARTED**
5. ❌ Implement PHASE-3 Module 14 (compliance) - **NOT STARTED**
6. 🟢 Implement PHASE-3 Modules 15, 17 (analytics, integrations) - **OPTIONAL** (can add later)

### Estimated Development Time
- Phase 1 Modules 5-8: **2-3 weeks**
- Phase 2 All Modules: **10-13 weeks**
- Phase 3 Module 16 (Mobile): **2-3 weeks**
- Phase 3 Module 14 (Compliance): **2-3 weeks**
- Phase 3 Module 15 (Analytics): **2-3 weeks**
- Phase 3 Module 17 (Integrations): **2-3 weeks**

**Total for Phase 3 MVP**: ~8-12 weeks (after Phase 2 completion)
**Total for Full Platform**: ~20-28 weeks (5-7 months)

---

## PHASE 3 SUMMARY

### Total Pages: ~18 screens
```
Module 14 (Compliance):       4 pages
Module 15 (Analytics):        4 pages
Module 16 (Mobile + Media):   3 pages
Module 17 (Integrations):     3 pages
────────────────────────
Total: ~18 pages
```

### Key Workflows

**Compliance & Reporting**
```
Month End:
  → Generate inventory report
  → Export audit trail
  → Review certifications
  → Submit regulatory docs
```

**Analytics Review**
```
Weekly:
  → Check yield trends
  → Review cost per kg
  → Compare facilities
  → Identify optimizations

Quarterly:
  → Full performance report
  → Benchmark vs. industry
  → Plan adjustments
```

**Mobile Field Work**
```
Daily:
  → Check mobile dashboard
  → Log activities offline
  → Take photos (QC/pests)
  → Upload when back online
```

**Integration Management**
```
Setup:
  → Connect supplier API
  → Configure data sync
  → Test webhooks

Ongoing:
  → Monitor sync status
  → Handle sync errors
  → Manage API keys
```

### Database State in Phase 3
- ✅ Historical data preserved (audit trail)
- ✅ Compliance artifacts generated and exported
- ✅ Analytics snapshots captured
- ✅ Third-party integrations operational
- ✅ Mobile data synced
- ✅ System ready for scaling

### Role Access
- 🔴 COMPANY_OWNER: Full analytics, compliance, settings
- 🟡 FACILITY_MANAGER: Facility analytics, compliance for their facility
- 🟡 VIEWER: Read-only dashboards (no compliance data)
- 🟢 INTEGRATION_ADMIN: Manage API connections

---

## CROSS-PHASE DEPENDENCIES

```
PHASE 1 (Onboarding)
  ↓ (setup complete)
PHASE 2 (Operations)
  ↓ (data generated)
PHASE 3 (Advanced)
  ↓ (uses Phase 1-2 data)
SCALE
  ↓ (multiple facilities, suppliers, integrations)
```

All three phases together create a complete agricultural management platform:
- **Phase 1**: "Get ready" (company setup, infrastructure)
- **Phase 2**: "Stay productive" (daily operations, batch tracking)
- **Phase 3**: "Be compliant & optimize" (reporting, analytics, integrations)

---

**Status**: Design phase complete, post-Phase 2 implementation
**Archive**: All three phase documents (PHASE-1, PHASE-2, PHASE-3) linked from [UI-REQUIREMENTS-PLAN.md](../UI-REQUIREMENTS-PLAN.md)
