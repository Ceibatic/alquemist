# PHASE 3: API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Database Schema**: See [../database/SCHEMA.md](../database/SCHEMA.md)
**UI Requirements**: See [../ui/bubble/PHASE-3-ADVANCED.md](../ui/bubble/PHASE-3-ADVANCED.md)

⚠️ **STATUS**: All Phase 3 endpoints are NOT YET IMPLEMENTED. Backend development required.

---

## Authentication

**All Phase 3 endpoints require authentication** using custom session tokens.

### Required Headers

```
Authorization: Bearer {session_token}
Content-Type: application/json
```

### Authentication Flow

Phase 3 endpoints use the same authentication system as Phases 1 and 2:

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

## MODULE 14: Compliance & Reporting

### Get Compliance Events

**Endpoint**: `GET /compliance/get-events`

**Triggered by**: Bubble compliance dashboard page load

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

**Note**: `facilityId` is optional - if not provided, returns events for all facilities under company from session token.

**Response**:
```json
{
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
    }
  ]
}
```

**Convex Function**: `compliance.getEvents` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `compliance_events` table

---

### Generate Compliance Report

**Endpoint**: `POST /compliance/generate-report`

**Triggered by**: Bubble "Generate" button

**Headers**:
```
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Request**:
```json
{
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
```

**Note**: Generated reports are scoped to company from session token (multi-tenant isolation).

**Response**:
```json
{
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

**Convex Function**: `compliance.generateReport` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: Multiple tables for report data
- **Writes**: `media_files` → store PDF/Excel
- **External**: PDF generation library

---

### Get Audit Trail

**Endpoint**: `GET /compliance/get-audit-trail`

**Triggered by**: Bubble audit trail page load

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "startDate": 1727827200000,
  "endDate": 1730505600000,
  "activityTypes": ["watering", "feeding", "harvest", "movement"],
  "userId": null
}
```

**Response**:
```json
{
  "activities": [
    {
      "id": "act777",
      "timestamp": 1730073600000,
      "activityType": "watering",
      "performedBy": "John Doe",
      "entityType": "batch",
      "entityId": "batch001",
      "details": {
        "materialsUsed": [
          {
            "product": "Water",
            "quantity": 100,
            "unit": "L"
          }
        ],
        "notes": "Plant color good"
      }
    }
  ],
  "totalActivities": 324,
  "exportUrl": "https://storage.../audit_trail_export.xlsx"
}
```

**Convex Function**: `compliance.getAuditTrail` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `activities` table (filtered by date, type, user)

---

### Add Certificate

**Endpoint**: `POST /compliance/add-certificate`

**Triggered by**: Bubble "Save" button in add certificate popup

**Request**:
```json
{
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
```

**Response**:
```json
{
  "success": true,
  "certificateId": "cert789...",
  "renewalDate": 1767139200000,
  "message": "Certificado agregado exitosamente"
}
```

**Convex Function**: `certificates.add` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `certificates` table

---

### Get Certificates

**Endpoint**: `GET /compliance/get-certificates`

**Triggered by**: Bubble certificates page load

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "status": "valid"
}
```

**Response**:
```json
{
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
    }
  ]
}
```

**Convex Function**: `certificates.getByFacility` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `certificates` table

---

## MODULE 15: Analytics & Business Intelligence

### Get Analytics Dashboard

**Endpoint**: `GET /analytics/get-dashboard`

**Triggered by**: Bubble analytics dashboard page load

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "timeframe": "month",
  "month": 10,
  "year": 2025
}
```

**Response**:
```json
{
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
      {"month": "Sep", "yield": 98},
      {"month": "Oct", "yield": 108}
    ],
    "yieldChange": 10.2,
    "yieldChangePercent": 10.4
  },
  "consumption": {
    "nutrientA": {"quantity": 245, "unit": "units"},
    "water": {"quantity": 4200, "unit": "L"}
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

**Convex Function**: `analytics.getDashboard` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: Multiple tables for aggregation
- **Calculates**: Metrics, trends, averages

---

### Get Yield Analysis

**Endpoint**: `POST /analytics/get-yield-analysis`

**Triggered by**: Bubble "View Details" button

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "cropTypeId": "crop123",
  "startDate": 1712016000000,
  "endDate": 1730073600000
}
```

**Response**:
```json
{
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
    {"id": "batch001", "yield": 35, "target": 30, "vsTarget": 117}
  ],
  "factorsInfluencingYield": [
    {"factor": "nutrient_timing", "impact": "positive"}
  ],
  "cultivarComparison": [
    {"cultivar": "Cherry AK", "avgYield": 34}
  ],
  "areaPerformance": [
    {"area": "Veg Room 1", "avgYield": 34.2}
  ]
}
```

**Convex Function**: `analytics.getYieldAnalysis` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `batches`, `activities` for analysis
- **Calculates**: Averages, comparisons, correlations

---

### Compare Facilities

**Endpoint**: `POST /analytics/compare-facilities`

**Triggered by**: Bubble "Compare" button

**Request**:
```json
{
  "facilityIds": ["f78ghi...", "f99jkl..."],
  "metric": "yield_per_sqm",
  "timeframe": "month"
}
```

**Response**:
```json
{
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
  }
}
```

**Convex Function**: `analytics.compareFacilities` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: Data from multiple facilities
- **Calculates**: Comparisons and benchmarks

---

## MODULE 16: Mobile Experience & Media

### Get Mobile Dashboard

**Endpoint**: `GET /mobile/get-dashboard`

**Triggered by**: PWA app load

**Request**:
```json
{
  "userId": "user123",
  "facilityId": "f78ghi..."
}
```

**Response**:
```json
{
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

**Convex Function**: `mobile.getDashboard` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `scheduled_activities`, `inventory_items`, `batches`

---

### Upload Photo (Mobile)

**Endpoint**: `POST /mobile/upload-photo`

**Triggered by**: Mobile camera button

**Request**:
```json
{
  "entityType": "batch",
  "entityId": "batch001",
  "photoBase64": "[base64_string]",
  "category": "quality_check",
  "caption": "QC check - Day 15",
  "takenAt": 1730106000000,
  "location": {"lat": 6.244747, "lng": -75.581211}
}
```

**Response**:
```json
{
  "success": true,
  "mediaFileId": "media999...",
  "url": "https://storage.../qc_batch001_20251028.jpg",
  "thumbnailUrl": "https://storage.../thumbnails/qc_batch001_20251028_thumb.jpg",
  "message": "Foto subida exitosamente"
}
```

**Convex Function**: `mobile.uploadPhoto` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `media_files` table
- **External**: Cloud storage (S3, GCS, etc.)

---

### Sync Offline Queue

**Endpoint**: `POST /mobile/sync-offline-queue`

**Triggered by**: PWA reconnection

**Request**:
```json
{
  "userId": "user123",
  "queuedActivities": [
    {
      "localId": "offline_1",
      "batchId": "batch001",
      "activityType": "watering",
      "timestamp": 1730099800000,
      "materialsConsumed": [...],
      "observations": "Offline activity 1"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "syncedCount": 2,
  "failedCount": 0,
  "syncedActivities": [
    {"localId": "offline_1", "activityId": "act888..."}
  ],
  "message": "2 actividades sincronizadas"
}
```

**Convex Function**: `mobile.syncOfflineQueue` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: Multiple `activities` records
- **Updates**: Related `inventory_items`, `scheduled_activities`

---

### Get Media Gallery

**Endpoint**: `GET /media/get-gallery`

**Triggered by**: Media gallery page load

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "category": "all",
  "limit": 50,
  "offset": 0
}
```

**Response**:
```json
{
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
    }
  ],
  "total": 47,
  "storageUsed": 1258291200,
  "storageLimit": 10737418240
}
```

**Convex Function**: `media.getGallery` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `media_files` table with pagination

---

## MODULE 17: Integrations & APIs

### Get Active Integrations

**Endpoint**: `GET /integrations/get-active`

**Triggered by**: Integrations dashboard page load

**Request**:
```json
{
  "companyId": "k12def..."
}
```

**Response**:
```json
{
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
    }
  ]
}
```

**Convex Function**: `integrations.getActive` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `integrations` table

---

### Create Integration

**Endpoint**: `POST /integrations/create`

**Triggered by**: Bubble "Save" button in integration popup

**Request**:
```json
{
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
```

**Response**:
```json
{
  "success": true,
  "integrationId": "int456...",
  "message": "Integración creada exitosamente",
  "testConnection": "passed"
}
```

**Convex Function**: `integrations.create` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `integrations` table
- **External**: Test connection to third-party API

---

### Test Integration Connection

**Endpoint**: `POST /integrations/test-connection`

**Triggered by**: Bubble "Test Connection" button

**Request**:
```json
{
  "integrationId": "int456"
}
```

**Response**:
```json
{
  "success": true,
  "status": "connected",
  "responseTime": 245,
  "message": "Conexión exitosa"
}
```

**Convex Function**: `integrations.testConnection` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `integrations` → get config
- **External**: Ping third-party API

---

### Sync Now

**Endpoint**: `POST /integrations/sync-now`

**Triggered by**: Bubble "Sync Now" button

**Request**:
```json
{
  "integrationId": "int456",
  "direction": "pull"
}
```

**Response**:
```json
{
  "success": true,
  "syncId": "sync789...",
  "recordsSynced": 45,
  "recordsFailed": 0,
  "duration": 1234,
  "message": "Sincronización completada"
}
```

**Convex Function**: `integrations.syncNow` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads/Writes**: Varies by integration type
- **Writes**: `integration_logs` → log sync event

---

### Subscribe Webhook

**Endpoint**: `POST /webhooks/subscribe`

**Triggered by**: Bubble webhook configuration

**Request**:
```json
{
  "companyId": "k12def...",
  "webhookUrl": "https://external-system.com/webhook/alquemist",
  "events": ["batch_completed", "low_stock", "harvest_recorded"],
  "secret": "whsec_abc123..."
}
```

**Response**:
```json
{
  "success": true,
  "webhookId": "wh789...",
  "message": "Webhook suscrito exitosamente"
}
```

**Convex Function**: `webhooks.subscribe` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `webhook_subscriptions` table

---

## CONVEX FILES TO CREATE

### Required Files (Priority Order):

1. **`convex/compliance.ts`** - Compliance events and reporting
2. **`convex/certificates.ts`** - Certificate management
3. **`convex/analytics.ts`** - Business intelligence queries
4. **`convex/mobile.ts`** - Mobile-specific endpoints
5. **`convex/media.ts`** - Photo and file management
6. **`convex/integrations.ts`** - Third-party integrations
7. **`convex/webhooks.ts`** - Webhook management

---

## IMPLEMENTATION STATUS SUMMARY

### ❌ Not Yet Implemented

**All Phase 3 modules** require complete Convex backend implementation:

- ❌ Module 14: Compliance (6 endpoints)
- ❌ Module 15: Analytics (3 endpoints)
- ❌ Module 16: Mobile & Media (4 endpoints)
- ❌ Module 17: Integrations (5 endpoints)

**Total**: ~18 endpoints to implement

---

## DEPENDENCIES

**Phase 3 requires Phase 1 & 2 completion**:
- Phase 1 Modules 1-6 (not all implemented)
- Phase 2 Modules 9-13 (not implemented)

**Implementation Order**:
1. Complete Phase 1 fully
2. Complete Phase 2 fully
3. Then implement Phase 3 modules

---

## INTERNATIONALIZATION (i18n) STRATEGY

**Backend Approach**: The API is **language-agnostic** and always sends technical codes, not translated messages.

See [PHASE-1-ENDPOINTS.md](./PHASE-1-ENDPOINTS.md#internationalization-i18n-strategy) for complete i18n strategy and error code translations.

### Additional Error Codes for Phase 3

| code | message_es | message_en |
|------|------------|------------|
| COMPLIANCE_EVENT_NOT_FOUND | Evento de cumplimiento no encontrado | Compliance event not found |
| CERTIFICATE_NOT_FOUND | Certificado no encontrado | Certificate not found |
| CERTIFICATE_EXPIRED | Certificado expirado | Certificate expired |
| REPORT_GENERATION_FAILED | Generación de reporte fallida | Report generation failed |
| INVALID_REPORT_TYPE | Tipo de reporte inválido | Invalid report type |
| INVALID_DATE_RANGE | Rango de fechas inválido | Invalid date range |
| INTEGRATION_NOT_FOUND | Integración no encontrada | Integration not found |
| INTEGRATION_CONNECTION_FAILED | Conexión de integración fallida | Integration connection failed |
| INVALID_API_KEY | Clave API inválida | Invalid API key |
| WEBHOOK_FAILED | Webhook fallido | Webhook failed |
| SYNC_IN_PROGRESS | Sincronización en progreso | Sync in progress |
| DATA_EXPORT_FAILED | Exportación de datos fallida | Data export failed |
| INVALID_FORMAT | Formato inválido | Invalid format |
| FILE_TOO_LARGE | Archivo demasiado grande | File too large |
| UNSUPPORTED_FILE_TYPE | Tipo de archivo no soportado | Unsupported file type |

For implementation details, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md) and [../i18n/BUBBLE-IMPLEMENTATION.md](../i18n/BUBBLE-IMPLEMENTATION.md).

---

**Status**: Phase 3 API specification complete
**Ready Endpoints**: 0 endpoints
**Pending Endpoints**: 18 endpoints
**Next Steps**:
1. Complete Phase 1 & 2 first
2. Implement Phase 3 Convex functions
3. Set up PWA and offline capabilities
4. Test integration workflows
