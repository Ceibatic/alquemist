# Technical Specification - Alquemist

**Final Architecture & Implementation Guide**

**Version**: 1.0
**Date**: January 2025

---

## Document Purpose

This document defines the **final, concrete technical stack** and implementation approach for Alquemist:
- Technology stack decisions (no alternatives)
- Data architecture patterns
- Authentication and authorization
- Key implementation patterns
- Deployment strategy

**For features and requirements**, see [Product-Requirements.md]
**For data models**, see [Database-Schema.md]

---

## Technology Stack (Final Decision)

### Complete Stack

```yaml
Frontend:
  Framework: Next.js 14 (App Router)
  Language: TypeScript 5.x
  Styling: Tailwind CSS 3.x
  UI Components: shadcn/ui
  i18n: next-intl (multilingual, default: Spanish)
  Forms: React Hook Form + Zod

Backend:
  Database: Convex (serverless, real-time)
  Functions: Convex queries/mutations
  File Storage: Convex Storage
  Real-time: Built-in WebSocket

Authentication:
  Provider: Clerk
  Features: OAuth, Organizations, RBAC
  Multi-tenancy: Native organization support

Deployment:
  Frontend Platform: Vercel
  Database Platform: Convex Cloud
  CDN: Vercel Edge Network
  Region: São Paulo (optimal for Latin America)
  Cost: Starts FREE, scales to $20-70/month
```

### Stack Rationale

**Why This Combination:**
- **Zero Infrastructure** - No servers, databases, or DevOps to manage
- **Type-Safe End-to-End** - TypeScript from DB to UI with automatic type generation
- **Built-In Real-Time** - WebSocket subscriptions for live data updates
- **Serverless Auto-Scaling** - Handles traffic spikes automatically
- **Optimized for Latin American Market** - São Paulo CDN edge, multilingual support, regional currency formatting
- **Cost-Effective** - $0/month to start, minimal scaling costs

---

## System Architecture

### High-Level Architecture

**Dual-Frontend Architecture (Bubble + Next.js)**

```
┌──────────────────────────────────────────────────────────┐
│              USERS (Latin American Market)               │
│              Mobile PWA + Desktop Browser                │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTPS
         ┌────────────┴────────────┐
         │                         │
         ↓                         ↓
┌─────────────────┐       ┌──────────────────────────┐
│  BUBBLE APP     │       │   NEXT.JS 14             │
│  (Rapid UI)     │       │   (Vercel Edge)          │
│                 │       │                          │
│  - Standard UI  │       │  - Custom Features       │
│  - Forms        │       │  - AI Components         │
│  - CRUD Ops     │       │  - Analytics             │
│  - Workflows    │       │  - PWA Features          │
└────────┬────────┘       └──────────┬───────────────┘
         │                           │
         └────────┬──────────────────┘
                  ↓
         ┌────────────────────┐
         │   REST API v1      │
         │   /api/v1/*        │
         │                    │
         │  - Auth            │
         │  - Companies       │
         │  - Facilities      │
         │  - Batches         │
         │  - Activities      │
         │  - Compliance      │
         │  - Inventory       │
         └────────┬───────────┘
                  │
         ┌────────┴─────────────────┐
         │                          │
         ↓                          ↓
┌──────────────────┐       ┌─────────────────────┐
│   CLERK AUTH     │       │   CONVEX DATABASE   │
│   (clerk.com)    │       │   (convex.dev)      │
│                  │       │                     │
│  - User Mgmt     │       │  - 26 Tables        │
│  - OAuth         │       │  - Real-time Sync   │
│  - Organizations │       │  - File Storage     │
│  - RBAC          │       │  - TypeScript API   │
│  - JWT Tokens    │       │  - WebSocket        │
└──────────────────┘       └─────────────────────┘
```

### Multi-Tenancy Design

**Company-Based Isolation:**
- Every record has `companyId` foreign key
- Users belong to one company (Clerk Organization)
- Row-level security enforced in Convex queries
- Each company = one Clerk Organization

**Role-Based Access Control (5 Levels):**
1. **COMPANY_OWNER** (level 1000) - Full access
2. **FACILITY_MANAGER** (level 500) - Facility operations
3. **PRODUCTION_SUPERVISOR** (level 300) - Production management
4. **WORKER** (level 100) - Activity execution
5. **VIEWER** (level 10) - Read-only access

---

## Data Architecture

### Database Schema

**26 Tables in 8 Groups:**

1. **Core System** (3) - companies, roles, users
2. **Crop Configuration** (2) - crop_types, cultivars
3. **Facilities** (2) - facilities, areas
4. **Supply Chain** (3) - suppliers, products, inventory_items
5. **Production Templates** (5) - recipes, templates, phases, activities, quality_templates
6. **Production Operations** (4) - production_orders, scheduled_activities, mother_plants, batches, plants
7. **Activity & Quality** (3) - activities, pest_disease_records, pest_diseases
8. **Media & Compliance** (3) - media_files, compliance_events, certificates

**Full schema details**: See [Database-Schema.md]

### Batch-First Tracking

**Default Approach:**
- Batches represent 50-1000 plants as single unit
- QR code on batch container
- Sample-based quality checks
- Scalable for large-scale operations

**Individual Tracking (Optional):**
- Enable when regulatory requirements mandate seed-to-sale tracking
- Each plant gets unique QR code
- Still grouped under batch for reporting

### Regional-Specific Fields

**Geographic:**
- `regionalAdministrativeCode` - Regional administrative codes (e.g., DANE in Colombia)
- `administrativeDivision` - State/Department/Province
- `altitudeMsnm` - Altitude (MSNM)
- `latitude/longitude` - Geographic coordinates

**Business:**
- `businessEntityType` - Legal entity types (default: S.A.S, S.A., Ltda, E.U., Persona Natural)
- `taxId` - Tax identification number (e.g., NIT in Colombia)
- `commerceRegistration` - Chamber of Commerce registration
- `defaultCurrency` - Local currency (e.g., COP in Colombia)

**Compliance:**
- `regulatoryRegistrationNumber` - Regulatory agency registration (e.g., ICA in Colombia)
- `specialLicensing` - Industry-specific licensing (e.g., INVIMA for cannabis)
- `phytosanitaryCertificate` - Transport permits
- `regulatoryDocumentation` - Flexible JSON compliance data

---

## API Layer

### REST API Architecture

**Purpose:** Frontend-agnostic access to backend resources for Bubble, mobile apps, and third-party integrations.

**Base URL:**
- Development: `http://localhost:3000/api/v1`
- Production: `https://your-domain.com/api/v1`

**Design Principles:**
- RESTful conventions (GET, POST, PATCH, DELETE)
- Consistent JSON response format
- JWT authentication via Clerk
- Comprehensive error handling
- Request validation with Zod schemas
- CORS support for Bubble integration

### API Structure

**Core Infrastructure:**

```typescript
lib/api/
├── middleware.ts       // Auth, validation, pagination
├── errors.ts          // Error classes (ApiError, etc.)
├── response.ts        // Standard response helpers
└── validations/
    └── schemas.ts     // Shared Zod schemas
```

**Endpoints:**

```
/api/v1/
├── auth/
│   ├── session        GET    - Get current session
│   └── token          POST   - Get API token for Bubble
├── companies/         GET    - List companies
│                      POST   - Create company
├── facilities/        GET    - List facilities
│                      POST   - Create facility
│   └── [id]/          GET    - Get facility
│                      PATCH  - Update facility
│                      DELETE - Delete facility
├── batches/           GET    - List batches
│                      POST   - Create batch
├── activities/        GET    - List activities
│                      POST   - Log activity
├── compliance/        GET    - List compliance events
│                      POST   - Create event
└── inventory/         GET    - List inventory
                       POST   - Add inventory item
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-01-09T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error",
    "details": { /* optional */ }
  },
  "meta": {
    "timestamp": "2025-01-09T10:30:00Z"
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ /* items */ ],
  "meta": {
    "timestamp": "2025-01-09T10:30:00Z",
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Authentication Flow

1. User authenticates via Clerk (Bubble or Next.js)
2. Client calls `POST /api/v1/auth/token` with Clerk session token
3. Server returns JWT token valid for 1 hour
4. Client includes token in all API requests: `Authorization: Bearer <token>`
5. Middleware validates token and extracts user/organization context

### CORS Configuration

**Configuration:** `next.config.ts`

```typescript
headers: {
  'Access-Control-Allow-Origin': process.env.BUBBLE_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}
```

**Environment Variables:**
```bash
BUBBLE_APP_URL=https://your-app.bubbleapps.io
ALLOWED_ORIGINS=https://your-app.bubbleapps.io,http://localhost:3000
```

### Validation

**Shared Schemas:** `lib/validations/schemas.ts`

All input validation uses Zod schemas shared between:
- REST API endpoints
- Next.js Server Actions
- Bubble API Connector

**Example:**
```typescript
export const createBatchSchema = z.object({
  facility_id: z.string().min(1),
  crop_type_id: z.string().min(1),
  planned_quantity: z.number().int().positive(),
  tracking_level: z.enum(['batch', 'individual']),
  // ...
})
```

### Error Handling

**HTTP Status Codes:**
- `200` OK - Success
- `201` Created - Resource created
- `204` No Content - Deletion success
- `400` Bad Request - Invalid request
- `401` Unauthorized - Auth required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `422` Validation Error - Input validation failed
- `500` Internal Server Error - Server error

**Error Classes:**
```typescript
BadRequestError      // 400
UnauthorizedError    // 401
ForbiddenError       // 403
NotFoundError        // 404
ConflictError        // 409
ValidationError      // 422
InternalServerError  // 500
```

### Bubble Integration

**Setup Steps:**

1. **Install Clerk Plugin** in Bubble for authentication
2. **Configure API Connector** in Bubble:
   - Add Alquemist API
   - Set base URL: `https://your-domain.com/api/v1`
   - Add shared header: `Authorization: Bearer [token]`
3. **Get API Token** workflow:
   - Call `POST /api/v1/auth/token`
   - Store token in Bubble state
4. **Create API Calls** for each endpoint
5. **Handle Responses** in Bubble workflows

**Full Documentation:** See [API-Integration.md](API-Integration.md)

---

## Authentication & Authorization

### Clerk Setup

**Multi-Tenancy Pattern:**
- Clerk Organizations = Alquemist Companies
- Organization metadata stores regional business data
- Users assigned to single organization
- Automatic tenant isolation

**Authentication Flow:**
1. User signs up/logs in via Clerk
2. Middleware validates session
3. Organization ID mapped to Company ID
4. All queries filtered by Company ID

**Role-Based Permissions:**
- Roles stored in database (5 levels)
- Permission matrix stored as JSON
- Hierarchy enforced via `level` field
- Server-side permission checks before mutations

---

## Key Implementation Patterns

### Real-Time Data (Convex)

**Reactive Queries:**
- Queries subscribe to database changes
- React components auto-update when data changes
- No manual polling or cache invalidation
- WebSocket connection managed automatically

**Multi-Tenant Query Pattern:**
```typescript
// All queries filter by company
const batches = await ctx.db
  .query('batches')
  .withIndex('by_company', q => q.eq('companyId', user.companyId))
  .collect();
```

### QR Code Workflow

**Mobile-First Scanning:**
- HTML5 QR scanner (camera access)
- Batch/plant identification
- Activity recording on scan
- Offline queue for poor connectivity

**Rural Area Optimization:**
- Works on 3G networks
- Offline-first with sync when online
- Compressed image uploads
- Local data caching

### Compliance Audit Trail

**Immutable Logging:**
- All activities logged with timestamp
- User tracking for accountability
- Never delete/edit audit logs
- Configurable retention for regulatory compliance (default: 5 years)

**Batch Traceability:**
- Full genealogy from seed to harvest
- All activities, compliance events, photos
- Export to PDF for inspections
- Configurable timezone for all timestamps

### Progressive Web App (PWA)

**Offline Capabilities:**
- Service worker for offline access
- Background sync when connection returns
- Cached assets for fast load
- App-like install experience

**Mobile Optimization:**
- Touch-friendly UI
- QR camera integration
- GPS tagging with configurable coordinate systems
- WhatsApp integration (future)

---

## Regulatory Compliance

### Cannabis Tracking (e.g., INVIMA in Colombia)

**Requirements:**
- Individual plant tracking (optional config)
- Seed-to-sale traceability
- Immutable audit trail
- Transport manifest generation
- Waste documentation

**Implementation:**
- Batch genealogy queries
- Activity history with photos
- Compliance event tracking
- Certificate management with expiry alerts

### Agricultural Compliance (e.g., ICA in Colombia)

**Requirements:**
- Chemical registration validation
- Application record keeping
- Pest/disease monitoring
- Treatment documentation

**Implementation:**
- Registration number validation
- Inventory blocking without required registration
- Pest/disease database (extensible for regional species)
- AI-powered pest detection (40+ species, expandable)

### Industry Standards (e.g., FNC for Coffee in Colombia)

**Requirements:**
- Quality scoring
- Organic certification
- Export documentation

**Implementation:**
- Quality check templates
- Certificate upload/verification
- Industry-specific quality standards
- Export report generation

---

## Deployment

### Vercel Deployment

**Setup Steps:**
1. Connect GitHub repository to Vercel
2. Configure environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOY_KEY`
3. Deploy: `git push origin main` (auto-deploys)

**Features:**
- Automatic SSL certificates
- Edge Functions globally
- São Paulo region (optimal for Latin America)
- Preview deployments for PRs
- Zero configuration

### Convex Deployment

**Setup Steps:**
1. Deploy schema: `npx convex deploy`
2. Auto-generates TypeScript types
3. Indexes created automatically
4. File storage configured

**Features:**
- Automatic scaling
- Built-in file storage
- Real-time WebSocket
- TypeScript-native
- FREE tier: 1M rows

---

## Development Workflow

### Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Run dev servers
npm run dev          # Next.js (port 3000)
npx convex dev       # Convex (sync schema)

# 4. Access app
open http://localhost:3000
```

### Feature Development

1. **Plan** - Define feature requirements
2. **Schema** - Update Convex schema if needed
3. **Functions** - Create queries/mutations
4. **UI** - Build components (Server + Client)
5. **Test** - Local testing
6. **Deploy** - Git push (auto-deploy)

**Type Safety:**
- Convex generates types automatically
- Server Actions type-safe by default
- Zod validation for forms
- End-to-end TypeScript

---

## Performance

### Latin American Market Optimization

**Rural Connectivity:**
- PWA offline mode (3G networks)
- Background sync
- Compressed images
- Lazy loading

**CDN Strategy:**
- São Paulo edge (low latency for Latin America)
- Global asset caching
- Next.js Image optimization
- Incremental Static Regeneration

**Targets:**
- Time to Interactive: <2s
- Largest Contentful Paint: <2.5s
- Real-time latency: <500ms
- Offline mode: 100% functional

---

## Security

### Data Security
- Row-level security (company filtering)
- Input validation (Zod schemas)
- SQL injection prevention (parameterized)
- XSS prevention (sanitization)

### Authentication Security
- MFA support (Company Owners)
- Secure HTTP-only cookies
- Password complexity rules
- Account lockout (5 attempts)

### Compliance Security
- Immutable audit logs
- Configurable data retention (default: 5 years)
- Encrypted file storage
- Access logging for audits

---

## Cost Estimate

### Startup (0-5 facilities)
```
Vercel: $0/month (Hobby tier)
Convex: $0/month (Free tier)
Clerk: $0/month (Free tier)
Total: $0/month
```

### Small Business (5-20 facilities)
```
Vercel: $20/month (Pro tier)
Convex: $0-25/month (Starter tier)
Clerk: $0-25/month (Starter tier)
Total: $20-70/month
```

### Medium Business (20+ facilities)
```
Vercel: $20/month
Convex: $25-100/month
Clerk: $25-99/month
Total: $70-219/month
```

---

## Success Metrics

### Technical KPIs
- **Performance**: TTI <2s, LCP <2.5s
- **Deployment**: <2 min from push to live
- **Uptime**: >99.5%
- **Real-time**: <500ms latency

### Development Velocity
- **Feature Development**: 50% faster with Convex
- **Bug Fixes**: 30% faster with TypeScript
- **Deployments**: Multiple per day (automated)

---

## Implementation Order

**Foundation:**
1. Set up Next.js + Convex + Clerk
2. Configure multilingual i18n (default: Spanish)
3. Implement multi-tenancy
4. Deploy to Vercel

**Modules (17 total):**
1-8: Onboarding (Authentication → Cultivars)
9-13: Core Operations (Inventory → AI)
14-17: Advanced (Compliance → APIs)

**For module details**, see [Product-Requirements.md]

---

## Next Steps

1. Initialize Next.js 14 project
2. Set up Convex database
3. Configure Clerk authentication
4. Implement MODULE 1 (Authentication & Company Setup)
5. Deploy to Vercel

**Reference Documents:**
- [Product-Requirements.md](Product-Requirements.md) - Features
- [Database-Schema.md](Database-Schema.md) - Data model
- [CLAUDE.MD](CLAUDE.MD) - Development workflow
