# Module Migration Guide - PRD to UI Documentation

**Purpose**: Quick reference for mapping original Product Requirements Document (PRD) modules to current UI phase documentation.

**Date**: 2025-11-21
**Target Audience**: Developers, Product Managers, Technical Writers

---

## Quick Reference Table

| PRD Module | PRD Name | UI Module | UI Phase | UI Name | Change Type |
|-----------|----------|-----------|----------|---------|-------------|
| 1 | Authentication & Account Creation | 1 | 1 | Authentication & Account Creation | ✅ Same |
| 2 | Email Verification | 2 | 1 | Email Verification | ✅ Same |
| 3 | Subscription & Payments | 2 (optional) | 1 | Subscription Selection | ⚠️ Deprioritized |
| 4 | Company Profile Completion | 3 | 1 | Company Setup | ✅ Simplified |
| 5 | Facility Creation | 3 | 1 | Facility Creation | 🔀 Merged with 6 |
| 6 | Crop Type Selection | 3 | 1 | Facility Creation | 🔀 Merged into 5 |
| 7 | Area Setup with Sample Data | - | - | - | ❌ Removed |
| 8 | Cultivars & Suppliers Setup | - | - | - | ❌ Removed |
| - | - | 8 | 2 | Area Management | ✨ New (from PRD 7) |
| 9 | Inventory Management | 19 | 2 | Inventory Management | 🔢 Renumbered |
| 10 | Production Templates | 22 | 3 | Production Templates | 🔢 Renumbered |
| 11 | Quality Check Templates + AI | 23 | 3 | Quality Check Templates + AI | 🔢 Renumbered + Simplified |
| 12 | Production Orders & Operations | 24, 25 | 4 | Orders + Activity Execution | ✂️ Split |
| 13 | AI Engine & Intelligent Services | - | - | - | 🔀 Distributed |
| 14 | Compliance & Reporting | 26 | 5 | Compliance & Reporting | 🔢 Renumbered (was 14) |
| 15 | Analytics & Business Intelligence | 27 | 5 | Analytics & BI | 🔢 Renumbered (was 15) |
| 16 | Mobile Experience & Media | 28 | 5 | Mobile Experience | 🔢 Renumbered (was 16) |
| 17 | Integrations & APIs | 29 | 5 | Integrations & APIs | 🔢 Renumbered (was 17) |
| - | - | 15 | 2 | Cultivar Management | ✨ New (from PRD 8) |
| - | - | 16 | 2 | Supplier Management | ✨ New (from PRD 8) |
| - | - | 17 | 2 | User Invitations | ✨ New |
| - | - | 18 | 2 | Facility Management | ✨ New |
| - | - | 20 | 2 | Facility Settings | ✨ New |
| - | - | 21 | 2 | Account Settings | ✨ New |

**Legend:**
- ✅ Same - No significant changes
- 🔢 Renumbered - Same content, different module number
- 🔀 Merged - Combined with another module
- ✂️ Split - Divided into multiple modules
- ✨ New - Added in UI docs, not in PRD
- ❌ Removed - Feature removed or significantly changed
- ⚠️ Deprioritized - Marked optional or postponed

---

## Detailed Migration Paths

### PHASE 1: ONBOARDING

#### PRD Module 1 → UI Module 1 ✅
**Status**: Same structure, minor simplifications
**File**: [ui/bubble/PHASE-1-ONBOARDING.md](ui/bubble/PHASE-1-ONBOARDING.md)
**Changes**: None significant
**Action**: Use Module 1 as-is

#### PRD Module 2 → UI Module 2 ✅
**Status**: Email verification unchanged
**File**: [ui/bubble/PHASE-1-ONBOARDING.md](ui/bubble/PHASE-1-ONBOARDING.md)
**Changes**: None
**Action**: Use Module 2 as-is

#### PRD Module 3 → UI Module 2 (Optional) ⚠️
**Status**: Subscription system deprioritized for MVP
**File**: [ui/bubble/PHASE-1-ONBOARDING.md](ui/bubble/PHASE-1-ONBOARDING.md)
**Changes**:
- Marked "Optional for MVP"
- Everyone defaults to Trial plan
- Payment integration postponed
**Action**: Skip for MVP, implement post-validation

#### PRD Module 4 → UI Module 3 ✅
**Status**: Company profile moved into onboarding
**File**: [ui/bubble/PHASE-1-ONBOARDING.md](ui/bubble/PHASE-1-ONBOARDING.md)
**Changes**: Simplified from post-onboarding to during-onboarding
**Action**: Use Module 3 company setup page

#### PRD Modules 5 + 6 → UI Module 3 🔀
**Status**: Facility creation and crop selection merged
**File**: [ui/bubble/PHASE-1-ONBOARDING.md](ui/bubble/PHASE-1-ONBOARDING.md)
**Changes**:
- Crop type selection integrated into facility creation (checkboxes)
- Two pages: Facility Basic Info + Facility Location
**Action**: Use Module 3, crop selection on first page

#### PRD Module 7 → REMOVED ❌
**Status**: Area setup with sample data removed from onboarding
**Moved To**: UI Module 8 (Phase 2) - Manual area management
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Changes**:
- No automatic sample data generation
- Users manually create areas in operational dashboard
- Full CRUD interface instead of wizard
**Action**: Use Module 8 for area management

#### PRD Module 8 → SPLIT into UI Modules 15 & 16 ✂️
**Status**: Cultivars & suppliers split from onboarding into Phase 2
**Moved To**:
- UI Module 15 (Cultivar Management)
- UI Module 16 (Supplier Management)
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Changes**:
- No sample data pre-loading
- Full CRUD for both cultivars and suppliers
- System cultivars vs facility-specific cultivars (Module 15)
**Action**:
- Use Module 15 for cultivar management
- Use Module 16 for supplier management

---

### PHASE 2: MASTER DATA SETUP

#### PRD Module 9 → UI Module 19 🔢
**Status**: Inventory management renumbered
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Changes**: Module number only (9 → 19)
**Reason**: Make room for new modules 15-18
**Action**: Use Module 19 for all inventory features

#### NEW: UI Module 8 (Area Management) ✨
**Status**: New module in Phase 2 (moved from onboarding)
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Original**: PRD Module 7 (Area Setup)
**Changes**:
- Full CRUD instead of wizard
- No sample data generation
- Environmental specs configuration
**Action**: Implement as first Phase 2 module

#### NEW: UI Module 15 (Cultivar Management) ✨
**Status**: New module in Phase 2
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Original**: Part of PRD Module 8
**Changes**:
- System cultivars vs custom cultivars
- Link system cultivars to facility
- Create custom cultivars with profiles
**Action**: Implement with system + custom approach

#### NEW: UI Module 16 (Supplier Management) ✨
**Status**: New module in Phase 2
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Original**: Part of PRD Module 8
**Changes**:
- Standard CRUD operations
- Product categories
- Contact management
**Action**: Implement as standalone supplier module

#### NEW: UI Module 17 (User Invitations) ✨
**Status**: Completely new feature
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Original**: Not in PRD
**Changes**:
- Email-based invitations
- Role management (ADMIN, FACILITY_MANAGER, SUPERVISOR, WORKER, QC)
- Invitation status tracking
**Action**: Implement new team management feature

#### NEW: UI Module 18 (Facility Management) ✨
**Status**: Completely new feature for multi-facility support
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Original**: Not in PRD
**Changes**:
- Global facility switcher in header
- Facilities list management
- Plan-based facility limits
**Action**: Implement multi-facility support

#### NEW: UI Module 20 (Facility Settings) ✨
**Status**: Settings separated from facility creation
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Original**: Part of PRD Module 5
**Changes**:
- Dedicated settings page
- Environmental defaults
- License management
**Action**: Implement separate settings interface

#### NEW: UI Module 21 (Account Settings) ✨
**Status**: User preferences and company settings
**File**: [ui/bubble/PHASE-2-BASIC-SETUP.md](ui/bubble/PHASE-2-BASIC-SETUP.md)
**Original**: Part of PRD Module 4
**Changes**:
- User preferences (language, timezone, units)
- Notification settings
- Security settings (password, 2FA)
**Action**: Implement user settings page

---

### PHASE 3: TEMPLATES

#### PRD Module 10 → UI Module 22 🔢
**Status**: Production templates moved to dedicated phase
**File**: [ui/bubble/PHASE-3-TEMPLATES.md](ui/bubble/PHASE-3-TEMPLATES.md)
**Changes**:
- Module number: 10 → 22
- Moved from Phase 2 to Phase 3
- Content remains similar
**Action**: Use Module 22 for production templates

#### PRD Module 11 → UI Module 23 🔢
**Status**: Quality check templates simplified
**File**: [ui/bubble/PHASE-3-TEMPLATES.md](ui/bubble/PHASE-3-TEMPLATES.md)
**Changes**:
- Module number: 11 → 23
- Simplified AI approach: Gemini generates HTML directly
- No manual field editing (regenerate instead)
- Moved from Phase 2 to Phase 3
**Action**: Use Module 23 with simplified AI generation

---

### PHASE 4: PRODUCTION EXECUTION

#### PRD Module 12 → UI Modules 24 & 25 ✂️
**Status**: Production operations split into two modules
**Files**: [ui/bubble/PHASE-4-PRODUCTION.md](ui/bubble/PHASE-4-PRODUCTION.md)
**Changes**:
- **Module 24**: Production Orders with Auto-Scheduling
  - Order creation and management
  - Manager-focused interface
  - Desktop-optimized
- **Module 25**: Activity Execution with AI Detection
  - Field work execution
  - Worker-focused interface
  - Mobile-optimized with offline support
  - Pest detection during execution
**Action**:
- Implement Module 24 for order management
- Implement Module 25 for field execution

#### PRD Module 13 → DISTRIBUTED ❌
**Status**: AI Engine distributed across features
**Where Now**:
- **Module 23**: AI-powered QC template generation
- **Module 25**: Pest detection during activities
**Changes**:
- No standalone AI module
- AI as supporting service, not user-facing module
- Context-specific AI features
**Action**: Implement AI features within respective modules

---

### PHASE 5: ADVANCED FEATURES

#### PRD Module 14 → UI Module 26 🔢
**Status**: Compliance module renumbered to avoid conflicts
**File**: [ui/bubble/PHASE-5-ADVANCED.md](ui/bubble/PHASE-5-ADVANCED.md)
**Changes**: Module number 14 → 26 (content unchanged)
**Reason**: Avoid conflict with Phase 2 numbering
**Action**: Use Module 26 for compliance features

#### PRD Module 15 → UI Module 27 🔢
**Status**: Analytics module renumbered to avoid conflicts
**File**: [ui/bubble/PHASE-5-ADVANCED.md](ui/bubble/PHASE-5-ADVANCED.md)
**Changes**: Module number 15 → 27 (content unchanged)
**Reason**: Avoid conflict with Phase 2 Module 15 (Cultivars)
**Action**: Use Module 27 for analytics dashboards

#### PRD Module 16 → UI Module 28 🔢
**Status**: Mobile module renumbered to avoid conflicts
**File**: [ui/bubble/PHASE-5-ADVANCED.md](ui/bubble/PHASE-5-ADVANCED.md)
**Changes**: Module number 16 → 28 (content unchanged)
**Reason**: Avoid conflict with Phase 2 Module 16 (Suppliers)
**Action**: Use Module 28 for mobile/PWA features

#### PRD Module 17 → UI Module 29 🔢
**Status**: Integrations module renumbered to avoid conflicts
**File**: [ui/bubble/PHASE-5-ADVANCED.md](ui/bubble/PHASE-5-ADVANCED.md)
**Changes**: Module number 17 → 29 (content unchanged)
**Reason**: Avoid conflict with Phase 2 Module 17 (User Invitations)
**Action**: Use Module 29 for API/integration features

---

## Feature Location Quick Reference

### "Where do I find...?"

| Feature | PRD Location | UI Location | Notes |
|---------|-------------|-------------|-------|
| User signup/login | Module 1 | Module 1 (Phase 1) | Same |
| Email verification | Module 2 | Module 2 (Phase 1) | Same |
| Payment plans | Module 3 | Optional (Phase 1) | Deprioritized for MVP |
| Company profile | Module 4 | Module 3 (Phase 1) | In onboarding now |
| Facility creation | Module 5 | Module 3 (Phase 1) | Merged with crop selection |
| Crop selection | Module 6 | Module 3 (Phase 1) | Part of facility creation |
| Area management | Module 7 | Module 8 (Phase 2) | No sample data, manual CRUD |
| Cultivar management | Module 8 | Module 15 (Phase 2) | Split from suppliers |
| Supplier management | Module 8 | Module 16 (Phase 2) | Split from cultivars |
| Team invitations | Not in PRD | Module 17 (Phase 2) | New feature |
| Multi-facility switching | Not in PRD | Module 18 (Phase 2) | New feature |
| Inventory | Module 9 | Module 19 (Phase 2) | Renumbered |
| Facility settings | Module 5 | Module 20 (Phase 2) | Separated out |
| Account settings | Module 4 | Module 21 (Phase 2) | Separated out |
| Production templates | Module 10 | Module 22 (Phase 3) | Renumbered |
| QC templates + AI | Module 11 | Module 23 (Phase 3) | Simplified approach |
| Production orders | Module 12 | Module 24 (Phase 4) | Split from execution |
| Activity execution | Module 12 | Module 25 (Phase 4) | Split from orders |
| AI pest detection | Module 13 | Module 25 (Phase 4) | In activity execution |
| AI form generation | Module 13 | Module 23 (Phase 3) | In QC templates |
| Compliance | Module 14 | Module 26 (Phase 5) | Renumbered |
| Analytics | Module 15 | Module 27 (Phase 5) | Renumbered |
| Mobile PWA | Module 16 | Module 28 (Phase 5) | Renumbered |
| Integrations/APIs | Module 17 | Module 29 (Phase 5) | Renumbered |

---

## API Endpoint Migration

If you're working on API endpoints, use this mapping:

| PRD Endpoint Reference | Update To |
|----------------------|-----------|
| `/api/v1/module-9/...` | `/api/v1/inventory/...` (Module 19) |
| `/api/v1/module-10/...` | `/api/v1/templates/...` (Module 22) |
| `/api/v1/module-11/...` | `/api/v1/quality-checks/...` (Module 23) |
| `/api/v1/module-12/...` | `/api/v1/production-orders/...` (Module 24) or `/api/v1/activities/...` (Module 25) |
| `/api/v1/module-13/...` | Distributed - AI endpoints in respective modules |
| `/api/v1/module-14/...` | `/api/v1/compliance/...` (Module 26) |
| `/api/v1/module-15/...` | `/api/v1/analytics/...` (Module 27) |
| `/api/v1/module-16/...` | `/api/v1/mobile/...` (Module 28) |
| `/api/v1/module-17/...` | `/api/v1/integrations/...` (Module 29) |

**Recommendation**: Use feature-based URLs instead of module numbers going forward.

---

## Database Schema Migration

### Tables Renamed

| PRD Table Name | UI Table Name | Reason |
|---------------|---------------|---------|
| `areas_sample` | `areas` | No sample data concept |
| `cultivars_sample` | `cultivars` | No sample data concept |
| `suppliers_sample` | `suppliers` | No sample data concept |

### Tables Added

| Table Name | Module | Reason |
|-----------|--------|--------|
| `facility_users` | Module 17 | User invitations and roles |
| `facility_switcher_log` | Module 18 | Multi-facility tracking |

### Tables Removed

| Table Name | PRD Module | Reason |
|-----------|-----------|---------|
| `sample_data_configs` | Module 7-8 | Sample data feature removed |
| `ai_engine_configs` | Module 13 | AI distributed, no central config |

---

## Testing Migration

### Test Cases to Update

1. **Onboarding Tests**:
   - Remove sample data validation tests (PRD Module 7-8)
   - Add manual area creation tests (UI Module 8)
   - Update facility creation to include crop selection (UI Module 3)

2. **Module Numbering**:
   - Update all module number references in test files
   - Search for `module-9` → replace with `module-19`
   - Search for `module-14` → replace with `module-26`, etc.

3. **Split Module Tests**:
   - PRD Module 12 tests → split into Module 24 and 25 tests
   - Ensure both order creation and execution are covered

4. **New Feature Tests**:
   - Add tests for Module 17 (User Invitations)
   - Add tests for Module 18 (Facility Switcher)
   - Add tests for Modules 20-21 (Settings)

---

## Common Migration Scenarios

### Scenario 1: "I'm implementing PRD Module X"

1. Look up module X in the Quick Reference Table above
2. Find the corresponding UI module number and phase
3. Read the UI phase documentation file
4. Check for any "Changes" notes in this guide
5. Implement according to UI docs, not PRD

### Scenario 2: "My code references PRD module numbers"

1. Use the Quick Reference Table to map old → new numbers
2. Update all module number references in code
3. Update API endpoint paths (see API Endpoint Migration section)
4. Update test file names and assertions
5. Update database queries if using module-based tables

### Scenario 3: "I need sample data generation"

1. **Stop**: Sample data feature was removed (PRD Module 7-8)
2. Users now manually configure areas, cultivars, suppliers
3. Implement CRUD interfaces per Phase 2 modules (8, 15, 16)
4. Consider optional import/export for template sharing (future)

### Scenario 4: "I need the AI Engine module"

1. **Stop**: No standalone AI module exists (PRD Module 13 removed)
2. AI features distributed across:
   - **QC Template Generation**: Module 23
   - **Pest Detection**: Module 25
3. Implement AI as supporting service, not user-facing module
4. Use Gemini API directly in respective modules

### Scenario 5: "Working on Phase 2 operations"

1. **Stop**: "Phase 2 Operations" was reorganized
2. **Phase 2** now = Master Data Setup (Modules 8, 15-21)
3. **Phase 3** = Templates (Modules 22-23)
4. **Phase 4** = Production Execution (Modules 24-25)
5. Check the specific module you need in Phase 2, 3, or 4

---

## Checklist: Migrating from PRD to UI Docs

Use this checklist when transitioning a feature:

- [ ] Looked up PRD module in Quick Reference Table
- [ ] Found corresponding UI module and phase
- [ ] Read UI phase documentation file
- [ ] Updated code references to new module numbers
- [ ] Updated API endpoint paths
- [ ] Updated database table names if changed
- [ ] Updated test files and test data
- [ ] Checked for removed features (sample data, standalone AI)
- [ ] Checked for split features (Module 12 → 24 & 25)
- [ ] Checked for merged features (Modules 5 & 6 → 3)
- [ ] Reviewed architectural rationale in ARCHITECTURE-CHANGELOG.md
- [ ] Updated documentation references
- [ ] Updated user-facing module names (if applicable)

---

## Need Help?

If you're unsure about a migration path:

1. **Check**: [ARCHITECTURE-CHANGELOG.md](ARCHITECTURE-CHANGELOG.md) for detailed rationale
2. **Check**: [MODULE-INVENTORY.md](MODULE-INVENTORY.md) for current module status
3. **Check**: UI phase documentation for implementation details
4. **Ask**: Architecture team if migration path is unclear

---

**Maintained By**: Architecture Team
**Last Updated**: 2025-11-21
**Related**: [ARCHITECTURE-CHANGELOG.md](ARCHITECTURE-CHANGELOG.md), [MODULE-INVENTORY.md](MODULE-INVENTORY.md)
