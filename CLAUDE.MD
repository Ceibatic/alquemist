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
- i18n: UI 100% español, datos técnicos en inglés (next-intl)

**Frontend Architecture:**
- **Bubble:** Frontend principal - 100% de la UI y orquestación
- **Next.js:** Solo si complejidad técnica lo requiere (decisión por módulo)
- **Shared Backend:** Single Convex database + REST API
- **Strategy:** Bubble-first, resolver complejidades técnicas caso por caso

**Core Requirements:**
- Multi-tenant (company-based isolation)
- Batch-first tracking (50-1000 plants per batch)
- Regulatory compliance (configurable by region)
- Mobile PWA with offline capability
- Real-time updates via WebSocket

---

## Frontend Architecture

### Overview

Alquemist usa **arquitectura simplificada** - Bubble conecta directamente a servicios cloud:

```
┌─────────────────────────┐
│     Bubble App          │
│   (UI Principal)        │
└────────┬────────────────┘
         │
         ├─→ Clerk API (Auth)
         │   • Sign up / Sign in
         │   • JWT tokens
         │   • User management
         │
         ├─→ Convex HTTP API (Database)
         │   • Queries (GET data)
         │   • Mutations (POST/PATCH/DELETE)
         │   • Real-time subscriptions
         │   • [Valida Clerk JWT]
         │
         └─→ GCP Cloud Functions (Opcional)
             • Vision AI (pest detection)
             • Document AI (form digitization)
             • Features complejas
             • [Solo cuando sea necesario]

┌─────────────────────────┐
│   Next.js API (Vercel)  │ ← Disponible pero NO usado inicialmente
│   • Backend opcional    │   (Agregar solo si complejidad lo requiere)
│   • /api/v1/*          │
└─────────────────────────┘
```

**Filosofía:** START SIMPLE → Escala cuando sea necesario

### Backend Components

**Convex (Database + Backend):**
- `convex/schema.ts` - Database schema (26 tables)
- `convex/companies.ts` - Company queries & mutations
- `convex/facilities.ts` - Facilities queries & mutations
- `convex/batches.ts` - Batch tracking
- `convex/activities.ts` - Activity logging
- `convex/compliance.ts` - Compliance events
- `convex/inventory.ts` - Inventory management

**Next.js API (Opcional - NO usado en Módulo 1):**
- `lib/api/middleware.ts` - Auth & validation
- `lib/api/errors.ts` - Error handling
- `lib/validations/schemas.ts` - Shared Zod schemas
- `app/api/v1/*` - REST endpoints (disponibles pero no usados)

**GCP Cloud Functions (Futuro):**
- Vision AI - Pest detection, quality checks
- Document AI - Form digitization
- Cloud Storage - Media files
- (Se implementa cuando módulos específicos lo requieran)

### Implementation Strategy

**START SIMPLE (Módulo 1-3):**
```
Bubble → Clerk API (auth)
      → Convex HTTP API (CRUD)
```
- No usar Next.js API inicialmente
- Validar Clerk JWT en Convex functions
- CRUD directo con Convex HTTP API

**ADD COMPLEXITY (Cuando sea necesario):**
```
Bubble → Next.js API (Vercel) → Convex
```
- Solo para business logic compleja
- Multi-step operations
- Transformaciones de data complejas
- Rate limiting / caching

**ADD GCP (Módulos con IA):**
```
Bubble → GCP Cloud Functions → Vision AI / Document AI
                              → Convex (save results)
```
- Módulo 11: Quality Check Templates + AI
- Módulo 13: AI Engine & Intelligent Services
- Decisión por feature específico

### Development Workflow

**For Bubble Development (Principal):**

1. **Use API documentation** (referencia técnica general):
   - [API-Integration.md](docs/core/API-Integration.md) - Guía general de integración
   - [API-Bubble-Reference.md](docs/module-1/bubble/API-Bubble-Reference.md) - Referencia técnica de endpoints

2. **Convex HTTP API (Direct Connection):**
   - ⚠️ NO existe plugin de Convex para Bubble
   - Conectar directamente a Convex HTTP API desde Bubble:
     ```
     Base URL: https://[your-deployment].convex.cloud
     Endpoint pattern: /api/query/[functionName] (GET)
                       /api/mutation/[functionName] (POST)
     Headers:
       - Authorization: Bearer [clerk-jwt-token]
       - Content-Type: application/json
     ```
   - Ejemplo query: `GET /api/query/companies:get?args={"id":"company123"}`
   - Ejemplo mutation: `POST /api/mutation/companies:create` con body JSON

3. **Autenticación Clerk:**
   - ⚠️ NO existe plugin de Clerk para Bubble
   - Implementar autenticación manualmente:
     ```
     Clerk Frontend API: https://[your-frontend-api].clerk.accounts.dev

     Sign In: POST /v1/client/sign_ins
     Sign Up: POST /v1/client/sign_ups
     Get Session: GET /v1/client/sessions/[session_id]
     ```
   - Obtener JWT token de Clerk session
   - Pasar token en header `Authorization: Bearer [token]` a Convex
   - Token se valida automáticamente en Convex functions

4. **API Connector Setup en Bubble:**
   - Configurar 2 API connectors principales:
     - **Clerk API** - Autenticación (sign in, sign up, user management)
     - **Convex API** - Database operations (queries + mutations)
   - Para cada endpoint, configurar manualmente en Bubble API Connector
   - Almacenar JWT token en Bubble's custom state
   - Incluir token en todos los requests a Convex

5. **Código e Implementación:**
   - Los archivos de documentación son **solo referencia técnica**
   - El **código real y llamados API específicos** se proporcionan durante la implementación de cada módulo
   - Cada módulo generará sus propios archivos de documentación en `docs/module-X/bubble/`
   - Ejemplos de configuración de API Connector se proporcionan por módulo

**UI Language (100% Español):**
- Todos los textos visibles al usuario en español
- Labels, botones, mensajes, placeholders → español
- Valores técnicos en BD permanecen en inglés (indoor, active, etc.)
- Traducciones aplicadas en Convex functions (antes de retornar datos)
- Mapping automático: DB "indoor" → Response "Interior"
- Archivo de traducciones: `messages/es.json` (450+ traducciones)

**For Next.js Development (Solo si es necesario):**
- Se decide por módulo si complejidad técnica requiere Next.js
- Agregar capa intermedia: Bubble → Next.js API → Convex
- Usar para: business logic compleja, multi-step operations, rate limiting
- Server Components para SEO, Client Components para interactivity

---

## Authentication Strategy

### Clerk JWT Validation in Convex

**Architecture Flow:**
```
1. User logs in via Bubble → Clerk API
2. Clerk returns JWT token
3. Bubble stores token in custom state
4. Bubble → Convex HTTP API (includes JWT in Authorization header)
5. Convex validates JWT and extracts user/org info
6. Query/Mutation executes with proper multi-tenant isolation
```

**Convex Function Example (with JWT validation):**

```typescript
// convex/companies.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

// Query example - requires authentication
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Validate JWT and get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Extract organization ID from Clerk JWT
    const organizationId = identity.orgId;
    if (!organizationId) {
      throw new Error("No organization found");
    }

    // Multi-tenant query - only return company for this org
    return await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("organization_id"), organizationId))
      .collect();
  },
});

// Mutation example - requires authentication
export const create = mutation({
  args: {
    name: v.string(),
    company_type: v.string(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // Validate JWT and get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const organizationId = identity.orgId;
    if (!organizationId) {
      throw new Error("No organization found");
    }

    // Create company with automatic org isolation
    const companyId = await ctx.db.insert("companies", {
      ...args,
      organization_id: organizationId,
      created_by: identity.subject, // User ID from Clerk
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return companyId;
  },
});
```

**Key Points:**
- ✅ Convex validates Clerk JWT automatically via `ctx.auth.getUserIdentity()`
- ✅ Multi-tenant isolation enforced by filtering on `organization_id`
- ✅ No need for separate auth middleware
- ✅ User info (userId, orgId) extracted from JWT claims
- ✅ All protected functions start with identity check

**Bubble Implementation:**
1. Store JWT token after Clerk login: `Set state token = [Clerk response token]`
2. Configure Convex API Connector with dynamic Authorization header:
   ```
   Header: Authorization
   Value: Bearer <token> (dynamic from custom state)
   ```
3. All Convex API calls automatically include JWT
4. Handle 401 errors → redirect to login

---

## GCP Cloud Functions Strategy

### When to Use GCP

**START SIMPLE - NO usar GCP inicialmente**

GCP Cloud Functions son para casos específicos con IA/ML:

**Use Cases for GCP:**
- 🤖 **Vision AI**: Pest detection, quality inspections, plant health
- 📄 **Document AI**: Form digitization, license scanning, label reading
- 🧠 **Custom ML Models**: Yield prediction, disease classification
- 📊 **Heavy Processing**: Large batch operations, complex calculations

**Architecture with GCP:**
```
┌─────────────────────────┐
│     Bubble App          │
└────────┬────────────────┘
         │
         ├─→ GCP Cloud Function (HTTPS endpoint)
         │   • Procesa imagen con Vision AI
         │   • Extrae datos con Document AI
         │   • Ejecuta modelo ML custom
         │   │
         │   └─→ Convex Mutation (guarda resultados)
         │       • Autenticación: Service Account
         │       • Inserta datos en BD
         │
         └─→ Convex (refresh data)
             • Query para mostrar resultados
```

**Implementation Decision Per Module:**
- **Módulo 1-10:** NO usar GCP (START SIMPLE)
- **Módulo 11:** Quality Check Templates - evaluar si Vision AI agrega valor
- **Módulo 13:** AI Engine - USAR GCP para features de IA
- **Decision criteria:** ¿El feature REQUIERE IA/ML o es "nice-to-have"?

**GCP Function Example:**
```javascript
// GCP Cloud Function - Pest Detection
const { ConvexHttpClient } = require("convex/browser");
const vision = require('@google-cloud/vision');

exports.detectPests = async (req, res) => {
  // 1. Validate request (API key, signature, etc.)
  const { imageUrl, batchId } = req.body;

  // 2. Process with Vision AI
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.objectLocalization(imageUrl);

  // 3. Analyze results
  const pests = result.localizedObjectAnnotations.filter(
    obj => PEST_LABELS.includes(obj.name)
  );

  // 4. Save to Convex
  const convex = new ConvexHttpClient(process.env.CONVEX_URL);
  await convex.mutation("activities:createPestDetection", {
    batch_id: batchId,
    pests_detected: pests.length,
    confidence: pests[0]?.score || 0,
    image_url: imageUrl,
  });

  // 5. Return results
  res.json({
    success: true,
    pests_found: pests.length,
    details: pests
  });
};
```

**When NOT to use GCP:**
- ❌ Simple CRUD operations → Use Convex directly
- ❌ Business logic → Consider Next.js API first
- ❌ Data transformations → Can do in Convex functions
- ❌ User authentication → Clerk handles this
- ❌ File uploads → Use Convex file storage or Cloudinary

---

## Active Context

**Current Phase**: API Foundation Complete
**Active Module**: Ready to begin Module implementation
**Strategy**: Bubble-first frontend, backend API ready

**Context Files (Load on demand):**
- [Product-Requirements.md](docs/core/Product-Requirements.md) - 17 modules, feature specs
- [Technical-Specification.md](docs/core/Technical-Specification.md) - Architecture, patterns
- [Database-Schema.md](docs/core/Database-Schema.md) - 26 tables, regional configuration
- [API-Integration.md](docs/core/API-Integration.md) - REST API reference for Bubble integration

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

## Documentation Organization

**Folder Structure:**
```
docs/
├── core/              # Documentos principales del proyecto
│   ├── Product-Requirements.md
│   ├── Technical-Specification.md
│   ├── Database-Schema.md
│   └── API-Integration.md
│
├── foundation/        # Configuración inicial y setup
│   ├── Authentication-Guide.md
│   ├── Browser-API-Testing.md
│   ├── Clerk-Organization-Setup.md
│   └── Implementation-Status.md
│
├── module-X/          # Documentación específica de cada módulo
│   ├── README.md     # Índice del módulo
│   ├── Module-X-Planning.md
│   ├── Module-X-Quick-Start.md
│   └── bubble/       # Guías de implementación en Bubble
│       ├── Module-X-Bubble-Guide.md
│       ├── API-Bubble-Reference.md
│       └── Bubble-UI-Wireframes.md
│
├── dev/              # Frameworks y estándares de desarrollo
│   ├── Agentic-Dev-Framework.md
│   ├── Agentic-Dev-System-Simple.md
│   └── Tech-Stack-Standard.md
│
└── sessions/         # Resúmenes de sesiones de trabajo
    └── Session-Summary-YYYY-MM-DD.md
```

**Finding Documentation:**
- **Product specs:** `docs/core/Product-Requirements.md`
- **Tech architecture:** `docs/core/Technical-Specification.md`
- **Database schema:** `docs/core/Database-Schema.md`
- **API reference:** `docs/core/API-Integration.md`
- **Module guides:** `docs/module-X/` (cada módulo tiene su carpeta)
- **Bubble guides:** `docs/module-X/bubble/` (implementación Bubble específica)
- **Foundation docs:** `docs/foundation/` (setup, auth, testing)
- **Dev standards:** `docs/dev/` (frameworks, stack, guidelines)

**Creating New Module Documentation:**
1. Create folder: `docs/module-X/` (e.g., `docs/module-2/`)
2. Create `README.md` with module overview and links
3. Add planning documents (Planning, Task Board, etc.)
4. Add implementation guides (Quick Start, etc.)
5. If dual-frontend: Create `bubble/` subfolder with Bubble-specific docs
6. Update references in this CLAUDE.MD file

**Benefits of This Structure:**
- ✅ Clear separation by concern (core, foundation, modules, dev)
- ✅ Each module is self-contained with README
- ✅ Easy to find documentation by category
- ✅ Scalable for future modules (module-2, module-3, etc.)
- ✅ Bubble documentation grouped per module
- ✅ Development standards centralized in `dev/`

---

## Tech Constraints

**Internationalization Strategy:**
- **UI Language:** 100% español - todos los textos visibles al usuario
- **Database Values:** Inglés técnico (indoor, active, greenhouse) para compatibilidad API
- **User Display:** Traducciones automáticas desde messages/es.json
- **Example:** BD guarda "indoor", usuario ve "Interior"

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
- **Bubble App:** https://[your-bubble-app].bubbleapps.io (Primary frontend)
- **Convex HTTP API:** https://[your-deployment].convex.cloud/api
  - Query endpoint: `/api/query/[functionName]`
  - Mutation endpoint: `/api/mutation/[functionName]`
- **Clerk API:** https://[your-frontend-api].clerk.accounts.dev
  - Sign in: `/v1/client/sign_ins`
  - Sign up: `/v1/client/sign_ups`
- **Dashboards:**
  - Convex Dashboard: https://dashboard.convex.dev
  - Clerk Dashboard: https://dashboard.clerk.com
- **Next.js (Opcional - solo desarrollo):** http://localhost:3000/api/v1

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
- [docs/foundation/Implementation-Status.md](docs/foundation/Implementation-Status.md) - Detailed status report
- [docs/foundation/Clerk-Organization-Setup.md](docs/foundation/Clerk-Organization-Setup.md) - Organization setup guide
- [docs/foundation/Browser-API-Testing.md](docs/foundation/Browser-API-Testing.md) - Complete testing guide
- [docs/foundation/Authentication-Guide.md](docs/foundation/Authentication-Guide.md) - Auth troubleshooting

### Module Implementation

**Current Status:** Foundation complete, ready to implement modules

**When Implementing a Module:**

1. **Check module documentation:**
   - Review `docs/module-X/README.md` for module overview
   - Read `docs/module-X/Module-X-Planning.md` for requirements

2. **For Bubble implementation (Default):**
   - Reference `docs/module-X/bubble/` for module-specific guides
   - Use general API reference: [API-Integration.md](docs/core/API-Integration.md)
   - Follow wireframes in `docs/module-X/bubble/Bubble-UI-Wireframes.md` if available
   - Los archivos de documentación son **referencia técnica**
   - El código real y llamados API se proporcionan durante implementación

3. **Implementation approach:**
   - **Default:** Build in Bubble
   - **If technical complexity requires:** Discuss Next.js option
   - Code and API calls provided during module implementation
   - Cada módulo genera su documentación en `docs/module-X/bubble/`

**Available Modules:**
- **Module 1:** Company & Facility Setup → [docs/module-1/](docs/module-1/)
- **Module 2-17:** To be implemented

**To Start a Module:**
```bash
@implement module-X  # e.g., @implement module-1
```

This will:
- Load module context from `docs/module-X/`
- Provide implementation guidance for Bubble
- Generate specific API calls and code for the module
- Create or update module-specific documentation
