# API ENDPOINTS RESTRUCTURE PLAN

**Created**: 2025-11-19
**Status**: Planning - Not yet executed
**Context**: Restructuring API documentation from 3 phases to 5 phases based on new UI/module organization

---

## Current State

### Existing Files
- ✅ `docs/api/PHASE-1-ENDPOINTS.md` - Contains Modules 1-2 only (Auth, Company setup)
- ❌ `docs/api/PHASE-2-OPERATIONS.md` - Deleted
- ❌ `docs/api/PHASE-3-ADVANCED.md` - Deleted

### Current Content
- Module 1: Authentication (11 endpoints) - ✅ Backend complete
- Module 2: Company Creation (geographic endpoints) - ✅ Backend complete
- Modules 3-6 marked as "Not yet implemented" (Facility, Areas, Cultivars, Suppliers)

---

## New Structure (5 Phases)

Based on files in `docs/ui/bubble/`:
- PHASE-1-ONBOARDING.md (7 screens, Modules 1-5)
- PHASE-2-BASIC-SETUP.md (18-21 screens, Modules 8, 15-21)
- PHASE-3-TEMPLATES.md (15 screens, Modules 22-23)
- PHASE-4-PRODUCTION.md (18 screens, Modules 24-25)
- PHASE-5-ADVANCED.md (18 screens, Modules 14, 26-28)

---

## Target Files Structure

### 1. PHASE 1: ONBOARDING & FOUNDATION
**File**: `docs/api/PHASE-1-ONBOARDING-ENDPOINTS.md`
**Status**: Backend complete ✅

**Modules**:
- **MODULE 1: Authentication** (✅ Already documented)
  - POST `/registration/check-email` - checkEmailAvailability
  - POST `/registration/register-step-1` - registerUserStep1
  - POST `/registration/verify-email` - verifyEmailToken
  - POST `/registration/resend-verification` - resendVerificationEmail
  - POST `/registration/check-verification-status` - checkVerificationStatus
  - POST `/registration/login` - login
  - GET `/registration/validate-token` - validateToken
  - POST `/registration/logout` - logout

- **MODULE 2: Company Creation** (✅ Already documented)
  - POST `/geographic/departments` - getDepartments
  - POST `/geographic/municipalities` - getMunicipalities
  - POST `/registration/register-step-2` - registerCompanyStep2

- **MODULE 3: Facility Creation & Basics** (⚠️ Need to document)
  - POST `/facilities/create` - createFacility
  - GET `/facilities/get-by-company` - getFacilitiesByCompany
  - POST `/facilities/check-license` - checkLicenseAvailability
  - POST `/facilities/update` - updateFacility
  - POST `/facilities/delete` - deleteFacility (soft delete)

- **MODULE 4: User Role Assignment** (⚠️ Need to create)
  - POST `/users/assign-role` - assignUserRole
  - GET `/users/get-by-company` - getUsersByCompany
  - POST `/users/update-role` - updateUserRole
  - POST `/users/deactivate` - deactivateUser

- **MODULE 5: Dashboard Home** (⚠️ Need to create)
  - GET `/dashboard/summary` - getDashboardSummary
  - GET `/dashboard/recent-activities` - getRecentActivities
  - GET `/dashboard/alerts` - getActiveAlerts

---

### 2. PHASE 2: BASIC SETUP & MASTER DATA
**File**: `docs/api/PHASE-2-BASIC-SETUP-ENDPOINTS.md`
**Status**: Partially complete (Areas backend ready)

**Modules**:
- **MODULE 8: Area Management** (✅ Backend ready)
  - POST `/areas/create` - createArea
  - GET `/areas/get-by-facility` - getAreasByFacility
  - POST `/areas/update` - updateArea
  - POST `/areas/delete` - deleteArea (soft delete)

- **MODULE 15: Cultivar Management** (⚠️ Need to create)
  - GET `/crops/get-types` - getCropTypes
  - GET `/cultivars/get-by-crop` - getCultivarsByCrop
  - POST `/facilities/link-cultivars` - linkCultivarsToFacility
  - POST `/cultivars/create-custom` - createCustomCultivar
  - GET `/cultivars/get-by-facility` - getCultivarsByFacility
  - POST `/cultivars/update` - updateCultivar
  - POST `/cultivars/delete` - deleteCultivar

- **MODULE 16: Supplier Management** (⚠️ Need to create)
  - POST `/suppliers/create` - createSupplier
  - GET `/suppliers/get-by-company` - getSuppliersByCompany
  - POST `/suppliers/update` - updateSupplier
  - POST `/suppliers/delete` - deleteSupplier (soft delete)

- **MODULE 17: Other Crops Management** (⚠️ Need to create)
  - POST `/other-crops/create` - createOtherCrop
  - GET `/other-crops/get-by-facility` - getOtherCropsByFacility
  - POST `/other-crops/update` - updateOtherCrop
  - POST `/other-crops/delete` - deleteOtherCrop

- **MODULE 18: Compliance Templates** (⚠️ Need to create)
  - POST `/compliance-templates/create` - createComplianceTemplate
  - GET `/compliance-templates/get-by-facility` - getComplianceTemplatesByFacility
  - POST `/compliance-templates/update` - updateComplianceTemplate
  - POST `/compliance-templates/delete` - deleteComplianceTemplate

- **MODULE 19: Inventory Management** (⚠️ Need to create - NEW comprehensive module)
  - POST `/inventory/create` - createInventoryItem
  - GET `/inventory/get-by-facility` - getInventoryByFacility
  - GET `/inventory/get-by-category` - getInventoryByCategory
  - POST `/inventory/update` - updateInventoryItem
  - POST `/inventory/adjust-stock` - adjustStock (consumption/addition)
  - GET `/inventory/low-stock` - getLowStockItems
  - POST `/inventory/delete` - deleteInventoryItem

  **Categories**: Living (plants, seeds), Equipment, Materials (growing), Consumables (nutrients, pesticides)

- **MODULE 20: Facility Settings** (⚠️ Need to create - NEW)
  - GET `/facilities/settings/get` - getFacilitySettings
  - POST `/facilities/settings/update` - updateFacilitySettings

- **MODULE 21: Account Settings** (⚠️ Need to create - NEW)
  - GET `/users/settings/get` - getAccountSettings
  - POST `/users/settings/update` - updateAccountSettings

---

### 3. PHASE 3: PRODUCTION TEMPLATES & AI
**File**: `docs/api/PHASE-3-TEMPLATES-ENDPOINTS.md`
**Status**: Not implemented ⚠️

**Modules**:
- **MODULE 22: Production Templates with Activity Scheduling** (⚠️ Need to create - NEW COMPLEX)
  - POST `/production-templates/create` - createProductionTemplate
  - GET `/production-templates/get-by-facility` - getProductionTemplatesByFacility
  - GET `/production-templates/get-by-id` - getProductionTemplateById
  - POST `/production-templates/duplicate` - duplicateProductionTemplate
  - POST `/production-templates/update` - updateProductionTemplate
  - POST `/production-templates/delete` - deleteProductionTemplate
  - POST `/production-templates/validate-schedule` - validateActivitySchedule

  **Activity Scheduling Types**:
  - One-time (specific day offset from start)
  - Recurring (daily, weekly, every N days, specific days of week)
  - Dependent (X days after another activity completes)

  **See**: docs/ACTIVITY-SCHEDULING-LOGIC.md for full algorithm

- **MODULE 23: AI Quality Check Templates** (⚠️ Need to create - NEW AI-POWERED)
  - POST `/ai/generate-qc-template` - generateQCTemplateFromDocument (Gemini API)
  - GET `/qc-templates/get-by-facility` - getQCTemplatesByFacility
  - GET `/qc-templates/get-by-id` - getQCTemplateById
  - POST `/qc-templates/regenerate` - regenerateQCTemplate (re-run AI)
  - POST `/qc-templates/delete` - deleteQCTemplate

  **AI Integration**: Google Gemini API
  - Input: PDF/Image of QC form
  - Process: Gemini extracts fields and generates HTML form structure
  - Output: HTML form stored directly (no manual editing)
  - Render: Dynamic rendering in Bubble

  **See**: docs/AI-QUALITY-CHECKS.md for full specification

---

### 4. PHASE 4: PRODUCTION EXECUTION
**File**: `docs/api/PHASE-4-PRODUCTION-ENDPOINTS.md`
**Status**: Not implemented ⚠️

**Modules**:
- **MODULE 24: Production Orders with Auto-Scheduling** (⚠️ Need to create - NEW COMPLEX)
  - POST `/production-orders/create` - createProductionOrder
  - GET `/production-orders/get-by-facility` - getProductionOrdersByFacility
  - GET `/production-orders/get-by-id` - getProductionOrderById
  - POST `/production-orders/update-status` - updateProductionOrderStatus
  - POST `/production-orders/approve` - approveProductionOrder (manager only)
  - POST `/production-orders/reject` - rejectProductionOrder (manager only)
  - POST `/production-orders/cancel` - cancelProductionOrder
  - GET `/production-orders/check-area-availability` - checkAreaAvailability
  - POST `/production-orders/auto-schedule` - autoScheduleActivities

  **Key Features**:
  - Create order from template
  - Manager approval workflow
  - Area availability check
  - Auto-schedule all activities based on start date + template rules
  - Phase progression tracking

- **MODULE 25: Activity Execution with AI Detection** (⚠️ Need to create - NEW AI-POWERED)
  - GET `/activities/get-by-order` - getActivitiesByProductionOrder
  - GET `/activities/get-by-id` - getActivityById
  - POST `/activities/update-progress` - updateActivityProgress
  - POST `/activities/complete` - completeActivity
  - POST `/activities/upload-photo` - uploadActivityPhoto
  - POST `/ai/detect-pests` - detectPestsAndDiseases (AI vision)
  - POST `/activities/create-remediation` - createRemediationActivity (MIPE/MIRFE)
  - POST `/activities/add-signature` - addDigitalSignature
  - GET `/activities/generate-report` - generateActivityReport (PDF)

  **AI Pest Detection**:
  - Upload photo during activity execution
  - AI analyzes for pests/diseases (computer vision)
  - Match against internal pest/disease database
  - User confirms detections
  - Auto-create remediation activities (MIPE/MIRFE protocols)

  **Execution Interface**: Multi-tab (General, Quality Check, Photos, Signature)

---

### 5. PHASE 5: ADVANCED FEATURES
**File**: `docs/api/PHASE-5-ADVANCED-ENDPOINTS.md`
**Status**: Planned 📋

**Modules**:
- **MODULE 14: Compliance & Reporting** (📋 Placeholder)
  - POST `/compliance/generate-report` - generateComplianceReport
  - GET `/compliance/get-reports` - getComplianceReports
  - POST `/compliance/submit` - submitComplianceReport
  - GET `/compliance/get-requirements` - getRegulatoryRequirements

- **MODULE 26: Analytics Dashboard** (📋 Placeholder)
  - GET `/analytics/production-metrics` - getProductionMetrics
  - GET `/analytics/yield-trends` - getYieldTrends
  - GET `/analytics/cost-analysis` - getCostAnalysis
  - GET `/analytics/inventory-turnover` - getInventoryTurnover

- **MODULE 27: Mobile App Interface (PWA)** (📋 Placeholder)
  - Optimized endpoints for mobile consumption
  - Offline sync capabilities
  - Push notifications

- **MODULE 28: Third-Party Integrations** (📋 Placeholder)
  - POST `/integrations/connect` - connectThirdPartyService
  - GET `/integrations/list` - listIntegrations
  - POST `/integrations/sync` - syncWithExternalSystem

---

## Implementation Steps

### Step 1: Archive Current File
```bash
mkdir -p docs/api/archive
cp docs/api/PHASE-1-ENDPOINTS.md docs/api/archive/PHASE-1-ENDPOINTS.md.backup
```

### Step 2: Create Phase 1 File
- Migrate existing Module 1-2 content
- Add Module 3: Facility endpoints (expand from "Not yet implemented" placeholders)
- Add Module 4: User Role endpoints (new)
- Add Module 5: Dashboard Home endpoints (new)
- Mark implementation status for each endpoint

### Step 3: Create Phase 2 File
- Module 8: Areas (expand from "Not yet implemented" placeholders)
- Modules 15-18: Standard CRUD following CRUD-PATTERN.md
- Module 19: Comprehensive inventory with categories
- Modules 20-21: Settings endpoints (new)

### Step 4: Create Phase 3 File
- Module 22: Production Templates with complex scheduling logic
- Module 23: AI Quality Check Templates with Gemini integration
- Reference supporting docs: ACTIVITY-SCHEDULING-LOGIC.md, AI-QUALITY-CHECKS.md

### Step 5: Create Phase 4 File
- Module 24: Production Orders with auto-scheduling
- Module 25: Activity Execution with AI pest detection
- Include approval workflows and AI vision integration

### Step 6: Create Phase 5 File
- Modules 14, 26-28: Placeholder structure for future implementation
- Basic endpoint structure without detailed specifications

---

## Documentation Format Standards

Each endpoint must include:

### 1. Endpoint Header
```markdown
### Endpoint Name

**Endpoint**: `METHOD /path`
**Status**: ✅ Ready / ⚠️ Not implemented / 📋 Planned
**Convex Function**: `file.functionName`
```

### 2. Bubble API Connector Configuration
```markdown
#### Bubble API Connector Configuration

**Name**: `callName`
**Use as**: Action / Data
**Method**: POST / GET
**URL**: `https://handsome-jay-388.convex.site/path`
**Data Type**: Single object / List of objects (if Data call)
```

### 3. Headers
```markdown
**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token> (if authenticated)
```
```

### 4. Body/Parameters
```markdown
**Body**: (for POST)
```json
{
  "field": "<paramName>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| paramName | text | Yes/No | Body/URL | example |
```

### 5. Response
```markdown
**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "field": "value",
  "nested": { "field": "value" }
}
```

**Response Fields**:
- `field` (type) - Description
```

### 6. Bubble Workflow
```markdown
#### Bubble Workflow

1. **Trigger**: Event description
2. **Step 1**: Action description
   - parameter = `value reference`
3. **Step 2** (Only when `condition`): Conditional action
```

### 7. Additional Notes
- Error codes
- Validation rules
- Rate limiting
- Security considerations
- Performance optimization tips

---

## Key Considerations

### Module Numbering
- Modules are numbered sequentially across all phases (1-28+)
- Gaps are intentional (e.g., 6-7, 9-13) for future expansion
- Module numbers reference UI documentation

### CRUD Pattern
- All master data entities follow standard CRUD pattern
- See: docs/ui/bubble/CRUD-PATTERN.md
- 4 components: List Page, Create Popup, Detail Page, Edit Page

### AI Integration
- **Phase 3**: Gemini API for QC template generation from documents
- **Phase 4**: Computer vision for pest/disease detection in photos
- Both require API keys and external service integration

### Activity Scheduling
- Complex logic documented in: docs/ACTIVITY-SCHEDULING-LOGIC.md
- Three types: One-time, Recurring (multiple patterns), Dependent
- Auto-scheduling when production order created from template

### Authentication
- All endpoints after login require Bearer token
- Token stored in Bubble User's `session_token` field
- 30-day expiration
- Validate on protected page loads

### Internationalization
- API returns technical codes only (language-agnostic)
- Frontend (Bubble) handles translation via Option Sets
- Error codes mapped to Spanish/English messages

---

## Status Legend

- ✅ **Ready**: Backend implemented, tested, documented with Bubble setup
- ⚠️ **Not implemented**: Endpoint designed but backend not yet created
- 📋 **Planned**: Future feature, placeholder structure only

---

## Next Actions

1. Review this plan with team
2. Confirm Phase 1 endpoints are all implemented
3. Execute archiving and file creation
4. Update each phase file with complete documentation
5. Test all documented endpoints with Bubble API Connector
6. Begin implementing Phase 2 backend (Areas already done)

---

**Reference Files**:
- UI Structure: `docs/ui/bubble/PHASE-*.md`
- CRUD Pattern: `docs/ui/bubble/CRUD-PATTERN.md`
- Activity Scheduling: `docs/ACTIVITY-SCHEDULING-LOGIC.md`
- AI Quality Checks: `docs/AI-QUALITY-CHECKS.md`
- Current API: `docs/api/PHASE-1-ENDPOINTS.md`

**When Context Resets**: Read this file first to understand the restructure plan and current progress.
