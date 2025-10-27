# UI Requirements Planning Guide - Alquemist

**Status**: Planning document for context recovery and navigation
**Last Updated**: 2025-10-27
**Purpose**: Lightweight wireframe-level UI specs per module, no code or design systems

---

## Quick Navigation

This document helps you navigate the UI requirements across all 17 modules organized in 3 phases:

- **[PHASE 1: ONBOARDING](#phase-1-onboarding)** → `docs/ui/PHASE-1-ONBOARDING.md`
- **[PHASE 2: OPERATIONS](#phase-2-operations)** → `docs/ui/PHASE-2-OPERATIONS.md`
- **[PHASE 3: ADVANCED](#phase-3-advanced)** → `docs/ui/PHASE-3-ADVANCED.md`

---

## How to Use These Documents

### **For Context Recovery**
When returning after context compaction:
1. **First** → Read this file (3-5 min) to remember overall structure
2. **Then** → Open relevant phase file for specific module
3. **Finally** → Start developing/designing

### **For Development**
Open the corresponding phase file while building in Bubble:
- Reference page layouts and flows
- Check which database tables map to each page
- Verify what data needs to be captured
- Keep tab open for quick navigation between modules

### **File Size Targets**
- Plan file: ~2-3 KB (this document)
- Phase 1: ~8-10 KB (sequential onboarding flow)
- Phase 2: ~12-15 KB (production workflows)
- Phase 3: ~8-10 KB (analytics and advanced)
- **Total**: ~30-40 KB (vs. 200+ KB of detailed specs)

---

## PHASE 1: ONBOARDING

**Goal**: User goes from 0 → fully configured company ready to produce
**Flow**: Sequential wizard-style progression
**Duration**: User completes in 1-2 sessions
**User Roles**: COMPANY_OWNER (primary)

### Modules Overview

| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 1 | **Authentication & Account Creation** | User signup with email/password + regional business entity selection | ✅ COMPLETE |
| 2 | **Email Verification** | Email confirmation with 24h token + resend capability | ✅ COMPLETE |
| 3 | **Subscription & Payments** | Plan selection (Trial, Starter, Professional, Enterprise) | 🏗️ IN DESIGN |
| 4 | **Company Profile** | Business details, licenses, tax info | 🏗️ IN DESIGN |
| 5 | **Facility Creation** | Licensed cultivation site setup | 🏗️ IN DESIGN |
| 6 | **Crop Types** | Select which crops to grow (Cannabis, Coffee, Cocoa, Flowers) | 🏗️ IN DESIGN |
| 7 | **Area Setup** | Define cultivation zones (propagation, veg, flowering, drying) | 🏗️ IN DESIGN |
| 8 | **Cultivars & Suppliers** | Select crop varieties and input suppliers | 🏗️ IN DESIGN |

**Total Pages in Phase 1**: ~12-15 screens
**Database Tables Involved**: companies, users, emailVerificationTokens, geographic_locations, facilities, areas, crop_types, cultivars, suppliers

---

## PHASE 2: OPERATIONS

**Goal**: Day-to-day production management and tracking
**Flow**: Dashboard-driven with multiple workflows running in parallel
**Duration**: Continuous use (daily)
**User Roles**: FACILITY_MANAGER, PRODUCTION_SUPERVISOR, WORKER

### Modules Overview

| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 9 | **Inventory Management** | Supply tracking, consumption logs, reordering | 🎯 NEXT |
| 10 | **Production Templates** | Create reusable workflows (phase-based) | 🎯 NEXT |
| 11 | **Quality Check Templates** | Define QC procedures with AI pest detection | 🎯 NEXT |
| 12 | **Production Orders & Operations** | Batch-first production tracking (50-1000 plants/batch) | 🎯 NEXT |
| 13 | **AI Engine & Intelligent Services** | Automated recommendations and insights | 🎯 NEXT |

**Total Pages in Phase 2**: ~20-25 screens
**Database Tables Involved**: inventory_items, recipes, production_templates, template_phases, template_activities, quality_check_templates, production_orders, batches, scheduled_activities, activities

---

## PHASE 3: ADVANCED

**Goal**: Reporting, compliance, and cross-platform experience
**Flow**: Analytics-heavy with specialized workflows
**Duration**: As-needed and periodic
**User Roles**: COMPANY_OWNER, FACILITY_MANAGER, VIEWER

### Modules Overview

| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 14 | **Compliance & Reporting** | Regulatory tracking, event logs, certifications | 📋 FUTURE |
| 15 | **Analytics & Business Intelligence** | Dashboards, KPIs, trend analysis | 📋 FUTURE |
| 16 | **Mobile Experience & Media** | PWA optimization, photo/document storage | 📋 FUTURE |
| 17 | **Integrations & APIs** | Third-party connections | 📋 FUTURE |

**Total Pages in Phase 3**: ~15-20 screens
**Database Tables Involved**: compliance_events, certificates, media_files, pest_disease_records, pest_diseases

---

## Key Design Principles

### **1. Database-Driven**
Every page maps directly to one or more tables in `convex/schema.ts`. If you're building a form, cross-check the fields with the database schema to ensure alignment.

### **2. MVP-First**
Each phase file marks features as:
- 🔴 **Required**: MVP cannot ship without this
- 🟡 **Important**: Should have, but could defer
- 🟢 **Nice-to-Have**: Future enhancement

### **3. Role-Based Access**
Different user roles see different pages/features:
- **COMPANY_OWNER**: Setup, billing, team management, reports
- **FACILITY_MANAGER**: Facility ops, staff, inventory
- **PRODUCTION_SUPERVISOR**: Daily workflows, QC checks
- **WORKER**: Simple task lists and data entry
- **VIEWER**: Read-only dashboards

### **4. Batch-Centric Thinking**
All production flows assume batch-first approach:
- Batches = 50-1000 plants grouped together
- Individual plant tracking = optional (regulatory requirement-dependent)
- Batch-level operations > plant-level details for MVP

### **5. Spanish-First UI**
- All user-facing copy in Spanish
- Technical data/API labels in English
- Regional context: Colombia (departments, municipalities, DANE codes)

---

## Technical Context

### **Frontend: Bubble (Primary)**
- All UI built in Bubble
- Direct HTTP integration with Convex backend
- 7 API endpoints configured (registration, email verification, geographic lookups)
- PWA-capable for mobile access

### **Backend: Convex**
- 26 tables total
- Multi-tenant by design (company_id everywhere)
- Role-based functions (can only query/modify own company data)
- Complete audit trail via activities table

### **Database Mapping**
Each page spec shows which tables it touches:
```
Page Name
├── Read: [table1, table2]
├── Write: [table3]
└── Related: [table4]
```

---

## Document Structure

```
docs/
├── UI-REQUIREMENTS-PLAN.md          ← You are here
├── ui/
│   ├── PHASE-1-ONBOARDING.md        ← Modules 1-8
│   ├── PHASE-2-OPERATIONS.md        ← Modules 9-13
│   └── PHASE-3-ADVANCED.md          ← Modules 14-17
```

Each phase file contains:
- Module-by-module breakdown
- Page lists with simple wireframe descriptions
- ASCII flow diagrams (minimal)
- Input/output summary
- Database table mappings
- Navigation notes

---

## Current Status

### Completed ✅
- Module 1: User registration (backend + Bubble frontend)
- Module 2: Email verification (backend + Bubble frontend)
- Backend for all 26 tables defined
- 7 HTTP endpoints tested

### In Progress 🏗️
- Module 3-8 UI specs (this document set)
- Bubble integration testing

### Next Phase 🎯
- Modules 9-13 implementation
- Production templates and batch management
- AI quality check integration

### Future 📋
- Modules 14-17 (advanced features)
- Mobile PWA optimization
- Third-party integrations

---

## Quick Facts

| Aspect | Detail |
|--------|--------|
| **Total Modules** | 17 (across 3 phases) |
| **Estimated Total Pages** | 50-65 screens |
| **Primary User Roles** | 5 (OWNER, MANAGER, SUPERVISOR, WORKER, VIEWER) |
| **Database Tables** | 26 |
| **Languages** | Spanish (primary) + English (system) |
| **Target Region** | Colombia (extensible to others) |
| **MVP Scope** | Modules 1-8 (Onboarding) complete, Modules 9-13 next |
| **Frontend Framework** | Bubble (100% of UI) |
| **Backend** | Convex (serverless database + functions) |

---

## Notes for Designers & Developers

### **When Building in Bubble**
1. Open the relevant phase file
2. Find the module you're working on
3. Check "Pages" section for layout descriptions
4. Verify database mappings match schema.ts
5. Reference "Main Inputs/Outputs" to ensure correct data flow
6. Check "Special Notes" for any gotchas

### **Adding New Modules Later**
1. Create a new module section in relevant phase file
2. Follow the same template structure
3. Update the overview tables
4. Add database mappings
5. Link to this plan document from new files

### **Keeping Docs Fresh**
- Update status (✅ complete, 🏗️ in progress, 🎯 next, 📋 future)
- Add notes during development (e.g., "This page has 2 optional flows")
- Link to Bubble designs as they're created
- Keep phase files under 15 KB each

---

## How Phase Files Work

Each phase file (PHASE-1, PHASE-2, PHASE-3) contains identical structure:

```
# PHASE X: [Title]

## Overview
- Duration and user flow
- Total pages estimate
- Key workflows

## Module X: [Name]
### Purpose
[1-2 sentence description]

### Pages
[Simple list with wireframe descriptions]

### Key Data Flow
[What gets captured, what gets saved]

### Database Tables
- Read: [tables]
- Write: [tables]

### Notes
[Any special UX considerations]
```

Simple, scannable, light enough to keep in tab while building.

---

**Last Updated**: 2025-10-27
**Next Review**: After Module 3 UI design starts
