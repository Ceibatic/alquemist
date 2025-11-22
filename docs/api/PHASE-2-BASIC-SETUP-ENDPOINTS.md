# PHASE 2: BASIC SETUP & MASTER DATA - API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Related Documentation**:
- **Database Schema**: [../database/SCHEMA.md](../database/SCHEMA.md)
- **UI Requirements**: [../ui/bubble/PHASE-2-BASIC-SETUP.md](../ui/bubble/PHASE-2-BASIC-SETUP.md)
- **CRUD Pattern**: [../ui/bubble/CRUD-PATTERN.md](../ui/bubble/CRUD-PATTERN.md)
- **Restructure Plan**: [../TEMP-API-RESTRUCTURE-PLAN.md](../TEMP-API-RESTRUCTURE-PLAN.md)

---

## PHASE 2 OVERVIEW

**Purpose**: Configure essential master data required for operations

**Modules**:
- **MODULE 8**: Area Management (Production zones)
- **MODULE 15**: Cultivar Management (Plant varieties)
- **MODULE 16**: Supplier Management (Vendor registry)
- **MODULE 17**: User Invitations & Team Management (Invite users, manage roles)
- **MODULE 18**: Facility Management & Switcher (Multi-facility operations)
- **MODULE 19**: Inventory Management (Stock tracking)
- **MODULE 20**: Facility Settings (Configuration)
- **MODULE 21**: Account Settings (User preferences)

**Estimated Pages**: 18-21 screens
**Entry Point**: After completing Phase 1 onboarding
**Pattern**: Most modules follow standard CRUD pattern (List, Create, Detail, Edit)

---

## AUTHENTICATION

All Phase 2 endpoints require authentication via Bearer token.

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Token Source**: `Current User's session_token` in Bubble

---

## MODULE 8: Area Management

Areas represent physical production zones within a facility (rooms, greenhouses, fields, etc.)

### Create Area

**Endpoint**: `POST /areas/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `areas.create` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `createArea`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/areas/create`

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
  "areaType": "<areaType>",
  "compatibleCropTypeIds": ["<cropTypeId>"],
  "totalAreaM2": <totalAreaM2>,
  "capacity": <capacity>,
  "climateControlled": <climateControlled>,
  "environmentalSpecs": {
    "tempMin": <tempMin>,
    "tempMax": <tempMax>,
    "humidityMin": <humidityMin>,
    "humidityMax": <humidityMax>
  }
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| name | text | No | Body | Propagation Room |
| areaType | text | No | Body | propagation |
| compatibleCropTypeIds | list | No | Body | ["crop123"] |
| totalAreaM2 | number | No | Body | 50 |
| capacity | number | No | Body | 500 |
| climateControlled | boolean | No | Body | true |
| environmentalSpecs | object | No | Body | {...} |

**Complete Response**:
```json
{
  "success": true,
  "areaId": "a99jkl...",
  "message": "Área creada exitosamente",
  "error": "Facility not found",
  "code": "FACILITY_NOT_FOUND"
}
```

**Response Fields**:
- `success` (boolean)
- `areaId` (text)
- `message` (text)
- `error` (text)
- `code` (text)

**Bubble Workflow**:
1. Trigger: Button "Save Area" clicked (in Create popup)
2. Step 1: Plugins → createArea
3. Step 2 (success): Close popup, refresh area list
4. Step 3 (failure): Show alert with error

**Area Types**: propagation, vegetative, flowering, drying, curing, storage, processing, quarantine

---

### Get Areas by Facility

**Endpoint**: `POST /areas/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `areas.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getAreasByFacility`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/areas/get-by-facility`
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
| facilityId | text | No | Body | f78ghi... |

**Complete Response**:
```json
[
  {
    "id": "a99jkl...",
    "name": "Propagation Room",
    "areaType": "propagation",
    "totalAreaM2": 50,
    "capacity": 500,
    "climateControlled": true,
    "status": "active",
    "currentOccupancy": 320,
    "occupancyRate": 64.0
  }
]
```

**Response Fields**:
- `id` (text)
- `name` (text)
- `areaType` (text)
- `totalAreaM2` (number)
- `capacity` (number)
- `climateControlled` (boolean)
- `status` (text) - active, inactive, maintenance
- `currentOccupancy` (number)
- `occupancyRate` (number) - percentage

**Bubble Usage**:
- Repeating Group on Areas List Page
- Sort by: name or areaType
- Display occupancy with progress bar

---

### Get Area by ID

**Endpoint**: `POST /areas/get-by-id`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `areas.getById` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getAreaById`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/areas/get-by-id`
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

**Complete Response**:
```json
{
  "id": "a99jkl...",
  "facilityId": "f78ghi...",
  "name": "Propagation Room",
  "areaType": "propagation",
  "compatibleCropTypeIds": ["crop123"],
  "totalAreaM2": 50,
  "capacity": 500,
  "climateControlled": true,
  "environmentalSpecs": {
    "tempMin": 20,
    "tempMax": 25,
    "humidityMin": 60,
    "humidityMax": 70
  },
  "status": "active",
  "currentOccupancy": 320,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-16T14:20:00Z"
}
```

**Bubble Usage**: Area Detail Page data source

---

### Update Area

**Endpoint**: `POST /areas/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `areas.update` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `updateArea`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/areas/update`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "areaId": "<areaId>",
  "name": "<name>",
  "totalAreaM2": <totalAreaM2>,
  "capacity": <capacity>,
  "environmentalSpecs": {
    "tempMin": <tempMin>,
    "tempMax": <tempMax>,
    "humidityMin": <humidityMin>,
    "humidityMax": <humidityMax>
  }
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| areaId | text | No | Body | a99jkl... |
| name | text | No | Body | Propagation Room A |
| totalAreaM2 | number | No | Body | 60 |
| capacity | number | No | Body | 600 |
| environmentalSpecs | object | No | Body | {...} |

**Complete Response**:
```json
{
  "success": true,
  "message": "Área actualizada exitosamente",
  "error": "Area not found",
  "code": "AREA_NOT_FOUND"
}
```

**Bubble Workflow**: Similar to create, but from Edit Page

---

### Delete Area

**Endpoint**: `POST /areas/delete`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `areas.delete` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `deleteArea`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/areas/delete`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "areaId": "<areaId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| areaId | text | No | Body | a99jkl... |

**Complete Response**:
```json
{
  "success": true,
  "message": "Área eliminada exitosamente",
  "error": "Cannot delete area with active batches",
  "code": "AREA_HAS_DEPENDENCIES"
}
```

**Validation**:
- Cannot delete if area has active production orders
- Soft delete (set status="inactive")

---

## MODULE 15: Cultivar Management

Cultivars are specific plant varieties/strains within a crop type.

### Get Crop Types

**Endpoint**: `POST /crops/get-types`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `crops.getCropTypes` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getCropTypes`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/crops/get-types`
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

**Complete Response**:
```json
[
  {
    "id": "crop123",
    "name": "Cannabis",
    "display_name_es": "Cannabis",
    "display_name_en": "Cannabis"
  }
]
```

**Response Fields**:
- `id` (text)
- `name` (text)
- `display_name_es` (text)
- `display_name_en` (text)

**Bubble Usage**: Dropdown for selecting crop type before viewing cultivars

---

### Get Cultivars by Crop

**Endpoint**: `POST /cultivars/get-by-crop`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `cultivars.getByCrop` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getCultivarsByCrop`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/cultivars/get-by-crop`
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
| cropTypeId | text | No | URL | crop123 |

**Complete Response**:
```json
[
  {
    "id": "cult789",
    "name": "Cherry AK",
    "varietyType": "Indica",
    "floweringWeeks": 8,
    "yieldLevel": "medium-high",
    "thcRange": "18-22",
    "cbdRange": "0.5-1.5",
    "isCustom": false
  }
]
```

**Response Fields**:
- `id` (text)
- `name` (text)
- `varietyType` (text) - Indica, Sativa, Hybrid
- `floweringWeeks` (number)
- `yieldLevel` (text) - low, medium, medium-high, high
- `thcRange` (text) - percentage range
- `cbdRange` (text) - percentage range
- `isCustom` (boolean) - true if user-created

---

### Link Cultivars to Facility

**Endpoint**: `POST /facilities/link-cultivars`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.linkCultivars` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `linkCultivarsToFacility`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/link-cultivars`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "cultivarIds": ["<cultivarId>"]
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| cultivarIds | list | No | Body | ["cult789", "cult790"] |

**Complete Response**:
```json
{
  "success": true,
  "message": "Cultivares vinculados exitosamente",
  "linkedCount": 2,
  "error": "Invalid cultivar IDs",
  "code": "INVALID_CULTIVAR_IDS"
}
```

**Bubble Workflow**: Multi-select cultivars, click "Save Selection"

---

### Create Custom Cultivar

**Endpoint**: `POST /cultivars/create-custom`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `cultivars.createCustom` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `createCustomCultivar`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/cultivars/create-custom`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "cropTypeId": "<cropTypeId>",
  "name": "<name>",
  "varietyType": "<varietyType>",
  "floweringWeeks": <floweringWeeks>,
  "yieldLevel": "<yieldLevel>",
  "thcRange": "<thcRange>",
  "cbdRange": "<cbdRange>",
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| cropTypeId | text | No | Body | crop123 |
| name | text | No | Body | Custom Strain 1 |
| varietyType | text | No | Body | Hybrid |
| floweringWeeks | number | No | Body | 9 |
| yieldLevel | text | No | Body | medium |
| thcRange | text | No | Body | 15-20 |
| cbdRange | text | No | Body | 1-2 |
| notes | text | No | Body | Our proprietary blend |

**Complete Response**:
```json
{
  "success": true,
  "cultivarId": "cult999...",
  "message": "Cultivar personalizado creado",
  "error": "Cultivar name already exists",
  "code": "CULTIVAR_EXISTS"
}
```

---

### Get Cultivars by Facility

**Endpoint**: `POST /cultivars/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `cultivars.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getCultivarsByFacility`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/cultivars/get-by-facility`
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
| facilityId | text | No | Body | f78ghi... |

**Complete Response**: Same as getCultivarsByCrop, filtered by facility linkage

**Bubble Usage**: Cultivars List Page - shows only cultivars linked to current facility

---

### Update Cultivar

**Endpoint**: `POST /cultivars/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `cultivars.update` - TO BE CREATED

**Note**: Can only update custom cultivars, not system cultivars

#### Bubble API Connector Configuration

**Name**: `updateCultivar`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/cultivars/update`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "cultivarId": "<cultivarId>",
  "name": "<name>",
  "varietyType": "<varietyType>",
  "floweringWeeks": <floweringWeeks>,
  "notes": "<notes>"
}
```

**Complete Response**:
```json
{
  "success": true,
  "message": "Cultivar actualizado",
  "error": "Cannot update system cultivar",
  "code": "CANNOT_UPDATE_SYSTEM_CULTIVAR"
}
```

---

### Delete Cultivar

**Endpoint**: `POST /cultivars/delete`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `cultivars.delete` - TO BE CREATED

**Note**: Can only delete custom cultivars, not system cultivars

#### Bubble API Connector Configuration

**Name**: `deleteCultivar`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/cultivars/delete`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "cultivarId": "<cultivarId>"
}
```

**Complete Response**:
```json
{
  "success": true,
  "message": "Cultivar eliminado",
  "error": "Cannot delete cultivar with active production",
  "code": "CULTIVAR_HAS_DEPENDENCIES"
}
```

**Validation**:
- Cannot delete system cultivars
- Cannot delete if used in active production orders

---

## MODULE 16: Supplier Management

Suppliers provide materials, equipment, and consumables.

### Create Supplier

**Endpoint**: `POST /suppliers/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `suppliers.create` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `createSupplier`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/suppliers/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "companyId": "<companyId>",
  "name": "<name>",
  "taxId": "<taxId>",
  "productCategories": ["<category>"],
  "contactName": "<contactName>",
  "contactEmail": "<contactEmail>",
  "contactPhone": "<contactPhone>",
  "address": "<address>",
  "website": "<website>",
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| companyId | text | No | Body | k12def... |
| name | text | No | Body | FarmChem Inc |
| taxId | text | No | Body | 900123456-7 |
| productCategories | list | No | Body | ["nutrients", "pesticides"] |
| contactName | text | No | Body | Juan Pérez |
| contactEmail | text | No | Body | ventas@farmchem.com |
| contactPhone | text | No | Body | +573001234567 |
| address | text | No | Body | Calle 50 #45-30 |
| website | text | No | Body | https://farmchem.com |
| notes | text | No | Body | Preferred supplier |

**Complete Response**:
```json
{
  "success": true,
  "supplierId": "s55mno...",
  "message": "Proveedor creado exitosamente",
  "error": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

**Product Categories**: nutrients, pesticides, equipment, seeds, growing_media, packaging, lab_testing, other

---

### Get Suppliers by Company

**Endpoint**: `POST /suppliers/get-by-company`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `suppliers.getByCompany` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getSuppliersByCompany`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/suppliers/get-by-company`
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
| companyId | text | No | URL | k12def... |

**Complete Response**:
```json
[
  {
    "id": "s55mno...",
    "name": "FarmChem Inc",
    "taxId": "900123456-7",
    "productCategories": ["nutrients", "pesticides"],
    "contactName": "Juan Pérez",
    "contactEmail": "ventas@farmchem.com",
    "contactPhone": "+573001234567",
    "status": "active",
    "lastOrderDate": "2025-01-10T00:00:00Z"
  }
]
```

**Response Fields**:
- `id` (text)
- `name` (text)
- `taxId` (text)
- `productCategories` (list)
- `contactName` (text)
- `contactEmail` (text)
- `contactPhone` (text)
- `status` (text) - active, inactive
- `lastOrderDate` (text) - ISO date

---

### Get Supplier by ID

**Endpoint**: `POST /suppliers/get-by-id`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `suppliers.getById` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getSupplierById`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/suppliers/get-by-id`
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
| supplierId | text | No | URL | s55mno... |

**Complete Response**: Same fields as list + full details (address, website, notes, etc.)

---

### Update Supplier

**Endpoint**: `POST /suppliers/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `suppliers.update` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `updateSupplier`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/suppliers/update`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**: Same as create, plus `supplierId`

**Complete Response**:
```json
{
  "success": true,
  "message": "Proveedor actualizado exitosamente",
  "error": "Supplier not found",
  "code": "SUPPLIER_NOT_FOUND"
}
```

---

### Delete Supplier

**Endpoint**: `POST /suppliers/delete`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `suppliers.delete` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `deleteSupplier`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/suppliers/delete`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "supplierId": "<supplierId>"
}
```

**Complete Response**:
```json
{
  "success": true,
  "message": "Proveedor eliminado exitosamente",
  "error": "Cannot delete supplier with inventory items",
  "code": "SUPPLIER_HAS_DEPENDENCIES"
}
```

**Validation**:
- Cannot delete if supplier has inventory items or purchase orders
- Soft delete (set status="inactive")

---

## MODULE 17: User Invitations & Team Management

Admin functionality to invite team members and manage user roles. This module covers the **admin side** of invitations (sending, tracking, resending). For the **invited user side** (accepting invitations), see Phase 1 Module 1B.

> **Cross-Reference**: Invited user acceptance endpoints are documented in [PHASE-1-ONBOARDING-ENDPOINTS.md - Module 1B](PHASE-1-ONBOARDING-ENDPOINTS.md#module-1b-invited-user-acceptance)

---

### Get Users by Company

**Endpoint**: `POST /users/get-by-company`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.getByCompany` - TO BE CREATED

Get all users (active, pending, deactivated) for the current company with their roles and invitation status.

#### Bubble API Connector Configuration

**Name**: `getUsersByCompany`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/get-by-company`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "companyId": "<companyId>",
  "status": "<status>",
  "roleId": "<roleId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| companyId | text | No | Body | comp123... |
| status | text | No | Body | active (optional filter) |
| roleId | text | No | Body | role456... (optional filter) |

**Complete Response**:
```json
[
  {
    "_id": "user123...",
    "email": "juan@example.com",
    "firstName": "Juan",
    "lastName": "Manager",
    "role": {
      "_id": "role456",
      "role_name": "FACILITY_MANAGER",
      "display_name": "Manager"
    },
    "status": "active",
    "email_verified": true,
    "facilities": [
      {
        "_id": "fac001",
        "name": "North Farm"
      }
    ],
    "lastLogin": 1705320000000,
    "createdAt": 1705000000000
  },
  {
    "_id": "user789...",
    "email": "luis@example.com",
    "firstName": "Luis",
    "lastName": "Pending",
    "role": {
      "_id": "role789",
      "role_name": "WORKER",
      "display_name": "Worker"
    },
    "status": "pending",
    "email_verified": false,
    "invitation": {
      "_id": "inv456",
      "status": "pending",
      "expires_at": 1705580000000,
      "created_at": 1705320000000
    },
    "facilities": [],
    "createdAt": 1705320000000
  }
]
```

**Status Values**: `active`, `pending`, `deactivated`

**Backend Processing**:
1. Verify requester has ADMIN or FACILITY_MANAGER role
2. Query `users` table filtering by `company_id`
3. Join with `roles` table for role details
4. Join with `invitations` table for pending users
5. Join with facility access records
6. Return sorted by status (pending first), then by name

---

### Invite User

**Endpoint**: `POST /users/invite`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.invite` - TO BE CREATED

Send invitation email to new user with role and facility assignments.

#### Bubble API Connector Configuration

**Name**: `inviteUser`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/invite`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "email": "<email>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "roleId": "<roleId>",
  "facilityIds": ["<facilityId1>", "<facilityId2>"]
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| email | text | No | Body | maria@example.com |
| firstName | text | No | Body | María |
| lastName | text | No | Body | Supervisor |
| roleId | text | No | Body | role456... |
| facilityIds | list | No | Body | ["fac001", "fac002"] |

**Complete Response**:
```json
{
  "success": true,
  "invitationId": "inv789...",
  "message": "Invitación enviada a maria@example.com",
  "expiresAt": 1705580000000,
  "token": "abc123xyz..." // Only for testing, not sent to client in production
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "User with this email already exists in company",
  "code": "USER_ALREADY_EXISTS"
}
```

```json
{
  "success": false,
  "error": "Pending invitation already exists for this email",
  "code": "INVITATION_ALREADY_PENDING"
}
```

**Backend Processing**:
1. Verify requester has ADMIN or FACILITY_MANAGER role
2. Check email doesn't already exist in company
3. Check no pending invitation exists for this email
4. Generate unique UUID v4 token
5. Create record in `invitations` table:
   - email, firstName, lastName
   - inviter_user_id (requester)
   - company_id (from requester)
   - role_id
   - facility_ids (array)
   - token (UUID v4)
   - status: "pending"
   - expires_at: current time + 72 hours
6. Send invitation email with link: `https://app.alquemist.com/accept-invitation?token={token}`
7. Return invitation ID and expiration

**Database Tables**:
- **Creates**: `invitations` (1 record)
- **Reads**: `users`, `invitations` (validation)

---

### Resend Invitation

**Endpoint**: `POST /users/resend-invitation`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.resendInvitation` - TO BE CREATED

Resend invitation email with a new token (invalidates previous token).

#### Bubble API Connector Configuration

**Name**: `resendInvitation`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/resend-invitation`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "invitationId": "<invitationId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| invitationId | text | No | Body | inv789... |

**Complete Response**:
```json
{
  "success": true,
  "message": "Invitación reenviada",
  "newToken": "xyz789abc...", // Only for testing
  "expiresAt": 1705580000000
}
```

**Backend Processing**:
1. Verify requester has ADMIN or FACILITY_MANAGER role
2. Verify invitation exists and belongs to requester's company
3. Verify invitation status is "pending" or "expired"
4. Generate new UUID v4 token
5. Update `invitations` record:
   - token: new token
   - status: "pending"
   - expires_at: current time + 72 hours
   - updated_at: current time
6. Send new invitation email with new link
7. Return success

**Database Tables**:
- **Updates**: `invitations` (token, expires_at, status)

---

### Revoke Invitation

**Endpoint**: `POST /users/revoke-invitation`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.revokeInvitation` - TO BE CREATED

Cancel a pending invitation (prevents user from accepting).

#### Bubble API Connector Configuration

**Name**: `revokeInvitation`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/revoke-invitation`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "invitationId": "<invitationId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| invitationId | text | No | Body | inv789... |

**Complete Response**:
```json
{
  "success": true,
  "message": "Invitación revocada"
}
```

**Backend Processing**:
1. Verify requester has ADMIN or FACILITY_MANAGER role
2. Verify invitation exists and belongs to requester's company
3. Verify invitation status is "pending"
4. Update `invitations` record:
   - status: "revoked"
   - revoked_at: current time
   - updated_at: current time
5. Return success

**Database Tables**:
- **Updates**: `invitations` (status, revoked_at)

---

### Update User Role

**Endpoint**: `POST /users/update-role`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.updateRole` - TO BE CREATED

Change a user's role assignment.

#### Bubble API Connector Configuration

**Name**: `updateUserRole`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/update-role`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "userId": "<userId>",
  "newRoleId": "<newRoleId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| userId | text | No | Body | user123... |
| newRoleId | text | No | Body | role789... |

**Complete Response**:
```json
{
  "success": true,
  "message": "Rol actualizado"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Cannot change role of company owner",
  "code": "CANNOT_CHANGE_OWNER_ROLE"
}
```

**Backend Processing**:
1. Verify requester has ADMIN role
2. Verify user exists and belongs to same company
3. Verify user is not the company owner (cannot change owner role)
4. Verify new role exists
5. Update `users` record:
   - role_id: new role ID
   - updated_at: current time
6. Return success

**Database Tables**:
- **Updates**: `users` (role_id)
- **Reads**: `users`, `roles` (validation)

---

### Deactivate User

**Endpoint**: `POST /users/deactivate`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.deactivate` - TO BE CREATED

Deactivate a user account (prevents login, preserves data).

#### Bubble API Connector Configuration

**Name**: `deactivateUser`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/deactivate`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "userId": "<userId>",
  "reason": "<reason>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| userId | text | No | Body | user123... |
| reason | text | No | Body | Employee left company (optional) |

**Complete Response**:
```json
{
  "success": true,
  "message": "Usuario desactivado"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Cannot deactivate company owner",
  "code": "CANNOT_DEACTIVATE_OWNER"
}
```

**Backend Processing**:
1. Verify requester has ADMIN or FACILITY_MANAGER role
2. Verify user exists and belongs to same company
3. Verify user is not the company owner
4. Update `users` record:
   - status: "deactivated"
   - deactivated_at: current time
   - deactivation_reason: reason (if provided)
   - updated_at: current time
5. Invalidate user's active sessions
6. Return success

**Database Tables**:
- **Updates**: `users` (status, deactivated_at)

---

## MODULE 18: Facility Management & Switcher

Multi-facility operations management. Enable companies to manage multiple cultivation sites and switch facility context. All data (areas, inventory, orders) is scoped to the active facility.

---

### Get Facilities by Company

**Endpoint**: `POST /facilities/get-by-company`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.getByCompany` - TO BE CREATED

Get all facilities for the current company with stats (areas, users, active orders).

#### Bubble API Connector Configuration

**Name**: `getFacilitiesByCompany`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/get-by-company`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "companyId": "<companyId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| companyId | text | No | Body | comp123... |

**Complete Response**:
```json
[
  {
    "_id": "fac001...",
    "name": "North Farm",
    "license_number": "COL-CNB-2024-001",
    "license_type": "commercial_growing",
    "primary_crop_type_ids": ["crop_cannabis"],
    "municipality_code": "05001",
    "municipality_name": "Medellín",
    "department_code": "05",
    "department_name": "Antioquia",
    "total_area_m2": 500,
    "climate_zone": "tropical",
    "status": "active",
    "is_current": true,
    "stats": {
      "total_areas": 8,
      "total_users": 12,
      "active_production_orders": 5,
      "total_batches": 23
    },
    "created_at": 1705000000000,
    "updated_at": 1705320000000
  },
  {
    "_id": "fac002...",
    "name": "South Greenhouse",
    "license_number": "COL-CNB-2024-002",
    "license_type": "commercial_growing",
    "primary_crop_type_ids": ["crop_cannabis"],
    "municipality_code": "05615",
    "municipality_name": "Rionegro",
    "department_code": "05",
    "department_name": "Antioquia",
    "total_area_m2": 200,
    "climate_zone": "subtropical",
    "status": "active",
    "is_current": false,
    "stats": {
      "total_areas": 4,
      "total_users": 5,
      "active_production_orders": 2,
      "total_batches": 8
    },
    "created_at": 1705200000000,
    "updated_at": 1705320000000
  }
]
```

**Backend Processing**:
1. Verify requester has access to company
2. Query `facilities` table filtering by `company_id`
3. Join with `geographic_locations` for municipality/department names
4. Calculate stats for each facility:
   - Count `areas` where `facility_id` matches
   - Count `users` with access to facility
   - Count `production_orders` with status "en_proceso"
   - Count `batches` with status "active"
5. Mark current facility (`is_current: true`) based on user's `currentFacilityId`
6. Return sorted by name

**Database Tables**:
- **Reads**: `facilities`, `geographic_locations`, `areas`, `users`, `production_orders`, `batches`

---

### Create Facility

**Endpoint**: `POST /facilities/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.create` - TO BE CREATED

Create a new facility (subject to plan limits).

#### Bubble API Connector Configuration

**Name**: `createFacility`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "companyId": "<companyId>",
  "name": "<name>",
  "license_number": "<license_number>",
  "license_type": "<license_type>",
  "primary_crop_type_ids": ["<cropTypeId>"],
  "address": "<address>",
  "municipality_code": "<municipality_code>",
  "department_code": "<department_code>",
  "latitude": <latitude>,
  "longitude": <longitude>,
  "total_area_m2": <total_area_m2>,
  "climate_zone": "<climate_zone>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| companyId | text | No | Body | comp123... |
| name | text | No | Body | Urban Facility |
| license_number | text | No | Body | COL-CNB-2024-003 |
| license_type | text | No | Body | commercial_growing |
| primary_crop_type_ids | list | No | Body | ["crop_cannabis"] |
| address | text | No | Body | Calle 50 #45-30 (optional) |
| municipality_code | text | No | Body | 05001 |
| department_code | text | No | Body | 05 |
| latitude | number | No | Body | 6.2442 (optional) |
| longitude | number | No | Body | -75.5812 (optional) |
| total_area_m2 | number | No | Body | 1000 |
| climate_zone | text | No | Body | tropical |

**License Types**: `commercial_growing`, `research`, `processing`, `other`

**Climate Zones**: `tropical`, `subtropical`, `temperate`

**Complete Response**:
```json
{
  "success": true,
  "facilityId": "fac003...",
  "message": "Instalación creada exitosamente"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Facility limit reached for current plan (max: 5)",
  "code": "FACILITY_LIMIT_REACHED",
  "current_count": 5,
  "max_allowed": 5
}
```

```json
{
  "success": false,
  "error": "License number already exists",
  "code": "LICENSE_NUMBER_EXISTS"
}
```

**Backend Processing**:
1. Verify requester has ADMIN or FACILITY_MANAGER role
2. Verify company exists
3. **Check plan limits**:
   - Query company's `subscription_plan`
   - Count existing facilities for company
   - Compare with `max_facilities` for plan
   - Return error if limit reached
4. Validate license number is unique
5. Create record in `facilities` table
6. Grant facility access to creator (in user-facility access table)
7. Return facility ID

**Plan Limits**:
- **Basic**: 1 facility
- **Professional**: 5 facilities
- **Enterprise**: Unlimited

**Database Tables**:
- **Creates**: `facilities` (1 record)
- **Reads**: `companies` (plan validation)
- **Updates**: User-facility access table

---

### Update Facility

**Endpoint**: `POST /facilities/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.update` - TO BE CREATED

Update facility details (name, address, license, etc.).

#### Bubble API Connector Configuration

**Name**: `updateFacility`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/update`

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
  "license_number": "<license_number>",
  "license_type": "<license_type>",
  "primary_crop_type_ids": ["<cropTypeId>"],
  "address": "<address>",
  "municipality_code": "<municipality_code>",
  "total_area_m2": <total_area_m2>,
  "climate_zone": "<climate_zone>",
  "status": "<status>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | fac001... |
| name | text | No | Body | North Farm - Updated |
| license_number | text | No | Body | COL-CNB-2024-001-R |
| license_type | text | No | Body | commercial_growing |
| primary_crop_type_ids | list | No | Body | ["crop_cannabis", "crop_coffee"] |
| address | text | No | Body | Updated address |
| municipality_code | text | No | Body | 05001 |
| total_area_m2 | number | No | Body | 750 |
| climate_zone | text | No | Body | tropical |
| status | text | No | Body | active |

**Status Values**: `active`, `inactive`, `suspended`

**Complete Response**:
```json
{
  "success": true,
  "message": "Instalación actualizada"
}
```

**Backend Processing**:
1. Verify requester has ADMIN or FACILITY_MANAGER role
2. Verify facility exists and belongs to requester's company
3. Validate new license number is unique (if changed)
4. Update `facilities` record with provided fields
5. Set `updated_at` to current time
6. Return success

**Database Tables**:
- **Updates**: `facilities`

---

### Switch Facility

**Endpoint**: `POST /facilities/switch`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.switch` - TO BE CREATED

Switch user's current facility context. All subsequent operations will be scoped to the new facility.

#### Bubble API Connector Configuration

**Name**: `switchFacility`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/switch`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "userId": "<userId>",
  "newFacilityId": "<newFacilityId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| userId | text | No | Body | user123... |
| newFacilityId | text | No | Body | fac002... |

**Complete Response**:
```json
{
  "success": true,
  "message": "Instalación cambiada a South Greenhouse",
  "facility": {
    "_id": "fac002...",
    "name": "South Greenhouse"
  }
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "User does not have access to this facility",
  "code": "FACILITY_ACCESS_DENIED"
}
```

**Backend Processing**:
1. Verify requester is switching their own facility (userId matches token)
2. Verify target facility exists
3. Verify user has access to target facility
4. Update `users` record:
   - currentFacilityId: new facility ID
   - updated_at: current time
5. Return success with facility details

**UI Impact**:
After switching, Bubble should:
1. Update `Current User > currentFacilityId`
2. Refresh all repeating groups that use facility context
3. Update facility switcher dropdown to show new selection

**Database Tables**:
- **Updates**: `users` (currentFacilityId)
- **Reads**: `facilities`, user-facility access table

---

### Get Facility by ID

**Endpoint**: `POST /facilities/get-by-id`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.getById` - TO BE CREATED

Get full details for a specific facility (used for Facility Settings page).

#### Bubble API Connector Configuration

**Name**: `getFacilityById`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/get-by-id`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | fac001... |

**Complete Response**:
```json
{
  "_id": "fac001...",
  "company_id": "comp123...",
  "name": "North Farm",
  "license_number": "COL-CNB-2024-001",
  "license_type": "commercial_growing",
  "primary_crop_type_ids": ["crop_cannabis"],
  "address": "Calle 50 #45-30",
  "municipality_code": "05001",
  "municipality": {
    "code": "05001",
    "name": "Medellín",
    "department_code": "05",
    "department_name": "Antioquia",
    "timezone": "America/Bogota"
  },
  "latitude": 6.2442,
  "longitude": -75.5812,
  "total_area_m2": 500,
  "climate_zone": "tropical",
  "status": "active",
  "created_at": 1705000000000,
  "updated_at": 1705320000000
}
```

**Backend Processing**:
1. Verify requester has access to facility
2. Query `facilities` table by ID
3. Join with `geographic_locations` for full location details
4. Return full facility record

**Database Tables**:
- **Reads**: `facilities`, `geographic_locations`

---

## MODULE 19: Inventory Management

Comprehensive stock tracking for all facility materials.

### Create Inventory Item

**Endpoint**: `POST /inventory/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `inventory.create` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `createInventoryItem`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/inventory/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "category": "<category>",
  "subcategory": "<subcategory>",
  "name": "<name>",
  "sku": "<sku>",
  "supplierId": "<supplierId>",
  "unitOfMeasure": "<unitOfMeasure>",
  "currentStock": <currentStock>,
  "reorderPoint": <reorderPoint>,
  "reorderQuantity": <reorderQuantity>,
  "unitCost": <unitCost>,
  "storageLocation": "<storageLocation>",
  "expirationDate": "<expirationDate>",
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| category | text | No | Body | consumables |
| subcategory | text | No | Body | nutrients |
| name | text | No | Body | Nutriente A - NPK 10-10-10 |
| sku | text | No | Body | NUT-NPK-10-10-10 |
| supplierId | text | No | Body | s55mno... |
| unitOfMeasure | text | No | Body | liters |
| currentStock | number | No | Body | 50 |
| reorderPoint | number | No | Body | 10 |
| reorderQuantity | number | No | Body | 30 |
| unitCost | number | No | Body | 45000 |
| storageLocation | text | No | Body | Warehouse A, Shelf 3 |
| expirationDate | text | No | Body | 2026-12-31 |
| notes | text | No | Body | Organic certified |

**Categories**:
- **living**: plants, seeds, clones
- **equipment**: tools, machines, sensors
- **materials**: growing_media, pots, trays, irrigation
- **consumables**: nutrients, pesticides, cleaning, packaging

**Unit of Measure**: units, grams, kilograms, liters, milliliters, pounds, ounces, square_meters

**Complete Response**:
```json
{
  "success": true,
  "inventoryId": "inv789...",
  "message": "Item de inventario creado",
  "error": "SKU already exists",
  "code": "SKU_EXISTS"
}
```

---

### Get Inventory by Facility

**Endpoint**: `POST /inventory/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `inventory.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getInventoryByFacility`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/inventory/get-by-facility`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Complete Response**:
```json
[
  {
    "id": "inv789...",
    "category": "consumables",
    "subcategory": "nutrients",
    "name": "Nutriente A - NPK 10-10-10",
    "sku": "NUT-NPK-10-10-10",
    "currentStock": 50,
    "reorderPoint": 10,
    "unitOfMeasure": "liters",
    "stockStatus": "adequate",
    "supplierName": "FarmChem Inc",
    "lastUpdated": "2025-01-15T14:30:00Z"
  }
]
```

**Stock Status**: critical (below reorder point), low (near reorder), adequate, overstocked

---

### Get Inventory by Category

**Endpoint**: `POST /inventory/get-by-category`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `inventory.getByCategory` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getInventoryByCategory`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/inventory/get-by-category`
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
| facilityId | text | No | Body | f78ghi... |
| category | text | No | URL | consumables |

**Complete Response**: Same as getByFacility, filtered by category

**Bubble Usage**: Separate tabs/pages for each inventory category

---

### Get Inventory Item by ID

Standard get-by-id endpoint with full details

---

### Update Inventory Item

Standard update endpoint (name, supplier, reorder points, etc.)

---

### Adjust Stock

**Endpoint**: `POST /inventory/adjust-stock`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `inventory.adjustStock` - TO BE CREATED

**Purpose**: Add or consume stock (separate from production consumption tracking)

#### Bubble API Connector Configuration

**Name**: `adjustInventoryStock`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/inventory/adjust-stock`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "inventoryId": "<inventoryId>",
  "adjustmentType": "<adjustmentType>",
  "quantity": <quantity>,
  "reason": "<reason>",
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| inventoryId | text | No | Body | inv789... |
| adjustmentType | text | No | Body | addition |
| quantity | number | No | Body | 20 |
| reason | text | No | Body | purchase |
| notes | text | No | Body | Received shipment #1234 |

**Adjustment Types**: addition, consumption, waste, transfer, correction

**Reason**: purchase, production_use, waste, expired, damaged, theft, transfer, inventory_count, other

**Complete Response**:
```json
{
  "success": true,
  "newStock": 70,
  "message": "Stock ajustado exitosamente",
  "error": "Insufficient stock",
  "code": "INSUFFICIENT_STOCK"
}
```

**Validation**: Cannot consume more than current stock

---

### Get Low Stock Items

**Endpoint**: `POST /inventory/low-stock`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `inventory.getLowStock` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getLowStockItems`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/inventory/low-stock`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Complete Response**: Same fields as getByFacility, filtered where currentStock <= reorderPoint

**Bubble Usage**:
- Alert banner on dashboard
- Dedicated "Low Stock" page
- Email notifications (future)

---

### Delete Inventory Item

Standard delete endpoint (soft delete if has transaction history)

---

## MODULE 20: Facility Settings

Configure facility-specific settings.

### Get Facility Settings

**Endpoint**: `POST /facilities/settings/get`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.getSettings` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getFacilitySettings`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/settings/get`
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
| facilityId | text | No | Body | f78ghi... |

**Complete Response**:
```json
{
  "facilityId": "f78ghi...",
  "timezone": "America/Bogota",
  "workdayStart": "08:00",
  "workdayEnd": "17:00",
  "workdays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "defaultActivityDuration": 30,
  "autoScheduling": true,
  "notificationsEnabled": true,
  "lowStockAlertEnabled": true,
  "overdueActivityAlertEnabled": true
}
```

**Response Fields**:
- `facilityId` (text)
- `timezone` (text)
- `workdayStart` (text) - HH:MM format
- `workdayEnd` (text) - HH:MM format
- `workdays` (list) - days of week
- `defaultActivityDuration` (number) - minutes
- `autoScheduling` (boolean)
- `notificationsEnabled` (boolean)
- `lowStockAlertEnabled` (boolean)
- `overdueActivityAlertEnabled` (boolean)

---

### Update Facility Settings

**Endpoint**: `POST /facilities/settings/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `facilities.updateSettings` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `updateFacilitySettings`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/settings/update`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**: Same fields as get (partial update allowed)

**Complete Response**:
```json
{
  "success": true,
  "message": "Configuración actualizada",
  "error": "Invalid timezone",
  "code": "INVALID_TIMEZONE"
}
```

**Bubble Workflow**: Settings page with form, save button

---

## MODULE 21: Account Settings

User-specific preferences.

### Get Account Settings

**Endpoint**: `POST /users/settings/get`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.getSettings` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getAccountSettings`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/settings/get`
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
| userId | text | No | URL | j97abc... |

**Complete Response**:
```json
{
  "userId": "j97abc...",
  "preferredLanguage": "es",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "emailNotifications": true,
  "smsNotifications": false,
  "theme": "light"
}
```

**Response Fields**:
- `userId` (text)
- `preferredLanguage` (text) - es, en
- `dateFormat` (text) - DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- `timeFormat` (text) - 12h, 24h
- `emailNotifications` (boolean)
- `smsNotifications` (boolean)
- `theme` (text) - light, dark

---

### Update Account Settings

**Endpoint**: `POST /users/settings/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `users.updateSettings` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `updateAccountSettings`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/settings/update`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**: Same fields as get (partial update allowed)

**Complete Response**:
```json
{
  "success": true,
  "message": "Preferencias actualizadas",
  "error": "Invalid language code",
  "code": "INVALID_LANGUAGE"
}
```

**Bubble Workflow**: Account settings page, save button

---

## IMPLEMENTATION STATUS SUMMARY

### Module Status

**MODULE 8: Area Management** - 5 endpoints
- ⚠️ Create area
- ⚠️ Get areas by facility
- ⚠️ Get area by ID
- ⚠️ Update area
- ⚠️ Delete area

**MODULE 15: Cultivar Management** - 7 endpoints
- ⚠️ Get crop types
- ⚠️ Get cultivars by crop
- ⚠️ Link cultivars to facility
- ⚠️ Create custom cultivar
- ⚠️ Get cultivars by facility
- ⚠️ Update cultivar
- ⚠️ Delete cultivar

**MODULE 16: Supplier Management** - 5 endpoints
- ⚠️ Create supplier
- ⚠️ Get suppliers by company
- ⚠️ Get supplier by ID
- ⚠️ Update supplier
- ⚠️ Delete supplier

**MODULE 17: Other Crops Management** - 4 endpoints
- ⚠️ Create other crop
- ⚠️ Get other crops by facility
- ⚠️ Update other crop
- ⚠️ Delete other crop

**MODULE 18: Compliance Templates** - 5 endpoints
- ⚠️ Create compliance template
- ⚠️ Get compliance templates by facility
- ⚠️ Get compliance template by ID
- ⚠️ Update compliance template
- ⚠️ Delete compliance template

**MODULE 19: Inventory Management** - 8 endpoints
- ⚠️ Create inventory item
- ⚠️ Get inventory by facility
- ⚠️ Get inventory by category
- ⚠️ Get inventory item by ID
- ⚠️ Update inventory item
- ⚠️ Adjust stock
- ⚠️ Get low stock items
- ⚠️ Delete inventory item

**MODULE 20: Facility Settings** - 2 endpoints
- ⚠️ Get facility settings
- ⚠️ Update facility settings

**MODULE 21: Account Settings** - 2 endpoints
- ⚠️ Get account settings
- ⚠️ Update account settings

**Total Phase 2 Endpoints**: 43 endpoints (0 implemented, 43 pending)

---

### Convex Files to Create

- `convex/areas.ts` - MODULE 8
- `convex/crops.ts` - MODULE 15 (crop types)
- `convex/cultivars.ts` - MODULE 15 (cultivars)
- `convex/suppliers.ts` - MODULE 16
- `convex/otherCrops.ts` - MODULE 17
- `convex/complianceTemplates.ts` - MODULE 18
- `convex/inventory.ts` - MODULE 19
- `convex/facilities.ts` - MODULE 20 (add settings functions)
- `convex/users.ts` - MODULE 21 (add settings functions)

---

## ERROR CODES

**Phase 2 Specific Error Codes**:
- `AREA_NOT_FOUND` - Area ID doesn't exist
- `AREA_HAS_DEPENDENCIES` - Cannot delete area with active production
- `CULTIVAR_EXISTS` - Cultivar name already in facility
- `CULTIVAR_HAS_DEPENDENCIES` - Cannot delete cultivar in use
- `CANNOT_UPDATE_SYSTEM_CULTIVAR` - Cannot modify pre-defined cultivars
- `SUPPLIER_NOT_FOUND` - Supplier ID doesn't exist
- `SUPPLIER_HAS_DEPENDENCIES` - Cannot delete supplier with inventory
- `CROP_NAME_EXISTS` - Other crop name already in facility
- `INVALID_FIELD_CONFIG` - Compliance template field configuration invalid
- `SKU_EXISTS` - Inventory SKU already exists
- `INSUFFICIENT_STOCK` - Cannot consume more than available
- `INVALID_TIMEZONE` - Invalid timezone format
- `INVALID_LANGUAGE` - Invalid language code

For complete error handling, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md).

---

## CRUD PATTERN REFERENCE

All master data entities follow this pattern:

**4 Components**:
1. **List Page** - getByFacility/getByCompany endpoint
2. **Create Popup** - create endpoint
3. **Detail Page** - getById endpoint
4. **Edit Page** - update endpoint

**Standard Actions**:
- Create → Action call, close popup, refresh list
- Read → Data call on page load
- Update → Action call, navigate back to detail/list
- Delete → Action call with confirmation, navigate to list

For detailed UI patterns, see [../ui/bubble/CRUD-PATTERN.md](../ui/bubble/CRUD-PATTERN.md).

---

## BUBBLE DEVELOPER NOTES

### Common Patterns

**Facility Scoping**:
All Phase 2 endpoints are facility-scoped. Always pass `facilityId` from `Current User's primary_facility_id` or facility selector.

**Authentication**:
All calls require `Authorization: Bearer <token>` header with `Current User's session_token`.

**Soft Deletes**:
Most delete operations are soft deletes (status="inactive") if the entity has dependencies.

**Validation Before Delete**:
Check for dependencies:
- Areas → active production orders
- Cultivars → active production orders
- Suppliers → inventory items or purchase orders
- Inventory → transaction history

**Stock Management**:
- Use `adjustStock` for manual adjustments (purchases, waste, corrections)
- Production consumption tracked separately (Phase 4)
- Low stock alerts calculated automatically

**Settings**:
- Facility settings affect auto-scheduling and notifications
- Account settings are user-specific preferences
- Both support partial updates

---

## REAL-TIME UPDATES & DATA POLLING

**Overview**: Phase 2 involves primarily static master data and inventory tracking. Most modules have low polling requirements, with **Inventory** being the exception requiring more frequent updates.

### Polling Requirements by Module

| Module | Data Type | Volatility | Recommended Polling | Use Case |
|--------|-----------|-----------|-------------------|----------|
| Areas | Master Data | Low | Page load only | Areas rarely change once set up |
| Cultivars | Master Data | Very Low | Page load only | System/facility cultivars static |
| Suppliers | Master Data | Very Low | Page load only | Supplier list rarely changes |
| Other Crops | Master Data | Low | Page load only | Companion plants rarely change |
| Compliance Templates | Master Data | Very Low | Page load only | Templates change infrequently |
| Inventory | Stock Levels | **High** | **30-60 seconds** | Stock levels change with purchases/consumption |
| Facility Settings | Configuration | None | User-triggered | Settings change via form submission |
| Account Settings | User Prefs | None | User-triggered | Settings change via form submission |

### Implementation Patterns by Module

#### Pattern 1: Page Load Only (Areas, Cultivars, Suppliers, Other Crops, Compliance)

**Use When**: Data changes infrequently and users refresh manually for updates.

**Workflow**:
```javascript
// Areas List Page - Page Load
Workflow: Page Load
  → Step 1: API getAreasByFacility
  → Step 2: Set repeating group data source

// Detail Page - Page Load
Workflow: Page Load (Detail page)
  → Step 1: API getAreaById
  → Step 2: Display in form elements

// After Create/Update/Delete
Workflow: After successful action
  → Step 1: Navigate back to list
  → Step 2: List page reloads automatically
  → Step 3: getAreasByFacility called again via page load
```

**Cost**: Minimal (1 call per page load)
**Latency**: 0 seconds (manual refresh)
**Developer Notes**:
- No periodic timer needed
- Users see latest data after successful operations
- Browser back button naturally triggers page reload
- Suitable for master data that changes infrequently

#### Pattern 2: Event-Based Refresh (All CRUD Operations)

**Use When**: Need immediate reflection of changes without polling.

**Workflow**:
```javascript
// After Create Area Success
Workflow: createArea → success
  → Step 1: Close popup
  → Step 2: API getAreasByFacility (refresh list immediately)
  → Step 3: Show toast notification "Area created"

// After Update Area Success
Workflow: updateArea → success
  → Step 1: API getAreaById (refresh detail page)
  → Step 2: API getAreasByFacility (refresh list if visible)
  → Step 3: Navigate/show success message

// After Delete Area Success
Workflow: deleteArea → success
  → Step 1: API getAreasByFacility (refresh list)
  → Step 2: Navigate to list page
```

**Cost**: Minimal additional calls
**Latency**: 0 seconds (immediate after action)
**Implementation**:
```
1. Create: Set popup as "full page" or "floating fixed"
2. On success:
   - Close popup
   - Trigger list refresh manually
   - Show notification

3. Update: Similar pattern
   - Save changes
   - Refresh detail and list

4. Delete: With confirmation
   - Show confirmation dialog
   - Delete on confirm
   - Refresh list
```

---

### Inventory Polling Strategy (HIGH PRIORITY)

**Challenge**: Stock levels change frequently with purchases and production usage. Multiple users may update inventory simultaneously.

#### Pattern 3: Smart Polling with Count Endpoint (Recommended)

**Why**: Minimize API calls while maintaining data freshness.

**Workflow**:
```javascript
// Inventory List Page
Workflow: Page Load
  → API: getInventoryByFacility
  → Store inventory data in local variable
  → Set repeating group source

Workflow: Every 30 seconds
  → IF Page is visible (use "Page is visible" state):
    → API: Get count of inventory items in facility
    → IF count differs from stored count:
      → API: getInventoryByFacility (refresh full list)
      → Update repeating group
    → ELSE:
      → Do nothing (no changes)
```

**Cost**: 2 calls per 30 seconds = ~240 calls/day per user
**Latency**: Up to 30 seconds
**Efficiency**: Prevents unnecessary full list refreshes

**Implementation Detail**:
```javascript
// In Bubble:
Repeating Group Source: inventoryList
Page Load:
  1. Set state: inventoryCount = 0
  2. Call getInventoryByFacility
  3. Set state: inventoryCount = getInventoryByFacility.length

Every 30 seconds:
  1. Call checkInventoryCount (lightweight count endpoint)
  2. IF checkInventoryCount > inventoryCount:
     - Call getInventoryByFacility
     - Update repeating group
     - Set state: inventoryCount = new count
```

**Convex Backend - Add Count Endpoint**:
```typescript
// Add to inventory.ts
export const getInventoryCount = httpAction(async (ctx, request) => {
  const body = await request.json();
  const count = await ctx.runQuery(api.inventory.list, body);
  return new Response(JSON.stringify({ count: count.length }), { status: 200 });
});

// Add to http.ts
http.route({
  path: "/inventory/count",
  method: "POST",
  handler: api.inventory.getInventoryCount,
});
```

**Bubble Configuration**:
```
API Name: getInventoryCount
Method: POST
URL: https://handsome-jay-388.convex.site/inventory/count
Body: { "facilityId": "<facilityId>" }
Return Type: Object with "count" field
```

#### Pattern 4: Manual Refresh + Auto-Refresh Hybrid

**Use When**: Users expect immediate updates after their actions but polling for other users' changes.

**Workflow**:
```javascript
// Inventory List Page - Combined Pattern

Page Load:
  → API: getInventoryByFacility
  → Set repeating group data

Workflow: Every 45 seconds (auto-refresh)
  → IF Page is visible:
    → API: getInventoryByFacility
    → Update repeating group
    → Update timestamp indicator

Element: Button "Refresh Now"
Workflow: Click
  → Show loading state
  → API: getInventoryByFacility
  → Update repeating group
  → Update "Last updated" timestamp
  → Hide loading state

Element: Stock Adjustment Form
Workflow: After adjustment success
  → Immediately call getInventoryByFacility
  → Update repeating group
  → Show success notification
```

**Cost**:
- Auto-refresh: 2 calls per minute = ~2,880 calls/day per user (aggressive)
- Manual refresh: User-initiated, no base cost
- Event-refresh: 1 call per action

**Recommendation**: Use 45-60 second interval, not 15 seconds.

---

### Multi-User Collaboration Strategies

**Scenario**: Multiple users managing inventory simultaneously (team at same facility)

**Solution - Event-Based + Periodic Hybrid**:
```javascript
// User A adjusts inventory (stock reduced by 10 units)
Workflow: adjustInventoryStock → success
  → Immediately call getInventoryByFacility
  → Show toast "Stock updated"

// Background periodic refresh (every 45 seconds)
Workflow: Every 45 seconds
  → Call getInventoryByFacility
  → Compare with local copy
  → If any items changed stock levels or status:
    → Update repeating group
    → Show subtle indicator "Updated by another user"
```

**Cost Analysis**:
- Local updates: 0s latency (immediate feedback)
- Other users' updates: 0-45s latency (periodic polling)
- Total cost: ~30 calls/hour per user for 45s interval

---

### Cost Implications Summary

| Strategy | Pattern | Calls/Hour | Data Freshness | Notes |
|----------|---------|-----------|-----------------|-------|
| Page Load Only | Master data | 0-2 | Manual refresh | Low cost, no real-time |
| Event-Based | CRUD actions | 1-3 | Immediate | Best UX, minimal cost |
| Smart Count | Inventory | 120 | 0-30s | Efficient, recommended |
| Auto Refresh (45s) | Polling | 80 | 0-45s | Balanced approach |
| Auto Refresh (15s) | Aggressive | 240+ | 0-15s | High cost, avoid |
| Hybrid | Mixed | 100-150 | 0-45s | Best for inventory |

**Recommended for Phase 2**:
- **Master Data (Areas, Cultivars, Suppliers, Other Crops, Compliance)**: Page load only + event-based refresh after CRUD
- **Inventory (Critical)**: Smart count polling (30s) + event-based after adjustments
- **Settings**: User-triggered only (no polling)

---

### Bubble Developer Guidance

**No Native WebSocket Support**:
Bubble's API Connector cannot maintain persistent WebSocket connections to Convex. HTTP endpoints are one-time request-response, not subscriptions.

**Key Implementation Notes**:

1. **Avoid Polling Anti-Patterns**:
   - ❌ 5-second intervals (excessive cost)
   - ❌ Polling even when page is not visible (wasted calls)
   - ❌ Polling every module equally (prioritize high-volatility data)

2. **Optimize Polling with Conditions**:
   - Use "Page is visible" check before polling
   - Use "Workflow is in view" for specific repeating groups
   - Reduce polling interval when idle (detect user activity)

3. **Data Freshness Tradeoff**:
   - 0s latency: Event-based refresh (immediate feedback)
   - 30s latency: Smart polling with count endpoint
   - 60s latency: Basic periodic polling
   - Manual refresh: Acceptable for static master data

4. **Cost Monitoring**:
   - Estimate: 30s polling = 2,880 calls/day/user
   - Track actual usage in Convex analytics
   - Adjust intervals based on actual data change patterns

5. **Multi-User Scenarios**:
   - Stock adjustments: Immediate refresh for actor + periodic for others
   - Master data: Event-based refresh sufficient
   - Settings: No polling needed (explicit submission)

---

### Testing Real-Time Behavior

**Test Checklist**:
- [ ] Multiple users adjust same inventory item simultaneously
- [ ] One user sees other user's changes within polling interval
- [ ] Page hide/show stops/resumes polling correctly
- [ ] Manual refresh works and immediately reflects changes
- [ ] Network latency doesn't break polling logic
- [ ] Cost (API call count) stays within expectations
- [ ] No duplicate refreshes (debounce/throttle working)

---

## TESTING CHECKLIST

Phase 2 Master Data Setup (0/43 endpoints ready):

**Areas**:
- [ ] Can create area with environmental specs
- [ ] Areas list populates correctly
- [ ] Area detail shows full information
- [ ] Can update area details
- [ ] Cannot delete area with active production
- [ ] Occupancy rate calculated correctly

**Cultivars**:
- [ ] Crop types populate dropdown
- [ ] Cultivars filter by selected crop type
- [ ] Can link multiple cultivars to facility
- [ ] Can create custom cultivar
- [ ] Cannot edit system cultivars
- [ ] Facility cultivar list shows only linked ones

**Suppliers**:
- [ ] Can create supplier with contact info
- [ ] Email and phone validation works
- [ ] Suppliers list shows all company suppliers
- [ ] Can update supplier details
- [ ] Cannot delete supplier with dependencies

**Other Crops**:
- [ ] Can add companion plants
- [ ] Purpose and category dropdowns work
- [ ] Other crops list displays correctly

**Compliance Templates**:
- [ ] Can create template with custom fields
- [ ] Field types render correctly
- [ ] Templates list by facility
- [ ] Cannot delete template with records

**Inventory**:
- [ ] Can create inventory item in all categories
- [ ] Inventory lists by category
- [ ] Stock adjustments update correctly
- [ ] Low stock items show when below reorder point
- [ ] Cannot consume more than available stock
- [ ] Stock status indicators display correctly

**Settings**:
- [ ] Facility settings load correctly
- [ ] Timezone and workdays update successfully
- [ ] Account preferences save correctly
- [ ] Language change reflects in UI

---

**Status**: Phase 2 specification complete
**Ready Endpoints**: 0/43 (0% complete)
**Next Steps**:
1. Implement all Convex functions for Phase 2
2. Test each module systematically
3. Implement Bubble UI following CRUD pattern
4. Move to Phase 3 (Production Templates & AI)

---

**Last Updated**: 2025-01-19
**Version**: 2.0 (New - part of 5-phase restructure)
