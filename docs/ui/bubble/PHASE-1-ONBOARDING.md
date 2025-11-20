# PHASE 1: ONBOARDING - UI REQUIREMENTS

**Focus**: Bubble pages, workflows, and visual elements
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md) for complete schema
**API Endpoints**: See [../../api/PHASE-1-ENDPOINTS.md](../../api/PHASE-1-ENDPOINTS.md) for backend calls

---

## Overview

Phase 1 is a guided onboarding wizard that takes users from signup → company with facility created. Users complete 4 modules to create their account, company, and first facility. Post-onboarding setup (Areas, Cultivars, Suppliers) happens in the operational dashboard (PHASE 2).

**Total Pages**: 7 screens
**Total Modules**: 4
**User Flow**: Linear progression with back navigation
**Entry**: Public landing page
**Exit**: Operational Dashboard (home page - facility context established)

---

## Internationalization (i18n)

**Languages Supported**: Spanish (default), English

All UI texts in this document must be implemented using the i18n system. See [../../i18n/STRATEGY.md](../../i18n/STRATEGY.md) for complete implementation strategy.

**Implementation Approach**:
- All UI texts stored in Bubble Option Set `UI_Texts` with both Spanish and English translations
- Enum values (license types, business types, etc.) stored in dedicated Option Sets
- Backend sends technical codes only, frontend handles translation
- Language switcher available in all pages

**Translation Tables**: Each module below includes a translation table with:
- **Elemento**: Description of UI element
- **Español**: Spanish text
- **English**: English text
- **Key**: Unique identifier for Option Set lookup

For implementation details, see [../../i18n/BUBBLE-IMPLEMENTATION.md](../../i18n/BUBBLE-IMPLEMENTATION.md).

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

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | REGISTRO EN ALQUEMIST | ALQUEMIST SIGNUP | auth_signup_header |
| First Name Label | Nombre | First Name | auth_signup_first_name_label |
| Last Name Label | Apellido | Last Name | auth_signup_last_name_label |
| Email Label | Correo Electrónico | Email | auth_signup_email_label |
| Password Label | Contraseña | Password | auth_signup_password_label |
| Confirm Password Label | Confirmar Contraseña | Confirm Password | auth_signup_confirm_label |
| Phone Label | Teléfono | Phone | auth_signup_phone_label |
| Phone Helper Text | (opcional) | (optional) | auth_signup_phone_helper |
| Terms Checkbox | Acepto los Términos de Servicio | I agree to Terms of Service | auth_signup_terms_checkbox |
| Create Account Button | Crear Cuenta | Create Account | auth_signup_create_btn |
| Already Have Account Text | ¿Ya tienes cuenta? | Already have account? | auth_signup_already_have_account |
| Login Link | Iniciar Sesión | Log In | auth_signup_login_link |

**Validation Messages**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Password Strength | Contraseña debe tener mín. 8 caracteres, 1 mayúscula, 1 número, 1 especial | Password must have min. 8 chars, 1 uppercase, 1 number, 1 special | validation_password_strength |
| Email Format | Formato de email inválido | Invalid email format | validation_email_format |
| Terms Required | Debes aceptar los términos de servicio | You must accept the terms of service | validation_terms_required |
| Email Already Exists | Este email ya está registrado | This email is already registered | validation_email_exists |

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

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | VERIFICA TU CORREO | VERIFY YOUR EMAIL | auth_email_verify_header |
| Sent Message | Enviamos un enlace de verificación a: | We sent a verification link to: | auth_email_verify_sent |
| Instructions | Haz clic en el enlace de tu correo o ingresa el código a continuación: | Click the link in your email or enter the code below: | auth_email_verify_instructions |
| Expires Label | Expira en: | Expires in: | auth_email_verify_expires |
| Verify Button | Verificar | Verify | auth_email_verify_btn |
| Resend Button | Reenviar Correo | Resend Email | auth_email_resend_btn |
| Success Message | ¡Email verificado exitosamente! | Email verified successfully! | auth_email_verify_success |
| Resent Message | Email de verificación reenviado | Verification email resent | auth_email_resent_success |
| Invalid Code | Código inválido | Invalid code | auth_email_verify_invalid |
| Expired Code | Código expirado | Code expired | auth_email_verify_expired |

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

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | CREA TU EMPRESA | CREATE YOUR COMPANY | company_setup_header |
| Company Name Label | Nombre de la Empresa | Company Name | company_setup_name_label |
| Business Type Label | Tipo de Negocio | Business Type | company_setup_business_type_label |
| Industry Label | Industria | Industry | company_setup_industry_label |
| Department Label | Departamento | Department | company_setup_department_label |
| Municipality Label | Municipio | Municipality | company_setup_municipality_label |
| Municipality Helper | (filtrado por departamento) | (filtered by department) | company_setup_municipality_helper |
| Create Button | Crear Empresa | Create Company | company_setup_create_btn |
| Success Message | ¡Bienvenido! Tu empresa ha sido creada exitosamente. | Welcome! Your company has been created successfully. | company_setup_success |

**Enum Translations (Business Entity Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| S.A.S | S.A.S | Corporation (Simplified) |
| S.A. | S.A. | Corporation |
| Ltda | Ltda | Limited Liability |
| E.U. | E.U. | Sole Proprietorship |
| Persona Natural | Persona Natural | Individual |

**Enum Translations (Company Types / Industries)**:

| value | display_es | display_en |
|-------|------------|------------|
| cannabis | Cannabis | Cannabis |
| coffee | Café | Coffee |
| cocoa | Cacao | Cocoa |
| flowers | Flores | Flowers |
| mixed | Mixto | Mixed |

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

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | SELECCIONA TU PLAN | SELECT YOUR PLAN | subscription_header |
| Trial Plan Name | PRUEBA | TRIAL | subscription_trial_name |
| Starter Plan Name | INICIAL | STARTER | subscription_starter_name |
| Pro Plan Name | PROFESIONAL | PRO | subscription_pro_name |
| Enterprise Plan Name | EMPRESARIAL | ENTERPRISE | subscription_enterprise_name |
| Free | Gratis | Free | subscription_free |
| Per Month | /mes | /mo | subscription_per_month |
| Facility Label | instalación | facility | subscription_facility |
| Facilities Label | instalaciones | facilities | subscription_facilities |
| User Label | usuario | user | subscription_user |
| Users Label | usuarios | users | subscription_users |
| Days | días | days | subscription_days |
| Full Features | Completo | Full | subscription_full |
| Custom | Personalizado | Custom | subscription_custom |
| Quote | Cotización | Quote | subscription_quote |
| Call Us | Contáctanos | Call Us | subscription_call_us |
| Select Button | Seleccionar | Select | subscription_select_btn |
| Monthly | Mensual | Monthly | subscription_monthly |
| Yearly | Anual | Yearly | subscription_yearly |
| Save Discount | (ahorra 15%) | (save 15%) | subscription_save_discount |

**Enum Translations (Subscription Plans)**:

| value | display_es | display_en |
|-------|------------|------------|
| trial | Prueba | Trial |
| starter | Inicial | Starter |
| pro | Profesional | Pro |
| enterprise | Empresarial | Enterprise |

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

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | AGREGAR INSTALACIÓN | ADD FACILITY | facilities_add_header |
| Facility Name Label | Nombre de la Instalación | Facility Name | facilities_name_label |
| Facility Name Placeholder | ej., "Finca Norte" | e.g., "North Farm" | facilities_name_placeholder |
| License Number Label | Número de Licencia | License Number | facilities_license_number_label |
| License Type Label | Tipo de Licencia | License Type | facilities_license_type_label |
| Licensed Area Label | Área Licenciada (m²) | Licensed Area (m²) | facilities_licensed_area_label |
| Primary Crops Label | Cultivos Principales | Primary Crops | facilities_primary_crops_label |
| Continue Button | Continuar | Continue | facilities_continue_btn |

**Enum Translations (License Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| commercial_growing | Cultivo Comercial | Commercial Growing |
| research | Investigación | Research |
| processing | Procesamiento | Processing |
| other | Otro | Other |

**Enum Translations (Crop Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| cannabis | Cannabis | Cannabis |
| coffee | Café | Coffee |
| cocoa | Cacao | Cocoa |
| flowers | Flores | Flowers |

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

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | UBICACIÓN DE LA INSTALACIÓN | FACILITY LOCATION | facilities_location_header |
| Department Label | Departamento | Department | facilities_department_label |
| Department Helper | (prellenado desde empresa) | (pre-filled from company) | facilities_department_helper |
| Municipality Label | Municipio | Municipality | facilities_municipality_label |
| Street Address Label | Dirección | Street Address | facilities_address_label |
| GPS Coordinates Label | Coordenadas GPS | GPS Coordinates | facilities_gps_label |
| Latitude Label | Latitud | Latitude | facilities_latitude_label |
| Longitude Label | Longitud | Longitude | facilities_longitude_label |
| Get Location Button | Obtener Mi Ubicación | Get My Location | facilities_get_location_btn |
| Climate Zone Label | Zona Climática | Climate Zone | facilities_climate_zone_label |
| Back Button | Atrás | Back | facilities_back_btn |
| Create Facility Button | Crear Instalación | Create Facility | facilities_create_btn |
| Success Message | Instalación creada exitosamente | Facility created successfully | facilities_create_success |

**Enum Translations (Climate Zones)**:

| value | display_es | display_en |
|-------|------------|------------|
| tropical | Tropical | Tropical |
| subtropical | Subtropical | Subtropical |
| temperate | Templado | Temperate |

**Enum Translations (Facility Status)**:

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| inactive | Inactivo | Inactive |
| suspended | Suspendido | Suspended |

---

## MODULE 4: Onboarding Complete - Ready to Start

**Note**: Onboarding ends here. Areas, Cultivars, and Suppliers are now managed in the operational dashboard (PHASE 2).

### Page 7: Setup Complete - Go to Dashboard
```
┌─────────────────────────────────┐
│   ✅ FACILITY CREATED!          │
├─────────────────────────────────┤
│                                 │
│  Your facility is ready!        │
│                                 │
│  Summary:                       │
│  ✓ Company: Cultivos San José  │
│  ✓ Facility: North Farm         │
│                                 │
│  Next, you'll set up:           │
│  • Cultivation Areas            │
│  • Cultivars (varieties)        │
│  • Suppliers (optional)         │
│                                 │
│  These can be managed from      │
│  your operational dashboard.    │
│                                 │
│  [  Go to Dashboard  ]          │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Text: Summary showing company and facility created
- Text: Next steps guidance (what to do in dashboard)
- Button: "Go to Dashboard" → navigate to home page (facility dashboard)

**Workflow**:
1. Display summary of completed setup
2. Set Current User's `currentFacilityId` to newly created facility
3. On button click → Navigate to Dashboard home page (PHASE 2)

**Database Context**:
- **No writes**: Just displays data already saved
- **Reads from**: `companies`, `facilities`
  - Gets: company name, facility name for summary display
- **Updates**: `users` table
  - Sets: `currentFacilityId` to this facility (establishes global context)

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | ¡INSTALACIÓN CREADA! | FACILITY CREATED! | onboarding_facility_complete_header |
| Ready Message | ¡Tu instalación está lista! | Your facility is ready! | onboarding_facility_ready |
| Summary Label | Resumen: | Summary: | onboarding_complete_summary_label |
| Company Checkmark | ✓ Empresa: | ✓ Company: | onboarding_complete_company |
| Facility Checkmark | ✓ Instalación: | ✓ Facility: | onboarding_complete_facility |
| Next Setup Label | A continuación, configurarás: | Next, you'll set up: | onboarding_next_setup_label |
| Areas Item | • Áreas de Cultivo | • Cultivation Areas | onboarding_next_areas |
| Cultivars Item | • Cultivares (variedades) | • Cultivars (varieties) | onboarding_next_cultivars |
| Suppliers Item | • Proveedores (opcional) | • Suppliers (optional) | onboarding_next_suppliers |
| Dashboard Message | Estos pueden gestionarse desde tu panel operacional. | These can be managed from your operational dashboard. | onboarding_dashboard_message |
| Go to Dashboard Button | Ir al Panel de Control | Go to Dashboard | onboarding_complete_dashboard_btn |

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
1○─2○─3●
Step 3 of 3: Create Facility
```
- Shows current step (Authentication → Company → Facility)
- Total steps: 3 (excluding optional subscription page)
- Progress visualization

**Reusable Components Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Menu Button | Menú | Menu | nav_menu_btn |
| User Profile | Usuario | User | nav_user_profile |
| Progress Step Text | Paso [X] de [Y]: | Step [X] of [Y]: | progress_step_text |

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
```

### Module 1 (Page 3): Company Setup
```
Company → companies table
        → users table (add company_id)
```

### Module 3: Facility Setup
```
Facility → facilities table
         → Check companies.max_facilities limit
         → users table (set currentFacilityId - establishes global context)
```

### Module 4: Complete Onboarding
```
Navigate to Dashboard → User ready to configure Areas, Cultivars, Suppliers in PHASE 2
```

**Note**: Areas, Cultivars, and Suppliers are no longer part of onboarding. They are managed in operational pages (PHASE 2, MODULE 8, 15, 16).

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
