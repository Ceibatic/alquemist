# Agentic Development System (Simplified)

**Alquemist Development Framework**
**Version**: 1.0 (Simplified)
**Date**: January 2025

---

## Philosophy

**Simple, PR-Based Development:**
- CLAUDE.MD is the single context engineering agent
- 3 core documents provide all requirements
- Pull requests archive implementation decisions
- Git history is the living documentation
- No complex subagent workflows or multi-phase planning

**80% Reduction vs Complex System:**
- 4 total docs (vs 15+ in complex version)
- PR-based archive (vs separate planning/spec docs)
- 3-step workflow (vs 4-phase with subagents)
- ~2000 token active context (vs 8000+)

---

## Core Documents (Single Source of Truth)

### 1. [Product-Requirements.md](Product-Requirements.md)
**WHAT to build** - Complete feature specifications for 17 modules

**Use when:**
- Planning module implementation
- Verifying feature completeness
- Understanding user stories
- Checking Colombian compliance requirements

**Size**: 27KB | **Key sections**: Modules 1-17, Colombian requirements, compliance cross-reference

---

### 2. [Technical-Specification.md](Technical-Specification.md)
**HOW to build** - Final architecture and tech stack decisions

**Use when:**
- Implementing new features
- Choosing patterns (auth, data fetching, multi-tenancy)
- Understanding deployment strategy
- Applying Colombian-specific implementations

**Size**: 21KB | **Key sections**: Final tech stack, architecture, Colombian compliance, deployment

---

### 3. [Database-Schema.md](Database-Schema.md)
**DATA structure** - Technology-agnostic schema for 26 tables

**Use when:**
- Adding new tables/fields
- Understanding relationships
- Implementing queries
- Applying Colombian-specific fields

**Size**: 54KB | **Key sections**: 26 tables in 8 groups, Colombian fields, batch-first tracking

---

### 4. [CLAUDE.MD](CLAUDE.MD)
**AGENT workflow** - Context engineering agent with commands

**Use when:**
- Starting new module implementation
- Reviewing current state
- Creating pull requests
- Loading feature context on demand

**Size**: 8KB | **Key sections**: Commands (@state, @implement, @review, @pr), workflow, context rules

---

## Workflow (3 Steps)

### Step 1: Plan
**When**: Starting new module or significant feature

**Process:**
1. User identifies module to implement (e.g., "MODULE 1")
2. Claude uses `@implement <module>` command
3. Claude loads relevant context:
   - Module specs from Product-Requirements.md
   - Database tables from Database-Schema.md
   - Architecture patterns from Technical-Specification.md
4. Claude confirms understanding and approach
5. User approves or requests adjustments

**Output**: Shared understanding of feature scope, no separate planning doc needed

**Example:**
```
User: @implement module-1

Claude:
Loading MODULE 1: Authentication & Company Setup...

Context loaded:
✓ Product-Requirements.md → User registration, company setup, role assignment
✓ Database-Schema.md → users, companies, roles tables
✓ Technical-Specification.md → Clerk authentication, multi-tenancy pattern

Implementation approach:
1. Set up Clerk with Organizations (= Companies)
2. Create Convex schema (3 tables)
3. Build registration flow with Colombian business types
4. Implement multi-tenant isolation (companyId filtering)
5. Spanish-first UI with next-intl

Ready to implement. Proceed? (yes/no)
```

---

### Step 2: Implement
**When**: After plan is approved

**Process:**
1. Claude implements feature following Technical-Specification.md
2. Uses database schema from Database-Schema.md
3. Applies Colombian requirements (Spanish, COP, DANE codes, etc.)
4. Makes incremental git commits with descriptive messages
5. Tests implementation locally
6. Updates CLAUDE.MD active context with progress

**Output**: Working feature with git commits documenting progress

**Git Commit Strategy:**
- Small, focused commits for each logical step
- Descriptive commit messages following convention
- Example: `feat(auth): add Clerk authentication setup`
- Example: `feat(schema): add users, companies, roles tables`
- Example: `feat(ui): add Spanish registration form with Colombian business types`

**Colombian Requirements Checklist:**
Every implementation must apply:
- ✓ Spanish-first UI (next-intl, locale: 'es')
- ✓ COP currency formatting ($290.000)
- ✓ Timezone: America/Bogota
- ✓ Colombian business entity types (if applicable)
- ✓ DANE municipality codes (if geographic)
- ✓ Multi-tenancy via companyId filtering

---

### Step 3: PR (Pull Request)
**When**: Module or feature is complete and tested

**Process:**
1. User requests PR with `@pr create <module>`
2. Claude reviews implementation against Product-Requirements.md
3. Claude generates comprehensive PR description:
   - Summary (3-5 bullet points)
   - Implementation details
   - Colombian requirements implemented
   - Database changes
   - Testing checklist
   - Screenshots (if UI changes)
   - Next module reference
4. Claude creates PR (or provides PR description for user to create)

**Output**: PR that archives all implementation decisions (no separate docs needed)

**PR Template:**
```markdown
feat: implement MODULE X - <Feature Name>

## Summary
- Key feature 1
- Key feature 2
- Key feature 3

## Implementation Details
- Tech stack decisions
- Architecture patterns applied
- Key files created/modified

## Colombian Requirements
✓ Spanish locale (es) as default
✓ Colombian-specific fields implemented
✓ Compliance requirements met
[List specific items]

## Database Changes
[Tables added/modified with reference to Database-Schema.md]

## Testing
- [ ] Test case 1
- [ ] Test case 2
- [ ] Test case 3

## Screenshots
[If applicable]

## Next Module
MODULE X+1 - <Next Feature>
```

**PR as Archive:**
- PR description captures all implementation context
- No need for separate "implementation log" or "spec doc"
- Git history + PR descriptions = complete project documentation
- Future developers can understand decisions by reading PR history

---

## Commands Reference

All commands are defined in CLAUDE.MD and used during the 3-step workflow.

### `@state current`
**Purpose**: Check project state, active module, and next steps

**Use in workflow**: Before starting Step 1 (Plan)

**Output:**
- Git status (branch, uncommitted changes)
- Active module implementation progress
- Blockers or pending decisions
- Suggested next actions

---

### `@implement <feature>`
**Purpose**: Load feature context and implement functionality

**Use in workflow**: Step 1 (Plan) and Step 2 (Implement)

**Process:**
1. Loads relevant sections from Product-Requirements.md
2. Loads relevant tables from Database-Schema.md
3. Applies patterns from Technical-Specification.md
4. Confirms approach with user
5. Implements feature with Colombian requirements

**Example:**
```bash
@implement module-1  # Implement MODULE 1: Authentication & Company Setup
@implement inventory # Implement MODULE 9: Inventory Management
```

---

### `@review`
**Purpose**: Review current implementation against requirements

**Use in workflow**: During Step 2 (Implement) or before Step 3 (PR)

**Checks:**
- ✓ Feature matches Product-Requirements.md
- ✓ Database schema matches Database-Schema.md
- ✓ Tech stack follows Technical-Specification.md
- ✓ Colombian requirements implemented
- ✓ Multi-tenancy enforced
- ✓ Type safety (TypeScript)

**Output**: Issues found with suggested fixes

---

### `@pr create <module>`
**Purpose**: Generate comprehensive pull request for completed module

**Use in workflow**: Step 3 (PR)

**Process:**
1. Reviews all changes (git diff)
2. Verifies module completion against Product-Requirements.md
3. Creates PR with comprehensive description

**Example:**
```bash
@pr create module-1  # Create PR for MODULE 1
@pr create module-9  # Create PR for MODULE 9
```

---

## Context Management

### Active Context (~2000 tokens)
**What to keep in memory:**
- Current module being implemented
- Immediate next steps
- Active blockers or decisions
- Current file being edited

**What NOT to keep:**
- Completed modules (archived in PRs)
- Entire Product-Requirements.md (load on demand)
- Full Database-Schema.md (load tables as needed)
- Implementation details of other modules

### Load on Demand
**When implementing a feature:**
1. Load only relevant module from Product-Requirements.md
2. Load only relevant tables from Database-Schema.md
3. Reference Technical-Specification.md for patterns
4. Don't load entire documents into context

**Example - MODULE 1 Implementation:**
```
Load from Product-Requirements.md:
→ MODULE 1 section only (~1000 tokens)

Load from Database-Schema.md:
→ users, companies, roles tables only (~500 tokens)

Reference from Technical-Specification.md:
→ Clerk setup section
→ Multi-tenancy pattern section

Total active context: ~2000 tokens (vs 102KB if loading all docs)
```

### Archive Strategy
**Use Git + PRs as archive, not separate docs:**

**Git Commits:**
- Document incremental progress
- Each commit is queryable
- Git history shows evolution of codebase

**PR Descriptions:**
- Archive implementation decisions
- Capture full module context
- Reference Product-Requirements.md for specs
- Include Colombian requirements implemented
- Provide testing checklist

**No Separate Docs Needed:**
- ✗ No "Module 1 Planning Doc"
- ✗ No "Module 1 Implementation Log"
- ✗ No "Module 1 Technical Spec"
- ✓ Just git commits + PR description

---

## Module Implementation Pattern

For each of the 17 modules in Product-Requirements.md:

### 1. Initialize
```bash
@state current           # Check current state
git checkout -b feature/module-X  # Create feature branch
```

### 2. Plan & Implement
```bash
@implement module-X      # Load context and implement
                        # Claude makes incremental git commits
                        # User tests locally
```

### 3. Review & PR
```bash
@review                  # Review implementation
@pr create module-X      # Generate PR description
git push origin feature/module-X
                        # Create PR on GitHub with generated description
```

### 4. Next Module
```bash
git checkout main
git pull origin main     # Merge completed PR
@state current          # Check state, move to MODULE X+1
```

**Repeat for all 17 modules.**

---

## Module Dependencies

**Phase 1 (Modules 1-8) - Onboarding:**
Must be implemented in order, each builds on previous.

**Phase 2 (Modules 9-13) - Core Operations:**
Requires Phase 1 complete. Can parallelize some modules:
- MODULE 9 (Inventory) → required for MODULE 10
- MODULE 10 (Templates) → required for MODULE 12
- MODULE 11 (Quality AI) → can parallel with MODULE 10
- MODULE 13 (AI Engine) → requires MODULE 11

**Phase 3 (Modules 14-17) - Advanced:**
Requires Phase 2 complete. Mostly independent:
- MODULE 14 (Compliance) → can parallel with MODULE 15
- MODULE 15 (Analytics) → can parallel with MODULE 14
- MODULE 16 (Mobile) → independent
- MODULE 17 (APIs) → independent

**Dependency Map:** See Product-Requirements.md for full dependency diagram.

---

## Colombian Requirements Application

Every module implementation must apply these requirements:

### Internationalization
```typescript
// next-intl configuration
defaultLocale: 'es'
locales: ['es', 'en']  // Spanish-first, English optional
```

### Currency Formatting
```typescript
// Colombian Pesos with proper formatting
const price = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0
}).format(290000);  // Output: $290.000
```

### Timezone
```typescript
// All timestamps in Colombian timezone
timezone: 'America/Bogota'
// Convex handles UTC storage, display in Colombian time
```

### Business Entity Types
```typescript
// Always include when dealing with companies
businessEntityTypes = [
  'S.A.S',  // Sociedad por Acciones Simplificada
  'S.A.',   // Sociedad Anónima
  'Ltda',   // Limitada
  'E.U.',   // Empresa Unipersonal
  'Persona Natural'
]
```

### Geographic Data
```typescript
// Use DANE codes for municipalities
daneMunicipalityCode: string  // e.g., "05001" for Medellín
colombianDepartment: string   // e.g., "Antioquia"
altitudeMsnm: number          // Altitude in meters above sea level
// MAGNA-SIRGAS coordinate system for GPS
latitude: number
longitude: number
```

### Multi-Tenancy
```typescript
// EVERY database query must filter by companyId
const batches = await ctx.db
  .query('batches')
  .withIndex('by_company', q => q.eq('companyId', user.companyId))
  .collect();

// NEVER allow cross-company data access
```

### Compliance Fields
```typescript
// Include when relevant to module
icaRegistrationNumber?: string        // ICA chemical registration
invimaCertification?: string          // INVIMA cannabis license
phytosanitaryCertificate?: string    // Transport permits
regulatoryDocumentation?: object      // Flexible compliance JSON
```

---

## Success Metrics

### Context Efficiency
- **Active context**: <2000 tokens (80% reduction vs complex system)
- **Core docs**: 4 files (73% reduction: 4 vs 15+)
- **Planning docs**: 0 (PR-based archive eliminates separate planning files)
- **Context load time**: <5 seconds (on-demand loading)

### Development Velocity
- **Module planning**: <30 minutes (vs 2-4 hours in complex system)
- **Module implementation**: 1-3 days depending on complexity
- **PR creation**: <10 minutes (automated via @pr command)
- **Context switching**: <5 minutes (git checkout + @state current)

### Quality Indicators
- **Type safety**: 100% (TypeScript end-to-end, Convex auto-generates types)
- **Colombian compliance**: 100% (checked in @review command)
- **Multi-tenancy**: 100% (enforced in all database queries)
- **Test coverage**: Manual testing checklist in each PR

### Git Metrics
- **Commits per module**: 5-15 small, focused commits
- **PR description length**: 500-1000 words (comprehensive)
- **PR review time**: <1 hour (clear descriptions speed review)

---

## Example: Complete MODULE 1 Workflow

### Step 0: Check State
```
User: @state current

Claude:
**Current State:**
- Branch: main
- Active Module: None (project initialized)
- Database: Convex configured, no schema yet
- Auth: Not configured

**Next Steps:**
1. Implement MODULE 1: Authentication & Company Setup
2. Set up Clerk authentication
3. Create initial database schema (users, companies, roles)
4. Build registration flow

**Suggested Command:**
@implement module-1
```

### Step 1: Plan
```
User: @implement module-1

Claude:
Loading MODULE 1: Authentication & Company Setup...

**Context Loaded:**
✓ Product-Requirements.md → MODULE 1 specifications
  - User registration (email + password, OAuth)
  - Company registration with Colombian business types
  - Role assignment (COMPANY_OWNER for first user)
  - Multi-tenant isolation via Clerk Organizations

✓ Database-Schema.md → 3 tables needed
  - companies (businessEntityType, taxId, name, etc.)
  - roles (5 levels: OWNER, MANAGER, SUPERVISOR, WORKER, VIEWER)
  - users (email, name, companyId, roleId)

✓ Technical-Specification.md → Implementation patterns
  - Clerk setup with Organizations
  - Convex schema with row-level security
  - Spanish-first with next-intl

**Implementation Plan:**
1. Set up Clerk authentication (email/password + Google OAuth)
2. Create Convex schema (companies, roles, users tables)
3. Build registration form with Colombian business types
4. Implement multi-tenant isolation (Clerk Org → companyId)
5. Seed 5 default roles
6. Spanish UI with proper COP formatting

**Estimated Commits:** ~8-10
**Estimated Time:** 2-3 days

Ready to implement? (yes/no)
```

### Step 2: Implement
```
User: yes

Claude:
Implementing MODULE 1...

[Claude creates files and makes incremental commits]

Commit 1: feat(auth): initialize Clerk authentication
Commit 2: feat(schema): add companies table with Colombian fields
Commit 3: feat(schema): add roles table with 5 permission levels
Commit 4: feat(schema): add users table with multi-tenancy
Commit 5: feat(seed): add default Colombian roles
Commit 6: feat(ui): add registration form with next-intl (Spanish)
Commit 7: feat(ui): add Colombian business entity type selector
Commit 8: feat(auth): implement multi-tenant isolation via Clerk Orgs
Commit 9: test(auth): add manual test checklist for registration flow
Commit 10: docs(module-1): update CLAUDE.MD with MODULE 1 completion

✓ MODULE 1 implementation complete

**Test locally:**
npm run dev
Open http://localhost:3000/registro

**Test checklist:**
- [ ] Register new user with Colombian company
- [ ] Verify email/password login
- [ ] Test Google OAuth login
- [ ] Check multi-tenant isolation (create 2 companies)
- [ ] Verify Spanish UI
- [ ] Confirm COMPANY_OWNER role assigned

When testing is complete, request PR:
@pr create module-1
```

### Step 3: PR
```
User: @pr create module-1

Claude:
Reviewing MODULE 1 implementation...

✓ All features from Product-Requirements.md implemented
✓ Database schema matches Database-Schema.md
✓ Colombian requirements applied (Spanish, business types, NIT format)
✓ Multi-tenancy enforced (Clerk Org → companyId)
✓ Type safety verified (TypeScript + Zod validation)

**Creating PR...**

---

**PR Title:**
feat: implement MODULE 1 - Authentication & Company Setup

**PR Description:**

## Summary
- Clerk authentication with email/password + Google OAuth
- Company registration with 5 Colombian business entity types
- Multi-tenant isolation via Clerk Organizations = Companies
- Spanish-first UI with next-intl (COP formatting, timezone)
- 5-level role hierarchy (OWNER → VIEWER)

## Implementation Details

**Authentication:**
- Clerk SDK configured with Organizations feature
- Email/password + Google OAuth providers
- Clerk Organization ID mapped to Convex companyId
- Row-level security enforced in all queries

**Database Schema:**
Created 3 tables (see Database-Schema.md for full definitions):
- `companies` - Colombian business data (businessEntityType, taxId, DANE codes)
- `roles` - 5 permission levels (1000 = OWNER, 500 = MANAGER, 300 = SUPERVISOR, 100 = WORKER, 10 = VIEWER)
- `users` - Multi-tenant user data (companyId foreign key)

**UI Components:**
- Registration form (`/registro`) with Spanish labels
- Colombian business entity type selector (S.A.S, S.A., Ltda, E.U., Persona Natural)
- NIT validation pattern
- COP currency formatting ($290.000)

## Colombian Requirements
✓ Spanish locale (es) as default via next-intl
✓ 5 Colombian business entity types in company registration
✓ NIT format validation (XXX.XXX.XXX-X)
✓ COP currency with proper formatting (dot for thousands)
✓ Timezone: America/Bogota for all timestamps
✓ Multi-tenancy via Clerk Organizations

## Database Changes

**Tables Added:**
1. `companies` - 15 fields including Colombian-specific (businessEntityType, taxId, daneMunicipalityCode)
2. `roles` - 7 fields with hierarchical levels (1000 → 10)
3. `users` - 10 fields with companyId and roleId foreign keys

**Indexes Created:**
- companies: by_taxId (unique within Colombia)
- users: by_company, by_email (unique), by_clerk_id (unique)
- roles: by_company, by_name

**Seed Data:**
5 default roles created for each company:
- COMPANY_OWNER (level 1000)
- FACILITY_MANAGER (level 500)
- PRODUCTION_SUPERVISOR (level 300)
- WORKER (level 100)
- VIEWER (level 10)

## Testing

Manual test checklist:
- [x] User registration with Colombian company (S.A.S type, NIT validation)
- [x] Email verification flow
- [x] Login with email/password
- [x] Google OAuth login and account linking
- [x] Multi-tenant isolation verified (created 2 companies, data isolated)
- [x] Spanish UI confirmed (all labels in Spanish)
- [x] COMPANY_OWNER role auto-assigned to first user
- [x] COP formatting works ($290.000 format)

## Screenshots

(Add screenshots of registration flow, company creation, Spanish UI)

## Files Changed

**New Files:**
- `convex/schema.ts` - Database schema (companies, roles, users)
- `convex/companies.ts` - Company queries/mutations
- `convex/users.ts` - User queries/mutations
- `app/registro/page.tsx` - Registration page
- `components/auth/RegistrationForm.tsx` - Registration form with Colombian fields
- `lib/colombian-data.ts` - Business entity types, DANE codes
- `middleware.ts` - Clerk + i18n middleware
- `i18n.ts` - next-intl configuration (Spanish-first)

**Modified Files:**
- `package.json` - Added @clerk/nextjs, next-intl, convex
- `.env.local` - Added Clerk and Convex environment variables

## Performance
- Registration flow: <2s on 3G network
- Spanish locale loading: <100ms
- Multi-tenant query performance: <50ms (indexed)

## Security
- Row-level security enforced via companyId in all queries
- Clerk handles authentication security (MFA supported)
- Input validation with Zod schemas
- NIT format validation prevents invalid tax IDs

## Next Module

**MODULE 2: Email Verification**
- Email verification flow with Colombian Spanish templates
- Resend email functionality
- Account activation tracking

---

**Ready to push and create PR:**

```bash
git push origin feature/module-1
gh pr create --title "feat: implement MODULE 1 - Authentication & Company Setup" --body "<paste description above>"
```
```

### Step 4: Next Module
```
[After PR is merged]

User: @state current

Claude:
**Current State:**
- Branch: main
- Active Module: MODULE 1 ✓ (merged)
- Next Module: MODULE 2 - Email Verification

**Recent PRs:**
- #1: MODULE 1 - Authentication & Company Setup (merged)

**Next Steps:**
1. Implement MODULE 2: Email Verification
2. Configure email provider (Resend or SendGrid)
3. Create Spanish email templates
4. Build verification UI

**Suggested Command:**
@implement module-2
```

**Repeat this pattern for all 17 modules.**

---

## Comparison: Simplified vs Complex System

### Documentation Files
**Complex System (Archived):**
- Agentic-Development-System-Framework.md (3055 lines)
- BACKLOGS/ (4 template files: backend, frontend, epic, task)
- MODULE_PRDS/ (separate PRD per module)
- SUBAGENT_SPECS.md
- CONTEXT_INDEX.md
- GIT_WORKFLOW.md
- claude.md (with 20+ commands)
- Total: 15+ doc files, 8000+ lines

**Simplified System (Current):**
- Agentic-Dev-System-Simple.md (this file, ~600 lines)
- CLAUDE.MD (~200 lines)
- Product-Requirements.md (from PRDs)
- Technical-Specification.md (from Engineering PRD)
- Database-Schema.md (from schema v4.0)
- Total: 5 files, 2000 lines (75% reduction)

### Workflow Complexity
**Complex System:**
1. Load context via @context load (JIT loading system)
2. Plan using @plan module (loads 5+ doc files)
3. Create backlog tasks (Epic → Task breakdown)
4. Implement with subagent assignments
5. Update multiple tracking docs
6. Archive to implementation log
7. Create PR

**Simplified System:**
1. @implement module (loads relevant sections only)
2. Implement with incremental commits
3. @pr create module (PR archives everything)

### Active Context
**Complex System:** 8000+ tokens (multiple loaded docs)
**Simplified System:** 2000 tokens (on-demand loading)

**Reduction:** 75% fewer tokens in active context

### Archive Strategy
**Complex System:** Separate docs (IMPLEMENTATION_LOG, backlog tracking, context files)
**Simplified System:** Git commits + PR descriptions

**Benefit:** Single source of truth (git history), no doc maintenance

---

## Troubleshooting

### Issue: Module too complex to implement in one PR
**Solution:** Break into smaller features, create multiple PRs
```
MODULE 10 is large, split into:
- PR 1: Basic recipe creation
- PR 2: Phase and activity templates
- PR 3: Template cloning and versioning
```

### Issue: Database schema changes breaking existing features
**Solution:** Use Convex migrations, test thoroughly before PR
```
1. Update schema in feature branch
2. Test migration locally
3. Verify existing queries still work
4. Include migration notes in PR
```

### Issue: Colombian requirement unclear
**Solution:** Reference Product-Requirements.md compliance section
```
Example: INVIMA certification format
→ Check Product-Requirements.md MODULE 14 (Compliance)
→ Check Database-Schema.md → certificates table
→ invimaCertification field: string (certificate number format)
```

### Issue: Conflicting features between modules
**Solution:** Check module dependencies in Product-Requirements.md
```
MODULE 12 requires MODULE 9 and MODULE 10
Cannot implement production orders without inventory and templates
Follow implementation order: 1 → 8 → 9 → 10 → 12
```

---

## Quick Start

### For New Project
```bash
# 1. Check state
@state current

# 2. Implement first module
@implement module-1

# 3. Test locally
npm run dev

# 4. Create PR when complete
@pr create module-1

# 5. Repeat for modules 2-17
```

### For Existing Project
```bash
# 1. Check what's implemented
git log --oneline | grep "feat:"

# 2. Check current state
@state current

# 3. Implement next module
@implement module-X

# 4. Continue workflow
```

### For Reviewing Implementation
```bash
# 1. Review current work
@review

# 2. Check against requirements
# Compare implementation to:
# - Product-Requirements.md (features)
# - Technical-Specification.md (patterns)
# - Database-Schema.md (data model)

# 3. Fix issues and re-review
@review
```

---

## Summary

**This simplified system provides:**
- ✓ Single context engineering agent (CLAUDE.MD)
- ✓ 3 core requirement docs (Product, Technical, Database)
- ✓ PR-based archive (no separate planning docs)
- ✓ 3-step workflow (Plan → Implement → PR)
- ✓ 75% reduction in documentation overhead
- ✓ 75% reduction in active context (2000 vs 8000 tokens)
- ✓ Git history as living documentation

**No subagent complexity:**
- ✗ No frontend/backend subagents
- ✗ No JIT context loading system
- ✗ No separate backlog tracking
- ✗ No multi-phase workflows
- ✓ Just: Load context → Implement → PR

**Result:**
- Faster module implementation
- Clearer decision archive (PR history)
- Less cognitive overhead
- More time coding, less time documenting

**Ready to build Alquemist efficiently!** 🚀
