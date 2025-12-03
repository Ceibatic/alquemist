# Phase 2 Frontend Testing Plan

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Start Convex backend (in another terminal):
```bash
CONVEX_DEPLOYMENT=dev:handsome-jay-388 npx convex dev
```

3. Ensure you have a test user account created through the signup flow

---

## Test 1: Authentication & Onboarding

### 1.1 Login Flow
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter valid credentials
- [ ] Verify redirect to dashboard or onboarding

### 1.2 New User Onboarding (if not completed)
- [ ] `/company-setup` - Create company with NIT validation
- [ ] `/facility-basic` - Create first facility
- [ ] `/facility-location` - Set location with Colombian departments/municipalities
- [ ] `/setup-complete` - Verify completion message

---

## Test 2: Dashboard (`/dashboard`)

### 2.1 Dashboard Layout
- [ ] Sidebar displays with navigation links
- [ ] Header shows user info and facility name
- [ ] Facility switcher dropdown works (if multiple facilities)

### 2.2 Metrics Cards
- [ ] "Áreas Activas" card displays count
- [ ] "Cultivares" card displays count
- [ ] "Proveedores" card displays count
- [ ] "Stock Bajo" card displays count (warning style if > 0)
- [ ] Clicking cards navigates to respective modules

### 2.3 Quick Actions
- [ ] "Nueva Área" button navigates to `/areas`
- [ ] "Nuevo Cultivar" button navigates to `/cultivars`
- [ ] "Agregar Inventario" button navigates to `/inventory`

### 2.4 Onboarding Checklist
- [ ] Shows completion progress bar
- [ ] Displays checkmarks for completed items
- [ ] "Configurar" buttons work for incomplete items

### 2.5 Recent Activity
- [ ] Shows activity feed or empty state message

---

## Test 3: Areas Module (`/areas`)

### 3.1 Areas List
- [ ] Navigate to `/areas`
- [ ] Empty state displays if no areas exist
- [ ] Area cards display with correct info

### 3.2 Create Area
- [ ] Click "Nueva Área" button
- [ ] Fill form: name, type, status, dimensions
- [ ] Submit and verify area appears in list

### 3.3 View Area Details
- [ ] Click on an area card
- [ ] `/areas/[id]` displays area details
- [ ] Environmental specs shown if configured
- [ ] Occupancy bar displays correctly

### 3.4 Edit Area
- [ ] Click "Editar" button on area detail page
- [ ] `/areas/[id]/edit` loads with current values
- [ ] Modify values and save
- [ ] Verify changes persist

### 3.5 Delete Area
- [ ] Click delete button
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Area removed from list

---

## Test 4: Cultivars Module (`/cultivars`)

### 4.1 Cultivars List
- [ ] Navigate to `/cultivars`
- [ ] Empty state displays if no cultivars
- [ ] Cultivar cards show name, crop type, status

### 4.2 Link System Cultivar
- [ ] Click "Vincular Cultivar" button
- [ ] Modal opens with available system cultivars
- [ ] Select a cultivar and confirm
- [ ] Cultivar appears in company list

### 4.3 Create Custom Cultivar
- [ ] Click "Crear Personalizado" button
- [ ] Fill form with cultivar details
- [ ] Submit and verify creation

### 4.4 View Cultivar Details
- [ ] Click on cultivar card
- [ ] `/cultivars/[id]` shows full details
- [ ] Characteristics display (THC/CBD if cannabis)

### 4.5 Edit Cultivar
- [ ] Click "Editar" on detail page
- [ ] Modify values and save
- [ ] Verify changes persist

---

## Test 5: Suppliers Module (`/suppliers`)

### 5.1 Suppliers List
- [ ] Navigate to `/suppliers`
- [ ] Empty state or supplier table displays
- [ ] Status badges show (Active/Inactive, Approved/Pending)

### 5.2 Create Supplier
- [ ] Click "Nuevo Proveedor" button
- [ ] Fill form: name, legal name, NIT, contact info
- [ ] Select product categories
- [ ] Submit and verify creation

### 5.3 View Supplier Details
- [ ] Click on supplier row
- [ ] `/suppliers/[id]` shows full info
- [ ] Contact information displays

### 5.4 Edit Supplier
- [ ] Click "Editar" button
- [ ] Modify values and save

### 5.5 Approve Supplier
- [ ] For pending suppliers, click "Aprobar"
- [ ] Status changes to "Aprobado"

---

## Test 6: Users Module (`/users`)

### 6.1 Users List
- [ ] Navigate to `/users`
- [ ] Current user displays in table
- [ ] Role and status badges show correctly

### 6.2 Invite User
- [ ] Click "Invitar Usuario" button
- [ ] Fill invitation form:
  - [ ] Email address
  - [ ] Select role (dropdown with descriptions)
  - [ ] Select facility access (checkboxes)
- [ ] Submit invitation
- [ ] Pending invitation appears in list

### 6.3 Resend Invitation
- [ ] For pending invitations, click "Reenviar"
- [ ] Success toast appears

### 6.4 Cancel Invitation
- [ ] Click "Cancelar Invitación"
- [ ] Confirmation dialog
- [ ] Invitation removed from list

---

## Test 7: Facilities Module (`/facilities`)

### 7.1 Facilities List
- [ ] Navigate to `/facilities`
- [ ] Current facility displays in grid
- [ ] Status and type badges show

### 7.2 Create Facility (if plan allows)
- [ ] Click "Nueva Instalación"
- [ ] Fill form with facility details
- [ ] Colombian location selector works
- [ ] Submit and verify creation

### 7.3 View Facility Details
- [ ] Click on facility card
- [ ] `/facilities/[id]` shows full details
- [ ] Location, certifications, contacts display

### 7.4 Edit Facility
- [ ] Click "Editar" button
- [ ] Modify values and save

### 7.5 Plan Limits
- [ ] Verify "Nueva Instalación" disabled if at plan limit
- [ ] Tooltip shows upgrade message

---

## Test 8: Inventory Module (`/inventory`)

### 8.1 Inventory List
- [ ] Navigate to `/inventory`
- [ ] Data table displays with columns
- [ ] Filters work (search, category, status)

### 8.2 Create Inventory Item
- [ ] Click "Nuevo Producto" button
- [ ] Fill form: name, category, unit, quantities
- [ ] Set reorder point
- [ ] Submit and verify creation

### 8.3 View Item Details
- [ ] Click on inventory row
- [ ] `/inventory/[id]` shows full details
- [ ] Stock levels and batch info display

### 8.4 Edit Item
- [ ] Click "Editar" button
- [ ] Modify values and save

### 8.5 Low Stock Warning
- [ ] Create item with quantity below reorder point
- [ ] Dashboard "Stock Bajo" count increases
- [ ] Warning badge appears on item

---

## Test 9: Settings

### 9.1 Account Settings (`/settings/account`)
- [ ] Navigate to `/settings/account`
- [ ] Profile information displays
- [ ] Can update name
- [ ] Language preference selector works
- [ ] Password change form works

### 9.2 Facility Settings (`/settings/facility`)
- [ ] Navigate to `/settings/facility`
- [ ] Tab navigation works:
  - [ ] General Info tab
  - [ ] Location tab
  - [ ] Operations tab
  - [ ] Certifications tab
- [ ] Can update facility name
- [ ] Can modify operational hours
- [ ] Can add/edit certifications

---

## Test 10: Navigation & UX

### 10.1 Sidebar Navigation
- [ ] All menu items clickable and navigate correctly
- [ ] Active state highlights current page
- [ ] Collapse/expand works on mobile

### 10.2 Breadcrumbs
- [ ] Breadcrumb trail shows on detail/edit pages
- [ ] Links navigate correctly

### 10.3 Error States
- [ ] Invalid routes show 404 page
- [ ] Network errors show appropriate messages
- [ ] Form validation errors display inline

### 10.4 Loading States
- [ ] Skeleton loaders show while data fetches
- [ ] Buttons disable during form submission
- [ ] Loading spinners appear appropriately

### 10.5 Toast Notifications
- [ ] Success toasts on create/update/delete
- [ ] Error toasts on failures
- [ ] Toasts auto-dismiss

---

## Test 11: Responsive Design

### 11.1 Desktop (1920px+)
- [ ] Full sidebar visible
- [ ] Data tables have all columns

### 11.2 Tablet (768px-1024px)
- [ ] Sidebar collapses to icons
- [ ] Cards stack appropriately

### 11.3 Mobile (< 768px)
- [ ] Hamburger menu for navigation
- [ ] Forms stack vertically
- [ ] Tables become card lists

---

## Known Limitations

1. **Suppliers in Inventory** - Supplier dropdown may be empty (requires integration)
2. **Activity Feed** - May show empty state (requires activity logging)
3. **Email Invitations** - Requires email service configuration
4. **Role Permissions** - Full RBAC not yet enforced on all endpoints

---

## Quick Smoke Test (5 minutes)

For rapid verification:

1. Login → Dashboard loads
2. Create 1 Area → Appears in list
3. Link 1 Cultivar → Appears in list
4. Create 1 Supplier → Appears in table
5. View Settings → Forms load correctly

If all 5 pass, core functionality is working.
