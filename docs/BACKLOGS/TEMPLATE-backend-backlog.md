# Backend Backlog - MODULE [X]: [Module Name]

**Module**: [Module Name]
**Subagent**: @backend
**Priority**: [Critical|High|Medium|Low]
**Dependencies**: [List module dependencies or "None"]
**Estimated Duration**: [X days/weeks]

---

## 📋 Module Overview

[Brief 1-2 paragraph overview of what this module accomplishes from a backend perspective]

---

## 🎯 Epics & Tasks

### Epic 1: [Epic Name - e.g., "Authentication Endpoints"]

**Purpose**: [What this epic accomplishes]

**Tasks**:
1. Build `POST /api/[endpoint]` for [purpose]
2. Build `GET /api/[endpoint]` for [purpose]
3. Create [ServiceName] service for [business logic]
4. Add [ValidationName] validation schemas (Zod)

### Epic 2: [Epic Name - e.g., "Database Operations"]

**Purpose**: [What this epic accomplishes]

**Tasks**:
1. Implement [OperationName] using [Model] queries
2. Add tenant isolation to all [Model] queries
3. Create [HelperFunction] for [purpose]
4. Add database indexes for performance

### Epic 3: [Epic Name - if applicable]

**Purpose**: [What this epic accomplishes]

**Tasks**:
1. [Task description]
2. [Task description]

---

## 📁 Files to Create

### New Files
- `apps/api/src/routes/[module].ts` (Fastify routes)
- `apps/api/src/domains/[module]/service.ts` (Business logic)
- `apps/api/src/domains/[module]/validation.ts` (Zod schemas)
- `apps/api/src/middleware/[middleware].ts` (if needed)
- `packages/types/src/[module].ts` (Shared types with frontend)

### Modified Files
- `apps/api/src/index.ts` (register new routes)
- `[other-file].ts` (if modifying existing code - specify reason)

---

## 🗄️ Database Schema Reference

### Relevant Models

**Agent should query `packages/database/prisma/schema.prisma` for full details**

**Models Used**:
- [ModelName] - Lines [XX-YY] in schema.prisma
- [AnotherModel] - Lines [XX-YY] in schema.prisma

**Key Operations**:
- Query [Model] with tenant isolation (`where: { companyId }`)
- Create/Update [Model] with [validation]
- Soft delete [Model] (set status = 'inactive')

---

## 🔌 Integration Points

### API Endpoints

#### Endpoint 1: [Endpoint Name]
- **Method & Path**: `POST /api/[path]`
- **Purpose**: [What this endpoint does]
- **Auth**: Required (role: [RoleName] or higher)
- **Request**: `{ field1: type, field2: type }`
- **Response**: `{ data: {...} }`
- **Errors**: 400, 401, 403, 409, 500

#### Endpoint 2: [Another Endpoint]
- **Method & Path**: `GET /api/[path]`
- **Purpose**: [What this endpoint does]
- **Auth**: Required (role: [RoleName] or higher)
- **Response**: `{ data: [...], meta: { total, page } }`

### Data Contracts

**Types to Create** (in `packages/types/src/[module].ts`):
```typescript
export interface [TypeName]Request {
  // Request fields
}

export interface [TypeName]Response {
  id: string;
  // Response fields
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Error Response Format

```typescript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable (Spanish)',
    messageKey: 'i18n.key',
    timestamp: string,
    traceId: string
  }
}
```

**Status Codes**: 200 (success), 201 (created), 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error)

---

## 🔐 Security & Authorization

### Authentication
- **Method**: Lucia v3 session-based
- **Middleware**: Apply to all authenticated routes

### Authorization (RBAC)
**Permissions for this module**:
- [Endpoint 1]: Requires role [X] or higher
- [Endpoint 2]: Any authenticated user
- [Endpoint 3]: System Administrator only

### Tenant Isolation (CRITICAL)
**All queries MUST filter by `companyId` or related tenant field**

```typescript
// Example - Agent should implement tenant isolation
const items = await prisma.item.findMany({
  where: {
    companyId: request.tenant.companyId, // REQUIRED
    // ... other filters
  },
});
```

---

## ✅ Acceptance Criteria

### Functionality
- [ ] All endpoints respond with correct status codes
- [ ] Request validation working (Zod schemas)
- [ ] Database queries work correctly
- [ ] Error handling complete (all error scenarios)

### Business Rules
- [ ] Colombian business rules enforced (refer to Product PRD)
- [ ] Batch-first logic implemented (default tracking level)
- [ ] Data validations working (NIT, DANE codes, etc. as needed)

### Security
- [ ] Authentication middleware applied to protected routes
- [ ] Authorization checks working (RBAC)
- [ ] Tenant isolation verified (all queries filter by companyId)
- [ ] Input sanitization complete
- [ ] SQL injection prevented (Prisma parameterized queries)

### Performance
- [ ] Database indexes created where needed
- [ ] Pagination implemented for list endpoints
- [ ] Query optimization done
- [ ] Response time < 1s for CRUD operations

### Integration
- [ ] Types exported in `packages/types`
- [ ] Frontend can consume API contracts
- [ ] Error messages include Spanish translations
- [ ] Zod schemas shared with frontend where applicable

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for endpoints
- [ ] Tenant isolation tests
- [ ] Manual API testing complete

---

## 📚 Context References

**Agent should load these for detailed specifications**:
- Colombian business rules → Product PRD (specific sections)
- Technical architecture → Engineering PRD
- Database schema → [packages/database/prisma/schema.prisma](../../packages/database/prisma/schema.prisma)
- Sample data → Query seed files for realistic test data
- Batch-first logic → Engineering PRD, Product PRD
- Regulatory compliance → Product PRD (INVIMA, ICA sections)

---

## 📝 Notes

[Any special considerations, edge cases, or important context for this module]

**Colombian-Specific**:
- Refer to Product PRD for NIT validation, IVA rates, business entity types
- Refer to Engineering PRD for timezone (America/Bogota), currency (COP) handling
- Query database schema for Colombian reference data (departments, municipalities, roles, etc.)

**Batch-First**:
- Default tracking: BATCH level (not individual plants)
- Individual tracking: Check facility configuration flag if needed
- Refer to Engineering PRD for batch-first design patterns

**Out of Scope**:
- [Features explicitly not part of this module]

---

**Created**: [Date]
**Last Updated**: [Date]
