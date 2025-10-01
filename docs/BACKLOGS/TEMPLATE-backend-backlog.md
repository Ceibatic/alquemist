# Backend Backlog - MODULE [X]: [Module Name]

**Module**: [Module Name]
**Subagent**: @backend
**Priority**: [Critical|High|Medium|Low]
**Dependencies**: [List module dependencies]
**Estimated Duration**: [X days/weeks]

---

## 📋 Module Overview

[Brief 1-2 paragraph overview of what this module accomplishes from a backend perspective]

---

## 🎯 Tasks

### Task 1: [Feature/Endpoint Group Name]

**Purpose**: [What these endpoints do]

**Endpoints to Build**:

#### Endpoint 1: [Endpoint Name]
- **Method**: [GET|POST|PUT|PATCH|DELETE]
- **Path**: `/api/[path]`
- **Purpose**: [What this does]
- **Authentication**: [Required|Optional|Not Required]
- **Authorization**: [Required roles/permissions]
- **Request Body**:
```typescript
{
  field1: string;
  field2: number;
  // Colombian-specific fields
  nit?: string;
}
```
- **Response**:
```typescript
{
  data: {
    id: string;
    // response fields
  };
}
```
- **Validation Rules**:
  - [Rule 1]
  - [Rule 2]
- **Colombian Business Logic**:
  - [Colombian-specific rule 1]
  - [Colombian-specific rule 2]

#### Endpoint 2: [Another Endpoint]
[Same structure]

### Task 2: [Database Operations]

**Purpose**: [What database operations are needed]

**Models to Query/Modify**:
- [Model 1] - [Operation type]
- [Model 2] - [Operation type]

**Query Requirements**:
- Tenant isolation (filter by `company_id`)
- [Other query requirements]

**Performance Considerations**:
- [Index needed on X field]
- [Pagination required for Y endpoint]

### Task 3: [Business Logic/Services]

**Purpose**: [What business logic is needed]

**Services to Create**:
1. **[ServiceName]**
   - Purpose: [Brief description]
   - Methods:
     - `[methodName]()` - [What it does]
     - `[anotherMethod]()` - [What it does]

---

## 📁 Files to Create/Modify

### New Files
- `apps/api/src/routes/[module].ts` (Fastify routes)
- `apps/api/src/domains/[module]/service.ts` (Business logic)
- `apps/api/src/domains/[module]/validation.ts` (Zod schemas)
- `apps/api/src/middleware/[middleware-name].ts` (if needed)
- `apps/api/src/lib/colombian/[utility].ts` (Colombian-specific utilities)
- `packages/types/src/[module].ts` (Shared types)

### Modified Files
- `apps/api/src/index.ts` (register new routes)
- `[other-existing-files].ts` (if modifying existing code)

---

## 🗄️ Database Schema

### Relevant Models

**From `packages/database/prisma/schema.prisma`**:

#### Model 1: [ModelName]
```prisma
model [ModelName] {
  id          String   @id @default(cuid())
  companyId   String   @map("company_id")  // Tenant isolation
  // ... relevant fields for this module

  // Relations
  company     Company  @relation(fields: [companyId], references: [id])

  @@map("[table_name]")
}
```

**Lines**: [XX-YY] in schema.prisma

**Key Fields for This Module**:
- `[field1]` - [Purpose]
- `[field2]` - [Purpose]

#### Model 2: [AnotherModel]
[Same structure]

### Database Operations Needed

**Queries**:
- Find [entity] by [field] with tenant isolation
- List [entities] with pagination
- [Other query requirements]

**Mutations**:
- Create [entity] with Colombian validation
- Update [entity] fields
- Soft delete [entity] (status = 'inactive')

**Performance**:
- Index needed on: `[field1]`, `[field2]`
- Pagination required for: [endpoint]
- Query optimization for: [complex query]

---

## 🇨🇴 Colombian Business Rules

### Localization
- **Timezone**: America/Bogota (COT-5)
  - All timestamps in UTC, convert for display
  - Use `new Date()` with proper timezone handling

- **Currency**: COP (Colombian Peso)
  - No decimal places
  - Store as integer (cents)
  - Format: 1000000 (no decimals)

- **Error Messages**: Spanish + English
```typescript
const errors = {
  es: "Error en validación del NIT",
  en: "NIT validation error"
};
```

### Colombian-Specific Validations

#### NIT (Colombian Tax ID)
- **Format**: `XXXXXXXXX-X` (9 digits + check digit)
- **Validation**: Check digit algorithm
```typescript
// Example validation function
function validateNIT(nit: string): boolean {
  // Implement check digit algorithm
  // Reference: Colombian DIAN standards
}
```

#### Business Entity Types
Valid values:
- `S.A.S` - Sociedad por Acciones Simplificada
- `S.A.` - Sociedad Anónima
- `Ltda.` - Limitada
- `E.U.` - Empresa Unipersonal

#### DANE Codes
- Department codes (2 digits)
- Municipality codes (5 digits: department + 3)
- Validation: Must exist in DANE registry

#### IVA (Tax Calculation)
- Standard rate: 19%
- Calculate: `amount * 1.19` for total with tax
- Store tax separately in database

### Regulatory Compliance

#### INVIMA (Cannabis)
- Individual plant tracking: OPTIONAL (check facility configuration)
- Batch tracking: DEFAULT
- QR codes: Generate for batches
- [Other INVIMA requirements for this module]

#### ICA (Agriculture)
- Chemical registration validation
- Supplier license verification
- [Other ICA requirements for this module]

### Batch-First Logic

**Default Behavior**:
- Track at BATCH level (not individual plants)
- QR codes for batches
- Quality checks on batch samples
- Inventory at batch level

**Individual Tracking** (Optional):
- Check `facility.enableIndividualTracking` flag
- Only enable if explicitly configured
- Colombian compliance may require for cannabis

---

## 🔐 Security & Authorization

### Authentication
- **Method**: Lucia v3 session-based auth
- **Middleware**: `apps/api/src/middleware/auth.ts`
- **Usage**: Apply to all authenticated routes

### Authorization (RBAC)
**Role Hierarchy** (Spanish/English):
1. Administrador del Sistema / System Administrator
2. Propietario de Empresa / Company Owner
3. Gerente de Instalación / Facility Manager
4. Supervisor de Departamento / Department Supervisor
5. Técnico Líder / Lead Technician
6. Técnico / Technician

**Permissions for This Module**:
- [Endpoint 1]: Requires role [X] or higher
- [Endpoint 2]: Requires role [Y] or higher
- [Endpoint 3]: Any authenticated user

### Tenant Isolation
**CRITICAL**: All queries must filter by `company_id`

```typescript
// Correct (with tenant isolation)
const batches = await prisma.batch.findMany({
  where: {
    facility: {
      companyId: request.tenant.companyId, // Tenant filter
    },
    // ... other filters
  },
});

// WRONG (missing tenant isolation)
const batches = await prisma.batch.findMany({
  where: {
    status: 'active', // Missing companyId filter!
  },
});
```

---

## 🔌 Integration Points

### Frontend Contracts

**Request/Response Types** (create in `packages/types/src/[module].ts`):

```typescript
// Request types
export interface Create[Entity]Request {
  // fields
}

export interface Update[Entity]Request {
  // fields
}

// Response types
export interface [Entity]Response {
  id: string;
  // fields
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Colombian-specific types
export interface ColombianAddress {
  department: string;
  municipality: string;
  daneCode: string;
  addressLine1: string;
  addressLine2?: string;
}
```

### Error Response Format

**Standard Error Response**:
```typescript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable message (Spanish)',
    messageKey: 'i18n.key.for.translation',
    details?: {
      // Additional context
    },
    timestamp: '2025-01-30T10:00:00.000Z',
    traceId: 'request-trace-id'
  }
}
```

**HTTP Status Codes**:
- 200: Success (GET)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Validation Error
- 401: Unauthorized (no token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (e.g., NIT already exists)
- 500: Internal Server Error

---

## ✅ Acceptance Criteria

### Functionality
- [ ] All endpoints respond with correct status codes
- [ ] Request validation working (Zod schemas)
- [ ] Database queries work with tenant isolation
- [ ] Colombian business rules enforced
- [ ] Batch-first logic implemented
- [ ] Error handling complete

### Colombian Compliance
- [ ] NIT validation working
- [ ] IVA calculation correct (19%)
- [ ] COP currency handling (no decimals)
- [ ] Timezone: America/Bogota
- [ ] DANE code validation
- [ ] Business entity type validation
- [ ] INVIMA/ICA requirements met (if applicable)

### Security
- [ ] Authentication middleware applied
- [ ] Authorization checks working (RBAC)
- [ ] Tenant isolation verified (all queries filter by companyId)
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] Input sanitization complete

### Performance
- [ ] Database indexes created
- [ ] Pagination implemented (for list endpoints)
- [ ] Query optimization done
- [ ] Response time < 1s for CRUD operations
- [ ] Connection pooling configured

### Integration
- [ ] Types exported in `packages/types`
- [ ] Frontend can consume API contracts
- [ ] Error messages include Spanish translations
- [ ] Zod schemas shared with frontend

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for endpoints
- [ ] Colombian validation tests
- [ ] Tenant isolation tests
- [ ] Manual API testing complete

---

## 📦 Colombian Sample Data

Use this realistic Colombian data for testing:

```typescript
const sampleCompany = {
  id: "cuid-company-123",
  name: "Valle Verde S.A.S",
  legalName: "Valle Verde Cultivos Sostenibles S.A.S",
  taxId: "900123456-7", // Valid NIT with check digit
  businessEntityType: "S.A.S",
  department: "Putumayo",
  daneMunicipalityCode: "86001", // Mocoa
  colombianDepartment: "Putumayo",
  defaultLocale: "es",
  defaultCurrency: "COP",
  defaultTimezone: "America/Bogota",
};

const sampleUser = {
  id: "cuid-user-123",
  companyId: "cuid-company-123",
  email: "carlos.rodriguez@valleverde.com.co",
  firstName: "Carlos",
  lastName: "Rodríguez",
  phone: "+573145551234",
  locale: "es",
  timezone: "America/Bogota",
  roleId: "facility_manager",
};

const sampleFacility = {
  id: "cuid-facility-123",
  companyId: "cuid-company-123",
  name: "Instalación Principal Mocoa",
  licenseNumber: "INVIMA-2024-001",
  department: "Putumayo",
  municipality: "Mocoa",
  daneCode: "86001",
  latitude: 1.1483,
  longitude: -76.6444,
  altitudeMsnm: 655,
};
```

---

## 🚀 Future Enhancements (Out of Scope)

[List items that are related but not part of this module]

- [Enhancement 1]
- [Enhancement 2]

---

## 📚 Resources

- **Prisma Schema**: `packages/database/prisma/schema.prisma`
- **Product PRD**: `docs/Product PRD - Alquemist v4.0.md`
- **Engineering PRD**: `docs/Engineering PRD - Alquemist v4.0.md`
- **Module PRD**: `docs/MODULE_PRDS/[XX]-[module]-PRD.md`
- **Colombian Compliance**: [Reference docs]

---

**Created**: [Date]
**Last Updated**: [Date]
