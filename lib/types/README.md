# TypeScript Types - Phase 2

This directory contains TypeScript type definitions for the Alquemist platform's Phase 2 features.

## Overview

`phase2.ts` provides complete type definitions for:

- **Areas** - Growing/production areas
- **Cultivars** - Plant varieties and genetics
- **Suppliers** - Supplier management
- **Inventory** - Products and inventory items
- **Invitations** - User invitation system
- **Users** - Extended user types
- **Roles** - Permission system
- **Dashboard** - Metrics and activity tracking
- **Settings** - Facility and account settings

## Usage

### Importing Types

```typescript
// Import specific types
import type { Area, Cultivar, Supplier } from '@/lib/types/phase2';

// Import multiple types
import type {
  Area,
  AreaType,
  AreaStatus,
  CreateAreaInput,
} from '@/lib/types/phase2';
```

### With Convex

Types are designed to match Convex schema definitions:

```typescript
import type { Area } from '@/lib/types/phase2';
import { Id } from '@/convex/_generated/dataModel';

// Area type includes Convex ID types
const area: Area = {
  _id: 'area_123' as Id<'areas'>,
  facility_id: 'facility_456' as Id<'facilities'>,
  name: 'Vegetativo 1',
  area_type: 'vegetative',
  // ... other fields
};
```

### With React Components

```typescript
import type { Area, AreaStatus } from '@/lib/types/phase2';

interface AreaCardProps {
  area: Area;
  onStatusChange: (status: AreaStatus) => void;
}

export function AreaCard({ area, onStatusChange }: AreaCardProps) {
  return (
    <div>
      <h3>{area.name}</h3>
      <p>Type: {area.area_type}</p>
      <p>Status: {area.status}</p>
    </div>
  );
}
```

## Type Categories

### 1. Area Types

#### Core Types

```typescript
type AreaType =
  | 'propagation'    // Propagación (semillas/clones)
  | 'vegetative'     // Vegetativo
  | 'flowering'      // Floración
  | 'drying'         // Secado
  | 'curing'         // Curado
  | 'storage'        // Almacenamiento
  | 'processing'     // Procesamiento
  | 'quarantine';    // Cuarentena

type AreaStatus = 'active' | 'maintenance' | 'inactive';
```

#### Interface

```typescript
interface Area {
  _id: Id<'areas'>;
  facility_id: Id<'facilities'>;
  name: string;
  area_type: AreaType;
  compatible_crop_type_ids: Id<'crop_types'>[];

  // Dimensions
  total_area_m2?: number;
  usable_area_m2?: number;

  // Capacity
  current_occupancy: number;
  reserved_capacity: number;

  // Technical Features
  climate_controlled: boolean;
  environmental_specs?: EnvironmentalSpecs;

  status: AreaStatus;
  created_at: number;
  updated_at: number;
}
```

### 2. Cultivar Types

#### Core Types

```typescript
type CultivarType = 'system' | 'custom';
type VarietyType = 'indica' | 'sativa' | 'hybrid' | 'ruderalis';
type CultivarStatus = 'active' | 'discontinued';
```

#### Characteristics

```typescript
interface CultivarCharacteristics {
  // Cannabis specific
  thc_min?: number;
  thc_max?: number;
  cbd_min?: number;
  cbd_max?: number;
  terpene_profile?: string[];

  // General
  flowering_time_days?: number;
  yield_per_plant_g?: number;
  height_cm?: number;
  growth_difficulty?: 'easy' | 'medium' | 'difficult';

  // Sensory
  aroma?: string;
  flavor?: string;
  effects?: string[];
}
```

### 3. Supplier Types

#### Core Types

```typescript
type SupplierBusinessType =
  | 'S.A.S'
  | 'S.A.'
  | 'Ltda'
  | 'E.U.'
  | 'Persona Natural';
```

#### Interface

```typescript
interface Supplier {
  _id: Id<'suppliers'>;
  company_id: Id<'companies'>;
  name: string;
  legal_name?: string;
  tax_id?: string; // NIT

  // Contact
  primary_contact_email?: string;
  primary_contact_phone?: string;

  // Product & Specialization
  product_categories: string[];
  crop_specialization: string[];

  // Performance
  rating?: number; // 0-5
  delivery_reliability?: number; // 0-100
  quality_score?: number; // 0-100

  is_approved: boolean;
  is_active: boolean;
}
```

### 4. Inventory Types

#### Core Types

```typescript
type ProductCategory =
  | 'nutrient'
  | 'pesticide'
  | 'equipment'
  | 'seed'
  | 'substrate'
  | 'container'
  | 'tool'
  | 'other';

type LotStatus =
  | 'available'
  | 'reserved'
  | 'expired'
  | 'quarantine';

type StockStatus =
  | 'available'
  | 'low'
  | 'critical'
  | 'out_of_stock';
```

#### Interface

```typescript
interface InventoryItem {
  _id: Id<'inventory_items'>;
  product_id: Id<'products'>;
  area_id: Id<'areas'>;

  // Quantities
  quantity_available: number;
  quantity_reserved: number;
  quantity_unit: string;

  // Batch Tracking
  batch_number?: string;
  supplier_lot_number?: string;

  // Dates
  received_date?: number;
  expiration_date?: number;

  // Storage
  reorder_point?: number;
  minimum_stock_level?: number;

  lot_status: LotStatus;
  created_at: number;
}
```

### 5. Invitation Types

```typescript
type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired';

interface Invitation {
  _id: Id<'invitations'>;
  company_id: Id<'companies'>;
  email: string;
  role_id: Id<'roles'>;
  facility_ids: Id<'facilities'>[];
  token: string;
  expires_at: number;
  invited_by: Id<'users'>;
  status: InvitationStatus;
}
```

### 6. Dashboard Types

```typescript
interface DashboardMetrics {
  areas: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
  };
  cultivars: {
    total: number;
    active: number;
    discontinued: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    criticalStock: number;
    expired: number;
  };
  suppliers: {
    total: number;
    active: number;
    approved: number;
  };
  alerts: number;
}

interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: number;
  entity_type: ActivityEntityType;
  entity_id: string;
  user_id?: Id<'users'>;
}
```

## Form Data Types

Simplified types for form inputs (without Convex IDs):

```typescript
// Area form data
interface AreaFormData {
  name: string;
  area_type: AreaType;
  status: AreaStatus;
  compatible_crop_type_ids: string[];
  total_area_m2: number;
  capacity: number;
  climate_controlled: boolean;
  environmental_specs?: EnvironmentalSpecs;
  description?: string;
}

// Cultivar form data
interface CultivarFormData {
  name: string;
  crop_type_id: string;
  variety_type?: string;
  characteristics?: CultivarCharacteristics;
  optimal_conditions?: OptimalConditions;
  notes?: string;
}
```

## Type Guards

Useful type guard functions:

```typescript
// Check if area is climate controlled
function isClimateControlled(area: Area): boolean {
  return area.climate_controlled;
}

// Check if inventory is low stock
function isLowStock(item: InventoryItem): boolean {
  if (!item.reorder_point) return false;
  return item.quantity_available <= item.reorder_point;
}

// Check if invitation is pending
function isPendingInvitation(invitation: Invitation): boolean {
  return invitation.status === 'pending' &&
         invitation.expires_at > Date.now();
}

// Check if supplier is approved
function isApprovedSupplier(supplier: Supplier): boolean {
  return supplier.is_approved && supplier.is_active;
}
```

## Utility Types

Useful TypeScript utility types:

```typescript
// Partial update type
type UpdateArea = Partial<Area> & { _id: Id<'areas'> };

// Pick specific fields
type AreaPreview = Pick<Area, '_id' | 'name' | 'area_type' | 'status'>;

// Omit fields
type AreaWithoutIds = Omit<Area, '_id' | 'facility_id'>;

// Require specific optional fields
type AreaWithSpecs = Area & Required<Pick<Area, 'environmental_specs'>>;

// Create array type
type AreaList = Area[];

// Create map type
type AreaMap = Record<string, Area>;
```

## Best Practices

### 1. Use Specific Types

```typescript
// Good: Specific type
const areaType: AreaType = 'vegetative';

// Avoid: Generic string
const areaType: string = 'vegetative';
```

### 2. Use Discriminated Unions

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // TypeScript knows response.data exists
    return response.data;
  } else {
    // TypeScript knows response.error exists
    throw new Error(response.error);
  }
}
```

### 3. Use Readonly for Immutable Data

```typescript
interface ReadonlyArea extends Readonly<Area> {
  readonly compatible_crop_type_ids: readonly Id<'crop_types'>[];
}
```

### 4. Use Type Assertions Carefully

```typescript
// Good: Type assertion when you're certain
const areaId = 'area_123' as Id<'areas'>;

// Avoid: Unnecessary assertion
const area = data as Area; // Use proper validation instead
```

### 5. Leverage Type Inference

```typescript
// Good: Let TypeScript infer the type
const areas = await convex.query(api.areas.list);
// TypeScript knows areas is Area[]

// Avoid: Redundant type annotation
const areas: Area[] = await convex.query(api.areas.list);
```

## Integration with Validation Schemas

Types should be derived from Zod schemas when possible:

```typescript
import { z } from 'zod';
import { createAreaSchema } from '@/lib/validations';

// Derive type from schema
type CreateAreaInput = z.infer<typeof createAreaSchema>;

// This ensures types stay in sync with validation
```

## Common Patterns

### API Response Types

```typescript
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: any };

async function createArea(data: AreaFormData): Promise<ApiResult<Area>> {
  try {
    const area = await convex.mutation(api.areas.create, data);
    return { success: true, data: area };
  } catch (error) {
    return { success: false, error: 'Error creating area' };
  }
}
```

### List Response Types

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

type AreaListResponse = PaginatedResponse<Area>;
```

### Filter Types

```typescript
interface AreaFilters {
  facility_id?: Id<'facilities'>;
  area_type?: AreaType;
  status?: AreaStatus;
  search?: string;
}

type FilteredAreas = Area[];
```

## Type Safety Checklist

- [ ] Use specific enum types instead of strings
- [ ] Derive types from Zod schemas when possible
- [ ] Use discriminated unions for variants
- [ ] Leverage TypeScript utility types (Pick, Omit, etc.)
- [ ] Add type guards for runtime checks
- [ ] Use readonly for immutable data
- [ ] Avoid `any` - use `unknown` if truly unknown
- [ ] Use optional chaining for nullable fields
- [ ] Validate external data with Zod schemas
- [ ] Keep types synchronized with Convex schema

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev/)
- [Convex TypeScript Guide](https://docs.convex.dev/using/typescript)
