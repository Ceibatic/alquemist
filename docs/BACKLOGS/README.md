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
- Lists specific files to create
- Defines component requirements clearly
- Specifies Colombian-specific logic
- Identifies integration points
- Includes acceptance criteria
- Trusts subagent to implement details

### ❌ Bad Backlog
- Overly detailed implementation instructions
- Code snippets or pseudo-code
- Vague requirements ("make it look good")
- Missing Colombian context
- No acceptance criteria
- Micromanagement of subagent decisions

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

1. **Module Overview** - Brief context
2. **Tasks** - Specific items to complete
3. **Files to Create/Modify** - Expected file paths
4. **Colombian Requirements** - Localization, compliance, business rules
5. **Integration Points** - How frontend/backend connect
6. **Acceptance Criteria** - How to know it's done
7. **Resources** - Available components, patterns, references

### Optional Sections

- **Colombian Sample Data** - Test data with realistic Colombian values
- **Performance Targets** - Specific performance requirements
- **Security Notes** - Auth, permissions, data protection
- **Future Enhancements** - Out of scope but documented for later

---

## 🇨🇴 Colombian Context Checklist

Every backlog should address:

### Frontend
- [ ] Spanish labels (primary)
- [ ] English labels (secondary)
- [ ] Colombian date format (DD/MM/YYYY)
- [ ] COP currency format ($1.000.000)
- [ ] Colombian phone format (+57 XXX XXX XXXX)
- [ ] Colombian address fields (Departamento, Municipio)
- [ ] Colombian color scheme (green primary: #00A859)

### Backend
- [ ] COP currency (no decimals)
- [ ] America/Bogota timezone
- [ ] NIT validation (Colombian tax ID)
- [ ] IVA calculation (19%)
- [ ] DANE municipality codes
- [ ] Colombian business entity types (S.A.S, S.A., Ltda., E.U.)
- [ ] INVIMA/ICA compliance (when applicable)

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
✅ List specific components/files to create
✅ Define clear requirements per component
✅ Specify Colombian-specific logic
✅ Identify backend integration points
✅ Include realistic acceptance criteria
✅ Provide Colombian sample data for testing
✅ Reference available components for reuse

### DON'T:
❌ Write code snippets or pseudo-code
❌ Over-specify implementation details
❌ Include full API specifications (link to PRD instead)
❌ Micromanage UI design choices
❌ Duplicate information from PRD
❌ Ignore Colombian context
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
