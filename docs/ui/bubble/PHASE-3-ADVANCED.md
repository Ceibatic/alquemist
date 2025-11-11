# PHASE 3: ADVANCED - UI REQUIREMENTS

**Focus**: Compliance, analytics, mobile, and integrations
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md)
**API Endpoints**: See [../../api/PHASE-3-ENDPOINTS.md](../../api/PHASE-3-ENDPOINTS.md)

---

## Overview

Phase 3 adds reporting, compliance, analytics, and ecosystem integration. Transforms operational data into compliance reports, business intelligence dashboards, and enables third-party integrations.

**Total Pages**: ~18 screens
**User Flow**: Non-linear, analytics-heavy
**Primary Users**: COMPANY_OWNER, FACILITY_MANAGER, VIEWER

---

## MODULE 14: Compliance & Reporting

### Page 1: Compliance Dashboard
```
┌────────────────────────────────┐
│   📋 COMPLIANCE                │
│   North Farm                   │
├────────────────────────────────┤
│ REQUIRED ITEMS:                │
│                                │
│ • Inventory Report             │
│   Due: 2025-11-15 ⚠ 18 days   │
│   [Generate] [View Template]   │
│                                │
│ • Facility Audit               │
│   Due: 2025-12-01  28 days     │
│   [Schedule]                   │
│                                │
│ CERTIFICATES:                  │
│ • Organic (exp: 2026-03)       │
│   Status: ✓ Valid              │
│   [View] [Renew]               │
│                                │
│ • Cannabis License             │
│   Status: ⚠ Expiring (65d)     │
│   [View] [Renew]               │
│                                │
│ PAST REPORTS:                  │
│ [Q3 Inventory Report] [DL]     │
│ [Q2 Facility Audit] [DL]       │
│                                │
│ [Generate Report] [Export]     │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Repeating Group: Compliance events (due items)
- Repeating Group: Certificates
- Repeating Group: Past reports
- Button: "Generate Report" → open generator popup
- Button: "Export" → download audit trail

**Database Context**:
- **Reads from**: `compliance_events` table
  - Gets: due items, status, deadlines
- **Reads from**: `certificates` table
  - Gets: certificates, expiry dates
- **Reads from**: `media_files` table (category = compliance_report)
  - Gets: past generated reports

---

### Popup: Generate Report
```
┌────────────────────────────────┐
│   COMPLIANCE REPORT            │
├────────────────────────────────┤
│ Report Type:                   │
│ [v Inventory Report ▼]         │
│                                │
│ Period:                        │
│ From: [2025-09-01]             │
│ To:   [2025-09-30]             │
│                                │
│ Include:                       │
│ ☑ Stock levels at start        │
│ ☑ Purchases (by supplier)      │
│ ☑ Consumption logs             │
│ ☑ Batch tracking               │
│ ☑ Waste/disposal records       │
│                                │
│ Format:                        │
│ ○ PDF (official)               │
│ ○ Excel (editable)             │
│ ○ JSON (system import)         │
│                                │
│ [Cancel] [Generate]            │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Report type
- Date pickers: Start/end date
- Checkboxes: Include options
- Radio buttons: Format selection
- Button: "Generate" → create report

**Workflow**:
1. User selects report type and period
2. Call API: Generate report
3. Download/display generated PDF/Excel

**Database Context**:
- **Reads from**: Multiple tables depending on report type
  - Inventory reports: `inventory_items`, `activities` (consumption)
  - Audit trail: `activities` table
- **Writes to**: `media_files` table
  - Stores: generated report file

---

## MODULE 15: Analytics & Business Intelligence

### Page 2: Analytics Dashboard
```
┌────────────────────────────────┐
│   📊 ANALYTICS                 │
│   North Farm - October 2025    │
├────────────────────────────────┤
│ KEY METRICS:                   │
│ ┌──────────┬────────────────┐  │
│ │ Batches  │ 6 active       │  │
│ │ Harvest  │ 3 completed    │  │
│ │ Yield    │ 108 kg         │  │
│ └──────────┴────────────────┘  │
│                                │
│ YIELD TRENDS:                  │
│ [Graph: Sep 98kg → Oct 108kg]  │
│ Avg: 100kg  ↑ 8% vs Sept      │
│                                │
│ CONSUMPTION:                   │
│ Nutrient A: 245 units          │
│ Water: 4200 L                  │
│ Cost per kg: $125  ▼ 5%       │
│                                │
│ TIME-TO-HARVEST:               │
│ Avg: 18 weeks (target 20)      │
│ ✓ Better than target           │
│                                │
│ [View Details] [Export]        │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Text/charts: Key metrics display
- Chart: Yield trends (line graph)
- Repeating Group: Consumption breakdown
- Text: Performance indicators
- Button: "View Details" → detailed analytics page
- Button: "Export" → download report

**Database Context**:
- **Reads from**: Multiple tables for aggregation
  - `production_orders`, `batches` → yields
  - `activities` → consumption patterns
  - `inventory_items` → costs
- **Calculates**: Trends, averages, comparisons

---

### Page 3: Detailed Analytics
```
┌────────────────────────────────┐
│   YIELD ANALYSIS               │
│   Last 6 months                │
├────────────────────────────────┤
│ Time Period: [Last 6 months ▼] │
│                                │
│ HARVEST DATA:                  │
│ Batch-001: 35 kg (target 30)   │
│ Batch-002: 38 kg (target 30)   │
│ Batch-003: 32 kg (target 30)   │
│ Average: 33.5 kg  ↑ 12%        │
│                                │
│ FACTORS:                       │
│ • Nutrient timing (positive)   │
│ • Light cycle optimization     │
│ • Humidity control (weak)      │
│                                │
│ CULTIVAR COMPARISON:           │
│ Cherry AK:   34 kg avg         │
│ White Widow: 35 kg avg         │
│ Green Crack: 32 kg avg         │
│                                │
│ [Download Report] [Compare]    │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Time period selector
- Repeating Group: Batch results
- Text: Averages and trends
- Repeating Group: Factors analysis
- Repeating Group: Cultivar comparison
- Button: "Download Report" → export

**Database Context**:
- **Reads from**: `batches` table
  - Gets: harvest data, yields
- **Reads from**: `cultivars` table
  - Gets: cultivar names
- **Calculates**: Averages, comparisons, trends

---

## MODULE 16: Mobile Experience

### Mobile Page 1: Dashboard (PWA)
```
Phone Screen (360px):

┌────────────────────────┐
│   🌱 ALQUEMIST         │
│   (Mobile)             │
├────────────────────────┤
│ 📍 North Farm          │
│ Status: 3 active       │
│        2 alerts        │
│                        │
│ TODAY'S TASKS:         │
│ ☐ Batch-001: Water    │
│   [Log Now]            │
│                        │
│ ☐ Batch-002: Inspect  │
│   [QC Check]           │
│                        │
│ ⚠ ALERT:               │
│ Nutrient A low (5)     │
│ [Acknowledge]          │
│                        │
│ [≡] Menu  [⊕] More     │
└────────────────────────┘
```

**Bubble Elements** (Mobile-optimized):
- Text: Facility name, status
- Repeating Group: Today's tasks (collapsed view)
- Buttons: Quick actions (Log Now, QC Check)
- Text: Alerts display
- Bottom navigation: Menu, More options

**Database Context**:
- **Reads from**: `scheduled_activities` → today's tasks
- **Reads from**: `inventory_items` → low stock alerts
- **Reads from**: `batches` → active batch count

---

### Mobile Page 2: Quick Activity Log
```
Phone Screen:

┌────────────────────────┐
│   LOG ACTIVITY         │
│   (Mobile)             │
├────────────────────────┤
│ Batch: B-2025-001      │
│ Activity: Watering     │
│                        │
│ Time: [⏱ Now]          │
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
│ (Offline mode:         │
│ Will sync when online) │
└────────────────────────┘
```

**Bubble Elements**:
- Text: Batch, activity (pre-filled)
- Button: "Now" → auto-fill current time
- Input: Material quantities
- Button: "Camera" → take photo
- Button: "Log" → submit (queue if offline)

**Workflow** (PWA-specific):
1. User fills activity log
2. If online → Submit immediately
3. If offline → Queue in local storage
4. Auto-sync when connection restored

**Database Context**:
- **Writes to**: `activities` table (when online)
- **Updates**: `inventory_items` → consume materials
- **Offline**: Uses browser IndexedDB for queue

---

## MODULE 17: Integrations & APIs

### Page 4: Integrations Dashboard
```
┌────────────────────────────────┐
│   🔌 INTEGRATIONS              │
│   North Farm                   │
├────────────────────────────────┤
│ [+ Add Integration]            │
│                                │
│ CONNECTED:                     │
│ ┌──────────────────────────┐  │
│ │ FarmChem Supplier API    │  │
│ │ Status: ✓ Active (6h ago)│  │
│ │ Syncing: Products, Orders│  │
│ │ [Configure] [Disconnect] │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ Analytics Platform Y     │  │
│ │ Status: ✓ Active (live)  │  │
│ │ Syncing: Yield data      │  │
│ │ [Configure] [Disconnect] │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ Lab Service Z            │  │
│ │ Status: ⚠ Paused (2d)    │  │
│ │ [Retry] [Settings]       │  │
│ └──────────────────────────┘  │
│                                │
│ [API Keys] [Logs] [Docs]       │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ Add Integration" → open setup popup
- Repeating Group: Active integrations
  - Shows: name, status, last sync, what's syncing
  - Buttons: "Configure", "Disconnect", "Retry"
- Buttons: "API Keys", "Logs", "Docs" → manage integrations

**Database Context**:
- **Reads from**: `integrations` table
  - Gets: all integrations for company
- **Reads from**: `integration_logs` table
  - Gets: sync history, errors

---

### Popup: Configure Integration
```
┌────────────────────────────────┐
│   CONNECT: Supplier API        │
├────────────────────────────────┤
│ Supplier:                      │
│ [v FarmChem Inc ▼]             │
│                                │
│ API Key:                       │
│ [••••••••••••••]               │
│ [Regenerate]                   │
│                                │
│ Data to Sync:                  │
│ ☑ Product Catalog              │
│ ☑ Purchase Orders              │
│ ☐ Invoice Status               │
│                                │
│ Sync Frequency:                │
│ [v Daily ▼] at [03:00 UTC]     │
│                                │
│ Webhooks:                      │
│ ☑ New Orders                   │
│ ☑ Shipment Updates             │
│                                │
│ [Test Connection]              │
│ [Cancel] [Save]                │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Supplier selection
- Input: API key (password field)
- Checkboxes: Data sync options
- Dropdown: Sync frequency
- Checkboxes: Webhook events
- Button: "Test Connection" → validate
- Button: "Save" → create integration

**Workflow**:
1. User enters integration details
2. On "Test Connection" → Validate credentials
3. On "Save" → Create integration record
4. Schedule sync jobs

**Database Context**:
- **Writes to**: `integrations` table
  - Stores: config, sync settings
- **Writes to**: `webhook_subscriptions` table (if webhooks enabled)

---

## RESPONSIVE BREAKPOINTS

### Desktop (1200px+)
- Multi-column layouts
- Full charts and graphs
- Side-by-side comparisons

### Tablet (768px - 1199px)
- Single column with cards
- Simplified charts
- Touch-optimized buttons

### Mobile (< 768px)
- PWA mode
- Bottom navigation
- Simplified dashboards
- Offline-first design

---

## PWA CONFIGURATION

### manifest.json
```json
{
  "name": "Alquemist Farm",
  "short_name": "Alquemist",
  "start_url": "/mobile",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "offline_enabled": true
}
```

### Service Worker Features
- Cache essential pages for offline
- Queue activities when offline
- Auto-sync when connection restored
- Background sync for photos

---

## KEY WORKFLOWS SUMMARY

### Compliance Workflow
```
Dashboard → View due items
         → Generate report (select period + format)
         → Download PDF/Excel
         → Upload to regulatory portal
```

### Analytics Workflow
```
Dashboard → View key metrics
         → Drill down to details
         → Compare periods/facilities
         → Export report
```

### Mobile Workflow
```
Open PWA → Check today's tasks
        → Log activity (offline capable)
        → Take photo
        → Auto-sync when online
```

### Integration Workflow
```
Integrations → Add integration
            → Configure API settings
            → Test connection
            → Enable auto-sync
            → Monitor sync logs
```

---

**Status**: UI requirements complete for Phase 3
**Next Steps**:
1. Implement API endpoints (see [PHASE-3-ENDPOINTS.md](../../api/PHASE-3-ENDPOINTS.md))
2. Set up PWA configuration
3. Build Bubble pages following wireframes
4. Test offline capabilities
