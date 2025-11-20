# PHASE 5: ADVANCED FEATURES - API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Related Documentation**:
- **Database Schema**: [../database/SCHEMA.md](../database/SCHEMA.md)
- **UI Requirements**: [../ui/bubble/PHASE-5-ADVANCED.md](../ui/bubble/PHASE-5-ADVANCED.md)
- **Restructure Plan**: [../TEMP-API-RESTRUCTURE-PLAN.md](../TEMP-API-RESTRUCTURE-PLAN.md)

---

## PHASE 5 OVERVIEW

**Purpose**: Analytics, compliance, reporting, mobile optimization, and integrations

**Modules**:
- **MODULE 14**: Compliance & Reporting
- **MODULE 26**: Analytics Dashboard
- **MODULE 27**: Mobile App Interface (PWA)
- **MODULE 28**: Third-Party Integrations

**Estimated Pages**: 18 screens
**Entry Point**: After production operations are running (Phase 4)
**Status**: 📋 Planned for future implementation

**Note**: Phase 5 specifications are placeholders for future development. Detailed endpoint specifications will be added once Phase 1-4 are implemented and requirements are validated.

---

## AUTHENTICATION

All Phase 5 endpoints require authentication via Bearer token.

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Token Source**: `Current User's session_token` in Bubble

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

**Endpoint**: `GET /compliance/get-reports`
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

**Endpoint**: `GET /compliance/get-requirements`
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

**Endpoint**: `GET /compliance/audit-trail`
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

**Endpoint**: `GET /analytics/production-metrics`
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

**Endpoint**: `GET /analytics/yield-trends`
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

**Endpoint**: `GET /analytics/cost-analysis`
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

**Endpoint**: `GET /analytics/inventory-turnover`
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

**Endpoint**: `GET /analytics/activity-efficiency`
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

**Endpoint**: `GET /mobile/dashboard`
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

**Endpoint**: `GET /mobile/cache-data`
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

**Endpoint**: `GET /integrations/list`
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

**Endpoint**: `GET /integrations/logs`
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

**Status**: Phase 5 placeholder specification
**Ready Endpoints**: 0/~40 (0% complete)
**Priority**: After Phase 1-4 complete
**Next Steps**:
1. Complete Phase 1-4 implementation
2. Gather user feedback and requirements
3. Validate Phase 5 specifications
4. Prioritize Phase 5A (Compliance) features
5. Detailed design for highest-priority features
6. Begin incremental Phase 5 implementation

---

**Last Updated**: 2025-01-19
**Version**: 2.0 (New - placeholder for future development)
