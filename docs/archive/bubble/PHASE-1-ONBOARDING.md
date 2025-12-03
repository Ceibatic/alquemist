# PHASE 1: ONBOARDING - UI REQUIREMENTS

**Focus**: Bubble pages, workflows, and visual elements
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md) for complete schema
**API Endpoints**: See [../../api/PHASE-1-ENDPOINTS.md](../../api/PHASE-1-ENDPOINTS.md) for backend calls

---

## Overview

Phase 1 handles two distinct onboarding flows:
1. **First User (Modules 1-4)**: Complete signup → company → facility creation (7 screens)
2. **Invited User (Module 5)**: Accept invitation → set password → join company (4 screens)

Post-onboarding setup (Areas, Cultivars, Suppliers) happens in the operational dashboard (PHASE 2).

**Total Pages**: 11 screens (7 for first user + 4 for invited user)
**Total Modules**: 5
**User Flows**: Two separate paths (first user vs invited user)
**Entry**: Public landing page (first user) or Email invitation link (invited user)
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
2. Call API: Register user → receives emailHtml, emailSubject, verificationToken
3. **Send Email** (Native Bubble Action) - uses emailHtml from API response
   - To: user's email
   - Subject: emailSubject from response
   - Body: emailHtml from response (contains verification link with token)
4. Show success message
5. Navigate to Email Verification page

**Important - Email Sending**:
- The backend (Convex) returns the email content but does NOT send it
- Bubble's native "Send Email" action handles the actual delivery
- This gives you control over email timing, retries, and user feedback

**Database Context**:
- **Writes to**: `users` table
  - Stores: email, password_hash, firstName, lastName, phone
  - Sets: email_verified = false
  - Stores: email_verification_token (6-digit), token_expires_at (24h)

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
│  We sent a verification code to:│
│  user@example.com               │
│                                 │
│  Enter your 6-digit code:       │
│  [________________]             │
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
- Input field: Single input for 6-digit code
- Countdown timer: Shows remaining time
- Button: "Verify" → triggers verification workflow
- Button: "Resend Email" → triggers resend workflow

**Workflow**:
1. User enters 6-digit code OR clicks email link (auto-fills code)
2. Call API: Verify email token
3. On success → Navigate to Company Setup page
4. On fail → Show error, allow retry

**Database Context (Simplified)**:
- **Reads from**: `users` table
  - Finds user by email_verification_token
  - Checks: token validity, expiration
- **Updates**: `users` table
  - Sets: email_verified = true, email_verified_at = timestamp
  - Clears: email_verification_token, token_expires_at

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

## MODULE 5: Invited User Acceptance

### Overview

This module handles the onboarding flow for users who have been invited by an administrator to join an existing company. Unlike the first user (Module 1-4), invited users:
- Do NOT create a company or facility
- Receive an invitation email with a unique token
- Set their password to activate their account
- Are automatically assigned to the company and facilities specified in the invitation

**Pages**: 3 screens (Accept Invitation, Set Password, Welcome)
**Entry Point**: Email invitation link
**Exit**: Operational Dashboard (facility context pre-set)

---

### Page 8: Accept Invitation Landing

**URL**: `/accept-invitation?token=ABC123XYZ`

**Visual Layout**:
```
┌─────────────────────────────────┐
│     🌱 ALQUEMIST                │
│     INVITACIÓN DE EQUIPO        │
├─────────────────────────────────┤
│                                 │
│  Has sido invitado(a) a:        │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🏢 AGRÍCOLA DEL VALLE SAS│ │
│  │                           │ │
│  │ Rol: Supervisor           │ │
│  │ Invitado por: Juan Pérez  │ │
│  │ Instalaciones: 2          │ │
│  └───────────────────────────┘ │
│                                 │
│  Tu cuenta:                     │
│  📧 maria@example.com           │
│                                 │
│  [Aceptar Invitación]          │
│  [Rechazar]                     │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:

| Element Name | Type | Value |
|--------------|------|-------|
| `text_invitation_header` | Text | "Has sido invitado(a) a:" |
| `group_company_info` | Group | Container for company details |
| `text_company_name` | Text | API: `invitation > company > name` |
| `text_role` | Text | API: `invitation > role > display_name` |
| `text_inviter` | Text | API: `invitation > inviter > firstName + lastName` |
| `text_facility_count` | Text | API: `invitation > facilities:count` |
| `text_email` | Text | API: `invitation > email` |
| `btn_accept` | Button | "Aceptar Invitación" → show password form |
| `btn_reject` | Button | "Rechazar" → show rejection confirmation |

**Workflows**:

**Workflow: Load Invitation on Page Load**
- **Trigger**: Page is loaded
- **Step 1**: Get `token` from URL parameter
- **Step 2**: API Call `call_validateInvitationToken`
  - Parameters: `{ "token": "..." }`
  - Response: `{ "valid": true, "invitation": {...} }`
- **Step 3**: If valid → Display invitation details
- **Step 4**: If invalid → Navigate to "Invitation Invalid" page

**Workflow: Accept Invitation**
- **Trigger**: `btn_accept` is clicked
- **Step 1**: Hide company info group
- **Step 2**: Show password form group (Page 9)

**Workflow: Reject Invitation**
- **Trigger**: `btn_reject` is clicked
- **Step 1**: Show confirmation popup "¿Estás seguro?"
- **Step 2**: If confirmed → API Call `call_rejectInvitation`
  - Parameters: `{ "token": "..." }`
- **Step 3**: Show message "Invitación rechazada"
- **Step 4**: Navigate to login page

**Database Context**:
- **Reads from**: `invitations` table
  - Gets: email, role, company info, inviter info, facility list
  - Validates: token not expired, status = "pending"
- **No writes on this page** (just validation)

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | INVITACIÓN DE EQUIPO | TEAM INVITATION | invitation_page_header |
| Invited To | Has sido invitado(a) a: | You've been invited to: | invitation_invited_to |
| Role Label | Rol: | Role: | invitation_role_label |
| Invited By | Invitado por: | Invited by: | invitation_invited_by |
| Facilities Label | Instalaciones: | Facilities: | invitation_facilities_label |
| Your Account | Tu cuenta: | Your account: | invitation_your_account |
| Accept Button | Aceptar Invitación | Accept Invitation | invitation_accept_btn |
| Reject Button | Rechazar | Reject | invitation_reject_btn |
| Reject Confirmation | ¿Estás seguro que deseas rechazar esta invitación? | Are you sure you want to reject this invitation? | invitation_reject_confirm |
| Rejected Message | Invitación rechazada | Invitation rejected | invitation_rejected_msg |

---

### Page 9: Set Password (Invitation Acceptance)

**Same URL**: `/accept-invitation?token=ABC123XYZ` (form shown after accepting)

**Visual Layout**:
```
┌─────────────────────────────────┐
│     🌱 ALQUEMIST                │
│     CONFIGURA TU CUENTA         │
├─────────────────────────────────┤
│                                 │
│  Crea tu contraseña:            │
│                                 │
│  Contraseña *                   │
│  [••••••••••••••]               │
│                                 │
│  Confirmar Contraseña *         │
│  [••••••••••••••]               │
│                                 │
│  ✓ Mínimo 8 caracteres          │
│  ✓ 1 mayúscula                  │
│  ✓ 1 número                     │
│  ✓ 1 carácter especial          │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Información Opcional:          │
│                                 │
│  Teléfono                       │
│  [________________]             │
│                                 │
│  Idioma Preferido               │
│  [○ Español  ○ English]         │
│                                 │
│  [Volver] [Crear Cuenta]        │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:

| Element Name | Type | Value |
|--------------|------|-------|
| `text_setup_header` | Text | "Configura tu Cuenta" |
| `text_password_label` | Text | "Crea tu contraseña:" |
| `input_password` | Input (password) | User's new password |
| `input_confirm_password` | Input (password) | Password confirmation |
| `group_password_requirements` | Group | Password validation checklist |
| `text_req_length` | Text | "✓ Mínimo 8 caracteres" (green when met) |
| `text_req_uppercase` | Text | "✓ 1 mayúscula" |
| `text_req_number` | Text | "✓ 1 número" |
| `text_req_special` | Text | "✓ 1 carácter especial" |
| `text_optional_header` | Text | "Información Opcional:" |
| `input_phone` | Input | Optional phone number |
| `radio_language` | Radio Buttons | Español / English |
| `btn_back` | Button | "Volver" → back to Page 8 |
| `btn_submit` | Button | "Crear Cuenta" → accept invitation |

**Workflows**:

**Workflow: Validate Password on Input**
- **Trigger**: `input_password` value is changed
- **Step 1**: Check length ≥ 8 → update `text_req_length` color
- **Step 2**: Check uppercase → update `text_req_uppercase` color
- **Step 3**: Check number → update `text_req_number` color
- **Step 4**: Check special char → update `text_req_special` color
- **Step 5**: Enable `btn_submit` only if all requirements met

**Workflow: Submit Accept Invitation**
- **Trigger**: `btn_submit` is clicked
- **Precondition**: All password requirements met, passwords match
- **Step 1**: Show loading spinner
- **Step 2**: API Call `call_acceptInvitation`
  - Parameters:
    - `token`: URL parameter
    - `password`: `input_password's value`
    - `phone`: `input_phone's value` (optional)
    - `language`: `radio_language's value` (default: "es")
  - Response: `{ "success": true, "userId": "...", "authToken": "..." }`
- **Step 3**: If success:
  - Store `authToken` in browser storage (login user)
  - Set Current User data
  - Navigate to Welcome page (Page 10)
- **Step 4**: If error:
  - Show error message (e.g., "Token expirado")
  - Option to request new invitation

**Database Context**:
- **Writes to**: `users` table
  - Creates: New user account with provided password
  - Sets: email, firstName, lastName, phone, language, role_id, company_id
- **Updates**: `invitations` table
  - Sets: status = "accepted", accepted_at = now()
- **Writes to**: `facility_users` table (if multi-facility)
  - Links: user to assigned facilities

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Setup Header | CONFIGURA TU CUENTA | SET UP YOUR ACCOUNT | invitation_setup_header |
| Create Password Label | Crea tu contraseña: | Create your password: | invitation_create_password |
| Password Label | Contraseña | Password | invitation_password_label |
| Confirm Password Label | Confirmar Contraseña | Confirm Password | invitation_confirm_password |
| Requirement Length | Mínimo 8 caracteres | Minimum 8 characters | invitation_req_length |
| Requirement Uppercase | 1 mayúscula | 1 uppercase letter | invitation_req_uppercase |
| Requirement Number | 1 número | 1 number | invitation_req_number |
| Requirement Special | 1 carácter especial | 1 special character | invitation_req_special |
| Optional Info Header | Información Opcional: | Optional Information: | invitation_optional_info |
| Phone Label | Teléfono | Phone | invitation_phone_label |
| Language Label | Idioma Preferido | Preferred Language | invitation_language_label |
| Spanish Option | Español | Spanish | invitation_lang_es |
| English Option | English | English | invitation_lang_en |
| Back Button | Volver | Back | invitation_back_btn |
| Submit Button | Crear Cuenta | Create Account | invitation_submit_btn |
| Passwords Mismatch | Las contraseñas no coinciden | Passwords do not match | invitation_password_mismatch |
| Token Expired | El token de invitación ha expirado | Invitation token has expired | invitation_token_expired |
| Request New Invitation | Solicitar nueva invitación | Request new invitation | invitation_request_new |

---

### Page 10: Welcome (Invited User)

**URL**: `/welcome-invited`

**Visual Layout**:
```
┌─────────────────────────────────┐
│     🌱 ALQUEMIST                │
│     ¡BIENVENIDO(A)!             │
├─────────────────────────────────┤
│                                 │
│  ✓ ¡Cuenta Creada!              │
│                                 │
│  Has sido agregado(a) a:        │
│  🏢 Agrícola del Valle SAS      │
│                                 │
│  Tu rol: Supervisor             │
│  Instalaciones: 2               │
│  - Instalación Norte            │
│  - Instalación Sur              │
│                                 │
│  Puedes empezar a trabajar      │
│  inmediatamente con tu equipo.  │
│                                 │
│  [Ir al Panel de Control]       │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:

| Element Name | Type | Value |
|--------------|------|-------|
| `text_welcome_header` | Text | "¡BIENVENIDO(A)!" |
| `text_account_created` | Text | "✓ ¡Cuenta Creada!" |
| `text_added_to` | Text | "Has sido agregado(a) a:" |
| `text_company_name` | Text | Current User's company name |
| `text_role` | Text | "Tu rol: [role]" |
| `text_facilities_label` | Text | "Instalaciones: [count]" |
| `rg_facilities` | Repeating Group | List of assigned facilities |
| `text_facility_name` | Text (in rg) | Facility name |
| `text_start_working` | Text | "Puedes empezar..." |
| `btn_go_to_dashboard` | Button | "Ir al Panel de Control" → Dashboard |

**Workflows**:

**Workflow: Initialize Dashboard on Page Load**
- **Trigger**: Page is loaded
- **Step 1**: Set Current User's `currentFacilityId` to first assigned facility
- **Step 2**: Load user data (facilities, role)
- **Step 3**: Display welcome message with company and role info

**Workflow: Navigate to Dashboard**
- **Trigger**: `btn_go_to_dashboard` is clicked
- **Step 1**: Navigate to main dashboard (PHASE 2 home)
- **Step 2**: User sees facility context already established

**Database Context**:
- **Reads from**: `users` table
  - Gets: user's company, role, assigned facilities
- **Reads from**: `facilities` table
  - Gets: list of facilities user has access to
- **Updates**: `users` table
  - Sets: `currentFacilityId` (establishes global context for first login)

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Welcome Header | ¡BIENVENIDO(A)! | WELCOME! | invitation_welcome_header |
| Account Created | ¡Cuenta Creada! | Account Created! | invitation_account_created |
| Added To | Has sido agregado(a) a: | You've been added to: | invitation_added_to |
| Your Role | Tu rol: | Your role: | invitation_your_role |
| Facilities Count | Instalaciones: | Facilities: | invitation_facilities_count |
| Start Working | Puedes empezar a trabajar inmediatamente con tu equipo. | You can start working immediately with your team. | invitation_start_working |
| Go to Dashboard | Ir al Panel de Control | Go to Dashboard | invitation_go_to_dashboard |

---

### Page 11: Invitation Invalid

**URL**: `/invitation-invalid`

**Visual Layout**:
```
┌─────────────────────────────────┐
│     🌱 ALQUEMIST                │
│     INVITACIÓN NO VÁLIDA        │
├─────────────────────────────────┤
│                                 │
│  ⚠️                              │
│                                 │
│  Esta invitación no es válida   │
│  o ha expirado.                 │
│                                 │
│  Posibles razones:              │
│  • El enlace ya fue usado       │
│  • Han pasado más de 72 horas   │
│  • La invitación fue revocada   │
│                                 │
│  Por favor contacta al          │
│  administrador de tu empresa    │
│  para recibir una nueva         │
│  invitación.                    │
│                                 │
│  [Ir a Inicio de Sesión]        │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:

| Element Name | Type | Value |
|--------------|------|-------|
| `text_invalid_header` | Text | "INVITACIÓN NO VÁLIDA" |
| `text_invalid_message` | Text | "Esta invitación no es válida..." |
| `text_reasons_label` | Text | "Posibles razones:" |
| `text_reason_used` | Text | "• El enlace ya fue usado" |
| `text_reason_expired` | Text | "• Han pasado más de 72 horas" |
| `text_reason_revoked` | Text | "• La invitación fue revocada" |
| `text_contact_admin` | Text | "Por favor contacta..." |
| `btn_go_to_login` | Button | "Ir a Inicio de Sesión" → Login page |

**Workflow**:
- **On button click**: Navigate to login page

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Invalid Header | INVITACIÓN NO VÁLIDA | INVALID INVITATION | invitation_invalid_header |
| Invalid Message | Esta invitación no es válida o ha expirado. | This invitation is not valid or has expired. | invitation_invalid_message |
| Reasons Label | Posibles razones: | Possible reasons: | invitation_reasons_label |
| Reason Used | El enlace ya fue usado | The link has already been used | invitation_reason_used |
| Reason Expired | Han pasado más de 72 horas | More than 72 hours have passed | invitation_reason_expired |
| Reason Revoked | La invitación fue revocada | The invitation was revoked | invitation_reason_revoked |
| Contact Admin | Por favor contacta al administrador de tu empresa para recibir una nueva invitación. | Please contact your company administrator to receive a new invitation. | invitation_contact_admin |
| Go to Login | Ir a Inicio de Sesión | Go to Login | invitation_go_to_login |

---

## MODULE 5 SUMMARY

### Key Differences from First User Flow

| Aspect | First User (Modules 1-4) | Invited User (Module 5) |
|--------|-------------------------|-------------------------|
| **Entry** | Public signup form | Email invitation link |
| **Email Verification** | Required before proceeding | Pre-verified (invitation link = verification) |
| **Company Creation** | Creates new company | Joins existing company |
| **Facility Creation** | Creates first facility | Access granted to existing facilities |
| **Role Assignment** | Auto-assigned "COMPANY_OWNER" during company creation (registerCompanyStep2) | Pre-assigned by inviter during invitation creation |
| **Dashboard Access** | After facility creation | Immediate after password setup |
| **Pages** | 7 pages | 4 pages (faster flow) |

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `call_validateInvitationToken` | Check if token is valid (Page 8) |
| `call_acceptInvitation` | Create user account from invitation (Page 9) |
| `call_rejectInvitation` | Reject invitation (Page 8) |

**Note**: Invitation creation (`call_createInvitation`) is documented in Phase 2, Module 17 (User Management).

### Database Tables

- **Reads from**: `invitations` table (token validation, invitation details)
- **Writes to**: `users` table (create user account)
- **Updates**: `invitations` table (mark as accepted)
- **Writes to**: `facility_users` table (link user to facilities)

---

## MODULE 6: Login & Session Management

### Overview

This module handles user authentication for returning users, session validation, and logout functionality. It complements the registration flow (Module 1) by providing login capabilities for users who have already completed onboarding.

**Pages**: 1 (Page 12: Login)
**API Endpoints**: 3 (login, validateToken, logout)
**Triggered by**: "Log In" link on signup page, session expiration, manual logout

---

### Page 12: Login

**Route**: `/login`
**Purpose**: Allow existing users to authenticate and access their account

#### Layout

```
┌──────────────────────────────────────┐
│         🌱 ALQUEMIST                 │
│                                      │
│    ┌──────────────────────────┐     │
│    │  Bienvenido de Vuelta    │     │
│    │                          │     │
│    │  Email                   │     │
│    │  [________________]      │     │
│    │                          │     │
│    │  Contraseña              │     │
│    │  [________________] 👁    │     │
│    │                          │     │
│    │  [Olvidé mi contraseña]  │     │
│    │                          │     │
│    │  [  Iniciar Sesión   ]   │     │
│    │                          │     │
│    │  ¿No tienes cuenta?      │     │
│    │  [Regístrate]            │     │
│    └──────────────────────────┘     │
└──────────────────────────────────────┘
```

#### Elements

| Element | Type | Placeholder/Label | Required | Validation |
|---------|------|-------------------|----------|------------|
| **Email** | Input (email) | tu@email.com | Yes | Valid email format |
| **Password** | Input (password) | ●●●●●●●● | Yes | Minimum 8 characters |
| **Show/Hide Password** | Icon button | 👁 | No | Toggle password visibility |
| **Forgot Password** | Link | Olvidé mi contraseña | No | Navigate to password reset |
| **Log In Button** | Button | Iniciar Sesión | - | Trigger login workflow |
| **Sign Up Link** | Link | Regístrate | No | Navigate to signup page |

#### API Endpoints Used

| Endpoint | Purpose | When Called |
|----------|---------|-------------|
| `call_login` | Authenticate user credentials | Button "Log In" clicked |

#### Bubble Workflow: Login

**Trigger**: Button "Log In" is clicked

**Steps**:
1. **Validation**: Check that email and password are not empty
2. **API Call**: Plugins → `call_login`
   - email = `Input email's value`
   - password = `Input password's value`
3. **Success Path** (Only when `success = true`):
   - **Step 3a**: Log the user in
     - Email = `Result of Step 2's user:email`
     - Password = `Input password's value`
   - **Step 3b**: Make changes to Current User
     - `session_token` = `Result of Step 2's token`
     - `backend_user_id` = `Result of Step 2's userId`
     - `company_id` = `Result of Step 2's companyId`
     - `company_name` = `Result of Step 2's company:name`
     - `first_name` = `Result of Step 2's user:firstName`
     - `last_name` = `Result of Step 2's user:lastName`
     - `email_verified` = yes
   - **Step 3c**: Navigate to "dashboard" page
4. **Error Path** (Only when `success = false`):
   - Show alert with `Result of Step 2's error`

**Security Considerations**:
- Password is never stored in Bubble, only sent to backend
- Session token stored securely in private field
- Rate limiting on backend (max 5 failed attempts)
- Display generic error "Credenciales inválidas" for security

#### Database Context

**Read from Backend**:
- `users` table → validate credentials
- `companies` table → load company data
- `sessions` table → create new session

**Write to Bubble**:
- Current User → session_token, backend_user_id, company_id, company_name, first_name, last_name

---

### Session Validation

**Purpose**: Verify that the user's session token is still valid on protected pages

**Implementation**: Reusable element "SessionValidator" on all protected pages

#### Bubble Workflow: Validate Session

**Trigger**: Page is loaded (protected pages only)

**Steps**:
1. **Check Token Exists**: If Current User's session_token is empty → Navigate to login
2. **API Call**: Get data from API → `call_validateToken`
   - token = `Current User's session_token`
3. **Invalid Session** (Only when `valid = false`):
   - Log the user out
   - Navigate to "login" page
   - Show alert "Tu sesión ha expirado. Por favor inicia sesión nuevamente."

**Performance Optimization**:
- Cache validation result in Custom State for 5 minutes
- Only re-validate if cache expired
- Avoids unnecessary API calls on every page navigation

**Protected Pages**:
- Dashboard
- All operational pages (Phase 2+)
- Settings
- User management

**Public Pages** (no validation needed):
- Login
- Signup
- Email verification
- Accept invitation

---

### Logout Functionality

**Purpose**: Invalidate user session and clear authentication data

**Implementation**: Logout button in navigation bar on all authenticated pages

#### UI Location

**Navigation Bar** (top-right corner):
```
┌─────────────────────────────────┐
│ 🌱 ALQUEMIST    [≡ Menu] [User▼]│
│                         ┌──────┐│
│                         │Profile│
│                         │Settings│
│                         │Logout │ ← Logout option
│                         └──────┘│
└─────────────────────────────────┘
```

**Location**: User dropdown menu → "Cerrar Sesión" option

#### Bubble Workflow: Logout

**Trigger**: User dropdown menu → "Cerrar Sesión" is clicked

**Steps**:
1. **API Call**: Plugins → `call_logout`
   - token = `Current User's session_token`
2. **Step 2** (Always execute, even if Step 1 fails):
   - Make changes to Current User:
     - `session_token` = empty
     - `backend_user_id` = empty
     - `company_id` = empty
     - `company_name` = empty
3. **Step 3**: Log the user out (Bubble's built-in action)
4. **Step 4**: Navigate to "login" page

**Important**: Always execute Steps 2-4 even if API call fails, to ensure user is logged out from Bubble even if backend is unreachable.

---

### Translations

#### Page 12: Login

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Title | Iniciar Sesión | Log In | login_page_title |
| Header | Bienvenido de Vuelta | Welcome Back | login_header |
| Email Label | Correo Electrónico | Email | login_email_label |
| Email Placeholder | tu@email.com | your@email.com | login_email_placeholder |
| Password Label | Contraseña | Password | login_password_label |
| Password Placeholder | ●●●●●●●● | ●●●●●●●● | login_password_placeholder |
| Forgot Password Link | Olvidé mi contraseña | Forgot password? | login_forgot_password |
| Login Button | Iniciar Sesión | Log In | login_button |
| No Account Text | ¿No tienes cuenta? | Don't have an account? | login_no_account |
| Sign Up Link | Regístrate | Sign up | login_signup_link |
| Invalid Credentials | Email o contraseña incorrectos | Invalid email or password | login_error_invalid |
| Session Expired | Tu sesión ha expirado | Your session has expired | login_error_expired |
| Please Login Again | Por favor inicia sesión nuevamente | Please log in again | login_please_login |

#### Logout

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Logout Menu Item | Cerrar Sesión | Log Out | logout_menu_item |
| Logout Confirm | ¿Estás seguro de cerrar sesión? | Are you sure you want to log out? | logout_confirm |
| Logout Success | Sesión cerrada exitosamente | Logged out successfully | logout_success |

---

## MODULE 6 SUMMARY

### Key Features

| Feature | Implementation | API Endpoint |
|---------|----------------|--------------|
| **User Login** | Page 12: Login form | `call_login` |
| **Session Validation** | Reusable element on protected pages | `call_validateToken` |
| **Logout** | User dropdown menu option | `call_logout` |
| **Password Visibility Toggle** | Icon button on password field | (Frontend only) |
| **Forgot Password Link** | Navigate to password reset flow | (Future: Phase 2 or 3) |

### API Endpoints Used

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `call_login` | Authenticate user and create session | session token, user data, company data |
| `call_validateToken` | Check if session token is valid | valid (boolean), user data |
| `call_logout` | Invalidate session token | success (boolean) |

### Database Tables

**Backend Operations**:
- **Reads from**: `users` table (validate credentials)
- **Reads from**: `companies` table (load company data)
- **Writes to**: `sessions` table (create/invalidate session)

**Bubble Operations**:
- **Writes to**: Current User (session_token, backend_user_id, company_id, etc.)
- **Reads from**: Current User (session_token for validation)

### Security Considerations

1. **Password Handling**:
   - Never stored in Bubble
   - Transmitted only via HTTPS
   - Backend uses bcrypt hashing

2. **Session Management**:
   - Tokens expire after 30 days
   - Stored in private field (not accessible to other users)
   - Invalidated on logout

3. **Rate Limiting**:
   - Max 5 failed login attempts per hour
   - Lockout after 5 failures
   - Backend enforces limits

4. **Session Validation**:
   - Cached for 5 minutes to reduce API calls
   - Auto-logout on token expiration
   - Redirect to login on invalid token

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
