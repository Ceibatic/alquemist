# Frontend Backlog - MODULE 1: Authentication & Company Setup

**Module**: Authentication & Company Setup
**Subagent**: @frontend
**Priority**: Critical
**Dependencies**: None (foundation module)
**Estimated Duration**: 2-3 days

---

## 📋 Module Overview

Build Spanish-only authentication UI for Colombian users. Create registration flow with integrated company setup, login/logout functionality, and basic protected dashboard. Focus on minimal required fields for quick onboarding.

Key deliverables: Reusable UI components (Button, Input, Select, FormField), registration/login forms with Colombian business entity selection, department/municipality dropdowns, and basic dashboard layout.

---

## 🎯 Epics & Tasks

### Epic 1: Design System Setup & Base UI Components

**Purpose**: Integrate existing Tailwind design system and build foundational reusable components following established Colombian color palette.

**Tasks**:
1. Copy design system CSS from `docs/tailwind-styles.css` to `apps/web/src/app/globals.css`
2. Configure Tailwind to use design tokens (primary: #f5b700 yellow, accent: #005611 green, destructive: #ef4444 red)
3. Set up fonts: Inter (sans), Source Serif 4 (serif), JetBrains Mono (mono)
4. Build `Button` component using design tokens:
   - Primary variant: `bg-primary text-primary-foreground` (yellow button)
   - Secondary variant: `bg-secondary text-secondary-foreground` (light gray)
   - Destructive variant: `bg-destructive text-destructive-foreground` (red)
   - Disabled state: `opacity-50 cursor-not-allowed`
   - Loading state: spinner with `animate-spin`
5. Build `Input` component using design tokens:
   - Base: `border-input bg-background text-foreground`
   - Focus: `ring-ring ring-2`
   - Error: `border-destructive`
   - Includes label, error message display, validation states
6. Build `Select` component (dropdown) using design tokens:
   - Use `@headlessui/react` Listbox for accessibility
   - Styling: `border-input bg-background text-foreground`
   - Popover: `bg-popover text-popover-foreground shadow-lg`
   - Search functionality for departments/municipalities
7. Build `FormField` wrapper component that combines label + input/select + error message
8. Create `colombianData.ts` utility with department list (22 departments) and municipality mappings

### Epic 2: Registration Flow

**Purpose**: Complete user registration with integrated company creation, Colombian business entity selection, and geographic data.

**Tasks**:
1. Create `/registro` page with full registration form layout
2. Build `RegistrationForm` component with fields: firstName, lastName, email, password, confirmPassword
3. Add company fields: companyName, businessEntityType (S.A.S, S.A., Ltda, E.U., Persona Natural)
4. Add Colombian location fields: department (dropdown), municipality (filtered dropdown based on department)
5. Implement Zod validation schemas for registration form (shared with backend)
6. Add client-side validation with Spanish error messages
7. Integrate with `POST /api/auth/register` endpoint
8. Handle success: redirect to `/dashboard`
9. Handle errors: display Spanish error messages (e.g., "Este email ya está registrado")
10. Add loading state during submission

### Epic 3: Login Flow

**Purpose**: User authentication with session creation.

**Tasks**:
1. Create `/login` page with login form layout
2. Build `LoginForm` component with fields: email, password
3. Add Zod validation for login form
4. Integrate with `POST /api/auth/login` endpoint
5. Handle success: create session, redirect to `/dashboard`
6. Handle errors: show "Email o contraseña incorrectos" message
7. Add "¿Olvidaste tu contraseña?" link (disabled/placeholder for MODULE 2)
8. Add "¿No tienes cuenta? Regístrate" link to `/registro`

### Epic 4: Dashboard & Session Management

**Purpose**: Protected dashboard with basic user info display and logout functionality.

**Tasks**:
1. Create `/dashboard` page with protected route logic
2. Build `DashboardLayout` component with header, navigation placeholder, and content area
3. Add session check: redirect to `/login` if not authenticated
4. Fetch current user data with `GET /api/auth/me` on mount
5. Display welcome message: "Bienvenido, [firstName] [lastName]"
6. Display company name below welcome message
7. Add logout button in header
8. Implement logout: call `POST /api/auth/logout`, clear session, redirect to `/login`
9. Add navigation placeholder for future modules (empty for now)

### Epic 5: Shared Utilities & Types

**Purpose**: Shared code for validation, API calls, and type safety.

**Tasks**:
1. Create `packages/types/src/auth.ts` with User, Company, Session types
2. Create `apps/web/src/lib/validation.ts` with Zod schemas (RegisterSchema, LoginSchema)
3. Create `apps/web/src/lib/authFetch.ts` - fetch wrapper that handles session cookies
4. Add Spanish translation constants file: `apps/web/src/lib/i18n/es.json` (auth strings)

---

## 📁 Files to Create

### New Files

**Components** (7 files):
- `apps/web/src/components/ui/Button.tsx`
- `apps/web/src/components/ui/Input.tsx`
- `apps/web/src/components/ui/Select.tsx`
- `apps/web/src/components/ui/FormField.tsx`
- `apps/web/src/components/auth/RegistrationForm.tsx`
- `apps/web/src/components/auth/LoginForm.tsx`
- `apps/web/src/components/layout/DashboardLayout.tsx`

**Pages** (3 files):
- `apps/web/src/app/registro/page.tsx`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/dashboard/page.tsx`

**Utilities** (4 files):
- `apps/web/src/lib/colombianData.ts` (departments & municipalities)
- `apps/web/src/lib/validation.ts` (Zod schemas)
- `apps/web/src/lib/authFetch.ts` (API wrapper)
- `apps/web/src/lib/i18n/es.json` (Spanish translations)

**Types** (1 file):
- `packages/types/src/auth.ts` (shared types)

**Styles** (1 file):
- `apps/web/src/app/globals.css` (copy from `docs/tailwind-styles.css` + add base styles)

**Config** (1 file):
- `apps/web/tailwind.config.js` (extend with design tokens)

**Total**: ~17 files

### Modified Files
- `apps/web/src/app/layout.tsx` (add base fonts, metadata, dark mode support)
- `apps/web/package.json` (add dependencies: react-hook-form, zod, @headlessui/react)

---

## 🔌 Integration Points

### Backend API Endpoints Needed

#### Endpoint 1: User Registration
- **Method & Path**: `POST /api/auth/register`
- **Purpose**: Create new user and company in single transaction
- **Request**:
  ```typescript
  {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    businessEntityType: string;
    department: string;
    municipality?: string;
  }
  ```
- **Response**:
  ```typescript
  {
    data: {
      user: { id, email, firstName, lastName },
      company: { id, name }
    }
  }
  ```
- **Errors**:
  - 400: Validation error (e.g., "Email ya registrado")
  - 500: Server error

#### Endpoint 2: User Login
- **Method & Path**: `POST /api/auth/login`
- **Purpose**: Authenticate user and create session
- **Request**: `{ email: string; password: string }`
- **Response**:
  ```typescript
  {
    data: {
      user: { id, email, firstName, lastName, companyId },
      session: { id, expiresAt }
    }
  }
  ```
- **Errors**:
  - 400: "Email o contraseña incorrectos"
  - 500: Server error

#### Endpoint 3: Get Current User
- **Method & Path**: `GET /api/auth/me`
- **Purpose**: Get logged-in user data (for dashboard)
- **Auth**: Required (session cookie)
- **Response**:
  ```typescript
  {
    data: {
      user: { id, email, firstName, lastName, roleId },
      company: { id, name, businessEntityType, department }
    }
  }
  ```
- **Errors**:
  - 401: Not authenticated
  - 500: Server error

#### Endpoint 4: Logout
- **Method & Path**: `POST /api/auth/logout`
- **Purpose**: Destroy session
- **Auth**: Required (session cookie)
- **Response**: `{ success: true }`
- **Errors**:
  - 401: Not authenticated

### Data Contracts

**Types Needed** (create in `packages/types/src/auth.ts`):
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  roleId: string;
  locale: string;
  timezone: string;
}

export interface Company {
  id: string;
  name: string;
  businessEntityType: string;
  colombianDepartment: string;
  defaultLocale: string;
  defaultCurrency: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  businessEntityType: string;
  department: string;
  municipality?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
```

---

## 🧩 Available Components for Reuse

**None yet** - This is MODULE 1, all components are new.

---

## 🇨🇴 Colombian Localization

### Spanish Labels & Messages

**Registration Form**:
- Nombres: "Nombre(s)"
- Apellidos: "Apellido(s)"
- Email: "Correo Electrónico"
- Contraseña: "Contraseña"
- Confirmar Contraseña: "Confirmar Contraseña"
- Nombre de Empresa: "Nombre de la Empresa"
- Tipo de Entidad: "Tipo de Entidad Comercial"
- Departamento: "Departamento"
- Municipio: "Municipio"
- Button: "Crear Cuenta"

**Login Form**:
- Email: "Correo Electrónico"
- Contraseña: "Contraseña"
- Button: "Iniciar Sesión"
- Forgot password: "¿Olvidaste tu contraseña?"
- No account: "¿No tienes cuenta? Regístrate"

**Dashboard**:
- Welcome: "Bienvenido, [name]"
- Company: "Empresa: [company name]"
- Logout: "Cerrar Sesión"

**Error Messages**:
- Email required: "El correo electrónico es obligatorio"
- Invalid email: "Correo electrónico inválido"
- Password required: "La contraseña es obligatoria"
- Password min length: "La contraseña debe tener al menos 8 caracteres"
- Passwords don't match: "Las contraseñas no coinciden"
- Email already exists: "Este correo electrónico ya está registrado"
- Invalid credentials: "Email o contraseña incorrectos"
- Server error: "Error del servidor. Inténtalo de nuevo."

### Business Entity Types (Spanish)
- S.A.S - Sociedad por Acciones Simplificada
- S.A. - Sociedad Anónima
- Ltda - Sociedad Limitada
- E.U. - Empresa Unipersonal
- Persona Natural

### Departments (22)
Antioquia, Atlántico, Bolívar, Boyacá, Caldas, Caquetá, Cauca, Cesar, Córdoba, Cundinamarca, Huila, La Guajira, Magdalena, Meta, Nariño, Norte de Santander, Putumayo, Quindío, Risaralda, Santander, Tolima, Valle del Cauca

---

## ✅ Acceptance Criteria

### Registration Flow
- [ ] All UI components render correctly with Spanish labels
- [ ] Department dropdown shows 22 Colombian departments
- [ ] Municipality dropdown filters based on selected department
- [ ] Business entity dropdown shows 5 Colombian entity types
- [ ] Client-side validation shows Spanish error messages immediately
- [ ] Form submits to backend and handles success (redirect to dashboard)
- [ ] Form handles backend errors and displays Spanish messages
- [ ] Loading state shown during submission (button disabled + spinner)

### Login Flow
- [ ] Login form validates email and password
- [ ] Invalid credentials show "Email o contraseña incorrectos"
- [ ] Successful login redirects to `/dashboard`
- [ ] Session cookie is set and persists on refresh

### Dashboard
- [ ] Unauthenticated users redirected to `/login`
- [ ] Authenticated users see welcome message with their name
- [ ] Company name displayed correctly
- [ ] Logout button works (destroys session, redirects to login)

---

## 🎨 Design System Reference

**Existing Design Tokens** (`docs/tailwind-styles.css`):

**Color Palette** (Colombian theme):
- **Primary**: `#f5b700` (Yellow - Colombian flag inspired)
- **Accent**: `#005611` (Green - Colombian agriculture)
- **Destructive**: `#ef4444` (Red - errors/warnings)
- **Background**: `#e7e7ef` (Light gray)
- **Foreground**: `#1a1e2c` (Dark text)
- **Border**: `#dadae7` (Light borders)

**Typography**:
- **Sans**: Inter (primary font for UI)
- **Serif**: Source Serif 4 (headings/emphasis)
- **Mono**: JetBrains Mono (code/data)

**Spacing & Shadows**:
- **Radius**: `0.375rem` (6px) - soft rounded corners
- **Shadows**: Predefined scales (sm, md, lg, xl) with subtle opacity
- **Spacing**: `0.25rem` (4px) base unit

**Component Styling Guidelines**:
- Buttons: Use `bg-primary text-primary-foreground` for main actions
- Inputs: `border-input` with `ring-ring` on focus
- Cards: `bg-card text-card-foreground` with `shadow-md`
- Forms: Consistent spacing with `gap-4` or `gap-6`

**Dark Mode Support**: Already configured via `.dark` class (optional for MODULE 1)

---

## 📚 Context References

**PRDs**:
- [MODULE 1 PRD](../MODULE_PRDS/MODULE-1-Authentication-Company-Setup.md)
- [Product PRD v4.1](../Product%20PRD%20-%20Alquemist%20v4.1.md) - Lines 52-86 (MODULE 1 scope)
- [Engineering PRD v4.1](../Engineering%20PRD%20-%20Alquemist%20v4.1.md) - Lines 61-74 (Frontend stack)

**Design System**:
- [tailwind-styles.css](../tailwind-styles.css) - Complete design token definitions

**Database Schema**:
- `packages/database/prisma/schema.prisma`
  - User model (lines 106-169)
  - Company model (lines 15-79)
  - Role model (lines 81-104)

**Component Inventory**:
- [COMPONENT_INVENTORY.md](../COMPONENT_INVENTORY.md) (empty - MODULE 1 will populate)

---

**Estimated Effort**: 2-3 days
**Ready for Implementation**: ✅
