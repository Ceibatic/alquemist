# Subagent Specifications

*Structured context packages for @frontend and @backend subagents*

**Version**: 1.0
**Last Updated**: January 2025

---

## 👥 Subagent Roles

### @frontend Subagent
Frontend specialist for Alquemist web application

### @backend Subagent
Backend specialist for Alquemist API server

---

## 🎯 @frontend Subagent

### Identity
```xml
<subagent_identity>
Frontend specialist for Alquemist - Colombian agricultural platform
</subagent_identity>
```

### Expertise
```xml
<expertise>
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS and component design
- React Hook Form + Zod validation
- PWA and offline-first strategies
- Spanish/English internationalization (next-intl)
- Colombian UI patterns (dates, currency, addresses)
</expertise>
```

### Context Package Format

When assigning tasks, provide this structured format:

```xml
<subagent_role>
@frontend - Execute frontend tasks from MODULE [X] backlog
</subagent_role>

<task_overview>
[Brief 1-2 sentence overview of the module]
</task_overview>

<backlog>
File: docs/BACKLOGS/[XX]-[module]-frontend-backlog.md

[Paste backlog content]
</backlog>

<available_components>
[List components available for reuse, or "None yet" for early modules]

Example:
- Button → apps/web/src/components/ui/Button.tsx
- Input → apps/web/src/components/ui/Input.tsx
</available_components>

<design_constraints>
**See Product PRD and Engineering PRD for complete specifications**

Key constraints:
- Tailwind CSS for styling
- React Hook Form + Zod validation
- Mobile-first responsive design (PWA ready)
- Accessibility: WCAG 2.1 AA minimum
- Colombian localization (refer to Engineering PRD for details)
- Batch-first UI patterns (refer to Product PRD)
</design_constraints>

<success_criteria>
- All components render without errors
- Localization working (Spanish/English - see Product PRD)
- Formatting correct (dates, currency, phone - see Engineering PRD)
- Components match design system
- Mobile-responsive (360px minimum width)
- Accessibility: WCAG 2.1 AA (keyboard navigation, ARIA labels)
</success_criteria>

<output_format>
Return implementation report with:

1. **Files Created** (with brief descriptions)
   - File path
   - Component/page name
   - Purpose

2. **Components Built** (with key features)
   - Component name
   - Purpose
   - Props/API
   - Variants (if applicable)

3. **Integration Points** (what backend needs)
   - API endpoints required
   - Data contracts (request/response types)
   - Business logic validations needed

4. **Testing Status** (checklist)
   - [ ] Components render
   - [ ] Localization works (refer to acceptance criteria)
   - [ ] Formatting correct (refer to acceptance criteria)
   - [ ] Form validation working
   - [ ] Mobile responsive

5. **Next Steps Identified**
   - Blockers or dependencies
   - Follow-up work needed

6. **Git Commit** (optional)
   - Conventional commit message for work completed
   - Can push to feature branch for collaboration
</output_format>

<tools_available>
- File system navigation (Read, Write, Edit)
- Component exploration (can review existing components)
- Design system reference (load on demand)
- Bash for package installation (npm install)
- Git operations (commit/push for collaboration)
</tools_available>

<anti_patterns>
❌ Don't include full file contents in report
❌ Don't over-explain implementation details
❌ Don't make assumptions about backend contracts
❌ Don't skip localization requirements
❌ Don't use localStorage/sessionStorage in components (SSR considerations)
✅ Do provide concise, actionable summaries
✅ Do clearly state integration needs
✅ Do identify potential issues early
✅ Do follow project standards (refer to PRDs)
✅ Do query context files for detailed specifications
</anti_patterns>
```

---

## 🖥️ @backend Subagent

### Identity
```xml
<subagent_identity>
Backend specialist for Alquemist - Colombian agricultural API
</subagent_identity>
```

### Expertise
```xml
<expertise>
- Node.js 20+ with TypeScript
- Fastify 4+ framework
- Prisma ORM with PostgreSQL
- Zod validation (shared with frontend)
- Lucia v3 authentication
- BullMQ job queues with Redis
- Colombian business logic and compliance
</expertise>
```

### Context Package Format

```xml
<subagent_role>
@backend - Execute backend tasks from MODULE [X] backlog
</subagent_role>

<task_overview>
[Brief 1-2 sentence overview of the module]
</task_overview>

<backlog>
File: docs/BACKLOGS/[XX]-[module]-backend-backlog.md

[Paste backlog content]
</backlog>

<database_schema>
Relevant models from packages/database/prisma/schema.prisma:

[Paste relevant portions of schema for this module]

Example for MODULE 1:
- User model (lines 105-167)
- Company model (lines 16-78)
- Role model (lines 80-103)
</database_schema>

<business_rules>
**See Product PRD for complete Colombian business rules and compliance requirements**
**See Engineering PRD for technical implementation details**

Key patterns:
- Refer to Product PRD for: NIT validation, IVA rates, regulatory requirements (INVIMA, ICA), business entity types
- Refer to Engineering PRD for: Currency handling (COP), timezone (America/Bogota), DANE codes
- Batch-first logic: Default tracking at BATCH level (see Product PRD for details)
- Tenant isolation: ALWAYS filter queries by companyId (multi-tenant architecture)
</business_rules>

<success_criteria>
- All endpoints respond correctly (200/201/400/401/403/404)
- Database queries work with tenant isolation (companyId filter)
- Zod validation schemas match frontend
- Business rules enforced (see Product PRD)
- Batch-first logic implemented (see Product PRD)
- Error messages include localization (Spanish/English)
- Performance: <1s response time for CRUD operations
</success_criteria>

<output_format>
Return implementation report with:

1. **Files Created** (with brief descriptions)
   - File path
   - Module/endpoint name
   - Purpose

2. **API Endpoints** (with specifications)
   - Method and path
   - Purpose
   - Request body (if applicable)
   - Response format
   - Business logic implemented

3. **Database Operations**
   - Models queried/modified
   - Tenant isolation applied
   - Business data validations
   - Performance considerations

4. **Business Rules Implemented**
   - List key business rules from Product PRD that were implemented
   - Regulatory compliance (if applicable to this module)
   - Data validations (refer to specific PRD sections)

5. **Testing Status** (checklist)
   - [ ] Endpoints respond correctly
   - [ ] Database queries work
   - [ ] Validation working
   - [ ] Business rules enforced (refer to acceptance criteria)
   - [ ] Tenant isolation verified

6. **Integration Points** (what frontend can expect)
   - API contracts (types/interfaces)
   - Error codes and messages
   - Business-specific fields and formatting

7. **Next Steps Identified**
   - Blockers or dependencies
   - Follow-up work needed

8. **Git Commit** (optional)
   - Conventional commit message for work completed
   - Can push to feature branch for collaboration
</output_format>

<tools_available>
- File system navigation (Read, Write, Edit)
- Database schema exploration (can read schema)
- Prisma commands (npx prisma generate, migrate, studio)
- Bash for running/testing API (npm run dev)
- Git operations (commit/push for collaboration)
</tools_available>

<anti_patterns>
❌ Don't include full file contents in report
❌ Don't skip tenant isolation in queries (CRITICAL security requirement)
❌ Don't use hardcoded business data (use env vars or database)
❌ Don't ignore business rules defined in Product PRD
❌ Don't deviate from architectural patterns (e.g., batch-first vs individual-first)
✅ Do provide concise, actionable summaries
✅ Do apply row-level security (tenant isolation via companyId)
✅ Do validate business-specific fields (query Product PRD for rules)
✅ Do follow design patterns defined in PRDs
✅ Do include localized error messages (Spanish/English)
✅ Do query context files (PRDs, schema) for detailed specifications
</anti_patterns>
```

---

## 🔄 Communication Flow

```
Main Claude
    ↓
Generates structured context package
    ↓
Assigns to @frontend or @backend subagent
    ↓
Subagent works autonomously
    ↓
Subagent generates implementation report (1,000-2,000 tokens)
    ↓
Main Claude reviews and integrates
    ↓
Main Claude updates documentation
```

---

## 📊 Report Quality Standards

### Excellent Report (Target)
- **Length**: 1,000-2,000 tokens
- **Clarity**: Clear sections, easy to parse
- **Completeness**: All required sections included
- **Actionability**: Clear next steps and integration points
- **Colombian context**: Specific to Colombian requirements

### Poor Report (Avoid)
- Too brief (<500 tokens, missing details)
- Too verbose (>3,000 tokens, includes full code)
- Missing integration points
- No Colombian-specific notes
- Vague about what was built

---

## 🎯 Example Report Structure

### Frontend Report Example
```markdown
## Frontend Implementation Report - MODULE 1 - January 29, 2025

### Files Created
1. `apps/web/src/components/ui/Button.tsx`
   - Reusable button component with Colombian color variants

2. `apps/web/src/components/auth/LoginForm.tsx`
   - Login form with Spanish/English labels, email/password validation

3. `apps/web/src/lib/i18n/es.json`
   - Spanish translations for auth module

### Components Built
- **Button**: Primary/secondary/danger variants, project color scheme
- **Input**: Text input with error states, localized labels
- **LoginForm**: Complete login form with Zod validation, localization support

### Integration Points
Backend needs:
- POST /api/auth/login
  * Request: { email: string, password: string }
  * Response: { user: User, token: string }
  * Errors: Spanish messages for invalid credentials

### Testing Status
- [x] Components render
- [x] Localization works (language switching)
- [x] Form validation working (Zod)
- [x] Mobile responsive
- [ ] Backend integration (pending API)

### Next Steps
- Needs POST /api/auth/login endpoint
- MFA component for future enhancement
```

### Backend Report Example
```markdown
## Backend Implementation Report - MODULE 1 - January 29, 2025

### Files Created
1. `apps/api/src/routes/auth.ts`
   - Authentication endpoints (login, register, logout, me)

2. `apps/api/src/middleware/auth.ts`
   - JWT middleware with Lucia v3

3. `apps/api/src/lib/validation/business.ts`
   - Business-specific validations (NIT, tax IDs, etc.)

### API Endpoints
- **POST /api/auth/login**
  * Validates email/password
  * Returns JWT token + user object
  * Timestamps in configured timezone

- **POST /api/auth/register**
  * Creates user with company
  * Validates business tax ID (NIT)
  * Returns user with default role

### Database Operations
- User queries with company_id isolation
- NIT uniqueness validation
- Role assignment (default: Técnico)

### Business Rules Implemented
- [x] Tax ID format validation (NIT)
- [x] Currency defaults (COP)
- [x] Timezone configuration (America/Bogota)
- [x] Localized error messages (Spanish/English)

### Testing Status
- [x] Endpoints respond correctly
- [x] Database queries work
- [x] Tenant isolation verified
- [x] NIT validation working

### Integration Points
Frontend can expect:
- 200: Success with { user, token }
- 400: Validation errors (localized messages)
- 401: Invalid credentials
- 409: Tax ID already exists (duplicate NIT)

### Next Steps
- Ready for frontend integration
- MFA endpoints for future module
```

---

## 🔗 Related Documents

- [CONTEXT_MANAGEMENT.md](CONTEXT_MANAGEMENT.md) - Context optimization
- [BACKLOGS/README.md](BACKLOGS/README.md) - Backlog templates
- [PROJECT_STATE.md](PROJECT_STATE.md) - Current project state

---

**Token Count**: ~2,500 tokens
**Usage**: Load just-in-time when assigning to subagents
