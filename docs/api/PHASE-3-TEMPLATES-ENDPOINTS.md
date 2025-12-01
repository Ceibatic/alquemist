# PHASE 3: PRODUCTION TEMPLATES & AI - API ENDPOINTS

**For Next.js 15 Frontend Integration**

**Base URL**: `https://handsome-jay-388.convex.site`

**Implementation Stack**:
- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: Convex HTTP Actions
- **Auth**: Custom session tokens (30-day validity)
- **Validation**: Zod + React Hook Form
- **AI Integration**: Google Gemini API
- **Visualization**: React Flow / Timeline libraries

**Related Documentation**:
- **Database Schema**: [../database/SCHEMA.md](../database/SCHEMA.md)
- **Development Methodology**: [../dev/CLAUDE.md](../dev/CLAUDE.md)
- **Phase 1 Auth**: [PHASE-1-ONBOARDING-ENDPOINTS.md](PHASE-1-ONBOARDING-ENDPOINTS.md)
- **Activity Scheduling Logic**: [../ACTIVITY-SCHEDULING-LOGIC.md](../ACTIVITY-SCHEDULING-LOGIC.md)
- **AI Quality Checks**: [../AI-QUALITY-CHECKS.md](../AI-QUALITY-CHECKS.md)
- **Bubble Reference** (Visual Guide Only): [../ui/bubble/PHASE-3-TEMPLATES.md](../ui/bubble/PHASE-3-TEMPLATES.md)

---

## PHASE 3 OVERVIEW

**Status**: 🔴 Backend & Frontend Implementation Pending

**Purpose**: Create reusable production workflows and AI-powered quality check templates

**Modules**:
- **MODULE 22**: Production Templates with Activity Scheduling
- **MODULE 23**: AI Quality Check Templates (Gemini-powered)

**Estimated Pages**: 15 screens
**Entry Point**: After completing Phase 2 master data setup

**Key Features**:
- Complex activity scheduling (one-time, recurring, dependent)
- Template versioning and duplication
- AI form generation from PDF/images
- Timeline visualization
- Drag-and-drop activity builder

---

## AUTHENTICATION

All Phase 3 endpoints require authentication via Bearer token (session token from Phase 1).

**Next.js Implementation**:
```typescript
// All Phase 3 requests use same auth pattern as Phase 2
import { getSessionToken } from '@/lib/auth'

const token = await getSessionToken()

const response = await fetch(
  'https://handsome-jay-388.convex.site/production-templates/create',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(templateData)
  }
)
```

---

## NEXT.JS PATTERNS FOR COMPLEX FEATURES

### Timeline Visualization

```typescript
// app/(dashboard)/templates/[id]/timeline/page.tsx
'use client'

import ReactFlow from 'reactflow'
import 'reactflow/dist/style.css'

export default function TemplateTimelinePage({ params }: { params: { id: string } }) {
  const template = useTemplateData(params.id)

  // Convert template phases/activities to timeline nodes
  const nodes = template.phases.flatMap((phase, phaseIndex) =>
    phase.activities.map((activity, actIndex) => ({
      id: `activity-${phaseIndex}-${actIndex}`,
      type: 'activity',
      position: { x: activity.dayOffset * 20, y: phaseIndex * 100 },
      data: { activity, phase }
    }))
  )

  return (
    <div className="h-screen">
      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  )
}
```

### AI Form Generation Component

```typescript
// app/(dashboard)/qc-templates/new/ai-generate/page.tsx
'use client'

import { useState } from 'react'
import { generateQCTemplateFromAI } from '@/actions/ai'

export default function AIGenerateQCTemplate() {
  const [file, setFile] = useState<File | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!file) return

    setGenerating(true)

    // Upload file to Convex storage
    const storageId = await uploadFile(file)

    // Call AI endpoint
    const result = await generateQCTemplateFromAI(storageId)

    if (result.success) {
      // Populate form with AI-generated fields
      router.push(`/qc-templates/new?fields=${result.generatedFields}`)
    }

    setGenerating(false)
  }

  return (
    <div>
      <h1>Generate Quality Check Template from PDF</h1>
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={(e) => setFile(e.files?.[0] || null)}
      />
      <Button onClick={handleGenerate} disabled={!file || generating}>
        {generating ? 'Generating...' : 'Generate with AI'}
      </Button>
    </div>
  )
}
```

### Activity Scheduling Builder

```typescript
// components/ActivitySchedulingBuilder.tsx
'use client'

import { useFieldArray, useForm } from 'react-hook-form'

export function ActivitySchedulingBuilder() {
  const { control, watch } = useForm()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities'
  })

  const schedulingType = watch('schedulingType')

  return (
    <div>
      <Select name="schedulingType">
        <option value="one-time">One-time</option>
        <option value="recurring">Recurring</option>
        <option value="dependent">Dependent</option>
      </Select>

      {schedulingType === 'one-time' && (
        <Input name="dayOffset" type="number" label="Day Offset" />
      )}

      {schedulingType === 'recurring' && (
        <div>
          <Select name="frequency">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="every-n-days">Every N Days</option>
            <option value="specific-days">Specific Days of Week</option>
          </Select>
          <Input name="startDay" type="number" label="Start Day" />
          <Input name="endDay" type="number" label="End Day" />
        </div>
      )}

      {schedulingType === 'dependent' && (
        <div>
          <Select name="dependsOnActivityId" label="Depends on Activity">
            {/* List of previous activities */}
          </Select>
          <Input name="daysAfterCompletion" type="number" label="Days After Completion" />
        </div>
      )}
    </div>
  )
}
```

---

## TYPESCRIPT TYPE DEFINITIONS

```typescript
// types/phase3.ts

export type SchedulingType = 'one-time' | 'recurring' | 'dependent'
export type RecurringFrequency = 'daily' | 'weekly' | 'every-n-days' | 'specific-days'

export interface OneTimeSchedule {
  dayOffset: number
}

export interface RecurringPattern {
  frequency: RecurringFrequency
  startDay: number
  endDay: number
  intervalDays?: number // for 'every-n-days'
  daysOfWeek?: number[] // for 'specific-days' (0=Sunday, 6=Saturday)
}

export interface DependentSchedule {
  dependsOnActivityId: string
  daysAfterCompletion: number
}

export interface TemplateActivity {
  activityName: string
  description: string
  schedulingType: SchedulingType
  oneTimeSchedule?: OneTimeSchedule
  recurringPattern?: RecurringPattern
  dependentSchedule?: DependentSchedule
  estimatedDurationMinutes: number
  assignedRoleId: string
  requiredInventoryItems: Array<{
    inventoryId: string
    quantityPerExecution: number
  }>
  qcTemplateId?: string
}

export interface ProductionPhase {
  phaseName: string
  durationDays: number
  activities: TemplateActivity[]
}

export interface ProductionTemplate {
  id: string
  facilityId: string
  name: string
  cropTypeId: string
  cultivarId: string
  phases: ProductionPhase[]
  projectedYieldPerPlant: number
  targetPlantCount: number
  totalDurationDays: number
  status: 'draft' | 'active' | 'archived'
  version: number
  notes?: string
}

export interface QCTemplateField {
  fieldName: string
  fieldType: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'photo' | 'signature'
  required: boolean
  options?: string[] // for select/multiselect
  unit?: string // for number fields
  min?: number
  max?: number
  defaultValue?: any
}

export interface QCTemplate {
  id: string
  facilityId: string
  name: string
  description: string
  category: 'plant_health' | 'environmental' | 'compliance' | 'harvest'
  fields: QCTemplateField[]
  aiGenerated: boolean
  status: 'active' | 'archived'
}
```

---

## VALIDATION SCHEMAS (ZOD)

```typescript
// lib/validations/templates.ts
import { z } from 'zod'

const oneTimeScheduleSchema = z.object({
  dayOffset: z.number().int().min(0)
})

const recurringPatternSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'every-n-days', 'specific-days']),
  startDay: z.number().int().min(0),
  endDay: z.number().int().min(0),
  intervalDays: z.number().int().min(1).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional()
})

const dependentScheduleSchema = z.object({
  dependsOnActivityId: z.string(),
  daysAfterCompletion: z.number().int().min(0)
})

const templateActivitySchema = z.object({
  activityName: z.string().min(1),
  description: z.string(),
  schedulingType: z.enum(['one-time', 'recurring', 'dependent']),
  oneTimeSchedule: oneTimeScheduleSchema.optional(),
  recurringPattern: recurringPatternSchema.optional(),
  dependentSchedule: dependentScheduleSchema.optional(),
  estimatedDurationMinutes: z.number().int().positive(),
  assignedRoleId: z.string(),
  requiredInventoryItems: z.array(z.object({
    inventoryId: z.string(),
    quantityPerExecution: z.number().positive()
  })),
  qcTemplateId: z.string().optional()
})

export const createProductionTemplateSchema = z.object({
  facilityId: z.string(),
  name: z.string().min(1),
  cropTypeId: z.string(),
  cultivarId: z.string(),
  phases: z.array(z.object({
    phaseName: z.string().min(1),
    durationDays: z.number().int().positive(),
    activities: z.array(templateActivitySchema)
  })),
  projectedYieldPerPlant: z.number().positive(),
  targetPlantCount: z.number().int().positive(),
  notes: z.string().optional()
})

export const createQCTemplateSchema = z.object({
  facilityId: z.string(),
  name: z.string().min(1),
  description: z.string(),
  category: z.enum(['plant_health', 'environmental', 'compliance', 'harvest']),
  fields: z.array(z.object({
    fieldName: z.string().min(1),
    fieldType: z.enum(['text', 'number', 'boolean', 'select', 'multiselect', 'photo', 'signature']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    unit: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    defaultValue: z.any().optional()
  }))
})
```

---

## MODULE 22: Production Templates with Activity Scheduling

Production templates define reusable workflows with scheduled activities.

### Activity Scheduling Overview

**See**: [../ACTIVITY-SCHEDULING-LOGIC.md](../ACTIVITY-SCHEDULING-LOGIC.md) for complete algorithm

**Scheduling Types**:
1. **One-time**: Specific day offset from production start
2. **Recurring**:
   - Daily
   - Weekly
   - Every N days
   - Specific days of week (e.g., every Monday and Thursday)
3. **Dependent**: X days after another activity completes

**Example**:
```json
{
  "activityName": "Riego matutino",
  "schedulingType": "recurring",
  "recurringPattern": {
    "frequency": "daily",
    "startDay": 1,
    "endDay": 60
  }
}
```

---

### Create Production Template

**Endpoint**: `POST /production-templates/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionTemplates.create` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `createProductionTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-templates/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "name": "<name>",
  "cropTypeId": "<cropTypeId>",
  "cultivarId": "<cultivarId>",
  "phases": [
    {
      "phaseName": "<phaseName>",
      "durationDays": <durationDays>,
      "activities": [
        {
          "activityName": "<activityName>",
          "description": "<description>",
          "schedulingType": "<schedulingType>",
          "oneTimeSchedule": {
            "dayOffset": <dayOffset>
          },
          "recurringPattern": {
            "frequency": "<frequency>",
            "startDay": <startDay>,
            "endDay": <endDay>,
            "intervalDays": <intervalDays>,
            "daysOfWeek": ["<day>"]
          },
          "dependentSchedule": {
            "dependsOnActivityId": "<activityId>",
            "daysAfterCompletion": <days>
          },
          "estimatedDurationMinutes": <minutes>,
          "assignedRoleId": "<roleId>",
          "requiredInventoryItems": [
            {
              "inventoryId": "<inventoryId>",
              "quantityPerExecution": <quantity>
            }
          ],
          "qcTemplateId": "<qcTemplateId>"
        }
      ]
    }
  ],
  "projectedYieldPerPlant": <yield>,
  "targetPlantCount": <count>,
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| name | text | No | Body | Cannabis Flowering - Cherry AK |
| cropTypeId | text | No | Body | crop123 |
| cultivarId | text | No | Body | cult789 |
| phases | list | No | Body | [{...}] |
| projectedYieldPerPlant | number | No | Body | 50 |
| targetPlantCount | number | No | Body | 100 |
| notes | text | No | Body | Standard 8-week flowering |

**Scheduling Types**: one_time, recurring, dependent

**Recurring Frequency**: daily, weekly, every_n_days, specific_days_of_week

**Days of Week**: monday, tuesday, wednesday, thursday, friday, saturday, sunday

**Complete Response**:
```json
{
  "success": true,
  "templateId": "pt123...",
  "totalActivitiesGenerated": 145,
  "totalDuration": 60,
  "message": "Plantilla de producción creada exitosamente",
  "error": "Invalid scheduling configuration",
  "code": "INVALID_SCHEDULE_CONFIG"
}
```

**Response Fields**:
- `success` (boolean)
- `templateId` (text)
- `totalActivitiesGenerated` (number) - Projected activity count
- `totalDuration` (number) - Total days across all phases
- `message` (text)
- `error` (text)
- `code` (text)

#### Bubble Workflow

1. **Trigger**: Button "Save Template" clicked
2. **Step 1**: Build phases array from repeating group data
3. **Step 2**: For each phase, build activities array with scheduling rules
4. **Step 3**: Plugins → createProductionTemplate
5. **Step 4** (success): Navigate to template detail page
6. **Step 5** (failure): Show alert with error

**UI Complexity**:
- Multi-step form (Template Info → Phases → Activities → Review)
- Dynamic activity scheduling configurator
- Inventory requirement builder
- Timeline preview visualization

---

### Get Production Templates by Facility

**Endpoint**: `POST /production-templates/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionTemplates.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getProductionTemplatesByFacility`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/production-templates/get-by-facility?facilityId=<facilityId>`
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

**Complete Response**:
```json
[
  {
    "id": "pt123...",
    "name": "Cannabis Flowering - Cherry AK",
    "cropTypeName": "Cannabis",
    "cultivarName": "Cherry AK",
    "totalPhases": 3,
    "totalDuration": 60,
    "version": 1,
    "status": "active",
    "timesUsed": 5,
    "lastUsed": "2025-01-15T00:00:00Z",
    "createdAt": "2025-01-01T10:30:00Z"
  }
]
```

**Response Fields**:
- `id` (text)
- `name` (text)
- `cropTypeName` (text)
- `cultivarName` (text)
- `totalPhases` (number)
- `totalDuration` (number) - days
- `version` (number)
- `status` (text) - active, inactive, draft
- `timesUsed` (number) - count of production orders created
- `lastUsed` (text) - ISO date
- `createdAt` (text) - ISO date

**Bubble Usage**:
- Repeating Group on Templates List Page
- Filter by crop type, cultivar, status
- Sort by name, lastUsed, createdAt

---

### Get Production Template by ID

**Endpoint**: `POST /production-templates/get-by-id`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionTemplates.getById` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getProductionTemplateById`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/production-templates/get-by-id?templateId=<templateId>`
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
| templateId | text | No | URL | pt123... |

**Complete Response**:
```json
{
  "id": "pt123...",
  "facilityId": "f78ghi...",
  "name": "Cannabis Flowering - Cherry AK",
  "cropTypeId": "crop123",
  "cropTypeName": "Cannabis",
  "cultivarId": "cult789",
  "cultivarName": "Cherry AK",
  "phases": [
    {
      "phaseId": "ph456...",
      "phaseName": "Early Flowering",
      "durationDays": 21,
      "phaseOrder": 1,
      "activities": [
        {
          "activityId": "act789...",
          "activityName": "Riego matutino",
          "description": "Riego con nutrientes fase vegetativa",
          "schedulingType": "recurring",
          "recurringPattern": {
            "frequency": "daily",
            "startDay": 1,
            "endDay": 21
          },
          "estimatedDurationMinutes": 30,
          "assignedRoleId": "role_operator",
          "requiredInventoryItems": [
            {
              "inventoryId": "inv789...",
              "inventoryName": "Nutriente A",
              "quantityPerExecution": 2
            }
          ],
          "qcTemplateId": null,
          "activityOrder": 1
        }
      ]
    }
  ],
  "projectedYieldPerPlant": 50,
  "targetPlantCount": 100,
  "totalProjectedYield": 5000,
  "totalDuration": 60,
  "totalActivities": 145,
  "projectedInventoryConsumption": [
    {
      "inventoryId": "inv789...",
      "inventoryName": "Nutriente A",
      "totalQuantity": 252
    }
  ],
  "version": 1,
  "status": "active",
  "notes": "Standard 8-week flowering protocol",
  "createdBy": "j97abc...",
  "createdAt": "2025-01-01T10:30:00Z",
  "updatedAt": "2025-01-05T14:20:00Z"
}
```

**Response Fields**:
- Full template details including:
  - All phases with activities
  - Complete scheduling configurations
  - Inventory requirements per activity
  - Projected totals (yield, duration, inventory consumption)
  - Version and usage tracking

**Bubble Usage**:
- Template Detail Page data source
- Timeline visualization
- Inventory projection calculator
- Edit template pre-population

---

### Duplicate Production Template

**Endpoint**: `POST /production-templates/duplicate`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionTemplates.duplicate` - TO BE CREATED

**Purpose**: Create a copy of existing template for modification

#### Bubble API Connector Configuration

**Name**: `duplicateProductionTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-templates/duplicate`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "templateId": "<templateId>",
  "newName": "<newName>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| templateId | text | No | Body | pt123... |
| newName | text | No | Body | Cannabis Flowering - Cherry AK v2 |

**Complete Response**:
```json
{
  "success": true,
  "newTemplateId": "pt456...",
  "message": "Plantilla duplicada exitosamente",
  "error": "Template not found",
  "code": "TEMPLATE_NOT_FOUND"
}
```

**Bubble Workflow**:
1. Trigger: Button "Duplicate Template" clicked (on detail page)
2. Step 1: Plugins → duplicateProductionTemplate
3. Step 2 (success): Navigate to new template edit page
4. Step 3 (failure): Show alert with error

**Use Case**: Create variations of proven templates without rebuilding from scratch

---

### Update Production Template

**Endpoint**: `POST /production-templates/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionTemplates.update` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `updateProductionTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-templates/update`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**: Same structure as create, plus `templateId`

**Complete Response**:
```json
{
  "success": true,
  "message": "Plantilla actualizada exitosamente",
  "totalActivitiesGenerated": 150,
  "error": "Cannot update template with active production orders",
  "code": "TEMPLATE_IN_USE"
}
```

**Validation**:
- Cannot update template that has active production orders
- Creates new version automatically
- Old version remains accessible for historical orders

---

### Delete Production Template

**Endpoint**: `POST /production-templates/delete`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionTemplates.delete` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `deleteProductionTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-templates/delete`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "templateId": "<templateId>"
}
```

**Complete Response**:
```json
{
  "success": true,
  "message": "Plantilla eliminada exitosamente",
  "error": "Cannot delete template with production orders",
  "code": "TEMPLATE_HAS_DEPENDENCIES"
}
```

**Validation**:
- Cannot delete if template has production orders (past or active)
- Soft delete (set status="inactive") instead

---

### Validate Activity Schedule

**Endpoint**: `POST /production-templates/validate-schedule`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `productionTemplates.validateSchedule` - TO BE CREATED

**Purpose**: Validate scheduling configuration before saving template

#### Bubble API Connector Configuration

**Name**: `validateActivitySchedule`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/production-templates/validate-schedule`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "activities": [
    {
      "activityName": "<name>",
      "schedulingType": "<type>",
      "oneTimeSchedule": {...},
      "recurringPattern": {...},
      "dependentSchedule": {...}
    }
  ],
  "totalPhaseDuration": <days>
}
```

**Complete Response**:
```json
{
  "valid": true,
  "issues": [],
  "warnings": [
    {
      "activityName": "Riego",
      "warning": "Activity scheduled beyond phase duration",
      "severity": "warning"
    }
  ],
  "projectedActivities": 145,
  "message": "Validación exitosa"
}
```

**Response Fields**:
- `valid` (boolean) - Overall validity
- `issues` (list) - Blocking errors
- `warnings` (list) - Non-blocking warnings
- `projectedActivities` (number) - Estimated activity count
- `message` (text)

**Validation Checks**:
- Recurring patterns don't exceed phase duration
- Dependent activities reference existing activities
- No circular dependencies
- Days of week valid (monday-sunday)
- Interval days > 0
- Start day <= end day

**Bubble Usage**: Real-time validation as user configures scheduling

---

## MODULE 23: AI Quality Check Templates

AI-powered generation of quality check forms from PDF/image documents.

**Approach**: Simplified - upload document → AI generates HTML form → save directly (no manual editing)

**AI Service**: Google Gemini API
**See**: [../AI-QUALITY-CHECKS.md](../AI-QUALITY-CHECKS.md) for complete specification

---

### Generate QC Template from Document

**Endpoint**: `POST /ai/generate-qc-template`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `ai.generateQCTemplate` - TO BE CREATED

**Purpose**: Upload PDF/image of QC form, AI extracts fields and generates HTML form

#### Bubble API Connector Configuration

**Name**: `generateQCTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/ai/generate-qc-template`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "templateName": "<templateName>",
  "documentUrl": "<documentUrl>",
  "documentType": "<documentType>",
  "category": "<category>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| templateName | text | No | Body | Inspección de Calidad Floral |
| documentUrl | text | No | Body | https://cdn.../qc-form.pdf |
| documentType | text | No | Body | pdf |
| category | text | No | Body | quality_inspection |

**Document Types**: pdf, image (jpg, png)

**Categories**: quality_inspection, pest_disease_check, harvest_assessment, lab_results, safety_inspection, other

**Complete Response**:
```json
{
  "success": true,
  "qcTemplateId": "qc789...",
  "htmlForm": "<div class='qc-form'>...</div>",
  "extractedFields": [
    {
      "fieldName": "Apariencia Visual",
      "fieldType": "dropdown",
      "options": ["Excelente", "Buena", "Regular", "Mala"]
    }
  ],
  "processingTime": 3.5,
  "message": "Plantilla generada exitosamente",
  "error": "AI service unavailable",
  "code": "AI_SERVICE_ERROR"
}
```

**Response Fields**:
- `success` (boolean)
- `qcTemplateId` (text)
- `htmlForm` (text) - Complete HTML form structure
- `extractedFields` (list) - Metadata about extracted fields
- `processingTime` (number) - seconds
- `message` (text)
- `error` (text)
- `code` (text)

#### Bubble Workflow

1. **Trigger**: Button "Generate with AI" clicked
2. **Step 1**: Upload document to file storage (Bubble's uploader or S3)
3. **Step 2**: Get document URL
4. **Step 3**: Show loading indicator "AI está procesando tu documento..."
5. **Step 4**: Plugins → generateQCTemplate (timeout: 30 seconds)
6. **Step 5** (success): Navigate to QC template preview page
7. **Step 6** (failure): Show alert with error

**UI Notes**:
- Show progress indicator (AI processing takes 3-10 seconds)
- Preview generated form before saving
- Allow regeneration if result unsatisfactory

**AI Processing**:
1. Receive document (PDF or image)
2. Call Gemini Vision API to extract form structure
3. AI identifies fields, types, labels, options
4. Generate semantic HTML form with styling
5. Store HTML and field metadata
6. Return immediately (no manual editing step)

---

### Get QC Templates by Facility

**Endpoint**: `POST /qc-templates/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `qcTemplates.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getQCTemplatesByFacility`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/qc-templates/get-by-facility?facilityId=<facilityId>`
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

**Complete Response**:
```json
[
  {
    "id": "qc789...",
    "templateName": "Inspección de Calidad Floral",
    "category": "quality_inspection",
    "fieldCount": 12,
    "timesUsed": 8,
    "lastUsed": "2025-01-15T00:00:00Z",
    "createdAt": "2025-01-10T10:30:00Z",
    "sourceDocumentUrl": "https://cdn.../qc-form.pdf"
  }
]
```

**Response Fields**:
- `id` (text)
- `templateName` (text)
- `category` (text)
- `fieldCount` (number)
- `timesUsed` (number) - count of activities using this template
- `lastUsed` (text) - ISO date
- `createdAt` (text) - ISO date
- `sourceDocumentUrl` (text) - original document

**Bubble Usage**:
- Repeating Group on QC Templates List Page
- Filter by category
- Sort by name, lastUsed, createdAt

---

### Get QC Template by ID

**Endpoint**: `POST /qc-templates/get-by-id`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `qcTemplates.getById` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getQCTemplateById`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/qc-templates/get-by-id?qcTemplateId=<qcTemplateId>`
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
| qcTemplateId | text | No | URL | qc789... |

**Complete Response**:
```json
{
  "id": "qc789...",
  "facilityId": "f78ghi...",
  "templateName": "Inspección de Calidad Floral",
  "category": "quality_inspection",
  "htmlForm": "<div class='qc-form'>...</div>",
  "extractedFields": [
    {
      "fieldName": "Apariencia Visual",
      "fieldType": "dropdown",
      "options": ["Excelente", "Buena", "Regular", "Mala"],
      "required": true
    }
  ],
  "fieldCount": 12,
  "sourceDocumentUrl": "https://cdn.../qc-form.pdf",
  "sourceDocumentType": "pdf",
  "timesUsed": 8,
  "lastUsed": "2025-01-15T00:00:00Z",
  "createdAt": "2025-01-10T10:30:00Z",
  "createdBy": "j97abc..."
}
```

**Response Fields**:
- Complete template details including full HTML form
- Field metadata for programmatic access
- Usage statistics

**Bubble Usage**:
- QC Template Detail/Preview Page
- Render HTML form dynamically in HTML element
- Show field list for documentation

---

### Regenerate QC Template

**Endpoint**: `POST /qc-templates/regenerate`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `qcTemplates.regenerate` - TO BE CREATED

**Purpose**: Re-run AI generation if result unsatisfactory

#### Bubble API Connector Configuration

**Name**: `regenerateQCTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/qc-templates/regenerate`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "qcTemplateId": "<qcTemplateId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| qcTemplateId | text | No | Body | qc789... |

**Complete Response**:
```json
{
  "success": true,
  "htmlForm": "<div class='qc-form'>...</div>",
  "extractedFields": [...],
  "message": "Plantilla regenerada exitosamente",
  "error": "AI service unavailable",
  "code": "AI_SERVICE_ERROR"
}
```

**Bubble Workflow**:
1. Trigger: Button "Regenerate with AI" clicked (on detail page)
2. Step 1: Show loading indicator
3. Step 2: Plugins → regenerateQCTemplate
4. Step 3 (success): Reload page to show new form
5. Step 4 (failure): Show alert with error

**Use Case**: If AI misinterpreted form structure, regenerate for different result

---

### Delete QC Template

**Endpoint**: `POST /qc-templates/delete`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `qcTemplates.delete` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `deleteQCTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/qc-templates/delete`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "qcTemplateId": "<qcTemplateId>"
}
```

**Complete Response**:
```json
{
  "success": true,
  "message": "Plantilla eliminada exitosamente",
  "error": "Cannot delete template in use",
  "code": "TEMPLATE_HAS_DEPENDENCIES"
}
```

**Validation**:
- Cannot delete if template is linked to production template activities
- Soft delete (set status="inactive")

---

## IMPLEMENTATION STATUS SUMMARY

### Module Status

**MODULE 22: Production Templates** - 6 endpoints
- ⚠️ Create production template
- ⚠️ Get production templates by facility
- ⚠️ Get production template by ID
- ⚠️ Duplicate production template
- ⚠️ Update production template
- ⚠️ Delete production template
- ⚠️ Validate activity schedule

**MODULE 23: AI Quality Check Templates** - 5 endpoints
- ⚠️ Generate QC template from document (AI-powered)
- ⚠️ Get QC templates by facility
- ⚠️ Get QC template by ID
- ⚠️ Regenerate QC template (AI re-run)
- ⚠️ Delete QC template

**Total Phase 3 Endpoints**: 12 endpoints (0 implemented, 12 pending)

---

### Convex Files to Create

- `convex/productionTemplates.ts` - MODULE 22
- `convex/qcTemplates.ts` - MODULE 23
- `convex/ai.ts` - AI integration utilities (Gemini API)
- `convex/scheduling.ts` - Activity scheduling algorithm

---

### External Dependencies

**Google Gemini API**:
- API Key required
- Model: gemini-pro-vision (for document processing)
- Rate limits: Check Google Cloud quotas
- Cost: Pay-per-use (estimate $0.001-0.01 per form)

**Configuration**:
```
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-pro-vision
```

---

## ERROR CODES

**Phase 3 Specific Error Codes**:
- `TEMPLATE_NOT_FOUND` - Template ID doesn't exist
- `TEMPLATE_IN_USE` - Cannot update/delete template with active orders
- `TEMPLATE_HAS_DEPENDENCIES` - Cannot delete template linked to activities
- `INVALID_SCHEDULE_CONFIG` - Scheduling configuration invalid
- `CIRCULAR_DEPENDENCY` - Dependent activities form a loop
- `SCHEDULE_EXCEEDS_PHASE` - Recurring pattern beyond phase duration
- `INVALID_DOCUMENT_TYPE` - Unsupported file format
- `AI_SERVICE_ERROR` - Gemini API unavailable or error
- `AI_PROCESSING_FAILED` - AI couldn't extract form structure
- `DOCUMENT_TOO_LARGE` - File size exceeds limit (10MB)

For complete error handling, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md).

---

## ACTIVITY SCHEDULING ALGORITHM

**See Full Documentation**: [../ACTIVITY-SCHEDULING-LOGIC.md](../ACTIVITY-SCHEDULING-LOGIC.md)

**Summary**:

**One-Time Activities**:
```
scheduledDate = productionStartDate + dayOffset
```

**Recurring Activities**:
```
For day in range(startDay, endDay + 1):
  If frequency == "daily":
    Create activity on day
  Else if frequency == "weekly":
    If day % 7 == 0:
      Create activity on day
  Else if frequency == "every_n_days":
    If (day - startDay) % intervalDays == 0:
      Create activity on day
  Else if frequency == "specific_days_of_week":
    If dayOfWeek(day) in daysOfWeek:
      Create activity on day
```

**Dependent Activities**:
```
scheduledDate = dependsOnActivity.actualCompletionDate + daysAfterCompletion
(Re-calculated when dependency completes)
```

**Validation**:
- No circular dependencies (A depends on B, B depends on A)
- Dependent activity references exist
- Recurring patterns within phase bounds
- Days of week valid (monday-sunday)

---

## AI QUALITY CHECK WORKFLOW

**See Full Documentation**: [../AI-QUALITY-CHECKS.md](../AI-QUALITY-CHECKS.md)

**Workflow**:

1. **Upload Document** (PDF or image)
2. **AI Processing** (3-10 seconds)
   - Send to Gemini Vision API
   - Prompt: "Extract form fields, types, labels, and options from this document"
   - AI returns structured JSON
3. **Generate HTML Form**
   - Convert JSON to semantic HTML
   - Apply consistent styling
   - Include field validation rules
4. **Save Template**
   - Store HTML form string
   - Store field metadata
   - Link to source document
5. **Dynamic Rendering**
   - Bubble HTML element renders form
   - User fills form during activity execution (Phase 4)
   - Submit → Save responses as JSON

**No Manual Editing**: If form unsatisfactory, regenerate with AI

**Advantages**:
- Rapid form creation (10 seconds vs 10 minutes manual)
- Consistent structure
- Supports complex forms (tables, checkboxes, ratings)
- Source document preserved for reference

---

## BUBBLE DEVELOPER NOTES

### Production Template Complexity

**Multi-Step Form Recommended**:
1. **Step 1**: Template info (name, crop, cultivar)
2. **Step 2**: Add phases
3. **Step 3**: For each phase, add activities
4. **Step 4**: Configure scheduling for each activity
5. **Step 5**: Add inventory requirements
6. **Step 6**: Link QC templates
7. **Step 7**: Review and save

**Timeline Visualization**:
- Use Bubble's chart plugins or custom HTML/JS
- Show Gantt-style timeline of activities
- Color-code by phase
- Highlight recurring patterns

**Scheduling Configurator**:
- Radio buttons for scheduling type
- Conditional panels for each type
- Real-time validation feedback
- Preview projected activity count

### AI Integration

**Document Upload**:
- Use Bubble's file uploader
- Or integrate with S3 directly
- Max file size: 10MB
- Supported: PDF, JPG, PNG

**Loading States**:
- Show spinner during AI processing
- Display "Processing with AI..." message
- Timeout: 30 seconds
- Retry button if timeout

**HTML Form Rendering**:
- Use HTML element in Bubble
- Set HTML content to response's htmlForm field
- Style with custom CSS
- Form submits to workflow (Phase 4)

**AI Cost Management**:
- Estimate: $0.001-0.01 per form generation
- For 100 forms/month: ~$1-10/month
- Consider caching results
- Warn users about regeneration costs

---

## REAL-TIME UPDATES & DATA POLLING

**Overview**: Phase 3 involves template design and AI-powered form generation. These are relatively static master data with manual updates. Unlike Phase 1 & 2, there is minimal real-time data volatility.

### Polling Requirements by Module

| Module | Data Type | Volatility | Recommended Polling | Use Case |
|--------|-----------|-----------|-------------------|----------|
| Production Templates | Template Data | Very Low | Page load only | Templates change infrequently (manual edit) |
| QC Templates | Template Data | Very Low | Page load only | Templates change infrequently (AI generated once) |

### Implementation Patterns

#### Pattern 1: Page Load Only (All Phase 3 Templates)

**Use When**: Templates are designed once, rarely modified. Users don't need live updates.

**Workflow**:
```javascript
// Templates List Page - Page Load
Workflow: Page Load
  → Step 1: API getProductionTemplatesByFacility
  → Step 2: Set repeating group data source

// Template Detail Page - Page Load
Workflow: Page Load (Detail page)
  → Step 1: API getProductionTemplateById
  → Step 2: Display template structure, phases, activities
  → Step 3: Display timeline visualization

// QC Templates List Page - Page Load
Workflow: Page Load
  → Step 1: API getQCTemplatesByFacility
  → Step 2: Set repeating group data source

// QC Template Detail Page - Page Load
Workflow: Page Load
  → Step 1: API getQCTemplateById
  → Step 2: Render HTML form in HTML element
  → Step 3: Display field metadata
```

**Cost**: Minimal (1 call per page load)
**Latency**: 0 seconds (manual refresh required)
**Developer Notes**:
- No periodic timers needed
- Templates designed in dedicated pages, not dashboard
- Most users only reference templates, not modify them
- Modifications are infrequent design changes

---

#### Pattern 2: Event-Based Refresh (Template Modifications)

**Use When**: Template is modified and user needs to see changes reflected.

**Workflow**:
```javascript
// After Create Template Success
Workflow: createProductionTemplate → success
  → Step 1: Close form/modal
  → Step 2: API getProductionTemplatesByFacility (refresh list)
  → Step 3: Navigate to new template detail page
  → Step 4: Show toast "Template created successfully"

// After Update Template Success
Workflow: updateProductionTemplate → success
  → Step 1: API getProductionTemplateById (refresh detail view)
  → Step 2: Show timeline with updated activities
  → Step 3: Navigate/show success message

// After Duplicate Template Success
Workflow: duplicateProductionTemplate → success
  → Step 1: Navigate to new template edit page
  → Step 2: Display duplicated template structure

// After AI Generation (QC Template)
Workflow: generateQCTemplate → success
  → Step 1: Show preview of generated form
  → Step 2: Option to regenerate if unsatisfactory
  → Step 3: Save when user approves
  → Step 4: Navigate to template detail page

// After Delete Template Success
Workflow: deleteProductionTemplate → success
  → Step 1: API getProductionTemplatesByFacility (refresh list)
  → Step 2: Navigate back to templates list
  → Step 3: Show toast "Template deleted"
```

**Cost**: Minimal additional calls
**Latency**: 0 seconds (immediate after action)

---

#### Pattern 3: Schedule Validation (Real-time During Creation)

**Use When**: User is configuring complex scheduling in production template.

**Workflow**:
```javascript
// Activity Scheduling Configurator (During Template Creation)

Element: Scheduling Type Dropdown
Workflow: Selection changed
  → Show conditional panels for selected type
  → IF recurring:
    → Show frequency, start day, end day, interval options
    → Real-time validation: end day >= start day
    → Real-time validation: interval > 0

Element: Activity Days Input
Workflow: Value changed (debounce 500ms)
  → IF has dependent schedule:
    → Highlight dependency chain
  → IF schedule exceeds phase duration:
    → Show warning "Activity scheduled beyond phase"

Button: "Validate Schedule"
Workflow: Click
  → API: validateActivitySchedule
  → IF valid:
    → Show "✓ Schedule valid (145 projected activities)"
  → ELSE:
    → Show errors and suggestions

Element: Template Preview/Timeline
Workflow: Update automatically
  → Recalculate based on current config
  → Show Gantt-style timeline
  → Highlight conflicts or warnings
```

**Cost**: 1 validation call per user save (not per keystroke)
**Latency**: 0-2 seconds (validation response)
**Developer Note**: Debounce validation requests to avoid excessive calls

---

### AI Processing - Special Case

**Challenge**: AI QC template generation takes 3-10 seconds. Cannot use polling for status.

**Solution - Callback/Webhook Pattern**:

Since Bubble cannot maintain persistent connections, the workflow is:

```javascript
// Generate QC Template
User clicks "Generate with AI"
  ↓
Show loading spinner
  ↓
Call API: generateQCTemplate (blocking call)
  ↓
Convex:
  1. Receive request
  2. Call Gemini Vision API (wait for response)
  3. Process response, generate HTML
  4. Store in database
  5. Return success + htmlForm
  ↓
Show result in preview (no polling needed)
```

**Why This Works**:
- HTTP request naturally waits for Gemini response
- Timeout: 30 seconds (covers 3-10 second AI processing)
- No need for polling/webhooks
- User sees loading spinner during entire process

**Bubble Configuration**:
```
API Call: generateQCTemplate
Timeout: 30 seconds (must exceed max AI processing time)
Retry on timeout: Show "AI Service Unavailable" error
```

---

### Multi-User Scenarios

**Scenario**: Multiple users working with templates simultaneously (same facility)

**Problem**: User A creates template, User B viewing template list might not see it immediately

**Solution - Acceptable Approach**:
```javascript
// User B viewing templates list
Page Load:
  → API: getProductionTemplatesByFacility
  → Display list

// User A creates new template while User B viewing
User A → API: createProductionTemplate → success
User B → Still sees old list (no polling)

// When User B navigates away and returns to page:
Workflow: Page becomes visible again
  → Page load triggered automatically
  → API: getProductionTemplatesByFacility (refreshed)
  → User B now sees User A's template
```

**Why This Is Acceptable**:
- Templates rarely created in real-time (design activity)
- Multiple users creating templates simultaneously is rare
- Page navigation naturally refreshes data
- Cost savings far outweigh real-time benefit

**Alternative - Optional Real-Time (if needed for teams)**:
```javascript
// Only IF multiple users actively designing templates:

Workflow: Every 60 seconds (while on templates list page)
  → IF Page is visible:
    → API: getProductionTemplatesByFacility
    → Update repeating group (only if list changed)

Cost: 1 call per minute = 60 calls/hour per user
Only enable if team reports missing newly created templates
```

---

### Cost Implications Summary

| Feature | Pattern | Calls/Hour | Data Freshness | Notes |
|---------|---------|-----------|-----------------|-------|
| Template Lists | Page load only | 0-2 | Manual refresh | Minimal cost |
| Template Details | Page load only | 0-1 | Manual refresh | View-only usage |
| Template Creation | Event-based | 1 per create | Immediate | Low frequency |
| Schedule Validation | On-demand | 1 per validate | Immediate | User-triggered |
| AI QC Generation | Blocking call | 1 per generate | Immediate | 3-10s wait |
| Multi-user (optional) | 60s polling | 60 | 0-60s | Only if needed |

**Recommended for Phase 3**:
- **Production Templates (Lists/Details)**: Page load only + event-based after CRUD
- **QC Templates (Lists/Details)**: Page load only + event-based after AI generation
- **AI Processing**: Blocking HTTP call (no polling)
- **Schedule Validation**: On-demand call (only when user clicks validate)
- **Multi-user Refresh**: NOT needed (templates are design artifacts, not operational data)

---

### Bubble Developer Guidance

**Key Design Points**:

1. **No Aggressive Polling**:
   - ❌ Template lists do NOT need real-time updates
   - ❌ QC templates do NOT need real-time updates
   - ✅ Page reload naturally refreshes when returning to page

2. **AI Processing**:
   - ✅ Use blocking HTTP call (wait for Gemini response)
   - ✅ Show loading spinner during wait
   - ❌ Do NOT use polling for status
   - ❌ Do NOT use webhooks (overcomplicated)

3. **Schedule Validation**:
   - ✅ Validate on-demand (when user clicks validate button)
   - ✅ Debounce real-time validation if needed
   - ❌ Do NOT validate on every keystroke

4. **Complex UI**:
   - Multi-step form is OK (not real-time)
   - Timeline visualization is static (not live)
   - Activity schedulers don't need live updates

5. **Testing AI Integration**:
   - Use test documents in development
   - Monitor Gemini API quota
   - Set reasonable timeout (30s) for HTTP call
   - Handle network failures gracefully

---

### Testing Real-Time Behavior

**Test Checklist**:
- [ ] Page load retrieves current template list
- [ ] After template create, list updates on return
- [ ] Timeline visualization accurate for complex schedules
- [ ] Schedule validation detects conflicts
- [ ] AI QC generation completes within 30s timeout
- [ ] AI timeout error shows proper message
- [ ] Multiple users see each other's templates on page refresh
- [ ] No duplicate API calls when staying on same page
- [ ] Browser back button triggers page reload (auto-refresh)

---

## TESTING CHECKLIST

Phase 3 Templates & AI (0/12 endpoints ready):

**Production Templates**:
- [ ] Can create template with multiple phases
- [ ] One-time activities schedule correctly
- [ ] Daily recurring activities generate correctly
- [ ] Weekly recurring activities generate correctly
- [ ] Every N days recurring works
- [ ] Specific days of week recurring works (e.g., Mon/Thu)
- [ ] Dependent activities reference valid activities
- [ ] Circular dependency validation prevents loops
- [ ] Inventory requirements calculate correctly
- [ ] Timeline visualization displays accurately
- [ ] Can duplicate template successfully
- [ ] Cannot update template with active orders
- [ ] Cannot delete template with dependencies

**AI Quality Check Templates**:
- [ ] Can upload PDF document
- [ ] Can upload image document
- [ ] AI extracts fields correctly
- [ ] HTML form renders properly
- [ ] Field types supported (text, dropdown, checkbox, etc.)
- [ ] Can regenerate template
- [ ] Regeneration produces different result
- [ ] Cannot delete template in use
- [ ] QC templates list displays correctly
- [ ] Template preview shows full form

**Integration**:
- [ ] Production templates can link QC templates to activities
- [ ] QC template selector shows available templates
- [ ] Gemini API connection works
- [ ] API key authentication successful
- [ ] Error handling for AI service failures

---

## APPENDIX: BUBBLE INTEGRATION REFERENCE

**Important**: Bubble documentation serves as **visual reference only**. Implement all features in Next.js 15.

### For Next.js Developers

**Focus on**:
- Complex UI patterns (timeline visualization, drag-and-drop activity builder)
- AI integration with Google Gemini API
- Activity scheduling algorithm implementation
- React Flow for timeline visualization
- File upload to Convex storage for AI processing

All Bubble-specific content (workflows, custom states) can be ignored. Use the Next.js patterns and TypeScript types shown above.

---

## IMPLEMENTATION STATUS

**Backend Status**: 🔴 Phase 3 Backend NOT STARTED
- 12 Convex endpoints need implementation
- Activity scheduling algorithm to be developed
- Google Gemini API integration required
- Depends on Phase 1 & 2 completion

**Frontend Status**: 🔴 Implementation Pending
- Complex UI components: Timeline visualization, Activity builder
- AI-powered form generation UI
- Template versioning and duplication features
- React Flow for visual timeline
- File upload for AI processing

**Endpoint Coverage**: 0/12 (0% backend complete)

**AI Integration Requirements**:
- Google Gemini API key configuration
- PDF/image processing for QC template generation
- Form field extraction from documents
- Error handling for AI service failures

**Next Steps**:
1. 🔴 Complete Phase 1 & 2 implementation first
2. 🔴 Implement activity scheduling algorithm in Convex
3. 🔴 Integrate Google Gemini API for AI features
4. 🔴 Build timeline visualization with React Flow
5. 🔴 Create activity builder with drag-and-drop
6. 🔴 Test activity generation with various scheduling patterns
7. Move to Phase 4 (Production Execution)

---

**Last Updated**: 2025-01-30
**Version**: 3.0 (Updated for Next.js-first methodology)
