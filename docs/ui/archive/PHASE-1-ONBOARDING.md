# PHASE 1: ONBOARDING UI REQUIREMENTS

**Modules 1-8** | Sequential user journey from signup → fully configured company
**Status**: Module 1-2 complete, Modules 3-8 in design
**Duration**: User completes in 1-2 sessions
**Primary Users**: COMPANY_OWNER (doing initial setup)

---

## Overview

Phase 1 is a guided onboarding wizard. User signs up, verifies email, picks a subscription, completes company profile, sets up facility(ies), chooses crops, defines growing areas, and adds suppliers. By end of Phase 1, user has enough data configured to start planning production in Phase 2.

**Total Pages**: 12-15 screens
**User Flow**: Linear progression with back navigation allowed
**Entry Point**: Public landing → signup
**Exit Point**: Dashboard (ready for Phase 2 workflows)

---

## MODULE 1: Authentication & Account Creation

### Purpose
New user creates account with email/password and specifies business entity type and region.

### Pages

**1. Signup Step 1 - User Registration**
```
┌─────────────────────────┐
│   ALQUEMIST - SIGNUP    │
├─────────────────────────┤
│ Email:        [______] │
│ Password:     [______] │
│ Confirm Pwd:  [______] │
│                         │
│ Region:       [v Drop] │ ← Colombian Department
│ Entity Type:  [v Drop] │ ← S.A.S, S.A., Ltda, etc
│                         │
│ [ ] I agree to Terms    │
│                         │
│    [Continue] [Cancel]  │
└─────────────────────────┘
```

**2. Signup Step 2 - Company Basics** (redirected from email verification)
```
┌─────────────────────────┐
│   CREATE COMPANY        │
├─────────────────────────┤
│ Company Name: [______] │
│ Entity Type:  [v Drop] │ ← S.A.S, S.A., Ltda, E.U., Persona Natural
│ Company Type: [v Drop] │ ← cannabis/coffee/cocoa/flowers/mixed
│ Department:   [v Drop] │ ← Colombian Department
│ Municipality: [v Drop] │ ← Auto-filtered by department
│                         │
│ [Info tooltip about]    │
│ [entity type & licenses]│
│                         │
│       [Create Company]  │
└─────────────────────────┘
```

### Geographic Data Flow
- **Step 1**: Load departments → `geographic.getDepartments`
- **Step 2**: User selects department → Load municipalities for that department
- **Step 3**: Load municipalities → `geographic.getMunicipalities`
- **Step 4**: User selects municipality → Create company with location data

### HTTP Endpoints (for Geographic Data)

**Get Departments:**
```
POST https://[your-deployment].convex.site/geographic/departments
Body: { "countryCode": "CO" }
Response: [
  {
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota"
  },
  {
    "division_1_code": "11",
    "division_1_name": "Bogotá D.C.",
    "timezone": "America/Bogota"
  },
  ...
]
```

**Get Municipalities (filtered by department):**
```
POST https://[your-deployment].convex.site/geographic/municipalities
Body: {
  "countryCode": "CO",
  "departmentCode": "05"
}
Response: [
  {
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05",
    "timezone": "America/Bogota"
  },
  {
    "division_2_code": "05002",
    "division_2_name": "Abejorral",
    "parent_division_1_code": "05"
  },
  ...
]
```

**Create Company (Step 2):**
```
POST https://[your-deployment].convex.site/registration/register-step-2
Body: {
  "userId": "j97abc...",
  "companyName": "Cultivos San José S.A.S",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
Response: {
  "success": true,
  "userId": "j97abc...",
  "companyId": "k12def...",
  "organizationId": "org_test_1234567890_xyz",
  "message": "¡Bienvenido! Tu empresa ha sido creada exitosamente."
}
```

### Convex Functions
- **Query**: `geographic.getDepartments`
- **Query**: `geographic.getMunicipalities`
- **Mutation**: `registration.registerCompanyStep2`

### Database Tables (Step 2)
- **Read**:
  - `geographic_locations` → Get departments (administrative_level = 1)
  - `geographic_locations` → Get municipalities (administrative_level = 2, filtered by parent)
  - `users` → Verify email_verified = true
- **Write**:
  - `companies` → Create company with subscription_plan = "trial", max_facilities = 1, max_users = 3
  - `users` → Update with company_id and timezone from municipality

### Key Data Flow
- **Inputs**: Email, password, firstName, lastName, phone (optional)
- **Outputs**: User record created (without company yet), email verification token sent
- **Validates**: Email format, password strength (min 8 chars, 1 uppercase, 1 number, 1 special)

### Database Tables
- **Write**:
  - `users` → Creates new user (company_id = undefined, email_verified = false)
  - `emailVerificationTokens` → Creates 24h verification token
- **Read**:
  - `roles` → Get COMPANY_OWNER role ID

### HTTP Endpoints (for Bubble)

**Check Email Availability:**
```
POST https://[your-deployment].convex.site/registration/check-email
Body: { "email": "user@example.com" }
Response: { "available": true, "email": "user@example.com" }
```

**Register User (Step 1):**
```
POST https://[your-deployment].convex.site/registration/register-step-1
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "3001234567"  // optional
}
Response: {
  "success": true,
  "userId": "j97abc...",
  "email": "user@example.com",
  "message": "Cuenta creada. Por favor verifica tu correo electrónico.",
  "token": "xyz123..." // for testing only
}
```

### Convex Functions
- **Mutation**: `registration.registerUserStep1`
- **Query**: `registration.checkEmailAvailability`

### Notes
- 🔴 **Required**: Email, password, firstName, lastName
- 🟡 **Optional**: Phone number
- Form auto-focuses on email field
- Email verification triggers immediately after signup via Resend API
- Password requirements shown in real-time
- User can't proceed until email is verified

---

## MODULE 2: Email Verification

### Purpose
Confirm email ownership before proceeding. User clicks link or enters code. System auto-redirects on verification.

### Pages

**3. Verify Email - Link-Based (Primary Flow)**
```
┌─────────────────────────┐
│   CHECK YOUR EMAIL      │
├─────────────────────────┤
│ We sent a link to:      │
│ user@example.com        │
│                         │
│ [Click the link] or     │
│ [Enter code below]      │
│                         │
│ Verification Code:      │
│ [__] [__] [__] [__]    │
│                         │
│ Expires in: 23:45       │
│                         │
│ [Verify] [Resend Email] │
└─────────────────────────┘
```

**4. Email Verified - Redirect Intermediate**
```
┌─────────────────────────┐
│ ✓ EMAIL VERIFIED        │
├─────────────────────────┤
│                         │
│ Redirecting to company  │
│ setup in 3 seconds...   │
│                         │
│ [Skip] [→ Continue]     │
└─────────────────────────┘
```

### Key Data Flow
- **Inputs**: Verification token (from email link or manual entry)
- **Outputs**: Token marked as used, user.email_verified = true
- **Validates**: Token not expired (24h), not already used, matches user email

### Database Tables
- **Read**:
  - `emailVerificationTokens` → Find token by token string
  - `users` → Get user info
- **Write**:
  - `emailVerificationTokens` → Set used = true, verified_at = timestamp
  - `users` → Set email_verified = true, email_verified_at = timestamp

### HTTP Endpoints (for Bubble)

**Verify Email Token:**
```
POST https://[your-deployment].convex.site/registration/verify-email
Body: { "token": "abc123xyz456..." }
Response: {
  "success": true,
  "message": "¡Email verificado exitosamente!",
  "userId": "j97abc..."
}
```

**Resend Verification Email:**
```
POST https://[your-deployment].convex.site/registration/resend-verification
Body: { "email": "user@example.com" }
Response: {
  "success": true,
  "message": "Email de verificación reenviado",
  "token": "xyz123..." // for testing only
}
```

**Check Verification Status:**
```
POST https://[your-deployment].convex.site/registration/check-verification-status
Body: { "email": "user@example.com" }
Response: {
  "exists": true,
  "verified": true,
  "userId": "j97abc...",
  "message": "Email verificado"
}
```

### Convex Functions
- **Mutation**: `emailVerification.verifyEmailToken`
- **Mutation**: `emailVerification.resendVerificationEmail`
- **Query**: `emailVerification.checkEmailVerificationStatus`

### Notes
- 🔴 **Required**: Must verify before creating company (Step 2)
- Token expires in 24h (non-negotiable for security)
- Resend rate limited: max 5 times, 5 minutes between each
- Direct email link auto-fills verification (no code entry needed)
- Email sent via Resend API with professional template
- 🟡 **Important**: Show remaining time on token expiry

---

## MODULE 3: Subscription & Payments

### Purpose
User selects subscription tier and provides payment method. Determines feature access and facility limits.

### Pages

**5. Choose Subscription Plan**
```
┌─────────────────────────────────────┐
│     SELECT YOUR PLAN                │
├─────────────────────────────────────┤
│                                     │
│ [Trial]     [Starter]  [Pro]  [Ent]│
│  Free        $X/mo      $Y/mo  Custom
│  • 1 fac   • 5 fac    • 20 fac     │
│  • 2 usr   • 10 usr   • 50 usr     │
│  • Full    • Full     • Full       │
│  • 30 days • 30 days  • Billing    │
│           [Monthly]   [Monthly]    │
│           [Yearly]    [Yearly]     │
│                                     │
│         [Select Plan]               │
└─────────────────────────────────────┘
```

**6. Payment Details** (if not Trial)
```
┌──────────────────────────┐
│   PAYMENT METHOD         │
├──────────────────────────┤
│ Select payment type:     │
│ ○ Credit/Debit Card      │
│ ○ PSE (Bank Transfer)    │
│ ○ E-wallet (Nequi)       │
│                          │
│ Card Number: [______]    │
│ Exp:  [__/__] CVC [___]  │
│                          │
│ Billing email:           │
│ [user@example.com]       │
│                          │
│ ○ Same as billing addr   │
│                          │
│  [Process Payment]       │
└──────────────────────────┘
```

**7. Subscription Confirmed**
```
┌──────────────────────────┐
│ ✓ SUBSCRIPTION ACTIVE    │
├──────────────────────────┤
│ Plan: Starter ($X/mo)    │
│ Billing: Monthly         │
│ Next Charge: 2025-11-27  │
│ Facilities Allowed: 5    │
│ Users Allowed: 10        │
│                          │
│ Receipt sent to email    │
│                          │
│     [Continue →]         │
└──────────────────────────┘
```

### Key Data Flow
- **Inputs**: Plan selection, payment method, billing address
- **Outputs**: companies.subscription_plan updated, payment processed, receipt generated
- **Validates**: Plan selection valid, payment method accepted, billing address

### Database Tables
- **Write**:
  - `companies` → Update subscription_plan, max_facilities, max_users, subscription_tier
- **Related**:
  - `payment_events` (future: audit trail)

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Future Implementation Required:**

```
POST https://[your-deployment].convex.site/subscription/select-plan
Body: {
  "companyId": "k12def...",
  "plan": "starter",
  "billingCycle": "monthly",
  "paymentMethod": { ... }
}
Response: {
  "success": true,
  "subscription": { ... },
  "message": "Suscripción activada"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `subscription.selectPlan` (mutation)
- `subscription.processPayment` (mutation)
- `subscription.getAvailablePlans` (query)

### Temporary Workaround
For MVP, `companies` table already has default subscription:
- `subscription_plan`: "trial" (set during company creation)
- `max_facilities`: 1
- `max_users`: 3
- Valid for 30 days

Users can skip Module 3 and continue with trial subscription.

### Notes
- 🔴 **Required**: User must select a plan (even if Trial)
- 🟡 **Important**: Trial users skip payment, auto-upgrade prompt at day 25
- Payment processing via Stripe (backend integration needed)
- Pro tip on limits: "You can always upgrade or add facilities later"
- 🟢 **Nice-to-have**: Save payment method for future facilities
- Show facility/user count limits based on selected plan

---

## MODULE 4: Company Profile Completion

### Purpose
User provides company legal details, tax info, and uploads business licenses/permits.

### Pages

**8. Company Details**
```
┌─────────────────────────┐
│   COMPANY DETAILS       │
├─────────────────────────┤
│ Company Name:           │
│ [Pre-filled from step2] │
│                         │
│ Legal Name (optional):  │
│ [_______________________]
│                         │
│ Tax ID: [Pre-filled]    │
│ Entity Type:            │
│ [Pre-filled from step1] │
│                         │
│ Municipality:           │
│ [Pre-filled]            │
│                         │
│ Business Phone:         │
│ [_______________________]
│                         │
│ Business Email:         │
│ [_______________________]
│                         │
│    [Save] [Skip for now]│
└─────────────────────────┘
```

**9. Licenses & Permits**
```
┌─────────────────────────┐
│  UPLOAD LICENSES        │
├─────────────────────────┤
│ ⚠ Recommend uploading   │
│ before creating         │
│ facilities              │
│                         │
│ Business License:       │
│ [Choose file] or        │
│ [Drag & drop]           │
│ [Preview] [Remove]      │
│                         │
│ Tax ID Document:        │
│ [Choose file] or        │
│ [Drag & drop]           │
│ [Preview] [Remove]      │
│                         │
│ Other:                  │
│ [Choose file] +[Add]    │
│                         │
│    [Save] [Skip]        │
└─────────────────────────┘
```

### Key Data Flow
- **Inputs**: Legal company details, phone, email, file uploads (licenses)
- **Outputs**: companies table updated, media_files created for uploaded docs
- **Validates**: Phone format, email format, file types (PDF/JPG), file size < 10MB

### Database Tables
- **Write**:
  - `companies` → Update legal_name, primary_contact_phone, primary_contact_email
  - `media_files` → Store uploaded documents
- **Read**:
  - `companies` → Get current company data
  - `users` → Get current user

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Partially implemented in Convex backend
**Implementation Needed:**

```
POST https://[your-deployment].convex.site/company/update-profile
Body: {
  "companyId": "k12def...",
  "legalName": "Cultivos San José S.A.S",
  "primaryContactPhone": "+573001234567",
  "primaryContactEmail": "contacto@cultsanjose.com"
}
Response: {
  "success": true,
  "message": "Perfil de empresa actualizado"
}
```

```
POST https://[your-deployment].convex.site/company/upload-document
Body: {
  "companyId": "k12def...",
  "documentType": "business_license",
  "file": [base64 or file URL],
  "filename": "license.pdf"
}
Response: {
  "success": true,
  "fileId": "m45xyz...",
  "url": "https://storage.../license.pdf"
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `company.updateProfile` (mutation)
- `company.uploadDocument` (mutation)
- `company.getProfile` (query)

### Notes
- 🔴 **Required**: Company name (already set in Step 2)
- 🟡 **Important**: Phone and email recommended but not required
- 🟢 **Nice-to-have**: Document uploads (can be done later)
- Both pages have "Skip for now" button (can edit later from settings)
- Files stored in `media_files` table with category = 'license'
- Show upload progress indicator
- For MVP: Skip document uploads, just update contact info

---

## MODULE 5: Facility Creation

### Purpose
User creates the first licensed cultivation facility. This is where crops will be grown.

### Pages

**10. Create Facility**
```
┌─────────────────────────┐
│   ADD FACILITY          │
├─────────────────────────┤
│ Facility Name:          │
│ [_______________________]
│ (e.g., "North Farm")    │
│                         │
│ License Number:         │
│ [_______________________]
│                         │
│ License Type:           │
│ ○ Commercial Growing    │
│ ○ Research              │
│ ○ Processing            │
│ ○ Other [specify]       │
│                         │
│ Licensed Area (m²):     │
│ [_______________________]
│                         │
│ Primary Crop:           │
│ [v Cannabis] [v Coffee] │
│    [v Cocoa] [v Flowers]│
│                         │
│ [Continue]              │
└─────────────────────────┘
```

**11. Facility Location & Details**
```
┌─────────────────────────┐
│   FACILITY LOCATION     │
├─────────────────────────┤
│ Department:             │
│ [Pre-filled from org]   │
│                         │
│ Municipality:           │
│ [_______________________]
│                         │
│ Address:                │
│ [_______________________]
│                         │
│ GPS Coordinates:        │
│ Latitude:  [_____]      │
│ Longitude: [_____]      │
│ [Get from map] [Get GPS]│
│                         │
│ Climate Zone:           │
│ ○ Tropical              │
│ ○ Subtropical           │
│ ○ Temperate             │
│                         │
│ [Create Facility]       │
└─────────────────────────┘
```

**12. Facility Created**
```
┌─────────────────────────┐
│ ✓ FACILITY CREATED      │
├─────────────────────────┤
│                         │
│ Facility: North Farm    │
│ License: LC-12345       │
│ Area: 5,000 m²          │
│ Crops: Cannabis, Coffee │
│                         │
│ Next: Define growing    │
│ areas within this site  │
│                         │
│       [Continue →]      │
└─────────────────────────┘
```

### Key Data Flow
- **Inputs**: Facility name, license number, type, area, crops, location, climate
- **Outputs**: facilities record created, linked to company
- **Validates**: License number format, area numeric, crops selected, location valid

### Database Tables
- **Write**:
  - `facilities` → Create facility record linked to company
- **Read**:
  - `companies` → Verify company exists and check max_facilities limit
  - `geographic_locations` → Validate department/municipality
  - `crop_types` → Get available crop types

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented in Convex backend
**Implementation Needed:**

```
POST https://[your-deployment].convex.site/facilities/create
Body: {
  "companyId": "k12def...",
  "name": "North Farm",
  "licenseNumber": "LC-12345-2025",
  "licenseType": "commercial_growing",
  "primaryCropTypeIds": ["crop123", "crop456"],
  "address": "Finca La Esperanza, Km 15 Vía El Carmen",
  "municipalityCode": "05001",
  "departmentCode": "05",
  "latitude": 6.244747,
  "longitude": -75.581211,
  "totalAreaM2": 5000,
  "climateZone": "tropical"
}
Response: {
  "success": true,
  "facilityId": "f78ghi...",
  "message": "Instalación creada exitosamente"
}
```

```
GET https://[your-deployment].convex.site/facilities/get-by-company
Body: { "companyId": "k12def..." }
Response: {
  "facilities": [
    {
      "id": "f78ghi...",
      "name": "North Farm",
      "licenseNumber": "LC-12345-2025",
      ...
    }
  ]
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `facilities.create` (mutation)
- `facilities.update` (mutation)
- `facilities.getByCompany` (query)
- `facilities.checkLicenseAvailability` (query)

### Notes
- 🔴 **Required**: Facility name, license number, primary crops
- 🟡 **Important**: GPS coordinates useful but can auto-detect from address
- 🟢 **Nice-to-have**: Map picker for location
- User can create multiple facilities (up to subscription limit in companies.max_facilities)
- Climate zone helps with template recommendations later
- License number must be unique across system

---

## MODULE 6: Crop Type Selection

### Purpose
User confirms which crops will be grown. This unlocks crop-specific setup templates and cultivar options.

### Pages

**13. Select Crops to Grow**
```
┌─────────────────────────┐
│   CROPS AT THIS         │
│   FACILITY              │
├─────────────────────────┤
│                         │
│ ☑ Cannabis              │
│   (indica/sativa/hybrid)│
│                         │
│ ☐ Coffee                │
│   (arabica/robusta)     │
│                         │
│ ☐ Cocoa                 │
│   (fermented/dry)       │
│                         │
│ ☐ Flowers               │
│   (roses/carnations/etc)│
│                         │
│ ☐ Other: [______]       │
│                         │
│ [Already selected at]   │
│ [facility level]        │
│                         │
│    [Save & Continue]    │
└─────────────────────────┘
```

### Key Data Flow
- **Inputs**: Crop selection checkboxes (multiple allowed)
- **Outputs**: facilities.primary_crop_type_ids updated
- **Validates**: At least one crop selected, crop exists in system

### Database Tables
- **Read**:
  - `crop_types` → Get available crop types (Cannabis, Coffee, Cocoa, Flowers)
  - `facilities` → Get current facility
- **Write**:
  - `facilities` → Update primary_crop_type_ids array

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented
```
GET https://[your-deployment].convex.site/crops/get-types
Response: {
  "cropTypes": [
    { "id": "crop123", "name": "Cannabis", "display_name_es": "Cannabis" },
    { "id": "crop456", "name": "Coffee", "display_name_es": "Café" },
    ...
  ]
}
```

```
POST https://[your-deployment].convex.site/facilities/update-crops
Body: {
  "facilityId": "f78ghi...",
  "cropTypeIds": ["crop123", "crop456"]
}
Response: { "success": true }
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `crops.getCropTypes` (query)
- `facilities.updateCrops` (mutation)

### Notes
- 🔴 **Required**: At least one crop must be selected
- Pre-selected based on facility creation (Module 5)
- User can change this later from facility settings
- Selection here determines available cultivars in next module

---

## MODULE 7: Area Setup with Sample Data

### Purpose
User defines cultivation zones (propagation, vegetative, flowering, drying) within facility. Optionally generates sample data for rapid testing.

### Pages

**14. Define Cultivation Areas**
```
┌──────────────────────────┐
│   CULTIVATION AREAS      │
│   in North Farm          │
├──────────────────────────┤
│ Area 1:                  │
│ Name: [Propagation]      │
│ Type: ○ Propagation      │
│        ○ Vegetative      │
│        ○ Flowering       │
│        ○ Drying/Curing   │
│ Capacity (plants):       │
│ [___] or [batch size]    │
│ Equipment: [______]      │
│ Conditions:              │
│ Temp: 20-25°C            │
│ Humidity: 60-70%         │
│                          │
│ [+ Add Area] [Save Area] │
│                          │
│ Area 2, Area 3... (list) │
│                          │
│ Or use templates:        │
│ ☐ Cannabis Growing       │
│ ☐ Coffee Processing      │
│ [Load Template]          │
│                          │
│      [Continue]          │
└──────────────────────────┘
```

**15. Sample Data Generation (Optional)**
```
┌──────────────────────────┐
│   GENERATE SAMPLE DATA   │
│   (for testing)          │
├──────────────────────────┤
│ Want to see the app in   │
│ action? Generate sample  │
│ production data:         │
│                          │
│ ☑ Create sample batches  │
│ ☑ Generate activities    │
│ ☑ Add quality checks     │
│                          │
│ Sample batch size: 200   │
│ Number of batches: 3     │
│                          │
│ This data can be deleted │
│ anytime from settings    │
│                          │
│ [Generate] [Skip]        │
└──────────────────────────┘
```

### Key Data Flow
- **Inputs**: Area names, types, capacity, environmental specs
- **Outputs**: areas records created, linked to facility
- **Optional**: Sample production data generated for demo/testing

### Database Tables
- **Write**:
  - `areas` → Create area records linked to facility
  - (optional) `production_orders`, `batches`, `activities` → If generating sample data
- **Read**:
  - `facilities` → Get current facility
  - `crop_types` → Get compatible crops for area

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented
```
POST https://[your-deployment].convex.site/areas/create
Body: {
  "facilityId": "f78ghi...",
  "name": "Propagation Room",
  "areaType": "propagation",
  "compatibleCropTypeIds": ["crop123"],
  "totalAreaM2": 50,
  "capacity": 500,
  "climateControlled": true,
  "environmentalSpecs": { "temp": "20-25", "humidity": "60-70" }
}
Response: { "success": true, "areaId": "a99jkl..." }
```

```
POST https://[your-deployment].convex.site/areas/generate-sample-data
Body: {
  "facilityId": "f78ghi...",
  "batchCount": 3,
  "batchSize": 200
}
Response: {
  "success": true,
  "batchesCreated": 3,
  "activitiesCreated": 45
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `areas.create` (mutation)
- `areas.createMultiple` (mutation)
- `areas.generateSampleData` (mutation)
- `areas.getByFacility` (query)

### Notes
- 🔴 **Required**: At least one area must be defined
- 🟡 **Important**: Environmental specs are recommendations, not validations
- 🟢 **Nice-to-have**: Sample data generation (helps user see workflows)
- Can edit areas later from facility settings
- Template loading auto-populates areas (e.g., "Cannabis Full Cycle" = propagation + veg + flower + drying)

---

## MODULE 8: Cultivars & Suppliers Setup

### Purpose
User selects crop varieties (cultivars) and input suppliers. Suppliers provide seeds, nutrients, pesticides, etc.

### Pages

**16. Select Cultivars**
```
┌──────────────────────────┐
│   SELECT CULTIVARS       │
│   (Crop Varieties)       │
├──────────────────────────┤
│ For: Cannabis            │
│                          │
│ ☑ Cherry AK (Indica)     │
│   Flowering: 8 weeks     │
│   Yield: Medium-High     │
│                          │
│ ☐ White Widow (Hybrid)   │
│   Flowering: 9 weeks     │
│   Yield: High            │
│                          │
│ ☐ Green Crack (Sativa)   │
│   Flowering: 10 weeks    │
│   Yield: Very High       │
│                          │
│ [+ Add Custom Cultivar]  │
│ (if not in list)         │
│                          │
│ [Continue]               │
└──────────────────────────┘
```

**17. Add Suppliers**
```
┌──────────────────────────┐
│   INPUT SUPPLIERS        │
├──────────────────────────┤
│ Suppliers provide:       │
│ • Seeds/Cuttings         │
│ • Nutrients              │
│ • Pesticides             │
│ • Equipment              │
│                          │
│ Supplier 1:              │
│ Name: [FarmChem Inc]     │
│ Tax ID: [______]         │
│ Product: [Nutrients ▼]   │
│ Contact: [______]        │
│ [✓ Add] [Edit] [Remove] │
│                          │
│ Supplier 2, 3...         │
│                          │
│ [+ Add Supplier]         │
│                          │
│ Or [Skip - Add Later]    │
│                          │
│    [Finish Onboarding]   │
└──────────────────────────┘
```

### Key Data Flow
- **Inputs**: Cultivar selection, supplier info (name, tax ID, product types, contact)
- **Outputs**: cultivars linked to facility, suppliers created, supplier_products linked
- **Validates**: Cultivar exists, supplier name non-empty, tax ID format

### Database Tables
- **Write**:
  - `cultivars` → Link cultivars to facility
  - `suppliers` → Create supplier records
  - `supplier_products` → Link products to suppliers (future)
- **Read**:
  - `crop_types` → Get crop types for cultivar filtering
  - `cultivars` → Get available cultivars for selected crops
  - `facilities` → Get current facility

### HTTP Endpoints (for Bubble)

⚠️ **STATUS**: Not yet implemented
```
GET https://[your-deployment].convex.site/cultivars/get-by-crop
Body: { "cropTypeId": "crop123" }
Response: {
  "cultivars": [
    {
      "id": "cult789",
      "name": "Cherry AK",
      "varietyType": "Indica",
      "floweringWeeks": 8,
      "yieldLevel": "medium-high"
    },
    ...
  ]
}
```

```
POST https://[your-deployment].convex.site/facilities/link-cultivars
Body: {
  "facilityId": "f78ghi...",
  "cultivarIds": ["cult789", "cult456"]
}
Response: { "success": true }
```

```
POST https://[your-deployment].convex.site/suppliers/create
Body: {
  "companyId": "k12def...",
  "name": "FarmChem Inc",
  "taxId": "900123456-7",
  "productCategories": ["nutrients", "pesticides"],
  "contactName": "Juan Pérez",
  "contactEmail": "ventas@farmchem.com",
  "contactPhone": "+573001234567"
}
Response: {
  "success": true,
  "supplierId": "s55mno..."
}
```

### Convex Functions
⚠️ **TO BE CREATED**:
- `cultivars.getByCrop` (query)
- `facilities.linkCultivars` (mutation)
- `suppliers.create` (mutation)
- `suppliers.getByCompany` (query)

### Notes
- 🔴 **Required**: At least one cultivar selected
- 🟡 **Important**: Suppliers (can add later, but useful for quick setup)
- 🟢 **Nice-to-have**: Product pricing from suppliers
- Supplier info used later for purchase orders (Phase 2, Module 9)
- Can add/edit suppliers anytime from settings

---

## IMPLEMENTATION STATUS OVERVIEW

### ✅ Fully Implemented (Ready for Bubble Integration)

**MODULE 1: Authentication & Account Creation**
- ✅ User registration (Step 1)
- ✅ Email verification
- ✅ Company creation (Step 2)
- ✅ Geographic data (departments & municipalities)
- **HTTP Endpoints**: `/registration/*` and `/geographic/*`
- **Convex Files**: [convex/registration.ts](../../convex/registration.ts), [convex/emailVerification.ts](../../convex/emailVerification.ts), [convex/geographic.ts](../../convex/geographic.ts)

**MODULE 2: Email Verification**
- ✅ Token generation and email sending (via Resend API)
- ✅ Token verification
- ✅ Resend functionality with rate limiting
- **HTTP Endpoints**: `/registration/verify-email`, `/registration/resend-verification`

### ⚠️ Partially Implemented (Database Schema Ready, API Needed)

**MODULE 4: Company Profile Completion**
- ✅ Database schema: `companies` table has all fields
- ⚠️ Missing: HTTP endpoints for updating company profile
- ⚠️ Missing: Document upload functionality
- **Workaround**: Skip for MVP, company data set in Step 2

### ❌ Not Yet Implemented (Schema Ready, Full Implementation Needed)

**MODULE 3: Subscription & Payments**
- ✅ Database schema: `companies` table has subscription fields
- ❌ No payment processing integration
- ❌ No plan selection endpoints
- **Workaround**: Default trial subscription (30 days, 1 facility, 3 users) auto-assigned

**MODULE 5: Facility Creation**
- ✅ Database schema: `facilities` table ready
- ❌ Missing: CRUD endpoints for facilities
- ❌ Missing: License validation
- **Priority**: HIGH - needed for Phase 2

**MODULE 6: Crop Type Selection**
- ✅ Database schema: `crop_types`, `cultivars` tables ready
- ❌ Missing: Query endpoints for crop types
- ❌ Missing: Facility crop linking
- **Priority**: HIGH - needed for Phase 2

**MODULE 7: Area Setup**
- ✅ Database schema: `areas` table ready
- ❌ Missing: CRUD endpoints for areas
- ❌ Missing: Sample data generation
- **Priority**: HIGH - needed for Phase 2

**MODULE 8: Cultivars & Suppliers**
- ✅ Database schema: `cultivars`, `suppliers` tables ready
- ❌ Missing: Query and mutation endpoints
- **Priority**: MEDIUM - can add suppliers later

---

## BUBBLE INTEGRATION QUICK START

### Base URL
```
https://[your-convex-deployment].convex.site
```

### Available Endpoints (Module 1-2 Only)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/registration/check-email` | POST | Check email availability | ✅ Ready |
| `/registration/register-step-1` | POST | Create user account | ✅ Ready |
| `/registration/verify-email` | POST | Verify email token | ✅ Ready |
| `/registration/register-step-2` | POST | Create company | ✅ Ready |
| `/geographic/departments` | POST | Get departments | ✅ Ready |
| `/geographic/municipalities` | POST | Get municipalities | ✅ Ready |
| `/registration/login` | POST | Simple login | ✅ Ready |

### For MVP: Minimum Viable Onboarding Flow

**Recommended MVP Flow (Modules 1-2 Only):**
1. User registers (Module 1, Step 1)
2. User verifies email (Module 2)
3. User creates company with location (Module 1, Step 2)
4. ✅ **User can access dashboard** (with trial subscription)
5. Skip Modules 3-8 for now (implement in Phase 1.5)

**Database State After MVP Flow:**
- ✅ User created and verified
- ✅ Company created with trial subscription
- ✅ Ready to manually create facilities in dashboard (once Module 5 implemented)

---

## PHASE 1 SUMMARY

### Total Pages: 17 screens
```
Module 1: 2 pages (signup step 1 & 2)
Module 2: 2 pages (verify email + confirmation)
Module 3: 3 pages (plan selection, payment, confirmation)
Module 4: 2 pages (company details, licenses)
Module 5: 3 pages (facility creation, location, confirmation)
Module 6: 1 page (crop selection)
Module 7: 2 pages (area definition, sample data)
Module 8: 2 pages (cultivars, suppliers)
────────
Total: 17 pages
```

### User Journey Map
```
Public Landing
    ↓
[MODULE 1] Signup Step 1: Email + Password + Region/Entity
    ↓
[MODULE 2] Email Verification: Click link or enter code
    ↓
[MODULE 3] Choose Subscription: Select plan, enter payment
    ↓
[MODULE 4] Company Profile: Fill details, upload licenses (optional)
    ↓
[MODULE 5] Add Facility: Name, license, crops, location
    ↓
[MODULE 6] Crops Selection: Confirm crop types
    ↓
[MODULE 7] Define Areas: Create zones (propagation, veg, flowering, drying)
    ↓
[MODULE 8] Cultivars & Suppliers: Select varieties & add suppliers
    ↓
DASHBOARD ← Ready for Phase 2 (Production)
```

### Database State at End of Phase 1
- ✅ User record created + email verified
- ✅ Company record created with subscription
- ✅ Facility record created with license
- ✅ 4+ areas defined (propagation, veg, flower, drying)
- ✅ 2+ cultivars selected
- ✅ 1+ suppliers added
- ✅ Documents uploaded (optional)
- ✅ Ready to: Create production templates (Module 10) and place orders (Module 12)

### Role Access
- 🔴 COMPANY_OWNER: Completes all of Phase 1
- 🟡 FACILITY_MANAGER: Can view/edit facility details after creation
- 🔴 Other roles: Can view facility data but not modify

---

**Status**: Design phase complete, ready for Bubble implementation
**Next**: Move to [PHASE-2-OPERATIONS.md](PHASE-2-OPERATIONS.md) for production workflows
