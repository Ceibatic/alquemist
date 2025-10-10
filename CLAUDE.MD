# CLAUDE.MD - Context Engineering Agent

**Alquemist Development Assistant**
**Version**: 1.0
**Target Context**: ~1500 tokens active

---

## Project Identity

**Alquemist** - Multi-region agricultural management SaaS platform for Cannabis, Coffee, Cocoa, and Flowers.

**Tech Stack (Final):**
- Frontend: Dual-mode (Bubble + Next.js 14)
- Database: Convex (serverless, real-time)
- Auth: Clerk (Organizations = Companies)
- API: RESTful API (v1) for frontend-agnostic access
- Deployment: Vercel + Convex Cloud
- i18n: Multilingual (next-intl, default: Spanish)

**Dual-Frontend Architecture:**
- **Bubble Frontend:** Rapid prototyping, 80% of standard UI
- **Next.js Frontend:** Complex features, custom workflows
- **Shared Backend:** Single Convex database + REST API
- **Gradual Migration:** Build in Bubble, migrate to Next.js as needed

**Core Requirements:**
- Multi-tenant (company-based isolation)
- Batch-first tracking (50-1000 plants per batch)
- Regulatory compliance (configurable by region)
- Mobile PWA with offline capability
- Real-time updates via WebSocket

---

## Dual-Frontend Architecture

### Overview

Alquemist supports two parallel frontend options that share the same backend:

```
┌─────────────────┐      ┌─────────────────┐
│  Bubble App     │      │  Next.js App    │
│  (Rapid UI)     │      │  (Custom/Comp.) │
└────────┬────────┘      └────────┬────────┘
         │                        │
         └────────┬───────────────┘
                  ↓
         ┌────────────────┐
         │   REST API v1   │
         │  /api/v1/*      │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │  Clerk Auth     │
         │  (JWT tokens)   │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │ Convex Database │
         │ (Single source) │
         └─────────────────┘
```

### Implementation Files

**API Layer:**
- `lib/api/middleware.ts` - Auth & validation
- `lib/api/errors.ts` - Error handling
- `lib/api/response.ts` - Standard responses
- `lib/validations/schemas.ts` - Shared Zod schemas

**API Endpoints:**
- `app/api/v1/auth/*` - Authentication
- `app/api/v1/companies/*` - Company management
- `app/api/v1/facilities/*` - Facilities
- `app/api/v1/batches/*` - Batch tracking
- `app/api/v1/activities/*` - Activity logging
- `app/api/v1/compliance/*` - Compliance events
- `app/api/v1/inventory/*` - Inventory management

**Configuration:**
- `next.config.ts` - CORS headers, routing
- `.env` - BUBBLE_APP_URL, ALLOWED_ORIGINS

### Migration Strategy

1. **Phase 1 (Current):** API foundation built
2. **Phase 2:** Build 80% of UI in Bubble (rapid prototyping)
3. **Phase 3:** Build complex features in Next.js (AI, analytics)
4. **Phase 4:** Gradually migrate Bubble pages to Next.js

### Development Workflow

**For Bubble Development:**
1. Use API documentation (see API-Integration.md)
2. Configure Clerk authentication in Bubble
3. Call REST API endpoints from Bubble workflows
4. Use Bubble's API Connector for all backend operations

**For Next.js Development:**
1. Use Convex queries directly (real-time)
2. Or use REST API for consistency
3. Server Components for SEO
4. Client Components for interactivity

---

## Active Context

**Current Phase**: API Foundation Complete
**Active Module**: Dual-Frontend Foundation
**Next Steps**: Connect Convex queries to API endpoints, implement Bubble integration

**Context Files (Load on demand):**
- [Product-Requirements.md](docs/Product-Requirements.md) - 17 modules, feature specs
- [Technical-Specification.md](docs/Technical-Specification.md) - Architecture, patterns
- [Database-Schema.md](docs/Database-Schema.md) - 26 tables, regional configuration
- [API-Integration.md](docs/API-Integration.md) - REST API reference for Bubble integration

---

## Commands

### `@state current`
Show current project state, active module, and next steps.

**Output:**
- Git status (branch, uncommitted changes)
- Active module implementation progress
- Blockers or pending decisions
- Suggested next actions

---

### `@implement <feature>`
Load feature context and implement functionality.

**Process:**
1. Load relevant sections from Product-Requirements.md
2. Load relevant tables from Database-Schema.md
3. Apply patterns from Technical-Specification.md
4. Implement feature with regional requirements (default: Colombia)
5. For frontend features, decide: Bubble or Next.js implementation
6. Update Active Context with progress

**Example:**
```
@implement authentication
```

**Loads:**
- Product-Requirements.md → MODULE 1 specs
- Database-Schema.md → users, companies, roles tables
- Technical-Specification.md → Clerk setup, multi-tenancy

---

### `@api <endpoint>`
Create or update API endpoint for frontend-agnostic access.

**Process:**
1. Load API-Integration.md for patterns
2. Create/update route handler in app/api/v1/
3. Add validation schemas in lib/validations/
4. Update API documentation
5. Test endpoint

**Example:**
```
@api batches
```

**Creates:**
- app/api/v1/batches/route.ts
- Updates API-Integration.md with endpoint docs

---

### `@review`
Review current implementation against requirements.

**Checks:**
- ✓ Feature matches Product Requirements
- ✓ Database schema matches Database-Schema.md
- ✓ Tech stack follows Technical-Specification.md
- ✓ Regional requirements implemented (i18n, multi-currency, regional codes)
- ✓ Multi-tenancy enforced (companyId filtering)
- ✓ Type safety (TypeScript end-to-end)

**Output:**
- Issues found with line numbers
- Compliance gaps
- Performance concerns
- Suggested fixes

---

### `@pr create <module>`
Generate comprehensive pull request for completed module.

**Process:**
1. Review all changes (git diff)
2. Verify module completion against Product-Requirements.md
3. Create PR with:
   - **Title**: `feat: implement MODULE X - <name>`
   - **Summary**: Feature overview (3-5 bullet points)
   - **Implementation Details**: Key technical decisions
   - **Regional Requirements**: Compliance implemented
   - **Database Changes**: Schema updates (if any)
   - **Testing**: Manual test checklist
   - **Screenshots**: UI changes (if applicable)

**Example:**
```
@pr create module-1
```

**Generates PR:**
```markdown
feat: implement MODULE 1 - Authentication & Company Setup

## Summary
- Clerk authentication with email/password + OAuth
- Company registration with regional business types
- Multi-tenant isolation via Clerk Organizations
- Multilingual UI with next-intl (default: Spanish)

## Implementation Details
- Convex schema: users, companies, roles tables
- Clerk Organizations mapped to companyId
- Row-level security in all queries
- Regional business entity types configurable

## Regional Requirements (Colombia Default)
✓ Multi-language support (default: Spanish)
✓ Business entity types (S.A.S, S.A., Ltda, etc.)
✓ Tax ID validation pattern
✓ Regional administrative codes (DANE for Colombia)
✓ Timezone configurable (default: America/Bogota)

## Database Changes
Added 3 tables: companies, roles, users
See Database-Schema.md for full definitions

## Testing
- [ ] User registration with company
- [ ] Email verification flow
- [ ] Login with email/password
- [ ] OAuth login (Google)
- [ ] Multi-tenant isolation verified

## Next Module
MODULE 2 - Email Verification
```

---

## Workflow

**Simple 3-Step Process:**

### 1. Plan
- User specifies module/feature to implement
- Claude loads relevant context from core docs
- Confirms understanding and approach

### 2. Implement
- Claude implements feature following Technical-Specification.md
- Uses database schema from Database-Schema.md
- Applies regional requirements throughout (default: Colombia)
- Updates git commits incrementally

### 3. PR
- User requests PR creation with `@pr create <module>`
- Claude reviews completeness against Product-Requirements.md
- Generates comprehensive PR description
- Archives context in PR (no separate doc files needed)

**Archive Strategy:**
- PR descriptions document feature implementation
- Git commits track incremental progress
- No separate "planning docs" or "specs" needed
- Core docs (3 files) remain single source of truth

---

## Context Rules

**Keep Active Context Minimal:**
- Active module context only (~2000 tokens)
- Load feature specs on demand
- Use git history for completed work
- PR descriptions archive decisions

**When to Load Context:**
- `@implement` → Load feature specs from Product-Requirements.md
- Schema changes → Load relevant tables from Database-Schema.md
- Architecture questions → Reference Technical-Specification.md
- Don't load entire docs, only relevant sections

**Git as Archive:**
- Each commit documents incremental progress
- PR descriptions capture full feature context
- Git history is queryable archive
- No need for separate "implementation logs"

---

## Tech Constraints

**Regional Configuration (Colombia as Default):**
- Default locale: `es` (Spanish) - configurable per region
- Default currency: `COP` (format: $290.000) - multi-currency support
- Timezone: `America/Bogota` - configurable
- Regional administrative codes (e.g., DANE in Colombia)
- Coordinate systems configurable (MAGNA-SIRGAS for Colombia)
- Altitude units configurable (MSNM default)

**Business Types (Colombia Example):**
- S.A.S (Sociedad por Acciones Simplificada)
- S.A. (Sociedad Anónima)
- Ltda (Limitada)
- E.U. (Empresa Unipersonal)
- Persona Natural
- *Extensible for other regions*

**Compliance (Configurable by Region):**
- Cannabis: Regulatory tracking (e.g., INVIMA in Colombia)
- Agricultural chemicals: Registration validation (e.g., ICA in Colombia)
- Coffee: Quality standards (e.g., FNC in Colombia)
- Municipal: Business registration, permits
- *Architecture supports adding new regulatory frameworks*

**Data Architecture:**
- Multi-tenancy: Every record has `companyId`
- Batch-first: Default tracking unit (50-1000 plants)
- Individual plants: Optional for INVIMA compliance
- Audit trail: Immutable activity logs
- 5-year retention: Regulatory requirement

**Type Safety:**
- TypeScript strict mode
- Convex auto-generates types
- Zod validation for forms
- Server Actions type-safe by default

---

## Implementation Order

**Phase 1: Onboarding (Modules 1-8)**
1. Authentication & Company Setup
2. Email Verification
3. Subscription & Payments
4. Company Profile Completion
5. Facility Creation
6. Crop Type Selection
7. Area Setup with Sample Data
8. Cultivars & Suppliers Setup

**Phase 2: Core Operations (Modules 9-13)**
9. Inventory Management
10. Production Templates
11. Quality Check Templates + AI
12. Production Orders & Operations
13. AI Engine & Intelligent Services

**Phase 3: Advanced Features (Modules 14-17)**
14. Compliance & Reporting
15. Analytics & Business Intelligence
16. Mobile Experience & Media Management
17. Integrations & APIs

**Dependencies:**
- Each module builds on previous modules
- Cannot skip modules within a phase
- Cross-phase dependencies documented in Product-Requirements.md

---

## Example Session

```
User: @state current

Claude:
**Current State:**
- Branch: main
- Active Module: None (project not initialized)
- Next Steps:
  1. Initialize Next.js 14 project
  2. Set up Convex database
  3. Configure Clerk authentication
  4. Implement MODULE 1

**Suggested Command:**
@implement module-1

---

User: @implement module-1

Claude:
Loading MODULE 1 context...
✓ Product-Requirements.md → MODULE 1: Authentication & Company Setup
✓ Database-Schema.md → users, companies, roles tables
✓ Technical-Specification.md → Clerk setup, multi-tenancy patterns

Implementing MODULE 1...

[Creates files, implements features]

✓ MODULE 1 complete

Test with:
npm run dev

Then request PR:
@pr create module-1

---

User: @pr create module-1

Claude:
Reviewing MODULE 1 implementation...
✓ All features from Product-Requirements.md implemented
✓ Database schema matches Database-Schema.md
✓ Colombian requirements applied

Creating pull request...

[Generates comprehensive PR as shown in @pr create command above]

PR ready to create. Run:
git push origin feature/module-1
```

---

## Success Metrics

**Context Efficiency:**
- Active context: <2000 tokens (vs 8000+ in complex systems)
- Core docs: 3 files (vs 15+ in complex systems)
- PR-based archive (vs separate planning docs)

**Development Velocity:**
- Module implementation: 1-3 days per module
- PR review: <1 hour with comprehensive descriptions
- Context switching: <5 minutes (load on demand)

**Quality Indicators:**
- Type safety: 100% (TypeScript end-to-end)
- Colombian compliance: All requirements met
- Multi-tenancy: Enforced in all queries
- Real-time updates: WebSocket subscriptions

---

## Setup Instructions

### Initial Setup (One-Time)

**1. Clone Repository**
```bash
git clone <repository-url>
cd alquemist
npm install
```

**2. Set Up Convex**
```bash
# Initialize Convex (creates project if needed)
npx convex dev
```
- Creates a Convex account at [convex.dev](https://convex.dev)
- Sets up project: `alquemist`
- Generates `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
- Press `Ctrl+C` after setup completes

**3. Set Up Clerk**
- Visit [clerk.com](https://clerk.com) and create account
- Create new application named "Alquemist"
- **Enable Organizations**: Settings → Organizations → Enable
- Configure auth methods: Email/Password + Google OAuth
- Copy API keys to `.env.local`:
  ```bash
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  CLERK_FRONTEND_API_URL=https://....clerk.accounts.dev
  ```

**4. Install shadcn/ui Components (Optional)**
```bash
npx shadcn@latest add button card input label form
```

### Environment Variables

Required variables in `.env.local`:
```bash
# Convex (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_FRONTEND_API_URL=https://....clerk.accounts.dev
```

### Development Workflow

**Start Development Servers:**
```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Convex dev server (watches schema changes)
npx convex dev
```

**Access Application:**
- Frontend: http://localhost:3000
- Convex Dashboard: https://dashboard.convex.dev

### CI/CD Pipeline

**Automatic Deployments:**
- **PR Preview**: Every PR triggers Vercel preview deployment
- **Production**: Push to `main` auto-deploys to production
- **Convex**: Schema deployed automatically via GitHub Actions

**Workflows:**
- `.github/workflows/ci.yml` - Lint, type-check, build verification
- `.github/workflows/deploy.yml` - Production deployment

**Required GitHub Secrets:**
```
VERCEL_TOKEN
CONVEX_DEPLOY_KEY
CLERK_SECRET_KEY (production)
```

### Deployment (Vercel + Convex)

**Vercel Setup:**
1. Connect GitHub repo to [vercel.com](https://vercel.com)
2. Add environment variables (Convex + Clerk keys)
3. Deploy: Automatic on `git push origin main`

**Convex Production Deployment:**
```bash
# Deploy schema to production
npx convex deploy --prod
```

### Testing

**Run Linter:**
```bash
npm run lint
```

**Type Check:**
```bash
npx tsc --noEmit
```

**Build Test:**
```bash
npm run build
```

---

## Implementation Status

### Foundation Phase ✅ (100% COMPLETE)

**Completed (2025-10-10):**
1. ✅ Project structure initialized (Next.js 15 + Convex + Clerk)
2. ✅ Database schema deployed (26 tables, 97 indexes)
3. ✅ Convex backend modules (6 core modules: companies, facilities, batches, activities, compliance, inventory)
4. ✅ REST API integration (7 operational endpoints)
5. ✅ Seed data system (5 roles, 4 crop types)
6. ✅ API test scripts and documentation
7. ✅ Multi-tenant architecture enforced and tested
8. ✅ Type safety end-to-end
9. ✅ **Clerk Organizations enabled and configured**
10. ✅ **Organization creation UI implemented**
11. ✅ **End-to-end testing completed successfully**
12. ✅ **Test data created: Company + Facility**

**Test Results:**
- ✅ Organization: `org_33saIMDJHDTLUJkAyxnxo5cYRSP`
- ✅ Company: `jn7cx3afzv7zs555nrkp0pq9rx7s7c6d` (Alquemist Test Company)
- ✅ Facility: Created (Greenhouse Facility #1, License: LIC-2025-001)
- ✅ Multi-tenant isolation verified
- ✅ All API endpoints operational with authentication

**Documentation:**
- [docs/Implementation-Status.md](docs/Implementation-Status.md) - Detailed status report
- [docs/Clerk-Organization-Setup.md](docs/Clerk-Organization-Setup.md) - Organization setup guide
- [docs/Browser-API-Testing.md](docs/Browser-API-Testing.md) - Complete testing guide
- [docs/Authentication-Guide.md](docs/Authentication-Guide.md) - Auth troubleshooting

### Module 1: Company & Facility Setup (PLANNING COMPLETE) 📋

**Status:** Planning phase complete, ready to implement
**Planning Date:** 2025-10-10
**Estimated Effort:** 12-14 hours (4 sprints)

**Planning Documents Created:**
- [docs/Module-1-Planning.md](docs/Module-1-Planning.md) - Full planning with 15 user stories, technical architecture
- [docs/Module-1-Quick-Start.md](docs/Module-1-Quick-Start.md) - TL;DR implementation guide
- [docs/Module-1-Task-Board.md](docs/Module-1-Task-Board.md) - 47 tasks in Kanban format

**What We'll Build (MVP):**
1. ✅ **Company Profile** - View and edit company information
2. ✅ **Facilities List** - Browse with search, filter, pagination
3. ✅ **Create Facility Wizard** - 3-step guided creation flow
4. ✅ **Facility Details** - Tabbed view (Overview | License | Areas)
5. ✅ **License Alerts** - Visual expiration indicators

**Key Features:**
- Multi-step facility creation wizard
- Real-time updates via Convex
- License expiration color coding (green/yellow/red)
- Responsive design (mobile-first)
- Multi-tenant isolation enforced

**Tech Stack for Module 1:**
- UI Components: shadcn/ui (card, button, form, tabs, badge, dialog)
- Forms: react-hook-form + Zod validation
- State: Convex React hooks (useQuery, useMutation)
- Notifications: Sonner (toast)
- Styling: Tailwind CSS (Emerald theme)

**Implementation Sprints:**
- Sprint 1: Foundation & Company Profile (4-5h)
- Sprint 2: Facilities List & Details (4-5h)
- Sprint 3: Create Facility Wizard (3-4h)
- Sprint 4: Testing & Polish (2-3h)

**Deferred to Later Modules:**
- Logo/document uploads
- Advanced area layouts
- Team member invitation UI
- Batch and activity features

**Next Steps:**
1. ✅ Review planning documents
2. ✅ Approve approach
3. [ ] Run: `npm install react-hook-form @hookform/resolvers zod sonner date-fns`
4. [ ] Run: `npx shadcn@latest add card button input label form select tabs badge dialog alert`
5. [ ] Start Sprint 1: `@implement module-1-sprint-1`

**Current Status:** Foundation 100% complete, Module 1 fully planned, ready to implement

**Git Status:**
- Latest commit: `a23dba4` - Add comprehensive session summary
- Branch: `main`
- Status: ✅ All changes committed and pushed

Use `@implement module-1-sprint-1` to begin implementation!
