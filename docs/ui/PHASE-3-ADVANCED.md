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
- **Write**: compliance_events, certificates, media_files (report exports)
- **Read**: activities, inventory_items, pest_disease_records, production_orders, batches, quality_check_templates
- **Related**: companies (regulatory framework by region)

### Notes
- 🔴 **Required**: Audit trail, basic compliance export capability
- 🟡 **Important**: Automated report generation (reduces manual work)
- 🟢 **Nice-to-have**: Digital signature, reminder system for upcoming deadlines
- All historical data retrievable for compliance (never deleted, marked archived)
- Regulatory framework varies by crop and region (cannabis stricter than coffee)

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
- **Read**: production_orders, batches, activities, inventory_items, facilities
- **Write**: (optional: analytics_snapshots for trend history)

### Notes
- 🔴 **Required**: Yield tracking, cost per kg calculation, time-to-harvest metric
- 🟡 **Important**: Trend visualization (month-over-month, season-over-season)
- 🟢 **Nice-to-have**: Predictive analytics (forecasting future yields), benchmarking vs. industry
- Dashboards auto-update as new batches complete
- Insights help identify optimization opportunities

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
- **Write**: activities, media_files
- **Read**: production_orders, batches
- **Related**: (service worker for offline sync)

### Notes
- 🔴 **Required**: Mobile-responsive interface, offline capability
- 🟡 **Important**: Camera access for photo QC, fast activity logging
- 🟢 **Nice-to-have**: Voice notes, barcode scanning for batch tracking
- PWA saves to home screen like app
- Works on 3G/4G for remote facilities
- Offline activities queue locally, sync when online

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
- **Read**: production_orders, batches, activities, inventory_items, facilities, suppliers
- **Write**: (external only, received via API)
- **Related**: integrations (config table, future)

### Notes
- 🔴 **Required**: API documentation, REST endpoints for key resources
- 🟡 **Important**: Supplier integrations (purchase orders, product catalogs)
- 🟢 **Nice-to-have**: Webhook events, OAuth, marketplace of integrations
- API secured with API keys (future: OAuth 2.0)
- Webhook events notify external systems of events (batch completed, low stock, etc.)
- Rate limiting prevents abuse

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
