# Backlog Guide

*Templates and instructions for creating module backlogs*

**Purpose**: Guide Main Claude in creating focused, actionable backlogs for subagents

---

## 📋 Overview

Backlogs are task lists for @frontend and @backend subagents. They should be:

- **Focused**: Only tasks for this module
- **Actionable**: Clear "what to build" (not "how to build it")
- **Minimal**: Trust subagent expertise, avoid over-specification
- **Complete**: Include all requirements, acceptance criteria, integration points

---

## 🎯 Backlog Philosophy

### ✅ Good Backlog
- **Epic/Task structure** - Organized by epics with clear tasks
- Lists specific files to create
- Defines component/endpoint requirements clearly
- **References PRDs** for business rules (don't duplicate)
- Identifies integration points
- Includes acceptance criteria
- **Trusts agent intelligence** - Agent queries context files as needed
- Trusts subagent to implement details

### ❌ Bad Backlog
- Overly detailed implementation instructions
- Code snippets or pseudo-code
- Vague requirements ("make it look good")
- **Duplicates information from PRDs/schema** (redundant context)
- Missing acceptance criteria
- Micromanagement of subagent decisions
- Over-specification of business rules already in PRDs

---

## 📄 Templates

### Frontend Backlog Template

Location: `TEMPLATE-frontend-backlog.md`

Use this template when creating frontend backlogs for each module.

### Backend Backlog Template

Location: `TEMPLATE-backend-backlog.md`

Use this template when creating backend backlogs for each module.

---

## 🔄 Backlog Lifecycle

### 1. Creation (Main Claude + User)
During module planning, Main Claude creates backlogs based on:
- Module PRD requirements
- User input and clarifications
- Available components for reuse
- Integration points with backend/frontend

### 2. Assignment (Main Claude → Subagent)
Main Claude assigns backlog to subagent with structured context package (see `SUBAGENT_SPECS.md`)

### 3. Execution (Subagent)
Subagent works through backlog autonomously, using judgment for implementation details

### 4. Reporting (Subagent → Main Claude)
Subagent generates implementation report (1,000-2,000 tokens) with:
- Files created
- Components/endpoints built
- Integration points
- Testing status
- Next steps

### 5. Integration (Main Claude)
Main Claude reviews report, updates documentation, marks backlog complete

---

## 📊 Backlog Structure

### Required Sections

1. **Module Overview** - Brief context (1-2 paragraphs)
2. **Epics & Tasks** - Organized by epic with specific tasks
3. **Files to Create/Modify** - Expected file paths
4. **Integration Points** - How frontend/backend connect (API contracts)
5. **Acceptance Criteria** - Checklist for completion
6. **Context References** - Where agent should query for details (PRDs, schema, etc.)

### Optional Sections

- **Notes** - Special considerations, edge cases, out of scope items
- **Performance Targets** - Specific performance requirements (if not in PRDs)
- **Security Notes** - Auth, permissions (if module-specific, not general)

---

## 🎯 Context References Philosophy

**Key Principle**: Don't duplicate information - reference it!

### Agent Should Query These Files:
- **Product PRD** - Feature specifications, business rules, Colombian requirements
- **Engineering PRD** - Technical architecture, localization standards, performance targets
- **Database Schema** - Existing models, Colombian reference data (departments, municipalities, roles)
- **COMPONENT_INVENTORY** - Available components for reuse
- **Seed Files** - Realistic sample data for testing

### Backlog Should Reference, Not Duplicate:
- ✅ "Refer to Product PRD for NIT validation rules"
- ✅ "See Engineering PRD for Colombian localization standards"
- ✅ "Query schema.prisma for Department and Municipality models"
- ❌ Don't copy entire NIT validation algorithm into backlog
- ❌ Don't list all Colombian formatting rules (they're in PRDs)
- ❌ Don't excerpt database schema (agent can read it)

---

## 📝 Example Backlog (Condensed)

### MODULE 1: Authentication Frontend Backlog

**Module**: Authentication & Company Setup
**Subagent**: @frontend
**Priority**: Critical

#### Tasks

1. **Create Base UI Components**
   - Button with variants (primary/secondary/danger)
   - Input with error states
   - FormField with labels
   - Select dropdown

2. **Build Authentication Forms**
   - LoginForm (email, password)
   - RegisterForm (email, password, confirm password)
   - Spanish/English labels using next-intl

3. **Company Registration Wizard**
   - Step 1: Company info (name, NIT, business type)
   - Step 2: Colombian address (department, municipality)
   - Step 3: Contact information
   - Progress indicator
   - Form validation with Zod

#### Files to Create
- `apps/web/src/components/ui/Button.tsx`
- `apps/web/src/components/ui/Input.tsx`
- `apps/web/src/components/ui/FormField.tsx`
- `apps/web/src/components/auth/LoginForm.tsx`
- `apps/web/src/components/auth/RegisterForm.tsx`
- `apps/web/src/components/company/RegistrationWizard.tsx`
- `apps/web/src/lib/i18n/es.json` (Spanish translations)
- `apps/web/src/lib/i18n/en.json` (English translations)

#### Colombian Requirements
- NIT input with validation pattern
- Colombian department/municipality selectors (use DANE codes)
- COP currency display
- Colombian phone number format
- Business entity type selector (S.A.S, S.A., Ltda., E.U.)

#### Integration Points
Backend endpoints needed:
- POST /api/auth/login (email, password)
- POST /api/auth/register (user data)
- POST /api/companies (company registration)
- GET /api/auth/me (current user)

#### Acceptance Criteria
- [ ] User can login with email/password
- [ ] User can register new account
- [ ] Company registration wizard completes 3 steps
- [ ] Spanish/English switching works
- [ ] Colombian formatting correct (NIT, phone, address)
- [ ] Form validation working (Zod)
- [ ] Mobile responsive

---

## 🎨 Backlog Best Practices

### DO:
✅ **Use Epic/Task structure** for organization
✅ List specific components/files to create
✅ Define clear requirements per epic/task
✅ **Reference PRDs** for business rules ("See Product PRD section X")
✅ **Reference schema** for data models ("Query schema.prisma lines XX-YY")
✅ Identify backend integration points (API contracts)
✅ Include realistic acceptance criteria
✅ Trust agent to query context files as needed

### DON'T:
❌ Write code snippets or pseudo-code
❌ Over-specify implementation details
❌ **Duplicate PRD content** (Colombian rules, formatting, etc.)
❌ **Excerpt database schema** (agent can read it)
❌ **Copy sample data** from seed files (agent can query)
❌ Micromanage UI/UX design choices
❌ Create ambiguous tasks

---

## 📚 Resources

- **Subagent Specs**: `docs/SUBAGENT_SPECS.md`
- **Component Inventory**: `docs/COMPONENT_INVENTORY.md`
- **Project State**: `docs/PROJECT_STATE.md`
- **Product PRD**: Feature specifications
- **Engineering PRD**: Technical architecture

---

## 🔗 Templates

See template files in this directory:
- `TEMPLATE-frontend-backlog.md` - Frontend backlog template
- `TEMPLATE-backend-backlog.md` - Backend backlog template

Copy these templates when creating module backlogs.

---

**Last Updated**: January 2025
**Version**: 1.0
