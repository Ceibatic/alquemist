# PHASE 5: ADVANCED FEATURES - API ENDPOINTS

**For Next.js 15 Frontend Integration**

**Base URL**: `https://handsome-jay-388.convex.site`

**Implementation Stack**:
- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: Convex HTTP Actions
- **Auth**: Custom session tokens (30-day validity)
- **Analytics**: Recharts / Chart.js for visualizations
- **Reporting**: PDF generation with jsPDF or server-side rendering
- **PWA**: Service workers, offline sync, push notifications
- **Integrations**: REST APIs, webhooks, OAuth

**Related Documentation**:
- **Database Schema**: [../database/SCHEMA.md](../database/SCHEMA.md)
- **Development Methodology**: [../dev/CLAUDE.md](../dev/CLAUDE.md)
- **Phase 1 Auth**: [PHASE-1-ONBOARDING-ENDPOINTS.md](PHASE-1-ONBOARDING-ENDPOINTS.md)
- **Bubble Reference** (Visual Guide Only): [../ui/bubble/PHASE-5-ADVANCED.md](../ui/bubble/PHASE-5-ADVANCED.md)

---

## PHASE 5 OVERVIEW

**Status**: 📋 Planned for Future Implementation

**Purpose**: Analytics, compliance, reporting, mobile optimization, and integrations

**Modules**:
- **MODULE 14**: Compliance & Reporting (PDF generation, audit trails)
- **MODULE 26**: Analytics Dashboard (Charts, KPIs, trends)
- **MODULE 27**: Mobile App Interface (PWA enhancements, offline mode)
- **MODULE 28**: Third-Party Integrations (APIs, webhooks)

**Estimated Pages**: 18 screens
**Entry Point**: After production operations are running (Phase 4)

**Key Features**:
- Regulatory compliance reports (ICA, INVIMA)
- Advanced analytics with interactive charts
- PDF/Excel export capabilities
- Offline-first PWA with background sync
- Push notifications for alerts
- Third-party API integrations
- Webhook support for external systems

**Note**: Detailed endpoint specifications will be added once Phase 1-4 are implemented and requirements are validated through production use.

---

## AUTHENTICATION

All Phase 5 endpoints require authentication via Bearer token (session token from Phase 1).

**Next.js Implementation**: Same auth pattern as Phase 2-4

---

## NEXT.JS PATTERNS FOR ADVANCED FEATURES

### Analytics Dashboard with Charts

```typescript
// app/(dashboard)/analytics/page.tsx
'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function AnalyticsDashboardPage() {
  // Real-time analytics data
  const productionMetrics = useQuery(api.analytics.getProductionMetrics, {
    facilityId,
    startDate,
    endDate
  })

  const yieldTrends = useQuery(api.analytics.getYieldTrends, {
    facilityId,
    period: 'monthly'
  })

  if (!productionMetrics || !yieldTrends) return <Loading />

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h2>Production Over Time</h2>
        <LineChart width={600} height={300} data={productionMetrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="completed" stroke="#8884d8" />
          <Line type="monotone" dataKey="inProgress" stroke="#82ca9d" />
        </LineChart>
      </div>

      <div>
        <h2>Yield by Cultivar</h2>
        <BarChart width={600} height={300} data={yieldTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cultivar" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="averageYield" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  )
}
```

### PDF Report Generation

```typescript
// app/actions/reporting.ts
'use server'

import { getSessionToken } from '@/lib/auth'
import jsPDF from 'jspdf'

export async function generateComplianceReport(params: {
  facilityId: string
  startDate: string
  endDate: string
  templateId: string
}) {
  const token = await getSessionToken()

  // Fetch data from Convex
  const response = await fetch(
    'https://handsome-jay-388.convex.site/compliance/get-report-data',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    }
  )

  const data = await response.json()

  // Generate PDF
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text('Compliance Report', 20, 20)

  doc.setFontSize(12)
  doc.text(`Facility: ${data.facilityName}`, 20, 40)
  doc.text(`Period: ${params.startDate} to ${params.endDate}`, 20, 50)

  // Add tables, charts, signatures
  // ... (detailed PDF generation logic)

  // Save to Convex storage
  const pdfBlob = doc.output('blob')
  const storageId = await uploadPDF(pdfBlob)

  return {
    success: true,
    reportUrl: await getStorageUrl(storageId),
    reportId: data.reportId
  }
}
```

### PWA Offline Sync

```typescript
// app/lib/offline-sync.ts
'use client'

import { useEffect } from 'react'

export function useOfflineSync() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Back online, syncing...')
      syncPendingData()
    })

    window.addEventListener('offline', () => {
      console.log('Offline mode activated')
    })
  }, [])

  async function syncPendingData() {
    // Get pending data from IndexedDB
    const pendingActivities = await getPendingActivities()

    // Sync each activity
    for (const activity of pendingActivities) {
      await executeActivityOnline(activity)
      await removePendingActivity(activity.id)
    }
  }
}
```

### Third-Party Integration (Webhook)

```typescript
// app/api/webhooks/external-system/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/webhooks'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-webhook-signature')
  const body = await request.text()

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data = JSON.parse(body)

  // Process webhook data
  switch (data.event) {
    case 'inventory.updated':
      await handleInventoryUpdate(data.payload)
      break
    case 'compliance.submitted':
      await handleComplianceSubmission(data.payload)
      break
    default:
      console.warn('Unknown webhook event:', data.event)
  }

  return NextResponse.json({ success: true })
}
```

---

## TYPESCRIPT TYPE DEFINITIONS

```typescript
// types/phase5.ts

export interface AnalyticsMetrics {
  totalOrders: number
  completedOrders: number
  inProgressOrders: number
  totalYield: number
  averageYieldPerPlant: number
  complianceRate: number
  onTimeCompletion: number
  activeWorkers: number
}

export interface YieldTrend {
  cultivar: string
  period: string
  averageYield: number
  plantCount: number
  batchCount: number
}

export interface ComplianceReport {
  id: string
  facilityId: string
  templateId: string
  reportType: 'ICA' | 'INVIMA' | 'CUSTOM'
  startDate: string
  endDate: string
  generatedAt: string
  generatedBy: string
  status: 'draft' | 'submitted' | 'approved'
  pdfUrl: string
  data: Record<string, any>
}

export interface WebhookEvent {
  id: string
  event: string
  payload: Record<string, any>
  timestamp: string
  source: string
}

export interface ThirdPartyIntegration {
  id: string
  name: string
  type: 'api' | 'webhook' | 'oauth'
  status: 'active' | 'inactive'
  config: {
    apiKey?: string
    webhookUrl?: string
    oauthClientId?: string
  }
  lastSyncAt?: string
}
```

---

## VALIDATION SCHEMAS (ZOD)

```typescript
// lib/validations/advanced.ts
import { z } from 'zod'

export const generateReportSchema = z.object({
  facilityId: z.string(),
  reportTemplateId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  includePhotos: z.boolean().default(false),
  includeSignatures: z.boolean().default(false)
})

export const analyticsQuerySchema = z.object({
  facilityId: z.string(),
  metricType: z.enum(['production', 'yield', 'compliance', 'inventory']),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export const webhookConfigSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().min(32),
  active: z.boolean().default(true)
})
```

---

## MODULE 14: Compliance & Reporting

Regulatory reporting, audit trails, and compliance management.

### Generate Compliance Report

**Endpoint**: `POST /compliance/generate-report`
**Status**: 📋 Planned
**Convex Function**: `compliance.generateReport` - TO BE DESIGNED

**Purpose**: Generate regulatory compliance report based on template

#### Placeholder Specification

**Request**:
```json
{
  "facilityId": "<facilityId>",
  "reportTemplateId": "<reportTemplateId>",
  "startDate": "<startDate>",
  "endDate": "<endDate>",
  "includePhotos": <boolean>,
  "includeSignatures": <boolean>
}
```

**Response**:
```json
{
  "success": true,
  "reportId": "rep123...",
  "reportUrl": "https://cdn.../reports/compliance-2025-Q1.pdf",
  "generatedAt": "2025-01-20T10:30:00Z",
  "error": "Template not found",
  "code": "TEMPLATE_NOT_FOUND"
}
```

**Features**:
- ICA (Colombia) standard reports
- INVIMA compliance formats
- Custom report templates
- Multi-period aggregation
- Photo/signature inclusion
- Digital signatures for submission
- Export formats: PDF, Excel, CSV

---

### Get Compliance Reports

**Endpoint**: `POST /compliance/get-reports`
**Status**: 📋 Planned
**Convex Function**: `compliance.getReports` - TO BE DESIGNED

**Purpose**: List generated compliance reports

**Response**:
```json
[
  {
    "id": "rep123...",
    "reportType": "ica_monthly",
    "period": "2025-01",
    "status": "submitted",
    "submittedAt": "2025-02-05T14:00:00Z",
    "reportUrl": "https://..."
  }
]
```

---

### Submit Compliance Report

**Endpoint**: `POST /compliance/submit`
**Status**: 📋 Planned
**Convex Function**: `compliance.submitReport` - TO BE DESIGNED

**Purpose**: Submit report to regulatory body (API integration or manual download)

**Request**:
```json
{
  "reportId": "<reportId>",
  "submissionMethod": "<method>",
  "recipientEmail": "<email>"
}
```

**Features**:
- Direct API submission (if available)
- Email delivery
- Audit trail logging
- Submission confirmation
- Retry mechanism

---

### Get Regulatory Requirements

**Endpoint**: `POST /compliance/get-requirements`
**Status**: 📋 Planned
**Convex Function**: `compliance.getRequirements` - TO BE DESIGNED

**Purpose**: Get list of upcoming compliance deadlines

**Response**:
```json
[
  {
    "id": "req123...",
    "requirementName": "ICA Monthly Report",
    "frequency": "monthly",
    "nextDueDate": "2025-02-05",
    "status": "pending",
    "priority": "high"
  }
]
```

**Features**:
- Calendar of deadlines
- Automatic reminders
- Status tracking
- Historical submissions

---

### Audit Trail

**Endpoint**: `POST /compliance/audit-trail`
**Status**: 📋 Planned
**Convex Function**: `compliance.getAuditTrail` - TO BE DESIGNED

**Purpose**: Get complete audit trail for compliance

**Response**:
```json
[
  {
    "id": "audit123...",
    "timestamp": "2025-01-20T10:30:00Z",
    "userId": "j97abc...",
    "userName": "Juan Pérez",
    "action": "activity_completed",
    "resourceType": "activity",
    "resourceId": "act123...",
    "details": "Completed Riego matutino activity",
    "ipAddress": "192.168.1.100"
  }
]
```

**Features**:
- Complete activity log
- User actions tracking
- Data change history
- System events
- Filterable by date, user, action type
- Export capability

---

## MODULE 26: Analytics Dashboard

Business intelligence, metrics, and insights.

### Get Production Metrics

**Endpoint**: `POST /analytics/production-metrics`
**Status**: 📋 Planned
**Convex Function**: `analytics.getProductionMetrics` - TO BE DESIGNED

**Purpose**: Key production metrics for dashboard

**Request Parameters**:
- facilityId
- startDate
- endDate
- groupBy (day, week, month, quarter)

**Response**:
```json
{
  "totalProductionOrders": 25,
  "activeOrders": 12,
  "completedOrders": 13,
  "averageCompletionRate": 94.5,
  "averageCycleTime": 58.3,
  "totalPlantsProcessed": 2500,
  "totalYield": 125000,
  "averageYieldPerPlant": 50,
  "yieldVariance": -2.5,
  "timeSeries": [
    {
      "period": "2025-01",
      "orders": 8,
      "yield": 40000
    }
  ]
}
```

**Features**:
- Production volume trends
- Yield analytics
- Cycle time analysis
- Completion rate tracking
- Comparative analysis (vs targets)
- Forecasting

---

### Get Yield Trends

**Endpoint**: `POST /analytics/yield-trends`
**Status**: 📋 Planned
**Convex Function**: `analytics.getYieldTrends` - TO BE DESIGNED

**Purpose**: Yield analysis by cultivar, area, time period

**Response**:
```json
{
  "byCultivar": [
    {
      "cultivarName": "Cherry AK",
      "averageYield": 52.3,
      "totalBatches": 10,
      "trend": "increasing"
    }
  ],
  "byArea": [
    {
      "areaName": "Greenhouse A",
      "averageYield": 48.5,
      "totalBatches": 15
    }
  ],
  "byMonth": [
    {
      "month": "2025-01",
      "averageYield": 50.2,
      "totalYield": 5020
    }
  ]
}
```

**Features**:
- Cultivar performance comparison
- Area efficiency analysis
- Seasonal trends
- Yield optimization recommendations
- Outlier detection

---

### Get Cost Analysis

**Endpoint**: `POST /analytics/cost-analysis`
**Status**: 📋 Planned
**Convex Function**: `analytics.getCostAnalysis` - TO BE DESIGNED

**Purpose**: Cost tracking and profitability analysis

**Response**:
```json
{
  "totalCosts": 15000000,
  "costsByCategory": [
    {
      "category": "nutrients",
      "amount": 3500000,
      "percentage": 23.3
    },
    {
      "category": "labor",
      "amount": 8000000,
      "percentage": 53.3
    }
  ],
  "costPerKg": 120000,
  "profitMargin": 35.5,
  "breakEvenPoint": 125
}
```

**Features**:
- Cost per kg/unit
- Category breakdown
- Labor cost tracking
- Inventory cost tracking
- ROI calculation
- Profitability by batch

---

### Get Inventory Turnover

**Endpoint**: `POST /analytics/inventory-turnover`
**Status**: 📋 Planned
**Convex Function**: `analytics.getInventoryTurnover` - TO BE DESIGNED

**Purpose**: Inventory management analytics

**Response**:
```json
{
  "turnoverRate": 8.5,
  "averageDaysInStock": 42,
  "slowMovingItems": [
    {
      "inventoryId": "inv123...",
      "name": "Old Pesticide X",
      "daysInStock": 180,
      "currentStock": 50
    }
  ],
  "fastMovingItems": [
    {
      "inventoryId": "inv456...",
      "name": "Nutriente A",
      "turnoverRate": 12.5
    }
  ],
  "stockoutRisk": [
    {
      "inventoryId": "inv789...",
      "name": "Growing Medium",
      "daysUntilStockout": 7
    }
  ]
}
```

**Features**:
- Turnover rate calculation
- Slow-moving item identification
- Stockout predictions
- Reorder optimization
- Waste tracking

---

### Get Activity Efficiency

**Endpoint**: `POST /analytics/activity-efficiency`
**Status**: 📋 Planned
**Convex Function**: `analytics.getActivityEfficiency` - TO BE DESIGNED

**Purpose**: Activity execution performance analysis

**Response**:
```json
{
  "averageCompletionTime": 32.5,
  "estimateAccuracy": 87.3,
  "onTimeCompletion": 92.5,
  "mostEfficientActivities": [
    {
      "activityName": "Riego",
      "avgTime": 25,
      "estimateAccuracy": 95
    }
  ],
  "bottleneckActivities": [
    {
      "activityName": "Quality Check",
      "avgTime": 65,
      "estimateAccuracy": 70,
      "reason": "Underestimated duration"
    }
  ]
}
```

**Features**:
- Actual vs estimated duration
- On-time completion rates
- Bottleneck identification
- Resource utilization
- Improvement recommendations

---

### Export Analytics Data

**Endpoint**: `POST /analytics/export`
**Status**: 📋 Planned
**Convex Function**: `analytics.exportData` - TO BE DESIGNED

**Purpose**: Export analytics data for external analysis

**Request**:
```json
{
  "dataType": "production_metrics",
  "format": "csv",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31"
}
```

**Response**:
```json
{
  "success": true,
  "exportUrl": "https://cdn.../exports/production-2025-Q1.csv",
  "expiresAt": "2025-01-21T10:30:00Z"
}
```

**Export Formats**: CSV, Excel, JSON

---

## MODULE 27: Mobile App Interface (PWA)

Progressive Web App optimizations for mobile devices.

### Optimized Endpoints for Mobile

**Note**: Phase 5 mobile optimization focuses on:
1. Reduced payload sizes
2. Offline-first data sync
3. Push notifications
4. Camera integration
5. Location services

### Get Mobile Dashboard

**Endpoint**: `POST /mobile/dashboard`
**Status**: 📋 Planned
**Convex Function**: `mobile.getDashboard` - TO BE DESIGNED

**Purpose**: Lightweight dashboard for mobile devices

**Response**:
```json
{
  "todayActivities": 5,
  "overdueActivities": 2,
  "activeOrders": 3,
  "lowStockAlerts": 1,
  "recentActivity": [...]
}
```

**Features**:
- Minimal data payload
- Cached aggressively
- Quick load times (<1s)

---

### Sync Offline Data

**Endpoint**: `POST /mobile/sync`
**Status**: 📋 Planned
**Convex Function**: `mobile.syncOfflineData` - TO BE DESIGNED

**Purpose**: Sync offline changes when connection restored

**Request**:
```json
{
  "offlineChanges": [
    {
      "type": "activity_update",
      "activityId": "act123...",
      "data": {...},
      "timestamp": "2025-01-20T08:30:00Z"
    }
  ]
}
```

**Response**:
```json
{
  "synced": 5,
  "conflicts": 0,
  "errors": 0
}
```

**Features**:
- Conflict resolution
- Batch updates
- Background sync
- Delta updates only

---

### Push Notifications

**Endpoint**: `POST /mobile/subscribe-notifications`
**Status**: 📋 Planned
**Convex Function**: `mobile.subscribeNotifications` - TO BE DESIGNED

**Purpose**: Register device for push notifications

**Request**:
```json
{
  "userId": "<userId>",
  "deviceToken": "<token>",
  "platform": "ios"
}
```

**Notification Types**:
- Overdue activities
- Low stock alerts
- Pending approvals
- Pest detections
- Compliance deadlines

---

### Mobile Camera Upload

**Endpoint**: `POST /mobile/upload-photo`
**Status**: 📋 Planned
**Convex Function**: `mobile.uploadPhoto` - TO BE DESIGNED

**Purpose**: Optimized photo upload for mobile with compression

**Features**:
- Client-side compression
- Progressive upload
- Thumbnail generation
- EXIF data extraction
- GPS coordinates (if enabled)

---

### Offline Data Cache

**Endpoint**: `POST /mobile/cache-data`
**Status**: 📋 Planned
**Convex Function**: `mobile.getCacheData` - TO BE DESIGNED

**Purpose**: Bulk download for offline mode

**Response**:
```json
{
  "version": "2025-01-20T10:00:00Z",
  "facilities": [...],
  "areas": [...],
  "cultivars": [...],
  "suppliers": [...],
  "inventory": [...],
  "activeOrders": [...],
  "pendingActivities": [...]
}
```

**Features**:
- Version-based updates
- Delta sync
- Selective caching
- Compression

---

## MODULE 28: Third-Party Integrations

Connect with external systems and services.

### Connect Third-Party Service

**Endpoint**: `POST /integrations/connect`
**Status**: 📋 Planned
**Convex Function**: `integrations.connect` - TO BE DESIGNED

**Purpose**: Authenticate and connect to third-party service

**Request**:
```json
{
  "serviceName": "<serviceName>",
  "authMethod": "<authMethod>",
  "credentials": {
    "apiKey": "<apiKey>",
    "clientId": "<clientId>",
    "clientSecret": "<clientSecret>"
  },
  "config": {...}
}
```

**Service Types**:
- **ERP Systems**: SAP, Oracle, Microsoft Dynamics
- **Accounting**: QuickBooks, Xero, Contabilium (Colombia)
- **Inventory Management**: Fishbowl, Zoho Inventory
- **Regulatory**: ICA API (Colombia), INVIMA
- **Weather Services**: OpenWeather, Weather Underground
- **IoT Sensors**: Temp/humidity monitors, soil sensors

**Response**:
```json
{
  "success": true,
  "integrationId": "int123...",
  "connectionStatus": "connected",
  "lastSync": null,
  "error": "Invalid API key",
  "code": "INVALID_CREDENTIALS"
}
```

---

### List Integrations

**Endpoint**: `POST /integrations/list`
**Status**: 📋 Planned
**Convex Function**: `integrations.list` - TO BE DESIGNED

**Purpose**: List all configured integrations

**Response**:
```json
[
  {
    "id": "int123...",
    "serviceName": "QuickBooks",
    "status": "connected",
    "lastSync": "2025-01-20T09:00:00Z",
    "nextSync": "2025-01-21T09:00:00Z",
    "syncFrequency": "daily"
  }
]
```

---

### Sync with External System

**Endpoint**: `POST /integrations/sync`
**Status**: 📋 Planned
**Convex Function**: `integrations.syncData` - TO BE DESIGNED

**Purpose**: Manually trigger sync with external system

**Request**:
```json
{
  "integrationId": "<integrationId>",
  "syncDirection": "bidirectional",
  "dataTypes": ["inventory", "financial"]
}
```

**Sync Directions**:
- **pull**: Import from external system
- **push**: Export to external system
- **bidirectional**: Two-way sync

**Response**:
```json
{
  "success": true,
  "recordsImported": 150,
  "recordsExported": 75,
  "conflicts": 2,
  "errors": 0,
  "syncDuration": 5.3
}
```

---

### Disconnect Integration

**Endpoint**: `POST /integrations/disconnect`
**Status**: 📋 Planned
**Convex Function**: `integrations.disconnect` - TO BE DESIGNED

**Purpose**: Disconnect and remove integration

**Request**:
```json
{
  "integrationId": "<integrationId>",
  "deleteHistory": false
}
```

---

### Get Integration Logs

**Endpoint**: `POST /integrations/logs`
**Status**: 📋 Planned
**Convex Function**: `integrations.getLogs` - TO BE DESIGNED

**Purpose**: View sync logs and errors

**Response**:
```json
[
  {
    "id": "log123...",
    "integrationId": "int123...",
    "timestamp": "2025-01-20T09:00:00Z",
    "action": "sync",
    "status": "success",
    "recordsProcessed": 150,
    "errors": [],
    "duration": 5.3
  }
]
```

---

### Webhook Configuration

**Endpoint**: `POST /integrations/configure-webhook`
**Status**: 📋 Planned
**Convex Function**: `integrations.configureWebhook` - TO BE DESIGNED

**Purpose**: Set up webhooks for real-time updates

**Request**:
```json
{
  "integrationId": "<integrationId>",
  "webhookUrl": "https://external-system.com/webhooks/alquemist",
  "events": ["activity_completed", "order_completed", "low_stock"],
  "authMethod": "bearer_token",
  "authToken": "<token>"
}
```

**Features**:
- Event-driven updates
- Real-time notifications
- Retry mechanism
- Signature verification

---

## IMPLEMENTATION STATUS SUMMARY

### Module Status

**MODULE 14: Compliance & Reporting** - ~10 endpoints (estimated)
- 📋 Generate compliance report
- 📋 Get compliance reports
- 📋 Submit compliance report
- 📋 Get regulatory requirements
- 📋 Get audit trail
- 📋 Export audit data
- 📋 Compliance template management
- 📋 Schedule reports
- 📋 Compliance alerts
- 📋 Regulatory updates feed

**MODULE 26: Analytics Dashboard** - ~12 endpoints (estimated)
- 📋 Get production metrics
- 📋 Get yield trends
- 📋 Get cost analysis
- 📋 Get inventory turnover
- 📋 Get activity efficiency
- 📋 Get quality metrics
- 📋 Get labor productivity
- 📋 Get area utilization
- 📋 Get pest incidence
- 📋 Export analytics data
- 📋 Custom dashboard builder
- 📋 Forecasting models

**MODULE 27: Mobile App (PWA)** - ~8 endpoints (estimated)
- 📋 Get mobile dashboard
- 📋 Sync offline data
- 📋 Subscribe to push notifications
- 📋 Upload photo (optimized)
- 📋 Get offline cache data
- 📋 Update cache version
- 📋 Log mobile analytics
- 📋 Get mobile-optimized activity list

**MODULE 28: Third-Party Integrations** - ~10 endpoints (estimated)
- 📋 Connect third-party service
- 📋 List integrations
- 📋 Sync with external system
- 📋 Disconnect integration
- 📋 Get integration logs
- 📋 Configure webhook
- 📋 Test connection
- 📋 Get available integrations
- 📋 Update integration config
- 📋 Handle incoming webhooks

**Total Phase 5 Endpoints**: ~40 endpoints (0 implemented, 40 planned)

**Note**: Exact endpoint count will be determined during detailed design phase.

---

### Convex Files to Create

- `convex/compliance.ts` - MODULE 14
- `convex/analytics.ts` - MODULE 26
- `convex/mobile.ts` - MODULE 27
- `convex/integrations.ts` - MODULE 28
- `convex/reports.ts` - Shared reporting utilities
- `convex/webhooks.ts` - Webhook handling

---

### External Dependencies

**Compliance & Regulatory**:
- ICA API (Colombia) - if available
- INVIMA API (Colombia) - if available
- PDF generation library
- Digital signature service

**Analytics**:
- Charting libraries (Chart.js, D3.js)
- Statistical analysis (Python backend or JS libraries)
- Data export tools

**Mobile**:
- Service Worker API (PWA)
- Push Notification services (FCM, APNs)
- IndexedDB (offline storage)
- Camera API

**Integrations**:
- OAuth 2.0 providers
- API clients for each service
- Webhook signature verification
- Rate limiting

---

## ERROR CODES

**Phase 5 Specific Error Codes**:
- `REPORT_GENERATION_FAILED` - Report could not be generated
- `SUBMISSION_FAILED` - Report submission to regulatory body failed
- `INTEGRATION_NOT_FOUND` - Integration ID doesn't exist
- `CONNECTION_FAILED` - Cannot connect to external service
- `INVALID_CREDENTIALS` - Authentication credentials invalid
- `SYNC_CONFLICT` - Data conflict during synchronization
- `WEBHOOK_VERIFICATION_FAILED` - Webhook signature invalid
- `QUOTA_EXCEEDED` - API rate limit exceeded
- `SERVICE_UNAVAILABLE` - External service temporarily unavailable
- `OFFLINE_SYNC_CONFLICT` - Conflict during offline data sync

For complete error handling, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md).

---

## INTEGRATION PRIORITIES

### Phase 5A: Compliance (High Priority)

**Colombia-Specific**:
1. **ICA Integration** - Agricultural regulatory body
   - Cultivation reports
   - Movement tracking
   - Compliance submissions
2. **INVIMA Integration** - Health regulatory body
   - Quality certifications
   - Lab result submissions
   - Product approvals

**Implementation Timeline**: Q2 2025

---

### Phase 5B: Analytics (Medium Priority)

**Features**:
1. Production dashboards
2. Yield optimization
3. Cost tracking
4. Inventory analytics

**Implementation Timeline**: Q3 2025

---

### Phase 5C: Mobile Optimization (Medium Priority)

**Features**:
1. PWA conversion
2. Offline mode
3. Push notifications
4. Camera optimization

**Implementation Timeline**: Q3-Q4 2025

---

### Phase 5D: Third-Party Integrations (Lower Priority)

**Priority Integrations**:
1. **Accounting** - QuickBooks or Contabilium (Colombia)
2. **Weather Services** - OpenWeather
3. **IoT Sensors** - Custom sensor integrations

**Implementation Timeline**: Q4 2025 - Q1 2026

---

## BUBBLE DEVELOPER NOTES

### Phase 5 Considerations

**Not Immediate Priority**:
- Phase 5 features are planned for future implementation
- Focus on Phase 1-4 first to validate core workflows
- Phase 5 designs may change based on Phase 1-4 learnings

**Progressive Enhancement**:
- Build Phase 5 incrementally
- Start with compliance (highest business value)
- Add analytics once data volume sufficient
- Mobile optimization after desktop stable
- Integrations based on customer demand

**Architecture Preparation**:
- Design Phase 1-4 with Phase 5 in mind
- Use proper data structures for reporting
- Log audit trail from day 1
- Design API with external integrations in mind

---

## REAL-TIME UPDATES & DATA POLLING

**Overview**: Phase 5 features (Compliance, Analytics, Mobile, Integrations) have minimal real-time polling requirements. These are primarily reporting and integration features that don't require constant updates. Polling, when used, should be minimal and user-initiated.

### Polling Requirements by Module

| Module | Data Type | Volatility | Recommended Polling | Use Case |
|--------|-----------|-----------|-------------------|----------|
| Compliance & Reporting | Reports/Submissions | Low | Page load only | Reports generated on-demand, not monitored |
| Analytics Dashboard | Historical Data | None | Page load only | Analytics computed once, static reports |
| Mobile App (PWA) | Synced Data | Medium | 60-120 seconds | Background sync, offline reconciliation |
| Third-Party Integrations | Webhook Events | Variable | Event-based | External system triggers data sync |

### Implementation Patterns

#### Pattern 1: Page Load Only (Analytics & Reporting)

**Use When**: Viewing static reports, historical data, or generated compliance documents.

**Workflow**:
```javascript
// Compliance Report List Page
Workflow: Page Load
  → Step 1: API getComplianceReports (with date range filters)
  → Step 2: Set repeating group data source
  → Step 3: Display report metadata (date, status, type)

// Analytics Dashboard
Workflow: Page Load
  → Step 1: API getProductionAnalytics (facility, date range)
  → Step 2: Display charts (production metrics, yields, costs)
  → Step 3: No polling - charts are static snapshots

// Report Generation
Workflow: Button "Generate Report" clicked
  → Show loading "Generating compliance report..."
  → Call API: generateComplianceReport (blocking call, timeout 30s)
  → Save PDF to cloud storage
  → Show download/preview link
```

**Cost**: Minimal (1 call per page load)
**Latency**: 0 seconds (manual refresh)
**Developer Notes**:
- Reports are generated on-demand, not monitored
- Analytics are historical snapshots
- No periodic timers needed
- User-triggered refreshes sufficient

---

#### Pattern 2: Event-Based Sync (Mobile & Integrations)

**Use When**: Mobile app syncing offline data or third-party integrations pushing updates.

**Workflow**:
```javascript
// Mobile PWA - Offline Sync

App State:
  → Online: Normal operation (instant API calls)
  → Offline: Queue changes locally
  → Back Online: Sync queued changes

Workflow: Connection restored
  → Call API: syncOfflineChanges
  → IF conflicts detected:
    → Show conflict resolution dialog
    → User chooses: Keep Local / Overwrite with Server
  → Sync completes, resume normal operation

// Third-Party Integration - Webhook Callback

External System (Accounting, Weather, IoT):
  → Change occurs in external system
  → Webhooks send event to `/integrations/webhook/<type>`
  → Convex stores event in queue
  → User-initiated refresh OR scheduled pull:
    → Call API: getIntegrationData
    → Fetch accumulated events
    → Update local data
```

**Cost**: Minimal (on-demand, event-driven)
**Latency**: 0-60 seconds (when user syncs or webhook arrives)

---

#### Pattern 3: Smart Sync for Mobile (PWA)

**Use When**: Mobile app needs background synchronization without draining battery.

**Workflow**:
```javascript
// PWA Background Sync (Advanced)

Workflow: Every 2-5 minutes (less aggressive than Phase 4)
  → IF device connected to Wi-Fi (not cellular):
    → Sync offline changes with server
    → Download updated data if available
  → IF on cellular:
    → Only sync if user explicitly requests
    → Minimize data transfer

Workflow: App suspends
  → Auto-save all local changes
  → Store in local database
  → No active polling

Workflow: App resumes
  → User sees last known state
  → Check server for updates (blocking call)
  → Merge if conflicts
  → Show "Last synced: 2:45 PM"
```

**Cost**: Low (Wi-Fi only, 2-5 minute intervals)
**Latency**: 0-5 minutes (periodic)
**Battery Impact**: Minimal (respects device state)

---

### Compliance & Regulatory Considerations

**Phase 5A - Compliance Reporting**:

No real-time polling needed because:
- Reports are generated on-demand (user-initiated)
- Submissions happen at regulatory deadlines (scheduled)
- Audit trails are immutable (no live updates)
- Historical data doesn't change after period close

**Implementation**:
```javascript
// Compliance Workflow

User selects: Date range + Report type
  ↓
Click "Generate Report" button
  ↓
Backend processes (3-10 seconds):
  1. Query activities/data for period
  2. Calculate metrics
  3. Validate compliance requirements
  4. Generate PDF with signatures/photos
  ↓
User downloads/previews PDF
```

**No polling** - Single blocking call handles entire process

---

### Analytics Dashboard - Static vs Dynamic

**Static (No Polling)**:
- YTD production volumes
- Lifetime yield trends
- Historical cost analysis
- Compliance status summary

**Semi-Dynamic (Reload on Navigation)**:
- This month's metrics
- Active order progress (load on page return)
- Latest production data

**Never Real-Time**:
- Analytics are historical summaries
- 24-hour lag acceptable
- Real-time needs met by Phase 4 production dashboard

**Implementation**:
```javascript
// Production Analytics Page

Workflow: Page Load
  → API: getProductionAnalytics
    - Parameters: facility, dateRange
  → Display charts (no updating)
  → Provide "Refresh" button for manual reload

Workflow: Date Range Selector Changed
  → API: getProductionAnalytics (new date range)
  → Update all charts

Workflow: Browser Back Button
  → Page reloads naturally
  → getProductionAnalytics called again
```

**Cost**: 1 call per page load or manual refresh
**No timers or polling loops**

---

### Third-Party Integration Data Sync

**Scenario**: Accounting software, Weather API, IoT sensors

**Synchronization Patterns**:

#### Pattern A: Pull-Based (User-Triggered)
```javascript
// Manual Integration Sync

Element: Button "Sync with QuickBooks"
Workflow: Click
  → Show spinner "Syncing..."
  → Call API: syncIntegration("quickbooks")
  → Convex calls external API
  → Store results
  → Show "Synced 45 transactions" + timestamp
```

**Cost**: User-initiated only
**Latency**: 2-5 seconds per sync

#### Pattern B: Webhook-Based (Event-Driven)
```javascript
// External System → Alquemist

External system detects change:
  → POST to alquemist: /integrations/webhook/weather
  → Payload: { eventType, data }
  → Convex stores in queue

User views Dashboard:
  → Shows latest weather data from cache
  → No polling needed
```

**Cost**: Zero (push-based)
**Latency**: Real-time (external system depends)

#### Pattern C: Scheduled Pull (Cron Job)
```javascript
// Automated periodic sync (if no webhook available)

Convex Cron:
  → Every 2 hours: Check external API for new data
  → Query: "Give me changes since last sync"
  → Store results in Convex database

Users see data when they refresh page
```

**Cost**: 12 calls/day (configurable)
**Latency**: 0-2 hours

---

### Mobile PWA Offline & Sync Strategy

**Design Pattern**:
```javascript
// Offline-First Mobile App

State: Online
  → User actions: Immediate API calls
  → Auto-save every field change
  → Instant feedback

State: Network Lost
  → User actions: Store locally
  → Queue changes in local database
  → Show "Offline mode" indicator
  → Continue working normally

State: Network Restored
  → Auto-sync queued changes
  → IF no conflicts: Silent sync
  → IF conflicts: Show dialog
  → Resume normal operation
```

**Polling Avoided**:
- Mobile uses local-first approach
- No constant polling (saves battery)
- Sync only on demand or connection change

**Background Sync** (Advanced):
- Browser's Background Sync API (if supported)
- Sync only on Wi-Fi to save data
- 2-hour minimum intervals
- User can manually trigger anytime

---

### Cost Implications Summary

| Feature | Pattern | Calls/Hour | Data Freshness | Notes |
|---------|---------|-----------|-----------------|-------|
| Compliance Reports | Page load only | 0-1 | Manual refresh | Generate on-demand |
| Analytics Dashboard | Page load only | 0-1 | 24h+ acceptable | Historical data only |
| Report Generation | Blocking call | 1 per report | Immediate | User-triggered |
| Mobile Sync (Wi-Fi) | 2-5 min interval | 12-30 | 2-5 minutes | Background only |
| Mobile Sync (Cellular) | Manual only | Variable | On-demand | User controls |
| Webhook Events | Event-based | Variable | Real-time | External system pushes |
| Scheduled Integrations | Cron job | 12-24 | 1-2 hours | Configurable |

**Recommended for Phase 5**:
- **Compliance Reports**: Page load only (no polling)
- **Analytics Dashboard**: Page load only (no polling)
- **Mobile Sync**: 2-5 minute background sync (Wi-Fi only)
- **Integrations**: Event-based webhooks or user-triggered sync
- **Real-time Dashboard**: Not needed in Phase 5 (Phase 4 handles it)

---

### Bubble Developer Guidance

**Key Design Points**:

1. **No Aggressive Polling**:
   - ❌ Compliance reports do NOT auto-refresh
   - ❌ Analytics do NOT update every 30 seconds
   - ✅ Reports generate on-demand only
   - ✅ Analytics computed once per load

2. **Mobile First Strategy**:
   - ✅ Use offline-first architecture
   - ✅ Sync automatically (when appropriate)
   - ✅ Show sync status to user
   - ❌ Do NOT poll for updates constantly

3. **Integration Flexibility**:
   - ✅ Support webhooks (no polling)
   - ✅ Support manual sync button
   - ✅ Support scheduled background sync
   - ❌ Avoid constant polling for external data

4. **Performance Optimization**:
   - ✅ Cache analytics results (24 hours)
   - ✅ Compress historical data exports
   - ✅ Lazy-load large reports
   - ✅ Use pagination for data lists

5. **User Experience**:
   - ✅ Show "Last generated" timestamp
   - ✅ Provide "Refresh Now" button
   - ✅ Show sync progress for integrations
   - ✅ Explain offline limitations clearly

---

### Future Considerations for Phase 5

**WebSocket Upgrade Path** (Not Required Now):
- If Phase 5 implements real-time compliance notifications
- Could upgrade to WebSocket for live alert delivery
- Would replace polling pattern shown above
- Significant architectural change for Phase 5+

**Machine Learning Integration**:
- Predictive analytics (no polling needed)
- Computed daily/weekly batch jobs
- Results stored and displayed historically
- Not a real-time feature

**Multi-Facility Management**:
- Analytics across multiple facilities
- Could benefit from smart polling (if needed later)
- Currently: Page load only sufficient

---

### Testing Real-Time Behavior

**Test Checklist**:
- [ ] Compliance reports generate within timeout (30s)
- [ ] Analytics charts display correctly
- [ ] Mobile app syncs offline changes successfully
- [ ] Webhook events processed and stored
- [ ] Manual sync button works
- [ ] No data loss during offline state
- [ ] Conflict resolution works correctly
- [ ] Integration data stays fresh
- [ ] No unnecessary API calls detected
- [ ] Mobile battery impact is minimal

---

## TESTING CHECKLIST

Phase 5 Advanced Features (0/~40 endpoints ready):

**Compliance & Reporting**:
- [ ] Compliance reports generate correctly
- [ ] Reports match regulatory templates
- [ ] Audit trail captures all actions
- [ ] Export formats work (PDF, Excel, CSV)
- [ ] Submission workflow functional
- [ ] Digital signatures valid
- [ ] Deadline reminders trigger

**Analytics**:
- [ ] Production metrics calculate correctly
- [ ] Charts render properly
- [ ] Filters and date ranges work
- [ ] Export to Excel maintains formatting
- [ ] Forecasts reasonably accurate
- [ ] Cost tracking matches actuals
- [ ] Performance acceptable with large datasets

**Mobile (PWA)**:
- [ ] App installs as PWA
- [ ] Offline mode functional
- [ ] Push notifications deliver
- [ ] Camera integration works
- [ ] Sync resolves conflicts correctly
- [ ] Performance on 3G acceptable
- [ ] Battery usage reasonable

**Integrations**:
- [ ] OAuth flow completes successfully
- [ ] Data syncs bidirectionally
- [ ] Conflicts handled gracefully
- [ ] Webhooks receive events
- [ ] Rate limiting respected
- [ ] Connection failures handled
- [ ] Logs provide debugging info

---

## FUTURE ENHANCEMENTS

**Beyond Phase 5**:

**Machine Learning**:
- Predictive analytics (yield forecasting)
- Anomaly detection (quality issues)
- Optimization recommendations
- Demand forecasting

**Advanced Features**:
- Multi-facility management dashboard
- Supply chain tracking
- Blockchain for traceability
- Marketplace integration
- B2B portal

**Internationalization**:
- Multi-language support (beyond ES/EN)
- Multi-currency
- Region-specific compliance
- International shipping

**Enterprise Features**:
- Multi-company management
- White-label customization
- Advanced RBAC
- SSO integration
- SLA monitoring

---

## APPENDIX: BUBBLE INTEGRATION REFERENCE

**Important**: Bubble documentation serves as **visual reference only**. Implement all features in Next.js 15.

### For Next.js Developers

**Focus on**:
- Advanced analytics with interactive charts (Recharts/Chart.js)
- PDF report generation (jsPDF or server-side rendering)
- PWA enhancements (offline sync, push notifications)
- Third-party integrations (REST APIs, webhooks, OAuth)
- Dashboard optimization for real-time data

All Bubble-specific content can be ignored. Use the Next.js patterns, chart libraries, and PWA examples shown above.

---

## IMPLEMENTATION STATUS

**Backend Status**: 📋 Phase 5 Backend PLANNED
- ~40 Convex endpoints to be designed
- Advanced analytics queries
- PDF generation backend logic
- Webhook infrastructure
- Third-party API integration
- Depends on Phase 1-4 completion and user feedback

**Frontend Status**: 📋 Implementation Planned
- Analytics dashboards with charts
- PDF viewer and download functionality
- PWA service worker and offline sync
- Push notification setup
- Integration configuration UI
- Advanced reporting interfaces

**Endpoint Coverage**: 0/~40 (0% - specifications pending)

**Special Requirements**:
- Chart library integration (Recharts or Chart.js)
- PDF generation library (jsPDF or React-PDF)
- Service worker for offline capabilities
- Push notification infrastructure
- Webhook signature verification
- OAuth provider configuration
- Multi-currency and i18n support

**Next Steps**:
1. 📋 Complete Phase 1-4 implementation first
2. 📋 Gather user feedback from production use
3. 📋 Validate Phase 5 feature requirements
4. 📋 Prioritize Phase 5 modules based on user needs
5. 📋 Design detailed specifications for priority features
6. 📋 Begin incremental Phase 5 implementation

---

**Last Updated**: 2025-01-30
**Version**: 3.0 (Updated for Next.js-first methodology)
