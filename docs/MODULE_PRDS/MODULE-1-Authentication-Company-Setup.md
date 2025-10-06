# MODULE 1 PRD: Authentication & Company Setup

**Version**: 1.0
**Date**: January 2025
**Status**: Planning → Ready for Implementation
**Priority**: Critical (Foundation module)

---

## 📋 Module Overview

### Purpose
Establish core authentication system with Colombian company registration. Users can sign up, create their company workspace, log in, and access a protected dashboard.

### Scope
- User registration with minimal required fields
- Integrated company creation during signup
- Login/logout with session management
- Protected routes (redirect to login if not authenticated)
- Spanish-only UI (v1.0)
- Colombian business entity support
- Department/municipality selection

### Out of Scope (Deferred)
- ❌ Email verification → MODULE 2
- ❌ Subscription/Payment → MODULE 3
- ❌ Full company profile completion → MODULE 4
- ❌ MFA setup → MODULE 4
- ❌ English translation → MODULE 4
- ❌ Password reset → MODULE 2

---

## 🎯 User Stories

### As a Colombian Cultivator
1. I want to sign up with minimal information so I can start quickly
2. I want to select my business entity type from Colombian options
3. I want to choose my department and municipality from dropdowns
4. I want my company workspace created automatically when I register
5. I want to be assigned as the company owner
6. I want to log in with email and password
7. I want to see a simple dashboard after login
8. I want to log out securely

---

## 🇨🇴 Colombian Requirements

### Business Entity Types
- S.A.S (Sociedad por Acciones Simplificada)
- S.A. (Sociedad Anónima)
- Ltda (Sociedad Limitada)
- E.U. (Empresa Unipersonal)
- Persona Natural

### Geographic Data
**Departments** (hardcoded list for MODULE 1):
- Antioquia, Atlántico, Bolívar, Boyacá, Caldas, Caquetá, Cauca, Cesar, Córdoba, Cundinamarca, Huila, La Guajira, Magdalena, Meta, Nariño, Norte de Santander, Putumayo, Quindío, Risaralda, Santander, Tolima, Valle del Cauca (22 departments)

**Municipalities**: Simplified dropdown based on selected department (10-20 major municipalities per department)

### Formatting
- **Language**: Spanish (es)
- **Timezone**: America/Bogota (COT -5)
- **Phone format**: +57 XXX XXX XXXX
- **Currency**: COP (no decimals)

---

## ✅ Acceptance Criteria

### Registration Flow
- [ ] User can access `/registro` page
- [ ] Form validates all required fields client-side
- [ ] Form shows Colombian business entity type dropdown
- [ ] Form shows department dropdown (22 options)
- [ ] Form shows municipality dropdown (filtered by selected department)
- [ ] Password must be 8+ characters
- [ ] Email validation (valid format)
- [ ] On submit, creates User + Company in single transaction
- [ ] User assigned "Owner" role automatically
- [ ] Redirects to `/dashboard` after successful registration
- [ ] Shows validation errors in Spanish

### Login Flow
- [ ] User can access `/login` page
- [ ] Form validates email and password
- [ ] Incorrect credentials show error: "Email o contraseña incorrectos"
- [ ] Successful login creates session
- [ ] Redirects to `/dashboard` after login
- [ ] Shows validation errors in Spanish

### Session Management
- [ ] Logged-in user can access `/dashboard`
- [ ] Unauthenticated user redirected to `/login` when accessing `/dashboard`
- [ ] Session persists on page refresh
- [ ] User can log out (destroys session)
- [ ] After logout, redirects to `/login`

### Dashboard (Basic)
- [ ] Shows: "Bienvenido, [User Name]" (Welcome message)
- [ ] Shows company name
- [ ] Shows logout button
- [ ] Shows navigation placeholder (for future modules)

---

## 🏗️ Technical Implementation

### Frontend (Next.js 14)

**Routes**:
- `/registro` - Registration page
- `/login` - Login page
- `/dashboard` - Protected dashboard (basic)
- `/logout` - Logout action

**Components to Build**:
- `RegistrationForm` - Full registration form
- `LoginForm` - Login form
- `Button` - Reusable button component
- `Input` - Reusable input component
- `Select` - Reusable select/dropdown component
- `FormField` - Form field wrapper with label and error
- `DashboardLayout` - Basic layout with header and logout

**Utilities**:
- `colombianData.ts` - Department/municipality data
- `validation.ts` - Zod schemas (shared with backend)
- `authFetch.ts` - Fetch wrapper with session handling

### Backend (Fastify)

**Endpoints**:
- `POST /api/auth/register` - Create user + company
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user info

**Services**:
- `AuthService` - Registration, login, logout logic
- `SessionService` - Lucia session management
- `UserService` - User queries and creation
- `CompanyService` - Company creation

**Middleware**:
- `requireAuth` - Protect routes (check session)
- `tenantContext` - Inject companyId from session

**Database Operations**:
- Create User with hashed password (Argon2)
- Create Company with owner user
- Create Session (Lucia)
- Query User by email
- Query User by session token

---

## 🗄️ Database Models Used

### User Model
**Lines 106-169 in schema.prisma**

**Fields Used**:
- `id` (cuid, auto-generated)
- `email` (unique, required)
- `passwordHash` (required, Argon2)
- `firstName` (required)
- `lastName` (required)
- `companyId` (FK to Company)
- `roleId` (FK to Role - "Owner" role)
- `locale` (default: "es")
- `timezone` (default: "America/Bogota")
- `status` (default: "active")

**Deferred Fields** (NULL for MODULE 1):
- `emailVerified` → MODULE 2
- `phone` → MODULE 4
- `mfaEnabled` → MODULE 4

### Company Model
**Lines 15-79 in schema.prisma**

**Fields Used**:
- `id` (cuid, auto-generated)
- `name` (required)
- `businessEntityType` (required - S.A.S, S.A., Ltda, E.U., Persona Natural)
- `colombianDepartment` (required)
- `daneMunicipalityCode` (optional for MODULE 1)
- `defaultLocale` (default: "es")
- `defaultCurrency` (default: "COP")
- `defaultTimezone` (default: "America/Bogota")
- `subscriptionPlan` (default: "basic" - no payment yet)
- `status` (default: "active")

**Deferred Fields** (NULL for MODULE 1):
- `legalName` → MODULE 4
- `taxId` → MODULE 4
- `primaryContactName/Email/Phone` → MODULE 4
- `addressLine1/2, city, department, postalCode` → MODULE 4

### Role Model
**Lines 81-104 in schema.prisma**

**Pre-seeded Roles** (from seed.ts):
- Owner (level 6)
- Manager (level 5)
- Agronomist (level 4)
- Supervisor (level 3)
- Operator (level 2)
- Viewer (level 1)

**MODULE 1 Usage**: Auto-assign "Owner" role to first user

---

## 🔒 Security Requirements

### Password Security
- Hash: Argon2 (industry standard)
- Min length: 8 characters
- Stored in `User.passwordHash`

### Session Security
- Lucia v3 session management
- Session cookie: `alquemist_session` (httpOnly, secure)
- Session expiration: 30 days (default)
- CSRF protection: SameSite=Lax

### Input Validation
- Zod schemas shared between frontend/backend
- Sanitize all user input
- SQL injection protection via Prisma (parameterized queries)

### Rate Limiting (Future)
- Deferred to MODULE 2

---

## 📊 Success Metrics

### Performance
- Registration completion time: < 3 minutes
- Page load time: < 2 seconds
- API response time: < 500ms

### User Experience
- Form validation: Instant client-side feedback
- Error messages: Clear Spanish text
- Registration success rate: > 85%

---

## 🔗 Dependencies

### Required
- PostgreSQL (running)
- Redis (running - for Lucia sessions)
- Prisma Client (generated)
- Database seeded with Roles

### npm Packages (New)
- `lucia` - Authentication library
- `argon2` - Password hashing
- `zod` - Validation
- `react-hook-form` - Form management
- `@headlessui/react` - Accessible UI components

---

## 📁 Deliverables

### Frontend Files
- 7 React components (Button, Input, Select, FormField, RegistrationForm, LoginForm, DashboardLayout)
- 3 pages (registro, login, dashboard)
- 1 utility file (colombianData.ts)
- 1 validation file (validation.ts with Zod schemas)
- Spanish translations JSON

### Backend Files
- 1 routes file (auth.ts)
- 3 service files (AuthService, UserService, CompanyService)
- 1 middleware file (requireAuth.ts)
- 1 Lucia config file (lucia.ts)
- 1 shared types file (auth.ts in packages/types)

### Total Estimated Files: ~15-20 files

---

## ⏱️ Estimated Timeline

- **Frontend Development**: 2-3 days
- **Backend Development**: 2-3 days
- **Integration & Testing**: 1 day
- **Total**: 5-7 days

---

## 🚀 Implementation Order

1. **Backend First** (foundation)
   - Lucia setup
   - Auth endpoints
   - Database operations
   - Validation schemas

2. **Frontend** (UI)
   - Base UI components
   - Registration/Login forms
   - Colombian data utilities
   - Dashboard basic layout

3. **Integration**
   - Connect forms to API
   - Session handling
   - Error handling
   - Testing

---

## 📝 Notes

- Spanish-only for speed (English in MODULE 4)
- Minimal company fields (full profile in MODULE 4)
- No email verification yet (MODULE 2)
- No payment/subscription (MODULE 3)
- Owner role auto-assigned (multi-user invites in MODULE 4)
- DANE codes simplified (full dataset later if needed)

---

**Ready for Backlog Generation**: ✅
**Next Step**: Create Frontend + Backend Backlogs
