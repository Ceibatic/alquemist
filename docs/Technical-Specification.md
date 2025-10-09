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
  i18n: next-intl (Spanish-first)
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
  Region: São Paulo (closest to Colombia)
  Cost: Starts FREE, scales to $20-70/month
```

### Stack Rationale

**Why This Combination:**
- **Zero Infrastructure** - No servers, databases, or DevOps to manage
- **Type-Safe End-to-End** - TypeScript from DB to UI with automatic type generation
- **Built-In Real-Time** - WebSocket subscriptions for live data updates
- **Serverless Auto-Scaling** - Handles traffic spikes automatically
- **Optimized for Colombian Market** - São Paulo CDN edge, Spanish-first, COP formatting
- **Cost-Effective** - $0/month to start, minimal scaling costs

---

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────┐
│     USERS (Colombian Market)                 │
│     Mobile PWA + Desktop Browser             │
└─────────────────┬────────────────────────────┘
                  │ HTTPS
                  ↓
┌──────────────────────────────────────────────┐
│     NEXT.JS 14 (Vercel Edge)                 │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Server Components (SEO)               │ │
│  │  Client Components (Interactivity)     │ │
│  │  Server Actions (Mutations)            │ │
│  │  Middleware (Auth + i18n)              │ │
│  └────────────────────────────────────────┘ │
└─────────┬───────────────────┬────────────────┘
          │                   │
          ↓                   ↓
┌──────────────────┐   ┌─────────────────────┐
│   CLERK AUTH     │   │   CONVEX DATABASE   │
│   (clerk.com)    │   │   (convex.dev)      │
│                  │   │                     │
│  - User Mgmt     │   │  - 26 Tables        │
│  - OAuth         │   │  - Real-time Sync   │
│  - Organizations │   │  - File Storage     │
│  - RBAC          │   │  - TypeScript API   │
└──────────────────┘   └─────────────────────┘
```

### Multi-Tenancy Design

**Company-Based Isolation:**
- Every record has `companyId` foreign key
- Users belong to one company (Clerk Organization)
- Row-level security enforced in Convex queries
- Colombian companies = Clerk Organizations

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
- Scalable for Colombian operations

**Individual Tracking (Optional):**
- Enable when INVIMA requires seed-to-sale
- Each plant gets unique QR code
- Still grouped under batch for reporting

### Colombian-Specific Fields

**Geographic:**
- `daneMunicipalityCode` - DANE codes
- `colombianDepartment` - Department
- `altitudeMsnm` - Altitude (MSNM)
- `latitude/longitude` - MAGNA-SIRGAS

**Business:**
- `businessEntityType` - S.A.S, S.A., Ltda, E.U., Persona Natural
- `taxId` - NIT format
- `camaraComercioRegistration` - Chamber of Commerce
- `defaultCurrency` - COP ($290.000)

**Compliance:**
- `icaRegistrationNumber` - ICA chemical registration
- `invimaCertification` - Cannabis licensing
- `phytosanitaryCertificate` - Transport permits
- `regulatoryDocumentation` - Flexible JSON compliance data

---

## Authentication & Authorization

### Clerk Setup

**Multi-Tenancy Pattern:**
- Clerk Organizations = Alquemist Companies
- Organization metadata stores Colombian business data
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

**Colombian Rural Optimization:**
- Works on 3G networks
- Offline-first with sync when online
- Compressed image uploads
- Local data caching

### Compliance Audit Trail

**Immutable Logging:**
- All activities logged with timestamp
- User tracking for accountability
- Never delete/edit audit logs
- 5-year retention for INVIMA/ICA

**Batch Traceability:**
- Full genealogy from seed to harvest
- All activities, compliance events, photos
- Export to PDF for inspections
- Colombian timezone for all timestamps

### Progressive Web App (PWA)

**Offline Capabilities:**
- Service worker for offline access
- Background sync when connection returns
- Cached assets for fast load
- App-like install experience

**Mobile Optimization:**
- Touch-friendly UI
- QR camera integration
- GPS tagging (MAGNA-SIRGAS)
- WhatsApp integration (future)

---

## Colombian Compliance

### INVIMA Cannabis Tracking

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

### ICA Agricultural Compliance

**Requirements:**
- Chemical registration validation
- Application record keeping
- Pest/disease monitoring
- Treatment documentation

**Implementation:**
- ICA registration number validation
- Inventory blocked without ICA registration
- Pest/disease database (Colombian species)
- AI-powered pest detection (40+ species)

### FNC Coffee Standards

**Requirements:**
- Quality scoring
- Organic certification
- Export documentation

**Implementation:**
- Quality check templates
- Certificate upload/verification
- Colombian cup profile standards
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
- São Paulo region (closest to Colombia)
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

### Colombian Market Optimization

**Rural Connectivity:**
- PWA offline mode (3G networks)
- Background sync
- Compressed images
- Lazy loading

**CDN Strategy:**
- São Paulo edge (low latency)
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
- 5-year data retention
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
2. Configure Colombian i18n (Spanish-first)
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
