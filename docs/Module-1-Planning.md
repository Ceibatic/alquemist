# Module 1: Company & Facility Setup - Detailed Planning

**Created:** 2025-10-10
**Status:** Planning Phase
**Estimated Effort:** 10-14 hours
**Priority:** HIGH - Core onboarding flow

---

## 📋 Module Overview

### Purpose
Build the complete Company and Facility management interface that allows users to:
1. View and edit their company profile
2. Create and manage multiple facilities
3. Track licenses and compliance information
4. Configure facility areas and zones
5. Manage team members and roles

### Current Foundation Status
✅ Database Schema: 26 tables deployed
✅ Backend APIs: 7 endpoints operational
✅ Authentication: Clerk + Organizations working
✅ Test Data: Company + Facility created
✅ Multi-Tenancy: Verified and working

### What We're Building
This module provides the **first real UI** after authentication, transforming our API-only backend into a user-facing application.

---

## 🎯 User Stories

### Epic 1: Company Profile Management

#### US-1.1: View Company Profile
**As a** Company Owner
**I want to** see my company's complete profile
**So that** I can verify my business information is correct

**Acceptance Criteria:**
- [ ] Display company name, legal name, business type
- [ ] Show tax ID, registration info, contact details
- [ ] Display current organization ID (from Clerk)
- [ ] Show company creation date and status
- [ ] Responsive design (mobile + desktop)

**API Used:** `GET /api/v1/companies`

---

#### US-1.2: Edit Company Profile
**As a** Company Owner
**I want to** edit my company information
**So that** I can keep my business details up to date

**Acceptance Criteria:**
- [ ] In-place editing of company fields
- [ ] Validation for required fields (legal name, tax ID)
- [ ] Format validation for tax ID (Colombian NIT format)
- [ ] Save changes with success/error feedback
- [ ] Optimistic UI updates

**API Used:** `PATCH /api/v1/companies`

---

#### US-1.3: Upload Company Logo
**As a** Company Owner
**I want to** upload my company logo
**So that** my brand appears throughout the platform

**Acceptance Criteria:**
- [ ] Image upload with preview
- [ ] Format validation (PNG, JPG, SVG)
- [ ] Size limits (max 2MB)
- [ ] Automatic resizing/optimization
- [ ] Display logo in navigation bar

**API Used:** New endpoint needed (file upload)

---

### Epic 2: Facility Management

#### US-2.1: View All Facilities
**As a** Company Owner or Facility Manager
**I want to** see a list of all my facilities
**So that** I can quickly navigate to the one I need

**Acceptance Criteria:**
- [ ] List view with key facility info (name, type, location, license status)
- [ ] Card or table layout (user preference)
- [ ] Filter by facility type (greenhouse, indoor, outdoor, etc.)
- [ ] Search by name or license number
- [ ] Pagination (10-25 per page)
- [ ] Empty state for first-time users

**API Used:** `GET /api/v1/facilities` (already implemented)

---

#### US-2.2: Create New Facility
**As a** Company Owner
**I want to** create a new facility
**So that** I can start tracking production at a new location

**Acceptance Criteria:**
- [ ] Multi-step wizard (3 steps: Basic Info → Location → License)
- [ ] Step 1: Name, facility type, description
- [ ] Step 2: Address, coordinates (optional map picker)
- [ ] Step 3: License number, authority, expiration, upload
- [ ] Validation at each step
- [ ] Draft save functionality (can exit and resume)
- [ ] Success redirect to facility details page

**API Used:** `POST /api/v1/facilities` (already implemented)

---

#### US-2.3: View Facility Details
**As a** Facility Manager
**I want to** see complete details of a facility
**So that** I can understand its configuration and compliance status

**Acceptance Criteria:**
- [ ] Facility header with name, type, status
- [ ] Tabs: Overview | License | Areas | Team
- [ ] Overview tab: Location, areas, current batches, stats
- [ ] License tab: All license info, expiration alerts, upload history
- [ ] Areas tab: List of all areas with capacity
- [ ] Team tab: Users assigned to this facility with roles
- [ ] Edit button (only for authorized users)

**API Used:** `GET /api/v1/facilities/:id` (already implemented)

---

#### US-2.4: Edit Facility Information
**As a** Company Owner or Facility Manager
**I want to** update facility information
**So that** I can correct errors or reflect changes

**Acceptance Criteria:**
- [ ] Edit form with current values pre-filled
- [ ] Same validation as creation
- [ ] Track changes (audit log)
- [ ] Success notification
- [ ] Return to facility details view

**API Used:** `PATCH /api/v1/facilities/:id` (already implemented)

---

#### US-2.5: Archive/Delete Facility
**As a** Company Owner
**I want to** archive a facility that's no longer in use
**So that** it doesn't clutter my active facilities list

**Acceptance Criteria:**
- [ ] Soft delete (status = "archived")
- [ ] Confirmation dialog with warning
- [ ] Cannot archive if active batches exist
- [ ] Can restore from archived list
- [ ] Audit trail of deletion

**API Used:** `DELETE /api/v1/facilities/:id` (already implemented - soft delete)

---

### Epic 3: License Management

#### US-3.1: License Expiration Alerts
**As a** Facility Manager
**I want to** receive alerts when licenses are expiring
**So that** I can renew them before they expire

**Acceptance Criteria:**
- [ ] Dashboard widget showing licenses expiring within 60 days
- [ ] Color coding: Green (>60 days), Yellow (30-60 days), Red (<30 days), Gray (expired)
- [ ] Email notifications at 60, 30, 14, 7 days before expiration
- [ ] Link to license renewal page
- [ ] Snooze option for notifications

**API Used:** New computed field in facilities query

---

#### US-3.2: Upload License Documents
**As a** Facility Manager
**I want to** upload scanned copies of my licenses
**So that** I can access them quickly during inspections

**Acceptance Criteria:**
- [ ] Multi-file upload (PDF, JPG, PNG)
- [ ] Size limit per file (10MB)
- [ ] Document categorization (cultivation license, processing license, etc.)
- [ ] Version history (when renewals occur)
- [ ] Download/preview functionality
- [ ] Secure storage with access control

**API Used:** New file upload endpoint needed

---

### Epic 4: Area Configuration

#### US-4.1: Create Areas Within Facility
**As a** Facility Manager
**I want to** create areas within my facility
**So that** I can organize my cultivation zones

**Acceptance Criteria:**
- [ ] Quick create form (name, area type, size)
- [ ] Area types: Propagation, Vegetative, Flowering, Drying, Processing, Storage
- [ ] Size in m² or ft² (configurable unit)
- [ ] Optional: Environmental settings (temp range, humidity, etc.)
- [ ] Capacity limits (max batches/plants)
- [ ] Visual layout (future: drag-drop floor plan)

**API Used:** New endpoint `POST /api/v1/areas` needed

---

#### US-4.2: View Area Layout
**As a** Production Supervisor
**I want to** see the layout of all areas in my facility
**So that** I can understand where batches are located

**Acceptance Criteria:**
- [ ] Visual representation of facility layout
- [ ] Each area shows: name, current occupancy, capacity
- [ ] Color coding by area type
- [ ] Click area to see batches inside
- [ ] Filter by area type or occupancy status
- [ ] Export as PDF for reporting

**API Used:** New endpoint `GET /api/v1/facilities/:id/areas` needed

---

### Epic 5: Team Management

#### US-5.1: Invite Team Members
**As a** Company Owner
**I want to** invite team members to my organization
**So that** they can access the platform with appropriate permissions

**Acceptance Criteria:**
- [ ] Send email invitation with signup link
- [ ] Select role during invitation (Owner, Manager, Supervisor, Worker, Viewer)
- [ ] Assign to specific facilities (optional)
- [ ] Invitation expiration (7 days)
- [ ] Resend invitation option
- [ ] Track invitation status (pending, accepted, expired)

**API Used:** Clerk Organizations API + new endpoint for role assignment

---

#### US-5.2: Manage User Roles
**As a** Company Owner
**I want to** change user roles and facility assignments
**So that** I can manage permissions as my team changes

**Acceptance Criteria:**
- [ ] List all users with current roles
- [ ] Inline role editing
- [ ] Facility assignment multi-select
- [ ] Permission preview (show what each role can do)
- [ ] Confirmation for role changes
- [ ] Audit log of permission changes

**API Used:** New endpoint `PATCH /api/v1/users/:id` needed

---

## 🏗️ Technical Architecture

### Component Structure

```
app/
├── (authenticated)/           # Layout with auth guard
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard (landing after login)
│   ├── company/
│   │   ├── page.tsx          # Company profile view/edit
│   │   └── logo/
│   │       └── upload.tsx    # Logo upload modal
│   ├── facilities/
│   │   ├── page.tsx          # Facilities list
│   │   ├── new/
│   │   │   └── page.tsx      # Create facility wizard
│   │   └── [facilityId]/
│   │       ├── page.tsx      # Facility details
│   │       ├── edit/
│   │       │   └── page.tsx  # Edit facility
│   │       ├── areas/
│   │       │   ├── page.tsx  # Area layout view
│   │       │   └── new/
│   │       │       └── page.tsx  # Create area
│   │       └── team/
│   │           └── page.tsx  # Facility team management
│   └── team/
│       ├── page.tsx          # Organization team list
│       └── invite/
│           └── page.tsx      # Invite new members
└── api/v1/
    ├── areas/
    │   └── route.ts          # NEW: Areas CRUD
    ├── users/
    │   └── [id]/route.ts     # NEW: User management
    └── upload/
        └── route.ts          # NEW: File upload handler
```

### New Components Needed

```typescript
components/
├── company/
│   ├── CompanyProfileCard.tsx
│   ├── CompanyEditForm.tsx
│   └── LogoUploader.tsx
├── facilities/
│   ├── FacilityCard.tsx
│   ├── FacilityList.tsx
│   ├── FacilityWizard/
│   │   ├── Step1BasicInfo.tsx
│   │   ├── Step2Location.tsx
│   │   └── Step3License.tsx
│   ├── LicenseStatusBadge.tsx
│   └── FacilityDetailsLayout.tsx
├── areas/
│   ├── AreaCard.tsx
│   ├── AreaLayoutView.tsx
│   └── AreaForm.tsx
├── team/
│   ├── TeamMemberCard.tsx
│   ├── InviteMemberDialog.tsx
│   ├── RoleSelector.tsx
│   └── PermissionsTable.tsx
└── ui/
    ├── PageHeader.tsx
    ├── EmptyState.tsx
    ├── ConfirmDialog.tsx
    └── Tabs.tsx (if not in shadcn)
```

### State Management Strategy

**Option 1: Convex React Hooks (Recommended)**
- Use `useQuery()` for real-time data
- Use `useMutation()` for updates
- Automatic reactivity and sync
- Minimal state management code

**Option 2: React Query + REST API**
- Use for Bubble compatibility
- Better caching control
- Familiar pattern

**Recommendation:** Use Convex hooks for Next.js, keep REST API for Bubble integration.

---

## 🎨 UI/UX Design Patterns

### Design System
- **Framework:** Tailwind CSS
- **Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Colors:**
  - Primary: Emerald (agriculture theme)
  - Danger: Red (alerts, deletions)
  - Warning: Amber (expiring licenses)
  - Success: Green (completed actions)

### Responsive Breakpoints
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

### Layout Structure
```
┌─────────────────────────────────────────┐
│ Top Navigation (Clerk UserButton)      │
├─────────────────────────────────────────┤
│ Sidebar │ Main Content Area             │
│  Nav    │  ┌──────────────────────────┐ │
│         │  │ Page Header              │ │
│         │  ├──────────────────────────┤ │
│         │  │                          │ │
│         │  │ Page Content             │ │
│         │  │                          │ │
│         │  └──────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Navigation Menu
- Dashboard (Overview)
- Company Profile
- Facilities
- Team (if Owner/Manager)
- Settings (future)

---

## 📝 Implementation Tasks (Breakdown)

### Phase 1: Project Setup & Core Components (2-3 hours)

#### Task 1.1: Create Authenticated Layout
- [ ] Create `(authenticated)` layout group
- [ ] Add auth guard middleware
- [ ] Create sidebar navigation component
- [ ] Add PageHeader reusable component
- **Estimated Time:** 1 hour

#### Task 1.2: Install UI Dependencies
- [ ] Install shadcn/ui components needed:
  - `npx shadcn@latest add card button input label form select tabs badge dialog`
- [ ] Configure Tailwind colors for agriculture theme
- [ ] Create EmptyState component
- **Estimated Time:** 30 minutes

#### Task 1.3: Create Base Hooks
- [ ] `useCurrentCompany()` - Get company by org ID
- [ ] `useCurrentUser()` - Get Clerk user + role
- [ ] `useFacilities()` - List facilities with filters
- **Estimated Time:** 1 hour

---

### Phase 2: Company Profile (2-3 hours)

#### Task 2.1: Company Profile View Page
- [ ] Create `/company/page.tsx`
- [ ] Fetch company data with `useCurrentCompany()`
- [ ] Display company info in cards
- [ ] Add "Edit" button
- **Estimated Time:** 1.5 hours

#### Task 2.2: Company Profile Edit Form
- [ ] Create `CompanyEditForm` component
- [ ] Use React Hook Form + Zod validation
- [ ] Integrate with `PATCH /api/v1/companies`
- [ ] Success/error toast notifications
- **Estimated Time:** 1.5 hours

---

### Phase 3: Facilities List & Details (3-4 hours)

#### Task 3.1: Facilities List Page
- [ ] Create `/facilities/page.tsx`
- [ ] FacilityCard component with key info
- [ ] Filter by facility type
- [ ] Search functionality
- [ ] Pagination controls
- [ ] Empty state for new users
- [ ] "Create Facility" button
- **Estimated Time:** 2 hours

#### Task 3.2: Facility Details Page
- [ ] Create `/facilities/[facilityId]/page.tsx`
- [ ] Tabs layout: Overview | License | Areas | Team
- [ ] Overview tab with stats
- [ ] License tab with expiration indicator
- [ ] Placeholder for Areas and Team tabs
- **Estimated Time:** 2 hours

---

### Phase 4: Create Facility Wizard (3-4 hours)

#### Task 4.1: Wizard Structure
- [ ] Create `/facilities/new/page.tsx`
- [ ] Multi-step form component
- [ ] Progress indicator (Step 1 of 3)
- [ ] Back/Next navigation
- [ ] Draft save to localStorage
- **Estimated Time:** 1 hour

#### Task 4.2: Step 1 - Basic Info
- [ ] Form fields: name, facility type, description
- [ ] Validation with Zod
- [ ] Facility type select with icons
- **Estimated Time:** 1 hour

#### Task 4.3: Step 2 - Location
- [ ] Address form (street, city, state, country)
- [ ] Optional: Google Maps integration for coordinates
- [ ] Area fields (total_area, canopy_area)
- **Estimated Time:** 1 hour

#### Task 4.4: Step 3 - License
- [ ] License number, type, authority
- [ ] Expiration date picker
- [ ] Optional: Document upload (future)
- [ ] Final submit button
- [ ] Integration with `POST /api/v1/facilities`
- [ ] Success redirect to new facility details
- **Estimated Time:** 1.5 hours

---

### Phase 5: Areas & Team (2-3 hours) - Optional for MVP

#### Task 5.1: Create Area Endpoint
- [ ] New Convex module: `areas.ts`
- [ ] Queries: list, get, create, update
- [ ] REST API: `POST /api/v1/areas`
- **Estimated Time:** 1 hour

#### Task 5.2: Areas Tab in Facility Details
- [ ] List areas in facility
- [ ] AreaCard component
- [ ] "Create Area" button
- [ ] Simple area form (name, type, size)
- **Estimated Time:** 1.5 hours

---

## 🧪 Testing Plan

### Manual Testing Checklist

#### Company Profile
- [ ] View company profile with real data
- [ ] Edit company name and save
- [ ] Validate tax ID format enforcement
- [ ] Test form validation errors
- [ ] Verify optimistic UI updates

#### Facilities
- [ ] View empty facilities list (first-time user)
- [ ] Create new facility via wizard
- [ ] Navigate through all 3 wizard steps
- [ ] Cancel wizard and verify no data created
- [ ] View facility details
- [ ] Edit facility information
- [ ] Search facilities by name
- [ ] Filter facilities by type
- [ ] Test pagination with 10+ facilities

#### Multi-Tenancy
- [ ] Create second organization
- [ ] Verify facilities are isolated between orgs
- [ ] Test switching between organizations
- [ ] Confirm no cross-tenant data leakage

#### Responsive Design
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Verify navigation works on all sizes

---

## 📦 Dependencies & Prerequisites

### Required Before Starting
- [x] Foundation 100% complete
- [x] Clerk Organizations enabled
- [x] Company and Facility APIs tested
- [x] Test data available for development

### New Dependencies Needed
```json
{
  "dependencies": {
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "sonner": "^1.2.0",  // Toast notifications
    "date-fns": "^2.30.0" // Date formatting
  }
}
```

### shadcn/ui Components to Add
```bash
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add alert
```

---

## 🎯 Success Criteria

### Module 1 is Complete When:
- [ ] All 5 Epics implemented (Company, Facilities, Licenses, Areas, Team)
- [ ] All user stories have acceptance criteria met
- [ ] Manual testing checklist 100% passed
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Multi-tenancy verified with multiple organizations
- [ ] Documentation updated with screenshots
- [ ] No TypeScript errors or console warnings
- [ ] Performance: Page loads <2 seconds
- [ ] Accessibility: Basic keyboard navigation works

### MVP Version (Can Ship With):
- [ ] Company Profile (View + Edit)
- [ ] Facilities List (View + Search + Filter)
- [ ] Create Facility Wizard (3 steps)
- [ ] Facility Details (Overview + License tabs)
- [ ] License expiration alerts

### Can Defer to Module 2:
- [ ] Logo upload
- [ ] Document upload for licenses
- [ ] Areas management (can be simplified)
- [ ] Team member invitation (can use Clerk's built-in)
- [ ] Advanced area layout view

---

## ⏱️ Time Estimates

### Conservative Estimate (14 hours)
- Phase 1: Setup & Core (3 hours)
- Phase 2: Company Profile (3 hours)
- Phase 3: Facilities List (4 hours)
- Phase 4: Create Facility (4 hours)
- Phase 5: Areas (Optional, 3 hours)

### Optimistic Estimate (10 hours)
- Experienced with Next.js, Convex, shadcn/ui
- Reusing existing patterns
- Minimal debugging needed

### Realistic Estimate (12 hours)
- Some troubleshooting expected
- First-time component creation
- Testing and refinements

---

## 🚀 Next Steps

1. ✅ Review this planning document
2. ✅ Confirm approach with team/stakeholder
3. [ ] Install dependencies
4. [ ] Create base components
5. [ ] Start with Phase 1: Setup

**Ready to begin implementation?**

Use command: `@implement module-1-company-profile` to start Phase 2!

---

**Document Created By:** Claude (Planning Session)
**Date:** 2025-10-10
**Status:** Ready for Implementation
