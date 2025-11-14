# CLAUDE.MD - Context Engineering Agent

**Alquemist Development Assistant**
**Version**: 1.0
**Target Context**: ~1500 tokens active

---

## Project Identity

**Alquemist** - Multi-region agricultural management SaaS platform for Cannabis, Coffee, Cocoa, and Flowers.

**Tech Stack (Current):**
- Frontend: Bubble.io (Primary - 100% UI implementation)
- Backend: Convex HTTP Actions (serverless, real-time)
- Auth: Custom session tokens (30-day validity, stored in sessions table)
- Email: Resend (verification, password reset, notifications)
- API: RESTful HTTP API (v1) at https://handsome-jay-388.convex.site
- Deployment: Bubble + Convex Cloud (auto-deploy via GitHub Actions)
- i18n: Bilingual ES/EN via Bubble Option Sets (frontend-only translation)

**Available But Not Used (Future-Ready):**
- Next.js 14 (code exists, configured with next-intl, ready if needed)
- messages/es.json (450+ Spanish translations for Next.js future use)

**Frontend Architecture:**
- **Bubble.io:** Primary and ONLY frontend in use - 100% de la UI y orquestación
  - Connects directly to Convex HTTP Actions
  - Custom session token authentication
  - Bilingual UI via Option Sets (ES/EN)
- **Next.js:** Available but NOT currently used
  - Code exists in repo (configured with next-intl)
  - Ready for future if complexity requires
  - Would connect via same Convex backend
- **Strategy:** Bubble-only for now, Next.js available if needed later

**Core Requirements:**
- Multi-tenant (company-based isolation)
- Batch-first tracking (50-1000 plants per batch)
- Regulatory compliance (configurable by region)
- Mobile PWA with offline capability
- Real-time updates via WebSocket

---

## Frontend Architecture

### Overview

Alquemist usa **arquitectura simplificada** - Bubble conecta directamente a Convex:

```
┌─────────────────────────────────────────┐
│          BUBBLE.IO APP                  │
│      (Primary & Only Frontend)          │
│                                         │
│  • No-code UI builder                   │
│  • Custom session token auth            │
│  • Bilingual via Option Sets (ES/EN)   │
│  • Workflows + API Connector            │
└────────┬────────────────────────────────┘
         │
         │ HTTPS (Authorization: Bearer {token})
         │
         ▼
┌─────────────────────────────────────────┐
│      CONVEX HTTP ACTIONS                │
│   https://handsome-jay-388.convex.site  │
│                                         │
│  • POST /api/v1/auth/*                  │
│  • POST /api/v1/companies/*             │
│  • POST /api/v1/facilities/*            │
│  • POST /api/v1/batches/*               │
│  • Validates session tokens             │
│  • Multi-tenant isolation (company_id)  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│       CONVEX DATABASE                   │
│  (26 tables, serverless, real-time)     │
│                                         │
│  • users, sessions, companies           │
│  • facilities, batches, activities      │
│  • compliance, inventory, reports       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           RESEND EMAIL                  │
│     (Email delivery service)            │
│                                         │
│  • Email verification                   │
│  • Password reset                       │
│  • Activity notifications               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   NEXT.JS 14 (Available, Not Used)      │
│   • Code exists in repo                 │
│   • Configured with next-intl           │
│   • messages/es.json ready (450+ keys)  │
│   • Ready for future if needed          │
└─────────────────────────────────────────┘
```

**Filosofía:** START SIMPLE → Solo Bubble + Convex + Resend

### Backend Components

**Convex HTTP Actions (Primary Backend):**
- **Deployment URL:** https://handsome-jay-388.convex.site
- **Schema:** `convex/schema.ts` - 26 tables with multi-tenant architecture
- **HTTP Router:** `convex/http.ts` - RESTful endpoints via httpAction()
- **Core Modules:**
  - `convex/auth.ts` - Custom session token authentication
  - `convex/users.ts` - User management
  - `convex/companies.ts` - Company CRUD with company_id isolation
  - `convex/facilities.ts` - Facility management
  - `convex/batches.ts` - Batch tracking
  - `convex/activities.ts` - Activity logging
  - `convex/compliance.ts` - Compliance events
  - `convex/inventory.ts` - Inventory management
  - `convex/geographic.ts` - Countries, departments, cities

**Email Service (Resend):**
- Email verification (sign-up flow)
- Password reset
- Activity notifications
- Configured in Convex environment variables

**Next.js (Available But Not Used):**
- Code exists in `/app`, `/lib`, `/components`
- `lib/validations/schemas.ts` - Shared Zod schemas (can be used by Convex)
- `messages/es.json` - 450+ Spanish translations
- Ready for future if needed, no deployment currently

### Implementation Strategy

**CURRENT IMPLEMENTATION (Simple & Direct):**
```
Bubble.io → Convex HTTP Actions (https://handsome-jay-388.convex.site)
         │
         └→ Resend (email service)
```

**Architecture Details:**
- **Authentication:** Custom session tokens (30-day validity)
  - Registration: POST /api/v1/auth/register-step1 (creates user + sends verification email)
  - Verification: POST /api/v1/auth/verify-email (validates token)
  - Login: POST /api/v1/auth/login (returns session token)
  - All requests: Authorization: Bearer {session_token}

- **Data Operations:** Direct Convex HTTP Actions
  - All endpoints use POST method
  - Request body contains operation parameters
  - Multi-tenant isolation via company_id in session
  - Example: POST /api/v1/companies/create

- **Email:** Resend integration in Convex
  - Email verification on registration
  - Password reset emails
  - Activity notifications

**FUTURE OPTIONS (If Needed):**

**Option 1: Add Next.js Layer (for complex business logic):**
```
Bubble → Next.js API (Vercel) → Convex
```
- Use when: Multi-step workflows, complex transformations, rate limiting
- Next.js code already exists and is configured
- Decision made per feature/module

**Option 2: Add AI Features (future modules):**
```
Bubble → Convex → External AI APIs
```
- Potential modules: Quality Check Templates (AI vision), Intelligent Services
- Decision based on actual module requirements
- AI integration would be done via Convex actions calling external services

### Development Workflow

**For Bubble Development (Principal):**

1. **Follow Bubble Implementation Guidelines:**
   - [BUBBLE-IMPLEMENTATION-GUIDE.md](docs/BUBBLE-IMPLEMENTATION-GUIDE.md) - **Core guidelines for all Bubble implementations**
   - Read this FIRST before creating any Bubble documentation
   - Contains patterns, best practices, and what NOT to do
   - Ensures consistent, clear, non-redundant guides

2. **Use API documentation** (referencia técnica general):
   - [API-Integration.md](docs/core/API-Integration.md) - Guía general de integración
   - [API-Bubble-Reference.md](docs/module-1/bubble/API-Bubble-Reference.md) - Referencia técnica de endpoints

2. **Convex HTTP Actions (Required for Bubble):**
   - ⚠️ NO existe plugin de Convex para Bubble
   - Bubble requiere HTTP Actions (NO puede usar Convex SDK)
   - **Configuración correcta:**
     ```
     Base URL: https://[your-deployment].convex.site
     Método: POST para todos los endpoints
     Headers:
       - Content-Type: application/json
       - Authorization: Bearer [clerk-jwt-token] (cuando se agregue auth)
     ```
   - ⚠️ **IMPORTANTE:** Usar `.convex.site` NO `.convex.cloud`
     - `.convex.cloud` = WebSocket SDK (NO funciona con Bubble)
     - `.convex.site` = HTTP Actions (SÍ funciona con Bubble)

   - **Implementación:**
     - Crear `convex/http.ts` con `httpRouter()` y `httpAction()`
     - Definir rutas custom (ej: `/geographic/departments`, `/registration/register`)
     - Los HTTP Actions llaman internamente a queries/mutations de Convex

   - **Ejemplo de HTTP Action:**
     ```typescript
     // convex/http.ts
     import { httpRouter } from "convex/server";
     import { httpAction } from "./_generated/server";
     import { api } from "./_generated/api";

     const http = httpRouter();

     http.route({
       path: "/geographic/departments",
       method: "POST",
       handler: httpAction(async (ctx, request) => {
         const { countryCode } = await request.json();
         const departments = await ctx.runQuery(api.geographic.getDepartments, {
           countryCode,
         });
         return new Response(JSON.stringify(departments), {
           status: 200,
           headers: { "Content-Type": "application/json" },
         });
       }),
     });

     export default http;
     ```

   - **Llamadas desde Bubble:**
     - Endpoint: `POST https://[deployment].convex.site/geographic/departments`
     - Body: `{"countryCode": "CO"}`
     - Response: Array de departments

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

6. **Bubble Documentation Standards:**
   - **MUST READ FIRST:** [BUBBLE-IMPLEMENTATION-GUIDE.md](docs/BUBBLE-IMPLEMENTATION-GUIDE.md)
   - **Key Principles:**
     - ✅ Test backend APIs before documenting
     - ✅ Use URL parameters, NOT custom states (unless justified)
     - ✅ Show exact Bubble syntax (e.g., `dropdown_name's value`)
     - ✅ Document real API responses (copy actual JSON)
     - ✅ Keep workflows minimal - let Bubble's built-in features work
     - ❌ Don't assume functionality that doesn't exist
     - ❌ Don't create custom states for every piece of data
     - ❌ Don't add workflows for automatic Bubble features
     - ❌ Don't use vague instructions
   - **Before Writing Any Bubble Guide:**
     1. Read BUBBLE-IMPLEMENTATION-GUIDE.md
     2. Test all API endpoints with curl
     3. Follow the documented patterns
     4. Use the provided checklist

**UI Language Strategy (Bilingual ES/EN):**
- **Current Implementation:** Bubble Option Sets for frontend-only translation
  - Backend sends technical codes: "indoor", "active", "greenhouse"
  - Bubble translates via Option Sets: "indoor" → "Interior" (ES) / "Indoor" (EN)
  - Custom State: `current_language` (es | en)
  - UI_Texts Option Set: key, text_es, text_en attributes
  - Enum Option Sets: value, display_es, display_en
  - Language switcher component in Bubble header
  - User preference stored in `users.preferred_language`
- **Future Ready:** Next.js with next-intl
  - `messages/es.json` - 450+ Spanish translations ready
  - `i18n.ts` - Configured for Spanish (Colombia)
  - Available if Next.js deployment is needed
- **See:** [docs/i18n/STRATEGY.md](docs/i18n/STRATEGY.md) for complete details

**For Next.js Development (Solo si es necesario):**
- Se decide por módulo si complejidad técnica requiere Next.js
- Agregar capa intermedia: Bubble → Next.js API → Convex
- Usar para: business logic compleja, multi-step operations, rate limiting
- Server Components para SEO, Client Components para interactivity

---

## Authentication Strategy

### Custom Session Token Authentication

**Architecture Flow:**
```
1. User signs up → POST /api/v1/auth/register-step1
   - Creates user in database
   - Generates email verification token (6 chars, 24h expiry)
   - Sends verification email via Resend

2. User verifies email → POST /api/v1/auth/verify-email
   - Validates verification token
   - Marks user as email_verified: true
   - Can now complete company setup

3. User completes company setup → POST /api/v1/auth/register-step2
   - Creates company record
   - Links user to company (company_id)

4. User logs in → POST /api/v1/auth/login
   - Validates email + password (bcrypt)
   - Creates session token (URL-safe base64, 32 bytes)
   - Stores in sessions table (30-day expiry)
   - Returns: { session_token, user_id, company_id, email }

5. All subsequent requests → Authorization: Bearer {session_token}
   - Convex validates token from sessions table
   - Checks expiry (last_activity_at + 30 days)
   - Extracts company_id for multi-tenant isolation
   - Updates last_activity_at
```

**Session Token Structure:**
- Format: URL-safe base64 encoded random bytes
- Length: 32 bytes → 43 character string
- Validity: 30 days from last activity
- Storage: `sessions` table with user_id, company_id, expiry
- Example: `7xK9mP2wQvLnR8zY4hTcF6jG1sN5bV3xD8eM0oU4iA`

**Convex Auth Helper (`convex/auth.ts`):**

```typescript
import { query, mutation } from "./_generated/server";

// Helper to get authenticated user from session token
export async function getAuthenticatedUser(ctx: any, authHeader?: string) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  // Look up session
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!session) {
    throw new Error("Invalid or expired session");
  }

  // Check expiry (30 days from last activity)
  const now = Date.now();
  const expiryTime = session.last_activity_at + (30 * 24 * 60 * 60 * 1000);

  if (now > expiryTime) {
    throw new Error("Session expired");
  }

  // Update last activity
  await ctx.db.patch(session._id, { last_activity_at: now });

  // Return user and company info
  return {
    user_id: session.user_id,
    company_id: session.company_id,
    session_id: session._id
  };
}
```

**Protected Endpoint Example:**

```typescript
// convex/http.ts
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthenticatedUser } from "./auth";

// Protected endpoint - requires valid session token
http.route({
  path: "/api/v1/companies/get",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Authenticate
    const authHeader = request.headers.get("Authorization");
    const { user_id, company_id } = await getAuthenticatedUser(ctx, authHeader);

    // 2. Execute query with company isolation
    const company = await ctx.runQuery(api.companies.get, { company_id });

    // 3. Return response
    return new Response(JSON.stringify(company), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  })
});
```

**Key Features:**
- ✅ Custom session tokens (no third-party auth service)
- ✅ 30-day expiry with activity-based renewal
- ✅ Multi-tenant isolation via company_id in session
- ✅ Stored in Convex database (sessions table)
- ✅ Password hashing with bcrypt
- ✅ Email verification via Resend
- ✅ Token refresh on each request (updates last_activity_at)

**Bubble Implementation:**
1. **Sign Up:** Call POST /api/v1/auth/register-step1
   - Display "Check your email" message
2. **Verify Email:** Call POST /api/v1/auth/verify-email with token from email
3. **Complete Setup:** Call POST /api/v1/auth/register-step2 with company details
4. **Login:** Call POST /api/v1/auth/login
   - Store `session_token` in Bubble custom state
5. **All API Calls:** Include Authorization header
   - Header: `Authorization`
   - Value: `Bearer <session_token>` (from custom state)
6. **Handle 401:** Redirect to login page, clear session token

**See:** [docs/core/API-Integration.md](docs/core/API-Integration.md) for complete API documentation

---

## Active Context

**Current Phase**: API Foundation Complete
**Active Module**: Ready to begin Module implementation
**Strategy**: Bubble-first frontend, backend API ready

**Context Files (Load on demand):**
- [Database SCHEMA.md](docs/database/SCHEMA.md) - Single source of truth for all 26 tables
- [API Integration](docs/core/API-Integration.md) - REST API reference for Bubble
- [i18n Strategy](docs/i18n/STRATEGY.md) - Bilingual implementation (Bubble Option Sets)
- [Phase Documentation](docs/ui/bubble/) - UI requirements per phase (PHASE-1, PHASE-2, PHASE-3)
- [API Endpoints](docs/api/) - Complete endpoint specs (PHASE-1, PHASE-2, PHASE-3)
- [Implementation Status](docs/foundation/Implementation-Status.md) - Current progress

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
6. **For Bubble guides:** Follow [BUBBLE-IMPLEMENTATION-GUIDE.md](docs/BUBBLE-IMPLEMENTATION-GUIDE.md)
7. Update Active Context with progress

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

**NEW STRUCTURE (2025-11-06)** - Optimized for Bubble Development

**Folder Structure:**
```
docs/
├── database/          # Single source of truth for schema
│   └── SCHEMA.md     # All tables, fields, relationships
│
├── ui/
│   ├── bubble/       # UI requirements (Bubble-focused)
│   │   ├── PHASE-1-ONBOARDING.md    # Wireframes + DB context only
│   │   ├── PHASE-2-OPERATIONS.md    # Wireframes + DB context only
│   │   └── PHASE-3-ADVANCED.md      # Wireframes + DB context only
│   │
│   └── archive/      # Archived old documentation
│       └── PHASE-X-*.md (timestamped archives)
│
├── api/              # API endpoint specifications
│   ├── PHASE-1-ENDPOINTS.md         # Auth, company, geographic
│   ├── PHASE-2-ENDPOINTS.md         # Inventory, templates, orders
│   └── PHASE-3-ENDPOINTS.md         # Compliance, analytics, integrations
│
├── core/             # Legacy documentation (being phased out)
│   ├── Product-Requirements.md
│   ├── Technical-Specification.md
│   └── API-Integration.md
│
├── foundation/       # Setup and configuration
│   ├── Authentication-Guide.md
│   ├── Browser-API-Testing.md
│   └── Implementation-Status.md
│
├── dev/              # Development standards
│   └── Tech-Stack-Standard.md
│
└── sessions/         # Session summaries
    └── Session-Summary-*.md
```

**Key Documentation Files:**

1. **Database Schema (Single Source of Truth):**
   - [docs/database/SCHEMA.md](docs/database/SCHEMA.md) - All tables, fields, relationships

2. **UI Requirements (Bubble-Focused):**
   - [docs/ui/bubble/PHASE-1-ONBOARDING.md](docs/ui/bubble/PHASE-1-ONBOARDING.md) - Pages, wireframes, workflows
   - [docs/ui/bubble/PHASE-2-OPERATIONS.md](docs/ui/bubble/PHASE-2-OPERATIONS.md) - Operations UI
   - [docs/ui/bubble/PHASE-3-ADVANCED.md](docs/ui/bubble/PHASE-3-ADVANCED.md) - Advanced UI

3. **API Endpoint Specifications:**
   - [docs/api/PHASE-1-ENDPOINTS.md](docs/api/PHASE-1-ENDPOINTS.md) - Auth & company endpoints
   - [docs/api/PHASE-2-ENDPOINTS.md](docs/api/PHASE-2-ENDPOINTS.md) - Operations endpoints
   - [docs/api/PHASE-3-ENDPOINTS.md](docs/api/PHASE-3-ENDPOINTS.md) - Advanced endpoints

**Documentation Philosophy:**

**SEPARATION OF CONCERNS:**
- 🎨 **UI Docs** → Bubble pages, wireframes, visual elements, workflows
  - NO API calls, NO code snippets
  - Simple DB context: "Stores X in Y table"
  - ASCII wireframes for visual reference
  - Focus: What user sees and does

- 🔌 **API Docs** → HTTP endpoints, request/response, triggered by which Bubble element
  - Method, URL, body, response
  - Which Bubble button/workflow triggers it
  - Database operations described
  - Focus: Backend integration

- 🗄️ **Database Schema** → Single source of truth
  - All tables, fields, types
  - Relationships clearly defined
  - Referenced by both UI and API docs
  - Focus: Data structure

**Benefits:**
- ✅ Easy iteration: Change UI without touching API docs
- ✅ Bubble-friendly: UI docs speak Bubble's language
- ✅ Backend-agnostic: API docs work for any implementation
- ✅ Single source: Database schema eliminates duplication
- ✅ Context optimization: Load only what you need
- ✅ Clear separation: UI designers vs. backend developers

**How to Use:**

1. **Building Bubble Pages:**
   - Read UI doc for phase (e.g., PHASE-1-ONBOARDING.md)
   - Follow wireframes and workflows
   - Check "Database Context" for simple field mapping
   - Reference SCHEMA.md for table details if needed

2. **Implementing API Endpoints:**
   - Read API doc for phase (e.g., PHASE-1-ENDPOINTS.md)
   - Implement Convex functions as specified
   - Test with curl/Postman
   - Update implementation status in doc

3. **Understanding Data Flow:**
   - Start with SCHEMA.md to see all tables
   - UI docs tell you "what to store/query"
   - API docs tell you "how to store/query"
   - Database schema tells you "where and what format"

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

**3. Set Up Resend (Email Service)**
- Visit [resend.com](https://resend.com) and create account
- Create API key
- Add to Convex environment variables:
  ```bash
  npx convex env set RESEND_API_KEY re_...
  ```
- Configure sender email in Resend dashboard

**4. Deploy Convex Schema and Functions**
```bash
# Deploy to production (auto-deploys via GitHub Actions)
npx convex deploy
```
- Deployment URL: https://handsome-jay-388.convex.site
- All HTTP endpoints available at /api/v1/*

### Environment Variables

**Convex Environment Variables (via `npx convex env`):**
```bash
# Set in Convex dashboard or via CLI
npx convex env set RESEND_API_KEY re_your_api_key_here

# Auto-generated by Convex
CONVEX_DEPLOYMENT=prod:handsome-jay-388
CONVEX_URL=https://handsome-jay-388.convex.site
```

**Local Development (`.env.local`):**
```bash
# Convex (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Note: Next.js not currently used, but env file maintained for future
```

**Bubble Configuration:**
- **Convex API Base URL:** https://handsome-jay-388.convex.site
- **Session Token:** Stored in Bubble custom state after login
- **Authorization Header:** Added dynamically to all API calls

### Development Workflow

**For Backend Development:**
```bash
# Watch and sync Convex schema/functions
npx convex dev
```

**For Next.js Development (if needed in future):**
```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Convex dev server
npx convex dev
```

**Access Application:**
- **Bubble App:** https://[your-bubble-app].bubbleapps.io (Primary and ONLY frontend)
- **Convex HTTP API:** https://handsome-jay-388.convex.site
  - All endpoints: POST /api/v1/*
  - Auth: POST /api/v1/auth/login, register-step1, verify-email, etc.
  - Companies: POST /api/v1/companies/create, get, update
  - Facilities: POST /api/v1/facilities/create, list, update
  - Geographic: POST /api/v1/geographic/departments, cities
- **Dashboards:**
  - Convex Dashboard: https://dashboard.convex.dev
  - Resend Dashboard: https://resend.com/emails
- **Next.js (Available but NOT used):** http://localhost:3000 (if run locally)

### CI/CD Pipeline

**Automatic Deployments:**
- **Convex Production**: Push to `main` auto-deploys via GitHub Actions
- **Deployment URL**: https://handsome-jay-388.convex.site
- **No Vercel deployment** (Next.js not used currently)

**Workflows:**
- `.github/workflows/convex-deploy.yml` - Convex schema and function deployment
- Triggered on push to `main` branch

**Required GitHub Secrets:**
```
CONVEX_DEPLOY_KEY  # From Convex dashboard
```

### Deployment

**Bubble Deployment:**
- Bubble app deployed via Bubble.io platform
- Configure API Connector to point to: https://handsome-jay-388.convex.site
- No git-based deployment (Bubble handles this internally)

**Convex Production Deployment:**
```bash
# Manual deployment (or via GitHub Actions)
npx convex deploy

# Set production environment variables
npx convex env set RESEND_API_KEY re_your_prod_key --prod
```

**Future: Vercel Deployment (if Next.js is used):**
1. Connect GitHub repo to [vercel.com](https://vercel.com)
2. Add environment variables (Convex URL)
3. Deploy: Automatic on `git push origin main`

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

### Phase 1: Backend Foundation ✅ (100% COMPLETE)

**Completed (November 2025):**
1. ✅ Convex database schema deployed (26 tables, multi-tenant architecture)
2. ✅ Custom authentication system (session tokens, bcrypt passwords)
3. ✅ Resend email integration (verification, password reset)
4. ✅ HTTP Actions API (RESTful endpoints at https://handsome-jay-388.convex.site)
5. ✅ Core backend modules:
   - ✅ auth.ts - Custom session token authentication
   - ✅ users.ts - User management
   - ✅ companies.ts - Company CRUD with isolation
   - ✅ facilities.ts - Facility management
   - ✅ batches.ts - Batch tracking
   - ✅ geographic.ts - Countries, departments, cities
6. ✅ Multi-tenant isolation via company_id
7. ✅ API documentation (PHASE-1, PHASE-2, PHASE-3 endpoints)
8. ✅ Database schema documentation
9. ✅ i18n strategy documented (Bubble Option Sets)
10. ✅ Deployment pipeline (GitHub Actions → Convex)

**Current Stack:**
- ✅ Frontend: Bubble.io (primary and only UI)
- ✅ Backend: Convex HTTP Actions
- ✅ Auth: Custom session tokens (30-day validity)
- ✅ Email: Resend
- ✅ Database: Convex (26 tables)
- ✅ i18n: Bubble Option Sets (ES/EN)
- ✅ Deployment: https://handsome-jay-388.convex.site

**Next.js Status:**
- Code exists and is configured (Next.js 14 + next-intl)
- messages/es.json ready (450+ translations)
- Available for future use if needed
- NOT currently deployed or used

**Documentation:**
- [docs/database/SCHEMA.md](docs/database/SCHEMA.md) - Complete database schema
- [docs/api/PHASE-1-ENDPOINTS.md](docs/api/PHASE-1-ENDPOINTS.md) - Phase 1 API endpoints
- [docs/i18n/STRATEGY.md](docs/i18n/STRATEGY.md) - Bilingual implementation
- [docs/core/API-Integration.md](docs/core/API-Integration.md) - Integration guide


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


**To Start a Module:**
```bash
@implement module-X  # e.g., @implement module-1
```

This will:
- Load module context from `docs/module-X/`
- Provide implementation guidance for Bubble
- Generate specific API calls and code for the module
- Create or update module-specific documentation
