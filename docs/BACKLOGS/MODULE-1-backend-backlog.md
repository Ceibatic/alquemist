# Backend Backlog - MODULE 1: Authentication & Company Setup

**Module**: Authentication & Company Setup
**Subagent**: @backend
**Priority**: Critical
**Dependencies**: None (foundation module)
**Estimated Duration**: 2-3 days

---

## 📋 Module Overview

Build foundational authentication system using Lucia v3 with session-based auth. Implement user registration with integrated company creation, login/logout, session management, and protected route middleware. All operations must support multi-tenancy from day one.

Key deliverables: Auth endpoints (register, login, logout, me), Lucia session configuration, password hashing with Argon2, Zod validation schemas, multi-tenant query helpers, and authentication middleware.

---

## 🎯 Epics & Tasks

### Epic 1: Lucia Authentication Setup

**Purpose**: Configure Lucia v3 for session-based authentication with PostgreSQL adapter.

**Tasks**:
1. Install Lucia v3 and Argon2 dependencies
2. Create `apps/api/src/shared/auth/lucia.ts` - Lucia configuration with Prisma adapter
3. Configure session table in Prisma (Lucia expects `Session` model)
4. Add Argon2 password hashing utilities (`hashPassword`, `verifyPassword`)
5. Create session cookie configuration (httpOnly, secure, SameSite=Lax)
6. Add session expiration handling (30 days default)
7. Test Lucia session creation and validation

### Epic 2: Authentication Endpoints

**Purpose**: Build REST API endpoints for user authentication flows.

**Tasks**:
1. Create `apps/api/src/routes/auth.ts` - Fastify route definitions
2. Implement `POST /api/auth/register` endpoint
   - Accept: firstName, lastName, email, password, companyName, businessEntityType, department, municipality
   - Validate input with Zod
   - Check if email already exists
   - Hash password with Argon2
   - Create Company (transaction)
   - Create User with "Owner" role (transaction)
   - Create Lucia session
   - Return user + company data
3. Implement `POST /api/auth/login` endpoint
   - Accept: email, password
   - Find user by email
   - Verify password with Argon2
   - Create Lucia session
   - Return user data + session
4. Implement `POST /api/auth/logout` endpoint
   - Require authentication
   - Invalidate Lucia session
   - Clear session cookie
   - Return success
5. Implement `GET /api/auth/me` endpoint
   - Require authentication
   - Return current user + company data
   - Include role information

### Epic 3: Business Logic Services

**Purpose**: Encapsulate business logic for authentication, user, and company operations.

**Tasks**:
1. Create `apps/api/src/domains/auth/AuthService.ts`
   - `register(data)` - Orchestrate user + company creation
   - `login(email, password)` - Authenticate user
   - `logout(sessionId)` - Destroy session
   - `getCurrentUser(sessionId)` - Get user from session
2. Create `apps/api/src/domains/user/UserService.ts`
   - `createUser(data)` - Create user with hashed password
   - `findByEmail(email)` - Query user by email
   - `findById(id)` - Query user by ID
   - `verifyPassword(user, password)` - Argon2 verification
3. Create `apps/api/src/domains/company/CompanyService.ts`
   - `createCompany(data)` - Create company with defaults
   - `findById(id)` - Query company by ID
4. Add transaction wrapper utility for atomic operations

### Epic 4: Validation & Middleware

**Purpose**: Input validation schemas and authentication middleware.

**Tasks**:
1. Create `apps/api/src/domains/auth/validation.ts` - Zod schemas
   - `RegisterSchema` - Validate registration input
   - `LoginSchema` - Validate login input
   - Share schemas with frontend via `packages/types`
2. Create `apps/api/src/middleware/requireAuth.ts`
   - Extract session cookie
   - Validate session with Lucia
   - Attach user to request context
   - Return 401 if not authenticated
3. Create `apps/api/src/middleware/tenantContext.ts`
   - Extract companyId from authenticated user
   - Attach to request context for tenant isolation
   - Use in all queries: `where: { companyId: ctx.companyId }`
4. Add global error handler for auth errors (401, 403)

### Epic 5: Database Operations & Helpers

**Purpose**: Prisma queries with multi-tenant isolation and role management.

**Tasks**:
1. Add Prisma client singleton export: `apps/api/src/shared/db/prisma.ts`
2. Create database migration for Session model (if not exists)
3. Query "Owner" role from seed data (needed for auto-assignment)
4. Add database indexes:
   - User: `email` (unique index already exists)
   - Company: `taxId` (unique index already exists)
   - Session: `userId`, `expiresAt`
5. Create `apps/api/src/shared/db/helpers.ts`
   - `withTenant(companyId)` - Helper for tenant isolation queries
   - `softDelete(model, id)` - Update status to 'inactive'

### Epic 6: Shared Types

**Purpose**: Type definitions shared between frontend and backend.

**Tasks**:
1. Create `packages/types/src/auth.ts` with interfaces:
   - `User` (id, email, firstName, lastName, companyId, roleId)
   - `Company` (id, name, businessEntityType, department)
   - `Session` (id, userId, expiresAt)
   - `RegisterRequest` (registration payload)
   - `LoginRequest` (login payload)
   - `AuthResponse` (user + session)
2. Export from `packages/types/src/index.ts`

---

## 📁 Files to Create

### New Files

**Routes** (1 file):
- `apps/api/src/routes/auth.ts` - Auth endpoints

**Services** (3 files):
- `apps/api/src/domains/auth/AuthService.ts` - Auth orchestration
- `apps/api/src/domains/user/UserService.ts` - User operations
- `apps/api/src/domains/company/CompanyService.ts` - Company operations

**Validation** (1 file):
- `apps/api/src/domains/auth/validation.ts` - Zod schemas

**Middleware** (2 files):
- `apps/api/src/middleware/requireAuth.ts` - Auth protection
- `apps/api/src/middleware/tenantContext.ts` - Multi-tenant context

**Shared** (3 files):
- `apps/api/src/shared/auth/lucia.ts` - Lucia config
- `apps/api/src/shared/db/prisma.ts` - Prisma singleton
- `apps/api/src/shared/db/helpers.ts` - Database helpers

**Types** (1 file):
- `packages/types/src/auth.ts` - Shared types

**Migrations** (1 file):
- `packages/database/prisma/migrations/XXXXX_add_session_model/migration.sql` (if needed)

**Total**: ~12-14 files

### Modified Files
- `apps/api/src/server.ts` - Register auth routes
- `apps/api/package.json` - Add dependencies (lucia, argon2, zod)
- `packages/database/prisma/schema.prisma` - Add Session model (if not exists)

---

## 🗄️ Database Schema Reference

### Relevant Models

**User Model** (Lines 106-169 in schema.prisma):
- Fields used: `id`, `email`, `passwordHash`, `firstName`, `lastName`, `companyId`, `roleId`, `locale`, `timezone`, `status`, `createdAt`, `updatedAt`
- Deferred: `emailVerified`, `phone`, `mfaEnabled`, `mfaSecret`
- Relations: `company`, `role`

**Company Model** (Lines 15-79 in schema.prisma):
- Fields used: `id`, `name`, `businessEntityType`, `colombianDepartment`, `daneMunicipalityCode`, `defaultLocale`, `defaultCurrency`, `defaultTimezone`, `subscriptionPlan`, `status`, `createdAt`, `updatedAt`
- Deferred: `legalName`, `taxId`, contact fields, address fields
- Relations: `users`, `facilities`, `suppliers`, etc.

**Role Model** (Lines 81-104 in schema.prisma):
- Pre-seeded roles: Owner (level 6), Manager, Agronomist, Supervisor, Operator, Viewer
- Fields: `id`, `name`, `displayNameEs`, `permissions`, `level`
- Used for: Auto-assign "Owner" role to first user

**Session Model** (required by Lucia):
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```
*Note: Add to schema.prisma if not exists*

### Key Database Operations

**Create User + Company (Transaction)**:
```typescript
await prisma.$transaction(async (tx) => {
  const company = await tx.company.create({
    data: { name, businessEntityType, colombianDepartment, ... }
  });

  const ownerRole = await tx.role.findFirst({
    where: { name: 'Owner' }
  });

  const user = await tx.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      companyId: company.id,
      roleId: ownerRole.id,
      locale: 'es',
      timezone: 'America/Bogota'
    }
  });

  return { user, company };
});
```

**Find User by Email**:
```typescript
await prisma.user.findUnique({
  where: { email },
  include: { company: true, role: true }
});
```

**Tenant Isolation** (always use):
```typescript
await prisma.facility.findMany({
  where: { companyId: ctx.companyId } // From tenantContext middleware
});
```

---

## 🔌 Integration Points

### API Endpoints

#### Endpoint 1: Register
- **Method & Path**: `POST /api/auth/register`
- **Purpose**: Create user + company, return session
- **Auth**: None (public endpoint)
- **Request**:
  ```typescript
  {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    businessEntityType: string; // S.A.S, S.A., Ltda, E.U., Persona Natural
    department: string;
    municipality?: string;
  }
  ```
- **Response**: `{ data: { user, company, session } }`
- **Errors**:
  - 400: Validation error (Zod)
  - 409: Email already exists
  - 500: Server error

#### Endpoint 2: Login
- **Method & Path**: `POST /api/auth/login`
- **Purpose**: Authenticate user, create session
- **Auth**: None (public endpoint)
- **Request**: `{ email: string; password: string }`
- **Response**: `{ data: { user, company, session } }`
- **Errors**:
  - 400: Invalid credentials
  - 500: Server error

#### Endpoint 3: Get Current User
- **Method & Path**: `GET /api/auth/me`
- **Purpose**: Get authenticated user data
- **Auth**: Required (`requireAuth` middleware)
- **Response**: `{ data: { user, company, role } }`
- **Errors**:
  - 401: Not authenticated
  - 500: Server error

#### Endpoint 4: Logout
- **Method & Path**: `POST /api/auth/logout`
- **Purpose**: Destroy session
- **Auth**: Required (`requireAuth` middleware)
- **Response**: `{ success: true }`
- **Errors**:
  - 401: Not authenticated
  - 500: Server error

### Data Contracts

**Shared with Frontend** (`packages/types/src/auth.ts`):
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  roleId: string;
  locale: string;
  timezone: string;
}

export interface Company {
  id: string;
  name: string;
  businessEntityType: string;
  colombianDepartment: string;
  defaultLocale: string;
  defaultCurrency: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  businessEntityType: string;
  department: string;
  municipality?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  company: Company;
  session: Session;
}
```

---

## 🔒 Security Implementation

### Password Hashing
```typescript
import { hash, verify } from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    type: 2, // Argon2id (recommended)
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return await verify(hash, password);
}
```

### Session Management (Lucia v3)
```typescript
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from '../db/prisma';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'alquemist_session',
    expires: false, // Session cookies (30 days with refresh)
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      companyId: attributes.companyId,
      roleId: attributes.roleId
    };
  }
});
```

### Rate Limiting
*Deferred to MODULE 2* (registration/login can be protected with basic middleware later)

---

## 🇨🇴 Colombian Business Rules

### Business Entity Types (Validation)
```typescript
const BUSINESS_ENTITY_TYPES = [
  'SAS', // S.A.S - Sociedad por Acciones Simplificada
  'SA',  // S.A. - Sociedad Anónima
  'LTDA', // Ltda - Sociedad Limitada
  'EU',  // E.U. - Empresa Unipersonal
  'PERSONA_NATURAL' // Persona Natural
] as const;
```

### Default Company Settings
```typescript
{
  defaultLocale: 'es',
  defaultCurrency: 'COP',
  defaultTimezone: 'America/Bogota',
  country: 'Colombia',
  subscriptionPlan: 'basic', // No payment yet
  status: 'active'
}
```

### Default User Settings
```typescript
{
  locale: 'es',
  timezone: 'America/Bogota',
  status: 'active',
  emailVerified: false, // Will be updated in MODULE 2
  mfaEnabled: false
}
```

---

## ✅ Acceptance Criteria

### Registration
- [ ] `POST /api/auth/register` creates User + Company atomically (transaction)
- [ ] Password hashed with Argon2id before storage
- [ ] User auto-assigned "Owner" role
- [ ] Returns 409 if email already exists
- [ ] Validates all required fields with Zod
- [ ] Creates Lucia session and returns session cookie
- [ ] Company defaults: locale=es, currency=COP, timezone=America/Bogota

### Login
- [ ] `POST /api/auth/login` validates email + password
- [ ] Returns 400 if credentials invalid
- [ ] Creates Lucia session on success
- [ ] Returns user + company data
- [ ] Session cookie set with httpOnly + secure flags

### Session Management
- [ ] `GET /api/auth/me` returns current user when authenticated
- [ ] Returns 401 if no valid session
- [ ] `POST /api/auth/logout` destroys session
- [ ] Session expires after 30 days (Lucia default)

### Middleware
- [ ] `requireAuth` middleware blocks unauthenticated requests
- [ ] `tenantContext` middleware injects companyId into request context
- [ ] All protected endpoints use `requireAuth`

### Multi-Tenancy
- [ ] All database queries respect tenant isolation
- [ ] User can only access data from their own company
- [ ] CompanyId validated on every request

---

## 📚 Context References

**PRDs**:
- [MODULE 1 PRD](../MODULE_PRDS/MODULE-1-Authentication-Company-Setup.md)
- [Product PRD v4.1](../Product%20PRD%20-%20Alquemist%20v4.1.md) - Lines 52-86 (MODULE 1 scope)
- [Engineering PRD v4.1](../Engineering%20PRD%20-%20Alquemist%20v4.1.md) - Lines 185-220 (Security implementation)

**Database Schema**:
- `packages/database/prisma/schema.prisma`
  - User model (lines 106-169)
  - Company model (lines 15-79)
  - Role model (lines 81-104)
  - Session model (needs to be added if not exists)

**Seed Data**:
- `packages/database/prisma/seed.ts` - Role definitions (Owner, Manager, etc.)

---

**Estimated Effort**: 2-3 days
**Ready for Implementation**: ✅
