# Architecture Changelog - Alquemist

**Purpose**: Document major architectural decisions and module evolution from initial Product Requirements (PRD) to current implementation.

**Date**: 2025-11-21
**Status**: Living document

---

## Overview

The Alquemist platform has undergone significant architectural evolution from the initial Product Requirements Document (PRD v1.0, January 2025) to the current implementation reflected in the UI phase documentation. This changelog captures the rationale behind major changes, trade-offs made, and lessons learned.

---

## Evolution Summary

| Metric | PRD v1.0 (Initial) | Current Implementation | Change |
|--------|-------------------|----------------------|--------|
| **Total Modules** | 17 | 25 | +8 modules (+47%) |
| **Total Phases** | 3 | 5 | +2 phases (+67%) |
| **Onboarding Modules** | 8 | 4 | -4 modules (-50%) |
| **Module Numbering** | Sequential 1-17 | 1-4, 8, 15-29 | Conflicts resolved |

---

## Major Architectural Changes

### 1. ONBOARDING SIMPLIFICATION (Phase 1)

**Change**: Reduced onboarding from 8 modules to 4 modules

**PRD Vision**:
- Modules 1-8: Complete onboarding with sample data generation
- Auto-generate areas, cultivars, suppliers for immediate platform exploration
- Time to value: <15 minutes

**Current Implementation**:
- Modules 1-4: Minimal account/facility creation
- Master data (areas, cultivars, suppliers) moved to Phase 2 operational dashboard
- No sample data generation

**Rationale**:
1. **User Control**: Users prefer to configure their own data rather than cleaning up sample data
2. **Data Quality**: Auto-generated data created false expectations and required cleanup work
3. **Flexibility**: Different users have vastly different facility configurations
4. **Reduced Complexity**: Fewer decisions during critical signup flow reduces abandonment

**Trade-offs**:
- ✅ **Gained**: Cleaner onboarding, better data quality, more flexibility
- ❌ **Lost**: Instant platform exploration, faster time-to-value
- 📊 **Impact**: Time to value increased from <15 min to ~30-60 min

**Decision**: Accepted longer onboarding time in exchange for better data quality and user satisfaction

---

### 2. MASTER DATA CONSOLIDATION (Phase 2)

**Change**: Created dedicated "Master Data Setup" phase with 8 modules

**New Modules Added**:
- **Module 8**: Area Management (moved from onboarding)
- **Module 15**: Cultivar Management (moved from onboarding)
- **Module 16**: Supplier Management (moved from onboarding)
- **Module 17**: User Invitations & Team Management (new)
- **Module 18**: Facility Management & Switcher (new)
- **Module 19**: Inventory Management (renumbered from 9)
- **Module 20**: Facility Settings (new)
- **Module 21**: Account Settings (new)

**Rationale**:
1. **Logical Grouping**: All foundational data configuration in one phase
2. **Prerequisites**: Must configure areas, cultivars, and suppliers before production templates
3. **Multi-Facility Support**: Module 18 enables switching between facilities
4. **Team Collaboration**: Module 17 enables inviting team members with roles
5. **Separation of Concerns**: Settings split from creation (Modules 20-21)

**Impact**: Clear separation between "setup" and "operations" phases

---

### 3. TEMPLATE CONFIGURATION SEPARATION (Phase 3)

**Change**: Moved production templates from operations to dedicated phase

**Original PRD**:
- Phase 2: Core Operations (Modules 9-13)
  - Inventory (9), Templates (10), Quality (11), Operations (12), AI (13)

**Current Implementation**:
- Phase 2: Master Data Setup (Modules 8, 15-21)
- Phase 3: Templates (Modules 22-23)
- Phase 4: Production Execution (Modules 24-25)

**Rationale**:
1. **Workflow Sequence**: Configure templates BEFORE creating production orders
2. **One-Time vs Recurring**: Templates configured once, orders created continuously
3. **Role Separation**: Managers configure templates, workers execute orders
4. **Implementation Phases**: Enables incremental rollout

**Modules Affected**:
- Module 10 → Module 22: Production Templates
- Module 11 → Module 23: Quality Check Templates + AI
- Module 12 → Modules 24 & 25: Split into Orders and Execution

---

### 4. PRODUCTION OPERATIONS SPLIT (Phase 4)

**Change**: Split Production Orders & Operations (PRD Module 12) into two modules

**Original Design**:
- **Module 12**: Production Orders & Operations (monolithic)

**Current Design**:
- **Module 24**: Production Orders with Auto-Scheduling (order management)
- **Module 25**: Activity Execution with AI Detection (field work)

**Rationale**:
1. **User Roles**: Managers create orders, Workers execute activities
2. **Interface Separation**: Desktop order management vs mobile activity execution
3. **Complexity Management**: Each module ~500 lines (vs 1000+ lines combined)
4. **Code Organization**: Clearer API boundaries and responsibilities

**Benefits**:
- Better mobile experience for field workers
- Cleaner manager dashboard for order tracking
- Easier to implement and test independently

---

### 5. MODULE RENUMBERING (Conflict Resolution)

**Change**: Renumbered Phase 5 modules to resolve conflicts

**Problem Identified**:
- Modules 14-17 were numbered TWICE:
  - Phase 2: Cultivar Management (15), Supplier Management (16), User Invitations (17)
  - Phase 5: Compliance (14), Analytics (15), Mobile (16), Integrations (17)

**Solution Applied**:
- **Phase 5 renumbered**: 14→26, 15→27, 16→28, 17→29
- **Phase 2 kept original numbers**: 15, 16, 17

**Rationale for This Choice**:
1. **Less Disruption**: Phase 2 modules likely already implemented in backend
2. **Logical Flow**: Phase 5 comes last, so higher numbers make sense
3. **Future Growth**: Leaves room for modules 5-7, 9-14 if needed

**Alternative Considered**:
- Renumber Phase 2 instead (9-15 would avoid conflicts)
- **Rejected**: Would require more backend code changes

---

### 6. AI ENGINE DISTRIBUTION

**Change**: AI Engine as standalone module (PRD Module 13) → Distributed across features

**Original PRD Vision**:
- **Module 13**: Centralized AI Engine & Intelligent Services
  - Pest/disease detection (40+ regional species)
  - Plant health scoring (1-10 scale)
  - Multilingual OCR for form digitization
  - Harvest timing prediction
  - Treatment recommendations

**Current Implementation**:
- **Module 23**: AI-powered quality check template generation from photos/PDFs
- **Module 25**: Pest detection during activity execution with photos
- No standalone AI module

**Rationale**:
1. **User Context**: AI features used during specific workflows, not as standalone tool
2. **Implementation Reality**: AI as supporting service, not user-facing module
3. **Simpler Architecture**: AI integrated into existing workflows vs separate dashboard
4. **Cost Management**: Pay per API call instead of maintaining AI service

**Trade-offs**:
- ✅ **Gained**: Simpler user experience, lower infrastructure costs
- ❌ **Lost**: Centralized AI configuration, bulk photo analysis capability
- 📊 **Impact**: AI features still available but contextually embedded

---

### 7. QUALITY CHECK TEMPLATE SIMPLIFICATION

**Change**: Simplified approach to QC template generation

**Original PRD Vision** (Module 11):
- Upload photos/PDFs of quality forms
- AI generates digital form with manual field editing
- Complex form builder with conditional logic
- Regional pest database with 40+ species

**Current Implementation** (Module 23):
- Upload photos/PDFs of quality forms
- Gemini AI generates HTML directly
- If not perfect, regenerate (no manual editing)
- Pest detection during activity execution (Module 25)

**Rationale**:
1. **Faster Implementation**: Leverage Gemini's HTML generation vs building form editor
2. **User Experience**: "Regenerate until good" simpler than complex field editing
3. **Reduced Complexity**: No custom form builder needed
4. **Better Results**: AI context understanding better than field-by-field mapping

**Decision**: Accept "good enough" AI generation over perfect manual control

---

### 8. SUBSCRIPTION SYSTEM DEPRIORITIZATION

**Change**: Subscription & Payments (PRD Module 3) marked "Optional for MVP"

**Original PRD**:
- **Module 3**: Full payment system with regional payment methods
  - 4 plans: Trial, Starter, Professional, Enterprise
  - PSE, credit cards, Nequi, Bancolombia integration
  - Regional invoice generation with tax compliance
  - Usage tracking and enforcement

**Current Status**:
- Marked "Optional for MVP" in Phase 1 UI docs
- Everyone defaults to Trial plan
- No payment integration

**Rationale**:
1. **MVP Focus**: Prove product value before adding payment complexity
2. **Regional Complexity**: Payment methods vary significantly by region
3. **Implementation Time**: Payment integration requires significant effort
4. **Validation Phase**: Need user feedback before finalizing pricing/plans

**Future Plan**:
- Implement after MVP validation
- May start with simple Stripe integration before regional payment methods
- Consider usage-based pricing vs fixed tiers

---

### 9. SAMPLE DATA REMOVAL

**Change**: Removed automatic sample data generation (PRD Modules 7-8)

**Original PRD**:
- **Module 7**: Area Setup with Sample Data
  - Auto-generate cultivation areas for selected crops
  - Cannabis: Propagation, Vegetative, Flowering, Drying, Curing
  - Coffee: Nursery, Field sections, Processing, Drying, Storage
- **Module 8**: Cultivars & Suppliers Setup
  - Pre-configured regional cultivars per crop
  - Sample suppliers with local addresses
  - Initial inventory items for demos

**Rationale for Removal**:
1. **Data Accuracy**: Sample data rarely matched user's actual setup
2. **Cleanup Work**: Users spent time deleting/modifying sample data
3. **False Expectations**: Sample data suggested platform was pre-configured
4. **Regional Variation**: Impossible to create universally relevant samples
5. **User Feedback**: Testers preferred starting from scratch

**Alternative Considered**:
- Optional sample data wizard
- **Rejected**: Added complexity for minimal value

**Impact**:
- Longer initial setup time
- But higher quality operational data from day one

---

### 10. MULTI-FACILITY MANAGEMENT ADDITION

**Change**: Added dedicated Facility Management module

**New Module**:
- **Module 18**: Facility Management & Switcher
  - Global header facility switcher
  - Facilities management page (list all facilities)
  - Plan-based facility limits enforcement
  - Cross-facility comparison

**Rationale**:
1. **Real-World Need**: Medium+ customers operate multiple facilities
2. **Context Switching**: Users need easy way to switch between facilities
3. **Plan Enforcement**: Different plans allow different facility counts
4. **User Feedback**: Early testers requested this feature

**Not in Original PRD Because**:
- PRD assumed single facility per company
- Multi-facility complexity underestimated

**Lesson Learned**: Real-world operations are more complex than initial assumptions

---

## Removed Features

### Features Removed from PRD

| Feature | PRD Module | Reason for Removal | Alternative |
|---------|-----------|-------------------|-------------|
| Sample Data Generation | 7, 8 | Users preferred manual setup | Optional import templates (future) |
| Onboarding Cultivar Setup | 8 | Too early in user journey | Moved to Phase 2 operational setup |
| Onboarding Supplier Setup | 8 | Too early in user journey | Moved to Phase 2 operational setup |
| Payment System | 3 | MVP scope reduction | Default to Trial, implement post-MVP |
| Centralized AI Module | 13 | Implementation complexity | Distributed AI in workflows |
| Manual QC Form Editing | 11 | Time vs value trade-off | AI regeneration approach |

---

## Added Features

### Features Added Beyond PRD

| Feature | Module | Reason for Addition | Impact |
|---------|--------|-------------------|--------|
| User Invitations & Team Management | 17 | Collaboration requirement | Enables team workflows |
| Facility Switcher | 18 | Multi-facility support | Critical for growth customers |
| Facility Settings | 20 | Separation of concerns | Cleaner UX |
| Account Settings | 21 | User preferences | Better personalization |
| Activity Execution (separate) | 25 | Role separation | Better mobile experience |

---

## Phasing Strategy Evolution

### Original PRD Phasing (Product-Centric)

```
Phase 1: Onboarding (Modules 1-8)
  ↓ Get user into platform fast with sample data
Phase 2: Core Operations (Modules 9-13)
  ↓ Enable production workflow
Phase 3: Advanced Features (Modules 14-17)
  ↓ Add reporting, analytics, mobile, integrations
```

**Characteristics**:
- Feature-grouped phases
- Focus on getting users in fast
- Sample data for instant exploration

### Current Phasing (Implementation-Centric)

```
Phase 1: Onboarding (Modules 1-4)
  ↓ Minimal viable account creation
Phase 2: Master Data Setup (Modules 8, 15-21)
  ↓ Configure facility infrastructure
Phase 3: Templates (Modules 22-23)
  ↓ Define production workflows
Phase 4: Execution (Modules 24-25)
  ↓ Run operations, track work
Phase 5: Advanced (Modules 26-29)
  ↓ Reporting, compliance, integrations
```

**Characteristics**:
- Workflow-sequenced phases
- Logical prerequisites enforced
- Implementation-friendly boundaries

**Why This Works Better**:
1. **Clear Dependencies**: Each phase builds on previous phases
2. **Incremental Delivery**: Can release phase by phase
3. **Role Alignment**: Different phases serve different user roles
4. **Testing Strategy**: Can test phases independently

---

## Lessons Learned

### 1. User Research Beats Assumptions
- **Assumption**: Users want instant exploration with sample data
- **Reality**: Users want control and prefer manual configuration
- **Lesson**: Validate assumptions with real users early

### 2. Simplicity Wins Over Features
- **Assumption**: AI form editor with manual field editing needed
- **Reality**: "Regenerate until good" simpler and faster
- **Lesson**: Choose the simplest solution that solves the problem

### 3. Workflow Over Features
- **Assumption**: Group similar features together (Phase 2 operations)
- **Reality**: Workflow sequence matters more (Templates → Orders → Execution)
- **Lesson**: Design phases around user workflow, not feature similarity

### 4. Real Operations Are Complex
- **Assumption**: Single facility per company
- **Reality**: Medium+ customers operate multiple facilities
- **Lesson**: Talk to target users about real-world operations

### 5. MVP Means MVP
- **Assumption**: Need payment system for launch
- **Reality**: Can validate product value on Trial plan first
- **Lesson**: De-scope aggressively, validate first, build next

---

## Future Architectural Considerations

### Potential Changes Under Discussion

1. **Batch vs Individual Tracking**
   - **Status**: Not clearly specified in current UI docs
   - **PRD Emphasis**: "Batch-first" as core differentiator
   - **Decision Needed**: Default tracking level, compliance overrides

2. **Offline Mobile Capabilities**
   - **Status**: Mentioned in Phase 5 Module 28 but not fully specified
   - **PRD Detail**: PWA with IndexedDB queue, background sync
   - **Decision Needed**: Full offline specification and testing strategy

3. **Sample Data Optional Feature**
   - **Status**: Removed from onboarding
   - **Consideration**: Add back as optional wizard for new users?
   - **Decision Needed**: User research on value proposition

4. **Subscription System Implementation**
   - **Status**: Deprioritized for MVP
   - **Timeline**: Post-MVP validation
   - **Decision Needed**: Simple (Stripe) vs Regional (PSE, Nequi, etc.)

5. **Module Numbering Gaps (5-7, 9-14)**
   - **Status**: Numbers available for future use
   - **Consideration**: Reserve for specific purposes or renumber to sequential?
   - **Decision Needed**: Numbering convention going forward

---

## Implementation Status

### Next.js Frontend Implementation (2025-11-27)

**Change**: Parallel Next.js development track initialized alongside Bubble implementation

**Implementation Details**:
- **Framework**: Next.js 15 with App Router, React 19, Turbopack
- **Backend**: Convex (https://handsome-jay-388.convex.site) - already implemented
- **Email Service**: Resend (replacing Bubble native email)
- **Styling**: Tailwind CSS v4 with Alquemist color palette
- **Components**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React (NO emojis in production)
- **i18n**: use-intl (Spanish/English)
- **PWA**: next-pwa (configured for production)

**Rationale**:
1. **Local Development**: Enable full-stack local development with code control
2. **PWA Capabilities**: Native app experience with offline support
3. **Performance**: Next.js 15 + Turbopack for optimal performance
4. **Scalability**: Modern stack designed for growth
5. **Type Safety**: Full TypeScript throughout
6. **Backend Reuse**: Leverage existing Convex backend (no duplication)

**Current Status**:
- ✅ Project structure created
- ✅ Dependencies installed (652 packages)
- ✅ Tailwind CSS v4 configured with brand colors (#1B5E20, #FFC107)
- ✅ Environment variables configured
- ✅ Convex client provider setup
- ✅ Resend email service integration
- ✅ shadcn/ui base components installed (Button, Card, Input, Label, Form)
- ✅ Route structure created for Phase 1 screens:
  - `/signup` - User registration
  - `/login` - User login
  - `/verify-email` - Email verification
  - `/company-setup` - Company creation
  - `/dashboard` - Main dashboard (Phase 2)
- ✅ Development server tested and working (port 3002)

**Wireframes Documentation**:
- Created `/docs/ui/nextjs/` folder structure
- Complete Phase 1 wireframes (11 screens) with ASCII art
- Desktop (~73 chars) and Mobile (~32 chars) versions
- Technical implementation notes included

**Next Steps**:
1. Implement Phase 1 screens from wireframes
2. Integrate Convex mutations for auth and onboarding
3. Implement form validation with Zod
4. Test email flows end-to-end with Resend
5. Create Phase 2 wireframes

**Parallel Development Strategy**:
- Bubble: Production UI for immediate deployment
- Next.js: Long-term scalable solution with local development
- Backend: Single Convex backend serves both frontends
- Migration: Gradual transition as Next.js features reach parity

**Files Created**:
- `/package.json` - Dependencies and scripts
- `/tsconfig.json` - TypeScript configuration
- `/next.config.ts` - Next.js configuration
- `/tailwind.config.ts` - Tailwind CSS v4 with Alquemist colors
- `/components.json` - shadcn/ui configuration
- `/eslint.config.mjs` - ESLint rules
- `/app/layout.tsx` - Root layout with providers
- `/app/page.tsx` - Landing page
- `/app/globals.css` - Global styles
- `/lib/utils.ts` - Utility functions
- `/lib/email.ts` - Resend email service
- `/providers/ConvexClientProvider.tsx` - Convex React provider

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-21 | Architecture Team | Initial changelog documenting PRD evolution |
| 1.1 | 2025-11-27 | Development Team | Next.js 15 frontend implementation initialized |

---

## Related Documents

- [Product Requirements v1.0](core/Product-Requirements.md) - Original vision (archived)
- [Module Inventory](MODULE-INVENTORY.md) - Current module listing
- [Module Migration Guide](MODULE-MIGRATION-GUIDE.md) - PRD → UI mapping
- [Phase 1 UI Docs](ui/bubble/PHASE-1-ONBOARDING.md)
- [Phase 2 UI Docs](ui/bubble/PHASE-2-BASIC-SETUP.md)
- [Phase 3 UI Docs](ui/bubble/PHASE-3-TEMPLATES.md)
- [Phase 4 UI Docs](ui/bubble/PHASE-4-PRODUCTION.md)
- [Phase 5 UI Docs](ui/bubble/PHASE-5-ADVANCED.md)

---

**Maintained By**: Architecture Team
**Last Updated**: 2025-11-21
**Next Review**: After each major architectural decision
