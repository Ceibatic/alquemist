# Validation Schemas - Phase 2

This directory contains all Zod validation schemas for the Alquemist platform, organized by feature domain.

## Structure

```
lib/validations/
├── area.ts           # Area management validations
├── cultivar.ts       # Cultivar management validations
├── supplier.ts       # Supplier management validations
├── inventory.ts      # Inventory & product validations
├── invitation.ts     # User invitation validations
├── settings.ts       # Facility & account settings validations
├── helpers.ts        # Reusable validation utilities
├── index.ts          # Central export point
└── README.md         # This file
```

## Usage

### Importing Validations

```typescript
// Import from central index
import {
  createAreaSchema,
  createSupplierSchema,
  type CreateAreaInput,
  type CreateSupplierInput
} from '@/lib/validations';

// Or import directly from specific files
import { createAreaSchema } from '@/lib/validations/area';
```

### Using with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAreaSchema, type CreateAreaInput } from '@/lib/validations';

function AreaForm() {
  const form = useForm<CreateAreaInput>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: {
      name: '',
      area_type: 'vegetative',
      status: 'active',
      // ...
    },
  });

  const onSubmit = async (data: CreateAreaInput) => {
    // Data is fully typed and validated
    console.log(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Using in Server Actions

```typescript
'use server';

import { z } from 'zod';
import { createAreaSchema } from '@/lib/validations';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function createArea(data: z.infer<typeof createAreaSchema>) {
  try {
    // Validate the data
    const validated = createAreaSchema.parse(data);

    // Call Convex mutation with validated data
    const result = await convex.mutation(api.areas.create, validated);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Datos inválidos', details: error.errors };
    }
    return { success: false, error: 'Error al crear área' };
  }
}
```

## Validation Schemas

### Area Management (`area.ts`)

- **`createAreaSchema`** - Create new area
- **`updateAreaSchema`** - Update existing area
- **`areaFilterSchema`** - Filter areas
- **`environmentalSpecsSchema`** - Environmental specifications

#### Example: Create Area

```typescript
const areaData = {
  name: 'Área de Vegetativo 1',
  area_type: 'vegetative',
  status: 'active',
  compatible_crop_type_ids: ['crop_type_id_1'],
  total_area_m2: 100,
  climate_controlled: true,
  environmental_specs: {
    temperature_min: 18,
    temperature_max: 28,
    humidity_min: 40,
    humidity_max: 70,
  },
};

const validated = createAreaSchema.parse(areaData);
```

### Cultivar Management (`cultivar.ts`)

- **`createCustomCultivarSchema`** - Create custom cultivar
- **`linkSystemCultivarSchema`** - Link system cultivar
- **`updateCultivarSchema`** - Update cultivar
- **`cultivarFilterSchema`** - Filter cultivars
- **`cultivarCharacteristicsSchema`** - Cultivar characteristics (THC/CBD, etc.)

#### Example: Create Custom Cultivar

```typescript
const cultivarData = {
  name: 'Blue Dream',
  crop_type_id: 'cannabis_id',
  variety_type: 'hybrid',
  characteristics: {
    thc_min: 17,
    thc_max: 24,
    cbd_min: 0.1,
    cbd_max: 2,
    flowering_time_days: 63,
  },
  optimal_conditions: {
    temperature_min: 20,
    temperature_max: 26,
    humidity_min: 40,
    humidity_max: 50,
  },
};

const validated = createCustomCultivarSchema.parse(cultivarData);
```

### Supplier Management (`supplier.ts`)

- **`createSupplierSchema`** - Create new supplier
- **`updateSupplierSchema`** - Update supplier
- **`supplierFilterSchema`** - Filter suppliers
- **`approveSupplierSchema`** - Approve/reject supplier

#### Colombian-Specific Validations

```typescript
// NIT validation
const nit = '900.123.456-7'; // Valid format
const validated = nitSchema.parse(nit);

// Phone validation
const phone = '+57 320 123 4567'; // Valid Colombian mobile
const validated = colombianPhoneSchema.parse(phone);

// Format helpers
import { formatNIT, formatColombianPhone } from '@/lib/validations';

const formattedNIT = formatNIT('9001234567'); // Returns: 900.123.456-7
const formattedPhone = formatColombianPhone('3201234567'); // Returns: +57 320 123 4567
```

### Inventory Management (`inventory.ts`)

- **`createProductSchema`** - Create new product
- **`createInventoryItemSchema`** - Add inventory item
- **`updateInventoryItemSchema`** - Update inventory
- **`adjustInventoryQuantitySchema`** - Adjust quantities
- **`transferInventorySchema`** - Transfer between areas
- **`inventoryFilterSchema`** - Filter inventory

#### Example: Create Inventory Item

```typescript
const inventoryData = {
  product_id: 'product_id_1',
  area_id: 'area_id_1',
  quantity_available: 500,
  quantity_unit: 'kg',
  batch_number: 'BATCH-2024-001',
  expiration_date: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  reorder_point: 50,
};

const validated = createInventoryItemSchema.parse(inventoryData);
```

### User Invitations (`invitation.ts`)

- **`createInvitationSchema`** - Send invitation
- **`bulkInvitationSchema`** - Send multiple invitations
- **`acceptInvitationSchema`** - Accept invitation
- **`rejectInvitationSchema`** - Reject invitation
- **`invitationFilterSchema`** - Filter invitations

#### Example: Send Invitation

```typescript
const invitationData = {
  email: 'usuario@ejemplo.com',
  role_id: 'role_id_1',
  facility_ids: ['facility_id_1', 'facility_id_2'],
  message: 'Bienvenido al equipo!',
};

const validated = createInvitationSchema.parse(invitationData);
```

### Settings (`settings.ts`)

- **`facilitySettingsSchema`** - Facility operation settings
- **`accountSettingsSchema`** - Company account settings
- **`userProfileSettingsSchema`** - User profile settings
- **`notificationPreferencesSchema`** - Notification preferences
- **`changePasswordSchema`** - Password change
- **`alertThresholdSettingsSchema`** - Alert thresholds

#### Example: Update Facility Settings

```typescript
const settingsData = {
  timezone: 'America/Bogota',
  workday_start: '08:00',
  workday_end: '18:00',
  workdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  default_activity_duration: 60,
  notifications_enabled: true,
  low_stock_alert_enabled: true,
};

const validated = facilitySettingsSchema.parse(settingsData);
```

## Validation Helpers (`helpers.ts`)

Reusable validation utilities and helper functions:

### Colombian Validators

```typescript
import {
  formatNIT,
  validateNITCheckDigit,
  formatColombianPhone,
  validateDANECode,
} from '@/lib/validations/helpers';

// NIT formatting and validation
const nit = '9001234567';
const formatted = formatNIT(nit); // '900.123.456-7'
const isValid = validateNITCheckDigit(formatted); // true/false

// Phone formatting
const phone = '3201234567';
const formatted = formatColombianPhone(phone); // '+57 320 123 4567'

// DANE code validation
const deptCode = '05'; // Antioquia
const isValidDept = validateDANECode(deptCode, 'department'); // true
```

### Data Validators

```typescript
import {
  validateSKU,
  validateGTIN,
  validateEmail,
  isExpired,
  isExpiringSoon,
  daysUntilDate,
} from '@/lib/validations/helpers';

// SKU validation
const sku = 'PROD-2024-001';
const isValidSKU = validateSKU(sku); // true

// Check expiration
const expiryDate = Date.now() + 20 * 24 * 60 * 60 * 1000; // 20 days
const expiring = isExpiringSoon(expiryDate, 30); // true (expires in < 30 days)
const days = daysUntilDate(expiryDate); // 20
```

### Error Handling

```typescript
import {
  getZodErrorMessage,
  formatZodErrors,
} from '@/lib/validations/helpers';

try {
  createAreaSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Get first error message
    const message = getZodErrorMessage(error);
    console.log(message); // "Nombre debe tener al menos 3 caracteres"

    // Get all errors formatted for forms
    const errors = formatZodErrors(error);
    console.log(errors); // { name: "...", area_type: "..." }
  }
}
```

## Best Practices

### 1. Use Type Inference

Always use `z.infer<>` to derive TypeScript types from schemas:

```typescript
import { z } from 'zod';
import { createAreaSchema } from '@/lib/validations';

// Good: Type is inferred from schema
type CreateAreaInput = z.infer<typeof createAreaSchema>;

// Avoid: Manually defining types that can drift from schema
interface CreateAreaInput {
  name: string;
  area_type: string;
  // ...
}
```

### 2. Validate Early

Validate data as soon as it enters your system (forms, API endpoints):

```typescript
// In form component
const form = useForm({
  resolver: zodResolver(createAreaSchema), // Validates on submit
});

// In server action
export async function createArea(data: unknown) {
  const validated = createAreaSchema.parse(data); // Throws if invalid
  // Now 'validated' is fully typed and safe
}
```

### 3. Handle Validation Errors

Provide user-friendly error messages in Spanish:

```typescript
try {
  createAreaSchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'Datos inválidos. Por favor verifica el formulario.',
      details: error.errors,
    };
  }
}
```

### 4. Use Refinements for Complex Validation

```typescript
const schema = z.object({
  min_value: z.number(),
  max_value: z.number(),
}).refine(
  (data) => data.min_value <= data.max_value,
  {
    message: 'Valor mínimo debe ser menor o igual al máximo',
    path: ['min_value'],
  }
);
```

### 5. Compose Schemas

Build complex schemas from simpler ones:

```typescript
const baseSchema = z.object({ name: z.string() });
const extendedSchema = baseSchema.extend({
  description: z.string().optional()
});
const partialSchema = baseSchema.partial(); // All fields optional
```

## Type Safety with Convex

All schemas are designed to work seamlessly with Convex types:

```typescript
import { Id } from '@/convex/_generated/dataModel';
import { createAreaSchema } from '@/lib/validations';

// In validation schemas, use string for IDs
const data = createAreaSchema.parse({
  facility_id: 'facility_123',
  // ...
});

// Convert to Convex ID type when calling mutations
const result = await convex.mutation(api.areas.create, {
  facility_id: data.facility_id as Id<'facilities'>,
  // ...
});
```

## Error Messages

All error messages are in Spanish following Colombian conventions:

- Use formal "Usted" form
- Clear, actionable messages
- Specify valid formats/ranges
- Example: "Nombre debe tener al menos 3 caracteres"

## Testing

Test your validations:

```typescript
import { createAreaSchema } from '@/lib/validations';

describe('Area Validation', () => {
  it('should validate correct area data', () => {
    const data = { /* valid data */ };
    const result = createAreaSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid area type', () => {
    const data = { area_type: 'invalid' };
    const result = createAreaSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

## Contributing

When adding new validations:

1. Follow existing patterns and naming conventions
2. Add Spanish error messages
3. Include JSDoc comments for complex schemas
4. Export both schema and inferred types
5. Add examples to this README
6. Update the central index.ts export
