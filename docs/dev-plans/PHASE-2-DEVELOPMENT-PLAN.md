# Phase 2: Basic Operations Setup - Implementation Plan

**Alquemist Next.js Frontend**
**Created**: December 2025
**Status**: Ready for Implementation

---

## Overview

### Phase Summary
Phase 2 establishes the core dashboard and master data management functionality. After completing onboarding (Phase 1), users can configure their operational infrastructure through the dashboard interface.

### Input Documents
- **Wireframes**: [docs/ui/nextjs/PHASE-2-WIREFRAMES.md](../ui/nextjs/PHASE-2-WIREFRAMES.md)
- **Bubble Reference**: [docs/ui/bubble/PHASE-2-BASIC-SETUP.md](../ui/bubble/PHASE-2-BASIC-SETUP.md)
- **API Endpoints**: [docs/api/PHASE-2-BASIC-SETUP-ENDPOINTS.md](../api/PHASE-2-BASIC-SETUP-ENDPOINTS.md)

### Scope
- **Total Modules**: 9 (Dashboard + Modules 8, 15-21)
- **Total Pages**: ~20 screens
- **Total Tasks**: ~75 tasks
- **Estimated Components**: ~25 new components

### Prerequisites
- ✅ Phase 1 complete (onboarding flow working)
- ✅ Authentication system functional
- ✅ Convex backend connected
- ✅ Design system established (Tailwind + shadcn/ui)

---

## Module Breakdown

### Module Overview

| ID | Module | Priority | Backend Status | Tasks |
|----|--------|----------|----------------|-------|
| 0 | Dashboard Layout | P0 | N/A | 8 |
| 1 | Dashboard Home | P0 | ⚠️ Partial | 6 |
| 8 | Areas | P1 | ✅ Ready | 10 |
| 15 | Cultivars | P1 | ⚠️ Pending | 10 |
| 16 | Suppliers | P2 | ⚠️ Pending | 8 |
| 17 | Users | P2 | ⚠️ Pending | 8 |
| 18 | Facilities | P2 | ⚠️ Pending | 7 |
| 19 | Inventory | P2 | ⚠️ Pending | 10 |
| 20 | Facility Settings | P3 | ⚠️ Pending | 5 |
| 21 | Account Settings | P3 | ⚠️ Pending | 5 |

**Priority Legend**:
- P0: Critical foundation (must complete first)
- P1: Core functionality (primary features)
- P2: Standard features
- P3: Configuration/settings

---

## Module 0: Dashboard Layout (P0 - Foundation)

### Description
Base layout structure for all Phase 2 pages including sidebar navigation, header with facility switcher, and responsive behavior.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 0.1 | Create `(dashboard)` route group | Setup | S | - |
| 0.2 | Create `DashboardLayout` component | Component | M | 0.1 |
| 0.3 | Create `Sidebar` component | Component | M | 0.1 |
| 0.4 | Create `Header` component | Component | M | 0.1 |
| 0.5 | Create `FacilitySwitcher` component | Component | M | 0.4 |
| 0.6 | Create `PageHeader` component | Component | S | 0.1 |
| 0.7 | Implement responsive sidebar (mobile hamburger) | Feature | M | 0.3 |
| 0.8 | Add breadcrumb navigation | Component | S | 0.6 |

**Estimate Legend**: S = Small (< 1hr), M = Medium (1-3hrs), L = Large (3-6hrs), XL = Extra Large (> 6hrs)

### New Components

```
components/
├── layout/
│   ├── dashboard-layout.tsx
│   ├── sidebar.tsx
│   ├── sidebar-item.tsx
│   ├── sidebar-mobile.tsx
│   ├── header.tsx
│   ├── facility-switcher.tsx
│   ├── page-header.tsx
│   └── breadcrumb.tsx
```

### Route Structure

```
app/
├── (dashboard)/
│   ├── layout.tsx          # DashboardLayout wrapper
│   └── ...
```

### Acceptance Criteria
- [ ] Sidebar displays all navigation items
- [ ] Active item is highlighted
- [ ] Facility switcher shows current facility
- [ ] Mobile menu opens/closes correctly
- [ ] Breadcrumb shows current location
- [ ] Responsive at all breakpoints

---

## Module 1: Dashboard Home (P0 - Foundation)

### Description
Main dashboard landing page with metrics summary, recent activity, and onboarding checklist for new users (empty state).

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 1.1 | Create dashboard home page | Page | M | 0.2 |
| 1.2 | Create `MetricsBar` component | Component | M | 1.1 |
| 1.3 | Create `RecentActivity` component | Component | M | 1.1 |
| 1.4 | Create `QuickActions` component | Component | S | 1.1 |
| 1.5 | Create `EmptyState` component (reusable) | Component | M | - |
| 1.6 | Create dashboard empty state with checklist | Feature | M | 1.5 |

### New Components

```
components/
├── dashboard/
│   ├── metrics-bar.tsx
│   ├── metrics-card.tsx
│   ├── recent-activity.tsx
│   ├── quick-actions.tsx
│   └── onboarding-checklist.tsx
├── ui/
│   └── empty-state.tsx
```

### API Integration
- GET dashboard metrics (areas count, cultivars count, inventory count, alerts)
- GET recent activity (latest 5 activities)
- GET onboarding status (which steps completed)

### Acceptance Criteria
- [ ] Shows metrics when data exists
- [ ] Shows empty state checklist when no data
- [ ] Checklist items link to correct modules
- [ ] Activity list shows recent events
- [ ] Quick actions navigate correctly

---

## Module 8: Areas Management (P1 - Core)

### Description
Full CRUD for cultivation areas (propagation, vegetative, flowering, drying, etc.) with occupancy tracking and environmental specs.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 8.1 | Create areas list page | Page | L | 0.2 |
| 8.2 | Create `AreaCard` component | Component | M | 8.1 |
| 8.3 | Create `OccupancyBar` component | Component | S | 8.2 |
| 8.4 | Create `StatusBadge` component | Component | S | 8.2 |
| 8.5 | Create area type tabs/filter | Feature | M | 8.1 |
| 8.6 | Create area create popup/modal | Feature | L | 8.1 |
| 8.7 | Create area detail page | Page | M | 8.1 |
| 8.8 | Create area edit page | Page | M | 8.7, 8.6 |
| 8.9 | Create areas empty state | Feature | S | 1.5 |
| 8.10 | Integrate with Convex (CRUD operations) | Integration | L | 8.1-8.8 |

### New Components

```
components/
├── areas/
│   ├── area-card.tsx
│   ├── area-list.tsx
│   ├── area-form.tsx
│   ├── area-type-tabs.tsx
│   └── environmental-specs-form.tsx
├── ui/
│   ├── occupancy-bar.tsx
│   └── status-badge.tsx
```

### Route Structure

```
app/(dashboard)/
├── areas/
│   ├── page.tsx              # Areas list
│   └── [id]/
│       ├── page.tsx          # Area detail
│       └── edit/
│           └── page.tsx      # Area edit
```

### API Integration
- GET /areas (list by facility)
- POST /areas (create)
- GET /areas/:id (detail)
- PUT /areas/:id (update)
- DELETE /areas/:id (soft delete)

### Acceptance Criteria
- [ ] List shows all areas with cards
- [ ] Filter by area type works
- [ ] Search by name works
- [ ] Create modal validates all fields
- [ ] Detail page shows all info with tabs
- [ ] Edit page pre-fills current data
- [ ] Environmental specs show only when climate controlled
- [ ] Empty state displays when no areas

---

## Module 15: Cultivars Management (P1 - Core)

### Description
Management of plant varieties (strains) including system cultivars from catalog and custom facility-specific varieties.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 15.1 | Create cultivars list page | Page | L | 0.2 |
| 15.2 | Create `CultivarCard` component | Component | M | 15.1 |
| 15.3 | Create crop type filter dropdown | Feature | S | 15.1 |
| 15.4 | Create "Link System Cultivars" popup | Feature | L | 15.1 |
| 15.5 | Create "Create Custom Cultivar" popup | Feature | L | 15.1 |
| 15.6 | Create cultivar detail page | Page | M | 15.1 |
| 15.7 | Create cultivar edit page (custom only) | Page | M | 15.6 |
| 15.8 | Create cultivars empty state | Feature | S | 1.5 |
| 15.9 | Implement system vs custom differentiation | Feature | M | 15.2 |
| 15.10 | Integrate with Convex | Integration | L | 15.1-15.9 |

### New Components

```
components/
├── cultivars/
│   ├── cultivar-card.tsx
│   ├── cultivar-list.tsx
│   ├── cultivar-form.tsx
│   ├── link-cultivars-modal.tsx
│   ├── crop-type-filter.tsx
│   └── cannabinoid-range-input.tsx
```

### Route Structure

```
app/(dashboard)/
├── cultivars/
│   ├── page.tsx              # Cultivars list
│   └── [id]/
│       ├── page.tsx          # Cultivar detail
│       └── edit/
│           └── page.tsx      # Cultivar edit (custom only)
```

### API Integration
- GET /cultivars (list linked to facility)
- GET /cultivars/system (system catalog)
- POST /cultivars/link (link system cultivars)
- POST /cultivars (create custom)
- GET /cultivars/:id (detail)
- PUT /cultivars/:id (update custom)
- DELETE /cultivars/:id (delete custom)

### Acceptance Criteria
- [ ] List shows linked cultivars
- [ ] Filter by crop type works
- [ ] System cultivars show ⭐ badge
- [ ] Custom cultivars show edit/delete options
- [ ] Link popup shows unlinked system cultivars
- [ ] Multi-select works in link popup
- [ ] Create custom validates required fields
- [ ] Cannabinoid ranges only show for Cannabis

---

## Module 16: Suppliers Management (P2)

### Description
CRUD for input material suppliers with contact information and product categories.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 16.1 | Create suppliers list page | Page | M | 0.2 |
| 16.2 | Create `DataTable` component (reusable) | Component | L | - |
| 16.3 | Create supplier create popup | Feature | M | 16.1 |
| 16.4 | Create supplier detail page | Page | M | 16.1 |
| 16.5 | Create supplier edit page | Page | M | 16.4 |
| 16.6 | Create suppliers empty state | Feature | S | 1.5 |
| 16.7 | Implement category multi-select | Feature | S | 16.3 |
| 16.8 | Integrate with Convex | Integration | M | 16.1-16.7 |

### New Components

```
components/
├── suppliers/
│   ├── supplier-table.tsx
│   ├── supplier-form.tsx
│   └── category-multi-select.tsx
├── ui/
│   └── data-table.tsx
```

### Route Structure

```
app/(dashboard)/
├── suppliers/
│   ├── page.tsx              # Suppliers list
│   └── [id]/
│       ├── page.tsx          # Supplier detail
│       └── edit/
│           └── page.tsx      # Supplier edit
```

### Acceptance Criteria
- [ ] Table displays all suppliers
- [ ] Filter by category works
- [ ] Search by name works
- [ ] Create validates required fields
- [ ] Multiple categories can be selected
- [ ] Status toggle works

---

## Module 17: Users & Invitations (P2)

### Description
Team member management with role-based invitations linking to Phase 1 invited user flow.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 17.1 | Create users list page | Page | M | 0.2 |
| 17.2 | Create user row/card component | Component | S | 17.1 |
| 17.3 | Create invite user popup | Feature | M | 17.1 |
| 17.4 | Create role selector with descriptions | Component | M | 17.3 |
| 17.5 | Create facility multi-select | Feature | S | 17.3 |
| 17.6 | Implement resend invitation | Feature | S | 17.1 |
| 17.7 | Create users empty state | Feature | S | 1.5 |
| 17.8 | Integrate with Convex | Integration | M | 17.1-17.7 |

### New Components

```
components/
├── users/
│   ├── user-table.tsx
│   ├── user-row.tsx
│   ├── invite-user-modal.tsx
│   └── role-selector.tsx
```

### Route Structure

```
app/(dashboard)/
├── users/
│   └── page.tsx              # Users management
```

### Acceptance Criteria
- [ ] List shows all users and pending invitations
- [ ] Filter by role works
- [ ] Filter by status works
- [ ] Invite sends email to user
- [ ] Role descriptions display correctly
- [ ] Resend invitation works
- [ ] Pending invitations show countdown

---

## Module 18: Facility Management (P2)

### Description
Multi-facility management including the facility switcher component and facility CRUD.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 18.1 | Create facilities list page | Page | M | 0.2 |
| 18.2 | Create `FacilityCard` component | Component | M | 18.1 |
| 18.3 | Create facility create popup | Feature | M | 18.1 |
| 18.4 | Implement facility switch action | Feature | M | 0.5 |
| 18.5 | Show plan limits indicator | Feature | S | 18.1 |
| 18.6 | Implement cascading selects (Dept/Muni) | Feature | S | 18.3 |
| 18.7 | Integrate with Convex | Integration | M | 18.1-18.6 |

### New Components

```
components/
├── facilities/
│   ├── facility-card.tsx
│   ├── facility-form.tsx
│   └── plan-limit-indicator.tsx
```

### Route Structure

```
app/(dashboard)/
├── facilities/
│   └── page.tsx              # Facilities management
```

### Acceptance Criteria
- [ ] List shows all company facilities
- [ ] Current facility highlighted
- [ ] Switch updates all data context
- [ ] Plan limits displayed
- [ ] Create respects plan limits
- [ ] Location cascading works

---

## Module 19: Inventory Management (P2)

### Description
Stock management for plants, seeds, equipment, nutrients, and materials with reorder alerts.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 19.1 | Create inventory list page | Page | L | 0.2 |
| 19.2 | Create inventory table/list | Component | M | 19.1 |
| 19.3 | Create category tabs | Feature | S | 19.1 |
| 19.4 | Create stock status indicators | Component | S | 19.2 |
| 19.5 | Create inventory create popup | Feature | L | 19.1 |
| 19.6 | Create inventory detail page | Page | M | 19.1 |
| 19.7 | Create inventory edit page | Page | M | 19.6 |
| 19.8 | Create inventory empty state | Feature | S | 1.5 |
| 19.9 | Implement low stock alerts | Feature | M | 19.2 |
| 19.10 | Integrate with Convex | Integration | L | 19.1-19.9 |

### New Components

```
components/
├── inventory/
│   ├── inventory-table.tsx
│   ├── inventory-row.tsx
│   ├── inventory-form.tsx
│   ├── category-tabs.tsx
│   └── stock-status.tsx
```

### Route Structure

```
app/(dashboard)/
├── inventory/
│   ├── page.tsx              # Inventory list
│   └── [id]/
│       ├── page.tsx          # Item detail
│       └── edit/
│           └── page.tsx      # Item edit
```

### Acceptance Criteria
- [ ] List shows all inventory items
- [ ] Filter by category works
- [ ] Low stock items highlighted 🔴
- [ ] Reorder point validation works
- [ ] Quantity units dynamic by category
- [ ] Supplier dropdown populated

---

## Module 20: Facility Settings (P3)

### Description
Facility-specific configuration including license info, location, and environmental defaults.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 20.1 | Create facility settings page | Page | M | 0.2 |
| 20.2 | Create settings tabs component | Component | S | 20.1 |
| 20.3 | Create general info form | Feature | M | 20.1 |
| 20.4 | Create location form with GPS | Feature | M | 20.1 |
| 20.5 | Integrate with Convex | Integration | M | 20.1-20.4 |

### Route Structure

```
app/(dashboard)/
├── settings/
│   └── facility/
│       └── page.tsx          # Facility settings
```

### Acceptance Criteria
- [ ] All tabs navigate correctly
- [ ] General info saves correctly
- [ ] Location with cascading selects
- [ ] GPS capture works (reuse from Phase 1)
- [ ] Validation on all required fields

---

## Module 21: Account Settings (P3)

### Description
User profile, preferences, and notification settings.

### Tasks

| ID | Task | Type | Estimate | Dependencies |
|----|------|------|----------|--------------|
| 21.1 | Create account settings page | Page | M | 0.2 |
| 21.2 | Create profile form | Feature | M | 21.1 |
| 21.3 | Create preferences form | Feature | M | 21.1 |
| 21.4 | Create notification toggles | Feature | S | 21.1 |
| 21.5 | Integrate with Convex | Integration | M | 21.1-21.4 |

### Route Structure

```
app/(dashboard)/
├── settings/
│   └── account/
│       └── page.tsx          # Account settings
```

### Acceptance Criteria
- [ ] Profile updates save correctly
- [ ] Email is not editable
- [ ] Language preference affects i18n
- [ ] Notification toggles persist

---

## Development Streams

### Parallel Development Strategy

Phase 2 can be developed in two parallel streams after Module 0 is complete:

```
STREAM A (Layout + Core)          STREAM B (Features)
────────────────────────          ──────────────────────
Module 0: Dashboard Layout
    ↓
Module 1: Dashboard Home ────────→ Start parallel
    ↓                                  ↓
Module 8: Areas                   Module 15: Cultivars
    ↓                                  ↓
Module 16: Suppliers              Module 17: Users
    ↓                                  ↓
Module 19: Inventory              Module 18: Facilities
    ↓                                  ↓
Module 20: Facility Settings      Module 21: Account Settings
```

### Dependency Graph

```
                    ┌─────────────────┐
                    │ Module 0        │
                    │ Dashboard Layout│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Module 1        │
                    │ Dashboard Home  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌──────▼──────┐    ┌─────▼─────┐
    │ Module 8  │     │ Module 15   │    │ Module 17 │
    │ Areas     │     │ Cultivars   │    │ Users     │
    └─────┬─────┘     └──────┬──────┘    └─────┬─────┘
          │                  │                  │
    ┌─────▼─────┐     ┌──────▼──────┐    ┌─────▼─────┐
    │ Module 16 │     │ Module 18   │    │ Module 19 │
    │ Suppliers │     │ Facilities  │    │ Inventory │
    └─────┬─────┘     └──────┬──────┘    └─────┬─────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Modules 20-21   │
                    │ Settings        │
                    └─────────────────┘
```

---

## Shared Components

### New Reusable Components

| Component | Location | Used By |
|-----------|----------|---------|
| `EmptyState` | `components/ui/empty-state.tsx` | All modules |
| `DataTable` | `components/ui/data-table.tsx` | Suppliers, Users, Inventory |
| `StatusBadge` | `components/ui/status-badge.tsx` | Areas, Inventory, Users |
| `OccupancyBar` | `components/ui/occupancy-bar.tsx` | Areas |
| `MetricsCard` | `components/ui/metrics-card.tsx` | Dashboard |
| `CardGrid` | `components/ui/card-grid.tsx` | Areas, Cultivars, Facilities |
| `Modal` | `components/ui/modal.tsx` | All create popups |
| `Tabs` | `components/ui/tabs.tsx` | Detail pages, Settings |

### Reused from Phase 1

| Component | Location | Used By |
|-----------|----------|---------|
| `CascadingSelect` | `components/shared/cascading-select.tsx` | Facility create/edit |
| `GeolocationButton` | `components/shared/geolocation-button.tsx` | Facility settings |
| `PasswordInput` | `components/shared/password-input.tsx` | Account settings (change password) |

---

## Testing Strategy

### Unit Tests

| Module | Test Coverage Target | Priority |
|--------|---------------------|----------|
| Layout Components | 80% | High |
| Form Validations | 90% | High |
| Data Transformations | 90% | High |
| UI Components | 70% | Medium |

### Integration Tests

| Flow | Description | Priority |
|------|-------------|----------|
| Dashboard Load | Metrics fetch, empty state logic | High |
| Area CRUD | Create, read, update workflow | High |
| Cultivar Link | System cultivar linking | High |
| Facility Switch | Context change across app | High |
| Invitation Flow | Send invite, status tracking | Medium |

### E2E Tests (Playwright)

| Test Case | Steps |
|-----------|-------|
| New User Setup | Login → Dashboard empty → Create Area → Create Cultivar → Dashboard with data |
| Area Management | List → Create → Detail → Edit → Delete |
| Facility Switch | Switch facility → Verify data changes |
| User Invitation | Send invite → Check pending status |

---

## Success Criteria

### Phase Complete When

- [ ] Dashboard layout renders correctly at all breakpoints
- [ ] Facility switcher changes context across all modules
- [ ] Empty states display for all modules with no data
- [ ] Onboarding checklist tracks completion
- [ ] All CRUD operations work for each module
- [ ] Form validations prevent invalid data
- [ ] Loading states show during API calls
- [ ] Error states handle API failures gracefully
- [ ] Unit test coverage > 70%
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Lighthouse performance > 80
- [ ] WCAG AA accessibility compliance

### Definition of Done (per module)

- [ ] All wireframe screens implemented
- [ ] Responsive at mobile/tablet/desktop
- [ ] API integration complete
- [ ] Empty state implemented
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Unit tests written
- [ ] Code reviewed

---

## Implementation Order

### Recommended Sequence

```
Week 1: Foundation
├── Day 1-2: Module 0 - Dashboard Layout
└── Day 3-5: Module 1 - Dashboard Home

Week 2: Core Modules (parallel)
├── Stream A: Module 8 - Areas (full CRUD)
└── Stream B: Module 15 - Cultivars (full CRUD)

Week 3: Secondary Modules (parallel)
├── Stream A: Module 16 - Suppliers
├── Stream A: Module 19 - Inventory
├── Stream B: Module 17 - Users
└── Stream B: Module 18 - Facilities

Week 4: Settings & Polish
├── Module 20 - Facility Settings
├── Module 21 - Account Settings
├── Integration testing
└── Bug fixes & polish
```

### Critical Path

1. **Module 0** (Dashboard Layout) - Blocks everything
2. **Module 1** (Dashboard Home) - Blocks empty states
3. **Module 8** (Areas) - Reference CRUD implementation
4. **All other modules** - Can parallelize after Module 8

---

## Risk Mitigation

### Identified Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend APIs not ready | High | Mock APIs with MSW during development |
| Complex responsive sidebar | Medium | Use shadcn/ui sidebar component as base |
| Facility context management | Medium | Use React Context + Convex subscriptions |
| Form complexity (environmental specs) | Low | Conditional rendering, clear UX |

### Dependencies on Backend

| Module | Required Endpoints | Status |
|--------|-------------------|--------|
| Areas | CRUD complete | ✅ Ready |
| Cultivars | System catalog + facility linking | ⚠️ Partial |
| Suppliers | CRUD | ⚠️ Pending |
| Users/Invitations | Invite flow | ⚠️ Pending |
| Facilities | Multi-facility support | ⚠️ Pending |
| Inventory | CRUD + stock tracking | ⚠️ Pending |

**Recommendation**: Start with Module 8 (Areas) as it has backend ready, then parallelize other modules as backend becomes available.

---

## Commands Reference

### Start Implementation

```bash
# Start with Module 0
@implement module-0

# Or start full phase
@implement phase-2
```

### Check Progress

```bash
# View module status
@status phase-2

# Run tests
npm test

# Type check
npm run type-check
```

---

**Plan Created**: December 2025
**Ready for Implementation**: ✅ Yes
**Next Step**: `@implement phase-2` or start with `Module 0: Dashboard Layout`
