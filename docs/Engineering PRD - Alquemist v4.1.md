# Engineering PRD - Alquemist v4.1
**Technical Implementation Guide**

**Version**: 4.1
**Date**: January 2025
**Purpose**: Developer-focused implementation specifications

*📋 For feature specifications and user stories, see [Product PRD 4.1]*
*🗄️ For complete data models, see [Database Schema (Prisma)]*

---

## 📋 **DOCUMENT OVERVIEW**

This Engineering PRD is a **developer's implementation guide** providing:

- **Tech stack and architecture decisions**
- **Security and authentication implementation**
- **Database configuration and optimization**
- **Module-by-module implementation details**
- **API design patterns and endpoints**
- **Development workflow and setup instructions**

**What this document is NOT:**
- ❌ Feature specifications (see Product PRD)
- ❌ Future architecture vision (add when needed)
- ❌ Detailed production deployment configs (add when deploying)

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Next.js PWA (React 18+)     |     Admin Dashboard          │
│  Spanish/English i18n        |     Role-based access        │
└─────────────────┬───────────────────┬─────────────────────┬─┘
                  │                   │                     │
                  ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Fastify API Server (REST)   |  Background Jobs (BullMQ)   │
│  Lucia Auth + RBAC           |  AI Services (future)        │
└─────────────────┬───────────────────┬─────────────────────┬─┘
                  │                   │                     │
                  ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 15+       Redis 7+           MinIO (S3-like)    │
│  (Primary DB)         (Session/Cache)    (File Storage)     │
└─────────────────────────────────────────────────────────────┘
```

### **Technology Stack**

#### **Frontend**
```typescript
Framework: Next.js 14 (App Router)
Language: TypeScript 5+
UI: Tailwind CSS 3+ + Headless UI
State: Zustand (lightweight)
Forms: React Hook Form + Zod validation
i18n: next-intl (es/en)
PWA: next-pwa (offline support)
Icons: Lucide React
Charts: Recharts
Maps: Leaflet (Colombian maps)
```

#### **Backend**
```typescript
Runtime: Node.js 20+ LTS
Framework: Fastify 4+ (faster than Express)
Language: TypeScript 5+
ORM: Prisma (type-safe, excellent DX)
Validation: Zod (shared with frontend)
Auth: Lucia v3
Jobs: BullMQ + Redis
Files: Multer + Sharp
API Docs: Swagger/OpenAPI 3.0
```

#### **Database & Storage**
```sql
Database: PostgreSQL 15+
  - Extensions: uuid-ossp, pg_trgm, btree_gin
  - Collation: es_CO.UTF-8
  - Timezone: America/Bogota

Cache: Redis 7+
  - Sessions (24h TTL)
  - Rate limiting
  - Job queues (BullMQ)

Search: PostgreSQL Full Text (Spanish)
  - Avoid ElasticSearch complexity
  - GIN indexes for performance

Storage:
  - Development: MinIO (S3-compatible, local)
  - Production: Google Cloud Storage (future)
```

#### **Infrastructure**
```yaml
Development:
  - Docker Compose (PostgreSQL, Redis, MinIO)
  - Local Next.js dev server
  - Local Fastify API server

Production Target (Phase 3+):
  - Google Cloud Platform
  - Cloud Run (auto-scaling containers)
  - Cloud SQL (PostgreSQL managed)
  - Memorystore (Redis managed)
  - Cloud Storage (file storage)
```

### **Project Structure**

```
alquemist/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   │   ├── [locale]/  # i18n routing
│   │   │   │   ├── auth/      # Auth pages
│   │   │   │   └── dashboard/ # Protected routes
│   │   │   ├── components/    # React components
│   │   │   │   ├── ui/        # Base UI components
│   │   │   │   ├── forms/     # Form components
│   │   │   │   └── features/  # Feature-specific
│   │   │   ├── lib/           # Utilities
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── i18n/          # Translations
│   │   └── public/            # Static assets
│   │
│   └── api/                    # Fastify backend
│       ├── src/
│       │   ├── modules/       # Feature modules
│       │   │   ├── auth/      # Authentication
│       │   │   ├── companies/ # Company management
│       │   │   ├── facilities/# Facility management
│       │   │   ├── batches/   # Batch operations
│       │   │   └── inventory/ # Inventory management
│       │   ├── shared/        # Shared code
│       │   │   ├── middleware/# Auth, tenant, validation
│       │   │   ├── utils/     # Helper functions
│       │   │   └── errors/    # Error classes
│       │   ├── plugins/       # Fastify plugins
│       │   └── server.ts      # Main entry point
│       └── test/              # API tests
│
├── packages/
│   ├── database/              # Prisma schema
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   ├── migrations/    # Migration history
│   │   │   └── seed.ts        # Colombian seed data
│   │   └── src/
│   │       └── client.ts      # Prisma client export
│   │
│   ├── types/                 # Shared TypeScript types
│   │   └── src/
│   │       └── index.ts       # Type definitions
│   │
│   └── ui/                    # Shared UI (future)
│       └── src/
│           └── components/    # Reusable components
│
├── docker-compose.yml         # Local development services
├── package.json               # Root package.json
└── turbo.json                 # Turborepo config
```

---

## 🔐 **SECURITY IMPLEMENTATION**

### **Authentication: Lucia v3**

```typescript
// apps/api/src/shared/auth/lucia.ts
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from '@alquemist/database';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'alquemist_session',
    expires: false, // Session cookies
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
    companyId: attributes.companyId,
    roleId: attributes.roleId,
    locale: attributes.locale || 'es',
  }),
});

// Rate limiting for auth endpoints
export const authRateLimits = {
  login: { points: 5, duration: 900 },      // 5 attempts per 15 min
  register: { points: 3, duration: 3600 },   // 3 attempts per hour
  passwordReset: { points: 3, duration: 3600 },
};
```

### **Authorization: RBAC**

```typescript
// packages/types/src/permissions.ts
export interface Permission {
  resource: string;  // 'batch', 'facility', 'user'
  action: string;    // 'read', 'write', 'delete'
  scope: 'system' | 'company' | 'facility' | 'area' | 'personal';
}

export interface Role {
  id: string;
  name: string;
  displayNameEs: string;
  displayNameEn: string;
  level: number; // 1=highest, 6=lowest
  permissions: Permission[];
}

// Predefined roles
export const ROLES = {
  COMPANY_OWNER: {
    level: 2,
    permissions: [
      { resource: 'company', action: 'read', scope: 'company' },
      { resource: 'company', action: 'update', scope: 'company' },
      { resource: 'facility', action: '*', scope: 'company' },
      { resource: 'user', action: '*', scope: 'company' },
    ],
  },
  FACILITY_MANAGER: {
    level: 3,
    permissions: [
      { resource: 'facility', action: 'read', scope: 'facility' },
      { resource: 'facility', action: 'update', scope: 'facility' },
      { resource: 'batch', action: '*', scope: 'facility' },
      { resource: 'inventory', action: '*', scope: 'facility' },
    ],
  },
  // ... other roles
};
```

### **Multi-Tenant Security**

```typescript
// apps/api/src/shared/middleware/tenant.ts
import { FastifyRequest, FastifyReply } from 'fastify';

export interface TenantContext {
  companyId: string;
  userId: string;
  roles: string[];
  permissions: Permission[];
}

export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { user } = request;

  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  // Inject tenant context
  request.tenant = {
    companyId: user.companyId,
    userId: user.id,
    roles: await getUserRoles(user.id),
    permissions: await getUserPermissions(user.id),
  };
}

// Usage in queries - ALWAYS filter by tenant
export async function findBatches(tenantContext: TenantContext) {
  return prisma.batch.findMany({
    where: {
      facility: {
        companyId: tenantContext.companyId, // REQUIRED
      },
    },
  });
}
```

---

## 📊 **DATABASE STRATEGY**

### **Prisma Configuration**

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [uuid_ossp, pg_trgm, btree_gin]
}

// Colombian config:
// - Timezone: America/Bogota
// - Collation: es_CO.UTF-8
// - Full-text search: Spanish
```

### **Connection Management**

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

### **Migration Strategy**

```bash
# Development: Fast prototyping
npm run db:push

# Staging/Production: Named migrations
npm run db:migrate:dev    # Create migration
npm run db:migrate:deploy # Apply in production
```

### **Critical Indexes**

```sql
-- Multi-tenant security (every query filters by company)
CREATE INDEX idx_users_company ON users(company_id, email);
CREATE INDEX idx_facilities_company ON facilities(company_id) WHERE status = 'active';
CREATE INDEX idx_batches_facility ON batches(facility_id, status);

-- QR code scanning (high frequency)
CREATE UNIQUE INDEX idx_batches_qr ON batches(qr_code);
CREATE UNIQUE INDEX idx_plants_qr ON plants(qr_code) WHERE qr_code IS NOT NULL;

-- Batch operations (default tracking)
CREATE INDEX idx_batches_active ON batches(facility_id, crop_type_id, created_date DESC)
  WHERE status = 'active';

-- Activity tracking (high write volume)
CREATE INDEX idx_activities_batch ON activities(entity_id, timestamp DESC)
  WHERE entity_type = 'batch';

-- Inventory management
CREATE INDEX idx_inventory_available ON inventory_items(area_id, product_id)
  WHERE quantity_truly_available > 0;

-- Spanish full-text search
CREATE INDEX idx_products_search ON products USING gin(
  to_tsvector('spanish', name || ' ' || COALESCE(description, ''))
);
```

---

## 🌐 **INTERNATIONALIZATION**

### **i18n Setup**

```typescript
// apps/web/src/i18n/config.ts
import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: 'America/Bogota',
}));

// Colombian formatters
export const formatters = {
  currency: new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),

  date: new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'short',
  }),

  dateTime: new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
};
```

### **Translation Files**

```json
// apps/web/src/i18n/messages/es.json
{
  "auth": {
    "login": "Iniciar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña"
  },
  "batch": {
    "create": "Crear lote",
    "quantity": "Cantidad",
    "status": "Estado"
  }
}

// apps/web/src/i18n/messages/en.json
{
  "auth": {
    "login": "Log in",
    "email": "Email",
    "password": "Password"
  },
  "batch": {
    "create": "Create batch",
    "quantity": "Quantity",
    "status": "Status"
  }
}
```

---

## 🔧 **API DESIGN PATTERNS**

### **RESTful Endpoints**

```typescript
// API endpoint structure
const API_ROUTES = {
  // Authentication
  'POST   /api/auth/signup': 'Create account',
  'POST   /api/auth/login': 'Login',
  'POST   /api/auth/logout': 'Logout',
  'GET    /api/auth/me': 'Current user',

  // Companies
  'GET    /api/companies/:id': 'Get company',
  'PATCH  /api/companies/:id': 'Update company',

  // Facilities
  'GET    /api/companies/:companyId/facilities': 'List facilities',
  'POST   /api/companies/:companyId/facilities': 'Create facility',
  'GET    /api/facilities/:id': 'Get facility',
  'PATCH  /api/facilities/:id': 'Update facility',

  // Batches
  'GET    /api/facilities/:facilityId/batches': 'List batches',
  'POST   /api/facilities/:facilityId/batches': 'Create batch',
  'GET    /api/batches/:id': 'Get batch',
  'PATCH  /api/batches/:id': 'Update batch',
  'DELETE /api/batches/:id': 'Soft delete batch',

  // Activities
  'GET    /api/batches/:batchId/activities': 'List activities',
  'POST   /api/batches/:batchId/activities': 'Log activity',
};
```

### **Response Format**

```typescript
// Success response
{
  data: {
    id: 'batch_123',
    quantity: 100,
    // ... resource data
  },
  meta: {
    timestamp: '2025-01-15T10:30:00Z',
    requestId: 'req_abc123',
  }
}

// Error response
{
  error: {
    code: 'VAL_3001',
    message: 'Invalid input',
    messageKey: 'errors.validation.invalid_input',
    details: { field: 'quantity', issue: 'must be positive' },
    timestamp: '2025-01-15T10:30:00Z',
    traceId: 'trace_xyz789',
  }
}
```

### **Error Codes**

```typescript
export enum ErrorCode {
  // Auth (1xxx)
  UNAUTHORIZED = 'AUTH_1001',
  INVALID_CREDENTIALS = 'AUTH_1002',
  SESSION_EXPIRED = 'AUTH_1003',

  // Authorization (2xxx)
  FORBIDDEN = 'AUTHZ_2001',
  INSUFFICIENT_PERMISSIONS = 'AUTHZ_2002',

  // Validation (3xxx)
  VALIDATION_ERROR = 'VAL_3001',
  INVALID_INPUT = 'VAL_3002',

  // Resources (4xxx)
  NOT_FOUND = 'RES_4001',
  ALREADY_EXISTS = 'RES_4002',
  CONFLICT = 'RES_4003',

  // Business Logic (5xxx)
  INSUFFICIENT_INVENTORY = 'BIZ_5001',
  INVALID_STATE_TRANSITION = 'BIZ_5002',

  // System (9xxx)
  INTERNAL_SERVER_ERROR = 'SYS_9001',
  DATABASE_ERROR = 'SYS_9002',
}
```

---

## 📱 **MOBILE & OFFLINE**

### **PWA Configuration**

```typescript
// apps/web/next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.alquemist\.com\.co\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: { maxAgeSeconds: 300 }, // 5 min
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### **Offline Strategy**

```typescript
// Key pages available offline
export const OFFLINE_PAGES = [
  '/dashboard',
  '/batches',
  '/activities',
  '/inventory',
];

// Offline sync configuration
export const SYNC_CONFIG = {
  strategy: 'background sync when online',
  batchSize: 50,
  retryStrategy: 'exponential backoff',
  conflictResolution: 'last-write-wins',
  maxStorage: '50MB',
};
```

---

## 🚀 **DEVELOPMENT WORKFLOW**

### **Local Setup**

```bash
# 1. Clone repository
git clone <repo-url>
cd alquemist

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your local config

# 4. Start Docker services
docker-compose up -d  # PostgreSQL, Redis, MinIO

# 5. Generate Prisma client
cd packages/database
npx prisma generate

# 6. Push schema to database (development)
npx prisma db push

# 7. Seed database with Colombian data
npm run db:seed

# 8. Start development servers
cd ../..
npm run dev  # Starts Next.js (web) + Fastify (api)
```

### **Database Commands**

```bash
# Development (fast prototyping)
npm run db:push          # Push schema without migration
npm run db:seed          # Seed Colombian data
npm run db:studio        # Open Prisma Studio

# Production (migrations)
npm run db:migrate:dev   # Create named migration
npm run db:migrate:deploy # Apply migrations
npm run db:migrate:reset  # Reset database (WARNING!)
```

### **Common Tasks**

```bash
# Development
npm run dev              # Start all services
npm run dev:web          # Only Next.js
npm run dev:api          # Only Fastify

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests (Playwright)

# Code quality
npm run lint             # ESLint
npm run type-check       # TypeScript
npm run format           # Prettier

# Build
npm run build            # Build all apps
npm run build:web        # Only Next.js
npm run build:api        # Only Fastify
```

---

## 📦 **MODULE IMPLEMENTATION ORDER**

For complete feature specifications, see [Product PRD 4.1]. Below are technical implementation details only.

### **Phase 1: Foundation (Modules 1-4)**

#### **Module 1: Authentication & Account Creation**

**Database Tables:** `users`, `sessions`, `companies`, `roles`, `permissions`

**API Endpoints:**
```typescript
POST   /api/auth/signup
  Body: { email, password, firstName, lastName, companyName, businessType, department, municipality }
  Returns: { user, company, session }

POST   /api/auth/login
  Body: { email, password }
  Returns: { user, session }

POST   /api/auth/logout
  Returns: { success: true }

GET    /api/auth/me
  Returns: { user, company, role, permissions }
```

**Implementation Notes:**
- Colombian business types: S.A.S, S.A., Ltda, E.U., Persona Natural
- Department/municipality from `colombian_geography` seed data
- Default locale: 'es'
- Default role: 'company_owner' for first user
- Hash passwords with Argon2id (Lucia handles this)

**Frontend Pages:**
- `/[locale]/auth/signup` - Registration form
- `/[locale]/auth/login` - Login form
- `/[locale]/auth/verify-email` - Email verification

---

#### **Module 2: Email Verification**

**Database Tables:** `verification_tokens`

**API Endpoints:**
```typescript
POST   /api/auth/verify-email
  Body: { token }
  Returns: { success: true }

POST   /api/auth/resend-verification
  Body: { email }
  Returns: { success: true }
```

**Implementation Notes:**
- Token expires in 24 hours
- Spanish email templates
- Block platform access until verified

---

#### **Module 3: Subscription & Payments**

**Database Tables:** `subscriptions`, `payments`, `invoices`, `usage_metrics`

**API Endpoints:**
```typescript
GET    /api/subscriptions/plans
  Returns: { plans: [...] }

POST   /api/subscriptions
  Body: { planId, paymentMethodId }
  Returns: { subscription, invoice }

GET    /api/subscriptions/current
  Returns: { subscription, usage, limits }

POST   /api/payments/wompi/webhook
  Body: Wompi webhook payload
  Returns: { success: true }
```

**Implementation Notes:**
- Wompi integration (Colombian payment gateway)
- Plans: Trial (free 30d), Starter, Professional, Enterprise
- Track usage: facilities, users, activities
- Generate DIAN-compliant invoices (future)
- Email reminders: 7 days, 1 day before expiration

---

#### **Module 4: Company Profile Completion**

**Database Tables:** `companies` (update), `licenses`, `certificates`

**API Endpoints:**
```typescript
PATCH  /api/companies/:id
  Body: { legalName, taxId, address, phone, ... }
  Returns: { company }

POST   /api/companies/:id/licenses
  Body: { type, number, issuedBy, expiryDate, fileUrl }
  Returns: { license }

POST   /api/companies/:id/certificates
  Body: { type, issuedBy, expiryDate, fileUrl }
  Returns: { certificate }
```

**Implementation Notes:**
- Optional during onboarding, required for compliance features
- NIT validation pattern: Colombian tax ID format
- License types: INVIMA, ICA, Municipal
- File upload to MinIO/S3

---

### **Phase 2: Core Data (Modules 5-8)**

#### **Module 5: Facility Creation**

**Database Tables:** `facilities`, `areas`, `colombian_geography`

**API Endpoints:**
```typescript
POST   /api/companies/:companyId/facilities
  Body: { name, licenseNumber, facilityType, address, department, municipality, altitude, ... }
  Returns: { facility }

GET    /api/facilities/:id
  Returns: { facility, areas }

PATCH  /api/facilities/:id
  Body: { ... }
  Returns: { facility }

GET    /api/geography/departments
  Returns: { departments: [...] }

GET    /api/geography/departments/:id/municipalities
  Returns: { municipalities: [...] }
```

**Implementation Notes:**
- Colombian departments/municipalities from seed data
- DANE codes for municipalities
- Altitude in MSNM (meters above sea level)
- Facility types: indoor, outdoor, greenhouse, mixed

---

#### **Module 6: Crop Type Selection**

**Database Tables:** `crop_types`, `production_phases`, `compliance_profiles`

**API Endpoints:**
```typescript
GET    /api/crop-types
  Returns: { cropTypes: [...] }

POST   /api/facilities/:id/crop-types
  Body: { cropTypeIds: [...] }
  Returns: { facility, cropTypes, complianceProfiles }

GET    /api/crop-types/:id/phases
  Returns: { phases: [...] }
```

**Implementation Notes:**
- Pre-configured crops: Cannabis, Coffee, Cocoa, Flowers
- Each crop has default production phases
- Compliance profiles auto-attached (INVIMA for cannabis, ICA for all)
- Multi-crop facilities supported

---

#### **Module 7: Area Setup with Sample Data**

**Database Tables:** `areas`, `area_types`

**API Endpoints:**
```typescript
GET    /api/facilities/:id/areas
  Returns: { areas: [...] }

POST   /api/facilities/:id/areas
  Body: { name, areaType, capacity, ... }
  Returns: { area }

POST   /api/facilities/:id/generate-sample-areas
  Body: { cropTypeId }
  Returns: { areas: [...] }
```

**Implementation Notes:**
- Generate sample areas based on crop type selected
- Cannabis: Propagation, Vegetative, Flowering, Drying, Curing
- Coffee: Nursery, Field sections, Processing, Drying, Storage
- Capacity calculations based on area size

---

#### **Module 8: Cultivars & Suppliers Setup**

**Database Tables:** `cultivars`, `suppliers`, `products`

**API Endpoints:**
```typescript
GET    /api/cultivars
  Query: { cropTypeId }
  Returns: { cultivars: [...] }

POST   /api/cultivars
  Body: { name, cropTypeId, genetics, ... }
  Returns: { cultivar }

GET    /api/suppliers
  Returns: { suppliers: [...] }

POST   /api/suppliers
  Body: { name, businessType, nit, address, ... }
  Returns: { supplier }

POST   /api/facilities/:id/generate-sample-data
  Body: { cropTypeIds: [...] }
  Returns: { cultivars: [...], suppliers: [...], products: [...] }
```

**Implementation Notes:**
- Sample Colombian cultivars per crop
- Sample Colombian suppliers with addresses
- Products with COP pricing
- ICA registration for agricultural chemicals

---

### **Phase 3: Operations (Modules 9-12)**

#### **Module 9: Inventory Management**

**Database Tables:** `inventory_items`, `inventory_movements`, `products`

**API Endpoints:**
```typescript
GET    /api/facilities/:id/inventory
  Returns: { items: [...] }

POST   /api/inventory/items
  Body: { productId, areaId, quantity, cost, ... }
  Returns: { item }

PATCH  /api/inventory/items/:id
  Body: { quantity, operation: 'add' | 'consume' | 'reserve' }
  Returns: { item }

GET    /api/inventory/movements
  Query: { itemId, startDate, endDate }
  Returns: { movements: [...] }
```

**Implementation Notes:**
- Track: available, reserved, committed quantities
- Automatic consumption from activities
- Reorder point alerts
- Cost tracking in COP

---

#### **Module 10: Production Templates**

**Database Tables:** `templates`, `template_phases`, `template_activities`

**API Endpoints:**
```typescript
GET    /api/templates
  Query: { cropTypeId }
  Returns: { templates: [...] }

POST   /api/templates
  Body: { name, cropTypeId, phases: [...] }
  Returns: { template }

GET    /api/templates/:id
  Returns: { template, phases, activities }

POST   /api/templates/:id/clone
  Body: { name }
  Returns: { template }
```

**Implementation Notes:**
- Pre-loaded Colombian crop templates
- Visual builder: phases → activities
- Activity dependencies and scheduling
- Resource requirements per activity

---

#### **Module 11: Quality Check Templates + AI**

**Database Tables:** `quality_templates`, `quality_checks`, `pest_detections`

**API Endpoints:**
```typescript
GET    /api/quality-templates
  Returns: { templates: [...] }

POST   /api/quality-checks
  Body: { batchId, templateId, answers: [...], photos: [...] }
  Returns: { check }

POST   /api/ai/analyze-pest
  Body: { imageUrl, cropType, location }
  Returns: { detections: [...], confidence, recommendations }
```

**Implementation Notes:**
- AI template generation from photos/PDFs (Phase 3+)
- Pest detection: 40+ Colombian species
- Photo-based health assessment
- Export to Excel/PDF for compliance

---

#### **Module 12: Production Orders & Operations**

**Database Tables:** `production_orders`, `batches`, `activities`, `scheduled_activities`

**API Endpoints:**
```typescript
POST   /api/production-orders
  Body: { templateId, facilityId, cultivarId, quantity, startDate }
  Returns: { order, batch, scheduledActivities: [...] }

GET    /api/batches/:id
  Returns: { batch, activities, qualityChecks }

POST   /api/batches/:batchId/activities
  Body: { activityTypeId, notes, photos, inputs: [...] }
  Returns: { activity, inventoryMovements }

GET    /api/batches/:id/qr-code
  Returns: { qrCodeUrl }
```

**Implementation Notes:**
- Batch-first tracking (default)
- Optional individual plant tracking
- QR codes for batch/plant identification
- Real-time inventory consumption
- Mobile-optimized activity logging

---

## 🧪 **TESTING APPROACH**

### **Framework Selection**

```typescript
export const TESTING_TOOLS = {
  unit: 'Vitest (fast, TypeScript native)',
  integration: 'Vitest + Testcontainers',
  e2e: 'Playwright (cross-browser)',
  api: 'Supertest',
};
```

### **Testing Pattern**

```typescript
// Write tests as you build, not before
// Focus on:
// - Business logic (unit tests)
// - API endpoints (integration tests)
// - Critical user flows (E2E tests)

// Coverage targets (add as you go):
// - Unit: 80%+ for business logic
// - Integration: 60%+ for API routes
// - E2E: Cover onboarding + batch operations
```

---

## 🚢 **DEPLOYMENT DIRECTION**

### **Development Environment**

```yaml
Current: Docker Compose (local)
  - PostgreSQL 15
  - Redis 7
  - MinIO (S3-compatible)
  - Next.js dev server
  - Fastify dev server
```

### **Production Target (Phase 3+)**

```yaml
Platform: Google Cloud Platform
  - Compute: Cloud Run (auto-scaling)
  - Database: Cloud SQL (PostgreSQL)
  - Cache: Memorystore (Redis)
  - Storage: Cloud Storage
  - CDN: Cloud CDN (Colombian edge)
  - Monitoring: Cloud Monitoring + Logging

Details: To be added when ready for production deployment
```

---

## 📊 **PERFORMANCE TARGETS**

```typescript
// High-level performance goals
export const PERFORMANCE_GOALS = {
  api: {
    p95: '< 1s for most endpoints',
    p99: '< 2s for most endpoints',
  },
  frontend: {
    fcp: '< 1.5s',
    lcp: '< 2.5s',
  },
  mobile: {
    '3g_load': '< 3s',
    offline: 'Full offline support for core operations',
  },
};

// Optimize when you have actual performance data
// Use: PostgreSQL EXPLAIN, Chrome DevTools, Lighthouse
```

---

## 🔄 **CACHING STRATEGY**

```typescript
// Start simple, add complexity when needed
export const CACHING = {
  sessions: 'Redis (24h TTL)',
  rateLimit: 'Redis (1h TTL)',
  translations: 'Redis (1h TTL)',

  // Add more caching when performance metrics show need
  // Examples: user permissions, templates, product catalog
};
```

---

## 📚 **ADDITIONAL RESOURCES**

### **Database**
- See [Database Schema (Prisma)] for complete data models
- See `packages/database/prisma/seed.ts` for Colombian seed data

### **Features**
- See [Product PRD 4.1] for feature specifications and user stories
- See module dependencies in Product PRD

### **Colombian Requirements**
- See Product PRD 4.1 for compliance requirements (INVIMA, ICA, FNC)
- See Product PRD 4.1 for localization requirements

---

**Last Updated**: January 2025
**Version**: 4.1

**Philosophy**: This is a living document. Add implementation details as you build each module. Avoid over-engineering features you haven't implemented yet.
