# Phase 1 Development Plan: Onboarding & Authentication

**Alquemist - Next.js Frontend Implementation**
**Created**: 2025-11-27
**Status**: In Progress

---

## Overview

This document tracks the implementation and testing of Phase 1 (Onboarding & Authentication) for the Next.js frontend. All work references the wireframes in [/docs/ui/nextjs/PHASE-1-ONBOARDING-WIREFRAMES.md](../ui/nextjs/PHASE-1-ONBOARDING-WIREFRAMES.md).

### Phase 1 Scope
- **Total Modules**: 6 (Modules 1-4, 5, 6)
- **Total Screens**: 12 pages (11 wireframes + 1 login)
- **User Flows**: 2 (First User + Invited User)
- **External Integrations**: Convex backend, Resend email

---

## Module Breakdown

### Module 1: User Registration & Email Verification
**Screens**: Page 1 (Signup), Page 2 (Email Verification)
**Status**: 🔴 Not Started
**Priority**: P0 (Critical - Blocks all other flows)

#### Tasks

##### 1.1 Signup Form Implementation
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can work in parallel with other modules)
- [ ] **Wireframe**: Page 1 - Signup Form (Desktop & Mobile)
- [ ] **Dependencies**: None
- [ ] **Deliverables**:
  - [ ] Create form validation schema (Zod) for signup
  - [ ] Implement signup form UI with React Hook Form
  - [ ] Add real-time email availability check
  - [ ] Add password strength indicator
  - [ ] Implement show/hide password toggle
  - [ ] Add terms & conditions checkbox with modal/link
  - [ ] Create Server Action for user registration
  - [ ] Integrate Convex `registration.registerUserStep1` mutation
  - [ ] Integrate Resend email sending
  - [ ] Handle success/error states
  - [ ] Add loading states with spinner
- [ ] **Testing Requirements**:
  - [ ] Unit test: Zod schema validation (all edge cases)
  - [ ] Unit test: Email availability check
  - [ ] Integration test: Full signup flow
  - [ ] Integration test: Duplicate email prevention
  - [ ] E2E test: Signup → Email sent confirmation
  - [ ] Visual regression: Desktop and mobile layouts

##### 1.2 Email Verification Implementation
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (depends on 1.1 for testing)
- [ ] **Wireframe**: Page 2 - Email Verification (Desktop & Mobile)
- [ ] **Dependencies**: Task 1.1 (for integration testing)
- [ ] **Deliverables**:
  - [ ] Create 6-digit code input component with auto-advance
  - [ ] Implement countdown timer (24 hours) with visual progress
  - [ ] Add manual code verification
  - [ ] Add auto-verification from email link (token in URL)
  - [ ] Implement resend email functionality
  - [ ] Integrate Convex `emailVerification.verifyEmail` mutation
  - [ ] Handle expired/invalid codes
  - [ ] Add success animation (checkmark)
  - [ ] Redirect to Company Setup on success
- [ ] **Testing Requirements**:
  - [ ] Unit test: Code input component behavior
  - [ ] Unit test: Timer countdown logic
  - [ ] Integration test: Manual code verification
  - [ ] Integration test: Email link auto-verification
  - [ ] Integration test: Code expiration handling
  - [ ] Integration test: Resend email flow
  - [ ] E2E test: Full verification flow
  - [ ] Visual regression: Desktop and mobile layouts

---

### Module 2: Company Setup
**Screens**: Page 3 (Company Setup)
**Status**: 🔴 Not Started
**Priority**: P0 (Critical - Required for facility creation)

#### Tasks

##### 2.1 Company Setup Form Implementation
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can work in parallel with Module 1)
- [ ] **Wireframe**: Page 3 - Company Setup (Desktop & Mobile)
- [ ] **Dependencies**: Module 1 (for full flow testing)
- [ ] **Deliverables**:
  - [ ] Create form validation schema (Zod) for company
  - [ ] Implement company information form
  - [ ] Add business type dropdown with predefined options
  - [ ] Add industry dropdown with predefined options
  - [ ] Implement cascading location dropdowns (Department → Municipality)
  - [ ] Integrate Convex `geographic.getDepartments` query
  - [ ] Integrate Convex `geographic.getMunicipalities` query
  - [ ] Integrate Convex `companies.create` mutation
  - [ ] Add progress indicator (Paso 1 de 3)
  - [ ] Handle success/error states
  - [ ] Redirect to Facility Setup on success (skip Plan page for MVP)
- [ ] **Testing Requirements**:
  - [ ] Unit test: Zod schema validation
  - [ ] Unit test: Cascading dropdown logic
  - [ ] Integration test: Department/Municipality data loading
  - [ ] Integration test: Company creation
  - [ ] Integration test: Timezone setting from municipality
  - [ ] Integration test: Trial plan default assignment
  - [ ] E2E test: Complete company setup flow
  - [ ] Visual regression: Desktop and mobile layouts

---

### Module 3: Subscription & Payments
**Screens**: Page 4 (Choose Plan)
**Status**: ⚪ Skipped for MVP
**Priority**: P3 (Future - Post-MVP)

#### Tasks

##### 3.1 Plan Selection (Optional for MVP)
- [ ] **Status**: Skipped
- [ ] **Assignable**: N/A
- [ ] **Wireframe**: Page 4 - Choose Plan (Desktop & Mobile)
- [ ] **Dependencies**: None
- [ ] **Notes**:
  - All users default to Trial plan
  - Page exists in wireframes but not implemented
  - Will be implemented post-MVP validation

---

### Module 4: Facility Setup
**Screens**: Page 5 (Basic Info), Page 6 (Location), Page 7 (Complete)
**Status**: 🔴 Not Started
**Priority**: P0 (Critical - Core onboarding completion)

#### Tasks

##### 4.1 Facility Basic Info Implementation
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can work in parallel with Modules 1-2)
- [ ] **Wireframe**: Page 5 - Add Facility - Basic Info (Desktop & Mobile)
- [ ] **Dependencies**: Module 2 (for full flow testing)
- [ ] **Deliverables**:
  - [ ] Create form validation schema (Zod) for facility basic info
  - [ ] Implement facility name input
  - [ ] Implement license number input
  - [ ] Add license type radio buttons (single selection)
  - [ ] Implement licensed area input (numeric, m²)
  - [ ] Add primary crops checkboxes (multiple selection)
  - [ ] Add progress indicator (Paso 2 de 3)
  - [ ] Store form data in local state (not DB yet)
  - [ ] Navigate to Location page on continue
  - [ ] Preserve data when navigating back
- [ ] **Testing Requirements**:
  - [ ] Unit test: Zod schema validation
  - [ ] Unit test: Form state persistence
  - [ ] Unit test: Radio button behavior
  - [ ] Unit test: Checkbox behavior (multiple selection)
  - [ ] Integration test: Navigation with data preservation
  - [ ] E2E test: Multi-step form flow
  - [ ] Visual regression: Desktop and mobile layouts

##### 4.2 Facility Location Implementation
- [ ] **Status**: Not Started
- [ ] **Assignable**: Depends on 4.1 completion
- [ ] **Wireframe**: Page 6 - Add Facility - Location (Desktop & Mobile)
- [ ] **Dependencies**: Task 4.1
- [ ] **Deliverables**:
  - [ ] Create form validation schema (Zod) for location
  - [ ] Pre-fill department from company data
  - [ ] Implement cascading municipality dropdown
  - [ ] Add address text input
  - [ ] Implement GPS coordinate inputs (latitude/longitude)
  - [ ] Add "Get My Location" button with browser geolocation API
  - [ ] Handle geolocation success/error states
  - [ ] Add climate zone radio buttons
  - [ ] Implement back button (preserves data, returns to Page 5)
  - [ ] Integrate Convex `facilities.create` mutation (combines Basic + Location data)
  - [ ] Validate facility count against company plan limits
  - [ ] Set currentFacilityId in users table
  - [ ] Navigate to Setup Complete on success
- [ ] **Testing Requirements**:
  - [ ] Unit test: Zod schema validation
  - [ ] Unit test: GPS coordinate validation
  - [ ] Unit test: Geolocation API integration
  - [ ] Integration test: Municipality cascading from department
  - [ ] Integration test: Facility creation with all data
  - [ ] Integration test: Plan limit enforcement
  - [ ] Integration test: currentFacilityId assignment
  - [ ] E2E test: Complete facility creation flow
  - [ ] E2E test: Back button data preservation
  - [ ] Visual regression: Desktop and mobile layouts

##### 4.3 Setup Complete Page
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (low priority, simple static page)
- [ ] **Wireframe**: Page 7 - Setup Complete (Desktop & Mobile)
- [ ] **Dependencies**: Task 4.2
- [ ] **Deliverables**:
  - [ ] Display success message
  - [ ] Show company and facility names from context
  - [ ] Display guidance about next steps (Phase 2)
  - [ ] Add "Go to Dashboard" CTA button
  - [ ] Redirect to /dashboard on button click
- [ ] **Testing Requirements**:
  - [ ] Integration test: Data display accuracy
  - [ ] E2E test: Redirect to dashboard
  - [ ] Visual regression: Desktop and mobile layouts

---

### Module 5: User Invitations
**Screens**: Page 8 (Accept Invitation), Page 9 (Set Password), Page 10 (Welcome), Page 11 (Invalid)
**Status**: 🔴 Not Started
**Priority**: P1 (Important - Team collaboration)

#### Tasks

##### 5.1 Accept Invitation Landing
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can work in parallel with other modules)
- [ ] **Wireframe**: Page 8 - Accept Invitation Landing (Desktop & Mobile)
- [ ] **Dependencies**: None (independent flow)
- [ ] **Deliverables**:
  - [ ] Extract and validate token from URL on page load
  - [ ] Integrate Convex `invitations.validate` query
  - [ ] Display invitation details (company, role, inviter, facilities)
  - [ ] Show user email
  - [ ] Implement countdown timer (72 hours from invitation)
  - [ ] Add "Accept" button (navigates to Set Password)
  - [ ] Add "Reject" button with confirmation modal
  - [ ] Integrate Convex `invitations.reject` mutation
  - [ ] Handle invalid/expired tokens (redirect to Page 11)
- [ ] **Testing Requirements**:
  - [ ] Unit test: Token extraction from URL
  - [ ] Unit test: Timer countdown logic
  - [ ] Integration test: Token validation
  - [ ] Integration test: Invitation data display
  - [ ] Integration test: Reject flow with confirmation
  - [ ] Integration test: Invalid token redirect
  - [ ] E2E test: Full invitation acceptance flow
  - [ ] Visual regression: Desktop and mobile layouts

##### 5.2 Set Password for Invited User
- [ ] **Status**: Not Started
- [ ] **Assignable**: Depends on 5.1 completion
- [ ] **Wireframe**: Page 9 - Set Password (Desktop & Mobile)
- [ ] **Dependencies**: Task 5.1
- [ ] **Deliverables**:
  - [ ] Create form validation schema (Zod) for password
  - [ ] Implement password inputs with show/hide toggle
  - [ ] Add password requirements checklist with live validation
  - [ ] Add optional phone number input
  - [ ] Add language preference radio buttons (Español/English)
  - [ ] Implement back button (returns to Page 8)
  - [ ] Integrate Convex `invitations.accept` mutation
  - [ ] Auto-login on success (receive authToken)
  - [ ] Navigate to Welcome page on success
- [ ] **Testing Requirements**:
  - [ ] Unit test: Zod schema validation
  - [ ] Unit test: Password requirements checklist logic
  - [ ] Integration test: Account creation
  - [ ] Integration test: Auto-login after acceptance
  - [ ] E2E test: Complete password setup flow
  - [ ] Visual regression: Desktop and mobile layouts

##### 5.3 Welcome Page (Invited User)
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (low priority, simple static page)
- [ ] **Wireframe**: Page 10 - Welcome (Desktop & Mobile)
- [ ] **Dependencies**: Task 5.2
- [ ] **Deliverables**:
  - [ ] Display success message
  - [ ] Show company name and user role
  - [ ] Display assigned facilities list
  - [ ] Add "Go to Dashboard" CTA button
  - [ ] Redirect to /dashboard on button click
- [ ] **Testing Requirements**:
  - [ ] Integration test: Data display accuracy
  - [ ] E2E test: Redirect to dashboard
  - [ ] Visual regression: Desktop and mobile layouts

##### 5.4 Invitation Invalid Page
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (low priority, simple error page)
- [ ] **Wireframe**: Page 11 - Invitation Invalid (Desktop & Mobile)
- [ ] **Dependencies**: None
- [ ] **Deliverables**:
  - [ ] Display error message with warning icon
  - [ ] Show list of possible reasons
  - [ ] Add instructions to contact administrator
  - [ ] Add "Go to Login" button
  - [ ] Redirect to /login on button click
- [ ] **Testing Requirements**:
  - [ ] Integration test: Redirect to login
  - [ ] Visual regression: Desktop and mobile layouts

---

### Module 6: Login & Session Management
**Screens**: Page 12 (Login)
**Status**: 🔴 Not Started
**Priority**: P0 (Critical - Required for returning users)

#### Tasks

##### 6.1 Login Form Implementation
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can work in parallel with other modules)
- [ ] **Wireframe**: Page 12 - Login (Desktop & Mobile)
- [ ] **Dependencies**: None (independent flow)
- [ ] **Deliverables**:
  - [ ] Create form validation schema (Zod) for login
  - [ ] Implement email and password inputs
  - [ ] Add show/hide password toggle
  - [ ] Add "Forgot Password" link (future functionality)
  - [ ] Integrate Convex `auth.login` mutation
  - [ ] Store authToken in secure storage
  - [ ] Redirect to /dashboard on success
  - [ ] Display error message for invalid credentials
  - [ ] Add link to signup page
- [ ] **Testing Requirements**:
  - [ ] Unit test: Zod schema validation
  - [ ] Integration test: Successful login
  - [ ] Integration test: Invalid credentials handling
  - [ ] Integration test: Token storage
  - [ ] E2E test: Full login flow
  - [ ] E2E test: Login → Dashboard redirect
  - [ ] Visual regression: Desktop and mobile layouts

##### 6.2 Session Management
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can work in parallel with 6.1)
- [ ] **Wireframe**: N/A (backend integration)
- [ ] **Dependencies**: None
- [ ] **Deliverables**:
  - [ ] Create auth context provider
  - [ ] Implement token refresh logic
  - [ ] Add session expiration handling
  - [ ] Create protected route wrapper
  - [ ] Implement logout functionality
  - [ ] Add auth state persistence
  - [ ] Handle concurrent session management
- [ ] **Testing Requirements**:
  - [ ] Unit test: Auth context logic
  - [ ] Integration test: Token refresh
  - [ ] Integration test: Session expiration
  - [ ] Integration test: Protected route access
  - [ ] E2E test: Full session lifecycle

---

## Shared Components & Utilities

### Shared Tasks (Cross-Module)
**Status**: 🔴 Not Started
**Priority**: P0 (Required by multiple modules)

#### Shared.1 Form Components
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can be developed early)
- [ ] **Dependencies**: None
- [ ] **Deliverables**:
  - [ ] Create reusable FormField component
  - [ ] Create PasswordInput component with toggle
  - [ ] Create PhoneInput component with formatting
  - [ ] Create CascadingSelect component
  - [ ] Create CodeInput component (6 digits, auto-advance)
  - [ ] Create ProgressIndicator component
  - [ ] Create CountdownTimer component
- [ ] **Testing Requirements**:
  - [ ] Unit tests for each component
  - [ ] Storybook stories for visual testing
  - [ ] Accessibility tests (a11y)

#### Shared.2 Validation Schemas
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can be developed early)
- [ ] **Dependencies**: None
- [ ] **Deliverables**:
  - [ ] Create signup validation schema
  - [ ] Create company validation schema
  - [ ] Create facility validation schema
  - [ ] Create login validation schema
  - [ ] Create password validation schema
  - [ ] Create reusable validation helpers
- [ ] **Testing Requirements**:
  - [ ] Unit tests for all schemas
  - [ ] Edge case validation tests

#### Shared.3 Type Definitions
- [ ] **Status**: Not Started
- [ ] **Assignable**: Yes (can be developed early)
- [ ] **Dependencies**: None
- [ ] **Deliverables**:
  - [ ] Define User types
  - [ ] Define Company types
  - [ ] Define Facility types
  - [ ] Define Invitation types
  - [ ] Define Auth types
  - [ ] Define Form state types
- [ ] **Testing Requirements**:
  - [ ] TypeScript compilation tests

---

## Integration Points

### Convex Backend Integration
**Priority**: P0 (Critical)

#### Convex.1 Authentication Endpoints
- [ ] **Status**: Not Started
- [ ] **Required For**: Module 1, Module 6
- [ ] **Endpoints**:
  - [ ] `registration.registerUserStep1` - User signup
  - [ ] `emailVerification.verifyEmail` - Email verification
  - [ ] `emailVerification.resendVerification` - Resend email
  - [ ] `auth.login` - User login
  - [ ] `auth.checkEmailAvailability` - Email uniqueness check
- [ ] **Testing**:
  - [ ] API contract tests
  - [ ] Error handling tests

#### Convex.2 Onboarding Endpoints
- [ ] **Status**: Not Started
- [ ] **Required For**: Module 2, Module 4
- [ ] **Endpoints**:
  - [ ] `companies.create` - Company creation
  - [ ] `facilities.create` - Facility creation
  - [ ] `geographic.getDepartments` - Load departments
  - [ ] `geographic.getMunicipalities` - Load municipalities
- [ ] **Testing**:
  - [ ] API contract tests
  - [ ] Data validation tests

#### Convex.3 Invitation Endpoints
- [ ] **Status**: Not Started
- [ ] **Required For**: Module 5
- [ ] **Endpoints**:
  - [ ] `invitations.validate` - Validate token
  - [ ] `invitations.accept` - Accept invitation
  - [ ] `invitations.reject` - Reject invitation
- [ ] **Testing**:
  - [ ] API contract tests
  - [ ] Token expiration tests

### Resend Email Integration
**Priority**: P0 (Critical)

#### Resend.1 Email Service Setup
- [ ] **Status**: Not Started
- [ ] **Required For**: Module 1
- [ ] **Deliverables**:
  - [ ] Configure Resend API key
  - [ ] Test email sending in development
  - [ ] Configure email templates
  - [ ] Setup email tracking (optional)
- [ ] **Testing**:
  - [ ] Send test verification email
  - [ ] Send test invitation email
  - [ ] Verify email delivery

---

## Parallel Development Opportunities

### Stream 1: Authentication Flow (P0)
**Team Members**: 2-3 developers
**Timeline**: Week 1-2

```
Developer A:
- Module 1.1: Signup Form
- Module 1.2: Email Verification
- Shared.2: Validation Schemas (auth-related)

Developer B:
- Module 6.1: Login Form
- Module 6.2: Session Management
- Convex.1: Authentication Endpoints

Developer C (optional):
- Shared.1: Form Components
- Shared.3: Type Definitions
- Resend.1: Email Service Setup
```

### Stream 2: Onboarding Flow (P0)
**Team Members**: 2-3 developers
**Timeline**: Week 2-3 (can start in parallel with Stream 1)

```
Developer D:
- Module 2.1: Company Setup
- Shared.2: Validation Schemas (company-related)
- Convex.2: Onboarding Endpoints (companies)

Developer E:
- Module 4.1: Facility Basic Info
- Module 4.2: Facility Location
- Module 4.3: Setup Complete
- Shared.2: Validation Schemas (facility-related)
- Convex.2: Onboarding Endpoints (facilities)
```

### Stream 3: Invitation Flow (P1)
**Team Members**: 1-2 developers
**Timeline**: Week 3-4 (can start after Stream 1 basics)

```
Developer F:
- Module 5.1: Accept Invitation
- Module 5.2: Set Password
- Module 5.3: Welcome Page
- Module 5.4: Invalid Page
- Convex.3: Invitation Endpoints
```

### Stream 4: Shared Infrastructure (P0)
**Team Members**: 1 developer
**Timeline**: Week 1-4 (continuous)

```
Developer G:
- Shared.1: Form Components (as needed)
- Shared.2: Validation Schemas (as needed)
- Shared.3: Type Definitions (as needed)
- Code review and integration support
```

---

## Testing Strategy

### Unit Testing
**Tool**: Jest + React Testing Library
**Coverage Target**: 80%+

- [ ] All Zod schemas validated
- [ ] All components tested in isolation
- [ ] All utility functions tested
- [ ] Edge cases covered

### Integration Testing
**Tool**: Jest + React Testing Library + MSW
**Coverage Target**: 70%+

- [ ] Full form submission flows
- [ ] API integration with mocked Convex
- [ ] Multi-step form navigation
- [ ] Error handling scenarios

### E2E Testing
**Tool**: Playwright
**Coverage Target**: Critical paths

- [ ] First user complete onboarding flow
- [ ] Invited user complete acceptance flow
- [ ] Login and session management
- [ ] Mobile responsive layouts

### Visual Regression Testing
**Tool**: Percy or Chromatic
**Coverage**: All pages

- [ ] Desktop layouts (1280px)
- [ ] Mobile layouts (375px)
- [ ] Tablet layouts (768px)

---

## Definition of Done (DoD)

### For Each Task
- [ ] Code implemented according to wireframe
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if applicable)
- [ ] TypeScript compilation with no errors
- [ ] ESLint passing with no warnings
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Accessibility (a11y) standards met
- [ ] Code reviewed and approved
- [ ] Merged to main branch

### For Each Module
- [ ] All module tasks completed
- [ ] E2E tests written and passing
- [ ] Visual regression tests passing
- [ ] Documentation updated
- [ ] Demo to stakeholders completed
- [ ] User acceptance testing passed

### For Phase 1 Complete
- [ ] All 6 modules completed
- [ ] All flows tested end-to-end
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Production deployment successful
- [ ] Monitoring and alerts configured

---

## Risk Management

### High Risk Items
1. **Resend Email Deliverability**
   - **Risk**: Emails going to spam
   - **Mitigation**: Configure SPF, DKIM, DMARC records
   - **Owner**: DevOps + Developer A

2. **Convex Backend Availability**
   - **Risk**: Backend not ready for frontend integration
   - **Mitigation**: Use MSW mocks for parallel development
   - **Owner**: Backend team + Frontend leads

3. **Browser Geolocation Reliability**
   - **Risk**: Users denying location permissions
   - **Mitigation**: Always allow manual GPS entry
   - **Owner**: Developer E

### Medium Risk Items
1. **Colombian Geographic Data Accuracy**
   - **Risk**: Incorrect department/municipality data
   - **Mitigation**: Validate against official sources
   - **Owner**: Developer D

2. **Multi-step Form State Management**
   - **Risk**: Data loss on navigation
   - **Mitigation**: Use URL params + session storage
   - **Owner**: Developer E

---

## Success Metrics

### User Experience
- [ ] < 5 minutes to complete first user onboarding
- [ ] < 2 minutes to accept invitation
- [ ] < 30 seconds to login
- [ ] 95%+ task completion rate

### Technical Performance
- [ ] < 2s page load time (LCP)
- [ ] < 100ms form interaction (FID)
- [ ] < 0.1 layout shift (CLS)
- [ ] 100% TypeScript type coverage

### Quality
- [ ] 80%+ unit test coverage
- [ ] 70%+ integration test coverage
- [ ] 0 critical accessibility violations
- [ ] 0 production bugs in first week

---

## Status Legend

- 🔴 **Not Started**: Task not yet begun
- 🟡 **In Progress**: Task currently being worked on
- 🟢 **Completed**: Task finished and merged
- ⚪ **Skipped**: Task intentionally not implemented (MVP scope)
- 🔵 **Blocked**: Task waiting on dependency
- 🟣 **In Review**: Task completed, awaiting code review

---

## Next Steps

1. **Immediate** (This Week):
   - [ ] Review and approve this development plan
   - [ ] Assign developers to streams
   - [ ] Set up project board with all tasks
   - [ ] Configure testing infrastructure
   - [ ] Start Stream 4 (Shared Infrastructure)

2. **Week 1**:
   - [ ] Kick off Stream 1 (Authentication Flow)
   - [ ] Begin Shared Components development
   - [ ] Set up Resend email service

3. **Week 2**:
   - [ ] Complete Stream 1 core features
   - [ ] Kick off Stream 2 (Onboarding Flow)
   - [ ] Begin integration testing

4. **Week 3**:
   - [ ] Complete Stream 2
   - [ ] Kick off Stream 3 (Invitation Flow)
   - [ ] Begin E2E testing

5. **Week 4**:
   - [ ] Complete Stream 3
   - [ ] Final integration testing
   - [ ] Performance optimization
   - [ ] Production deployment preparation

---

**Document Owner**: Development Team Lead
**Last Updated**: 2025-11-27
**Next Review**: Weekly sprint planning
