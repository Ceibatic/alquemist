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
│ Tax ID:       [______] │
│ Municipality: [v Drop] │ ← Auto-filtered by region
│                         │
│ [Info tooltip about]    │
│ [tax ID requirements]   │
│                         │
│       [Create Company]  │
└─────────────────────────┘
```

### Key Data Flow
- **Inputs**: Email, password, region, business entity type
- **Outputs**: User record created, initial company record created, email verification token sent
- **Validates**: Email format, password strength, region/entity combination

### Database Tables
- **Write**: users, companies, emailVerificationTokens
- **Read**: geographic_locations (for region/municipality lookup)

### Notes
- 🔴 **Required**: These are the only fields needed for MVP signup
- Form auto-focuses on email field
- Email verification triggers immediately after signup
- Back button allowed on Step 1 to fix errors
- Password requirements shown in real-time

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
- **Inputs**: Verification token (from email link) OR 6-digit code
- **Outputs**: emailVerificationTokens.verified = true, user.email_verified = true
- **Validates**: Token not expired (24h), not already used, matches user email

### Database Tables
- **Read**: users, emailVerificationTokens
- **Write**: emailVerificationTokens, users
- **Related**: companies (auto-created during signup)

### Notes
- 🔴 **Required**: Must verify before accessing dashboard
- Token expires in 24h (non-negotiable for security)
- Resend sends new token, invalidates old one
- Direct email link auto-fills verification (no code entry needed)
- If user loses email, resend available immediately
- 🟡 **Important**: Show remaining time on code

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
- **Write**: companies (subscription_plan, max_facilities, max_users, subscription_tier)
- **Related**: payment_events (future: audit trail)

### Notes
- 🔴 **Required**: User must select a plan (even if Trial)
- 🟡 **Important**: Trial users skip payment, auto-upgrade prompt at day 25
- Payment processing via Stripe (backend handles, UI just shows form)
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
- **Write**: companies, media_files
- **Read**: users (current user)

### Notes
- 🔴 **Required**: Company name, tax ID (pre-filled)
- 🟡 **Important**: Phone and email recommended but not required
- 🟢 **Nice-to-have**: Document uploads (can be done later)
- Both pages have "Skip for now" button (can edit later from settings)
- Files stored in media_files table with document_type = 'license'
- Show upload progress indicator

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
- **Write**: facilities
- **Read**: users, companies, geographic_locations
- **Related**: areas (will be created next)

### Notes
- 🔴 **Required**: Facility name, license number, primary crops
- 🟡 **Important**: GPS coordinates useful but can auto-detect from address
- 🟢 **Nice-to-have**: Map picker for location
- User can create multiple facilities (up to subscription limit)
- Climate zone helps with template recommendations later

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
- **Read**: crop_types, facilities
- **Write**: facilities
- **Related**: cultivars (next module will reference)

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
- **Write**: areas, (optional: production_orders, batches, activities)
- **Read**: facilities, crop_types
- **Related**: production_templates (used if loading template)

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
- **Write**: cultivars (link facility), suppliers, supplier_products
- **Read**: crop_types, facilities
- **Related**: products (inventory items from suppliers)

### Notes
- 🔴 **Required**: At least one cultivar selected
- 🟡 **Important**: Suppliers (can add later, but useful for quick setup)
- 🟢 **Nice-to-have**: Product pricing from suppliers
- Supplier info used later for purchase orders (Module 9)
- Can add/edit suppliers anytime from settings

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
