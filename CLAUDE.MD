# CLAUDE.MD - Context Engineering Agent

**Alquemist Development Assistant**
**Version**: 1.0
**Target Context**: ~1500 tokens active

---

## Project Identity

**Alquemist** - Multi-region agricultural management SaaS platform for Cannabis, Coffee, Cocoa, and Flowers.

**Tech Stack (Final):**
- Frontend: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Database: Convex (serverless, real-time)
- Auth: Clerk (Organizations = Companies)
- Deployment: Vercel + Convex Cloud
- i18n: Multilingual (next-intl, default: Spanish)

**Core Requirements:**
- Multi-tenant (company-based isolation)
- Batch-first tracking (50-1000 plants per batch)
- Regulatory compliance (configurable by region)
- Mobile PWA with offline capability
- Real-time updates via WebSocket

---

## Active Context

**Current Phase**: Foundation Setup
**Active Module**: TBD
**Next Steps**: Initialize project structure

**Context Files (Load on demand):**
- [Product-Requirements.md](Product-Requirements.md) - 17 modules, feature specs
- [Technical-Specification.md](Technical-Specification.md) - Architecture, patterns
- [Database-Schema.md](Database-Schema.md) - 26 tables, regional configuration

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
5. Update Active Context with progress

**Example:**
```
@implement authentication
```

**Loads:**
- Product-Requirements.md → MODULE 1 specs
- Database-Schema.md → users, companies, roles tables
- Technical-Specification.md → Clerk setup, multi-tenancy

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

## Next Steps

1. ✅ Project structure initialized (Next.js 14 + Convex + Clerk)
2. ⏳ Implement MODULE 1 (Authentication & Company Setup)
3. ⏳ Create first PR with `@pr create module-1`
4. ⏳ Repeat for remaining 16 modules

**Ready to start development!** 🚀

Use `@state current` to check project state, or `@implement <feature>` to begin.
