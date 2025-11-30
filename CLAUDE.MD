# CLAUDE.MD - Alquemist Development Guide

**Alquemist - Next.js Frontend Development**
**Version**: 2.0
**Last Updated**: 2025-11-28

---

## Project Identity

**Alquemist** - Multi-region agricultural traceability SaaS platform for Cannabis, Coffee, Cocoa, and Flowers.

### Tech Stack

**Frontend (Primary):**
- **Next.js 15** with App Router and Turbopack
- **React 19** with Server Components
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TypeScript** strict mode

**Backend:**
- **Convex** serverless database and HTTP Actions
- **Deployment**: https://handsome-jay-388.convex.site
- **Auth**: Custom session tokens (30-day validity)
- **Email**: Resend integration

**Design Reference:**
- **Bubble.io** wireframes as visual guide and UX patterns
- Located in `docs/ui/bubble/PHASE-*.md`

**Core Requirements:**
- Multi-tenant (company-based isolation)
- Batch-first tracking (50-1000 plants per batch)
- Regulatory compliance (configurable by region)
- Mobile-first responsive design
- Real-time updates via Convex subscriptions

---

## Phased Development Methodology

### Overview

Alquemist Next.js frontend development follows a structured phase-by-phase approach that ensures quality, consistency, and maintainability.

### Development Workflow Per Phase

```
PHASE X DEVELOPMENT FLOW
========================

┌─────────────────────────────────────┐
│  BUBBLE REFERENCE (Input)           │
│  docs/ui/bubble/PHASE-X-*.md        │
│                                     │
│  • Visual design patterns           │
│  • Screen flows                     │
│  • UX interactions                  │
└──────────────┬──────────────────────┘
               │
               │ (Adapt to Next.js)
               ▼
┌─────────────────────────────────────┐
│  NEXT.JS WIREFRAMES (Output)        │
│  docs/ui/nextjs/PHASE-X-WIREFRAMES  │
│                                     │
│  • ASCII wireframes (desktop+mobile)│
│  • Component structure              │
│  • Data flow                        │
│  • Next.js patterns                 │
└──────────────┬──────────────────────┘
               │
               │ (Plan implementation)
               ▼
┌─────────────────────────────────────┐
│  IMPLEMENTATION PLAN (Output)       │
│  docs/dev-plans/PHASE-X-PLAN.md     │
│                                     │
│  • Module breakdown                 │
│  • Task dependencies                │
│  • Parallel streams                 │
│  • Testing strategy                 │
└──────────────┬──────────────────────┘
               │
               │ (Execute)
               ▼
┌─────────────────────────────────────┐
│  DEVELOPMENT                        │
│  app/(phase-x)/*                    │
│                                     │
│  • Implement pages                  │
│  • Create components                │
│  • Integrate backend                │
│  • Add tests                        │
└──────────────┬──────────────────────┘
               │
               │ (Validate)
               ▼
┌─────────────────────────────────────┐
│  TESTING & REVIEW                   │
│                                     │
│  • Unit tests                       │
│  • Integration tests                │
│  • E2E tests                        │
│  • Visual regression                │
└──────────────┬──────────────────────┘
               │
               │ (Complete)
               ▼
┌─────────────────────────────────────┐
│  PHASE COMPLETE → NEXT PHASE        │
└─────────────────────────────────────┘
```

### Phase Development Steps

#### Step 1: Wireframe Creation
- **Input**: Bubble wireframes from `docs/ui/bubble/PHASE-X-*.md`
- **Output**: Next.js wireframes in `docs/ui/nextjs/PHASE-X-WIREFRAMES.md`
- **Process**:
  1. Review Bubble phase documentation (visual reference)
  2. Adapt to Next.js patterns (App Router, Server Components)
  3. Create ASCII wireframes for desktop + mobile
  4. Document component structure and data flow
  5. Identify shared components needed

#### Step 2: Implementation Plan Creation
- **Input**: Next.js wireframes + phase requirements
- **Output**: Implementation plan in `docs/dev-plans/PHASE-X-DEVELOPMENT-PLAN.md`
- **Process**:
  1. Break down phase into modules
  2. Identify task dependencies
  3. Define parallel development streams
  4. Create detailed task checklists
  5. Document testing requirements
  6. Set success criteria

#### Step 3: Development
- **Input**: Wireframes + implementation plan
- **Output**: Working Next.js application for the phase
- **Process**:
  1. Set up shared components (if first phase)
  2. Implement pages following wireframes
  3. Integrate with Convex backend
  4. Add form validation (Zod + React Hook Form)
  5. Implement responsive design (Tailwind)
  6. Add loading/error states
  7. Unit + integration testing

#### Step 4: Review & Testing
- **Input**: Completed phase implementation
- **Output**: Tested, production-ready code
- **Process**:
  1. Unit tests (Jest + React Testing Library)
  2. Integration tests (API mocking with MSW)
  3. E2E tests (Playwright)
  4. Visual regression tests (Percy/Chromatic)
  5. Performance testing (Lighthouse)
  6. Accessibility audit (a11y)

#### Step 5: Next Phase Preparation
- **Process**:
  1. Document learnings and patterns
  2. Update shared component library
  3. Refactor if needed
  4. Begin next phase wireframes

---

## Reference Documentation

### Setup & Configuration

- **[FRONTEND-DESARROLLO-LOCAL.md](docs/setup-reference/FRONTEND-DESARROLLO-LOCAL.md)**
  - Next.js 15 setup instructions
  - Dependencies (Convex, Tailwind, shadcn/ui, Resend)
  - Development workflow
  - Common issues and solutions
  - Testing strategies

- **[FRONTEND-DESIGN-SYSTEM.md](docs/setup-reference/FRONTEND-DESIGN-SYSTEM.md)**
  - Color palette (based on Bubble reference images)
  - Typography (Inter font)
  - Component patterns (Sidebar, Header, Cards, Forms)
  - Spacing and grid system (4px base)
  - Responsive breakpoints
  - Accessibility standards (WCAG AA)

### Phase Documentation

#### Input: Bubble Reference (Visual Guide)

Located in `docs/ui/bubble/`:
- **PHASE-1-ONBOARDING.md** - Bubble onboarding UI
- **PHASE-2-BASIC-SETUP.md** - Bubble setup screens
- **PHASE-3-TEMPLATES.md** - Bubble template management
- **PHASE-4-PRODUCTION.md** - Bubble production workflows
- **PHASE-5-ADVANCED.md** - Bubble advanced features

**Usage**: Visual reference and UX patterns (NOT implementation)

#### Output: Next.js Implementation

**Wireframes:**
- `docs/ui/nextjs/PHASE-1-ONBOARDING-WIREFRAMES.md` ✅
- `docs/ui/nextjs/PHASE-2-WIREFRAMES.md` (to be created)
- `docs/ui/nextjs/PHASE-3-WIREFRAMES.md` (to be created)
- `docs/ui/nextjs/PHASE-4-WIREFRAMES.md` (to be created)
- `docs/ui/nextjs/PHASE-5-WIREFRAMES.md` (to be created)

**Implementation Plans:**
- `docs/dev-plans/PHASE-1-DEVELOPMENT-PLAN.md` ✅
- `docs/dev-plans/PHASE-2-DEVELOPMENT-PLAN.md` (to be created)
- `docs/dev-plans/PHASE-3-DEVELOPMENT-PLAN.md` (to be created)
- `docs/dev-plans/PHASE-4-DEVELOPMENT-PLAN.md` (to be created)
- `docs/dev-plans/PHASE-5-DEVELOPMENT-PLAN.md` (to be created)

### Backend API Reference

- **[docs/api/PHASE-1-ENDPOINTS.md](docs/api/PHASE-1-ENDPOINTS.md)** - Auth & onboarding
- **[docs/api/PHASE-2-ENDPOINTS.md](docs/api/PHASE-2-ENDPOINTS.md)** - Basic setup
- **[docs/api/PHASE-3-ENDPOINTS.md](docs/api/PHASE-3-ENDPOINTS.md)** - Templates
- **[docs/api/PHASE-4-ENDPOINTS.md](docs/api/PHASE-4-ENDPOINTS.md)** - Production
- **[docs/api/PHASE-5-ENDPOINTS.md](docs/api/PHASE-5-ENDPOINTS.md)** - Advanced

### Database Schema

- **[docs/database/SCHEMA.md](docs/database/SCHEMA.md)** - Single source of truth for all 26 tables

---

## Development Workflow

### Starting a New Phase

**Command**: `@phase-start <phase-number>`

**Process**:
1. Load Bubble reference: `docs/ui/bubble/PHASE-X-*.md`
2. Review existing wireframes (if any): `docs/ui/nextjs/PHASE-X-WIREFRAMES.md`
3. Review existing plan (if any): `docs/dev-plans/PHASE-X-DEVELOPMENT-PLAN.md`
4. Ask: "Create wireframes or start implementation?"

**Example**:
```
User: @phase-start 1

Claude:
Loading Phase 1 context...
✓ Bubble reference: docs/ui/bubble/PHASE-1-ONBOARDING.md
✓ Next.js wireframes: docs/ui/nextjs/PHASE-1-ONBOARDING-WIREFRAMES.md ✅
✓ Implementation plan: docs/dev-plans/PHASE-1-DEVELOPMENT-PLAN.md ✅

Phase 1 is ready to implement!

Options:
1. Review wireframes
2. Review implementation plan
3. Start development
4. Modify wireframes/plan

What would you like to do?
```

### Creating Wireframes

**Command**: `@wireframes create <phase-number>`

**Process**:
1. Read Bubble reference documentation
2. Adapt to Next.js patterns
3. Create ASCII wireframes (desktop + mobile)
4. Document component hierarchy
5. Save to `docs/ui/nextjs/PHASE-X-WIREFRAMES.md`

**Example**:
```
User: @wireframes create 2

Claude:
Creating Phase 2 wireframes...
✓ Reading: docs/ui/bubble/PHASE-2-BASIC-SETUP.md
✓ Analyzing screens (7 pages identified)
✓ Adapting to Next.js App Router patterns
✓ Creating wireframes...

Wireframes created:
- docs/ui/nextjs/PHASE-2-WIREFRAMES.md
  - Page 1: Dashboard Overview
  - Page 2: Areas Management
  - Page 3: Cultivars Setup
  - ... (7 total)

Next step: Create implementation plan
@plan create 2
```

### Creating Implementation Plan

**Command**: `@plan create <phase-number>`

**Process**:
1. Read wireframes for the phase
2. Break down into modules and tasks
3. Identify dependencies
4. Create parallel development streams
5. Define testing strategy
6. Save to `docs/dev-plans/PHASE-X-DEVELOPMENT-PLAN.md`

**Example**:
```
User: @plan create 2

Claude:
Creating Phase 2 implementation plan...
✓ Reading: docs/ui/nextjs/PHASE-2-WIREFRAMES.md
✓ Analyzing modules (3 modules, 15 tasks)
✓ Identifying dependencies
✓ Planning parallel streams (2 streams possible)
✓ Defining testing requirements

Plan created:
- docs/dev-plans/PHASE-2-DEVELOPMENT-PLAN.md
  - Module 1: Dashboard & Navigation (5 tasks)
  - Module 2: Areas Management (6 tasks)
  - Module 3: Master Data Setup (4 tasks)
  - Testing strategy defined
  - Success metrics defined

Next step: Start implementation
@implement phase-2
```

### Implementing a Phase

**Command**: `@implement phase-<number>` or `@implement <module>`

**Process**:
1. Load wireframes + implementation plan
2. Set up required dependencies
3. Create shared components
4. Implement pages/modules
5. Integrate with backend
6. Add tests
7. Track progress with TodoWrite

**Example**:
```
User: @implement phase-1

Claude:
Implementing Phase 1...
✓ Loading wireframes
✓ Loading implementation plan
✓ Installing dependencies

Creating todo list:
1. [ ] Set up shared components
2. [ ] Implement Signup Form (Page 1)
3. [ ] Implement Email Verification (Page 2)
... (11 total tasks)

Starting with shared components...
```

---

## Phase Status

### Phase 1: Onboarding & Authentication

- **Wireframes**: ✅ Complete (11 screens, 2 flows)
- **Implementation Plan**: ✅ Complete (6 modules, 50+ tasks)
- **Development Status**: 🔴 Not Started (ready to begin)
- **Testing**: ⚪ Pending

**Documentation:**
- Wireframes: [docs/ui/nextjs/PHASE-1-ONBOARDING-WIREFRAMES.md](docs/ui/nextjs/PHASE-1-ONBOARDING-WIREFRAMES.md)
- Plan: [docs/dev-plans/PHASE-1-DEVELOPMENT-PLAN.md](docs/dev-plans/PHASE-1-DEVELOPMENT-PLAN.md)
- Bubble Reference: [docs/ui/bubble/PHASE-1-ONBOARDING.md](docs/ui/bubble/PHASE-1-ONBOARDING.md)

**Scope:**
- First User Flow (7 screens): Signup → Email Verify → Company → Facility → Complete
- Invited User Flow (4 screens): Accept → Set Password → Welcome
- Login & Session Management

---

### Phase 2: Basic Operations Setup

- **Wireframes**: 🔴 Not Started
- **Implementation Plan**: 🔴 Not Started
- **Development Status**: ⚪ Blocked (needs wireframes)
- **Testing**: ⚪ Pending

**Bubble Reference:** [docs/ui/bubble/PHASE-2-BASIC-SETUP.md](docs/ui/bubble/PHASE-2-BASIC-SETUP.md)

**Planned Scope:**
- Dashboard home
- Areas management
- Cultivars setup
- Suppliers management
- User management & roles

---

### Phase 3: Templates Management

- **Wireframes**: 🔴 Not Started
- **Implementation Plan**: 🔴 Not Started
- **Development Status**: ⚪ Blocked (needs Phase 2)
- **Testing**: ⚪ Pending

**Bubble Reference:** [docs/ui/bubble/PHASE-3-TEMPLATES.md](docs/ui/bubble/PHASE-3-TEMPLATES.md)

**Planned Scope:**
- Production templates
- Quality check templates
- Template library

---

### Phase 4: Production Workflows

- **Wireframes**: 🔴 Not Started
- **Implementation Plan**: 🔴 Not Started
- **Development Status**: ⚪ Blocked (needs Phase 3)
- **Testing**: ⚪ Pending

**Bubble Reference:** [docs/ui/bubble/PHASE-4-PRODUCTION.md](docs/ui/bubble/PHASE-4-PRODUCTION.md)

**Planned Scope:**
- Batch creation & tracking
- Activity scheduling
- Quality checks
- Inventory management

---

### Phase 5: Advanced Features

- **Wireframes**: 🔴 Not Started
- **Implementation Plan**: 🔴 Not Started
- **Development Status**: ⚪ Blocked (needs Phase 4)
- **Testing**: ⚪ Pending

**Bubble Reference:** [docs/ui/bubble/PHASE-5-ADVANCED.md](docs/ui/bubble/PHASE-5-ADVANCED.md)

**Planned Scope:**
- Compliance & reporting
- Analytics & BI
- Integrations & APIs
- Mobile enhancements

---

## Development Principles

### 1. Bubble as Visual Reference, Not Implementation

- ✅ Use Bubble docs for UX patterns and screen flows
- ✅ Extract visual design elements (colors, spacing, layouts)
- ✅ Understand user workflows and interactions
- ❌ Don't copy Bubble implementation details
- ❌ Don't use Bubble-specific concepts (workflows, custom states)
- ✅ Adapt to Next.js patterns (Server Components, Server Actions, Route Handlers)

### 2. Phase-by-Phase Progression

- ✅ Complete wireframes before implementation
- ✅ Create detailed plan before coding
- ✅ One phase at a time (no jumping ahead)
- ✅ Document learnings for next phase
- ❌ Don't skip planning steps

### 3. Documentation-Driven Development

- ✅ Wireframes define UI structure (ASCII diagrams)
- ✅ Implementation plan defines execution (tasks, dependencies)
- ✅ Code follows documented patterns (design system)
- ✅ Tests validate requirements (unit, integration, E2E)

### 4. Iterative Refinement

- ✅ Review wireframes before finalizing
- ✅ Refine plan based on technical discoveries
- ✅ Refactor code between phases
- ✅ Update documentation as patterns emerge

---

## Backend Architecture

### Convex HTTP Actions

**Deployment URL:** https://handsome-jay-388.convex.site

**Core Modules:**
- `convex/auth.ts` - Custom session token authentication
- `convex/users.ts` - User management
- `convex/companies.ts` - Company CRUD with isolation
- `convex/facilities.ts` - Facility management
- `convex/batches.ts` - Batch tracking
- `convex/geographic.ts` - Countries, departments, municipalities

**Authentication Flow:**
1. User signs up → POST /api/v1/auth/register-step1
2. Email verification → POST /api/v1/auth/verify-email
3. Company setup → POST /api/v1/auth/register-step2
4. Login → POST /api/v1/auth/login (returns session_token)
5. All requests → Authorization: Bearer {session_token}

**Multi-Tenant Isolation:**
- Every record has `companyId`
- Session token includes `company_id`
- All queries filtered by company

**Email Service:**
- Resend integration for verification emails
- Password reset
- Notifications

---

## Setup Instructions

### Initial Setup (One-Time)

**1. Clone & Install**
```bash
git clone <repository-url>
cd alquemist
npm install
```

**2. Environment Variables**

Create `.env.local`:
```bash
# Convex (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Development
NODE_ENV=development
```

**3. Start Development Servers**

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Convex dev server (optional, for backend changes)
npx convex dev
```

**4. Access Application**
- Next.js App: http://localhost:3000
- Convex Dashboard: https://dashboard.convex.dev
- Convex API: https://handsome-jay-388.convex.site

### Development Commands

```bash
# Development
npm run dev              # Next.js dev server with Turbopack
npx convex dev          # Convex backend dev (if modifying backend)

# Building
npm run build           # Production build
npm run start           # Production server

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run type-check      # TypeScript check

# Testing
npm test                # Run tests (when configured)
```

---

## Testing Strategy

### Unit Testing
- **Tool**: Jest + React Testing Library
- **Coverage Target**: 80%+
- **Focus**: Component logic, hooks, utilities

### Integration Testing
- **Tool**: Jest + MSW (API mocking)
- **Coverage Target**: 70%+
- **Focus**: Form submissions, API integration

### E2E Testing
- **Tool**: Playwright
- **Coverage**: Critical user paths
- **Focus**: Complete workflows (signup → dashboard)

### Visual Regression
- **Tool**: Percy or Chromatic
- **Coverage**: All pages
- **Breakpoints**: Mobile (375px), Tablet (768px), Desktop (1280px)

---

## Example Session

```
User: @phase-start 1

Claude:
Loading Phase 1 context...
✓ Bubble reference: docs/ui/bubble/PHASE-1-ONBOARDING.md
✓ Next.js wireframes: docs/ui/nextjs/PHASE-1-ONBOARDING-WIREFRAMES.md ✅
✓ Implementation plan: docs/dev-plans/PHASE-1-DEVELOPMENT-PLAN.md ✅

Phase 1 is ready to implement!

Next steps:
1. Install Next.js 15 and dependencies
2. Set up design system (Tailwind + shadcn/ui)
3. Implement shared components
4. Build authentication flow

Start implementation? (@implement phase-1)

---

User: @implement phase-1

Claude:
Starting Phase 1 implementation...

Installing dependencies:
✓ Next.js 15
✓ React 19
✓ Tailwind CSS
✓ shadcn/ui
✓ React Hook Form + Zod
✓ Convex client

Creating shared components:
✓ PasswordInput (with strength indicator)
✓ PhoneInput (Colombian format)
✓ CodeInput (8-digit auto-advance)
✓ ProgressIndicator
✓ CountdownTimer

Implementing Signup Form (Page 1)...
[Creates /app/(auth)/signup/page.tsx]
✓ Form validation with Zod
✓ Email availability check
✓ Password strength indicator
✓ Server Action integration

Test at: http://localhost:3000/signup
```

---

## Success Criteria

**Per Phase:**
- ✅ Wireframes complete and reviewed
- ✅ Implementation plan detailed and approved
- ✅ All screens implemented per wireframes
- ✅ Backend integration working
- ✅ Unit tests passing (80%+ coverage)
- ✅ Integration tests passing
- ✅ E2E tests for critical paths
- ✅ Responsive on mobile, tablet, desktop
- ✅ Accessibility audit passed (WCAG AA)
- ✅ Performance benchmarks met (LCP < 2s)

**Project Complete:**
- ✅ All 5 phases implemented
- ✅ Production deployment successful
- ✅ User acceptance testing passed
- ✅ Monitoring and alerts configured

---

## Next Steps

**Ready to Start:**
1. Phase 1 wireframes and plan are complete
2. Run `@implement phase-1` to begin development
3. Follow the phased development workflow
4. Create Phase 2 wireframes when Phase 1 is done

**Commands Available:**
- `@phase-start 1` - Review Phase 1 status and options
- `@implement phase-1` - Start Phase 1 development
- `@wireframes create 2` - Create Phase 2 wireframes (after Phase 1)
- `@plan create 2` - Create Phase 2 plan (after wireframes)

---

**Document Owner**: Development Team
**Last Updated**: 2025-11-28
**Version**: 2.0 - Phased Next.js Development Methodology
