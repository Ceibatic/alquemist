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
- **MODULE 17**: Other Crops Management (Non-primary crops)
- **MODULE 18**: Compliance Templates (Regulatory forms)
- **MODULE 19**: Inventory Management (Stock tracking)
- **MODULE 20**: Facility Settings (Configuration)
- **MODULE 21**: Account Settings (User preferences)

**Estimated Pages**: 18-21 screens
**Entry Point**: After completing Phase 1 onboarding
**Pattern**: All modules follow standard CRUD pattern (List, Create, Detail, Edit)

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

## MODULE 17: Other Crops Management

Track non-primary crops grown in facility (companion plants, experimental varieties, etc.)

### Create Other Crop

**Endpoint**: `POST /other-crops/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `otherCrops.create` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `createOtherCrop`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/other-crops/create`

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
  "category": "<category>",
  "purpose": "<purpose>",
  "notes": "<notes>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| name | text | No | Body | Basil |
| category | text | No | Body | herbs |
| purpose | text | No | Body | companion_planting |
| notes | text | No | Body | Helps with pest control |

**Complete Response**:
```json
{
  "success": true,
  "otherCropId": "oc123...",
  "message": "Otro cultivo creado",
  "error": "Name already exists",
  "code": "CROP_NAME_EXISTS"
}
```

**Categories**: herbs, vegetables, fruits, ornamental, experimental, other

**Purpose**: companion_planting, pest_control, experimental, diversification, other

---

### Get Other Crops by Facility

**Endpoint**: `POST /other-crops/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `otherCrops.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getOtherCropsByFacility`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/other-crops/get-by-facility`
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
    "id": "oc123...",
    "name": "Basil",
    "category": "herbs",
    "purpose": "companion_planting",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

---

### Update Other Crop

**Endpoint**: `POST /other-crops/update`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `otherCrops.update` - TO BE CREATED

Standard update endpoint (similar pattern to other modules)

---

### Delete Other Crop

**Endpoint**: `POST /other-crops/delete`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `otherCrops.delete` - TO BE CREATED

Standard delete endpoint (soft delete)

---

## MODULE 18: Compliance Templates

Regulatory form templates (licenses, permits, quality checks, etc.)

### Create Compliance Template

**Endpoint**: `POST /compliance-templates/create`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `complianceTemplates.create` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `createComplianceTemplate`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/compliance-templates/create`

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
  "templateType": "<templateType>",
  "regulatoryBody": "<regulatoryBody>",
  "frequency": "<frequency>",
  "fields": [
    {
      "fieldName": "<fieldName>",
      "fieldType": "<fieldType>",
      "required": <required>,
      "options": ["<option>"]
    }
  ]
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| name | text | No | Body | Monthly Quality Report |
| templateType | text | No | Body | quality_check |
| regulatoryBody | text | No | Body | ICA |
| frequency | text | No | Body | monthly |
| fields | list | No | Body | [{...}] |

**Template Types**: license_renewal, quality_check, safety_inspection, inventory_report, waste_disposal, other

**Field Types**: text, number, date, boolean, dropdown, file_upload

**Frequency**: one_time, daily, weekly, monthly, quarterly, annual

**Complete Response**:
```json
{
  "success": true,
  "templateId": "ct456...",
  "message": "Plantilla de compliance creada",
  "error": "Invalid field configuration",
  "code": "INVALID_FIELD_CONFIG"
}
```

---

### Get Compliance Templates by Facility

**Endpoint**: `POST /compliance-templates/get-by-facility`
**Status**: ⚠️ Not yet implemented
**Convex Function**: `complianceTemplates.getByFacility` - TO BE CREATED

#### Bubble API Connector Configuration

**Name**: `getComplianceTemplatesByFacility`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/compliance-templates/get-by-facility`
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
    "id": "ct456...",
    "name": "Monthly Quality Report",
    "templateType": "quality_check",
    "regulatoryBody": "ICA",
    "frequency": "monthly",
    "status": "active",
    "lastUsed": "2025-01-10T00:00:00Z"
  }
]
```

---

### Get Compliance Template by ID

Standard get-by-id endpoint with full field details

---

### Update Compliance Template

Standard update endpoint

---

### Delete Compliance Template

**Validation**: Cannot delete if template has associated compliance records

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
