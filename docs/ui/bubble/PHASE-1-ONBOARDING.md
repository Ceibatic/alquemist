# PHASE 1: ONBOARDING - UI REQUIREMENTS

**Focus**: Bubble pages, workflows, and visual elements
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md) for complete schema
**API Endpoints**: See [../../api/PHASE-1-ENDPOINTS.md](../../api/PHASE-1-ENDPOINTS.md) for backend calls

---

## Overview

Phase 1 is a guided onboarding wizard that takes users from signup → fully configured company. Users complete 8 modules in sequence to set up their agricultural operation.

**Total Pages**: 17 screens
**User Flow**: Linear progression with back navigation
**Entry**: Public landing page
**Exit**: Dashboard (ready for operations)

---

## MODULE 1: Authentication & Account Creation

### Page 1: Signup Form
```
┌─────────────────────────────────┐
│     🌱 ALQUEMIST SIGNUP         │
├─────────────────────────────────┤
│                                 │
│  First Name:  [____________]    │
│  Last Name:   [____________]    │
│  Email:       [____________]    │
│  Password:    [____________]    │
│  Confirm:     [____________]    │
│  Phone:       [____________]    │  (optional)
│                                 │
│  [ ] I agree to Terms of Service│
│                                 │
│  [        Create Account       ]│
│                                 │
│  Already have account? [Log In] │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Input fields: firstName, lastName, email, password, confirmPassword, phone
- Checkbox: termsAccepted
- Button: "Create Account" → triggers signup workflow
- Link: "Log In" → redirects to login page

**Workflow**:
1. Validate inputs (password strength, email format, terms checked)
2. Call API: Register user
3. Show success message
4. Navigate to Email Verification page

**Database Context**:
- **Writes to**: `users` table
  - Stores: email, password_hash, firstName, lastName, phone
  - Sets: email_verified = false
- **Writes to**: `emailVerificationTokens` table
  - Generates token for email verification

---

### Page 2: Email Verification
```
┌─────────────────────────────────┐
│    ✉️  VERIFY YOUR EMAIL        │
├─────────────────────────────────┤
│                                 │
│  We sent a verification link to:│
│  user@example.com               │
│                                 │
│  Click the link in your email   │
│  or enter the code below:       │
│                                 │
│  [___] [___] [___] [___]       │
│                                 │
│  Expires in: 23:45              │
│                                 │
│  [      Verify      ]           │
│  [  Resend Email   ]            │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Text: Display user's email
- Input fields: 4 code boxes (single digit each)
- Countdown timer: Shows remaining time
- Button: "Verify" → triggers verification workflow
- Button: "Resend Email" → triggers resend workflow

**Workflow**:
1. User enters 4-digit code OR clicks email link (auto-fills code)
2. Call API: Verify email token
3. On success → Navigate to Company Setup page
4. On fail → Show error, allow retry

**Database Context**:
- **Reads from**: `emailVerificationTokens` table
  - Checks: token validity, expiration
- **Updates**: `users` table
  - Sets: email_verified = true, email_verified_at = timestamp
- **Updates**: `emailVerificationTokens` table
  - Sets: used = true, verified_at = timestamp

---

### Page 3: Company Setup
```
┌─────────────────────────────────┐
│    🏢 CREATE YOUR COMPANY       │
├─────────────────────────────────┤
│                                 │
│  Company Name: [____________]   │
│                                 │
│  Business Type:                 │
│  [v S.A.S ▼]                    │
│  Options: S.A.S, S.A., Ltda,    │
│          E.U., Persona Natural  │
│                                 │
│  Industry:                      │
│  [v Cannabis ▼]                 │
│  Options: Cannabis, Coffee,     │
│          Cocoa, Flowers, Mixed  │
│                                 │
│  Department:                    │
│  [v Antioquia ▼]                │
│                                 │
│  Municipality:                  │
│  [v Medellín ▼]                 │
│  (filtered by department)       │
│                                 │
│  [     Create Company     ]     │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Input: Company name
- Dropdown: Business entity type
- Dropdown: Company type (industry)
- Dropdown: Department (loads from geographic data)
- Dropdown: Municipality (dynamic, filtered by selected department)
- Button: "Create Company" → triggers company creation

**Workflows**:
1. On page load → Call API: Get departments
2. When department selected → Call API: Get municipalities for that department
3. On "Create Company" click → Call API: Create company with all data
4. On success → Navigate to Dashboard or next module

**Database Context**:
- **Reads from**: `geographic_locations` table
  - Gets: departments (administrative_level = 1)
  - Gets: municipalities (filtered by department code)
- **Writes to**: `companies` table
  - Stores: name, business_entity_type, company_type, country, department_code, municipality_code
  - Sets: subscription_plan = "trial", max_facilities = 1, max_users = 3
- **Updates**: `users` table
  - Links: user to company via company_id
  - Sets: timezone from municipality

---

## MODULE 2: Subscription Selection (Optional for MVP)

### Page 4: Choose Plan
```
┌──────────────────────────────────────────────┐
│          💳 SELECT YOUR PLAN                 │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────┐│
│  │ TRIAL  │  │STARTER │  │  PRO   │  │ENTER│
│  │ Free   │  │ $X/mo  │  │ $Y/mo  │  │PRISE│
│  ├────────┤  ├────────┤  ├────────┤  ├────┤│
│  │1 facil.│  │5 facil.│  │20facil.│  │Custom│
│  │3 users │  │10 users│  │50 users│  │Quote││
│  │30 days │  │Full    │  │Full    │  │Call ││
│  │[Select]│  │[Select]│  │[Select]│  │ Us  ││
│  └────────┘  └────────┘  └────────┘  └────┘│
│                                              │
│  Monthly ○  Yearly ○ (save 15%)             │
│                                              │
└──────────────────────────────────────────────┘
```

**Bubble Elements**:
- Repeating Group: Plan cards (Trial, Starter, Pro, Enterprise)
  - Each card shows: name, price, facility limit, user limit, features
- Radio buttons: Billing cycle (monthly/yearly)
- Buttons: "Select" on each plan card

**Workflow**:
1. User selects plan
2. If NOT Trial → Navigate to payment page
3. If Trial → Skip payment, update company subscription, navigate to next module

**Database Context**:
- **Updates**: `companies` table
  - Sets: subscription_plan, max_facilities, max_users, subscription_tier
  - Sets: subscription_start_date, subscription_end_date

**Note**: For MVP, skip this module and default everyone to Trial plan (set during company creation)

---

## MODULE 3: Facility Creation

### Page 5: Add Facility - Basic Info
```
┌─────────────────────────────────┐
│    🏭 ADD FACILITY              │
├─────────────────────────────────┤
│                                 │
│  Facility Name:                 │
│  [_______________________]      │
│  (e.g., "North Farm")           │
│                                 │
│  License Number:                │
│  [_______________________]      │
│                                 │
│  License Type:                  │
│  ○ Commercial Growing           │
│  ○ Research                     │
│  ○ Processing                   │
│  ○ Other                        │
│                                 │
│  Licensed Area (m²):            │
│  [________]                     │
│                                 │
│  Primary Crops:                 │
│  ☐ Cannabis                     │
│  ☐ Coffee                       │
│  ☐ Cocoa                        │
│  ☐ Flowers                      │
│                                 │
│  [     Continue     ]           │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Input: Facility name
- Input: License number
- Radio buttons: License type
- Input: Total area (numeric)
- Checkboxes: Primary crops (multiple selection allowed)
- Button: "Continue" → navigate to location page

**Database Context**:
- **Reads from**: `crop_types` table
  - Gets: available crop types for checkboxes
- **Stores data temporarily**: Save form data to Bubble's state/custom state
  - Will write to database on final submit (next page)

---

### Page 6: Add Facility - Location
```
┌─────────────────────────────────┐
│    📍 FACILITY LOCATION         │
├─────────────────────────────────┤
│                                 │
│  Department:                    │
│  [v Pre-filled from company ▼]  │
│                                 │
│  Municipality:                  │
│  [v ___________________ ▼]      │
│                                 │
│  Street Address:                │
│  [_______________________]      │
│                                 │
│  GPS Coordinates:               │
│  Latitude:  [_________]         │
│  Longitude: [_________]         │
│                                 │
│  [Get My Location] (GPS button) │
│                                 │
│  Climate Zone:                  │
│  ○ Tropical                     │
│  ○ Subtropical                  │
│  ○ Temperate                    │
│                                 │
│  [Back]  [Create Facility]      │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Department (pre-filled from company)
- Dropdown: Municipality
- Input: Street address
- Input: Latitude (numeric)
- Input: Longitude (numeric)
- Button: "Get My Location" → uses Bubble's geolocation plugin
- Radio buttons: Climate zone
- Button: "Back" → return to previous page
- Button: "Create Facility" → submit form

**Workflow**:
1. Pre-fill department from company data
2. Load municipalities for that department
3. On "Get My Location" → Capture GPS coordinates
4. On "Create Facility" → Call API: Create facility with all data from both pages
5. On success → Show confirmation, navigate to next module

**Database Context**:
- **Reads from**: `geographic_locations` table
  - Gets: municipalities for dropdown
- **Reads from**: `companies` table
  - Gets: company department for pre-fill
  - Validates: facility count against max_facilities limit
- **Writes to**: `facilities` table
  - Stores: name, license_number, license_type, primary_crop_type_ids, address, municipality_code, department_code, latitude, longitude, total_area_m2, climate_zone
  - Sets: status = "active"

---

## MODULE 4: Area Setup

### Page 7: Define Cultivation Areas
```
┌─────────────────────────────────┐
│   🌿 CULTIVATION AREAS          │
│   at North Farm                 │
├─────────────────────────────────┤
│                                 │
│  [+ Add New Area]               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Area 1: Propagation     │   │
│  │ Type: Propagation       │   │
│  │ Size: 50 m²             │   │
│  │ Capacity: 500 plants    │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Area 2: Vegetative Rm   │   │
│  │ Type: Vegetative        │   │
│  │ Size: 100 m²            │   │
│  │ Capacity: 300 plants    │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Area 3: Flowering Rm    │   │
│  │ Type: Flowering         │   │
│  │ Size: 150 m²            │   │
│  │ Capacity: 200 plants    │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  [     Continue     ]           │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ Add New Area" → opens popup/modal
- Repeating Group: List of created areas
  - Shows: area name, type, size, capacity
  - Buttons: "Edit", "Delete" for each area
- Button: "Continue" → navigate to next module

**Database Context**:
- **Reads from**: `areas` table
  - Gets: all areas for current facility
- **Writes to**: `areas` table (via popup workflow)
  - Stores: name, area_type, total_area_m2, capacity, compatible_crop_type_ids

---

### Popup: Add/Edit Area
```
┌─────────────────────────────────┐
│    ADD CULTIVATION AREA         │
├─────────────────────────────────┤
│                                 │
│  Area Name:                     │
│  [_______________________]      │
│                                 │
│  Area Type:                     │
│  [v Propagation ▼]              │
│  Options: Propagation,          │
│          Vegetative,            │
│          Flowering,             │
│          Drying/Curing,         │
│          Storage                │
│                                 │
│  Size (m²):                     │
│  [________]                     │
│                                 │
│  Capacity (plants/batches):     │
│  [________]                     │
│                                 │
│  Climate Controlled:            │
│  ☐ Yes                          │
│                                 │
│  Environmental Settings:        │
│  Temperature: [20] - [25] °C    │
│  Humidity: [60] - [70] %        │
│                                 │
│  [Cancel]  [Save Area]          │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements** (in popup):
- Input: Area name
- Dropdown: Area type
- Input: Size (numeric)
- Input: Capacity (numeric)
- Checkbox: Climate controlled
- Input: Temp min/max (numeric)
- Input: Humidity min/max (numeric)
- Button: "Cancel" → close popup
- Button: "Save Area" → create/update area, refresh list, close popup

**Workflow**:
1. User fills form
2. On "Save Area" → Call API: Create area
3. Refresh areas list on main page
4. Close popup

**Database Context**:
- **Writes to**: `areas` table
  - Stores: facility_id, name, area_type, total_area_m2, capacity, climate_controlled, environmental_specs
  - Sets: status = "active"

---

## MODULE 5: Cultivar Selection

### Page 8: Select Cultivars
```
┌─────────────────────────────────┐
│   🌾 SELECT CULTIVARS           │
│   (Crop Varieties)              │
├─────────────────────────────────┤
│                                 │
│  For Crop: [Cannabis ▼]         │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☑ Cherry AK             │   │
│  │   Type: Indica          │   │
│  │   Flowering: 8 weeks    │   │
│  │   Yield: Medium-High    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☐ White Widow           │   │
│  │   Type: Hybrid          │   │
│  │   Flowering: 9 weeks    │   │
│  │   Yield: High           │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☐ Green Crack           │   │
│  │   Type: Sativa          │   │
│  │   Flowering: 10 weeks   │   │
│  │   Yield: Very High      │   │
│  └─────────────────────────┘   │
│                                 │
│  [+ Add Custom Cultivar]        │
│                                 │
│  [     Continue     ]           │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Crop type filter
- Repeating Group: Available cultivars for selected crop
  - Shows: name, variety type, flowering weeks, yield level
  - Checkboxes: Select cultivar (multiple allowed)
- Button: "+ Add Custom Cultivar" → opens popup
- Button: "Continue" → save selections, navigate to next module

**Workflow**:
1. On page load → Call API: Get cultivars for facility's primary crops
2. User selects cultivars
3. On "Continue" → Call API: Link cultivars to facility
4. Navigate to next module

**Database Context**:
- **Reads from**: `cultivars` table
  - Gets: cultivars filtered by crop_type_id
- **Reads from**: `facilities` table
  - Gets: primary_crop_type_ids to filter cultivars
- **Updates**: `facilities` table
  - Links: selected cultivar IDs to facility

---

## MODULE 6: Supplier Setup

### Page 9: Add Suppliers
```
┌─────────────────────────────────┐
│   🚚 INPUT SUPPLIERS            │
├─────────────────────────────────┤
│                                 │
│  Suppliers provide:             │
│  • Seeds/Cuttings               │
│  • Nutrients                    │
│  • Pesticides                   │
│  • Equipment                    │
│                                 │
│  [+ Add Supplier]               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ FarmChem Inc            │   │
│  │ Tax ID: 900123456-7     │   │
│  │ Products: Nutrients     │   │
│  │ Contact: Juan Pérez     │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Seed Supply Co.         │   │
│  │ Tax ID: 800987654-3     │   │
│  │ Products: Seeds         │   │
│  │ Contact: María García   │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  [Skip for Now] [Continue]      │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ Add Supplier" → opens popup
- Repeating Group: List of added suppliers
  - Shows: name, tax ID, product categories, contact
  - Buttons: "Edit", "Delete" for each
- Button: "Skip for Now" → navigate to dashboard
- Button: "Continue" → navigate to dashboard

**Database Context**:
- **Reads from**: `suppliers` table
  - Gets: all suppliers for current company
- **Writes to**: `suppliers` table (via popup)
  - Stores: name, tax_id, product_categories, contact info

---

### Popup: Add/Edit Supplier
```
┌─────────────────────────────────┐
│    ADD SUPPLIER                 │
├─────────────────────────────────┤
│                                 │
│  Supplier Name:                 │
│  [_______________________]      │
│                                 │
│  Tax ID (NIT):                  │
│  [_______________________]      │
│                                 │
│  Product Categories:            │
│  ☐ Seeds/Cuttings               │
│  ☐ Nutrients                    │
│  ☐ Pesticides                   │
│  ☐ Equipment                    │
│  ☐ Other                        │
│                                 │
│  Contact Person:                │
│  [_______________________]      │
│                                 │
│  Contact Email:                 │
│  [_______________________]      │
│                                 │
│  Contact Phone:                 │
│  [_______________________]      │
│                                 │
│  [Cancel]  [Save Supplier]      │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements** (in popup):
- Input: Supplier name
- Input: Tax ID
- Checkboxes: Product categories (multiple)
- Input: Contact name
- Input: Contact email
- Input: Contact phone
- Button: "Cancel" → close popup
- Button: "Save Supplier" → create supplier, refresh list, close popup

**Workflow**:
1. User fills form
2. On "Save Supplier" → Call API: Create supplier
3. Refresh suppliers list on main page
4. Close popup

**Database Context**:
- **Writes to**: `suppliers` table
  - Stores: company_id, name, tax_id, product_categories, contact_name, contact_email, contact_phone
  - Sets: status = "active"

---

## MODULE 7: Onboarding Complete

### Page 10: Welcome to Dashboard
```
┌─────────────────────────────────┐
│   ✅ SETUP COMPLETE!            │
├─────────────────────────────────┤
│                                 │
│  Congratulations!               │
│  Your facility is ready.        │
│                                 │
│  Summary:                       │
│  ✓ Company: Cultivos San José  │
│  ✓ Facility: North Farm         │
│  ✓ Areas: 4 defined             │
│  ✓ Cultivars: 2 selected        │
│  ✓ Suppliers: 2 added           │
│                                 │
│  Next Steps:                    │
│  1. Create production templates │
│  2. Set up inventory            │
│  3. Start your first batch      │
│                                 │
│  [  Go to Dashboard  ]          │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Text: Summary of completed setup
- List: Checkmarks showing what was configured
- Text: Next steps guidance
- Button: "Go to Dashboard" → navigate to main dashboard

**Workflow**:
1. Display summary of onboarding
2. On button click → Navigate to Dashboard (start of Phase 2)

**Database Context**:
- **No writes**: Just displays data already saved
- **Reads from**: `companies`, `facilities`, `areas`, `cultivars`, `suppliers`
  - Gets: counts and names for summary display

---

## BUBBLE COMPONENTS SUMMARY

### Reusable Components

**Navigation Bar** (used on all pages after login):
```
┌─────────────────────────────────┐
│ 🌱 ALQUEMIST    [≡ Menu] [User]│
└─────────────────────────────────┘
```
- Logo
- Hamburger menu (mobile)
- User profile dropdown

**Progress Indicator** (onboarding wizard):
```
1○─2○─3○─4○─5○─6○─7●
Step 7 of 7: Add Suppliers
```
- Shows current step
- Total steps
- Progress visualization

### Form Validation Rules

**Email**:
- Valid email format
- Unique (not already registered)

**Password**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

**Facility License**:
- Alphanumeric
- Unique across system

**Phone**:
- Colombian format: 10 digits
- Optional field

---

## DATABASE FLOW SUMMARY

### Module 1: Authentication
```
Signup → users table (email_verified=false)
       → emailVerificationTokens table

Verify → users table (email_verified=true)
       → emailVerificationTokens (used=true)

Company → companies table
        → users table (add company_id)
```

### Module 3: Facility Setup
```
Facility → facilities table
         → Check companies.max_facilities limit

Areas → areas table (linked to facility_id)

Cultivars → Link to facilities (update facility record)

Suppliers → suppliers table (linked to company_id)
```

---

## RESPONSIVE DESIGN NOTES

### Desktop (1200px+)
- Full width forms
- Side-by-side layout for multi-step forms
- Progress bar at top

### Tablet (768px - 1199px)
- Single column forms
- Larger touch targets
- Progress bar at top

### Mobile (< 768px)
- Single column, full width
- Bottom navigation
- Simplified progress indicator
- Larger buttons (min 44px height)

---

**Status**: UI requirements complete for Phase 1
**Next Steps**:
1. Implement API endpoints (see [PHASE-1-ENDPOINTS.md](../../api/PHASE-1-ENDPOINTS.md))
2. Build Bubble pages following these wireframes
3. Connect Bubble workflows to API endpoints
4. Test full onboarding flow
